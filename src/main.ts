import { Size } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';

export interface AgentBrokerProps {
  readonly vpc?: ec2.IVpc;
  readonly vpcCidr?: string;
  readonly image?: ecs.ContainerImage;
  readonly memoryLimitMiB?: number;
  readonly cpu?: number;
  readonly assignPublicIp?: boolean;
  readonly enableFargateSpot?: boolean;
  readonly ebsSizeGiB?: number;
  readonly ebsMountPath?: string;
  readonly configPath?: string;
}

export class AgentBroker extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: AgentBrokerProps = {}) {
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

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
    });

    const container = taskDefinition.addContainer('app', {
      image: props.image ?? ecs.ContainerImage.fromRegistry('ghcr.io/thepagent/agent-broker:dd7e1ca'),
      portMappings: [{ containerPort: 80 }],
      essential: true,
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: 'app' }),
    });

    // EBS volume for /home/agent
    const volume = new ecs.ServiceManagedVolume(this, 'EbsVolume', {
      name: 'agent-data',
      managedEBSVolume: {
        size: Size.gibibytes(props.ebsSizeGiB ?? 10),
        volumeType: ec2.EbsDeviceVolumeType.GP3,
      },
    });

    volume.mountIn(container, {
      containerPath: props.ebsMountPath ?? '/home/agent',
      readOnly: false,
    });

    taskDefinition.addVolume(volume);

    // Config volume: download config.toml from S3 via init container
    if (props.configPath) {
      const configAsset = new s3assets.Asset(this, 'ConfigAsset', {
        path: props.configPath,
      });

      taskDefinition.addVolume({
        name: 'agent-config',
      });

      const initContainer = taskDefinition.addContainer('config-init', {
        image: ecs.ContainerImage.fromRegistry('amazon/aws-cli:latest'),
        essential: false,
        environment: {
          CONFIG_S3_BUCKET: configAsset.s3BucketName,
          CONFIG_S3_KEY: configAsset.s3ObjectKey,
        },
        command: [
          'sh', '-c',
          'aws s3 cp s3://$CONFIG_S3_BUCKET/$CONFIG_S3_KEY /etc/agent-broker/config.toml',
        ],
      });

      initContainer.addMountPoints({
        sourceVolume: 'agent-config',
        containerPath: '/etc/agent-broker',
        readOnly: false,
      });

      container.addContainerDependencies({
        container: initContainer,
        condition: ecs.ContainerDependencyCondition.SUCCESS,
      });

      container.addMountPoints({
        sourceVolume: 'agent-config',
        containerPath: '/etc/agent-broker',
        readOnly: true,
      });

      configAsset.grantRead(taskDefinition.taskRole);
    }

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      taskDefinition,
      desiredCount: 1,
      maxHealthyPercent: 100,
      minHealthyPercent: 0,
      assignPublicIp,
      vpcSubnets: assignPublicIp
        ? { subnetType: ec2.SubnetType.PUBLIC }
        : undefined,
      capacityProviderStrategies: useSpot
        ? [{ capacityProvider: 'FARGATE_SPOT', weight: 1 }]
        : undefined,
    });

    this.service.addVolume(volume);
  }
}
