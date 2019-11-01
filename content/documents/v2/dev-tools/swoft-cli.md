+++
title = "Swoft CLI"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-24"
weight = 402

[menu.v2]
  parent = "dev-tools"
  weight = 2
+++

[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/swoft-cloud/swoft-cli)](https://github.com/swoft-cloud/swoft-cli)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)

## 简介

GitHub: [https://github.com/swoft-cloud/swoft-cli](https://github.com/swoft-cloud/swoft-cli)



Swoft CLI 是一个独立的命令行应用，提供了一些内置的功能方便开发者使用：

- 生成 Swoft 应用类文件，例如：HTTP 控制器，WebSocket 模块类等
- 监视用户 Swoft 项目的文件更改并自动重新启动服务器
- 快速创建新应用或组件
- 将一个 Swoft 应用打包成 **Phar** 包

欢迎提供意见、贡献代码

>  Swoft CLI 是基于 Swoft 2.0 框架构建的应用，运行时同样需要安装 Swoole 



## 运行预览

```bash
$ php swoftcli.phar -h

🛠️ Command line tool application for quick use swoft (Version:  0.1.3)

Usage:
  swoftcli.phar COMMAND [arg0 arg1 arg2 ...] [--opt -v -h ...]

Options:
      --debug      Setting the application runtime debug level(0 - 4)
      --no-color   Disable color/ANSI for message output
  -h, --help       Display this help message
  -V, --version    Show application version information
      --expand     Expand sub-commands for all command groups

Available Commands:
  client         Provide some commands for quick connect tcp, ws server
  gen            Generate some common application template classes(alias: generate)
  new            Provide some commads for quick create new application or component(alias: create)
  phar           There are some command for help package application
  self-update    Update the swoft-cli to latest version from github(alias: selfupdate, update-self, updateself)
  serve          Provide some commands for manage and watch swoft server project
  system         Provide some system information commands[WIP](alias: sys)
  tool           Some internal tool commands, like ab, update-self

More command information, please use: swoftcli.phar COMMAND -h
```

## 安装

安装 Swoft CLI 非常简单，我们已经提供打包好的 Phar 放在 GitHub 上，只需从 [Swoft CLI Releases - GitHub](https://github.com/swoft-cloud/swoft-cli/releases) 下载打包好的 `swoftcli.phar` 文件即可。当然你也可以通过 `wget` 命令下载：

```bash
wget https://github.com/swoft-cloud/swoft-cli/releases/download/{VERSION}/swoftcli.phar
```

> 注意：你需要替换 `{VERSION}` 部分为最新版本。



```bash
# 检查包是否可用，打印版本信息
php swoftcli.phar -V

# 显示帮助信息
php swoftcli.phar -h
```

## 全局使用

如果你需要在任何地方都可以直接使用 Swoft CLI：

```bash
mv swoftcli.phar /usr/local/bin/swoftcli && chmod a+x /usr/local/bin/swoftcli

# 完成后检查是否可用
swoftcli -V
```

## 手动构建

如果你需要通过最新的 Swoft CLI 或修改后的代码构建 Phar 包：

```bash
git clone https://github.com/swoft-cloud/swoft-cli
cd swoft-cli
composer install

# 构建
php -d phar.readonly=0 ./bin/swoftcli phar:pack -o=swoftcli.phar
```

