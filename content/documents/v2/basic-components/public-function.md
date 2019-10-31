+++
title = "公共方法"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-31"
weight = 505

[menu.v2]
  parent = "basic-components"
  weight = 5
+++

## 简介

框架中内置封装了一些公共函数，开发者在实际业务中可以直接使用，无需重复封装。其中包括：

- 协程函数
- 字符串函数
- 数组函数
- 验证函数

## 协程函数

### 创建协程

{{% alert warning %}}
Swoft 框架中不能使用 Swoole 提供的 `go` 函数创建协程，否则会造成请求和上下文丢失最终导致一些不可预估的问题。
{{% /alert %}}

Swoft 拥有两种方式创建协程：

1. 方式一
   
   ```php
    use Swoft\Co;
    
    Co::create(function () {
        // to do
    });
   ```

2. 方式二，通过助手函数 `sgo` 创建

   ```php
   sgo(function () {
       // todo
   });
   ```

{{% alert warning %}}

`sgo` 函数使用与 Swoole 中的 `go` 函数完全一致，**再次强调**，框架中只能使用 `sgo` 函数创建协程。

{{% /alert %}}

### 协程 ID

获取当前协程 ID，-1 为非协程环境：

```php
use Swoft\Co;

$id = Co::id();
```

### 顶级协程 ID

获取顶级（最外层）协程 ID：

```php
use Swoft\Co;

$id = Co::tid();
```

### 读文件

读取成功返回字符串内容，读取失败返回 `false`，可使用 `swoole_last_error` 获取错误信息。``readFile` 方法没有文件大小限制，读取的内容会存放在内存中，因此读取大文件时会占用大量内存。使用示例：

```php
use Swoft\Co;

$fileName = 'file.txt';
$data = Co::readFile($fileName);
```

参数说明：

- `$filename`：带完整路径的文件名称

### 写文件

写入成功返回 `true`，失败返回 `false`。使用示例：

```php
use Swoft\Co;

$fileName = 'file.txt';
$data = Co::writeFile($fileName, 'Swoft Framework');
```

参数说明：

- `$filename`：带完整路径的文件的名称，须有可写权限。文件不存在时会自动创建，打开文件失败会直接返回 `false`
- `$data`：写入内容，大小限制为 4M
- `$flags`：写入选项，默认值为 `FILE_USE_INCLUDE_PATH` 常量。可选值参考：[文件系统 - 预定义常量 - PHP Manual](https://www.php.net/manual/zh/filesystem.constants.php)

### 并发

框架底层通过协程通道，封装了一套混合 IO 并发操作的方法，一般用于没有依赖的多个流程。 

```php
<?php

use Co\Http\Client;
use Swoft\Co;

/**
 * Class CoTest
 *
 * @since 2.0
 */
class CoTest
{

    public function testMulti()
    {
        $requests = [
            'method' => [$this, 'requestMethod'],
            'staticMethod' => self::requestMehtodByStatic(),
            'closure' => function () {
                $cli = new Client('www.baidu.com', 80);
                $cli->get('/');
                $result = $cli->body;
                $cli->close();

                return $result;
            }
        ];

        $response = Co::multi($requests);
    }

    public function requestMethod()
    {
        $cli = new Client('www.baidu.com', 80);
        $cli->get('/');
        $result = $cli->body;
        $cli->close();

        return $result;
    }

    public static function requestMehtodByStatic()
    {
        $cli = new Client('www.baidu.com', 80);
        $cli->get('/');
        $result = $cli->body;
        $cli->close();

        return $result;
    }
}
```

并发执行结果按照 `requests` 数组中 `key` 对应关系返回。如果某个 `key` 对应的值为 `false`，意味着该操作执行失败。`requests` 内每个操作可执行的业务不存在上限，根据实际业务而定。

参数说明：

- `$requests`：多个操作集合。`requests` 支持多种格式
  - 对象方法
  - 对象静态方法
  - 闭包函数
- `$timeout`：超时时间，默认永不超时

## 读取文件

## 如何使用

如何使用

## 使用示例

使用示例
