+++
title = "Session"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 309

[menu.v1]
  parent = "component-list"
  weight = 9
+++

## 简介

Session 组件提供 HTTP 服务下的 Session 会话支持，目前仅实现了 Redis 驱动下的 Session 储存支持，由于 Swoft 的设计理念更倾向于分布式和集群，所以我们并不建议使用文件的方式来进行会话储存

## 依赖

1. PHP 7.0 +
2. Swoft Framework 1.0 beta +
3. Swoole 2.0.11 +

## 贡献组件代码

1. Session 组件使用 PSR-1, PSR-2, PSR-4 标准;  
2. Session 组件有 PHP 7.0 的最低版本限制，除非有条件地使用该特性，否则 Pull Request 不允许有比 PHP 7.0 更大的PHP版本的语言特性;
3. 所有的 Pull Request 都必须包含相对于的单元测试，以确保更改能够正常工作。  

## 运行测试

Session 组件使用 PHPUnit 来作为单元测试的支持，可以直接使用 PHPUnit 本身的命令来运行测试，或使用组件提供的 Composer 命令来执行

### 通过 Composer 命令运行测试

`composer test`

### 通过 PHPUnit 命令运行测试

`./vendor/bin/phpunit -c phpunit.xml`

## 快速使用

### 安装并启用

通过 Composer 安装 `swoft/session` 组件  
1. 在项目 `composer.json` 所在目录执行 `composer require swoft/session`
2. 将 `Swoft\Session\Middleware\SessionMiddleware::class` 中间件加入到全局中间件的配置文件 `config/beans/base.php` 里
```php
'serverDispatcher' => [
    'middlewares' => [
        \Swoft\Session\Middleware\SessionMiddleware::class,
    ]
],
``` 
3. 配置好 `swoft/redis` 组件的连接池配置，此步骤具体可查阅 `swoft/redis` 组件的文档说明， `Redis` 驱动将会直接通过 `@Inject()` 注解注入 `\Swoft\Redis\Redis` 类用于操作

### 配置 Session

通过对 `SessionManager` bean 的配置实现对 `Session` 配置的变更，若 `Session` 配置不存在，对 `./config/beans/` 内任意一个配置文件添加以下配置即可

```php
// 注意Bean大小写
'sessionManager' => [
    'class' => \Swoft\Session\SessionManager::class,
    'config' => [
        'driver' => 'redis',
        'name' => 'SWOFT_SESSION_ID',
        'lifetime' => 1800,
        'expire_on_close' => false,
        'encrypt' => false,
        'storage' => '@runtime/sessions',
    ],
],
```

#### Config 配置项
- `driver`    
类型：`enum`，可选值 (`redis|file`)  
Session 驱动，目前仅支持将 `redis` 驱动用于生产环境，`file` 驱动暂未实现 GC(垃圾回收)

- `name`
类型：`string`  
Session 键名，对应到用户端储存 Session 信息的 `Cookies` 的键名

- `lifetime`
类型：`int`  
Session 生命时长，单位为 `秒`

- `expire_on_close`
类型：`boolean`  
在结束请求时立刻使当前 `Session` 过期

- `encrypt`
类型：`boolean`  
是否加密储存 `Session` 内容

- `storage`
类型：`int`  
Session 信息储存位置，仅在 `file` 驱动下生效

#### 常见问题

Q: 每次的请求都产生了不同的 SessionID  
A: 检查 Nginx 配置是否在反向代理时有将 `Host` Header 设置到反向代理的请求去，通常在设置反向代理的时候都会带上下列的 Header 项，以确保反向代理后获取到的信息是一致的  

```bash
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header REMOTE-HOST $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

其中 `proxy_set_header Host $host;` 就是将当前的域名也设置到反向代理的请求的 Header 上，请检查是否有设置，以确保 Cookies 上设置的 Host 是与当前访问域名是一致的
