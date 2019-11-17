+++
title = "WebSocket 服务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 304

[menu.v1]
  parent = "component-list"
  weight = 4
+++
WebSocket 服务基于现有http server上的简单实现。即开启websocket服务的同时可以处理http请求(_是允许配置禁用的_)。

## 安装

```bash
composer require swoft/websocket-server
```

## 生命周期

### 连接

一个连接的生命周期是从握手开始，直到关闭连接

```text
request -> handeshake -> [...Communication...] -> close
```

> 直到关闭前，你都能获取到连接的基本信息(request, client info)

### 消息请求

一次消息请求的生命周期：

> 上面的 `[...Communication...]` 中可能包含了无数次的消息往返

```text
received -> handle [ -> send]
```

## websocket 配置

websocket 的host,port等配置是继承http server的。

### env配置

`.env` 新增配置项

```ini
# Swoole Settings
DISPATCH_MODE=2 # 注意!使用websocket 时分配模式不能为1和3
...
# WebSocket
WS_ENABLE_HTTP=true # 是否启用http处理
```

### server 配置

`config/server.php` 新增websocket配置项 `ws`

```php
'ws'  => [
    // enable handle http request ?
    'enable_http' => env('WS_ENABLE_HTTP', true),
    // other settings will extend the 'http' config
    // you can define separately to overwrite existing settings
],
```

> websocket 的其他配置是继承http服务的

### 扫描配置

> swoft `v1.0.6` 以上可以忽略此条，此版本以上已经是默认扫描app目录下所有文件了

在 `config/properties/app.php` 文件新增扫描配置，添加 `app/WebSocket` 目录

> 如果你的没有这项配置，请手动加上它

```php
'beanScan'     => [
    // ... ....
    'App\WebSocket',
],
```

## 启动与管理

在项目目录下执行如下命令可以看到websocket server的管理命令. 跟http server的管理命令一致.

```bash
$ php bin/swoft ws
Description:
  There some commands for manage the webSocket server

Usage:
  ws:{command} [arguments] [options]

Commands:
  start    Start the webSocket server
  reload   Reload worker processes for the running server
  stop     Stop the running server
  restart  Restart the running server

Options:
  -h, --help  Show help of the command group or specified command action

```

### 启动

- 前台运行

```bash
$ php bin/swoft ws:start
                                 Server Information
************************************************************************************
* WS   | host: 0.0.0.0, port: 9088, type: 1, worker: 1, mode: 3 (http is Enabled)
* TCP  | host: 0.0.0.0, port: 9099, type: 1, worker: 1 (Disabled)
************************************************************************************
Server has been started. (master PID: 86408, manager PID: 86409)
You can use CTRL + C to stop run.
```

- 后台运行

```bash
$ php bin/swoft ws:start -d
```

> `http is Enabled` 表明同时 **启用了http请求处理** 功能

### 使用

如果你注册了ws的路由处理控制器，现在就可以通过浏览器等ws客户端连接上server了

如果没有，接下来的一章 将会说明如何创建一个ws控制器并使用 :)

## websocket 控制器

在根据上两章安装配置好之后，就可以在 `app/WebSocket` 下创建需要的 websocket 控制器来处理相关逻辑

### 注解tag

websocket 新增了类注解tag `@WebSocket`

- 说明

```php
/**
 * @WebSocket("/echo")
 */
```

上面的注解标明了允许ws连接的URI path. 即客户端请求的ws连接类似： `ws://IP:PORT/echo`

### 创建控制器类

可以通过命令 `php bin/swoft gen:websocket` 来快速创建一个控制器。

```bash
php bin/swoft gen:websocket echo --prefix /echo
```

### 事件处理

在每个控制器里允许用户处理的几个事件有 `handshake` `open` `message` `close`

### 处理握手 `handshake`

通过方法 `checkHandshake` 可以对客户端的握手请求进行处理。 比如 验证token，domian ... 等

> 这方法是可选的。如果没有特殊的需求，可以忽略它，框架会帮你握手并响应握手成功。

`checkHandshake` 必须返回含有两个元素的array

- 第一个元素的值来决定是否进行握手
- 第二个元素是response对象 - _可以在response设置一些自定义header,body等信息_

### 连接打开 `open`

在握手成功后，就会触发 open 事件，此时开始你就可以给客户端发消息了 :)

**注意**

- 此方法也是可选的，可以没有
- onOpen 是swoft在握手后通过 `$server->defer()` 来触发的，没有在协程环境中。

### 接收消息 `message`

通过控制器的方法 `onMessage` 你可以接收到客户端的消息和发送消息给对方. **此方法是必须存在的**

### 连接关闭 `close`

当客户的关闭连接或者server在其他地方主动关闭连接时，就会触发此事件。

你可以在这里做一些连接关闭后的工作, 比如：记录日志，解绑用户等 ...

- 此方法也是可选的，可以没有

> 注意：触发此事件时连接已被关闭，不能再给对方发消息

### 代码示例

- 这里面方法上的 server 对象都是 `Swoole\WebSocket\Server` 的实例

```php
<?php

namespace App\WebSocket;

use Swoft\Http\Message\Server\Request;
use Swoft\Http\Message\Server\Response;
use Swoft\WebSocket\Server\Bean\Annotation\WebSocket;
use Swoft\WebSocket\Server\HandlerInterface;
use Swoole\WebSocket\Frame;
use Swoole\WebSocket\Server;

/**
 * Class EchoController
 * @package App\WebSocket
 * @WebSocket("/echo")
 */
class EchoController implements HandlerInterface
{
    /**
     * 在这里你可以验证握手的请求信息
     * - 必须返回含有两个元素的array
     *  - 第一个元素的值来决定是否进行握手
     *  - 第二个元素是response对象
     * - 可以在response设置一些自定义header,body等信息
     * @param Request $request
     * @param Response $response
     * @return array
     * [
     *  self::HANDSHAKE_OK,
     *  $response
     * ]
     */
    public function checkHandshake(Request $request, Response $response): array
    {
        return [self::HANDSHAKE_OK, $response];
    }

    /**
     * @param Server $server
     * @param Request $request
     * @param int $fd
     */
    public function onOpen(Server $server, Request $request, int $fd)
    {
        $server->push($fd, 'hello, welcome! :)');
    }

    /**
     * @param Server $server
     * @param Frame $frame
     */
    public function onMessage(Server $server, Frame $frame)
    {
        $server->push($frame->fd, 'I have received message: ' . $frame->data);
    }

    /**
     * on connection closed
     * @param Server $server
     * @param int $fd
     */
    public function onClose(Server $server, int $fd)
    {
        // you can do something. eg. record log, unbind user...
    }
}
```

### 客户端测试

如果你安装并启用了 devtool, 那么你可以打开页面 `IP:PORT/__devtool/ws/test` 来进行ws测试

- 填上你的ws server地址(注意不要忘了URI path)
- 然后就可以连接上ws server 并收发消息了
- 如果你在前台运行的server 你也能在运行 server的console 上看到ws连接与消息log

效果截图：

![ws-test-page](../images/ws-test-page.jpg)


> 当然也可在网上找一个 ws test网页来进行测试

## 消息发送

上一节我们知道了如何创建ws控制器，并通过客户端连接到server。

可以从示例代码里看到有简单的消息发送使用了。

```php
...
/** @var \Swoole\WebSocket\Server $server */
$server->push($fd, 'hello, welcome! :)');
...
```

- 这里的server是swoole的 `\Swoole\WebSocket\Server` 对象
- `$fd` 是与客户端的连接 ID，它表明了不同的客户端

### 使用 `\Swoft::$server`

除了使用 `$server` 来发送消息外,我们还可以使用swoft封装好的 `\Swoft::$server`(等同于 `\Swoft\App::$server`) 来发送消息.

例如：

```php
\Swoft::$server->sendTo($fd, 'hi, 你好啊！');
```

`\Swoft::$server` 说明： 

- 是 `Swoft\WebSocket\Server\WebSocketServer` 的实例对象
- 内部已经封装了各种发送消息的方法API
- 前台运行时，通过它发送消息能从控制台看到消息发送log

### 消息发送API

注意下面的方法都在类： `Swoft\WebSocket\Server\WebSocketServer`

### 发送给某个客户端

```php
public function sendTo(int $receiver, string $data, int $sender = 0): int
```

参数说明：

- `$receiver` `int` 接收者的fd
- `$data` `string` 要发送的消息数据
- `$sender` `int` 发送者的fd。 _可选的_

示例：

```php
\Swoft::$server->sendTo($fd, 'hi, 你好啊！');
```

### 发送给所有客户端

```php
public function sendToAll(string $data, int $sender = 0): int
```

发送消息给所有客户端，相当于进行全员广播。使用分页方式发送，每 50 个一页，直到全部发送完毕

参数说明：

- `$data` `string` 要发送的消息数据
- `$sender` `int` 发送者的fd。 _可选的_

示例：

```php
\Swoft::$server->sendToAll('hi, 大家好啊！');
```

### 发送给指定的一些客户端

```php
public function sendToSome(string $data, array $receivers = [], array $excepted = [], int $sender = 0): int
```

参数说明：

- `$data` `string` 要发送的消息数据
- `$receivers` `int[]` 指定的接收者fd 列表
- `$excepted` `int[]` 排除的接收者fd 列表
- `$sender` `int` 发送者的fd。 _可选的_

方法说明：

- 当 `$receivers` 有数据时，将会忽略 `$excepted`。 此时就是将消息指定的发给这些接收者
- 当 `$receivers` 为空时
	- 若 `$excepted` 有值，将会给除了这些人之外的发送消息
	- 若 `$excepted` 为空，相当于给所有人发消息

示例：

```php
\Swoft::$server->sendToSome('hi, 你们好啊！', [$fd0, $fd1, ...]);
```

### 广播消息

```php
broadcast(string $data, array $receivers = [], array $excepted = [], int $sender = 0): int
```

**参数跟 `sendToSome` 一样**

会自动根据参数判断调用上面的（`sendTo`, `sendToAll`, `sendToSome`）中的一个方法
