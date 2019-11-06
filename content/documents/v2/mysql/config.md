+++
title = "配置"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 701

[menu.v2]
  parent = "mysql"
  weight = 1
  identifier = "mysql-config"
+++

[![Latest Stable Version](https://img.shields.io/packagist/v/swoft/db.svg)](https://packagist.org/packages/swoft/db)
[![Php Version](https://img.shields.io/badge/php-%3E=7.1-brightgreen.svg?maxAge=2592000)](https://secure.php.net/)
[![Swoft Doc](https://img.shields.io/badge/docs-passing-green.svg?maxAge=2592000)](https://www.swoft.org/docs)
[![Swoft License](https://img.shields.io/hexpm/l/plug.svg?maxAge=2592000)](https://github.com/swoft-cloud/swoft/blob/master/LICENSE)

GitHub: [https://github.com/swoft-cloud/swoft-db](https://github.com/swoft-cloud/swoft-db)

## 简介

Swoft 数据库组件高度兼容 **Laravel**，支持原生 SQL、查询构造器和 Eloquent ORM，去掉了复杂的对象模型关联。数据库组件采用原生 **PDO** 的方式连接，**IO** 操作会被自动转换为类似 Swoole 的 MySQL 协程客户端，使开发变得简单，更贴近传统框架。

{{% alert warning %}}

为什么使用原生 PDO：由于 MySQLnd 模式的 `PDO`、`MySQLi` 扩展会加入 Hook 监听，如果未启用 MySQLnd 将不支持协程化。

{{% /alert %}}

## 安装

数据库组件需独立安装：

```bash
composer require swoft/db
```

## 基础配置

数据库的配置位于 `app/bean.php` 文件，去掉了繁琐的 `.env` 环境文件配置。你可以认为配置的 `db` 是一个 `bean` 对象。

```php
return [
    'db' => [
        'class'    => Swoft\Db\Database::class,
        'dsn'      => 'mysql:dbname=dbname;host=127.0.0.1:3306',
        'username' => 'test',
        'password' => 'test',
        'charset'  => 'utf8mb4',
        'prefix'   => 't_',
        'options'  => [
            PDO::ATTR_CASE => PDO::CASE_NATURAL
        ],
        'config'   => [
            'collation' => 'utf8mb4_unicode_ci',
            'strict'    => true,
            'timezone'  => '+8:00',
            'modes'     => 'NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES', 
            'fetchMode' => PDO::FETCH_ASSOC
    	]
    ]
];
```

配置方式类似 **Yii2** 的对象属性注入。可通过 `bean('db')` 获取当前配置的 `Database` 对象。

配置项说明：

- `class`：数据库类。自定义时需指定，默认为 Swoft 数据库类
- `dsn`：PDO 连接信息，指定数据库地址、端口、名称
- `username`：数据库用户名
- `password`：数据库密码
- `charset`：数据库字符集
- `prefix`：数据表前缀
- `options`：PDO 选项，参阅：[PHP: PDO::setAttribute - Manual](https://www.php.net/manual/zh/pdo.setattribute.php)
- `config`：额外配置
  - `collation`：字符集排序规则
  - `strict`：是否启用严格模式
  - `timezone`：时区设置。国内请设置 `+8:00`
  - `modes`：连接模式，完整列表参考：[MySQL :: MySQL 5.6 Reference Manual - Full List of SQL Modes](https://dev.mysql.com/doc/refman/5.6/en/sql-mode.html#sql-mode-full)
  - `fetchMode`：PDO 获取模式，默认为 `PDO::FETCH_ASSOC`，即以关联数组返回，参考：[PHP: PDO 预定义常量 - Manual](https://www.php.net/manual/zh/pdo.constants.php)

## 读写分离

```php
'db_rw' => [
    'charset'  => 'utf8mb4',
    'prefix'   => 't_',
    'config'   => [
       'collation' => 'utf8mb4_unicode_ci',
       'strict'    => true,
       'timezone'  => '+8:00',
       'modes'     => 'NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES'
    ],
    'writes' => [
        [
            'dsn'      => 'mysql:dbname=db-write;host=127.0.0.1:3306',
            'username' => 'write',
            'password' => 'write'
        ]
    ],
    'reads'  => [
        [
            'dsn'      => 'mysql:dbname=db-read;host=127.0.0.1:3306',
            'username' => 'read',
            'password' => 'read'
        ]
    ]
]
```

- `writes`：**写** 配置，执行 **增**、**删**、**改** 操作时会从 **连接池** 随机选择 **写** 节点
- `reads`：**读** 配置，执行 **读** 操作时会从 **连接池** 随机选择 **读** 节点

读写配置中公共部分请参考 [基础配置](#基础配置) 部分，其中 `dsn`、`username`、`password`、`charset`、`prefix`、`options`、`config` 支持配置公共应用，之后在 `writes/reads` 中配置差异部分即可。
## 连接池

使用过 Swoft 1.0 的小伙伴对连接池并不陌生，2.x 对它进行了简化配置，连接池可以更好的管理资源。

`DB` 的连接通过 **连接池** 执行创建和释放，通过 `ConnectionManager` 类进行管理连接。创建的连接为短连接，操作执行失败后会重试 **一次**。

每当调用 `toSql()` 方法或者执行完操作的时候都会归还连接至连接池中。连接池的默认名称为 `db.pool`，使用的 `database` 来自 `bean('db')`，由 [基础配置](#基础配置) 提供。连接池配置同样位于 `app\bean.php` 文件。

{{% alert warning %}}

每一个 Worker 都会创建一个同样的连接池，连接池并不是越多越好，参数配置需根据服务器配置和 Worker 的数量权衡。

{{% /alert %}}

