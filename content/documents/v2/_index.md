+++
# Course title, summary, and position.
linktitle = "v2文档"
summary = "Swoft v2.x 教程手册"
weight = 1

# Page metadata.
title = "SWOFT" #本篇页面的标题，同时网页标题栏也会更改，SEO影响较大属于是 网页 title 属性
date = "2018-09-09T00:00:00Z"
lastmod = "2019-10-23T00:00:00Z"
draft = false  # 是否是草稿 true/false 
toc = false  # 是否现实目录 true/false 每页右侧的悬浮目录
type = "docs"  # 不要修改.

# 添加菜单到.
# - name: 此篇文章ID值.
# - parent: 此篇文章的父ID归属于`name`值.
# - weight: 此篇文章的排序权重.
+++
[![Latest Stable Version](http://img.shields.io/packagist/v/swoft/swoft.svg)](https://packagist.org/packages/swoft/swoft)
[![Build Status](https://travis-ci.org/swoft-cloud/swoft.svg?branch=master)](https://travis-ci.org/swoft-cloud/swoft)
[![Docker Build Status](https://img.shields.io/docker/build/swoft/alphp.svg)](https://hub.docker.com/r/swoft/swoft/)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoole Version](https://img.shields.io/badge/swoole-%3E=4.4.1-brightgreen.svg?maxAge=2592000)](https://github.com/swoole/swoole-src)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)
[![Gitter](https://img.shields.io/gitter/room/swoft-cloud/swoft.svg)](https://gitter.im/swoft-cloud/community)

<pre style="background-color:#1e1e1e;text-align:center;">
      ___            ___            ___            ___                
     /  /\          /__/\          /  /\          /  /\         ___   
    /  /:/_        _\_ \:\        /  /::\        /  /:/_       /  /\  
   /  /:/ /\      /__/\ \:\      /  /:/\:\      /  /:/ /\     /  /:/  
  /  /:/ /::\    _\_ \:\ \:\    /  /:/  \:\    /  /:/ /:/    /  /:/   
 /__/:/ /:/\:\  /__/\ \:\ \:\  /__/:/ \__\:\  /__/:/ /:/    /  /::\   
 \  \:\/:/~/:/  \  \:\ \:\/:/  \  \:\ /  /:/  \  \:\/:/    /__/:/\:\  
  \  \::/ /:/    \  \:\ \::/    \  \:\  /:/    \  \::/     \__\/  \:\ 
   \__\/ /:/      \  \:\/:/      \  \:\/:/      \  \:\          \  \:\
     /__/:/        \  \::/        \  \::/        \  \:\          \__\/
     \__\/          \__\/          \__\/          \__\/               
</pre>

Swoft 是首个基于 Swoole 原生协程的新时代 PHP 高性能协程全栈框架，内置协程网络服务器及常用的协程客户端，常驻内存，不依赖传统的 PHP-FPM，全异步非阻塞 IO 实现，以类似于同步客户端的方式实现异步客户端。框架没有复杂的异步回调，没有繁琐的 `yield`，拥有类似 Go 语言的协程、灵活的注解、强大的全局依赖注入容器、完善的服务治理、AOP、标准的 PSR 规范实现等，可用于构建高性能的 Web 系统、API、中间件、基础服务。

- 基于 **Swoole** 扩展
- 内置协程网络服务器（HTTP/WebSocket/RPC/TCP）
- 高性能路由
- 强大的 **AOP**（面向切面编程）
- 灵活的注解功能
- 全局的依赖注入容器
- 基于 `PSR-7` 的 HTTP 消息实现
- 基于 `PSR-11` 的容器规范实现
- 基于 `PSR-14` 的事件管理器
- 基于 `PSR-15` 的中间件
- 基于 `PSR-16` 的缓存设计
- 可扩展的高性能 **RPC**
- **RESTful** 支持
- 国际化（i18n）支持
- 快速灵活的参数验证器
- 完善的服务治理，熔断、降级、负载、注册与发现
- 通用连接池 MySQL、Redis、RPC
- 数据库 **ORM**
- 协程、异步任务投递
- 自定义用户进程
- 强大的日志系统

{{% alert note %}}
更多组件及其用法，请看文档
{{% /alert %}}

## 关于 Swoft

Swoft 是基于 Swoole 的企业级 PHP 应用程序开发框架，大量开发人员使用 Swoft Framework 来创建高性能、易于测试和可重用的代码。

Swoft 开源框架自 2018 年 3 月 6 日发布以来，我们秉承简单、高效、稳定的宗旨持续迭代升级。伴随着 `1.x` 的开发迭代和 Swoole 4 全协程化，`1.x` 的底层架构已经不再合适，所以在 2018 年 11 月开始规划 `2.x`。新版本底层借鉴 `1.x` 的经验全部重写，采用 Swoole Hook 全协程化，整体相比 `1.x` 更易上手，稳定性也更高。

Swoft 是一款轻量级的框架，所有组件均可以自定义且支持按需加载使用。

Swoft 框架可用于开发任何 Web 应用程序，构建高性能的 Web 系统、API、中间件、基础服务等。

## 优势

Swoft Framework 的优点：

- 以组件化方式开发，开发者可以自定义组件并按需加载使用
- 良好 Web MVC 设计，它为 Web 开发框架提供了一个很好的选择
- PHP 开发者可快速上手，数据库、缓存的使用均高度兼容 **Laravel**
- 所有组件严格通过单元测试及压力测试

## 社区

Swoft 官方 QQ 群 1：548173319

Swoft 官方2群：778656850

Swoft 社区：[https://learnku.com/swoft](https://learnku.com/swoft)

## 支持

您的支持是对开发组的最大鼓励，您可以通过以下方式来支持我们。

- [赞助](/donation/)
- [参与贡献](/documents/v2/contribute/sub-questions/)
