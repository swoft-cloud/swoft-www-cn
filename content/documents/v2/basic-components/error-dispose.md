+++
title = "错误处理"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-11-2"
weight = 506

[menu.v2]
  parent = "basic-components"
  weight = 6
+++

[![Latest Stable Version](https://img.shields.io/packagist/v/swoft/error.svg)](https://packagist.org/packages/swoft/error)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)

GitHub: https://github.com/swoft-cloud/swoft-error](https://github.com/swoft-cloud/swoft-error)

## 简介

Swoft 拥有完善的异常错误处理机制，与 FPM 模式有所不同。Swoft 根据不同的场景类型将错误进行了区分。因此你无需关心在不同场景下的错误如何处理，只需实现对应场景的错误处理逻辑即可。Swoft 会自动调度对应的错误处理器。

## 安装

默认情况下错误处理组件已包含在 Swoft 框架中，如需单独安装只需执行下方命令：

```bash
composer require swoft/error
```

## 场景

场景类型的划分主要根据 Swoole 的回调事件范围来划分。

比如，**DB** 中抛出一个 `DbException`，在 HTTP 服务运行场景里你需对异常处理后返回一个 `Reponse` 对象即可。而在 CLI 等环境里，你可以只对异常做出相应处理，无需返回任何结果。

> 为何要进行划分？在不同的场景里，即使是同一个地方抛出的异常错误，处理方式也可能是不同的。

## 场景类型

Swoft 在 `Swoft\Error\ErrorType` 中定义了场景类型，参考：[ErrorType.php](https://github.com/swoft-cloud/swoft-error/blob/master/src/ErrorType.php) 文件。

现支持的场景：

- 控制台应用
- HTTP 服务应用
- RPC 服务应用
- TCP 服务应用
- WebSocket 服务应用

## 异常处理器

### 注解

我们通过 `@ExceptionHandler` 将类指定为异常处理器。相关属性：

- `exceptions`：定义需进行处理的异常类，需提供完整类名或在顶部 `use`

### 匹配逻辑

在同一个场景里，可以定义多个处理器来处理不同的异常：

- 异常发生时，首先会使用异常类完整匹配进行处理器查找，匹配成功则由处理器处理
- 完整匹配失败，检查异常类是否为已注册异常类的子类，如果是则选择第一个匹配的处理器进行处理
- 仍然匹配失败，交由系统默认处理

## HTTP Request 异常

定义异常处理器类时需继承 `Swoft\Http\Server\Exception\Handler\AbstractHttpErrorHandler`。

> 处理异常后必须返回 `Swoft\Http\Message\Response` 对象作为 HTTP 客户端响应。

### 使用示例

参考 `swoft/swoft` 项目内的 [HttpExceptionHandler.php](https://github.com/swoft-cloud/swoft/blob/master/app/Exception/Handler/HttpExceptionHandler.php) 文件。

## RPC 异常

定义异常处理器类时需继承 `Swoft\Rpc\Server\Exception\Handler\AbstractRpcServerErrorHandler`。

> 处理异常后必须返回 `Swoft\Rpc\Server\Response` 对象作为 RPC 客户端响应。

### 使用示例

参考 `swoft/swoft` 项目内的 [RpcExceptionHandler.php](https://github.com/swoft-cloud/swoft/blob/master/app/Exception/Handler/RpcExceptionHandler.php) 文件。

## WebSocket 异常

WebSocket 异常处理分为握手（Handshake）及消息（Message），分别需继承 `Swoft\WebSocket\Server\Exception\Handler\AbstractHandshakeErrorHandler` 和 `Swoft\WebSocket\Server\Exception\Handler\AbstractMessageErrorHandle`。

### 使用示例

参考 `swoft/swoft` 项目内的 [WsHandshakeExceptionHandler.php](https://github.com/swoft-cloud/swoft/blob/master/app/Exception/Handler/WsHandshakeExceptionHandler.php) 及 [WsMessageExceptionHandler.php](https://github.com/swoft-cloud/swoft/blob/master/app/Exception/Handler/WsMessageExceptionHandler.php) 文件。

## 使用说明

示例代码：

```php
class BusinessLogic 
{
    public function doSomething()
    {
        throw new BusinessException("Error Processing Request", 500);
    }
}
```

抛出异常时：

- 在 HTTP Request 场景下，将由 `HttpExceptionHandler` 处理
- 在 RPC Server 场景下，将由 `RpcExceptionHandler` 处理

> 上方处理器通过查找父类得到。我们也可以指定针对 `BusinessException` 异常的处理器，然后使用注解 `@ExceptionHandler(BusinessException::class)`。
>
> 通过示例我们可以看到，即使在同一地方抛出的异常，只要定义了不同场景的异常处理器就可以分别针对不同场景的请求（如上面的 HTTP 和 RPC）而作出不同的响应，无需进行额外的检查与判断。

## 参与贡献

欢迎参与贡献，您可以

1. Fork 我们的组件仓库：[swoft/component](https://github.com/swoft-cloud/swoft-component)
2. 修改代码然后发送 PR
3. 阅读 [提交代码](/documents/v2/contribute/sub-codes/) 的注意事项
