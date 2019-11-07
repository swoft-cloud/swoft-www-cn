+++
title = "发布订阅"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 805

[menu.v2]
  parent = "redis"
  weight = 5
  identifier = "redis-pub-sub"

+++

## 简介

Redis 的列表类型键可以用来实现队列，并且支持阻塞式读取，所以 Redis 能够非常容易的实现一个高性能的优先队列。同时在更高层面上，Redis 还支持“发布/订阅”的消息模式，可以基于此构建一个聊天系统。

## 发布示例

发布（Publish）即将消息发布到频道中。示例代码：

```php
// 发送消息
Redis::publish('chan-1', 'Hello, World!');
// 发送消息
Redis::publish('chan-2', 'Hello, Swoft!');
```

参数说明：

- `$channel`：目标频道
- `$message`：消息内容

## 订阅示例

订阅（Subscribe）即从频道中接收消息。示例代码：

```php
function f($redis, $chan, $msg) {
    switch($chan) {
        case 'chan-1':
            // TODO:
            break;

        case 'chan-2':
            // TODO:
            break;

        case 'chan-2':
            // TODO:
            break;
    }
}

// 订阅 3 个频道
Redis::subscribe(['chan-1', 'chan-2', 'chan-3'], 'f');
```

参数说明：

- `$channels`：目标频道。字符串数组
- `$callback`：回调函数，接收 3 个参数
  - `$redis`：Redis 实例
  - `$chan`：频道名称
  - `$msg`：接收消息内容

### 匹配模式

使用 `psubscribe` 方法支持以通配符的方式订阅频道，可以用来获取所有所有频道上的消息。

```php
Redis::psubscribe(['*'], function ($redis, $pattern, $chan, $msg) {
    echo "Pattern: $pattern\n";
    echo "Channel: $chan\n";
    echo "Payload: $msg\n";
});

Redis::psubscribe(['users.*'], function ($redis, $pattern, $chan, $msg) {
   echo "Pattern: $pattern\n";
   echo "Channel: $chan\n";
   echo "Payload: $msg\n";
});
```

参数说明：

- `$patterns`：匹配规则数组
- `$callback`：回调函数，接收 4 个参数
  - `$redis`：Redis 实例
  - `$pattern`：匹配规则
  - `$chan`：频道名称
  - `$msg`：接收消息内容

## Socket 断连问题

由于订阅功能源自原生 `phredis`，使用过程中可能会有 Socket 断连问题，所以在开启发布订阅前应加大 PHP 配置中 `default_socket_timeout` 的值或设置为 `-1`（永不超时）。该值默认为 `60` 秒。

```php
ini_set('default_socket_timeout', -1);

Redis::psubscribe(['users.*'], function ($redis, $pattern, $chan, $msg) {
    echo "Pattern: $pattern\n";
    echo "Channel: $chan\n";
    echo "Payload: $msg\n";
});
```

> 关于 `default_socket_timeout`，请参考：[PHP: 运行时配置 - Manual](https://www.php.net/manual/zh/filesystem.configuration.php)。