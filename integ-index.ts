import * as cdk from 'aws-cdk-lib';
import { AgentBroker } from './src/main';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'AgentBrokerInteg', {
  env: {
    region: 'ap-east-2',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});

new AgentBroker(stack, 'Broker', {
  cpu: 2048,
  memoryLimitMiB: 4096,
  ebsSizeGiB: 10,
  configPath: './config.toml',
});

app.synth();
