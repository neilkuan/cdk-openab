import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';

export interface OpenABProps {
  readonly vpc?: ec2.IVpc;
  readonly vpcCidr?: string;
  readonly image?: ecs.ContainerImage;
  readonly memoryLimitMiB?: number;
  readonly cpu?: number;
  readonly assignPublicIp?: boolean;
  readonly enableFargateSpot?: boolean;
  readonly dataBucket?: s3.IBucket;
  readonly dataS3Prefix?: string;
  readonly dataLocalPath?: string;
  readonly configPath: string;
  readonly logGroup?: logs.ILogGroup;
}

export class OpenAB extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly logGroup: logs.ILogGroup;
  public readonly dataBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: OpenABProps) {
    super(scope, id);

    const useSpot = props.enableFargateSpot ?? true;
    const assignPublicIp = props.assignPublicIp ?? true;

    this.vpc = props.vpc ?? new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr ?? '10.168.0.0/16'),
      maxAzs: 1,
      subnetConfiguration: assignPublicIp
        ? [{ name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 }]
        : undefined,
    });

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      enableFargateCapacityProviders: useSpot,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: props.memoryLimitMiB ?? 4096,
      cpu: props.cpu ?? 2048,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    this.logGroup = props.logGroup ?? new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
    });
    const logGroup = this.logGroup;

    const dataLocalPath = props.dataLocalPath ?? '/home/agent';
    const dataS3Prefix = props.dataS3Prefix ?? 'agent-data';

    // S3 bucket for persistent data
    this.dataBucket = props.dataBucket ?? new s3.Bucket(this, 'DataBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Shared volumes
    taskDefinition.addVolume({ name: 'agent-data' });
    taskDefinition.addVolume({ name: 'agent-config' });

    // Config asset
    const configAsset = new s3assets.Asset(this, 'ConfigAsset', {
      path: props.configPath,
    });

    // Init container: restore data from S3 + download config
    const initContainer = taskDefinition.addContainer('data-init', {
      image: ecs.ContainerImage.fromRegistry('amazon/aws-cli:latest'),
      essential: false,
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'data-init' }),
      environment: {
        DATA_BUCKET: this.dataBucket.bucketName,
        DATA_S3_PREFIX: dataS3Prefix,
        DATA_LOCAL_PATH: dataLocalPath,
        CONFIG_S3_BUCKET: configAsset.s3BucketName,
        CONFIG_S3_KEY: configAsset.s3ObjectKey,
      },
      entryPoint: ['bash', '-c'],
      command: [
        [
          'mkdir -p $DATA_LOCAL_PATH',
          'aws s3 sync s3://$DATA_BUCKET/$DATA_S3_PREFIX $DATA_LOCAL_PATH || true',
          'aws s3 cp s3://$CONFIG_S3_BUCKET/$CONFIG_S3_KEY /etc/openab/config.toml',
          'chown -R 1000:1000 $DATA_LOCAL_PATH /etc/openab',
        ].join(' && '),
      ],
    });

    initContainer.addMountPoints(
      { sourceVolume: 'agent-data', containerPath: dataLocalPath, readOnly: false },
      { sourceVolume: 'agent-config', containerPath: '/etc/openab', readOnly: false },
    );

    // App container
    const container = taskDefinition.addContainer('app', {
      image: props.image ?? ecs.ContainerImage.fromRegistry('ghcr.io/openabdev/openab:78f8d2c'),
      essential: true,
      user: '1000:1000',
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'app' }),
    });

    container.addContainerDependencies({
      container: initContainer,
      condition: ecs.ContainerDependencyCondition.SUCCESS,
    });

    container.addMountPoints(
      { sourceVolume: 'agent-data', containerPath: dataLocalPath, readOnly: false },
      { sourceVolume: 'agent-config', containerPath: '/etc/openab', readOnly: true },
    );

    // Sidecar: periodic backup (every hour) + final backup on SIGTERM
    const backupSidecar = taskDefinition.addContainer('data-backup', {
      image: ecs.ContainerImage.fromRegistry('amazon/aws-cli:latest'),
      essential: false,
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'data-backup' }),
      environment: {
        DATA_BUCKET: this.dataBucket.bucketName,
        DATA_S3_PREFIX: dataS3Prefix,
        DATA_LOCAL_PATH: dataLocalPath,
      },
      entryPoint: ['bash', '-c'],
      command: [
        [
          'do_backup() { echo "[$(date)] Syncing $DATA_LOCAL_PATH to s3://$DATA_BUCKET/$DATA_S3_PREFIX ..."; aws s3 sync $DATA_LOCAL_PATH s3://$DATA_BUCKET/$DATA_S3_PREFIX --delete; echo "[$(date)] Backup done"; }',
          'trap \'do_backup; exit 0\' SIGTERM',
          'while true; do do_backup; sleep 600 & wait $!; done',
        ].join('; '),
      ],
    });

    backupSidecar.addContainerDependencies({
      container: initContainer,
      condition: ecs.ContainerDependencyCondition.SUCCESS,
    });

    backupSidecar.addMountPoints(
      { sourceVolume: 'agent-data', containerPath: dataLocalPath, readOnly: true },
    );

    // Grant S3 permissions
    this.dataBucket.grantReadWrite(taskDefinition.taskRole);
    configAsset.grantRead(taskDefinition.taskRole);

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      taskDefinition,
      desiredCount: 1,
      maxHealthyPercent: 100,
      minHealthyPercent: 0,
      assignPublicIp,
      enableExecuteCommand: true,
      vpcSubnets: assignPublicIp
        ? { subnetType: ec2.SubnetType.PUBLIC }
        : undefined,
      capacityProviderStrategies: useSpot
        ? [
          { capacityProvider: 'FARGATE_SPOT', weight: 2, base: 0 },
          { capacityProvider: 'FARGATE', weight: 1, base: 1 },
        ]
        : undefined,
    });

  }
}
