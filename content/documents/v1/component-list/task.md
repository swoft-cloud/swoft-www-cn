+++
title = "任务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 312

[menu.v1]
  parent = "component-list"
  weight = 12
+++
任务分为类似Swoole的普通任务和定时任务(无需依赖crontab)。

> 组件依赖 `swoole_table`, 遍历 Table 依赖 `pcre` 如果发现无法遍历table,检查机器是否安装 `pcre-devel`

## 任务投递类型

任务投递，分为协程投递和异步投递，不同的是异步投递任务结果，需要监听一个onFinish事件，完成对结果的处理。

## 任务类型

任务类型分为普通任务和定时任务两大类。

## 任务配置

任务配置主要包括，任务扫描路径和是否开启定时任务配置

### 定时任务开关

配置是否开启定时任务，.env

```php
CRONABLE=false
```

## 定义任务

一个类就是一个任务组，类里面的每个方法，就是一个任务。

### 注解

**@Task**

- name 定义任务名称，缺省时类名，用于投递任务，且必须唯一
- coroutine 是否启动一个协程运行业务逻辑，缺省是false (由于Swoole的TaskWorker尚不支持运行协程代码，顾此选项目前仅做预留)

### 实例

```php
/**
 * @Task("demo")
 */
class DemoTask
{

    /**
     * Deliver coroutine task
     */
    public function coroutineJob(string $p1, string $p2): string
    {
        return sprintf('co-%s-%s', $p1, $p2);
    }

    /**
     * Deliver async task
     */
    public function asyncJob(string $p1, string $p2)
    {
        // Do anything you want.
        return sprintf('async-%s-%s', $p1, $p2);
    }
}
```

> 任务逻辑里面可以使用 Swoft 所有功能，唯一不一样的是，如果任务不是协程模式运行，所有I/O操作，框架底层会自动切换成传统的同步阻塞，但是使用方法是一样的。

## 任务投递

任务可投递协程和异步，如果是异步需要定义监听器，处理任务执行结果数据。

实例

```php
use Swoft\Task\Task;

$result  = Task::deliver('demo', 'coroutineJob', ['p1', 'p2'], Task::TYPE_CO);
$result  = Task::deliver('demo', 'asyncJob', ['p1', 'p2'], Task::TYPE_ASYNC);
```

- 参数一，定义投递任务组名称，与 `@Task` 注解定义的名称(`name`)关系对应。
- 参数二，定义投递任务的名称，与类里面方法名称对应
- 参数三，任务方法的参数，数组方式传递
- 参数四，定义投递任务类型，仅 `Task::TYPE_CO` 和 `Task::TYPE_ASYNC` 两个可选项

### 异步任务监听器

事件监听器必须监听，`TaskEvent::FINISH_TASK`事件。

```php
use Swoft\Bean\Annotation\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Task\Event\TaskEvent;

/**
 * @Listener(TaskEvent::FINISH_TASK)
 */
class TaskFinish implements EventHandlerInterface
{

    public function handle(EventInterface $event)
    {
        var_dump("task finish! ", $event->getParams());
    }
}
```

## 定时任务

传统的 Crontab 是外部调命令执行一个独立进程，Swoft 提供的 Crontab 相当于一个代码任务定时器，定时规则和 Linux 系统下的 Crontab 规则一致，兼容所有语法。区别在于 Linux 系统下的Crontab 的最小单位为分级，Swoft 的 Crontab 的规则支持到最小单位为秒级。

**@Scheduled**

- cron 定义定时任务执行时间格式，类似linux crontab，单位精确到秒

### cron格式

```

0     1    2    3    4    5
*     *    *    *    *    *
-     -    -    -    -    -
|     |    |    |    |    |
|     |    |    |    |    +----- day of week (0 - 6) (Sunday=0)
|     |    |    |    +----- month (1 - 12)
|     |    |    +------- day of month (1 - 31)
|     |    +--------- hour (0 - 23)
|     +----------- min (0 - 59)
+------------- sec (0-59)

```

### 定时任务实例

```php
/**
 * Demo task
 *
 * @Task("demo")
 */
class DemoTask
{
    /**
     * crontab定时任务
     * 每一秒执行一次
     *
     * @Scheduled(cron="* * * * * *")
     */
    public function cronTask()
    {
        echo time() . "每一秒执行一次  \n";
        return 'cron';
    }

    /**
     * 每分钟第3-5秒执行
     *
     * @Scheduled(cron="3-5 * * * * *")
     */
    public function cronooTask()
    {
        echo time() . "第3-5秒执行\n";
        return 'cron';
    }
}
```

> 注意事项 定时任务所在的Task类注解coroutine不能为true

> 定时任务和普通任务是一样的，唯一不同的是，定时任务，到达时间点自动执行，无需手动投递任务。
