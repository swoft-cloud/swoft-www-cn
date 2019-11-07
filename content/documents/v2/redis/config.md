+++
title = "配置"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 801

[menu.v2]
  parent = "redis"
  weight = 1
  identifier = "redis-config"

+++

[![Latest Stable Version](https://img.shields.io/packagist/v/swoft/redis.svg)](https://packagist.org/packages/swoft/redis)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)

GitHub: [https://github.com/swoft-cloud/swoft-redis](https://github.com/swoft-cloud/swoft-redis)

## 安装

Redis 组件需独立安装：

```bash
composer require swoft/redis
```

## 基础配置

Redis 配置与数据库配置相同，位于 `app/bean.php` 文件，配置的 `redis` 也是一个 `bean` 对象。

```php
return [
    'redis' => [
        'class' => Swoft\Redis\RedisDb::class,
        'host' => '127.0.0.1',
        'port' => 6379,
        'password' => '',
        'database' => 0,
        'retryInterval' => 10,
        'readTimeout' => 0,
        'timeout' => 10,
        'option' => [
            'prefix' => 'Swoft',
            'serializer' => Redis::SERIALIZER_PHP
        ]
    ]
]
```
配置项说明：

- `class`：Redis 驱动类。默认为 Swoft Redis 驱动，自定义时需指定，参考：
- `host`：Redis 连接地址，默认为 `127.0.0.1`
- `port`：Redis 连接端口，默认为 `6379`
- `password`：Redis 连接密码，默认为空
- `database`：指定 Redis 库，默认为 `0`
- ` retryInterval `：重试间隔，默认为 `10` 秒
- ` readTimeout `：读取超时时间，默认为 `0` 秒，永不超时
- ` timeout `：连接超时时间，默认为 `0` 秒，永不超时
- ` option `：Redis 额外配置
  - ` prefix `：存储前缀，默认为空
  - ` serializer `：序列器，支持以下四种方式。不使用请设置为 `Redis::SERIALIZER_NONE` 或 `0`。
    1. `Redis::SERIALIZER_PHP`：PHP 默认序列器
    2. `Redis::SERIALIZER_IGBINARY`：需安装 **Igbinary** 扩展并启用
    3. `Redis::SERIALIZER_MSGPACK`：需安装 **MessagePack** 扩展并启用
    4. `Redis::SERIALIZER_JSON`：需安装 **Json** 扩展（一般情况下默认已安装并启用）

## 集群配置

集群配置与基础配置同样配置于 `app/bean.php` 文件。集群配置增加了 `clusters`，连接机制会优先使用 **集群配置**，不存在集群配置时才会使用的普通配置。

```php
'redis' => [
    'class'  => Swoft\Redis\RedisDb::class,
    'option' => [
        'timeout'    => 3,
        'persistent' => true
    ],
    'clusters' => [
         [
             'host'         => '127.0.0.1',
             'port'         => 6379,
             'password'     => '123456',
             'database'     => 1,
             'prefix'       => 'Swoft',
             'read_timeout' => 10
        ]
    ]
]
```

配置项说明：

- `class`：Redis 驱动类。默认为 Swoft Redis 驱动，自定义时需指定，参考
- `option`：集群配置项
  - `timeout`：连接超时时间，默认为 `0` 秒
  - `persistent`：是否启用持久化连接，默认为 `false` 不启用
- `clusters`：集群节点
  - `host`：Redis 连接地址
  - `port`：Redis 连接端口
  - `password`：Redis 连接密码
  - `database`：Redis 库
  - `prefix`：存储前缀
  - `read_timeout`：读取超时时间

> 集群不存在序列化配置。

## 连接池配置

连接池适合需使用不同的 Redis 库或不同节点等场景。连接池的配置同样在 `app/bean.php` 文件。

{{% alert warning %}}

注意：每一个 Worker 都会创建一个同样的连接池，连接池并不是越多越好，需根据服务器配置和和 Worker 数量权衡。

{{% /alert %}}

### 集群连接池配置

```php
'redis-clusters' => [
    'class'  => Swoft\Redis\RedisDb::class,
    'option' => [
        'timeout'    => 10,
        'persistent' => true
    ],
    'clusters' => [
        [
            'host'         => '127.0.0.1',
            'port'         => 6379,
            'password'     => '123456',
            'database'     => 1,
            'prefix'       => 'Swoft-Clusters',
            'read_timeout' => 1
        ]
    ]
],
'redis.clusters-pool' => [
    'class'       => Swoft\Redis\Pool::class,
    'redisDb'     => bean('redis-clusters'),
    'minActive'   => 10,
    'maxActive'   => 20,
    'maxWait'     => 0,
    'maxWaitTime' => 0,
    'maxIdleTime' => 40
]
```

连接池配置项说明：

- `class`：连接池驱动类，仅自定义时需指定。默认为 Swoft 连接池驱动
- `redisDb`：指定 Redis 配置
- `minActive`：最少连接数
- `maxActive`：最大连接数
- `maxWait`：最大等待连接数，默认为 `0` 无限制
- `maxWaitTime`：连接最大等待时间，默认为 `0` 秒无限制
- `maxIdleTime`：连接最大空闲时间，单位秒

集群连接池运用示例：

```php
Redis::connection('redis.clusters-pool')->get($key);
```

### 普通连接池配置

```php
'redis-2' => [
    'class'         => Swoft\Redis\RedisDb::class,
    'host'          => '10.0.0.2',
    'port'          => 6379,
    'database'      => 1,
    'retryInterval' => 10,
    'readTimeout'   => 0,
    'timeout'       => 2,
    'option'        => [
        'prefix'     => 'Swoft',
        'serializer' => Redis::SERIALIZER_PHP
    ]
],
'redis.pool-2' => [
    'class'       => Swoft\Redis\Pool::class,
    'redisDb'     => bean('redis-2'),
    'minActive'   => 10,
    'maxActive'   => 20,
    'maxWait'     => 0,
    'maxWaitTime' => 0,
    'maxIdleTime' => 60,
]
```

连接池配置项说明：

- `class`：连接池驱动类，仅自定义时需指定。默认为 Swoft 连接池驱动
- `redisDb`：指定 Redis 配置
- `minActive`：最少连接数
- `maxActive`：最大连接数
- `maxWait`：最大等待连接数，默认为 `0` 无限制
- `maxWaitTime`：连接最大等待时间，默认为 `0` 秒无限制
- `maxIdleTime`：连接最大空闲时间，单位秒

更换默认连接池中的连接配置：

```php
'redis.pool' => [
    'class'   => Swoft\Redis\Pool::class,
    'redisDb' => bean('redis-custom')
]
```

之后对 Redis 后的操作所使用的连接为 `redis-custom`：

```php
Redis::set($key, ['name' => 'Swoft']);
```

