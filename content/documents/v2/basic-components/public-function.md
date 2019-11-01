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
- 数组函数
- 目录（文件夹）函数
- 环境函数
- 文件函数
- 文件系统函数
- 对象函数
- PHP 助手函数
- 字符串函数
- 系统函数
- XML 函数
- 通用函数

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

## 数组函数

数组函数需引入 `Swoft\Stdlib\Helper\Arr` 或 `Swoft\Stdlib\Helper\ArrayHelper`，详情参阅：[ArrayHelper.php](https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/ArrayHelper.php) 文件。

## 目录函数

目录函数包括创建、遍历目录内容等，需引入 `Swoft\Stdlib\Helper\Dir` 或 `Swoft\Stdlib\Helper\DirHelper` 或 `Swoft\Stdlib\Helper\DirectoryHelper`。目录函数继承自文件系统函数，详情参阅：[DirectoryHelper.php](https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/DirectoryHelper.php) 文件。

## 环境函数

环境函数主要用于获取当前运行环境，其中包括：

```php
use Swoft\Stdlib\Helper\EnvHelper;

// 是否运行在 CLI 模式
EnvHelper::isCli();

// 是否运行在 PHP Debug 模式
EnvHelper::isPhpDbg();

// 当前运行环境是否为 Windows
EnvHelper::isWin();
EnvHelper::isWindows();

// 当前运行环境是否为 macOS
EnvHelper::isMac();
```

## 文件函数

文件函数用于获取文件后缀、扩展及 MIME 类型，其中包括：

```php
use Swoft\Stdlib\Helper\FileHelper;

$fileName = '/opt/file.txt';

// 获取文件后缀，$clearPoint 为 true 时不返回带“.”的后缀
FileHelper::getSuffix($fileName, true);

// getExt 方法为 getExtension 方法别名
// 该方法与 getSuffix 方法作用相同
FileHelper::getExt($fileName, true);
FileHelper::getExtension($fileName, true);

// 获取文件 MIME 类型，文本会返回 text/plain
FileHelper::mimeType($fileName);
```

## 文件系统函数

文件系统函数需引入 `Swoft\Stdlib\Helper\FSHelper`。详情参阅：[FSHelper]( https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/FSHelper.php ) 文件。

## 对象函数

对象函数用于相关对象操作，其中包括：

```php
use Swoft\Stdlib\Helper\ObjectHelper;

// 获取对象哈希值
ObjectHelper::hash($object);

// 向对象设置或新增属性
ObjectHelper::init($object, $options = ['name' => 'Swoft']);

// 解析参数类型
ObjectHelper::parseParamType('int', $object);

// 获取属性基本数据类型
ObjectHelper::getPropertyBaseType($property);

// 获取数据类型默认值
ObjectHelper::getDefaultValue('int');
```

## PHP 助手函数

PHP 助手函数扩展了一些原生函数，需引入 `Swoft\Stdlib\Helper\PhpHelper`。详情参阅：[PhpHelper.php](https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/PhpHelper.php) 文件。

## 字符串函数

字符串函数内容过多，需引入 `Swoft\Stdlib\Helper\Str` 或 `Swoft\Stdlib\Helper\StringHelper`。详情参阅：[StringHelper.php](https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/StringHelper.php) 文件。

## 系统函数

系统函数用于运行命令及获取系统相关信息等操作，需引入 `Swoft\Stdlib\Helper\Sys` 或 `Swoft\Stdlib\Helper\SystemHelper`。详情参阅：[SystemHelper.php](https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/SystemHelper.php) 文件。

## XML 函数

XML 函数用于编解码 XML 数据、与数组互转、解析等操作，需引入 `Swoft\Stdlib\Helper\XmlHelper`。详情参阅 [XmlHelper.php](https://github.com/swoft-cloud/swoft-stdlib/blob/master/src/Helper/XmlHelper.php) 文件。

## 通用函数

### alias

获取路径别名。

```php
function alias(string $key): string
```

### bean

从容器中获取 bean 对象，等同于 `Swoft::getBean();`。

```php
function bean(string $key): object
```

### config

获取应用配置值。

```php
function config(string $key, $default = null): mixed
```

### container

获取容器对象。

```php
function container(): Container
```

### context

获取上下文对象。

```php
function context(): ContextInterface
```

### env

获取环境变量值。

```php
function env(string $key = null, $default = null): mixed
```

### event

获取事件管理器。

```php
function event(): EventManager
```

### fnmatch

文件名正则匹配。

```php
function fnmatch(string $pattern, string $string): bool
```

### printr

打印数据，类似 `print_r`，允许多参数。

```php
function printr(...$vars): void
```

### server

获取服务实例，包括 HTTP Server 和 WebSocket Server。

```php
function server(): Server
```

### sgo

开启新协程。

```php
function sgo(callable $callable, bool $wait = true): void
```

### srun

启动协程并等待执行结束。

```php
function srun(callable $callable): bool
```

### tap

向指定值调用闭包函数，然后返回该值。

```php
function tap($value, Closure $callback = null): mixed
```

### validate

数据验证。

```php
function validate(array $data, string $validatorName, array $fields = [], array $userValidators = []): array
```

### value

获取回调结果。

```php
function value($value): mixed
```

### vdump

转储数据，与 `var_dump` 类似。不同处在于 `vdump` 会增加一行打印位置提示。