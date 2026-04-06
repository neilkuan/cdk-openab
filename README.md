# cdk-agent-broker

AWS CDK constructs library for deploying [Agent Broker](https://github.com/thepagent/agent-broker) on AWS ECS Fargate.

##### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  AWS Cloud                                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  VPC (default: 10.168.0.0/16)                          │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Public Subnet                                   │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  ECS Cluster                               │  │  │  │
│  │  │  │                                            │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Fargate Service (FARGATE_SPOT| FARGATE)│  │  │  │
│  │  │  │  │                                      │  │  │  │  │
│  │  │  │  │  ┌──────────┐    ┌────────────────┐  │  │  │  │  │
│  │  │  │  │  │ config-  │    │  app container │  │  │  │  │  │
│  │  │  │  │  │ init     │───▶│  (port 80)     │  │  │  │  │  │
│  │  │  │  │  │(required)│    │                │  │  │  │  │  │
│  │  │  │  │  └──────────┘    └───────┬────────┘  │  │  │  │  │
│  │  │  │  │                          │           │  │  │  │  │
│  │  │  │  │  ┌───────────────────────┴────────┐  │  │  │  │  │
│  │  │  │  │  │  EBS Volume (GP3, 10 GiB)      │  │  │  │  │  │
│  │  │  │  │  │  mount: /home/agent            │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐                                            │
│  │  S3 (config  │  ◀── config.toml (required)                │
│  │  asset)      │                                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

##### Install

```bash
# npm
npm install cdk-agent-broker

# pip
pip install cdk-agent-broker
```

##### Usage

```ts
import { AgentBroker } from 'cdk-agent-broker';

new AgentBroker(this, 'Broker', {
  configPath: './config.toml',  // required: path to your local config.toml
});

// With custom settings
new AgentBroker(this, 'Broker', {
  cpu: 2048,
  memoryLimitMiB: 4096,
  ebsSizeGiB: 20,
  configPath: './config.toml',
});
```

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `vpc` | `ec2.IVpc` | New VPC (public subnet) | 自訂 VPC |
| `vpcCidr` | `string` | `10.168.0.0/16` | 新建 VPC 的 CIDR |
| `image` | `ecs.ContainerImage` | `ghcr.io/thepagent/agent-broker:dd7e1ca` | Container image |
| `memoryLimitMiB` | `number` | `4096` | Task memory (MiB) |
| `cpu` | `number` | `2048` | Task CPU units |
| `assignPublicIp` | `boolean` | `true` | 是否分配 public IP |
| `enableFargateSpot` | `boolean` | `true` | 啟用 FARGATE_SPOT |
| `ebsSizeGiB` | `number` | `10` | EBS volume 大小 (GiB) |
| `ebsMountPath` | `string` | `/home/agent` | EBS 掛載路徑 |
| `configPath` | `string` | **必填** | 本地 config.toml 路徑，透過 S3 init container 掛載到 `/etc/agent-broker/config.toml` |

##### Exposed Resources

`AgentBroker` construct 暴露以下屬性，方便後續串接：

- `broker.vpc` — VPC
- `broker.cluster` — ECS Cluster
- `broker.service` — Fargate Service

##### Config Init Container Flow

1. 本地 config.toml 透過 `s3-assets` 上傳到 S3
2. `config-init` init container 使用 `aws-cli` 從 S3 下載到 `/etc/agent-broker/config.toml`
3. App container 等待 init container 完成後啟動，並以 read-only 方式掛載 config volume
