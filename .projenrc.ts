import { awscdk, javascript } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Neil Kuan',
  authorAddress: 'guan840912@gmail.com',
  cdkVersion: '2.170.0',
  name: 'cdk-agent-broker',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  repositoryUrl: 'https://github.com/neilkuan/cdk-agent-broker.git',
  description: 'AWS CDK constructs library for Agent Broker',

  stability: 'experimental',
  defaultReleaseBranch: 'main',
  autoDetectBin: false,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
    },
  },
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan'],
  },

  npmProvenance: true,
  npmTokenSecret: '',
  npmTrustedPublishing: true,
  devDeps: [
    // 'ts-jest@29.1.2',
    'jsii-rosetta@5.0.x',
  ],
  minNodeVersion: '24.0.0',
  workflowNodeVersion: '24',
  typescriptVersion: '^5.5',
  jsiiVersion: '5.9.x',
  gitignore: [
    'config.toml',
    'cdk.out',
    'cdk.context.json',
    'cdk.json',
    '.DS_Store',
  ],
  npmignore: [
    'config.toml',
    'cdk.out',
    'cdk.context.json',
    'cdk.json',
    'integ-index.ts',
    '.DS_Store',
  ],
  excludeTypescript: ['integ-index.ts'],
  publishToPypi: {
    distName: 'cdk-agent-broker',
    module: 'cdk_agent_broker',
  },
});

// Fix Mergify deprecated `delete_head_branch` in pull_request_rules actions
// Move it to queue_rules instead
const mergifyFile = project.tryFindObjectFile('.mergify.yml');
if (mergifyFile) {
  // Remove deprecated delete_head_branch from pull_request_rules actions
  // Use GitHub's "Automatically delete head branches" setting instead
  mergifyFile.addDeletionOverride('pull_request_rules.0.actions.delete_head_branch');
}

project.synth();
