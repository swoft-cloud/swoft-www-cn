+++
title = "进程组件"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 606

[menu.v2]
  parent = "core-components"
  weight = 6
+++

Swoft 框架中封装了一套经常操作方式，替换 PHP 的 `pcntl`，PHP 自带的 `pcntl`，存在很多不足，如：

* `pcntl` 没有提供进程间通信的功能
* `pcntl` 不支持重定向标准输入和输出
* `pcntl` 只提供了 `fork` 这样原始的接口，容易使用错误

## 安装

Swoft 基于 Swoole 进程操作封装，功能与 Swoole 完全一样，建议开发者使用 Swoft 的封装操作，方便框架一起迭代升级。2.0.4+ 支持且需要安装 `swoft-process` 组件

```bash
composer require swoft/process
```

## 方法列表

所有操作在方法，全部在 `Swoft\Process\Process` 里面

* `new`
* `__construct`
* `start`
* `name`
* `exec`
* `write`
* `read`
* `setTimeout`
* `setBlocking`
* `useQueue`
* `statQueue`
* `freeQueue`
* `exportSocket`
* `push`
* `pop`
* `close`
* `exit`
* `kill`
* `wait`
* `daemon`
* `signal`
* `alarm`
* `setAffinity`

## 用户进程

`Http/RPC/Websocket/TCP` 等服务有些业务场景，需要一个后台运行进程去监控、上报或者其它特殊操作，此时可以在相应服务启动的时候，添加一个用户自定义工作进程，来实现。 自定义用户进程与服务一起启动，服务关闭一起退出，如果自定义用户进程被意外关闭，服务会重新启动一个新的自定义用户进程，保证自定义用户进程一直存在。

> 2.0.4+ 支持且需要安装 swoft-process 组件

### 声明用户进程

使用自定义用户进程之前，必须定义用户进程，如下定义一个监控上报信息的用户进程为例：

**示例：** 自定义用户进程入口。

```php
<?php declare(strict_types=1);

namespace App\Process;

use App\Model\Logic\MonitorLogic;
use Swoft\Bean\Annotation\Mapping\Bean;
use Swoft\Bean\Annotation\Mapping\Inject;
use Swoft\Db\Exception\DbException;
use Swoft\Process\Process;
use Swoft\Process\UserProcess;

/**
 * Class MonitorProcess
 *
 * @since 2.0
 *
 * @Bean()
 */
class MonitorProcess extends UserProcess
{
    /**
     * @Inject()
     *
     * @var MonitorLogic
     */
    private $logic;

    /**
     * @param Process $process
     *
     * @throws DbException
     */
    public function run(Process $process): void
    {
        $this->logic->monitor($process);
    }
}
```

* 自定义用户进程必须实现 `Swoft\Process\UserProcess` 接口
* 自定义用户进程必须使用 `@Bean` 标记为一个 `bean` 对象

**示例：** 业务处理。

```php
<?php declare(strict_types=1);

namespace App\Model\Logic;

use App\Model\Entity\User;
use Swoft\Bean\Annotation\Mapping\Bean;
use Swoft\Db\Exception\DbException;
use Swoft\Log\Helper\CLog;
use Swoft\Process\Process;
use Swoft\Redis\Redis;
use Swoole\Coroutine;

/**
 * Class MonitorProcessLogic
 *
 * @since 2.0
 *
 * @Bean()
 */
class MonitorLogic
{
    /**
     * @param Process $process
     *
     * @throws DbException
     */
    public function monitor(Process $process): void
    {
        $process->name('swoft-monitor');

        while (true) {
            $connections = context()->getServer()->getSwooleServer()->connections;
            CLog::info('monitor = ' . json_encode($connections));

            // Database
            $user = User::find(1)->toArray();
            CLog::info('user='.json_encode($user));

            // Redis
            Redis::set('test', 'ok');
            CLog::info('test='.Redis::get('test'));

            Coroutine::sleep(3);
        }
    }
}
```

{{%alert warning%}}
自定义用户进程里面，开发者必须实现类似 `while(true)` 的业务，且里面可以直接使用 Swoft 封装好的所有IO操作，比如数据库、缓存、RPC，以及其它非 Swoft 封装的协程操作
{{%/alert%}}

### 配置

定义好了用户进程，必须配置才会有效，`Http/RPC/Websocket/TCP` 服务配置自定义进程都一样，这里以如上自定义的用户进程配置为例：

```php
 return [
    'httpServer'     => [
            'class'    => HttpServer::class,
            'port'     => 18306,
            'listener' => [
                'rpc' => bean('rpcServer')
            ],
            'process' => [
                'monitor' => bean(MonitorProcess::class)
            ],
            // ...
        ],
 ];
 ```

 这里以注入的方式配置了一个自定义用户进程，名称为 `monitor`。

 > 如果配置成功，服务启动后，用户进程里面的业务会自动执行，无需其它操作。

## 进程池

进程池一般用于需要程序一直运行的场景，比如队列消费，数据计算。Swoft 框架中，基于 Swoole 进程池模型再次封装，便于开发者快速简单的使用进程池。

> 2.0.4+ 支持且需要安装 `swoft-process` 组件。

### 进程池配置

组件安装成功后，默认不需要配置也可以使用，配置如下：

`app/bean.php`

```php
return [
    'processPool' => [
        'class' => \Swoft\Process\ProcessPool::class,
        'workerNum' => 3
    ]
];
```

* `workerNum` worker 进程数
* `ipcType` IPC类型
* `coroutine` 是否开启协程，默认是开启

{{%alert warning%}}
Swoft 框架中必须是协程模式运行，协程模式运行下，可以使用 Swoft 封装的所有 IO 操作，以及其它非 Swoft 协程操作。
{{%/alert%}}

### @Process 注解

`@Process` 标记类是一个进程池处理流程

属性列表：

* `workerId` _int|array_ 绑定的进程ID,可以使单个或者数组。默认情况，是绑定到其它未绑定的进程。

### 声明工作进程

配置好之后，就是声明工作进程。如下已 `workerNum =3`，定义三个 `worker` 进程为例：

worker 进程1：

```php
<?php declare(strict_types=1);

namespace App\Process;

use Swoft\Log\Helper\CLog;
use Swoft\Process\Annotation\Mapping\Process;
use Swoft\Process\Contract\ProcessInterface;
use Swoole\Coroutine;
use Swoole\Process\Pool;

/**
 * Class Worker1Process
 *
 * @since 2.0
 *
 * @Process(workerId=0)
 */
class Worker1Process implements ProcessInterface
{
    /**
     * @param Pool $pool
     * @param int  $workerId
     */
    public function run(Pool $pool, int $workerId): void
    {
        while (true) {
            CLog::info('worker-' . $workerId);

            Coroutine::sleep(3);
        }
    }
}
```

* `worker` 进程必须实现 `Swoft\Process\Contract\ProcessInterface` 接口
* 开发者业务必须自己实现类似 `while(true)` 逻辑
* `@Process` 注解 `workerId=0` 表示第1个进程绑定这个处理逻辑流程

worker 进程2和进程3：

```php
<?php declare(strict_types=1);

namespace App\Process;

use App\Model\Entity\User;
use Swoft\Db\Exception\DbException;
use Swoft\Log\Helper\CLog;
use Swoft\Process\Annotation\Mapping\Process;
use Swoft\Process\Contract\ProcessInterface;
use Swoft\Redis\Redis;
use Swoole\Coroutine;
use Swoole\Process\Pool;

/**
 * Class Worker2Process
 *
 * @since 2.0
 *
 * @Process(workerId={1,2})
 */
class Worker2Process implements ProcessInterface
{
    /**
     * @param Pool $pool
     * @param int  $workerId
     *
     * @throws DbException
     */
    public function run(Pool $pool, int $workerId): void
    {
        while (true) {

            // Database
            $user = User::find(1)->toArray();
            CLog::info('user='.json_encode($user));

            // Redis
            Redis::set('test', 'ok');
            CLog::info('test='.Redis::get('test'));

            CLog::info('worker-' . $workerId.' context='.context()->getWorkerId());

            Coroutine::sleep(3);
        }
    }
}
```

* `worker` 进程必须实现 `Swoft\Process\Contract\ProcessInterface` 接口
* 开发者业务必须自己实现类似 `while(true)` 逻辑
* `@Process` 注解 `workerId={1,2}` 表示第2个进程和第3个进程，同时绑定这个处理逻辑流程

{{%alert note%}}
workerId 绑定ID 是从 0 开始算起, workerId 如果不写默认情况，当前程序流程绑定到其它未绑定的进程。
{{%/alert%}}

### 启动进程池

配置和声明工作进程完成后，就是启动进程池，启动进程池和其它服务启动很类似

前台启动

```bash
php bin/swoft process:start
```

后台启动

```bash
bin/swoft process:start -d

2019/07/16-09:44:34 [INFO] Swoft\SwoftApplication:setSystemAlias(496) Set alias @base=/data/www/swoft
 ... ...
 2019/07/16-09:44:44 [INFO] Swoft\Processor\ConsoleProcessor:handle(39) Console command route registered (group 13, command 40)
```

重启所有 worker 进程

```bash
php bin/swoft process:reload

2019/07/16-09:45:52 [INFO] Swoft\SwoftApplication:setSystemAlias(496) Set alias @base=/data/www/swoft
... ...
2019/07/16-09:45:59 [INFO] Swoft\Processor\ConsoleProcessor:handle(39) Console command route registered (group 13, command 40)
Server bin/swoft is reloading
Process pool bin/swoft reload success
```

停止服务

```bash
php bin/swoft process:stop  

2019/07/16-09:46:35 [INFO] Swoft\SwoftApplication:setSystemAlias(496) Set alias @base=/data/www/swoft
... ...
2019/07/16-09:46:45 [INFO] Swoft\Processor\ConsoleProcessor:handle(39) Console command route registered (group 13, command 40)
Stopping .. Successful!
```
