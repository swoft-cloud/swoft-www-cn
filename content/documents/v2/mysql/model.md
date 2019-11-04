+++
title = "模型"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-11-02"
weight = 702

[menu.v2]
  parent = "mysql"
  weight = 2
  identifier = "mysql-model"
+++

## 简介

无论是基础查询还是高级查询，实际都会依赖表实体，一个表字段和一个类属性的关系通过映射实现，而对类的操作也就相当于在对数据表操作。Swoft 2.x 中实体类对比 1.x 使用起来更简单，它兼容 `Builder` 查询构造器所有的方法，使用实体类和查询构造器的方法一致。

## 实体定义

一个实体类对应一张数据库表，一个实体对象代表了数据表中一行数据记录。

> 注意：实体不能作为属性被注入到任何类，因为每个实体对象来自不同的数据记录行，实体对象应当在需要使用的地方创建。

下方为一个实体定义示例，文件参考：[User.php](https://github.com/swoft-cloud/swoft-db/blob/master/test/testing/Entity/User.php)

```php
<?php declare(strict_types=1);


namespace SwoftTest\Db\Testing\Entity;

use Swoft\Db\Annotation\Mapping\Column;
use Swoft\Db\Annotation\Mapping\Entity;
use Swoft\Db\Annotation\Mapping\Id;
use Swoft\Db\Eloquent\Model;

/**
 * Class User
 *
 * @since 2.0
 *
 * @Entity(table="user", pool="db.pool")
 */
class User extends Model
{

    /**
     * @Id(incrementing=true)
     *
     * @Column(name="id", prop="id")
     * @var int|null
     */
    private $id;

    /**
     * @Column()
     * @var string|null
     */
    private $name;

    /**
     * @Column()
     * @var int|null
     */
    private $hahh;


    /**
     * @return null|int
     */
    public function getHahh(): ?int
    {
        return $this->hahh;
    }

    /**
     * @param null|int $hahh
     */
    public function setHahh(?int $hahh): void
    {
        $this->hahh = $hahh;
    }

    /**
     * @Column(name="password", hidden=true)
     * @var string|null
     */
    private $pwd;

    /**
     * @Column()
     *
     * @var int|null
     */
    private $age;

    /**
     * @Column(name="user_desc", prop="udesc")
     *
     * @var string|null
     */
    private $userDesc;

    /**
     * this key is hump
     *
     * @Column()
     *
     * @var string|null
     */
    private $testHump;

    /**
     *
     *
     * @Column(name="test_json", prop="testJson")
     * @var array|null
     */
    private $testJson;

    /**
     *
     *
     * @Column()
     * @var float|null
     */
    private $amount;

    /**
     * @return float|null
     */
    public function getAmount(): ?float
    {
        return $this->amount;
    }

    /**
     * @param float|null $amount
     */
    public function setAmount(?float $amount): void
    {
        $this->amount = $amount;
    }

    /**
     * @return null|array
     */
    public function getTestJson(): ?array
    {
        return $this->testJson;
    }

    /**
     * @param null|array $testJson
     */
    public function setTestJson(?array $testJson): void
    {
        $this->testJson = $testJson;
    }


    /**
     * @return null|string
     */
    public function getTestHump(): ?string
    {
        return $this->testHump;
    }

    /**
     * @param null|string $testHump
     */
    public function setTestHump(?string $testHump): void
    {
        $this->testHump = $testHump;
    }

    /**
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @param int|null $id
     */
    public function setId(?int $id): void
    {
        $this->id = $id;
    }

    /**
     * @return int|null
     */
    public function getAge(): int
    {
        return $this->age;
    }

    /**
     * @param int|null $age
     */
    public function setAge(?int $age): void
    {
        $this->age = $age;
    }

    /**
     * @return string|null
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * @param string|null $name
     */
    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    /**
     * @return string|null
     */
    public function getPwd(): string
    {
        return $this->pwd;
    }

    /**
     * @param string|null $pwd
     */
    public function setPwd(?string $pwd): void
    {
        $this->pwd = $pwd;
    }

    /**
     * @return string|null
     */
    public function getUserDesc(): string
    {
        return $this->userDesc;
    }

    /**
     * @param string|null $userDesc
     */
    public function setUserDesc(?string $userDesc): void
    {
        $this->userDesc = $userDesc;
    }
}
```

在完成数据库基本配置后，可通过 Swoft Devtool 快速生成，通过下方命令查看帮助信息：

```bash
php ./bin/swoft entity:create -h
```

## 注解

### Entity

通过注解标签 `@Entity` 指定类为实体类。

参数说明：

- `table`：需映射的数据库表名（必填）
- `pool`：连接池，默认为 `db.pool`

### Column

通过注解标签 `@Column` 指定成员属性为字段名。如果字段未添加 `@Column` 标签，那么在查询时该列（字段）不会展示。即使新增字段也不会影响生产环境。

参数说明：

- `name`：需映射的数据表字段名。默认值为成员属性
- `prop`：字段别名，仅在调用 `toArray` 方法时被转换。使用 `where` 等子方法时仍需使用数据库字段名
- `hidden`：字段是否隐藏。仅在调用 `toArray` 方法时会被隐藏，但并不影响通过 `getter` 方法获取。可以通过调用实体 `addVisible` 方法取消隐藏

> 说明：所有字段属性，必须要有 `getter` 和 `setter` 方法，你可以使用 `PhpStorm` 快捷键 `Alt + Insert` （macOS 为 `command + N` 或 `control + enter`）根据属性快速生成  `getter` 和 `setter` 方法。
>
> 若表字段名存在下划线，类属性需以 **小驼峰** 方式定义。例：字段名为 `user_name`，则属性应当写为 `$userName`。

### Id

该注解标签指定成员属性为主键。一个实体类仅能设置一个 `@Id` 注解标签。

参数说明：

- `incrementing`：是否为递增主键，默认为 `true`

## Prop 操作

> Swoft 版本需 `>= 2.0.6`

模型支持使用 `prop` 直接操作，在上方示例实体类中，数据表字段 `user_desc` 的 prop 为 `udesc`，Swoft 底层会自动转换，所以并不响应我们使用。

新增数据示例：

```php
User::new([
    'udesc' => $descString,
])->save();
```

查询条件示例：

```php
$where = [
    'pwd' => md5(uniqid()),
    ['udesc', 'LIKE', 'swoft%'],
    ['whereIn', 'id', [1, 2, 3]]
];

// SELECT * FROM `user` WHERE (`password` = ? AND `user_desc` LIKE ? AND `id` IN (?))';
$sql = User::whereProp($where)->toSql();
```

> 在条件中使用需通过 `whereProp` 方法连接，`whereProp` 与 `where` 用法相同。

## 新增数据

### 对象方式

```php
$user = User::new();

$user->setName('Swoft');
$user->setPwd('123456');
$user->setAge(2);
$user->setUserDesc('Great Framework');

$user->save();
// 保存之后获取 ID
$userId = $user->getId();
```

### 数组方式

```php
$attributes = [
    'name'      => 'Swoft',
    'pwd'       => '123456',
    'age'       => 2,
    'user_desc' => 'Great Framework'
];

$user = User::new($attributes);

$user->save();

$userId = $user->getId();
```

### 批量新增

批量新增数据可以直接使用 `User::insert($array)` 方法，该方法与查询构造器方法一致。

### 其它方式

你还可以使用 `firstOrCreate` 和 `firstOrNew` 方法来新增数据。`firstOrCreate` 方法会使用给定的字段及其值在数据库中查找记录，如果在数据库中找不到该模型，则会使用第一个参数中的属性以及可选的第二个参数中的属性新增数据。

`firstOrNew` 方法类似 `firstOrCreate` 方法。它会在数据库中查找匹配给定属性的记录，如果模型未被找到则会返回一个新的模型实例。请注意，在这里面 `firstOrnew` 返回的模型还尚未保存到数据库，必须调用 `save` 方法才能写入到数据库中。

以下为示例，通过 `name` 属性检索航班：

```php
// 当结果不存在时创建
$flight = Flight::firstOrCreate(['name' => 'Flight 10']);

// 当结果不存在的时候用 name 属性和 delayed 属性创建
$flight = Flight::firstOrCreate(
    ['name' => 'Flight 10'],
    ['delayed' => 1]
);

// 当结果不存在时实例化...
$flight = Flight::firstOrNew(['name' => 'Flight 10']);

// 当结果不存在的时候用 name 属性和 delayed 属性实例化
$flight = Flight::firstOrNew(
    ['name' => 'Flight 10'],
    ['delayed' => 1]
);
```

## 删除数据

### ID 方式

```php
$user = User::find($id);

$user->delete();
```

### 条件删除

```php
User::where('id', 1)->delete();
```

## 数据更新

### setter 方式

```php
$user = User::find($id);

$user->setAge(2);
$user->save();
```

### 填充方式

```php
$attributes = [
    'name'      => 'Swoft',
    'pwd'       => '123456',
    'age'       => 2,
    'user_desc' => 'Come on'
];

// 方式一
User::new($attributes)->save();

// 方式二
User::new()->fill($attributes)->save();
```

> 注意：如果该字段 **没有匹配** 到 `@Column` 标签时将会被忽略，这样能保证安全的更新和插入。

### update 方式

```php
User::find($id)->update(['age' => 2]);
```

### 批量更新

```php
User::where([
    'name' => 'Swoft',
    ['age', '>=', 1]
])->limit(2)->update(['user_desc' => 'Very nice']);
```

### 主键批量更新

```php
$values = [
    ['id' => 1, 'age' => 18],
    ['id' => 2, 'age' => 19],
];

User::batchUpdateByIds($values);
```

> 使用批量更新必须指定主键值，框架会根据主键值进行批量更新。在此例中， `id` 是 `User` 实体的  `@Id()` 主键。

### 快速更新

除 [update 方式](#update 方式) 示例代码中通过 `find($id)` 获取对象实体后 `update` 的方式外，还可以使用 `modifyById` 的方式进行快速更新。

```php
$row = User::modifyById($id, ['age' => 2]);
```

除 [批量更新](#批量更新) 示例代码中通过 `where` 条件查询后 `update` 的方式外，还可以使用 `modify` 的方式进行快速更新。

```php
$where = ['name' => 'Swoft'];
$values = ['user_desc' => 'I love Swoft'];

User::modify($where, $values);
```

### 更新/新增

可使用 `updateOrCreate` 方法实现目标数据不存在时新增数据，方法返回数据实体。

```php
$user = User::updateOrCreate(['id' => 1], ['age' => 18, 'name' => 'Swoft Framework']);

echo $user->getName();
```

也可以使用 `updateOrInsert` 方法，该方法返回值为 `bool` 类型。

```php
User::updateOrInsert(['id' => 1], ['age' => 18, 'name' => 'Swoft Framework']);
```

### 自增/自减

单字段 **自增/自减**：

```php
User::find($id)->increment('age', 1);

User::find($id)->increment('age', 1, ['name' => 'Swoft 2.0']);

User::where('id', 1)->decrement('age', 1);
```

> 参数 `$extra` 为指定同步更新的数据。

多字段 **自增/自减**：

```php
User::updateAllCounters(['name' => 'Swoft 2.0'], ['age' => -1]);

User::updateAllCountersById((array)$id, ['age' => 1], ['name' => 'Swoft 2.0']);

User::find($id)->updateCounters(['age' => -1, 'name' => 'Swoft 2.0']);
```

> 请谨慎使用条件更新，尽量使用主键更新以免造成锁表。

## 查询数据

模型的查询方法与查询构造器完全兼容。

> 使用 `join` 进行查询操作时，不会返回对象实体。

### 单行数据查询

```php
User::find(1, ['id', 'name']);

User::where('id', 1)->first(['id', 'name']);
```

### 多行数据查询

```php
User::findMany([1, 2, 3, 4], ['id','name']);

User::whereIn('id', [1, 2, 3, 4])->get(['id', 'name']);
```

### 对象实体查询

```php
$users = User::where('age', '>=', 18)->getModels(['id', 'age']);

/* @var User $user */
foreach ($users as $user) {
    $age = $user->getAge();
}
```

###  映射关系

假设我们需要以某个字段作为 `key` 映射逻辑关系，我们可以通过 `keyBy` 方法实现。

```php
$users = User::forPage(1, 10)->get(['id', 'age'])->keyBy('id');

/* @var User $user */
foreach ($users as $id => $user) {
    $age = $user->getAge();
}
```

### 结果分块

如需处理数千个 `Eloquent` 记录，可以使用 `chunk` 方法，`chunk` 方法会检索 `Eloquent` 模型的「**分块**」，然后将它们提供给指定的 `Closure` 进行处理。在处理大型结果集时，使用 `chunk` 方法可节省内存开销。

```php
Flight::chunk(200, function ($flights) {
    foreach ($flights as $flight) {
        // TODO:
    }
});
```

传递到方法的第一个参数都是希望每个「**分块**」接收的数据量。闭包作为第二个参数传递，它会在查询每个块时被调用。

### Cursor（游标）

`cursor` 用来遍历数据，游标只执行一次查询。在处理大量数据时，使用游标可以大幅度减少内存开销。

```php
foreach (Flight::where('foo', 'bar')->cursor() as $flight) {
    // TODO:
}
```

### 聚合函数

模型支持 [查询构造器](https://www.swoft.org/docs/2.x/zh-CN/db/builder.html) 提供的 `count`、`sum`、`min`、`max` 等聚合函数。

```php
$count = Flight::where('active', 1)->count();

$max = Flight::where('active', 1)->max('price');
```

### NotFound 异常

如需在模型不存在时抛出异常，可以使用 `findOrFail` 或 `firstOrFail` 方法。该方法会检索查询的第一个结果，如果目标结果不存在，则会抛出一个 `DbException`。

```php
$model = Flight::findOrFail(1);

$model = Flight::where('legs', '>', 100)->firstOrFail();
```

## 自动写时间戳

默认情况下 `Eloquent` 会对数据表中 `created_at` 和 `updated_at` 两个字段进行自动写入。如果你不需要依赖 Swoft 自动更新这两个字段，只需在模型内将 `$modelTimestamps` 属性设置为 `false` 即可。

```php
class User
{
    /**
     * @var bool
     */
    protected $modelTimestamps = false;
}
```

