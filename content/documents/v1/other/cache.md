+++
title = "常见问题"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 401

[menu.v1]
  parent = "other"
  weight = 1
+++
本章节会记录开发中常见和遇到的一些问题，大家若在开发中遇到的问题，也可以更新到这里。

## 安装与启动问题

### Fatal error: Maximum function nesting level of '1000' reached, aborting!

参考Swoole官方解决方法，[https://wiki.swoole.com/wiki/page/674.html](https://wiki.swoole.com/wiki/page/674.html)

## 运行问题

- 报错 `Class 'Swoole\Coroutine\Redis' not found`

> 请安装swoole前，先安装 `hiredis`。编译swoole时加上选项 `--enable-async-redis`

### RequestContext 是否需要手动销毁？

> `RequestContext(请求上下文)` 作为当前的请求信息的容器将贯穿整个请求生命周期，负责信息的储存和传递；

通常来说并不需要手动销毁，框架会在**请求结束**后自动销毁`RequestContext`内数据。

但如果你在应用中使用了以下功能，则必须在**请求结束**（**业务代码执行结束**）后手动调用`RequestContext::destroy()`销毁`RequestContext`内数据，否则长时间运行会出现**内存泄漏**问题！！！

- 自定义`TCP server`
- 自定义`UDP server` 
- 自定义`Websocket server`
- 自定义`定时器`

## 问题收集

- 是否支持连接池？

> db, redis，rpc 都是使用的连接池

- 通过RPC Controller 访问接口定义的方式时，底层是通过RPC的方式访问到具体的服务器实现？并且支持多点服务（如3个服务共同提供，类似负载平衡）？

> 是的

- 数据库，redis 密码含有特殊字符

> 当密码中含有特殊字符时，需先将密码部分urlencode一下，比如 `auth=W&AAA` 变换为 `auth=W%26AAA`
