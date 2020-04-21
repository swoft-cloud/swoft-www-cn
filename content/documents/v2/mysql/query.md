+++
title = "查询构造器"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2020-04-21"
weight = 703

[menu.v2]
  parent = "mysql"
  weight = 3
  identifier = "mysql-query"
+++

## 简介

在 Swoft 中，数据库查询构造器为创建和执行数据库查询提供了一个方便的接口，它可用于执行应用程序中大部分数据库操作，且可在所有支持的数据库系统上运行。

Swoft 的查询构造器使用 `PDO` 参数绑定来保护您的应用程序免受 SQL 注入攻击。因此没有必要清理作为绑定传递的字符串。

你可以使用 `DB::table('table')` 得到一个 `Builder` 对象，也可以使用 `Builder::new()->from('table')`，两种方式会返回相同的结果。`Builder` 对象不会分配连接，只有执行 SQL 语句的时候才会从连接池从获取。

## 新增数据

### insertGetId

通过 `insertGetId` 方法我们可以轻松的获取新增数据的结果自增 ID。

```php
$id = DB::table('user')->insertGetId([
    'name' => 'Swoft',
    'age'  => 18
]);
```

### insert

在无需获取自增 ID 或需新增多条数据时，将数组传递给 `insert` 方法即可。

```php
// 单数据
/** @var bool */
$ret = DB::table('users')->insert(
    ['email' => 'john@example.com', 'votes' => 0]
);

// 多数据
/** @var bool */
$ret = DB::table('users')->insert([
    ['email' => 'taylor@example.com', 'votes' => 0],
    ['email' => 'dayle@example.com', 'votes' => 0]
]);
```

## 删除数据

和模型一样，查询构造器也可以使用 `delete` 方法将数据从表中删除。

```php
DB::table('users')->where('votes', '>', 100)->delete();
```

### 截断表

截断（Truncate）方法会清空数据表并充值自增 ID 为 0，**请慎用该方法**。

```php
DB::table('users')->truncate();
```

## 更新数据

在查询构造器中，和模型一样可以通过 `update` 方法更新已有的数据。`update` 方法和 `insert` 方法相同，接受需更新字段和值的数组。同时也可以使用 `where` 链式调用进行条件过滤。

### 更新 JSON 字段

更新类型为 JSON 的字段时，你可以使用 `->` 语法访问 JSON 对象，该操作 **只能** 用于支持 JSON 字段类型的数据库。

```php
DB::table('users')
    ->where('id', 1)
    ->update(['options->enabled' => true]);
```

### 自增/自减

自增/自减操作默认对字段进行 `+1` 或 `-1` 更新。第三个参数为指定需同时更新的数据。

```php
DB::table('users')->increment('votes');

DB::table('users')->increment('votes', 5, ['name' => 'Swoft']);

DB::table('users')->decrement('votes');

DB::table('users')->decrement('votes', 5, ['name' => 'Swoft']);
```

如需进行自定义更新操作，参考示例：

```php
$res = DB::table('user')->where('id', $id)->update([
    'posts' => DB::raw('`posts` + 1'),
    'views' => Expression::new('`views` + 1'),
    'name'  => 'Swoft',
]);
```

> `DB::raw($sql)` 等同 `Expression::new($sql)`。使用这两个方法时注意防范 SQL 注入。

## 查询数据

查询构造器中查询方法与模型完全兼容。

### 单行/单列查询

通过 `first` 方法从数据表中获取一行数据。

```php
$user = DB::table('user')->where('name', 'Swoft')->first();
if ($user) {
    echo $user->name;                
}
```

如果只需获取一行数据中的某个字段值，则可以通过 `value` 方法获取。

```php
$name = DB::table('users')->where('name', 'Swoft')->value('name');
```

单列数据获取通过 `pluck` 方法完成。

```php
$titles = DB::table('articles')->pluck('title');

foreach ($titles as $title) {
    echo $title;
}
```

还可以在返回的结果集中指定字段的自定义键值，指定 `pluck` 方法的第二个参数即可。

```php
$roles = DB::table('users')->pluck('email', 'name');

foreach ($roles as $name => $email) {
    echo $email;
}
```

### 多行查询

与模型中的查询几乎一致，不同的是，使用构造器时需通过 `table` 方法指定数据表，然后通过 `get` 方法获取。当然，也可以在之前通过链式调用 `where` 方法进行条件过滤。

```php
$users = DB::table('user')->get();

foreach ($users as $user) {
    echo $user->name;
}
```

如需更快的查询全部的数据，可以用 `cursor` 方法。其底层采用 `yield` 实现。

```php
$users = DB::table('user')->cursor();

foreach ($users as $user){
    echo $user->name;
}
```

### 结果分块

如果需要处理上千条数据时，你可以考虑使用 `chunk` 方法进行数据分块。该方法一次获取结果集的一小块，并将其传递给闭包函数进行处理。例如，我们可以将全部 `user` 表数据切割成一小块，一次处理 100 条记录。

```php
DB::table('users')->orderBy('id')->chunk(100, function (Swoft\Stdlib\Collection $users) {
    foreach ($users as $user) {
        echo $user->name;
    }
});
```

在闭包函数中返回 `false` 来终止继续获取分块结果：

```php
DB::table('users')->orderBy('id')->chunk(100, function (Swoft\Stdlib\Collection $users) {
    return false;
});
```

> 闭包传递的 `$users` 是一个 `Collection` 对象，`each` 方法也是通过 `chunk` 实现，只是参数与位置不同。

### 聚合函数

查询构造器支持各种聚合函数，比如：`count`、`avg`、`max`、`min` 、`sum` 等。你可以在构造任何查询语句后调用。

```php
$userNum = DB::table('users')->count();

$price = DB::table('orders')->max('price');

$price = DB::table('orders')->where('status', 1)->avg('price');
```

> 没有查询到任何数据时将返回一个 `int` 类型的 `0`。除 `count` 方法固定返回 `int` 类型外，其它聚合函数可能涉及到浮点型计算，Swoft 底层未对数据类型进行强转，所以返回类型为 `float|int`。

### 原生语句

{{% alert warning %}}

注意：原生语句将会被当做字符串注入到查询中，因此应当小心使用防止 SQL 注入。

{{% /alert %}}

#### selectRaw

```php
$users = DB::table('user')
    ->selectRaw('count(*) AS `user_count`, avg(age) AS `avg_age`'))
    ->get();
```

#### whereRaw/orWhereRaw

`whereRaw` 和 `orWhereRaw` 方法将原生的 `where` 注入到你的查询中。第二个参数为可选项，值为需绑定参数的数组。

```php
$users = DB::table('user')
    ->whereRaw('age > :age', ['age' => 18])
    ->select('name', 'age as user_age')
    ->get();
```

#### havingRaw/orHavingRaw

`havingRaw` 和 `orHavingRaw` 方法用于将原生字符串设置为 `having` 语句的值。

```php
$orders = DB::table('user')
    ->selectRaw('sum(age) as age')
    ->groupBy('user_desc')
    ->havingRaw('age > ?', [17])
    ->get();
```

####  orderByRaw

`orderByRaw` 方法用于将原生字符串设置为 `ORDER BY` 子句的值。

```php
$time = time();
$orderBy = 'if(`dead_time` > ' . $time . ', update_time, 0) DESC, create_time DESC'; 

$orders = DB::table('ticket')
    ->orderByRaw($orderBy)
    ->get();
```

####  fromRaw

`fromRaw` 方法用于自定义 `FROM` 关键字参数，比如使用 **强制索引**：

```php
$sql = DB::table('')
    ->select('id', 'name')
    ->fromRaw('`user` FORCE INDEX(`idx_user`)')
    ->get();
```



### 其它方法

#### 记录是否存在

除 `count` 方法可以判断结果是否存在外，还可以使用 `exists` 及 `doesntExist` 方法。

```php
return DB::table('orders')->where('id', 1)->exists();

return DB::table('orders')->where('id', 1)->doesntExist();
```

#### 指定字段

指定字段可以通过  `find`、`first`、`get` 指定外，也可以通过 `select` 指定。还可以通过 `AS` 设置别名。

```php
$users = DB::table('users')->get(['name', 'user_desc AS udesc']);

$users = DB::table('users')->select('name', 'user_desc AS udesc')->get();
```

如果已存在一个查询构造器实例，可以通过 `addSelect` 方法添加字段。

```php
$query = DB::table('users')->select('name');

$users = $query->addSelect(['age'])->get();
```

#### 去重

`distinct` 方法会强制查询结果不重复。

```php
$users = DB::table('users')->distinct()->get();
```

## Join 关联

Swoft 查询构造器支持完整的 Join 操作，基本语法为 `join(右表名, 左表字段, 操作符, 右表字段)`。

### Inner Join

```php
$users = DB::table('users')
    ->join('contacts', 'users.id', '=', 'contacts.user_id')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->select('users.*', 'contacts.phone', 'orders.price')
    ->get();
```

### Left Join

「左连接」 关联与 Join 使用方法相同。

```php
$users = DB::table('users')
    ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

### Right Join

「右连接」 关联与 Join 使用方法相同。

```php
$users = DB::table('users')
    ->rightJoin('posts', 'users.id', '=', 'posts.user_id')
    ->get();
```

### Cross Join

`crossJoin` 为「交叉连接」，交叉连接会生成两表的笛卡尔积。

```php
$users = DB::table('users')
    ->crossJoin('orders', 'orders.user_id', '=', 'users.id')
    ->get();
```

### JoinSub

你可以使用 `joinSub`、`leftJoinSub`、`rightJoinSub` 方法关联子查询。

```php
$latestPosts = DB::table('posts')
    ->select('MAX(created_at) as last_created_at')
    ->where('is_published', true)
    ->groupBy('user_id');

// $latestPosts 为一个 Query 对象
$users = DB::table('users')
    ->joinSub($latestPosts, 'latest_posts', function($join) {
        $join->on('users.id', '=', 'latest_posts.user_id');
    })->get();
```



### 高级用法

`join` 方法的第一个参数支持闭包函数，可通过该方式实现高级用法。

```php
DB::table('users')
    ->join('contacts', function (Swoft\Db\Query\JoinClause $join) {
        $join->on('users.id', '=', 'contacts.user_id')->orOn(...);
    })
    ->get();
```

如果你想要在 Join 上使用「where」风格的语句，你可以在连接上使用 `where` 和 `orWhere` 方法。这些方法会将列和值进行比较，而不是列和列进行比较。

```php
DB::table('users')
    ->join('contacts', function ($join) {
        $join->on('users.id', '=', 'contacts.user_id')->where('contacts.user_id', '>', 5);
    })
    ->get();
```

## Union 关联

查询构造器还支持 `union` 方法「联合」两个查询。比如，在创建一个查询后使用 `union` 方法和第二个查询进行联合。

```php
Builder::new()
    ->from('users')
    ->unionAll(function (Builder $builder) {
        $builder->from('users');
    })
    ->union(Builder::new()->from('user'))
    ->get();
```

> `unionAll` 方法与 `union` 方法用法相同。

## 条件语句

### 基础运用

`where` 方法中的三个参数分别为：字段名、操作符、比较值。

```php
// 查询 money 大于等于 100 的用户
$users = DB::table('users')->where('money', '>=', 100)->get();
```

如果条件中的操作符为 `=`，可将比较值简化至第二个参数，如：

```php
$users = DB::table('users')->where('age', 18)->get();
```

其它运用示例：

```php
// <> 与 != 皆为不等于
$users = DB::table('users')->where('age', '<>', 18)->get();
$users = DB::table('users')->where('age', '!=', 18)->get();

// 模糊查询
$users = DB::table('users')->where('name', 'LIKE', '%Swoft%')->get();

// 混合条件数组
$users = DB::table('users')->where([
    'name' => 'Swoft',
    ['status', '=', 1],
    ['age'], '>=', 18
])->get();

// “或”语句，在 where 中第四个参数传入 or 或直接使用 orWhere 方法
$users = DB::table('users')
    ->where('money', '>=', 100, 'or')
    ->orWhere('name', 'John')
    ->get();
```

> 仅 `where` 方法存在第四个参数，默认值为 `and`。

### 高级运用

`where` 方法中第一个参数支持闭包函数，通过该方式可以实现复杂的逻辑操作。示例：

```php
$isLogin = true;

DB::table('users')->where(function (Builder $query) use ($isLogin) {
    if ($isLogin) {
        $query->select('name', 'age', 'user_desc AS udesc');
    } else {
        $query->select("'未登录' AS name");
    }
})->get();
```

`whereExists` 与 `where` 方法使用类似：

```php
DB::table('users')->whereExists(function ($query) {
    $query->from('orders')->whereRaw('orders.user_id = users.id');
})->get();
```

### JsonWhere

同 [更新 JSON 字段](#更新 JSON 字段)，我们也能对 JSON 类型的字段应用条件。通过 `->` 获取 JSON 对象属性。

```php
$users = DB::table('users')
    ->where('options->language', 'en')
    ->get();

$users = DB::table('users')
    ->where('preferences->dining->meal', 'cookie')
    ->get();
```

使用 `whereJsonContainers` 查询 JSON 数组：

```php
$users = DB::table('users')
    ->whereJsonContains('options->languages', 'zh')
    ->get();

$users = DB::table('users')
    ->whereJsonContains('options->languages', ['zh', 'en'])
    ->get();   
```

### 其它 Where 语句

- `whereBetween`：用于验证字段值是否在指定两值之间
  - `whereNotBetween`：与 `whereBetween` 作用相反
- `whereIn`：用于验证字段值是否在指定数组中
  - `whereNotIn`：与 `whereIn` 作用相反
- `whereNull`：用于验证字段值是否为 `NULL`
  - `whereNotNull`：与 `whereNull` 作用相反
- `whereDate`：用于比较字段值与给定的日期
  - `whereYear`：用于比较字段值与给定的年份
  - `whereMonth`：用于比较字段值与给定的月份
  - `whereDay`：用于比较字段值与给定的日期
  - `whereTime`：用于比较字段值与给定的时间，格式为 `H:i:s`
- `whereColumn`：用于比较两个字段值，支持运算符 `=`、`>`、`>=`、`<`、`<=`

> 在使用日期相关函数时需注意 **MySQL 时区** 设置。

## 分组、分页及排序

### 分组

`groupBy` 和 `having` 方法可以对结果进行分组。

```php
$users = DB::table('users')
    ->selectRaw("count(*) count")
    ->groupBy('type')
    ->having('count', '>', "100")
    ->get();
```

### 分页

`limit`/`take`（`take` 方法为 `limit` 方法的别名）用于限制返回结果数量，而 `offset`/`skip`（`skip` 方法为 `offset` 方法的别名）用于指定跳过的数量，从而实现分页。

```php
$users = DB::table('users')
    ->offset(10)
    ->limit(5)
    ->get();
```

我们也可以使用更简单的 `forPage` 方法实现分页。实际等同 `offset` 结合 `limit` 运用。

```php
DB::table('users')
    ->forPage($page, $pageSize)
    ->get();
```

可以使用我们熟悉的 `paginate` 方法实现分页。
```php
DB::table('users')->paginate($page,$pageSize);
``` 

### 排序

`orderBy` 方法用于对结果集按需排序。

```php
DB::table('users')
    ->orderBy('age', 'asc')
    ->get();

DB::table('users')
    ->orderByDesc('age')
    ->get();
```

`latest`/`oldest` 方法可以非常轻松地通过日期排序，它默认使用 `created_at` 字段作为排序依据，当然你也可以指定字段。

```php
$users = DB::table('users')
    ->latest()
    ->get();

$users = DB::table('users')
    ->oldest('created_at')
    ->get();
```

使用 `inRandomOrder` 方法进行随机排序。随机获取一条数据：

```php
$randomUser = DB::table('users')
    ->inRandomOrder()
    ->first();
```

## 锁机制

### 共享锁

查询构造器支持在 `SELECT` 语法上实现「悲观锁定」函数。若向在查询中实现一个「共享锁」，你可以使用`sharedLock` 方法。共享锁可防止选中的数据列被篡改，直到事务被提交为止。

```php
DB::table('orders')->where('user_id', $userId)->sharedLock()->get();
```

### 排它锁

使用 `lockForUpdate` 方法实现排它锁可避免行被其它共享锁修改或选取。

```php
DB::table('users')->find($id)->lockForUpdate()->first();
```

## 连接池

当应用存在多个连接池时，默认使用的连接池为 `db.pool`，可通过 `query` 方法指定连接池。

```php
$pool = 'db.pool2';

$user = DB::query($pool)->from('users')->find($id);
```

## 连接释放

只有在 **执行 SQL** 的时候数据库底层才会从连接池中获取连接，执行完毕后会自动释放。`Builder` 对象不再依赖 `Connection`。

> 连接释放即将连接返还到连接池。

## SQL 打印

通过 `toSql` 方法获取需执行的 SQL。

```php
echo DB::table('users')->where('id', $id)->toSql();
```

## FAQ

`where` 方法闭包函数错误运用示例：

```php
$res = DB::table('user')
    ->where(function (Builder $query) {
        $query->forPage(1, 10)
        ->orderBy('age', 'ase')
        ->where('id', 1);
    })
    ->orderBy('id', 'desc')
    ->get();
```

> 上述示例中，在闭包函数使用的 `orderBy` 和 `forPage` 方法不会生效。

