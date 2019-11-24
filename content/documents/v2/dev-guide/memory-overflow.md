+++
title = "常见内存溢出"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"

weight = 206

[menu.v2]
  parent = "dev-guide"
  weight = 6

  
+++


## 内存溢出

内存泄漏指由于疏忽或错误造成程序未能释放已经不再使用的内存。内存泄漏并非指内存在物理上的消失，而是应用程序分配某段内存后，由于设计错误，导致在释放该段内存之前就失去了对该段内存的控制，从而造成了内存的浪费。

内存泄漏通常情况下只能由获得程序源代码的程序员才能分析出来, 也是一个比较难以排查的问题。所有需要在开发前知道一些规范

内存溢出一直向一个 `属性/变量` 写数据 , 写入超过内存最大限额, php 会抛出致命错误可能导致进程退出 

要避免内存溢出, 首先要知道常驻内存开发, 局部变量处理完毕之后会被`GC`,`静态变量/静态属性` 的值 `GC` 不会标记回收. 需要用户自己管理

不建议使用 `静态变量/静态属性` 来共享内存, 因为用户很难管理自己的内存空间

不同的进程中`PHP变量`不是共享，即使是全局变量，在A进程内修改了它的值，在B进程内是无效的，如果需要在不同的`Worker`进程内共享数据，可以用`Redis、MySQL`等工具实现`Worker`进程内共享数据


### 为什么`Config Bean`不支持动态写入

下面是 `Config Bean` 部分源码, 你可能好奇. 写入为啥会抛异常呢 ? 

下面我们就来分析这个把.

```php

<?php declare(strict_types=1);

namespace Swoft\Config;

use InvalidArgumentException;
use Swoft\Bean\Annotation\Mapping\Bean;
use Swoft\Config\Contract\ParserInterface;
use Swoft\Config\Exception\ConfigException;
use Swoft\Config\Parser\PhpParser;
use Swoft\Config\Parser\YamlParser;
use Swoft\Stdlib\Collection;
use Swoft\Stdlib\Helper\ArrayHelper;

/**
 * Class Config
 *
 * @Bean("config")
 *
 * @since 2.0
 */
class Config
{
    /**
     * The items contained in the collection.
     *
     * @var array
     */
    protected $items = [];

    // ......

    /**
     * Get value
     *
     * @param mixed $key
     *
     * @return mixed
     */
    public function offsetGet($key)
    {
        return ArrayHelper::get($this->items, $key);
    }

    /**
     * @param mixed $key
     * @param mixed $value
     *
     * @throws ConfigException
     */
    public function offsetSet($key, $value): void
    {
        throw new ConfigException('Config is not supported offsetSet!');
    }

    /**
     * @param string $key
     *
     * @throws ConfigException
     */
    public function offsetUnset($key): void
    {
        throw new ConfigException('Config is not supported offsetUnset!');
    }

    /**
     * @param array|string $keys
     *
     * @return Collection
     * @throws ConfigException
     */
    public function forget($keys): Collection
    {
        throw new ConfigException('Config is not supported forget!');
    }

    // ......
}

```

在 `Config` 中有一个 `item` 属性, 虽然他不是静态的. 但是我们需要明白 单例的 Bean 是全局的生命周期
在创建启动时已经创建创建好了. 如果 `Config` 支持了写入. 可能因为某段代码修改了配置导致`脏读`. 请求写入的配置是不会被垃圾回收 

所有我们需要明白 `Swoft Bean` 的生命周期

下面 是一张简单的 生命周期 `Bean`

```php

php bin/swoft
    

singleton bean

------------------------------request
                                |
request bean                    |
                                |
------------------------------response

singleton bean

------------------------------
```

`singleton bean` 是全局存在的, 所以 `singleton` 类型的 `bean` 值是不允许动态修改的.

需要借助属性来存储 结果值 请使用 `request/prototype` 类型的 `bean`. 详情参考 `Bean` 章节. 

### 非常驻内存框架常用 代码

```php
<?php declare(strict_types=1);

namespace App\Model\Logic;

use App\Model\Data\UserData;
use Swoft\Bean\Annotation\Mapping\Inject;

class UserLogic
{

    /**
     * @Inject()
     *
     * @var UserData
     */
    private $userData;

    /**
     * @var array 
     */
    private static $userCache = [];

    /**
     * @var string
     */
    public static $lastError = '';


    /**
     * Get user list
     *
     * @param array $userIds
     *
     * @return array
     */
    public function getUsers(array $userIds): array
    {
        $users = [];
        foreach ($userIds as $k => $userId) {
            if (isset(self::$userCache[$userId])) {
                $users[] = self::$userCache[$userId];
                unset($userId[$k]);
            }
        }

        if ($userIds) {
            return $users;
        }

        $list = $this->userData->getList($userIds);

        if (empty($list)) {
            self::$lastError = 'get user fail';
            return [];
        }

        foreach ($list as $user) {
            $userId = $user['uid'];

            $users[] = self::$userCache[$userId];

            self::$userCache[$userId] = $user;
        }

        return $users;
    }
}

```

上面代码有以上两个问题

- 使用静态属性 `$userCache` 静态属性来存储查询结果集, 在同一进程下的请求数据是共享的,多个请求都写入当超过内存限额就会导致进程退出, 也就是`内存泄露`
- 使用 `$lastError` 静态属性来, 存储上一次错误信息, 在同一进程下的请求数据是共享的可能会导致数据错乱, 这也就是`swoft` 没有类似 `get_last_sql()` 这样的函数

由于基于 `php-fpm` 的多进程模式开发,每个请求的数据是独立的, 使用静态变量共享本次请求数据也是常用的方法

但是在常驻内存下开发, 请不要使用 `静态属性/全局变量/静态变量` 来共享数据, 因为`swoft` 是基于 `协程`模式, 一个进程下面的协程的数据都是共享

并发修改静态属性的情况就会导致数据错乱. 使用 `static, global` 关键字定义变量也是同理, 请谨慎使用 .

