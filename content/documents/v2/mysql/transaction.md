+++
title = "事务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-11-04"
weight = 704

[menu.v2]
  parent = "mysql"
  weight = 4
  identifier = "mysql-transaction"

+++

## 开启事务

{{% alert warning %}}

注意：开启事务后，事务之间的所有操作都同属一个连接，因此事务中 **不能** 使用并发操作。

{{% /alert %}}

### 快速使用

开启一个事务的最简单方式是使用 `DB` 下的 `transaction` 方法：

```php
DB::transaction(function () {
    DB::table('users')->update(['name' => 'Swoft']);
    DB::table('posts')->delete();
});

// 需指定连接池时
DB::connection('db.pool')->transaction(function () {
    DB::table('users')->update(['name' => 'Swoft']);
    DB::table('posts')->delete();
});
```

参数说明：

- `$callback`：传入一个闭包函数用于数据库操作
- `$attempts`：重试次数，默认为 `1`

如果闭包函数中没有发生任何异常，该事务会 **自动提交**。如果闭包函数中出现异常时，事务会 **自动回滚**。

### 处理死锁

`transaction` 方法的第二个参数用来指定事务发生死锁时重复执行的次数。一旦定义的次数尝试完毕，就会抛出一个异常。

```php
DB::transaction(function () {
    DB::table('users')->update(['name' => 'Swoft']);
    DB::table('posts')->delete();
}, 3);
```

### 手动开启

如需自行控制事务提交及回滚操作，可以使用 `DB` 下的 `beginTransaction` 方法开启事务。

```php
DB::beginTransaction();

// 需指定连接池时
DB::connection('db.pool')->beginTransaction();
```

事务一旦开启，当前连接会绑定到当前的协程环境中，使提交、回滚、查询同属一个连接以保证数据的安全性和完整性，只有在事务被提交或回滚后才会解除绑定。

> 不同连接池的事务相互独立，不存在关联关系。

{{% alert note %}}

在复杂逻辑中，为避免死锁情况，请一定记得在每个流程分支中执行事务提交或回滚操作。

{{% /alert %}}

## 事务回滚

操作发生异常或逻辑判断错误时应对事务进行回滚。

```php
DB::rollBack();

// 需指定连接池时
DB::connection('db.pool')->rollBack();
```

## 事务提交

操作未发生异常且逻辑判断正常时应对事务进行提交，以确保数据正常写入到数据库中。

```php
DB::commit();

// 需指定连接池时
DB::connection('db.pool')->commit();
```

## 常见问题

### 事务嵌套

MySQL 本身不支持事务嵌套，如果在事务中进行嵌套操作时，**上一个事务**  会被 **隐式提交**，然后开启一个新事务。而在框架中，利用数据库的 `Savepoint`（保存点）功能，可以实现事务嵌套操作。在 MySQL 中，利用 `Savepoint` 可以回滚指定部分的事务，从而使得事务处理更加精细灵活。所以在 Swoft 中对事务进行了嵌套时，嵌套的事务会保存在 `Savepoint`。

```php
// 事务一
DB::beginTransaction();

$user = User::find($id);
$user->update(['name' => 'Swoft Framework']);

// 事务二
DB::beginTransaction();
User::find($id)->update(['name' => 'Swoft']);
// 事务二回滚
DB::rollBack();

// 事务一提交
DB::commit();
```

上述示例代码中，**事务二** 进行的回滚操作并不会影响外层 **事务一** 的数据更新操作。

> `Savepoint` 仅部分数据库支持，而非所有数据库都支持该功能。

### 忘记提交

```php
DB::connection('db.pool')->beginTransaction();

User::find($id)->update(['name' => 'Swoft']);
```

类似上述代码我们并没有进行事务提交或回滚操作，此时 Swoft 会在 `SwoftEvent::COROUTINE_DEFER` 事件中检查当前是否处于事务开启状态，如果是则会自动回滚，然后连接归还至连接池。

## 错误运用示例

```php
DB::beginTransaction();
$user = User::find($id);

sgo(function () use ($id) {
    $user1 = User::find($id);
});

$user->update(['name' => 'Swoft' . mt_rand(110, 10000)]);
DB::commit();
```

类似这样的代码虽然能够正常执行，但这是 **错误的写法**。前文已强调：**请不要在事务中使用协程**。使用协程会造成上下文不一致导致数据错乱。事务与 **当前协程** 是绑定关系，切换协程后会使用另一个新的连接。

