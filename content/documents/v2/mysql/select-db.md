+++
title = "数据库切换"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-11-06"
weight = 706

[menu.v2]
  parent = "mysql"
  weight = 6
  identifier = "mysql-select-db"

+++

## 简介

在 Swoft `2.0.2` 版本之前，连接池中没有数据库切换功能，这导致了不同数据库需要配置多个连接池，大大增加了维护成本。所以在 `2.0.2` 开始新增了切换数据库功能。你可以在链式操作中使用 `db()` 方法进行指定，这显然不够灵活难以维护，下面推荐一个根据上下文切换数据的操作。

> Swoft 版本需 `>= 2.0.2`

## DbSelector

### 实现

使用 `DbSelector` 需实现 `Swoft\Db\Contract\DbSelectorInterface` 接口：

```php
<?php declare(strict_types=1);

namespace App\Common;

use Swoft\Bean\Annotation\Mapping\Bean;
use Swoft\Db\Connection\Connection;
use Swoft\Db\Contract\DbSelectorInterface;

/**
 * Class DbSelector
 *
 * @since 2.0
 *
 * @Bean()
 */
class DbSelector implements DbSelectorInterface
{
    /**
     * @param Connection $connection
     */
    public function select(Connection $connection): void
    {
        // 在请求中获取 ID
        $selectIndex = (int)context()->getRequest()->query('id', 0);
        $createDbName = $connection->getDb();

        if ($selectIndex == 0) {
            $selectIndex = '';
        }
        // 数据库名 + ID。例如：order_database_1，好处是会根据上下文自动切库
        $dbName = sprintf('%s%s', $createDbName, (string)$selectIndex);
        $connection->db($dbName);
    }
}
```

### 配置

实现 `DbSelector` 后，还需在 `bean.php` 中定义 `dbSelector` 属性，例如：

```php
'db2' => [
    'dsn'        => 'mysql:dbname=test;host=127.0.0.1:3306',
    'username'   => 'root',
    'password'   => '123456',
    'dbSelector' => bean(App\Common\DbSelector::class)
],
'db2.pool' => [
    'database' => bean('db2')
]
```

通过在 `db` 中添加 `dbSelector` 属性以指定实现类。之后每次操作均会调用该类自动切换数据库。使用这种方式后大大降低了维护成本，**官方推荐**。

## 其它说明

如果 `DbSelector` 的方式无法满足需求时，仅能通过 `db` 方法手动指定数据库。

```php
// 模型类
User::db('test2')->insertGetId([
    'name'      => uniqid(),
    'password'  => md5(uniqid()),
    'age'       => mt_rand(1, 100),
    'user_desc' => 'Swoft'
]);

// DB 方式       
DB::table('user')->db('test2')->insertGetId([
    'name'      => uniqid(),
    'password'  => md5(uniqid()),
    'age'       => mt_rand(1, 100),
    'user_desc' => 'Swoft Framework'
]);
```

不推荐该方式，使用 `db` 方法会加大维护成本，且容错率低。