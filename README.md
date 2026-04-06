# cdk-agent-broker

AWS CDK constructs library for deploying [Agent Broker](https://github.com/thepagent/agent-broker) on AWS ECS Fargate.

##### Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│  AWS Cloud                                                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  VPC (default: 10.168.0.0/16)                               │  │
│  │                                                             │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │  Public Subnet                                        │  │  │
│  │  │                                                       │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐  │  │  │
│  │  │  │  ECS Cluster                                    │  │  │  │
│  │  │  │                                                 │  │  │  │
│  │  │  │  ┌───────────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Fargate Service (FARGATE_SPOT | FARGATE) │  │  │  │  │
│  │  │  │  │                                           │  │  │  │  │
│  │  │  │  │  ┌───────────┐  ┌──────────────────────┐  │  │  │  │  │
│  │  │  │  │  │ data-init │─▶│  app container       │  │  │  │  │  │
│  │  │  │  │  │ (S3 pull) │  │  (port 80)           │  │  │  │  │  │
│  │  │  │  │  └───────────┘  └──────────┬───────────┘  │  │  │  │  │
│  │  │  │  │                            │ stops        │  │  │  │  │
│  │  │  │  │                            ▼              │  │  │  │  │
│  │  │  │  │                 ┌───────────────────────┐  │  │  │  │  │
│  │  │  │  │                 │ data-backup (sidecar) │  │  │  │  │  │
│  │  │  │  │                 │ S3 sync on app stop   │  │  │  │  │  │
│  │  │  │  │                 └───────────────────────┘  │  │  │  │  │
│  │  │  │  └───────────────────────────────────────────┘  │  │  │  │
│  │  │  └─────────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                     │
│  │  S3 (config      │    │  S3 (data        │                     │
│  │  asset)          │    │  bucket)         │                     │
│  │  config.toml     │    │  /home/agent     │                     │
│  └──────────────────┘    └──────────────────┘                     │
└───────────────────────────────────────────────────────────────────┘
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
  dataS3Prefix: 'my-agent-data',
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
| `dataBucket` | `s3.IBucket` | 自動建立 | 持久化資料用的 S3 bucket |
| `dataS3Prefix` | `string` | `agent-data` | S3 資料前綴 |
| `dataLocalPath` | `string` | `/home/agent` | 資料掛載路徑 |
| `configPath` | `string` | **必填** | 本地 config.toml 路徑，透過 S3 init container 掛載到 `/etc/agent-broker/config.toml` |

##### Exposed Resources

`AgentBroker` construct 暴露以下屬性，方便後續串接：

- `broker.vpc` — VPC
- `broker.cluster` — ECS Cluster
- `broker.service` — Fargate Service
- `broker.dataBucket` — 持久化資料 S3 Bucket

##### Container Flow

1. **`data-init`** (init container)：從 S3 data bucket 還原 `/home/agent` 資料，並從 S3 asset 下載 `config.toml`
2. **`app`**：主應用容器，等待 init 完成後啟動，掛載資料目錄（read-write）和 config（read-only）
3. **`data-backup`** (sidecar)：每 10 分鐘定期將 `/home/agent` sync 到 S3 data bucket，並在收到 SIGTERM（app 停止）時執行最後一次備份
