+++
title = "管道"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 804

[menu.v2]
  parent = "redis"
  weight = 4
  identifier = "redis-pipline"

+++

## 简介

如果你需要在同一个操作中向服务端发送多个命令，推荐你使用管道命令（Pipeline）。`pipeline` 方法接收一个带有 Redis 实例的闭包函数。你可以将所有需要执行的命令发送给这个 Redis 实例，它们会一次性执行完毕。

## 示例

比如连续设置 10 个 Key，返回值为数组，你可以通过遍历判断是否全部执行成功：

```php
public function demoPipeline()
{
    $count  = 10;

    $result = Redis::pipeline(function (Redis $redis) use ($count) {
        for ($i = 0; $i < $count; $i++) {
            $redis->set("key:{$i}", $i);
        }
    });

   // count($result) == $count;

    foreach ($result as $index => $value) {
      // $index 命令索引
      // $value == true 或 $value == false
    }
}
```

