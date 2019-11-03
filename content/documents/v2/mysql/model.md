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

## 如何使用

如何使用

## 使用示例

使用示例
