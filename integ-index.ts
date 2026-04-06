import * as cdk from 'aws-cdk-lib';
import { AgentBroker } from './src/main';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'AgentBrokerInteg', {
  env: {
    // Taipei
    region: 'ap-east-2',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});

new AgentBroker(stack, 'Broker', {
  cpu: 2048,
  memoryLimitMiB: 4096,
  enableFargateSpot: false,
  configPath: process.env.CONFIG_PATH ?? './config.toml',
});

app.synth();
