import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export interface AgentBrokerProps {
  readonly vpc: ec2.IVpc;
  readonly image?: ecs.ContainerImage;
  readonly memoryLimitMiB?: number;
  readonly cpu?: number;
  readonly assignPublicIp?: boolean;
}

export class AgentBroker extends Construct {
  public readonly cluster: ecs.ICluster;
  public readonly service: ecs.FargateService;

  constructor(scope: Construct, id: string, props: AgentBrokerProps) {
    super(scope, id);

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: props.memoryLimitMiB ?? 4096,
      cpu: props.cpu ?? 2048,
    });

    taskDefinition.addContainer('app', {
      image: props.image ?? ecs.ContainerImage.fromRegistry('ghcr.io/thepagent/agent-broker:dd7e1ca'),
      portMappings: [{ containerPort: 80 }],
    });

    this.service = new ecs.FargateService(this, 'Service', {
      cluster: this.cluster,
      taskDefinition,
      desiredCount: 1,
      maxHealthyPercent: 100,
      minHealthyPercent: 0,
      assignPublicIp: props.assignPublicIp ?? false,
      vpcSubnets: props.assignPublicIp
        ? { subnetType: ec2.SubnetType.PUBLIC }
        : undefined,
    });
  }
}
