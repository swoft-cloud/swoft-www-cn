+++
title = "数据库"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 307

[menu.v1]
  parent = "component-list"
  weight = 7
+++
提供ActiveRecord常见的操作方式，方便简单快捷。

开始事务后，之间的所有操作都在同一个事务里面，但是不支持并发操作，因为是同一个连接。

查询器是一套封装面向对象的方法，来实现SQL拼装和操作。

## SQL语句

获取最后执行SQL语句，调用get_last_sql()全局函数。

> 组件版本必须不小于1.1.0，之前版本需要调整升级才能使用当前最新操作，不兼容之前版本。

## 数据库配置

主要是配置数据库主从连接信息，Swoft 提供 `properties` 和 `env` 两种方式配置，且 `env` 会覆盖 `properties` 配置。

> 主从都配置，默认读操作使用从配置，写操作使用主配置. 若**只配置主**，读写操作都会使用主配置

### 一些说明

- 数据库实例: 实例相当于分类，如下面看到的含有默认的两个节点 `master` `slave`, 属于默认实例 `default`
- 数据库节点: 每个实例下的item，都是一个节点，key 是节点名称。 通常我们会用两个节点，分别命名为 `master` `slave`
- 每个节点都会创建一个连接池，池的名称是 `instance.node` 例如下面的 `default.master` `other.master`
  - 通过 `\Swoft::getPool('instance.node')` 可以拿到连接池对象

> 您可以自定义实例和节点的名称，不过使用时要注意区分和选择。当然，我们推荐使用通用的命名

### properties

配置 `config/properties/db.php`

```php
return [
    'master' => [
        'name'        => 'master',
        'uri'         => [
            '127.0.0.1:3306/test?user=root&password=123456&charset=utf8',
            '127.0.0.1:3306/test?user=root&password=123456&charset=utf8',
        ],
        'minActive'   => 8,
        'maxActive'   => 8,
        'maxWait'     => 8,
        'timeout'     => 8,
        'maxIdleTime' => 60,
        'maxWaitTime' => 3,
    ],
    'slave' => [
        'name'        => 'slave',
        'uri'         => [
            '127.0.0.1:3306/test?user=root&password=123456&charset=utf8',
            '127.0.0.1:3306/test?user=root&password=123456&charset=utf8',
        ],
        'minActive'   => 8,
        'maxActive'   => 8,
        'maxWait'     => 8,
        'timeout'     => 8,
        'maxIdleTime' => 60,
        'maxWaitTime' => 3,
    ],
];
```

- master/slave 主从配置
- name 连接池节点名称，用于服务发现
- uri 连接地址信息
- minActive 最小活跃链接数
- maxActive 最大活跃连接数
- maxIdleTime 连接最大空闲时间，单位秒
- maxWaitTime 连接最大等待时间，单位秒
- maxWait 最大等待连接
- timeout 超时时间，单位秒

> master,slave 是两个特殊的名称，他们会归纳到 `default` 实例中去。表现为 `default.master`, `default.slave`

- 像上面直接写 master,slave 框架会自动将这两个划分到 `default` 实例中去
- 所以这里实际结构该是下面这样的(_允许上面的配置是为了兼容之前的版本_), 新增实例应当遵循这个结构

```php
'default' => [
    'master' => [ // ...],
    'slave' => [ // ...],
]
```

### env

配置.env文件

```ini
# the pool of master nodes pool
DB_NAME=dbMaster
DB_URI=127.0.0.1:3306/test?user=root&password=123456&charset=utf8,127.0.0.1:3306/test?user=root&password=123456&charset=utf8
DB_MIN_ACTIVE=6
DB_MAX_ACTIVE=10
DB_MAX_WAIT=20
DB_MAX_IDLE_TIME=60
DB_MAX_WAIT_TIME=3
DB_TIMEOUT=200

# the pool of slave nodes pool
DB_SLAVE_NAME=dbSlave
DB_SLAVE_URI=127.0.0.1:3306/test?user=root&password=123456&charset=utf8,127.0.0.1:3306/test?user=root&password=123456&charset=utf8
DB_SLAVE_MIN_ACTIVE=5
DB_SLAVE_MAX_ACTIVE=10
DB_SLAVE_MAX_WAIT=20
DB_SLAVE_MAX_WAIT_TIME=3
DB_SLAVE_MAX_IDLE_TIME=60
DB_SLAVE_TIMEOUT=200
```

- DB/DB_SLAVE_NAME 连接池节点名称，用于服务发现
- DB/DB_SLAVE_URI 连接地址信息
- DB/DB_SLAVE_MIN_ACTIVE 最小活跃链接数
- DB/DB_SLAVE_MAX_ACTIVE 最大活跃连接数
- DB/DB_SLAVE_MAX_IDLE_TIME 连接最大空闲时间，单位秒
- DB/DB_SLAVE_MAX_WAIT_TIME 连接最大等待时间，单位秒
- DB/DB_SLAVE_MAX_WAIT 最大等待连接
- DB/DB_SLAVE_TIMEOUT 超时时间，单位秒

### 数据库实例

上面的配置都是属于默认实例 `default`, 含有两个节点 `master` `slave`

### 增加实例

增加实例需在 `db.php` 增加新的实例配置，如下：

- 新增实例 `other`
- 它同样含有两个节点 `master` `slave`

```php
return [
    // ...
    'other' => [
        'master' => [
            'name'        => 'master2',
            'uri'         => [
                '127.0.0.1:3301',
                '127.0.0.1:3301',
            ],
            'maxIdel'     => 1,
            'maxActive'   => 1,
            'maxWait'     => 1,
            'timeout'     => 1,
        ],

        'slave' => [
            'name'        => 'slave3',
            'uri'         => [
                '127.0.0.1:3301',
                '127.0.0.1:3301',
            ],
            'maxIdel'     => 1,
            'maxActive'   => 1,
            'maxWait'     => 1,
            'timeout'     => 1,
        ],
    ],
];
```

> 注意： 新增实例除了要添加配置外，还需新增相关的 pool配置类，pool类，请参照 `app/Pool` 和 `swoft/db` 的test示例

## 实体定义

无论是高级查询还是基础查询，都会需要一个表实体。一个表字段和一个类属性是一一映射，对类的操作相当于对表的操作，该类称为一个实体

- 一个实体类对应一张数据库的表结构
- 实体对象代表了表的一行数据记录

> 注意： 实体不能作为属性被注入到任何类, 因为每个实体对象都是不同的数据记录行。实体对象都是在哪用就在哪里创建它。

### @Entity

标记一个类是一个实体，无需多余参数

参数：

- `instance` 定义实体对应实例，默认 `default` 实例 _对，就是前面配置上的那个`default`实例:)_

> 若需使用基础查询，必须继承Model

### @Table

- name 定义该实体映射的数据库表名

### @Column

参数：

- name 定义类属性映射的表字段，没该注解标记的属性，不映射
- type 定义字段数据更新时验证类型，暂时提供常见的数据类型延迟，后续会更多

说明：

- 若定义type，可定义其它验证条件
- 所有字段属性，必须要有`getter`和`setter`方法

> 类属性默认值即是表字段默认值

### @Id  

该注解标明当前类属性对应了数据库表中的主键，**必须**有这个注解标记

### 快速生成实体类

swoft 提供了内置命令帮助快速生成实体类。

```bash
php bin/swoft entity:create -d dbname mytable,table2
```

> 更多使用信息请查看 [命令创建实体](create-entity.md) 或者使用 `-h` 查看命令帮助信息

### 示例

```php
/**
 * @Entity()
 * @Table(name="user")
 */
class User extends Model
{
    /**
     * 主键ID
     *
     * @Id()
     * @Column(name="id", type=Types::INT)
     * @var null|int
     */
    private $id;

    /**
     * 名称
     *
     * @Column(name="name", type=Types::STRING, length=20)
     * @Required()
     * @var null|string
     */
    private $name;

    /**
     * 年龄
     *
     * @Column(name="age", type=Types::INT)
     * @var int
     */
    private $age = 0;

    /**
     * 性别
     *
     * @Column(name="sex", type="int")
     * @var int
     */
    private $sex = 0;

    /**
     * 描述
     *
     * @Column(name="description", type="string")
     * @var string
     */
    private $desc = "";

    /**
     * 非数据库字段，未定义映射关系
     *
     * @var mixed
     */
    private $otherProperty;

    /**
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int|null $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return null|string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param null|string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return int
     */
    public function getAge(): int
    {
        return $this->age;
    }

    /**
     * @param int $age
     */
    public function setAge(int $age)
    {
        $this->age = $age;
    }

    /**
     * @return int
     */
    public function getSex(): int
    {
        return $this->sex;
    }

    /**
     * @param int $sex
     */
    public function setSex(int $sex)
    {
        $this->sex = $sex;
    }

    /**
     * @return string
     */
    public function getDesc(): string
    {
        return $this->desc;
    }

    /**
     * @param string $desc
     */
    public function setDesc(string $desc)
    {
        $this->desc = $desc;
    }

    /**
     * @return mixed
     */
    public function getOtherProperty()
    {
        return $this->otherProperty;
    }

    /**
     * @param mixed $otherProperty
     */
    public function setOtherProperty($otherProperty)
    {
        $this->otherProperty = $otherProperty;
    }
}
```

## 数据库查询器

查询器，提供可以使用面向对象的方法操作数据库。

### 方法列表

| 方法 | 功能 |
| :--- | :--- |
| insert | 插入数据 |
| batchInsert | 批量插入数据 |
| update | 更新数据 |
| delete | 删除数据 |
| counter | count数据 |
| get | 查询数据 |
| one | 查询一行数据 |
| table | 指定表名及别名 |
| innerJoin | 内连接 |
| leftJoin | 左连接 |
| rightJoin | 右连接 |
| condition | 通过数组结构快速指定条件 |
| where | where 条件语句 |
| andWhere | where and 条件语句 |
| openWhere | where 里面左括号 |
| closeWhere | where 里面右括号 |
| orWhere | where or 条件语句 |
| whereIn | where in语句 |
| whereNotIn | where not in 语句 |
| whereBetween | where between and 语句 |
| whereNotBetween | where not between and语句 |
| having | having语句 |
| andHaving | having and语句 |
| orHaving | having or语句 |
| havingIn | having in语句 |
| havingNotIn | having not in语句 |
| havingBetween | having between and语句 |
| havingNotBetween | havin not between and 语句 |
| openHaving | having括号开始语句 |
| closeHaving | having括号结束语句 |
| groupBy | group by语句 |
| orderBy | order by语句 |
| condition | 条件查询 |
| limit | limit语句 |
| count | count语句 |
| max | max语句 |
| min | min语句 |
| avg | avg语句 |
| sum | sum语句 |
| setParameter | 设置参数 |
| setParameters | 设置多个参数 |
| selectDb | 设置连接的DB |
| selectNode | 选择连接的节点 |
| selectInstance | 选择连接的实例 |
| force | 强制使用 Master 节点 |
| className | 设置数据的实体对象类 |

### 获取最后执行的 SQL

直接通过 `get_last_sql()` 函数从 SQLStack 中获得最后执行的 SQL

### 规则与格式

- 语句中的表名，可以是数据库表名，也可以是表对应的实体类名
- 查询器都是通过getResult\(\)方法获取结果
- 插入操作，成功返回插入ID，如果ID传值，插入数据库返回0，错误返回false
- 更新操作，成功返回影响行数，如果失败返回false
- 删除操作，成功返回影响行数，如果失败返回false
- 查询操作，单条记录成功返回一维数组或一个实体，多条记录返回多维数组或实体数组

## AR快速操作

Model里面提供了常见的数据库操作方式。

### 插入数据

#### 对象方式

```php
$user = new User();
$user->setName('name');
$user->setSex(1);
$user->setDesc('this my desc');
$user->setAge(mt_rand(1, 100));
$id  = $user->save()->getResult();
```

#### 数组填充

```php
$data = [
    'name' => 'name',
    'sex'  => 1,
    'desc' => 'desc2',
    'age'  => 100,
];

$user   = new User();
$result = $user->fill($data)->save()->getResult();
```

#### 数组方式

```php
$user         = new User();
$user['name'] = 'name2';
$user['sex']  = 1;
$user['desc'] = 'this my desc9';
$user['age']  = 99;
$result = $user->save()->getResult();
```

#### 批量插入

```php
$values = [
    [
        'name'        => 'name',
        'sex'         => 1,
        'description' => 'this my desc',
        'age'         => 99,
    ],
    [
        'name'        => 'name2',
        'sex'         => 1,
        'description' => 'this my desc2',
        'age'         => 100,
    ]
];

$result = User::batchInsert($values)->getResult();
```

### 删除数据

#### 对象删除
 
```php
/* @var User $user */
$user   = User::findById($id)->getResult();
$result = $user->delete()->getResult();
$this->assertEquals(1, $result);
```

#### 主键删除一条数据  
 
```php
$result = User::deleteById(1)->getResult();
```

#### 主键删除多条数据
 
```php
$result = User::deleteByIds([1,2])->getResult();
```

#### 删除一条数据

```php
// delete from user where name='name2testDeleteOne' and age=99 and id=1 limit 1
$result = User::deleteOne(['name' => 'name2testDeleteOne', 'age' => 99, 'id' => 1])->getResult();
```

#### 删除多条数据

```php
// delete from user where name='name' and id in (1,2)
$result = User::deleteAll(['name' => 'name', 'id' => [1,2])->getResult();
```

### 更新数据

#### 实体更新
 
```php
/* @var User $user */
$user = User::findById(1)->getResult();
$user->setName('newName');
$updateResult = $user->update()->getResult();
```

#### 更新一条数据
 
```php
// update user set name='testUpdateOne' where id=1 limit 1
$result = User::updateOne(['name' => 'testUpdateOne'], ['id' => 1])->getResult();
```

#### 更新多条数据  
 
```php
// update user set name='testUpdateOne' where id in (1,2)
$result = User::updateAll(['name' => 'testUpdateAll'], ['id' => [1,2]])->getResult();
```

### 查询数据

使用AR实体查询，返回结果是都是实体对象，不是数组。

#### 查询一条数据
 
```php
// select id,name from user where id=1 limit 1
$user2 = User::findOne(['id' => 1], ['fields' => ['id', 'name']])->getResult();
```

#### 查询多条数据

```
findAll(array $condition = [], array $options = [])
```

- `$condition` 查找条件，数组
- `$options` 额外选项。 如： `orderby` `limit` `offset`

使用示例：

```php
// select * from user where name='testUpdateAll' and id in (1,2)
$result = User::findAll(['name' => 'testUpdateAll', 'id' => [1,2]])->getResult();

// select * from user where name='tom' and id > 2 order by createAt DESC
$result = User::findAll(['name' => 'tom', ['id', '>', 2]], ['orderby' => ['createAt' => 'DESC'])->getResult();

// select * from user where name like '%swoft%' order by createAt DESC limit 10
$result = User::findAll([['name', 'like', '%swoft%']], ['orderby' => ['createAt' => 'DESC'], 'limit' => 10])->getResult();
```

#### 主键查询一条数据  
 
```php
// selet * from user where id=1
/* @var User $user */
$user = User::findById(1)->getResult();
```

#### 主键查询多条数据
 
```php
// select id from user where id in(1,2) order by id asc limit 0,2
$users = User::findByIds([1,2], ['fields' => ['id'], 'orderby' => ['id' => 'asc'], 'limit' => 2])->getResult();
```

#### 实体查询器
 
```php
// select * from user order by id desc limit 0,2
$result = User::query()->orderBy('id', QueryBuilder::ORDER_BY_DESC)->limit(2)->get()->getResult();
```

#### 主键是否存在查询  
 
存在返回true,不存在返回false

```php
User::exist(1)->getResult()
```

#### 计数查询

直接返回满足条件的行数
 
```php
$count = User::count('id', ['id' => [1,2]])->getResult();
```

## 查询器使用

插入数据

```php
$values = [
    'name'        => 'name',
    'sex'         => 1,
    'description' => 'this my desc',
    'age'         => 99,
];
$result = Query::table(User::class)->insert($values)->getResult();
```

删除数据

```php
$result = Query::table(User::class)->where('id', 1)->delete()->getResult();
```

更新数据

```php
$result = Query::table(User::class)->where('id', 1)->update(['name' => 'name666'])->getResult();
```

查询数据

```php
$result = Query::table(User::class)->where('id', 1)->limit(1)->get()->getResult();
```

聚合操作

```php
$count    = Query::table(User::class)->count('id', 'userCount')->getResult();
$countNum = $count['userCount'];

$ageNum    = Query::table(User::class)->sum('age', 'ageNum')->getResult();
$ageNum = $ageNum['ageNum'];

$maxAge = Query::table(User::class)->max('age', 'maxAge')->getResult();
$maxAge = $maxAge['maxAge'];

$minAge    = Query::table(User::class)->min('age', 'minAge')->getResult();
$minAge = $minAge['minAge'];

$avgAge = Query::table(User::class)->avg('age', 'avgAge')->getResult();
$avgAge = $avgAge['avgAge'];
```

切换数据库实例

```php
$data   = [
    'name'        => 'name',
    'sex'         => 1,
    'description' => 'this my desc instance',
    'age'         => mt_rand(1, 100),
];
$userid = Query::table(User::class)->selectInstance('other')->insert($data)->getResult();
$user2 = Query::table(User::class)->selectInstance('other')->where('id', $userid)->limit(1)->get()->getResult();
```

切换数据库

```php
$data   = [
    'name'        => 'name',
    'sex'         => 1,
    'description' => 'this my desc table',
    'age'         => mt_rand(1, 100),
];
$userid = Query::table(User::class)->selectDb('test2')->insert($data)->getResult();
$user2 = Query::table(User::class)->selectDb('test2')->where('id', $userid)->limit(1)->get()->getResult();
```

## SQL与事务

### SQL原生语句

```php
// 增删改查操作
$result = Db::query('insert into user(name, sex,description, age) values("' . $name . '", 1, "xxxx", 99)')->getResult();
$result = Db::query('delete from user where id=' . $id)->getResult();
$result = Db::query('update user set name="' . $name . '" where id=' . $id)->getResult();
$result = Db::query('select * from user where id=' . $id)->getResult();

// 参数绑定
$result = Db::query('select * from user where id=:id and name=:name', ['id' => $id, ':name'=>'name'])->getResult();
$result2 = Db::query('select * from user where id=? and name=?', [$id, 'name'])->getResult();
```

### 事务

开启事务后，事务之间的所有操作都是同一个连接，注意不能使用并发操作。

```php
Db::beginTransaction();

$user = new User();
$user->setName('name');
$user->setSex(1);
$user->setDesc('this my desc');
$user->setAge(mt_rand(1, 100));

$userId = $user->save()->getResult();

$count = new Count();
$count->setUid($userId);
$count->setFollows(mt_rand(1, 100));
$count->setFans(mt_rand(1, 100));

$countId = $count->save()->getResult();

Db::commit();
//Db::rollback();
```