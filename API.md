# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AgentBroker <a name="AgentBroker" id="cdk-agent-broker.AgentBroker"></a>

#### Initializers <a name="Initializers" id="cdk-agent-broker.AgentBroker.Initializer"></a>

```typescript
import { AgentBroker } from 'cdk-agent-broker'

new AgentBroker(scope: Construct, id: string, props: AgentBrokerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-agent-broker.AgentBroker.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBroker.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBroker.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-agent-broker.AgentBrokerProps">AgentBrokerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-agent-broker.AgentBroker.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-agent-broker.AgentBroker.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-agent-broker.AgentBroker.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-agent-broker.AgentBrokerProps">AgentBrokerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-agent-broker.AgentBroker.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-agent-broker.AgentBroker.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="cdk-agent-broker.AgentBroker.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="cdk-agent-broker.AgentBroker.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="cdk-agent-broker.AgentBroker.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-agent-broker.AgentBroker.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="cdk-agent-broker.AgentBroker.isConstruct"></a>

```typescript
import { AgentBroker } from 'cdk-agent-broker'

AgentBroker.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="cdk-agent-broker.AgentBroker.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-agent-broker.AgentBroker.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-agent-broker.AgentBroker.property.cluster">cluster</a></code> | <code>aws-cdk-lib.aws_ecs.Cluster</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBroker.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBroker.property.service">service</a></code> | <code>aws-cdk-lib.aws_ecs.FargateService</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBroker.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-agent-broker.AgentBroker.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="cdk-agent-broker.AgentBroker.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* aws-cdk-lib.aws_ecs.Cluster

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="cdk-agent-broker.AgentBroker.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

---

##### `service`<sup>Required</sup> <a name="service" id="cdk-agent-broker.AgentBroker.property.service"></a>

```typescript
public readonly service: FargateService;
```

- *Type:* aws-cdk-lib.aws_ecs.FargateService

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-agent-broker.AgentBroker.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---


## Structs <a name="Structs" id="Structs"></a>

### AgentBrokerProps <a name="AgentBrokerProps" id="cdk-agent-broker.AgentBrokerProps"></a>

#### Initializer <a name="Initializer" id="cdk-agent-broker.AgentBrokerProps.Initializer"></a>

```typescript
import { AgentBrokerProps } from 'cdk-agent-broker'

const agentBrokerProps: AgentBrokerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.configPath">configPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.assignPublicIp">assignPublicIp</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.cpu">cpu</a></code> | <code>number</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.ebsMountPath">ebsMountPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.ebsSizeGiB">ebsSizeGiB</a></code> | <code>number</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.enableFargateSpot">enableFargateSpot</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.image">image</a></code> | <code>aws-cdk-lib.aws_ecs.ContainerImage</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.memoryLimitMiB">memoryLimitMiB</a></code> | <code>number</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |
| <code><a href="#cdk-agent-broker.AgentBrokerProps.property.vpcCidr">vpcCidr</a></code> | <code>string</code> | *No description.* |

---

##### `configPath`<sup>Required</sup> <a name="configPath" id="cdk-agent-broker.AgentBrokerProps.property.configPath"></a>

```typescript
public readonly configPath: string;
```

- *Type:* string

---

##### `assignPublicIp`<sup>Optional</sup> <a name="assignPublicIp" id="cdk-agent-broker.AgentBrokerProps.property.assignPublicIp"></a>

```typescript
public readonly assignPublicIp: boolean;
```

- *Type:* boolean

---

##### `cpu`<sup>Optional</sup> <a name="cpu" id="cdk-agent-broker.AgentBrokerProps.property.cpu"></a>

```typescript
public readonly cpu: number;
```

- *Type:* number

---

##### `ebsMountPath`<sup>Optional</sup> <a name="ebsMountPath" id="cdk-agent-broker.AgentBrokerProps.property.ebsMountPath"></a>

```typescript
public readonly ebsMountPath: string;
```

- *Type:* string

---

##### `ebsSizeGiB`<sup>Optional</sup> <a name="ebsSizeGiB" id="cdk-agent-broker.AgentBrokerProps.property.ebsSizeGiB"></a>

```typescript
public readonly ebsSizeGiB: number;
```

- *Type:* number

---

##### `enableFargateSpot`<sup>Optional</sup> <a name="enableFargateSpot" id="cdk-agent-broker.AgentBrokerProps.property.enableFargateSpot"></a>

```typescript
public readonly enableFargateSpot: boolean;
```

- *Type:* boolean

---

##### `image`<sup>Optional</sup> <a name="image" id="cdk-agent-broker.AgentBrokerProps.property.image"></a>

```typescript
public readonly image: ContainerImage;
```

- *Type:* aws-cdk-lib.aws_ecs.ContainerImage

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="cdk-agent-broker.AgentBrokerProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

---

##### `memoryLimitMiB`<sup>Optional</sup> <a name="memoryLimitMiB" id="cdk-agent-broker.AgentBrokerProps.property.memoryLimitMiB"></a>

```typescript
public readonly memoryLimitMiB: number;
```

- *Type:* number

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="cdk-agent-broker.AgentBrokerProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

##### `vpcCidr`<sup>Optional</sup> <a name="vpcCidr" id="cdk-agent-broker.AgentBrokerProps.property.vpcCidr"></a>

```typescript
public readonly vpcCidr: string;
```

- *Type:* string

---



