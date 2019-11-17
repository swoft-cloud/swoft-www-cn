+++
title = "RPC 服务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 305

[menu.v1]
  parent = "component-list"
  weight = 5
+++
RPC，是一种远程调用方式（Remote Procedure Call），通过RPC我们可以像调用本地方法一样调用别的机器上的方法，用户将无感服务器与服务器之间的通讯。RPC在微服务当中起到相当大的作用，当然RPC不是微服务必须的一种方式，有别的方式也可以实现这种远程调用例如RESTful API就可以实现远程调用。如果有用过SOAP那么你使用RPC将会觉得很类似，都是可以直接调用别的机器上的方法。

随着业务的发展我们的项目从简单的单体结构逐渐的演化成微服务结构，我们为什么要拆分成微服务呢？那我们来说说微服务和单体架构的优缺点。我们看一下单体架构图。

## 单体架构

![单体架构](../images/rpc-server-index1.png)

### 单体架构优点

* 部署容易，如php写的项目，只要一个文件夹复制到支持php的环境就可以了，java只需要一个jar包
* 测试容易，我们整体项目只要改了一个地方马上就可以测试得出结果
* 负载均衡就可以解决，快速部署多个一模一样的项目在不同的机器运行分流

### 单体架构的缺点

* 部署的问题，对于php来说这点还好，但是对于java的项目来说，我们需要重新打包整个项目耗费的时间是很长的
* 代码维护，由于所有的代码都写在一个项目里面，要想要修改某一个功能点那么需要对项目的整体逻辑和设计有较深的理解，否则代码耦合严重，导致维护难，特别对于新入职的员工来说这将是最容易出现问题的地方
* 开发效率低，随着项目需求的不断改变和新的功能新增，老旧的代码又不敢随便删除，导致整个项目变得笨重，这将会增加你阅读代码的时间
* 扩展性，在高并发的情况下，我们往往不是整个项目的每一个功能都处于高流量高请求的情况下的，很多时候都是某一个功能模块使用的人数比较多，在单体结构下我们没有办法针对单个功能实现分布式扩展，必须整个项目一起部署

## 微服务架构

在2014年被提出，现在国内很多公司已经使用，微服务是一种架构设计，并不是说什么框架或者代替什么。微服务做的事情是按照项目颗粒度进行服务的拆分，把模块单独拿出来做成每一个单独的小项目。微服务的主要特点有：每一个功能模块是一个小项目、独立运行在不同进程或者机器上、不同功能可以又不同的人员开发独立开发不松耦合、独立部署不需要依赖整体项目就可以启动单个服务、分布式管理。每一个服务只要做好自己的事情就好了。在设计微服务的时候还需要考虑到数据库的问题，是所有微服务使用共同一个数据库还是每一个服务单个数据库

### 微服务优点

* 拆分业务，把整体大项目分割成不同小项目运行在不同进程或者机器上实现数据隔离
* 技术栈，每个服务可以由不同的团队或者开发者进行开发，外部调用人员不需要操心具体怎么实现的，只需要类似调用自己方法一样或者接口一样按照服务提供者给出来的参数传递即可
* 独立部署，每一个服务独立部署，部署一个服务不会影响整体项目，如果部署失败最多是这个服务的功能缺失，并不影响其他功能的使用
* 按需部署，针对不同的需求可以给不同的服务自由扩展服务器，根据服务的规模部署满足需求的实例
* 局部修改，当一个服务有新需求或者其他修改，不需要修改整体项目只要管好自己的服务就好了

### 微服务缺点

* 运维，微服务由于把业务拆分得细，有可能部署在不同机器上，因此对于运维人员的管理来说，这部分的成本会加大
* 接口调整，微服务之间通过接口进行通信。如果修改某个微服务的API，可能所有使用了该接口的微服务都需要做调整；
* 重复劳动，很多服务可能都会使用到相同的功能。而这个功能并没有达到分解为一个微服务的程度，这个时候，可能各个服务都会开发这一功能，导致代码重复。
* 分布式，由于会把不同服务部署在不同机器上，那么对于这些服务的调用、容错、网络延迟、分布式事务等等都是一个很大的挑战，当然微服务不一定全部都是部署在不同服务器上

## 服务调用

![微服务调用](../images/rpc-server-index2.png)

<center>微服务调用</center>

如上图所示，RPC就用于调用者与服务之间的通讯，RPC协议可基于TCP、UDP或者HTTP实现，但是更推荐选择TCP。

例如调用者需要调用商品的服务就可以通过RPC或者RESTful API来调用，那么RPC调用和RESTful API两者之间的区别在哪呢？

- TCP的支持保持连接，当调用服务的时候不需要每次都进行三次握手才实现。从性能和网络消耗来说RPC都具备了很好的优势。
- RESTful API 基于HTTP的，也就是说每次调用服务都需要进行三次握手建立起通信才可以实现调用，当我们的并发量高的时候这就会浪费很多带宽资源
- 服务对外的话采用RESTful API会比RPC更具备优势，因此看自己团队的服务是对内还是对外

### RPC调用过程

![RPC的调用过程](../images/rpc-server-index3.png)

<center>RPC调用过程</center>

> RPC最主要的作用就是用于服务调用

本文作为RPC的使用场景开山篇，对于单体架构和微服务的进行了一个描述。这个就是RPC的一个使用场景，也是最常用的一个使用场景。大家只有了解好RPC是什么使用在什么场景才能更好的去使用。

Swoft给我们提供了RPC的底层服务，我们并不需要去关心底层通讯细节和调用的过程。

Swoft通过定义接口，实现接口，启动RPC Server 提供接口服务。我们只需要简单的写好几个类就可以实现一个简单RPC模块。

## 配置与启动

RPC 服务不仅仅可以单独启动，也可以HTTP Server 启动的时候，监听端口，启动RPC服务。无论哪种方式启动，都需要配置RPC服务基础信息。

### 服务配置

.env文件中，配置RPC服务的基础信息。

```php
TCPABLE=true

TCP_HOST=0.0.0.0
TCP_PORT=8099
TCP_MODEL=SWOOLE_PROCESS
TCP_TYPE=SWOOLE_SOCK_TCP
TCP_PACKAGE_MAX_LENGTH=2048
TCP_OPEN_EOF_CHECK=false
```

- TCPABLE 参数，用于配置启动HTTP SERVER的同时是否启动RPC服务，单独RPC服务启动，不需配置该参数。
- TCP_HOST 服务器地址
- TCP_PORT 服务端口
- TCP_MODEL TCP模式
- TCP_TYPE TCP类型
- TCP_PACKAGE_MAX_LENGTH 参考 [https://wiki.swoole.com/wiki/page/301.html](https://wiki.swoole.com/wiki/page/301.html)
- TCP_OPEN_EOF_CHECK 参考 [https://wiki.swoole.com/wiki/page/285.html](https://wiki.swoole.com/wiki/page/285.html)

```
## 服务启动
此服务启动指的是单独的RPC服务启动，因为HTTP Server启动伴随着RPC服务启动方式，是不需要手动启动。

```
[root@0dd3950e175b swoft]# php bin/swoft rpc:start
                    Information Panel                     
**********************************************************
* tcp | Host: 0.0.0.0, port: 8099, Model: 3, type: 1
**********************************************************

```

- php bin/swoft rpc:start , 启动服务，根据 .env 配置决定是否是守护进程
- php bin/swoft rpc:start -d , 守护进程启动，覆盖 .env 守护进程(DAEMONIZE)的配置
- php bin/swoft rpc:restart , 重启
- php bin/swoft rpc:reload , 重新加载
- php bin/swoft rpc:stop , 关闭服务

# 接口服务

定义接口并实现接口，才能提供RPC服务。

## 目录定义

官方应用中给出的目录如下：

```text
app/
  - Lib/          // 服务的公共接口定义目录，里面通常只有php接口类
  - Pool/         // 服务池配置，里面可以配置不同服务的连接池，参考里面的 UserServicePool
  - Services/     // 具体的服务接口实现类，里面的类通常实现了 Lib 中定义的接口
```

> 当然在多个服务中使用时， 要将lib库 `app/Lib` 移到一个公共的git仓库里，然后各个服务通过 composer 来获取使用

## 定义接口

服务提供方定义好接口格式，存放到公共的lib库里面，服务调用方，加载lib库，就能使用接口服务。

```php
/**
 * The interface of demo service
 *
 * @method ResultInterface deferGetUsers(array $ids)
 * @method ResultInterface deferGetUser(string $id)
 * @method ResultInterface deferGetUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc")
 */
interface DemoInterface
{
    /**
     * @param array $ids
     *
     * @return array
     *
     * <pre>
     * [
     *    'uid' => [],
     *    'uid2' => [],
     *    ......
     * ]
     * <pre>
     */
    public function getUsers(array $ids);

    /**
     * @param string $id
     *
     * @return array
     */
    public function getUser(string $id);

    public function getUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc");
}
```

接口定义和普通接口完全一致，唯一不一样的是

- 需要在类注释上定义类似 `deferGetUser` 方法，对应类里面方法 `getUser` 且首字母大写。这种 `defer*` 方法，一般用于业务延迟收包和并发使用。
- 这些方法是不需要实现的，仅用于提供IDE提示。内部调用逻辑由框架帮你完成

### 接口实现

一个接口，会存在多种不同的实现，通过一个版本号来标识是那个逻辑实现。

### 注解

**@Service**    

- version 定义接口版本，默认是 `0`

### 实例

**实现版本1**    

```php
/**
 * Demo servcie
 *
 * @method ResultInterface deferGetUsers(array $ids)
 * @method ResultInterface deferGetUser(string $id)
 * @method ResultInterface deferGetUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc")
 *
 * @Service() // 实现了接口 DemoInterface，版本号为 0
 */
class DemoService implements DemoInterface
{
    public function getUsers(array $ids)
    {
        return [$ids];
    }

    public function getUser(string $id)
    {
        return [$id];
    }

    /**
     * @param int    $type
     * @param int    $uid
     * @param string $name
     * @param float  $price
     * @param string $desc  default value
     * @return array
     */
    public function getUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc")
    {
        return [$type, $uid, $name, $price, $desc];
    }
}
```

**实现版本2**    

```php
/**
 * Demo service
 *
 * @method ResultInterface deferGetUsers(array $ids)
 * @method ResultInterface deferGetUser(string $id)
 * @method ResultInterface deferGetUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc")
 * @Service(version="1.0.1") // 实现了接口 DemoInterface，版本号为 1.0.1
 */
class DemoServiceV2 implements DemoInterface
{
    public function getUsers(array $ids)
    {
        return [$ids, 'version'];
    }

    public function getUser(string $id)
    {
        return [$id, 'version'];
    }

    /**
     * @param int    $type
     * @param int    $uid
     * @param string $name
     * @param float  $price
     * @param string $desc  default value
     * @return array
     */
    public function getUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc")
    {
        return [$type, $uid, $name, $price, $desc];
    }
}
```

> 不同的实现，需要定义**不同的唯一版本号**，如果存在相同，加载之后的服务会覆盖之前的服务

## 参数验证器

验证函数参数，保证业务逻辑的完整性。使用验证器只需在方法上面使用，和HTTP验证器一样，唯一不同的是不需要定义from参数

### 实例

```php
    // ......
    /**
     * @Enum(name="type", values={1,2,3})
     * @Number(name="uid", min=1, max=10)
     * @Strings(name="name", min=2, max=5)
     * @Floats(name="price", min=1.2, max=1.9)
     *
     * @param int    $type
     * @param int    $uid
     * @param string $name
     * @param float  $price
     * @param string $desc  default value
     * @return array
     */
    public function getUserByCond(int $type, int $uid, string $name, float $price, string $desc = "desc")
    {
        return [$type, $uid, $name, $price, $desc];
    }
    //......
```
