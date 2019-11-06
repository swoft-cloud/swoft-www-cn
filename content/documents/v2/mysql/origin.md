+++
title = "原生操作"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-11-05"
weight = 705

[menu.v2]
  parent = "mysql"
  weight = 5
  identifier = "mysql-origin"

+++

## 简介

在 `DB` 中 Swoft 提供了 `select`、`selectOne`、`update`、`insert`、`delete`、`cursor`、`statement`、`affectingStatement`、`unprepared` 方法进行原生操作。

## 新增数据

```php
$bool = DB::insert('INSERT INTO users (`id`, `name`) VALUES (?, ?)', [1, 'Swoft']);
```

参数说明：

- `$query`：SQL 字符串
- `$bindings`：绑定参数

如示例代码中，`id` 及 `name` 的值通过 `$bindings` 参数传入，该操作返回 `bool` 值。

> 使用参数绑定可有效避免 SQL 注入。

## 删除数据

```php
$deletedLines = DB::delete('DELETE FROM `users`');
```

参数说明：

- `$query`：SQL 字符串
- `$bindings`：绑定参数

该方法返回受影响的行数。

## 更新数据

```php
$updatedLines = DB::update('UPDATE `users` SET `status` = ? WHERE `name` = ?', [1, 'Swoft']);
```

参数说明：

- `$query`：SQL 字符串
- `$bindings`：绑定参数

该方法返回受影响的行数。

## 查询数据

以下三种查询方式拥有相同的参数。

参数说明：

- `$query`：SQL 字符串
- `$bindings`：绑定参数
- `$useReadPdo`：是否使用 **读** 库，默认为 `true`

### Select

```php
$users = DB::select('SELECT * FROM `users` WHERE `status` = ?', [1]);
```

`select` 方法返回一个数组，数组中的每个结果都是 `array`。

### SelectOne

如需查询一条数据可使用 `selectOne` 方法：

```php
$sql= 'SELECT * FROM `users` WHERE `id` = ?';

$user = DB::selectOne($sql, [1]);

if ($user) {
    echo $user['name'];
}
```

`selectOne` 方法执行成功后返回一个数组。

### Cursor 游标

游标用于快速遍历所有数据。

```php
$sql= 'SELECT * FROM `users`';

$users = DB::cursor($sql);

foreach($users as $user){
	echo $user['name'];
}
```

> 底层采用 `yield` 机制获取数据，比 `chunk` 方法更快。

## 命名绑定

除使用 `?` 进行参数绑定外，还可以使用如下方式进行命名绑定：

```php
$results = DB::select('SELECT * FROM `user` WHERE `id` = :id', ['id' => 1]);
```

## 其它语句

### Statement

数据库语句不存在返回值时，可以使用 `statement` 方法来执行：

```php
$bool = DB::statement('DROP TABLE `users`');
```

该方法支持参数绑定，返回执行结果的 `bool` 值。

###  Unprepared

执行未预处理的 SQL 语句，也是真正意义上的原生语句。使用 `unprepared` 方法执行：

```php
$unprepared = DB::unprepared('DROP TRIGGER IF EXISTS `sync_to_item_table`;');

if ($unprepared) {
    // TODO:
}
```

仅该方法支持多条 SQL，同时该方法不支持参数绑定，返回执行结果的 `bool` 值。

> 执行多条 SQL 时注意 `;` 分号隔开。

