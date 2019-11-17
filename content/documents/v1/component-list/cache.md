+++
title = "缓存"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 306

[menu.v1]
  parent = "component-list"
  weight = 6
+++
缓存按照 [PSR-16标准](https://github.com/php-fig/simple-cache) 实现，提供多种灵活的方式操作缓存。

## 缓存配置

缓存配置主要包括驱动配置和连接池配置。

### 驱动配置

缓存默认配置是redis，用户也可以在 `app/config/beans/base.php` 文件里面新增配置信息。

```php
return [
    // ......
    'cache'            => [
        'class' => \Swoft\Cache\Cache::class,
        'driver' => 'xxx',
        'drivers' => [
            'xxx' => \Swoft\Xxx::class
        ]
    ]
];
```

- class 可有可以无的，框架底层已经配置
- driver 当前缓存使用哪个驱动，默认是redis
- drivers 配置自定义驱动，key是驱动名称

### 连接池配置

连接池配置有 properties 和 env 两种方式，但是 env 配置会覆盖 properties。

### properties

`app/config/properties/cache.php` 配置文件

```php
return [
    'redis' => [
        'name'        => 'redis',
        'uri'         => [
            'tcp://127.0.0.1:6379?auth=password',
            'tcp://127.0.0.1:6379',
        ],
        'minActive'   => 8,
        'maxActive'   => 8,
        'maxWait'     => 8,
        'maxWaitTime' => 3,
        'maxIdleTime' => 60,
        'timeout'     => 8,
        'db'          => 1,
        'serialize'   => 0,
    ],
];
```

**参数说明：**

- name 连接池节点名称，用于服务发现
- uri 连接地址信息
- maxActive 最大活跃连接
- maxWait 最大等待连接
- minActive 最小活跃链接数
- maxIdleTime 连接最大空闲时间，单位秒
- maxWaitTime 连接最大等待时间，单位秒
- timeout 超时时间，单位秒
- serialize 是否序列化
- db 缓存数据库index

> TIPS: 当密码中含有特殊字符时，需先将密码部分urlencode一下，比如 `auth=W&AAA` 变换为 `auth=W%26AAA`

### env配置

.env 配置文件

```ini
REDIS_NAME=redis
REDIS_DB=2
REDIS_URI=127.0.0.1:6379,127.0.0.1:6379
REDIS_MIN_ACTIVE=5
REDIS_MAX_ACTIVE=10
REDIS_MAX_WAIT=20
REDIS_MAX_WAIT_TIME=3
REDIS_MAX_IDLE_TIME=60
REDIS_TIMEOUT=3
REDIS_SERIALIZE=1
```

- REDIS_NAME 连接池节点名称，用于服务发现
- REDIS_URI 连接地址信息
- REDIS_MIN_ACTIVE 最小活跃链接数
- REDIS_MAX_ACTIVE 最大活跃连接数
- REDIS_MAX_WAIT 最大等待连接
- REDIS_MAX_WAIT_TIME 连接最大等待时间，单位秒
- REDIS_MAX_IDLE_TIME 连接最大空闲时间，单位秒
- REDIS_TIMEOUT 超时时间，单位秒
- REDIS_SERIALIZE 是否序列化
- REDIS_DB 缓存数据库index

## Redis

Redis操作提高多种灵活方式，全局函数和对象操作方式，同时也支持延迟收包。

### 全局函数

通过全局函数操作缓存

```php
/**
 * @Controller(prefix="/redis")
 */
class RedisController
{
   
    public function testFunc()
    {
        $result = cache()->set('nameFunc', 'stelin3');
        $name   = cache()->get('nameFunc');

        return [$result, $name];
    }

    public function testFunc2()
    {
        $result = cache()->set('nameFunc2', 'stelin3');
        $name   = cache('nameFunc2');
        $name2   = cache('nameFunc3', 'value3');

        return [$result, $name, $name2];
    } 
}
```

- cache(string $key = null, $default = null) 如果参数都为默认值，会返回Cache对象，提供缓存操作。如果传入key参数，返回get缓存值，如果key不存在，返回default参数值

### 对象方式

通过注入Cache和Redis(驱动对象)，都可以操作缓存，唯一不同的是，Cache方式注入的对象，是使用配置的默认驱动。

```php
/**
 * @Controller(prefix="/redis")
 */
class RedisController
{
    /**
     * @Inject("cache")
     * @var Cache
     */
    private $cache;

    /**
     * @Inject()
     * @var \Swoft\Redis\Redis
     */
    private $redis;

    public function testCache()
    {
        $result = $this->cache->set('name', 'stelin');
        $name   = $this->cache->get('name');

        $this->redis->incr("count");

        $this->redis->incrBy("count2", 2);

        return [$result, $name, $this->redis->get('count'), $this->redis->get('count2')];
    }
}
```

- Cache和Redis(驱动对象)对象，操作方式都一样，里面提供了一系列的缓存操作函数。

### 延迟收包

延迟收包可以实现多IO并发执行，不仅仅是多个缓存IO，也可以mysql/rpc/http混合并发请求，有效的提升执行性能。

```php
/**
 * @Controller(prefix="/redis")
 */
class RedisController
{
    public function testDefer()
    {
        $ret1 = $this->redis->deferCall('set', ['name1', 'stelin1']);
        $ret2 = $this->redis->deferCall('set', ['name2', 'stelin2']);

        $r1 = $ret1->getResult();
        $r2 = $ret2->getResult();

        $ary = $this->redis->getMultiple(['name1', 'name2']);

        return [$r1, $r2, $ary];
    }
}
```

- 暂时只能提供一个统一的函数deferCall，实现延迟收包操作，接下来会新增deferXxx函数，实现对应延迟收包操作函数。

### 多实例Redis

配置一个Redis实例，需要新增一个实例连接池和连接池配置，然后通过bean，配置新增的redis实例

### 新增连接池和配置

**连接池配置**    

继承默认RedisPoolConfig，可以配置部分或全部信息，重新父类配置信息属性。

``` php
/**
 * DemoRedisPoolConfig
 *
 * @Bean()
 */
class DemoRedisPoolConfig extends RedisPoolConfig
{
    /**
     * @Value(name="${config.cache.demoRedis.db}", env="${REDIS_DEMO_REDIS_DB}")
     * @var int
     */
    protected $db = 0;

    /**
     * @Value(name="${config.cache.demoRedis.prefix}", env="${REDIS_DEMO_REDIS_PREFIX}")
     * @var string
     */
    protected $prefix = '';
}
```

**连接池**    

继承RedisPool，重新注入配置信息

``` php
/**
 * DemoRedisPool
 *
 * @Pool("demoRedis")
 */
class DemoRedisPool extends RedisPool
{
    /**
     * @Inject()
     * @var DemoRedisPoolConfig
     */
    public $poolConfig;
}
``` 

### 配置Bean

bean文件里面新增一个redis实例bean名称，app/config/beans/base.php

```php
return [
    // ......
    'demoRedis' => [
        'class' => \Swoft\Redis\Redis::class,
        'poolName' => 'demoRedis'
    ]
    // ......
];

```

### 使用新实例

使用@Inject，注入配置的redis实例，使用没有任何区别，只是配置信息发生了变化

```php

class Demo
{
    /**
     * @Inject("demoRedis")
     * @var \Swoft\Redis\Redis
     */
    private $demoRedis;

    public function testDemoRedis()
    {
        $result = $this->demoRedis->set('name', 'swoft');
        $name   = $this->demoRedis->get('name');

        $this->demoRedis->incr('count');
        $this->demoRedis->incrBy('count2', 2);

        return [$result, $name, $this->demoRedis->get('count'), $this->demoRedis->get('count2'), '3'];
    }
}
```
