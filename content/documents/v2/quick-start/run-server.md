+++
title = "运行服务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-24"

weight = 303
[menu.v2]
  parent = "quick-start"
  weight = 3
+++

## 简述

Swoft 拥有便捷的命令行工具和相应的服务管理命令，参阅 [Swoft Devtool](/documents/v2/dev-tools/swoft-devtool) 了解更多。

## HTTP 服务

```bash
# 启动 HTTP 服务
$ php ./bin/swoft http:start

# 以守护进程模式启动
$ php ./bin/swoft http:start -d

# 重启 HTTP 服务
$ php ./bin/swoft http:restart

# 重新加载 HTTP 服务
$ php ./bin/swoft http:reload

# 停止 HTTP 服务
$ php ./bin/swoft http:stop
```

## WebSocket 服务

```bash
# 启动 WS 服务
$ php ./bin/swoft ws:start

# 以守护进程模式启动
$ php ./bin/swoft ws:start -d

# 重启 WS 服务
$ php ./bin/swoft ws:restart

# 重新加载 WS 服务
$ php ./bin/swoft ws:reload

# 关闭 WS 服务
$ php ./bin/swoft ws:stop
```

## RPC 服务

```bash
# 启动 RPC 服务
$ php ./bin/swoft rpc:start

# 以守护进程模式启动
$ php ./bin/swoft rpc:start -d

# 重启 RPC 服务
$ php ./bin/swoft rpc:restart

# 重新加载 RPC 服务
$ php ./bin/swoft rpc:reload

# 关闭 RPC 服务
$ php ./bin/swoft rpc:stop
```

## 启动信息

 默认情况下，在任何服务启动时控制台会显示相应的启动信息。

> 如果在 `.env` 文件中开启了调试 ` SWOFT_DEBUG=1 ` 将会在控制台中显示更多详细的信息。

如果需要关闭这些信息，只需要编辑 `app/Application.php` 文件：

```php
public function getCLoggerConfig(): array
{
    $config = parent::getCLoggerConfig();

    // False: 关闭控制台日志打印
    $config['enable'] = true;

    // 日志等级
    $config['levels'] = 'error,warning';

    return $config;
}
```

编辑后重启 Swoft 相关服务生效。