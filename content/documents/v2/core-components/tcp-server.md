+++
title = "TCP Server"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 605

[menu.v2]
  parent = "core-components"
  weight = 5
+++

从 swoft `2.0.4` 版本开始，提供经过 swoft 封装的 `tcp` 服务器实现。在原有 swoole server 的基础上，封装并细化功能使用。

> Available: >= `v2.0.4`

## 安装

### Composer 安装

```bash
composer require swoft/tcp-server
```

### Git 仓库

* Github tcp 数据协议 [https://github.com/swoft-cloud/swoft-tcp](https://github.com/swoft-cloud/swoft-tcp)
* Github tcp-server [https://github.com/swoft-cloud/swoft-tcp-server](https://github.com/swoft-cloud/swoft-tcp-server)

## 参与贡献

欢迎参与贡献，您可以

* fork 我们的开发仓库 [swoft/component](https://github.com/swoft-cloud/swoft-component)
* 修改代码然后发起 PR。
* 阅读 [提交代码](/documents/v2/contribute/sub-codes/) 的注意事项

## 功能特色

* 基于 swoft 的注解系统，使用方便快速
* 提供统一的协议设置，同时支持 `EOF` 和 `length` 两种切包方式
* 完善的数据收发解析，统一的上下文/请求与响应对象封装
* 内置请求调度处理，可以像 `http` 一样细致的分发请求数据到不同的方法处理。
* 内置支持多种打包方式(`json` `php` `token`)，同时可以自由扩展。

## 配置服务

tcp server 的 `host`, `port` 等配置是都是完全可以自定义的。 配置需要编辑 `app/bean.php` 文件，下面列举了一些简单的配置，你也可以自由组合同时提供多种服务。

> tcp server 的默认端口是 `18309`

```php
// ...
'tcpServer'   => [
  'class'   => TcpServer::class,
  'port' => 18307,
  'on'      => [
    // 启用任务必须添加 task, finish 事件处理
    SwooleEvent::TASK   => bean(TaskListener::class),  
    SwooleEvent::FINISH => bean(FinishListener::class)
  ],
  'listener' => [
    // 引入 rpcServer
    'rpc' => \bean('rpcServer')
    ],
    'debug' => env('SWOFT_DEBUG', 0),
        /* @see TcpServer::$setting */
        'setting' => [
            'log_file' => alias('@runtime/swoole.log'),
            // 任务需要配置 task worker
            'task_worker_num'       => 2,
            'task_enable_coroutine' => true
        ],
],
```

可配置项用于 `tcpServer` bean 配置，除了 `class` 其他都是 `TcpServer` 的属性。

* `class` 指定 tcp server 的 bean 类，默认即是 `Swoft\Tcp\Server\TcpServer::class`
* `port` 指定 tcp server 的端口
* `listener` 指定其他一同启动的服务，添加端口服务监听，可以多个。
  * `rpc` 启动 `RPC` 服务
* `on` 配置监听的事件
  * 注册 swoole 事件、设置对应事件的处理监听
* `setting` 这里是参考 [Swoole Server配置选项](https://wiki.swoole.com/wiki/page/274.html)
* `pidFile` 设置进程 `pid` 文件 位置，默认值 `@runtime/swoft-tcp.pid`
* `mode` 运行的模式，参考 [Swoole Server 构造函数 第三个参数](https://wiki.swoole.com/wiki/page/14.html)
* `type` 指定 Socket 的类型，支持 TCP、UDP、TCP6、UDP6、UnixSocket Stream/Dgram 等 [Swoole Server 构造函数 第四个参数](https://wiki.swoole.com/wiki/page/14.html)

### 协议配置

通常你只需配置好协议的分包方式，内部的细节配置会自动同步设置到 TcpServer。

```php
    /** @see \Swoft\Tcp\Protocol */
    'tcpServerProtocol' => [
        'type'            => \Swoft\Tcp\Packer\SimpleTokenPacker::TYPE,
        // 'openEofCheck'    => true, // Defalut use EOF check
        // 'openLengthCheck' => true,
    ],
```

可配置项：

* `type` __string__ 默认的数据打包器的类型。默认是 `token-text`
* `packers` __array__ 可用的数据打包器的列表，内置了 json php `token-text` 三种。
* `packageMaxLength` __int__ 同 swoole 的 `package_max_length` 默认 `81920`
* `openEofCheck` __bool__ 同 swoole 的 `open_eof_check` 默认 `true`
* `openLengthCheck` __bool__ 同 swoole 的 `open_length_check`，总是与 `openEofCheck` 相反。默认 `false`

### 添加 RPC 服务

如果你想运行 tcp server 时，同时启动 RPC Server 服务。

```php
    // ...
    'tcpServer'   => [
        'listener' => [
            'rpc' => \bean('rpcServer') // 引入 rpcServer
        ],
    ],
    'rpcServer'  => [
        'class' => ServiceServer::class,
        'port' => 18308,
    ],
```

## 启动与管理

在项目目录下执行如下命令可以看到 tcp server 的管理命令. 跟 http server 的管理命令一致。

```bash
$ php bin/swoft tcp
Description:
  There some commands for manage the tcp server

Usage:
  tcp:{command} [arguments] [options]

Commands:
  start    Start the tcp server
  stop     Stop the running server
  restart  Restart the running server

Options:
  -h, --help  Show help of the command group or specified command action
```

**启动：** 前台启动

```bash
php bin/swoft tcp:start
```

> 注意：tcp服务器的默认端口是 `18309`

**启动：** 后台启动

```bash
php bin/swoft tcp:start -d
```

**启动：** 重新启动

```bash
php bin/swoft tcp:restart
```

## TCP 事件通知

通常情况下，我们无需关心 tcp server 相关的 `connect` `close` 事件。 但 swoft 内部都是监听并触发了框架内部定义的相关事件，你同样可以监听并处理一些逻辑。

### 事件列表

```php
<?php declare(strict_types=1);

namespace Swoft\Tcp\Server;

/**
 * Class TcpServerEvent
 *
 * @since 2.0
 */
final class TcpServerEvent
{
    /**
     * On connect
     */
    public const CONNECT = 'swoft.tcp.server.connect';

    /**
     * On connect error
     */
    public const CONNECT_ERROR = 'swoft.tcp.server.connect.error';

    /**
     * On receive
     */
    public const RECEIVE = 'swoft.tcp.server.receive';

    /**
     * On receive error
     */
    public const RECEIVE_ERROR = 'swoft.tcp.server.receive.error';

    /**
     * On close
     */
    public const CLOSE = 'swoft.tcp.server.close';

    /**
     * On close error
     */
    public const CLOSE_ERROR = 'swoft.tcp.server.close.error';
}
```

### 监听事件

跟其他事件一样，直接通过 `@Lisenter` 监听对应事件名，就可以处理相关逻辑了。

```php
<?php declare(strict_types=1);

namespace App\Listener;

use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Tcp\Server\TcpServerEvent;

/**
 * Class UserSavingListener
 *
 * @since 2.0
 *
 * @Listener(TcpServerEvent::CONNECT)
 */
class TcpConnectListener implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     */
    public function handle(EventInterface $event): void
    {

        /* @var \Swoole\Server $server */
        $server = $event->getTarget();

        var_dump(
          $event->getParam(0), // fd
          $event->getParam(1), // reactorId
        );
    }
}
```

## TCP 控制器

与 http server 类似，tcp server 中也使用对应的控制器来处理系统分发的数据请求。

tcp server 新增两个注解 `@TcpController` 和 `@TcpMapping`，由他们定义 tcp 控制器和处理方法。

### @TcpController 注解

类注解 `@TcpControler` 标记当前类是一个 `Tcp` 控制器。

* 注解类：`Swoft\Tcp\Server\Annotation\Mapping\TcpController`
* 作用范围：`CLASS`
* 拥有属性：
  * `prefix` _string_ 数据路由前缀，为空自动解析类名称为前缀。

### @TcpMapping

方法注解 `@TcpMapping` 标记具体的数据处理方法，类似于 `http` 控制器里的 `action`。

* 注解类：`Swoft\Tcp\Server\Annotation\Mapping\TcpMapping`
* 作用范围：`METHOD`
* 拥有属性：
  * `route` _string_ 命令名称，为空自动使用方法名称。
  * `root` _bool_ 命令名称是否是顶级命令。默认 `false`

{{%alert note%}}

* 自动解析 `TcpControler` 的前缀时，会自动尝试去除 `Controler` 部分。eg: `DemoController` 得到 `demo`
* 通常，完整的 `tcp` 命令是 上面的 `preifx` 和 `route` 由点拼接而成 `PREFIX.ROUTE`。eg: `demo.index`
* 当 `TcpMapping.root` 为 `true` 时，完整命令直接是 `TcpMapping.route`
{{%/alert%}}

### 编写控制器

```php
<?php declare(strict_types=1);

namespace App\Tcp\Controller;

use Swoft\Tcp\Server\Annotation\Mapping\TcpController;
use Swoft\Tcp\Server\Annotation\Mapping\TcpMapping;
use Swoft\Tcp\Server\Request;
use Swoft\Tcp\Server\Response;

/**
 * Class DemoController
 *
 * @TcpController()
 */
class DemoController
{
    /**
     * @TcpMapping("list", root=true)
     * @param Response $response
     */
    public function list(Response $response): void
    {
        $response->setData('[list]allow command: list, echo, demo.echo');
    }

    /**
     * @TcpMapping("echo")
     * @param Request  $request
     * @param Response $response
     */
    public function index(Request $request, Response $response): void
    {
        $str = $request->getPackage()->getDataString();

        $response->setData('[demo.echo]hi, we received your message: ' . $str);
    }

    /**
     * @TcpMapping("strrev", root=true)
     * @param Request  $request
     * @param Response $response
     */
    public function strRev(Request $request, Response $response): void
    {
        $str = $request->getPackage()->getDataString();

        $response->setData(\strrev($str));
    }

    /**
     * @TcpMapping("echo", root=true)
     * @param Request  $request
     * @param Response $response
     */
    public function echo(Request $request, Response $response): void
    {
        $str = $request->getPackage()->getDataString();

        $response->setData('[echo]hi, we received your message: ' . $str);
    }
}
```

服务端代码已经编写好了。这里我们使用默认的配置 `EOF` 分包方式，数据协议格式也使用默认的  `SimpleTokenPacker::TYPE`。

重新启动我们的 tcp server `php bin/swoft tcp:start`，接下来讲述如何与我们的 tcp server进行通信交互。

## 客户端通信

你可以直接使用 swoole 提供的 `Swoole\Coroutine\Client` 作为 tcp 客户端，快速的对接 swoft 的 tcp sever。

为了分包和数据解析与 tcp server 保持一致，你需要依赖 tcp 协议包:

```bash
composer require swoft/tcp
```

开始之前，首先你得确认你已经启动了 tcp server 端，并且保持客户端与服务端的 协议设置是一致的。

**示例：** Swoft 使用

```php
<?php declare(strict_types=1);

namespace App\Command;

use Swoft\Tcp\Protocol;
use Swoole\Coroutine\Client;
use Swoft\Console\Helper\Show;
use Swoft\Console\Input\Input;
use Swoft\Console\Output\Output;
use const SWOOLE_SOCK_TCP;

// ...

    public function tcpTest(Input $input, Output $output): void
    {
        $proto = new Protocol();

        // If your tcp server use length check.
        // $proto->setOpenLengthCheck(true);

        var_dump($proto->getConfig());

        $host = '127.0.0.1';
        $port = 18309;

        $client = new Client(SWOOLE_SOCK_TCP);
        // Notice: config client
        $client->set($proto->getConfig());

        if (!$client->connect((string)$host, (int)$port, 5.0)) {
            $code = $client->errCode;
            /** @noinspection PhpComposerExtensionStubsInspection */
            $msg = socket_strerror($code);
            $output->error("Connect server failed. Error($code): $msg");
            return;
        }

        // Send message $msg . $proto->getPackageEOf()
        if (false === $client->send($proto->packBody($msg))) {
            /** @noinspection PhpComposerExtensionStubsInspection */
            $output->error('Send error - ' . socket_strerror($client->errCode));
            return;
        }

        // Recv response
        $res = $client->recv(2.0);
        if ($res === false) {
            /** @noinspection PhpComposerExtensionStubsInspection */
            $output->error('Recv error - ' . socket_strerror($client->errCode));
            return;
        }

        if ($res === '') {
            $output->info('Server closed connection');
            return;
        }

        // unpack response data
        [$head, $body] = $proto->unpackData($res);
        $output->prettyJSON($head);
        $output->writef('<yellow>server</yellow>> %s', $body);
    }
```

**示例：** 非Swoft 使用

{{%alert note%}}
这里使用的json数据，因此你需要将服务端 `tcpServerProtocol` 的 `type` 配置为 `json`
{{%/alert%}}

```php
<?php

const PKG_EOF = "\r\n\r\n";

function request(string $host, string $cmd, $data, $ext = []) {
    $fp = stream_socket_client($host, $errno, $errstr);
    if (!$fp) {
        throw new Exception("stream_socket_client fail errno={$errno} errstr={$errstr}");
    }

    $req = [
        'cmd'  => $cmd,
        'data' => $data,
        'ext' => $ext,
    ];
    $data = json_encode($req) . PKG_EOF;
    fwrite($fp, $data);

    $result = '';
    while (!feof($fp)) {
        $tmp = stream_socket_recvfrom($fp, 1024);

        if ($pos = strpos($tmp, PKG_EOF)) {
            $result .= substr($tmp, 0, $pos);
            break;
        } else {
            $result .= $tmp;
        }
    }

    fclose($fp);
    return json_decode($result, true);
}

$ret = request('tcp://127.0.0.1:18309', 'echo', 'i an client');

var_dump($ret);
```

**测试通信**，你可以复制上面的示例代码，新建一个 php 文件来运行测试。

当然，最方便直接的就是使用我们 `devtool` 包里提供的 `dclient:tcp` 工具命令。

运行：`php bin/swoft dclient:tcp -h` 查看命令帮助。
