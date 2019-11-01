+++
title = "事件"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-31"
weight = 504

[menu.v2]
  parent = "basic-components"
  weight = 4

+++

[![Latest Stable Version](https://img.shields.io/packagist/v/swoft/event.svg)](https://packagist.org/packages/swoft/event)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)

Swoft 2 对事件进行了更加清晰和严谨的规划，提供了基本的事件注册与触发管理。

GitHub: [https://github.com/swoft-cloud/swoft-event](https://github.com/swoft-cloud/swoft-event)

## 安装

默认情况下事件组件已包含在 Swoft 框架中，如需重新安装只需执行下方命令： 

```bash
composer require swoft/event
```

## 简介

在 Swoft 中，我们将事件分为三大类：

- Swoole Server 回调事件
- Swoft Server 事件，基于 Swoole 回调处理，扩展了可用事件以方便自定义
- 应用级自定义事件管理

## 事件分组

除部分特殊事件外，在一个应用中，大多数事件存在关联性，此时我们可以对事件进行分组以方便识别和管理。

> 建议根据实际情况在名称设计上对事件进行分组。

示例：

```
swoft.server.*
swoft.process.*
swoft.pool.*

swoft.http.request.before
swoft.http.request.after

swoft.db.query.start
swoft.db.query.after

swoft.redis.start
swoft.redis.after

swoft.ws.start
swoft.ws.after

swoft.tcp.start
swoft.tcp.after

swoft.udp.start
swoft.udp.after
```

### 通配符

事件支持使用通配符 `*` 对一组相关事件进行监听，具体分为两种：

1. `*` 全局事件通配符。直接对 `*` 添加监听器 `@Listener("*")`，此时所有触发的事件都会被此监听器所监听。

2. `{prefix}.*` 指定分组事件的监听。

    例如 `@Listener("swoft.db.*")`，此时所有以 `swoft.db.` 为前缀的事件（例如 `swoft.db.query`、`swoft.db.connect`）都会被此监听器所监听。

> 在事件到达监听器前停止本次事件的传播 `$event->stopPropagation(true)` 时，后面的监听器将不会收到该事情。

https://github.com/inhere/php-event-manager/blob/master/README.md)

## 如何使用

### 监听器

事件监听器类通过注解 `@Listener` 指定，其拥有两个属性：

- `event`：监听事件名称
- `priority`：监听器的优先级，数字越大优先执行

>  注意：监听类必须实现接口 `Swoft\Event\EventHandlerInterface`。

### 消费者

事件消费者类通过注解 `@Subscriber` 指定。

> 注意：消费者类必须实现接口 ` Swoft\Event\EventSubscriberInterface `。

### 监听器示例

```php
<?php declare(strict_types=1);

namespace SwoftTest\Event\Testing;

use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;

/**
 * Class TestHandler
 *
 * @Listener("test.evt")
 */
class TestHandler implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     */
    public function handle(EventInterface $event): void
    {
        $pos = __METHOD__;
        echo "handle the event '{$event->getName()}' on the: $pos\n";
    }
}
```

### 消费者示例

```php
<?php declare(strict_types=1);

namespace SwoftTest\Event\Testing;

use Swoft\Event\Annotation\Mapping\Subscriber;
use Swoft\Event\EventInterface;
use Swoft\Event\EventSubscriberInterface;
use Swoft\Event\Listener\ListenerPriority;

/**
 * Class TestSubscriber
 *
 * @Subscriber()
 */
class TestSubscriber implements EventSubscriberInterface
{
    public const EVENT_ONE = 'test.event1';
    public const EVENT_TWO = 'test.event2';

    /**
     * Configure events and corresponding processing methods (you can configure the priority)
     * @return array
     * [
     *  'event name' => 'handler method'
     *  'event name' => ['handler method', priority]
     * ]
     */
    public static function getSubscribedEvents(): array
    {
        return [
            self::EVENT_ONE => 'handleEvent1',
            self::EVENT_TWO => ['handleEvent2', ListenerPriority::HIGH],
        ];
    }

    public function handleEvent1(EventInterface $evt): void
    {
        $evt->setParams(['msg' => 'handle the event: test.event1 position: TestSubscriber.handleEvent1()']);
    }

    public function handleEvent2(EventInterface $evt): void
    {
        $evt->setParams(['msg' => 'handle the event: test.event2 position: TestSubscriber.handleEvent2()']);
    }
}
```

### 触发事件

> 事件名称建议放置在一个专用类的常量中，方便进行管理和维护。

1. 方式一，使用便捷，多个参数按顺序存入，因此只能通过索引获取：

   ```php
   Swoft::trigger('event name', 'target', $arg0, $arg1);
   
   // 获取
   $target = $event->getTarget();
   
   $arg0 = $event->getParam(0);
   $arg1 = $event->getParam(1);
   ```

2. 方式二，多个参数按键值对的方式存入，可根据 `key` 获取：

   ```php
   Swoft::triggerByArray('event name', 'target', [
       'arg0' => $arg0,
       'arg0' => $arg1
   ]);
   
   // 获取
   $target = $event->getTarget();
   
   $arg0 = $event->getParam('arg0');
   $arg1 = $event->getParam('arg1');
   ```

## Swoft 事件

Swoft 事件基于 Swoole 的回调处理扩展了一些可用 Server 事件，提供更加精细的操作空间。

> 完整事件列表请参阅 [ServerEvent.php](https://github.com/swoft-cloud/swoft-server/blob/master/src/ServerEvent.php) 文件。

### 基础事件

基础事件定义请参阅 [SwoftEvent.php](https://github.com/swoft-cloud/swoft-framework/blob/master/src/SwoftEvent.php) 文件。

### 使用示例

我们可以在 Swoole Server 启动前注册一个自定义进程，这样可以让进程由 Server 托管。

- 不需要执行 Start，在 Server 启动时会自动创建进程，并执行指定的子进程函数
- 在 Shutdown 关闭服务器时，会向用户进程发送 `SIGTERM` 信号以关闭用户进程
- 自定义进程会托管到 Manager 进程，如果发生致命错误，Manager 进程会自动重建

```php
<?php declare(strict_types=1);

namespace App\Listener;

use App\Process\MyProcess;
use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Server\ServerEvent;

/**
 * Class AttachMyProcessHandler
 *
 * @Listener(ServerEvent::BEFORE_START)
 */
class AttachMyProcessHandler implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     */
    public function handle(EventInterface $event): void
    {
        $swooleServer = $event->target->getSwooleServer();

        $process = bean(MyProcess::class);

        $swooleServer->addProcess($process->create());
    }
}
```

```php
<?php declare(strict_types=1);

namespace App\Process;

use Swoft\Event\Annotation\Mapping\Listener;
use Swoole\Process;

/**
 * Class MyProcess
 *
 * @Bean()
 */
class MyProcess
{
    public function create(): Process
    {
        return new Process([$this, 'handle']);
    }

    public function handle(Process $process)
    {
        CLog::info('MyProcess started.');

        // 用户进程实现了广播功能，循环接收管道消息，并发给服务器的所有连接
        while (true) {
            $msg = $process->read();
            foreach($server->connections as $conn) {
                $server->send($conn, $msg);
            }
        }
    }
}
```

## Swoole 事件

Swoole 文档中的每个事件，在 Swoft 里面均可监听，并且可以存在多个监听器。

### 事件常量

事件常量请参阅 [SwooleEvent.php](https://github.com/swoft-cloud/swoft-server/blob/master/src/SwooleEvent.php) 文件。

### 使用示例

```php
<?php declare(strict_types=1);

namespace App\Listener;

use ReflectionException;
use Swoft\Bean\Exception\ContainerException;
use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Log\Helper\CLog;
use Swoft\Server\Swoole\SwooleEvent;

/**
 * Class MasterStartListener
 *
 * @Listener(SwooleEvent::START)
 */
class MasterStartListener implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     *
     * @throws ReflectionException
     * @throws ContainerException
     */
    public function handle(EventInterface $event): void
    {
        CLog::info('Master started');
    }
}
```

## 自定义事件

更多自定义事件介绍参考：[https://github.com/inhere/php-event-manager/blob/master/README.md](

## 参与贡献

欢迎参与贡献，您可以

1. Fork 我们的组件仓库：[swoft/component](https://github.com/swoft-cloud/swoft-component)
2. 修改代码然后发送 PR
3. 阅读发送 PR 的 [注意事项](https://github.com/swoft-cloud/swoft/issues/829)