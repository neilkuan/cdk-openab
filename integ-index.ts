import * as cdk from 'aws-cdk-lib';
import { OpenAB } from './src/main';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'OpenABInteg', {
  env: {
    // Taipei
    region: 'ap-east-2',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});

new OpenAB(stack, 'Broker', {
  cpu: 2048,
  memoryLimitMiB: 4096,
  enableFargateSpot: false,
  configPath: process.env.CONFIG_PATH ?? './config.toml',
  image: cdk.aws_ecs.ContainerImage.fromRegistry('ghcr.io/openabdev/openab:78f8d2c'),
});

app.synth();
