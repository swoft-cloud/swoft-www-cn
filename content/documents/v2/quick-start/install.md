+++
title = "框架安装"
linktitle = "框架安装" #若没有此选项，则侧边栏导航显示的将是 title 字段
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"

weight = 301
[menu.v2]
  parent = "quick-start"
  weight = 1
+++

## 系统要求

Swoft 框架支持 Linux、macOS 以及 Windows 10[^WSL]。

## 环境要求

### 必要部分

- PHP，版本 `>=7.1`
- PHP 包管理器 **Composer**
- **PCRE** 库
- PHP 扩展 **Swoole**，版本 `>=4.3`
- 额外扩展：**PDO**、**Redis**

### 冲突部分

下方列出部分已知与 Swoole 存在冲突的 PHP 扩展，请在使用 Swoft 时移除安装或禁用：

- Xdebug
- Xhprof
- Blackfire
- Zend
- trace
- Uopz

## 安装方式

### 通过 Docker 安装

```bash
docker run -p 18306:18306 --name swoft swoft/swoft
```

### 通过 Docker Compose 安装

```bash
git clone https://github.com/swoft-cloud/swoft
cd swoft
docker-compose up
```

### 通过 Composer 安装

```bash
composer create-project swoft/swoft Swoft
```

> 建议全局配置 Composer 国内镜像以加速下载、更新包，参考：[阿里云 Composer 全量镜像](https://developer.aliyun.com/composer)

### 手动安装

```bash
git clone https://github.com/swoft-cloud/swoft
cd swoft
composer install
cp .env.example .env
# 编辑 .env 文件，根据需要调整相关环境配置
```

### 通过 Swoft CLI 创建

关于 Swoft CLI 工具，请查阅 [Swoft CLI 文档](/documents/v2/dev-tools/swoft-cli)，该工具支持从不同模板项目中快速创建一个干净的 Swoft 应用

```bash
php swoftcli.phar create:app --type full Swoft-Full
php swoftcli.phar create:app --type ws Swoft-WebSocket
php swoftcli.phar create:app --type tcp Swoft-TCP
```

## IDE 插件

通过文本编辑器进行 Swoft 开发时，Swoft 的注解功能虽然便捷，但仍需要 `use` 注解相对应的命名空间，这显然不是一个高效的做法。我们推荐在使用集成开发环境 **IDEA** 或 **PhpStorm** 时，通过插件市场搜索并安装 **PHP Annotations** 插件以提供注解命名空间自动补全、注解属性代码提醒、注解类跳转等非常有助于提升开发效率的功能。



[^WSL]:通过 Windows 10 安装 WSL 后可以使用大部分 Linux 功能，推荐安装 Ubuntu LTS 作为子系统。