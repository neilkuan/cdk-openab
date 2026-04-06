import * as path from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { AgentBroker } from '../src';

const configPath = path.join(__dirname, 'fixtures', 'config.toml');

test('creates Fargate service with default VPC and public subnet', () => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  new AgentBroker(stack, 'AgentBroker', { configPath });

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.resourceCountIs('AWS::EC2::Subnet', 1);
  template.resourcePropertiesCountIs('AWS::EC2::Subnet', {
    MapPublicIpOnLaunch: true,
  }, 1);
  template.resourceCountIs('AWS::ECS::Cluster', 1);
  template.resourceCountIs('AWS::ECS::Service', 1);
  template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
});

test('creates Fargate service with provided VPC', () => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  const vpc = new ec2.Vpc(stack, 'Vpc');

  new AgentBroker(stack, 'AgentBroker', { configPath, vpc });

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::ECS::Cluster', 1);
  template.resourceCountIs('AWS::ECS::Service', 1);
});

test('assignPublicIp creates only public subnets', () => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  new AgentBroker(stack, 'AgentBroker', { configPath, assignPublicIp: true });

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::EC2::Subnet', 1);
  template.resourcePropertiesCountIs('AWS::EC2::Subnet', {
    MapPublicIpOnLaunch: true,
  }, 1);
});

test('configPath adds init container and config volume', () => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');

  new AgentBroker(stack, 'AgentBroker', { configPath });

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::ECS::TaskDefinition', {
    ContainerDefinitions: Match.arrayWith([
      Match.objectLike({
        Name: 'app',
        MountPoints: Match.arrayWith([
          Match.objectLike({ ContainerPath: '/etc/agent-broker' }),
        ]),
      }),
      Match.objectLike({ Name: 'config-init', Essential: false }),
    ]),
  });
});
