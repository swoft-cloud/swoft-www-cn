+++
title = "任务组件"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 607

[menu.v2]
  parent = "core-components"
  weight = 7
+++

某些场景对主流程没有依赖，可以直接使用任务来实现类似这些功能。框架为开发者提供了 `协程` 和 `异步` 两种任务。切记无论是 `协程任务` 还是 `异步任务`，任务里面操作都 `只支持协程`，且只能使用框架封装的所有 `IO` 操作(数据库、缓存...)

* 协程任务投递任务的时候不会阻塞主进程相当于一次协程调用，一般用于需要等待任务结果返回的场景。
* 有些场景主流程并不关心的任务执行的结果，此时就可以使用异步任务。

## 配置

任务配置参数，可以直接在对应的 `Server->setting` 配置即可，如果要启用任务更简单，`Server` 新增一个 `on` 事件。

### 协程任务

Http Server 配置开启任务为例

```php
return [
    'httpServer' => [
        // ...
        'on'       => [
            SwooleEvent::TASK   => \bean(TaskListener::class),  // Enable task must task and finish event
            SwooleEvent::FINISH => \bean(FinishListener::class)
        ],
        /* @see HttpServer::$setting */
        'setting'  => [
            'task_worker_num'       => 12,
            'task_enable_coroutine' => true
        ]
    ],
]
```

* `task_enable_coroutine` 必须为 `true`
* `task` 事件和 `finish` 事件必须配置，且为 `TaskListener::class` 和 `FinishListener::class`

> 任务配置与启用，在 `Http Server / Rpc Server / Websocket Server` 都完全一样，启用任务需要监听 `task finish` 两个事件。

### 同步阻塞任务

Swoft 不仅提供 `协程任务`，并且支持 `同步任务`，`同步任务` 和 `协程任务` 只能选择一种运行，两种不能同时存在。同步任务只需配置 `task` 事件，不支持异步 `finish` 事件。官方建议使用 `协程任务` 实现业务， 如果需要通过任务实现 `MongoDB、PostgreSQL` 类似这种场景才使用同步任务。

> 2.0.4+ 支持

如下已 Http-server 为例：

```php
return [
    'httpServer' => [
        // ...
        'on'       => [
            SwooleEvent::TASK   => bean(SyncTaskListener::class),  // Enable sync task
        ],
        /* @see HttpServer::$setting */
        'setting'  => [
            'task_worker_num'       => 6,
            'task_enable_coroutine' => false
        ]
    ],
]
```

* `task_enable_coroutine` 必须设置为 `false`
* `task` 事件必须是 `SyncTaskListener::class`

{{%alert warning%}}
同步阻塞任务，不能直接使用框架提供的所有 IO 操作(数据库、缓存、RPC等等)以及应用日志，控制器日志可以使用。 同步阻塞任务的定义和使用与协程任务一样，但是没有上下文。
{{%/alert%}}

## 声明任务

使用任务前，必须定义任务，定义任务很简单。如下定一个任务：

```php
/**
 * Class TestTask
 *
 * @since 2.0
 *
 * @Task(name="testTask")
 */
class TestTask
{
    /**
     * @TaskMapping(name="list")
     *
     * @param int    $id
     * @param string $default
     *
     * @return array
     */
    public function getList(int $id, string $default = 'def'): array
    {
        return [
            'list'    => [1, 3, 3],
            'id'      => $id,
            'default' => $default
        ];
    }

    /**
     * @TaskMapping()
     *
     * @param int $id
     *
     * @return bool
     */
    public function delete(int $id): bool
    {
        if ($id > 10) {
            return true;
        }

        return false;
    }
}
```

### @Task 注解

标记类是一个任务

* `name` 指定任务名称，默认全路径类名

### @TaskMapping 注解

映射名称

* `name` 名称映射，默认就类的方法名称

{{%alert note%}}

1. 被 @Task 标记类的每个方法就是一个任务，如果方法没有使用 @TaskMapping 注解，不会解析成任务。
2. Task投递前，会经过 Swoft\Task\Packet::pack() 方法被json_encode，因此，投递entity时，task获得的是entity的数组。同时，投递无法被json_encode的参数会导致报错 （如果是异步任务且没有开启额外的日志，可能效果是task直接结束而没有报错信息）。
{{%/alert%}}

## 任务投递

### 协程任务投递

协程任务投递提供了两种方式，单个投递和批量投递，单个投递是在批量投递的基础之上封装的。如下协程任务投递(备注：`co/async` 方法第三个参数传递为数组，当任务声明的参数为数组时，`co/async` 第三个参数需要 `[[xxx,xxx,xxx]]`使用)

```php
Task::co(string $name, string $method, array $params = [], float $timeout = 3, array $ext = [])
```

单个任务投递，返回数据和任务方法返回的数据完全一致类型也一样

* `name` 投递任务任务名称
* `method` 投递任务的方法名称
* `params` 任务传递的参数即是任务方法的参数，数组格式传递
* `timeout` 超时时间，默认 `3s` 超时
* `ext` 任务扩展信息，会传递给任务进程里面


```php
// 任务格式
$tasks = [
    [
        'taskName',
        'method',
        ['params']
    ]
];

Task::cos(array $tasks, float $timeout = 3, array $ext = [])
```

多个任务投递

* `tasks` 多个任务集合，格式如上
* `timeout` 超时时间，默认 `3s` 超时
* `ext` 任务扩展信息，会传递给任务进程里面

**示例：** 协程任务投递

```php
use Swoft\Task\Task;

// 协程投递
$data = Task::co('testTask', 'list', [12]);

// 协程投递
$result = Task::co('testTask', 'delete', [12]);
```

#### 任务 Request

```php
namespace Swoft\Task;

class Request implements RequestInterface
{
   // ...
}
```

方法列表

* `getServer` 获取任务 Server 信息
* `getTaskId` 获取任务 ID，对应 Swoole 任务 ID
* `getSrcWorkerId` 任务来自的 workerId
* `getData` 投递任务的原始是数据
* `getName` 任务名称
* `getMethod` 任务方法
* `getParams` 任务参数
* `getExt` 任务扩展信息
* `getExtKey` 根据 key 快速获取用户信息
* `getType` 任务类型
* `getTaskUniqid` 任务全局唯一ID

### 异步任务投递

```php
Task::async(string $name, string $method, array $params = [], array $ext = [], int $dstWorkerId = -1, callable $fallback = null)
```

异步任务投递，返回一个全局唯一的任务ID

* `name` 投递任务任务名称
* `method` 投递任务的方法名称
* `params` 任务传递的参数即是任务方法的参数，数组格式传递
* `ext` 任务扩展信息，会传递给任务进程里面
* `dstWorkerId` 投递的进程 workerId，默认底层按需选择进程 workerId

异步任务一般用于不需要结果的场景且异步区执行，不影响主流程。如下异步任务投递：

```php
use Swoft\Task\Task;

$data = Task::async('testTask', 'list', [12]);

$data = Task::async('testTask', 'delete', [12]);
```

#### 异步任务结果

有很多情况不需要关注异步任务处理结果，但是也有部分场景需要关注异步任务处理结果，框架为开发者提供了一种事件监听的方式来处理异步任务结果。此事件和普通事件完全一样。如下定义是事件监听：

```php
use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Log\Helper\CLog;
use Swoft\Task\TaskEvent;

/**
 * Class FinishListener
 *
 * @since 2.0
 *
 * @Listener(event=TaskEvent::FINISH)
 */
class FinishListener implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     */
    public function handle(EventInterface $event): void
    {
        CLog::info(\context()->getTaskUniqid());
    }
}
```

* 事件必须监听 `TaskEvent::FINISH`
* 如果需要获取数据可以从上下文中获取，注意此时获取的是任务完成的上下文对象与任务上下对象不一样。

## 任务上下文

有些场景需要在任务里面拿到任务的详细信息，这些信息全部在上下文里面。此时可以使用全局函数 `context()` 获取 `Swoft\Task\TaskContext` 上下文对象。上下文提供两个方法，分别获取 `Swoft\Task\Request` 与 `Swoft\Task\Response` 对象，里面包含投递任务的所有信息。

```php
$request = context()->getRequest();
$response = context()->getRespone();
```

{{%alert note%}}
一定要在任务里面获取上下文，否则获取的是其它环境的上下文
{{%/alert%}}

### 异步任务完成上下文

在异步任务完成监听器里面可以通过 content() 全局函数获取上下文 Swoft\Task\FinishContext 对象。

```php
$taskData = context()->getTaskData();

$taskId = context()->getTaskId();

$taskUniqid = context()->getTaskUniqid();

$server = context()->getServer();
```

* `getTaskData` 任务处理的结果内容
* `getTaskId` 任务 ID，对应 Swoole 任务 ID
* `getTaskUniqid` 全局任务唯一ID，框架生成，与任务投递时的全局任务ID一样
* `getServer` 获取任务 Server 相关信息

## 定时任务

在某些情况下需要定时的去执行某些任务，通常我们会使用 Linux 系统自带的 Crontab 去定时的执行我们编写好的脚本，但是这样及其不方便，首先 Linux 系统默认的 Crontab 最小单位只能支持到分钟，无法支持秒级任务，其次，如果我们重新编写脚本，则不能很方便友好的复用框架内的资源，如 Mysql 连接资源，框架中的各种类库。针对以上问题，框架为我们内置了一个 Crontab 组件，可以支持秒级任务。

> 可用自 >= v2.0.5

### 安装

使用定时任务前，必须安装，安装如下

```bash
composer require swoft/crontab
```

### 注解

在 Swoft 中，定时任务的使用非常的简单，只需要使用相关注解定义你的任务类即可。

#### @Scheduled 注解

用于声明定时任务，如果是声明定时任务类，则必须使用此注解。

参数

* `name` 任务类的名称，为空则为此类的完整 `namespace` 路径。
使用示例：`@Scheduled()`、`@Scheduled("taskName")`、`@Scheduled(name="taskName")`

#### @Cron 注解

声明需要运行的方法，如果没有使用此注解，则该方法不会被运行。

参数

* `value` 任务的 `Crontab` 表达式，支持到秒

使用示例：`@Cron("* * * * * *")`、`@Cron(value="* * * * * *")`，表达式可简写，例如一个每秒都要执行的任务则可定义为 `@Cron("*")`

#### Cron格式说明

```php
*    *    *    *    *    *
-    -    -    -    -    -
|    |    |    |    |    |
|    |    |    |    |    +----- day of week (0 - 6) (Sunday=0)
|    |    |    |    +----- month (1 - 12)
|    |    |    +------- day of month (1 - 31)
|    |    +--------- hour (0 - 23)
|    +----------- min (0 - 59)
+------------- sec (0-59)
```

示例：

* `* * * * * *` 表示每秒执行一次。
* `0 * * * * *` 表示每分钟的第0秒执行一次，即每分钟执行一次。
* `0 0 * * * *` 表示每小时的0分0秒执行一次，即每小时执行一次。
* `0/10 * * * * *` 表示每分钟的第0秒开始每10秒执行一次。
* `10-20 * * * * *` 表示每分钟的第10-20秒执行一次。
* `10,20,30 * * * * *` 表示每分钟的第10,20,30秒各执行一次。

### 声明定时任务

在 Swoft 中使用定时任务相当的简单，只需两步操作，`声明定时任务` 和` 配置启用`，这两部操作都相当的简单，我们先来看声明任务。

```php
<?php declare(strict_types=1);

namespace App\Crontab;

use Swoft\Crontab\Annotaion\Mapping\Cron;
use Swoft\Crontab\Annotaion\Mapping\Scheduled;

/**
 * Class CronTask
 *
 * @since 2.0
 *
 * @Scheduled()
 */
class CronTask
{
    /**
     * @Cron("* * * * * *")
     */
    public function secondTask()
    {
        printf("second task run: %s ", date('Y-m-d H:i:s', time()));
    }

    /**
     * @Cron("0 * * * * *")
     */
    public function minuteTask()
    {
        printf("minute task run: %s ", date('Y-m-d H:i:s', time()));
    }

}
```

### 配置启用

定时任务的执行是基于 Swoft 的 `进程`,所以我们需要和使用 `用户进程` 的方式一样在配置中启用 `Crontab` 组件的自定义进程即可。

```php
 return [
    'httpServer'     => [
            // ...
            'process' => [
                'crontab' => bean(Swoft\Crontab\Process\CrontabProcess::class)
            ],
            // ...
        ],
 ];
 ```

 如上我们就配置成功了服务启动后，我们的定时任务进程也会随之启动。

### 手动执行

除了定时执行我们设置好的任务外，我们还可以在业务代码中直接手动执行我们的定时任务，方法如下。

```php
$crontab = BeanFactory::getBean("crontab");
$crontab->execute("testCrontab", "method");
```

通过 `Bean` 容器拿到 `crontab` 管理器，然后直接使用 `execute($beanName,$methodName)` 方法，此方法有两个参数,`$beanName` 就是传入在 `@Scheduled()` 注解中设置的名字，`$methodName` 则是传入 `@Scheduled()` 标注的类中，`@Cron()` 所标注的方法。
