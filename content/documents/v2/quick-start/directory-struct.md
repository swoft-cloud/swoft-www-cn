+++
title = "目录结构"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"

weight = 302
[menu.v2]
  parent = "quick-start"
  weight = 2
+++

## 简介

一个完整的 Swoft 应用包含：

- Console 应用
- HTTP 服务（类似传统框架）
- WebSocket 服务
- RPC 服务
- TCP 服务



>  `app` 下的类目录为了避免部分文件夹名称没有复数单词而导致命名不统一，所以所有文件夹名称 **统一使用单数** 

## 完整结构

```bash
├── app/    ----- 应用代码目录
│   ├── Annotation/        ----- 定义注解相关
│   ├── Aspect/            ----- AOP 切面
│   ├── Common/            ----- 一些具有独立功能的 class bean
│   ├── Console/           ----- 命令行代码目录
│   ├── Exception/         ----- 定义异常类目录
│   │   └── Handler/           ----- 定义异常处理类目录
│   ├── Http/              ----- HTTP 服务代码目录
│   │   ├── Controller/
│   │   └── Middleware/
│   ├── Helper/            ----- 助手函数
│   ├── Listener/          ----- 事件监听器目录
│   ├── Model/             ----- 模型、逻辑等代码目录(这些层并不限定，根据需要使用)
│   │   ├── Dao/
│   │   ├── Data/
│   │   ├── Logic/
│   │   └── Entity/
│   ├── Rpc/               ----- RPC 服务代码目录
│   │   └── Service/
│   │   └── Middleware/
│   ├── WebSocket/         ----- WebSocket 服务代码目录
│   │   ├── Chat/
│   │   ├── Middleware/
│   │   └── ChatModule.php
│   ├── Tcp/               ----- TCP 服务代码目录
│   │   └── Controller/        ----- TCP 服务处理控制器目录
│   ├── Application.php    ----- 应用类文件继承自swoft核心
│   ├── AutoLoader.php     ----- 项目扫描等信息(应用本身也算是一个组件)
│   └── bean.php
├── bin/
│   ├── bootstrap.php
│   └── swoft              ----- Swoft 入口文件
├── config/                ----- 应用配置目录
│   ├── base.php               ----- 基础配置
│   └── db.php                 ----- 数据库配置
├── public/                ----- 公共目录
├── resource/              ----- 应用资源目录
│   ├── language/              ----- 语言资源目录  
│   └── view/                  ----- 视图资源目录  
├── runtime/               ----- 临时文件目录（日志、上传文件、文件缓存等）
├── test/                  ----- 单元测试目录
│   └── bootstrap.php
├── composer.json
├── phar.build.inc
└── phpunit.xml.dist
```

