+++
title = "Swoft Devtool"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-24"
weight = 403

[menu.v2]
  parent = "dev-tools"
  weight = 3
+++

[![Latest Stable Version](http://img.shields.io/packagist/v/swoft/devtool.svg)](https://packagist.org/packages/swoft/devtool)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)

## 介绍

GitHub: [https://github.com/swoft-cloud/swoft-devtool](https://github.com/swoft-cloud/swoft-devtool)

Swoft 提供了一套内置的命令工具以方便开发者使用。

## 安装

默认情况下开发工具已包含在 Swoft 框架中，如需重新安装只需执行下方命令：

```bash
composer require swoft/devtool
```

## 帮助命令

命令行中所有项均可以通过加上 `-h` 参数显示更多可选参数提示，例如 `php ./bin/swoft http:start -h`

```bash
$ php ./bin/swoft -h

Console application description (Version: 2.0.0)

Usage:
  ./bin/swoft COMMAND [arg0 arg1 arg2 ...] [--opt -v -h ...]

Options:
      --debug      Setting the application runtime debug level(0 - 4)
      --no-color   Disable color/ANSI for message output
  -h, --help       Display this help message
  -V, --version    Show application version information
      --expand     Expand sub-commands for all command groups

Available Commands:
  agent      This is an agent for Apllo config center
  app        There are some help command for application[by devtool]
  dclient    Provide some simple tcp, ws client for develop or testing[by devtool]
  demo       Class DemoCommand
  dinfo      There are some commands for application dev[by devtool]
  entity     Generate entity class by database table names[by devtool]
  http       Provide some commands to manage the swoft HTTP server(alias: httpsrv)
  issue      There are some commands for application dev[by devtool]
  migrate    Manage swoft project database migration commands[by devtool](alias: mig)
  process    Provides some command for manage process pool
  rpc        Provide some commands to manage swoft RPC server
  tcp        Provide some commands to manage swoft TCP server(alias: tcpsrv)
  test       Class TestCommand
  ws         Provide some commands to manage swoft websocket server(alias: wsserver,websocket)

More command information, please use: ./bin/swoft COMMAND -h
```

## 更多功能

后续会根据用户需要增加更多功能，欢迎用户提供意见、贡献代码。