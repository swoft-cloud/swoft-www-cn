+++
title = "事务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 803

[menu.v2]
  parent = "redis"
  weight = 3
  identifier = "redis-transaction"

+++

## 简介

Redis 事务不支持回滚，但能保证原子性。但通过 `lua` 脚本也能实现 Redis 事务效果。

## 示例

事务操作的返回数据比较特殊，返回偶数为是否成功，奇数为执行 `key`。下方为一个结果遍历的事务操作示例：

```php
$count = 2;

$result = Redis::transaction(function (Redis $redis) use ($count) {
    for ($i = 0; $i < $count; $i++) {
        $key = "key:{$i}";
        $redis->set($key, $i);
        $redis->get($key);
    }
});

/*
$result = array(4) {
    [0] => bool(true)
    [1] => int(0)
    [2] => bool(true)
    [3] => int(1)
}*/

foreach ($result as $index => $value) {
    if ($index % 2 == 0) {
        // 是否执行成功
        if ($value) {
            // TODO:
        }
    }
}
```

