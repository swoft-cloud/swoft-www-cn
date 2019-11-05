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
  * `controllers` _array_ 绑定到此模块的 [消息控制器](#消息控制器) 类
  * `messageParser` _string_ 绑定到此模块的 [消息解析器](#消息解析器)
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

在握手成功后，就会触发 open 事件。 方法注解 `@OnOpen` 标记对应方法。

> 此时开始你就可以给客户端发消息了 :)

* 注解类： `Swoft\WebSocket\Server\Annotation\Mapping\OnOpen`
* 作用范围： `METHOD`
* 此方法也是可选的，可以没有

### @OnMessage

通过的方法注解 `@OnMessage` 标记一个消息处理方法。

> 在此阶段你可以接收到客户端的消息和发送消息给对方.

* 注解类：`Swoft\WebSocket\Server\Annotation\Mapping\OnMessage`
* 作用范围：`METHOD`
* 当你没有绑定消息控制器时，表明你想自己处理消息阶段的逻辑，**此方法是必须存在的**。
* 当你有绑定消息控制器时，框架会自动解析消息并路由到指定的消息处理方法

### @OnClose

通过的方法注解 `@OnClose` 标记一个关闭连接时的处理方法。

> 注意：触发此事件时连接已被关闭，不能再给对方发消息

当客户的关闭连接或者 `server` 在其他地方主动关闭连接时，就会触发此事件。

你可以在这里做一些连接关闭后的工作, 比如：记录日志，解绑用户等。

* 注解类：`Swoft\WebSocket\Server\Annotation\Mapping\OnClose`
* 作用范围：`METHOD`
* 此方法也是可选的，可以没有

### 快速创建模块类

可以使用 `swoftcli` 工具来快速创建一个 `websocket` 模块类：

默认生成的是支持内置路由调度的模块类。

```bash
php swoftcli.phar gen:wsmod chat --prefix /chat
```

生成用户自定义调度的模块类。

```bash
php swoftcli.phar gen:wsmod chat --prefix /chat --tpl-file ws-module-user
```

**示例：** 这里面方法上的 `server` 对象都是 `Swoole\WebSocket\Server` 的实例。

```php
<?php

namespace App\WebSocket;

use Swoft\Http\Message\Request;
use Swoft\Http\Message\Response;
use Swoft\WebSocket\Server\Annotation\Mapping\OnClose;
use Swoft\WebSocket\Server\Annotation\Mapping\OnHandshake;
use Swoft\WebSocket\Server\Annotation\Mapping\OnOpen;
use Swoft\WebSocket\Server\Annotation\Mapping\WsModule;
use Swoole\WebSocket\Frame;
use Swoole\WebSocket\Server;

/**
 * Class EchoModule
 *
 * @WsModule("/echo")
 */
class EchoModule
{
    /**
     * 在这里你可以验证握手的请求信息
     * @OnHandshake()
     * @param Request $request
     * @param Response $response
     * @return array [bool, $response]
     */
    public function checkHandshake(Request $request, Response $response): array
    {
        return [true, $response];
    }

    /**
     * On connection has open
     *
     * @OnOpen()
     * @param Request $request
     * @param int     $fd
     */
    public function onOpen(Request $request, int $fd): void
    {
        server()->push($fd, 'hello, welcome! :)');
    }

    /**
     * @OnMessage()
     * @param Server $server
     * @param Frame $frame
     */
    public function onMessage(Server $server, Frame $frame)
    {
        $server->push($frame->fd, 'I have received message: ' . $frame->data);
    }

    /**
     * On connection closed
     * - you can do something. eg. record log
     *
     * @OnClose()
     * @param Server $server
     * @param int    $fd
     */
    public function onClose(Server $server, int $fd): void
    {
        // you can do something. eg. record log, unbind user...
    }
}
```

**示例：** 简易的客户端 `js` 代码连接示例。

```javascript
// wsUrl = websocket host + module path
const wsUrl = 'ws://127.0.0.1:18308/echo'
let ws = new WebSocket(wsUrl)

ws.onerror = function (event){
    console.log("error: " + event.data)
}

ws.onopen = function (event){
    console.log("open: connection opened");
}

ws.onmessage = function (event){
    console.log("message: " + event.data);
}

ws.onclose = function (event){
    console.log("close: connection closed")
    ws.close()
}
```

如果你安装并启用了 devtool, 那么你可以打开页面 IP:PORT/__devtool/ws/test 来进行ws测试。

* 填上你的 `ws server` 地址(注意不要忘了 URI path)(**2.0 devtool 暂无 web UI**)
* 然后就可以连接上 `ws server` 并收发消息了
* 如果你在前台运行的 `server` 你也能在运行 `server` 的 `console` 上看到 ws 连接与消息 log。

> 可在网上找一个 ws test 网页来进行测试。注意，请确保 server 是启动且地址没有填写错误。

这里我们使用 [http://www.websocket.org/echo.html](http://www.websocket.org/echo.html) 简单测试使用下。

{{< figure library="true" src="ws-echo-test.jpg" numbered="false" lightbox="true">}}

## 消息控制器

swoft 提供了灵活的 websocket 使用，支持自定义和由框架托管处理消息两种方式。

* 如果你在 ws 模块类没有添加 `@OnMessage` 处理方法，框架将会自动托管这个阶段，解析消息并根据路由分发到不同的方法执行
* 如果你在 ws 模块类里面绑定了 `@OnMessage` 处理方法，swoft 就认为你想自己处理这个阶段，框架就不会处理了

{{%alert note%}}
本篇文档的使用是建立在由框架托管消息路由的基础上。
{{%/alert%}}

### @WsController 注解

websocket 消息控制器注解 `@WsController`

* 注解类：`Swoft\WebSocket\Server\Annotation\Mapping\WsController`
* 作用范围：`CLASS`
* 拥有属性：
  * `prefix` _string_ 消息路由前缀

### @MessageMapping 注解

方法注解 `@MessageMapping` 标记具体的消息处理方法，类似于 `http` 控制器里的 `action`。

* 注解类：`Swoft\WebSocket\Server\Annotation\Mapping\MessageMapping`
* 作用范围：`METHOD`
* 拥有属性：
  * `command` _string_ 消息命令名称

> 完整的消息路由 `path` 是 上面的 `preifx` 和 `command` 由点拼接而成 `PREFIX.COMMAND`

## 消息解析器

不同的使用者或者使用场景，用于 ws 通信的数据格式可能是不一样的。因此，在编写 ws 模块时，需要你绑定消息解析器。

### 内置解析器

* `Swoft\WebSocket\Server\MessageParser\RawTextParser` 简单的字符串
* `Swoft\WebSocket\Server\MessageParser\TokenTextParser` 简单的 `token` 字符串协议(_方便测试使用的_)
* `Swoft\WebSocket\Server\MessageParser\JsonParser` 简单的 `JSON` 数据协议

JSON 协议通信数据结构：

```json
{
    "cmd": "message route path. eg: home.index", // type: string
    "data": "message data", // type: mixed(array|string|int)
    "ext": {"ip": "xx", "os": "mac"}, // optional, type: array
}
```

## 获取数据

有多种方式可以获取消息请求的数据信息。

`Message` 对象是一个通用的 `websocket` 数据对象，里面保存了解析后的数据，包含 `cmd` `data` `ext` 三个字段。

我们可以通过 `参数注入` 或 `上下文方法` 来获取 `Message` 对象。

**示例：** 通过参数注入获取

```php
use Swoft\WebSocket\Server\Message\Message;
use Swoft\WebSocket\Server\Message\Request;

...
// inject raw frame data string
public function autoReply(string $data): string
{
    return $data;
}

// inject Message object
public function autoReply(Message $msg): string
{
    return $msg->toString();
}

// inject Request object
public function autoReply(Request $req): string
{
    return $req->getMessage()->toString();
}
```

**示例：** 通过上下文获取

```php
use Swoft\WebSocket\Server\Message\Message;

...

public function autoReply(): string
{
    $msg = context()->getMessage();
}
```

**示例：** 更多获取方式

```php
use Swoft\WebSocket\Server\Message\Request;

$req = context()->getRequest();

/** @var \Swoft\WebSocket\Server\Message\Message $msg */
$msg = $req->getMessage();

/** @var \Swoole\WebSocket\Frame $frame */
$frame = $req->getFrame();
```

> 注意这里的 Request 是指消息阶段的请求对象，与打开连接时的请求对象是不同的。

## 使用示例

### 定义 ws 模块

{{%alert note%}}
要绑定消息处理控制器，通常也需要绑定你的消息解析器，可以使用内置的几个简单的解析器，也可以根据需要自定义。
{{%/alert%}}

```php
<?php declare(strict_types=1);

namespace App\WebSocket;

use App\WebSocket\Chat\HomeController;
use Swoft\Http\Message\Request;
use Swoft\WebSocket\Server\Annotation\Mapping\OnOpen;
use Swoft\WebSocket\Server\Annotation\Mapping\WsModule;
use Swoft\WebSocket\Server\MessageParser\TokenTextParser;
use function server;

/**
 * Class ChatModule
 *
 * @WsModule(
 *     "/chat",
 *     messageParser=TokenTextParser::class,
 *     controllers={HomeController::class}
 * )
 */
class ChatModule
{
    /**
     * @OnOpen()
     * @param Request $request
     * @param int     $fd
     */
    public function onOpen(Request $request, int $fd): void
    {
        server()->push($request->getFd(), "Opened, welcome!(FD: $fd)");
    }
}
```

* 定义的 ws 模块路径为 `/chat`
* 绑定了的控制器有：`HomeController::class` 你可以绑定多个控制器
* 绑定了一个内置的消息解析器

{{%alert note%}}
这里定义 Ws 模块时，绑定了一个框架自带的消息解析器，`TokenTextParser::class` 内置了一个 `decode()` 的方法用来解析数据。
{{%/alert%}}

```php
// 默认为字符串解析，消息路由格式 `控制器.方法:数据`
public function decode(string $data): Message
{
  // use default message command
  $cmd = '';
  if (strpos($data, ':')) {
    [$cmd, $body] = explode(':', $data, 2);
    $cmd = trim($cmd);
  } else {
    $body = $data;
  }
  return Message::new($cmd, $body);
}
```

### 定义消息控制器

{{%alert note%}}
必须使用注解 `@WsController` 以及 `@MessageMapping`
{{%/alert%}}

```php
<?php declare(strict_types=1);

namespace App\WebSocket\Chat;

use Swoft\Session\Session;
use Swoft\WebSocket\Server\Annotation\Mapping\MessageMapping;
use Swoft\WebSocket\Server\Annotation\Mapping\WsController;

/**
 * Class HomeController
 *
 * @WsController()
 */
class HomeController
{
    /**
     * Message command is: 'home.index'
     *
     * @return void
     * @MessageMapping()
     */
    public function index(): void
    {
        Session::mustGet()->push('hi, this is home.index');
    }

    /**
     * Message command is: 'home.echo'
     *
     * @param string $data
     * @MessageMapping()
     */
    public function echo(string $data): void
    {
        Session::mustGet()->push('(home.echo)Recv: ' . $data);
    }

    /**
     * Message command is: 'home.ar'
     *
     * @param string $data
     * @MessageMapping("ar")
     *
     * @return string
     */
    public function autoReply(string $data): string
    {
        return '(home.ar)Recv: ' . $data;
    }
}
```

{{%alert note%}}
自 v2.0.6 版本起，通过参数注入接收 websocket 原始数据时，需要加上类型 `string`。例如： public function echo(string $data)
{{%/alert%}}

### 访问服务

根据以上定义好的 `Ws模块`、`消息解析器`、`消息控制器` 等内容后启动我们的服务。然后打开 `webscoket` 调试工具，链接Ws的地址：`ws://localhost:port/chat` 然后测试发送一个内容。

```bash
Send: testWS
Recv: hi, this is home.index
Send: home.echo:这是数据
Recv: (home.echo)Recv: 这是数据
```

## 消息发送

上一节我们知道了如何创建 ws 模块，并通过客户端连接到 server。

可以从示例代码里看到有简单的消息发送使用了。

```php
... 
/** @var \Swoole\WebSocket\Server $server */
$server->push($fd, 'hello, welcome! :)');
...
```

* 这里的 `server` 是 `swoole` 的 `\Swoole\WebSocket\Server` 对象
* `$fd` 是与客户端的连接 `ID`，它表明了不同的客户端

除了使用 `$server` 来发送消息外,我们还可以使用 swoft 封装好的 `\server()` 或者 `\Swoft::server()` 来发送消息，例如：

```php
\server()->sendTo($fd, 'hi, 你好啊！');
\Swoft::server()->sendTo($fd, 'hi, 你好啊！');
```

* `Swoft\WebSocket\Server\WebSocketServer` 的实例对象
* 内部已经封装了各种发送消息的方法 API
* 前台运行时，通过它发送消息能从控制台看到消息发送 log

### 消息发送 API

注意下面的方法都在类：`Swoft\WebSocket\Server\WebSocketServer`

发送给某个客户端

```php
public function sendTo(int $receiver, string $data, int $sender = 0): int
```

参数说明：

* `$receiver` _int_ 接收者的 fd
* `$data` _string_ 要发送的消息数据
* `$sender` _int_ 发送者的 fd。 _可选的_

示例：

```php
\server()->sendTo($fd, 'hi, 你好啊！');
```

#### 发送给指定的一些客户端

```php
public function sendToSome(string $data, array $receivers = [], array $excluded = [], int $sender = 0, int $pageSize = 50): int
```

参数说明：

* `$data` _string_ 要发送的消息数据
* `$receivers` _int[]_ 指定的接收者 fd 列表
* `$excluded` _int[]_ 排除的接收者 fd 列表
* `$sender` _int_ 发送者的 fd。 _可选的_

方法说明：

* 当 `$receivers` 有数据时，将会忽略 `$excluded`。 此时就是将消息指定的发给这些接收者
* 当 `$receivers` 为空时
  * 若 `$excluded` 有值，将会给除了这些人之外的发送消息
  * 若 `$excluded` 为空，相当于给所有人发消息

示例：

```php
\server()->sendToSome('hi, 你们好啊！', [$fd0, $fd1, ...]);
```

#### 广播消息

发送消息给除了 `sender` 外的所有人。使用分页方式发送，每 50 个一页，直到全部发送完毕。

```php
broadcast(string $data, array $receivers = [], array $excluded = [], int $sender = 0): int
```

#### 发送给所有客户端

```php
public function sendToAll(string $data, int $sender = 0, int $pageSize = 50): int
```

发送消息给所有客户端，相当于进行全员广播。使用分页方式发送，每 50 个一页，直到全部发送完毕。

参数说明：

* `$data` _string_ 要发送的消息数据
* `$sender` _int_ 发送者的 fd。 _可选的_

示例：

```php
\server()->sendToAll('hi, 大家好啊！');
```

#### send

参数跟 `sendToSome` 一样。

会自动根据参数判断调用上面的（sendTo, sendToAll, sendToSome）中的一个方法。

#### 断开连接

服务端可以主动断开连接，断开后会触发 `close` 事件。

```php
bean('wsServer')->disconnect($fd);

// OR
server()->disconnect($fd);
```

## 异常处理

前面我们了解了系统如何处理异常（详情请看 [错误处理](/documents/v2/basic-components/error-dispose/)章节），以及 `http server` 里如何处理异常的。在 `websocket server` 也是类似的，我们只需定义 `websocket` 相关场景的异常处理器就行。

与 `http server` 里只有一个 `request` 场景不同, `websocket` 里有四个场景：

* `handshake` 握手环节
* `open` 握手后连接打开
* `message` 消息通信阶段
* `close` 连接关闭

下面我们编写 websocket 几个环节中最重要的 握手 和 消息通信 环节的异常处理。其他环节的可以参考和继承相关类来编写。

### 握手异常

因为 `websocket` 握手环节就是 `http` 请求处理，所以此环节的异常跟 `http` 里处理是一样的，当然你还是得 `继承` 为这个场景设计的 `基础类` 才行。

{{%alert note%}}
必须继承 `AbstractHandshakeErrorHandler` 类，我们才能知道你要处理哪个 `场景` 里的异常
{{%/alert%}}

```php
<?php declare(strict_types=1);

namespace App\Exception\Handler;

use ReflectionException;
use Swoft\Bean\Exception\ContainerException;
use Swoft\Error\Annotation\Mapping\ExceptionHandler;
use Swoft\Http\Message\Response;
use Swoft\WebSocket\Server\Exception\Handler\AbstractHandshakeErrorHandler;
use Throwable;
use function get_class;
use function sprintf;
use const APP_DEBUG;

/**
 * Class HttpExceptionHandler
 *
 * @ExceptionHandler(\Throwable::class)
 */
class WsHandshakeExceptionHandler extends AbstractHandshakeErrorHandler
{
    /**
     * @param Throwable $e
     * @param Response  $response
     *
     * @return Response
     * @throws ReflectionException
     * @throws ContainerException
     */
    public function handle(Throwable $e, Response $response): Response
    {
        // Debug is false
        if (!APP_DEBUG) {
            return $response->withStatus(500)->withContent(sprintf(
                '%s At %s line %d', $e->getMessage(), $e->getFile(), $e->getLine()
            ));
        }

        $data = [
            'code'  => $e->getCode(),
            'error' => sprintf('(%s) %s', get_class($e), $e->getMessage()),
            'file'  => sprintf('At %s line %d', $e->getFile(), $e->getLine()),
            'trace' => $e->getTraceAsString(),
        ];

        // Debug is true
        return $response->withData($data);
    }
}
```

### 消息通信异常

在握手成功后的消息通信阶段出现异常，也可以方便的捕获处理。

{{%alert note%}}
你仍然需要继承专有场景的异常处理抽象类 `AbstractMessageErrorHandler`
{{%/alert%}}

```php
<?php declare(strict_types=1);

namespace App\Exception\Handler;

use ReflectionException;
use Swoft\Bean\Exception\ContainerException;
use Swoft\Error\Annotation\Mapping\ExceptionHandler;
use Swoft\Log\Helper\Log;
use Swoft\WebSocket\Server\Exception\Handler\AbstractMessageErrorHandler;
use Swoole\WebSocket\Frame;
use Throwable;
use function server;
use const APP_DEBUG;

/**
 * Class WsMessageExceptionHandler
 *
 * @since 2.0
 *
 * @ExceptionHandler(\Throwable::class)
 */
class WsMessageExceptionHandler extends AbstractMessageErrorHandler
{
    /**
     * @param Throwable $e
     * @param Frame     $frame
     *
     * @throws ContainerException
     * @throws ReflectionException
     */
    public function handle(Throwable $e, Frame $frame): void
    {
        $message = sprintf('%s At %s line %d', $e->getMessage(), $e->getFile(), $e->getLine());

        Log::error('Ws server error(%s)', $message);

        // Debug is false
        if (!APP_DEBUG) {
            server()->push($frame->fd, $e->getMessage());
            return;
        }

        server()->push($frame->fd, $message);
    }
}
```
