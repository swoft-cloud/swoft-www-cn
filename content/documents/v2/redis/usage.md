+++
title = "如何使用"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 802

[menu.v2]
  parent = "redis"
  weight = 2
  identifier = "redis-usage"

+++

## 基础运用

```php
Redis::set('user:profile:' . $id, "Swoft");

$userDesc = Redis::get('user:profile:' . $id);
```

你可以通过 `Redis::` 调用任何 Redis 命令。Swoft 使用魔术方法将命令传递给 Redis 服务端，因此只需传递 Redis 命令所需的参数即可。示例：

```php
Redis::set('name', 'Taylor');

$values = Redis::lrange('names', 5, 10);
```

所有方法和操作 `phpredis` 相同，本质是通过魔术方法代理访问的，让操作变得更简单。

当然普通的字符串内容不能满足我们的日常开发，你也可以使用数组：

```php
$data = [
    'Swoft' => [
        'id'   => 1,
        'desc' => 'Great Framework'
    ]
];

Redis::set($key, $data);
```

通过 `Redis::get()` 方法调用时，底层会自动反序列化，保证数据的 **一致性**。

有序集合 `zAdd` 使用示例：

```php
$scores = [
    'key1' => 11,
    'key3' => 11,
    'key4' => 11,
    'key2' => 21,
];

$result1 = Redis::zAdd('keys', $scores);
```

`Key` 为成员，`value` 为分数。

> **成员不可重复**。

## 连接池注入

示例：

```php
<?php declare(strict_types=1);

namespace App\Http\Controller;

use Swoft\Bean\Annotation\Mapping\Inject;
use Swoft\Http\Server\Annotation\Mapping\Controller;
use Swoft\Http\Server\Annotation\Mapping\RequestMapping;
use Swoft\Redis\Pool;
use Throwable;

/**
 *
 * @Controller("redis")
 */
class RedisController
{

    /**
     * 例子一：如果 Inject 没有参数则会使用 var 定义的类型
     *
     * @Inject()
     *
     * @var Pool 默认连接使用的是 redis.pool
     */
    private $redis;

    /**
     * 例子二：如果 Inject 指定参数，则使用指定的 pool 注入到该属性。和 var 定义的类型没关系
     *
     * @Inject("redis.inc.pool")
     *
     * @var Pool
     */
    private $redisInc;

    /**
     * @RequestMapping(route="find")
     *
     * @return array
     *
     * @throws Throwable
     */
    public function find(): array
    {
        $this->redis->set('user', ['name' => 'Swoft', 'age' => 2]);

        $this->redisInc->incrBy('user-count', 1);

        return $this->redis->get('user');
    }
}
```

你可以在中 `Inject` 指定使用的连接池，如果在 `Inject` 中没有指定将默认使用 `@var` 指定的类型注入。

## 连接池指定

所有的连接都通过连接池分配。使用自定义连接示例：

```php
$poolName = 'redis.pool-clusters';
$redis = Redis::connection($poolName);

$redis->get('a');
```

如何创建连接池请参考 [连接池配置](/documents/v2/redis/config/#连接池配置)，默认是连接池为 `redis.pool`。

> 如果 `Redis::connection()` 没有指定连接池，则会从默认连接池中获取连接。该方法返回 **连接** 而不是连接池。可以共享连接池但不能不能共享连接。

## 事件监听

### before

在 `Redis` 执行前 Swoft 底层会抛出 `RedisEvent::BEFORE_COMMAND` 事件。

```php
<?php declare(strict_types=1);

namespace App\Listener;

use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Redis\RedisEvent;

/**
 * Class FinishListener
 *
 * @since 2.0
 *
 * @Listener(event=RedisEvent::BEFORE_COMMAND)
 */
class RedisBeforeListener implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     */
    public function handle(EventInterface $event): void
    {
        [$method, $parameters] = $event->getParams();
    }
}
```

### after

在 `Redis` 执行后会抛出 `RedisEvent::AFTER_COMMAND` 事件。你可以监听命令的执行情况，如果在执行命令中出现异常则不会抛出 `RedisEvent::AFTER_COMMAND` 事件。

```php
<?php declare(strict_types=1);

namespace App\Listener;

use Swoft\Event\Annotation\Mapping\Listener;
use Swoft\Event\EventHandlerInterface;
use Swoft\Event\EventInterface;
use Swoft\Redis\RedisEvent;

/**
 * Class FinishListener
 *
 * @since 2.0
 *
 * @Listener(event=RedisEvent::AFTER_COMMAND)
 */
class RedisAfterListener implements EventHandlerInterface
{
    /**
     * @param EventInterface $event
     */
    public function handle(EventInterface $event): void
    {
        [$method, $parameters, $result] = $event->getParams();
    }
}
```

## 缓存命中率

如需查看某个 `key` 的获取命中情况，可以在你的 `notice` 日志中获取。前缀格式为 ` redis.hit/req....`，有助于你分析缓存命中率。



