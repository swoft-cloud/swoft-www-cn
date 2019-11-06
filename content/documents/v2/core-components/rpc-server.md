+++
title = "RPC Server"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 604

[menu.v2]
  parent = "core-components"
  weight = 4
+++

RPC，是一种远程调用方式（Remote Procedure Call），通过 RPC 我们可以像调用本地方法一样调用别的机器上的方法，用户将无感服务器与服务器之间的通讯。RPC 在微服务当中起到相当大的作用，当然 RPC 不是微服务必须的一种方式，有别的方式也可以实现这种远程调用例如 RESTful API 就可以实现远程调用。如果有用过 SOAP 那么你使用 RPC 将会觉得很类似，都是可以直接调用别的机器上的方法。

随着业务的发展我们的项目从简单的单体结构逐渐的演化成微服务结构，我们为什么要拆分成微服务呢？那我们来说说微服务和单体架构的优缺点。

## 单体架构

{{< figure library="true" src="rpc-1.png" numbered="false" lightbox="true">}}

### 单体架构优点

* 部署容易，如 php 写的项目，只要一个文件夹复制到支持 php 的环境就可以了，java 只需要一个 jar 包
* 测试容易，我们整体项目只要改了一个地方马上就可以测试得出结果
* 负载均衡就可以解决，快速部署多个一模一样的项目在不同的机器运行分流

### 单体架构缺点

* 部署的问题，对于 php 来说这点还好，但是对于 java 的项目来说，我们需要重新打包整个项目耗费的时间是很长的
* 代码维护，由于所有的代码都写在一个项目里面，要想要修改某一个功能点那么需要对项目的整体逻辑和设计有较深的理解，否则代码耦合严重，导致维护难，特别对于新入职的员工来说这将是最容易出现问题的地方
* 开发效率低，随着项目需求的不断改变和新的功能新增，老旧的代码又不敢随便删除，导致整个项目变得笨重，这将会增加你阅读代码的时间
* 扩展性，在高并发的情况下，我们往往不是整个项目的每一个功能都处于高流量高请求的情况下的，很多时候都是某一个功能模块使用的人数比较多，在单体结构下我们没有办法针对单个功能实现分布式扩展，必须整个项目一起部署

## 微服务架构

在2014年被提出，现在国内很多公司已经使用，微服务是一种架构设计，并不是说什么框架或者代替什么。微服务做的事情是按照项目颗粒度进行服务的拆分，把模块单独拿出来做成每一个单独的小项目。微服务的主要特点有：每一个功能模块是一个小项目、独立运行在不同进程或者机器上、不同功能可以又不同的人员开发独立开发不松耦合、独立部署不需要依赖整体项目就可以启动单个服务、分布式管理。每一个服务只要做好自己的事情就好了。在设计微服务的时候还需要考虑到数据库的问题，是所有微服务使用共同一个数据库还是每一个服务单个数据库。

### 微服务架构优点

* 拆分业务，把整体大项目分割成不同小项目运行在不同进程或者机器上实现数据隔离
* 技术栈，每个服务可以由不同的团队或者开发者进行开发，外部调用人员不需要操心具体怎么实现的，只需要类似调用自己方法一样或者接口一样按照服务提供者给出来的参数传递即可
* 独立部署，每一个服务独立部署，部署一个服务不会影响整体项目，如果部署失败最多是这个服务的功能缺失，并不影响其他功能的使用
* 按需部署，针对不同的需求可以给不同的服务自由扩展服务器，根据服务的规模部署满足需求的实例
* 局部修改，当一个服务有新需求或者其他修改，不需要修改整体项目只要管好自己的服务就好了

### 微服务架构缺点

* 运维，微服务由于把业务拆分得细，有可能部署在不同机器上，因此对于运维人员的管理来说，这部分的成本会加大
* 接口调整，微服务之间通过接口进行通信。如果修改某个微服务的API，可能所有使用了该接口的微服务都需要做调整；
* 重复劳动，很多服务可能都会使用到相同的功能。而这个功能并没有达到分解为一个微服务的程度，这个时候，可能各个服务都会开发这一功能，导致代码重复。
* 分布式，由于会把不同服务部署在不同机器上，那么对于这些服务的调用、容错、网络延迟、分布式事务等等都是一个很大的挑战，当然微服务不一定全部都是部署在不同服务器上

### 服务调用

{{< figure library="true" src="rpc-2.png" numbered="false" lightbox="true">}}

如上图所示，RPC 就用于调用者与服务之间的通讯，RPC 协议可基于 TCP、UDP 或者 HTTP 实现，但是更推荐选择 TCP。

例如调用者需要调用商品的服务就可以通过 RPC 或者 RESTful API 来调用，那么 RPC 调用和 RESTful API 两者之间的区别在哪呢？

* TCP 支持长连接，当调用服务的时候不需要每次都进行三次握手才实现。从性能和网络消耗来说 RPC 都具备了很好的优势。
* RESTful API 基于 HTTP 的，也就是说每次调用服务都需要进行三次握手建立起通信才可以实现调用，当我们的并发量高的时候这就会浪费很多带宽资源
* 服务对外的话采用 RESTful API 会比 RPC 更具备优势，因此看自己团队的服务是对内还是对外

## RPC 调用过程

{{< figure library="true" src="rpc-3.png" numbered="false" lightbox="true">}}

> RPC 最主要的作用就是用于服务调用

我们从 RPC 的使用场景开山篇，对于单体架构和微服务的进行了一个描述。这个就是 RPC 的一个使用场景，也是最常用的一个使用场景。大家只有了解好 RPC 是什么使用在什么场景才能更好的去使用。

Swoft 给我们提供了 RPC 的底层服务，我们并不需要去关心底层通讯细节和调用的过程。

Swoft 通过定义接口，实现接口，启动 RPC Server 提供接口服务。我们只需要简单的写好几个类就可以实现一个简单RPC模块。

## RPC server 服务命令

在项目根目录执行如下命令

```bash
$ php bin/swoft rpc
Usage:
  bin/swoft rpc:COMMAND [--opt ...] [arg ...]

Global Options:
      --debug      Setting the application runtime debug level(0 - 4)
      --no-color   Disable color/ANSI for message output
  -h, --help       Display this help message
  -V, --version    Show application version information

Commands:
  reload      Reload worker processes
  restart     Restart the http server
  start       Start the http server
  stop        Stop the currently running server

Example:
 bin/swoft rpc:start     Start the rpc server
 bin/swoft rpc:stop      Stop the rpc server
```

Rpc 的命令都在 `Commands` 中。

* `reload` 重新加载 `worker` 进程
* `restart` 重启 RPC 服务器
* `start` 启动 RPC 服务器
* `stop` 停止 RPC 服务器

**使用：** 前台运行

```bash
$ php bin/swoft rpc:start
                            Information Panel
  **********************************************************************
  * RPC      | Listen: 0.0.0.0:18307, type: TCP, mode: Process, worker: 1
  **********************************************************************

RPC server start success !
```

**使用：** 后台运行

```bash
$ php bin/swoft rpc:start -d
                            Information Panel
  **********************************************************************
  * RPC      | Listen: 0.0.0.0:18307, type: TCP, mode: Process, worker: 1
  **********************************************************************

RPC server start success !
```

## 配置参数

RPC 服务启动有单独启动和集成其它服务 (Http/Websocket) 两种方式，无论那种方式都首先要在 bean.php 配置 RPC。

```php
return [
    'rpcServer'  => [
        'class' => ServiceServer::class,
        'port' => 18308,
    ],
]
```

* `port` 配置启动端口号
* `setting` 启动配置参数，对应 `swooleServer->setting`

Http server 启动中集成 RPC 服务:

```php
return [
    'httpServer' => [
        'class'    => HttpServer::class,
        'port'     => 18306,
        'listener' => [
            'rpc' => bean('rpcServer')
        ],

        // ...
    ],
]
```

* `listener` 单独监听一个 RPC 服务，且同时可以监听多个 RPC 服务

> 如果单独启动，无需其他配置直接可以启动。

## 声明服务

### 接口服务

定义接口并实现接口，才能提供 RPC 服务。

官方应用中给出的 **目录结构** 如下：

```bash
app/
  Rpc/
    - Lib/          // 服务的公共接口定义目录，里面通常只有php接口类
    - Services/     // 具体的服务接口实现类，里面的类通常实现了 Lib 中定义的接口
```

> 当在多个服务中使用时， 要将lib库 `app/Rpc/Lib` 移到一个公共的 `git` 仓库里，然后各个服务通过 `composer` 来获取使用。

#### 定义接口

服务提供方定义好接口格式，存放到公共的 `lib` 库里面，服务调用方，加载 `lib` 库，就能使用接口服务，接口定义和普通接口完全一致。

```php
**
 * Class UserInterface
 *
 * @since 2.0
 */
interface UserInterface
{
    /**
     * @param int   $id
     * @param mixed $type
     * @param int   $count
     *
     * @return array
     */
    public function getList(int $id, $type, int $count = 10): array;

    /**
     * @param int $id
     *
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * @return string
     */
    public function getBigContent(): string;
}
```

#### 接口实现

一个接口，会存在多种不同的实现，通过一个版本号来标识是那个逻辑实现。

#### @Service 注解

定义 RPC 服务类 `@Service`

* `version` 定义接口版本，默认是 1.0

**示例：** 接口实现版本1。

```php
/**
 * Class UserService
 *
 * @since 2.0
 *
 * @Service()
 */
class UserService implements UserInterface
{
    /**
     * @param int   $id
     * @param mixed $type
     * @param int   $count
     *
     * @return array
     */
    public function getList(int $id, $type, int $count = 10): array
    {
        return ['name' => ['list']];
    }

    /**
     * @param int $id
     *
     * @return bool
     */
    public function delete(int $id): bool
    {
        return false;
    }

    /**
     * @return string
     */
    public function getBigContent(): string
    {
        $content = Co::readFile(__DIR__ . '/big.data');
        return $content;
    }
}
```

**示例：** 接口实现版本2。

```php
/**
 * Class UserServiceV2
 *
 * @since 2.0
 *
 * @Service(version="1.2")
 */
class UserServiceV2 implements UserInterface
{
    /**
     * @param int   $id
     * @param mixed $type
     * @param int   $count
     *
     * @return array
     */
    public function getList(int $id, $type, int $count = 10): array
    {
        return [
            'name' => ['list'],
            'v'    => '1.2'
        ];
    }

    /**
     * @param int $id
     *
     * @return bool
     */
    public function delete(int $id): bool
    {
        return false;
    }

    /**
     * @return string
     */
    public function getBigContent(): string
    {
        $content = Co::readFile(__DIR__ . '/big.data');
        return $content;
    }
}
```

{{%alert note%}}
不同的实现，需要定义不同的唯一版本号，如果存在相同，加载之后的服务会覆盖之前的服务
{{%/alert%}}

## RPC Client

服务调用方法，通过使用服务提供方法，提供的lib接口，调用接口实现服务，不需要了解实现细节。
