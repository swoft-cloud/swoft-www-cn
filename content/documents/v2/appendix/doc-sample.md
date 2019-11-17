+++
title = "文档示例"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 1205

[menu.v2]
  parent = "appendix"
  weight = 5
+++

组件功能介绍和使用场景

## 准备

了解组件，需要额外的知识

### 知识点1

### 知识点2

## 安装

通过 Composer 安装

```shell
composer require swoft/xxx
```

## 注解

### @XxxAnnotation

注解功能描述

- `arg` 注解功能描述
- `arg2` 注解功能描述

## 用法

以不同的使用场景，概括用法点，所有介绍切入点，都为使用场景。

### 实体

重要函数介绍格式

```php
// 全局函数格式
xxxx(int $a, int $b) : array 

// 静态函数格式，且必须加上完整类名
Xxx\Xxx::xx(int $a, int $b) : object 

// 对象方法格式
public function xxx(string $c) : int
```

函数功能介绍

- `$a` 参数介绍
- `$b` 参数介绍
- 返回值介绍

> 重要说明

函数xx用法

```php
    ......
```

函数xx用法

```php
    ......
```

**普通用法格式**

```php
$headers = $request->getHeaders();

foreach ($headers as $name => $values) {
    echo $name . ": " . implode(", ", $values).PHP_EOL;
}
```

> 重要说明

**命令介绍格式**

命令功能介绍，贴出帮助信息

```shell
$ php bin/swoft http
Provide some commands to manage the swoft HTTP Server

Group: http (alias: httpserver,httpServer,http-server)
Usage:
  bin/swoft http:COMMAND [--opt ...] [arg ...]

Global Options:
      --debug      Setting the application runtime debug level(0 - 4)
      --no-color   Disable color/ANSI for message output
  -h, --help       Display this help message
  -V, --version    Show application version information

Commands:
  reload    Reload worker processes
  restart   Restart the http server
  start     Start the http server
  stop      Stop the currently running server

Example:
 bin/swoft http:start     Start the http server
 bin/swoft http:stop      Stop the http server
```

选项列表：

- `--debug` 选项描述
- `-V` 选项描述

命令列表：

- `reload` 命令描述
- `restart` 命令描述

命令xx用法

```shell
php bin/swoft http:start
```

命令xx用法

```shell
php bin/swoft http:stop
```

> 重要说明

**Bean配置格式**

描述配置功能

```php
return [
    // ...
    'apollo' => [
        'host'    => '192.168.2.102',
        'timeout' => 6
    ]
    // ...
];
```

参数列表：

- `host` 参数功能描述
- `port` 参数功能描述

> 重要说明

**表结构格式**

表结构用于一些一系列的列表集合

| 名称 | 描述 |
| --- | --- |
| `ServerEvent::BEFORE_SETTING` | setting() 方法之前 |
| `ServerEvent::BEFORE_SETTING` | setting() 方法之前 |
| `ServerEvent::BEFORE_SETTING` | setting() 方法之前 |
| `ServerEvent::BEFORE_SETTING` | setting() 方法之前 |
