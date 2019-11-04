+++
title = "Websocket"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 603

[menu.v2]
  parent = "core-components"
  weight = 3
+++

WebSocket 服务基于现有 `swoole ws server` 上的进一步封装实现。即开启 `websocket` 服务的同时可以处理 `http` 请求。

## 安装

### Composer 安装

```bash
composer require swoft/websocket-server
```

### Git 仓库

* Github [https://github.com/swoft-cloud/swoft-websocket-server](https://github.com/swoft-cloud/swoft-websocket-server)

## 参与贡献

欢迎参与贡献，您可以

* fork 我们的开发仓库 [swoft/component](https://github.com/swoft-cloud/swoft-component)
* 修改代码然后发起 PR。

## 功能特色

* 快速的搭建使用 websocket server
* 支持完全的自定义流程处理，如果你不想使用框架自带的处理
* 支持消息阶段的数据解析和路由调度
* 通用的消息发送方法封装(send, sendToSome, sendToAll, broadcast 等)

## 连接处理流程

{{< figure library="true" src="websocket-flow-chat.png" numbered="false" lightbox="true">}}

## 配置参数

websocket 的 `host`, `port` 等配置是都是完全可以自定义的。 配置需要编辑 `app/bean.php` 文件，下面列举了一些简单的配置，你也可以自由组合同时提供多种服务。

```php
'wsServer' => [
    'class' => WebSocketServer::class,
    'port' => 18307,
    'on' => [
        // 开启处理http请求支持
        SwooleEvent::REQUEST => bean(RequestListener::class),
        // 启用任务必须添加 task, finish 事件处理
        SwooleEvent::TASK => bean(TaskListener::class),
        SwooleEvent::FINISH => bean(FinishListener::class)
    ],
    'listener' => [
        // 引入 rpcServer
        'rpc' => \bean('rpcServer')
    ],
    'debug' => env('SWOFT_DEBUG', 0),
    /* @see WebSocketServer::$setting */
    'setting' => [
        'log_file' => alias('@runtime/swoole.log'),
        // 任务需要配置 task worker
        'task_worker_num' => 2,
        'task_enable_coroutine' => true
    ],
],
    'rpcServer'  => [
    'class' => ServiceServer::class,
    'port' => 18308,
],
```

> 可配置项用于 ws server bean 配置，除了 `class` 其他都是 `ws server` 的属性。

* `class` 指定 `websocket server` 的处理类
* `port` 指定 `websocket server` 的端口
* `listener` 指定其他一同启动的服务，添加端口服务监听，可以多个。
  * `rpc` 启动 `RPC` 服务
* `process` 启动自定义用户进程
* `on` 配置监听的事件
  * 注册事件、设置对应事件的处理监听，事件触发组件调用，在任务里面使用
* `setting` 这里是参考 [Swoole Server 配置选项](https://wiki.swoole.com/wiki/page/274.html)
* `pidFile` 设置进程 `pid` 文件 位置，默认值 `@runtime/swoft.pid`
* `mode` 运行的模式，参考 [Swoole Server 构造函数 第三个参数](https://wiki.swoole.com/wiki/page/14.html)
* `type` 指定Socket的类型，支持TCP、UDP、TCP6、UDP6、UnixSocket Stream/Dgram 等 [Swoole Server 构造函数 第四个参数](https://wiki.swoole.com/wiki/page/14.html)
  * 启用 `WSS` 支持 注意： 你必须安装 `OpenSSL` 库，并且确保安装 `swoole` 时是启用了 `ssl` 选项的。同时，需要设置 `'type' => SWOOLE_SOCK_TCP | SWOOLE_SSL`

## Websocket Server 命令

在项目目录下执行如下命令可以看到 websocket server 的管理命令. 跟 http server 的管理命令一致。

```bash
$ php bin/swoft ws
Description:
  There some commands for manage the webSocket server

Usage:
  ws:{command} [arguments] [options]

Commands:
  start    Start the webSocket server
  stop     Stop the running server
  restart  Restart the running server

Options:
  -h, --help  Show help of the command group or specified command action
```

### 使用

前台运行

```bash
$php bin/swoft ws:start
```

后台运行

```bash
$php bin/swoft ws:start -d
```

> websocket server 的默认端口是 18308

如果你注册了 ws 的路由处理模块，现在就可以通过浏览器等ws客户端连接上server了。

## websocket 模块

在根据上安装配置好 `websocket` 之后，就可以在 `app/WebSocke`t 下创建需要的 `websocket` 模块来处理相关逻辑。

在每个模块里允许用户处理的几个事件有 `handshake` `open` `message close`。

### @WsModule 注解

websocket 模块类注解 `@WsModule`。

* 注解类： Swoft\WebSocket\Server\Annotation\Mapping\WsModule
* 作用范围： CLASS
* 拥有属性：
  * `path` _string_ 标明了允许ws连接的 URI path.
  * `controllers` _array_ 绑定到此模块的消息控制器类
  * `messageParser` _string_ 绑定到此模块的消息数据解析器
  * `defaultOpcode` _integer_ 此模块默认的消息数据 `opcode`

示例：

```php
/**
 * @WsModule("/echo", controllers={XXController::class, XYController::class})
 */
```

上面的注解标明了允许 ws 连接的 URI path. 即客户端请求的ws连接类似： `ws://IP:PORT/echo`

{{%alert note%}}
你可以绑定多个控制器，请注意引入完整的控制器、消息解析器类
{{%/alert%}}

### @OnHandshake 注解

方法注解 `@OnHandshake` 标记处理握手的方法

* 注解类： `Swoft\WebSocket\Server\Annotation\Mapping\OnHandshake`
* 作用范围： `METHOD`

> 这方法是可选的。如果没有特殊的需求，可以忽略它，框架会帮你握手并响应握手成功。

必须返回含有两个元素的 `array`

* `bool` 第一个元素的值来决定是否进行握手
* 第二个元素是 `response` 对象 - _可以在 `response` 设置一些自定义 `header`，`body` 等信息_


### @OnOpen 注解

在握手成功后，就会触发 open 事件. 方法注解 `@OnOpen` 标记对应方法。

> 此时开始你就可以给客户端发消息了 :)

- 注解类： `Swoft\WebSocket\Server\Annotation\Mapping\OnOpen`
- 作用范围： `METHOD`
- 此方法也是可选的，可以没有