+++
# A Skills section created with the Featurette widget.
widget = "featurette"  # See https://sourcethemes.com/academic/docs/page-builder/
headless = true  # This file represents a page section.
active = true  # Activate this widget? true/false
weight = 20  # Order that this section will appear.

title = "框架特性"
subtitle = ""

# Showcase personal skills or business features.
# 
# Add/remove as many `[[feature]]` blocks below as you like.
# 
# For available icons, see: https://sourcethemes.com/academic/docs/widgets/#icons

[[feature]]
  icon = "code"
  icon_pack = "fas"
  name = "协程框架"
  description = "Swoft 是首个基于 Swoole 原生协程的注解式框架，自带常驻内存以及 Swoole 其它功能的封装。"
  
[[feature]]
  icon = "link"
  icon_pack = "fas"
  name = "连接池"
  description = "框架自带 Mysql/Redis/Rpc 高效连接池，且实现所有连接断线重连。开发者不用关心连接池，相应组件已经实现。"  
  
[[feature]]
  icon = "codepen"
  icon_pack = "fab"
  name = "切面编程"
  description = "框架容器管理的所有对象，都可以使用 AOP。使用AOP 可以使用在不改变实例内部的情况下，对实例对象的行为进行控制。"

  [[feature]]
  icon = "space-shuttle"
  icon_pack = "fas"
  name = "RPC"
  description = "RPC 服务分为 RPC Server 和 RPC Client，框架提供了类似 Dubbo 更为优雅的方式使用 RPC 服务"
  
[[feature]]
  icon = "database"
  icon_pack = "fas"
  name = "数据库"
  description = "数据提供模型 和 Builder 两种方式操作，数据库的封装高度兼容 Laravel，方便 Phper 快速切换到 Swoft"  
  
[[feature]]
  icon = "server"
  icon_pack = "fas"
  name = "微服务"
  description = "Swoft 完美与 Istio/Envoy 等 Service mesh 框架契合，同时还为中小型提供一套快速构建微服务治理组件，包括服务注册与发现、服务熔断、服务限流，以及配置中心。"

+++

首个基于 Swoole 原生协程的新时代 PHP 高性能协程全栈框架，内置协程网络服务器及常用的协程客户端，常驻内存，不依赖传统的 PHP-FPM，全异步非阻塞 IO 实现，以类似于同步客户端的写法实现异步客户端的使用，没有复杂的异步回调，没有繁琐的 yield, 有类似 Go 语言的协程、灵活的注解、强大的全局依赖注入容器、完善的服务治理、灵活强大的 AOP、标准的 PSR 规范实现等等，可以用于构建高性能的Web系统、API、中间件、基础服务等等。
