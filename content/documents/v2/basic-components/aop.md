+++
title = "AOP"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 503

[menu.v2]
  parent = "basic-components"
  weight = 3
+++

## 概念介绍

AOP（Aspect-oriented programming）即 **面向切面的程序设计**，AOP 和 OOP（Object-oriented programming）面向对象程序设计一样都是一种程序设计思想，AOP 只是 OOP 的补充和延伸，可以更方便的对业务代码进行解耦，从而提高代码质量和增加代码的可重用性。后面的篇章会结合实际案例，教会大家理解并学会使用 AOP。

> AOP 并不规定必须使用某种方式来实现。

## 场景

我们就日志记录功能入手带领大家理解 AOP 切面编程的优势。首先假设我们有以下需求：

- 需要对某个接口做调用记录，记录接口的调用详情（调用参数，返回结果等）。
- 当调用接口出现异常时，做特殊处理，比如记录异常日志、邮件通知运维小伙伴。

如上，我们定义了一个简单的需求，接下来我们去实现它，我们先不要考虑 AOP ，就先用你所熟悉的 OOP 思想来完成以上的需求

## 传统 OOP 实现

现在我们有一个订单服务：

```php
<?php declare(strict_types=1);

/**
 * 订单服务
 */
class OrderService
{
    /**
     * 生成订单
     *
     * @param string $product_name 商品名字
     * @param int    $quantity     购买数量
     * @param int    $user_id      用户 ID
     *
     * @return array
     */
    public function generateOrder($product_name, $quantity, $user_id): array
    {
        $price = 1000;
        $amount = $price * $quantity;
        $order = [
            'order_no'     => uniqid($user_id . time() . $amount), // 订单号
            'product_name' => $product_name,                       // 商品名称
            'price'        => $price,                              // 商品单价
            'quantity'     => $quantity,                           // 商品数量
            'amount'       => $amount                              // 订单总额
        ];
        return $order;
    }
}
```

在传统的 OOP 思想下，我们要实现所需的功能，可以创建一个类继承 `OrderService`，然后重写 `generateOrder` 方法，最后在所有使用 `OrderService` 的地方替换成新建的类。示例：

```php
<?php declare(strict_types=1);

/**
 * Class InheritOrderService
 *
 */
class InheritOrderService extends OrderService
{
    /**
     * @param string $product_name
     * @param int    $quantity
     * @param int    $user_id
     *
     * @return array
     * @throws Exception
     */
    public function generateOrder($product_name, $quantity, $user_id): array
    {
        // TODO: 记录接口调用参数
        try {
            $result = parent::generateOrder($product_name, $quantity, $user_id);
            // TODO: 处理父方法返回结果，根据返回结果进行相关处理
            return $result;
        } catch (Exception $e) {
            // TODO: 如有异常，记录异常日志并发送邮件，然后继续将异常抛出
            throw $e;
        }
    }
}
```

最后在我们调用 `OrderService` 的地方，将 `OrderService` 替换为 `InheritOrderService`：

```php
<?php declare(strict_types=1);

// $order = new OrderService(); // 注释掉旧业务调用
$order = new InheritOrderService();// 替换
$order->generateOrder('MacBook Pro', 1, 10000);
```

至此，经过上方的调整后，满足了我们的业务需求。现在我们回顾一下，过程似乎非常繁琐，耦合严重，甚至污染了 `generateOrder` 方法。如果项目中存在 **100** 处 `OrderService` 类的调用，我们就得找到这 100 个地方进行修改、替换，这就是 OOP 的思想。

这时你或许会想到使用中间件、拦截器等类似的方法来解决，其实这些方法本质上也是基于 AOP 的设计思想而来的。前文已经提到，AOP 是基于 OOP 的补充和延伸。

## AOP 实现

AOP 的主要作用是在不侵入原有代码的情况下添加新的功能。

我们知道 OOP 实际上就是对我们的功能属性、方法做一个抽象封装，能够清晰的划分逻辑单元。但是 OOP 只能够进行纵向的抽象封装，无法很好的解决 **横向** 的重复代码，而 AOP 则很好的解决了这一问题。

请看图示：

![OOP](/img/OOP.png)

如上图所示，我们有两个类：**订单类** 和 **用户类**，我们对其相关功能做了封装。但是，权限检查、日志记录等功能就是在重复的编码，而利用 AOP 思想就可以将这些功能 **横向切** 出去，然后在适当的时候再将这些功能织入进来：

![AOP](/img/AOP.png)

这就是 AOP。

## 相关术语

- Advice（通知）

  通知是织入到目标类连接点上的一段代码。

- Aspect（切面）

  切面由通知和切点组成，通知明确了目的，而切点明确目的地。

- Introduction（引介）

  引介指向一个现有类增加方法或字段属性。引介还可以在不改变现有类代码的情况下实现新的接口。

- Joinpoint（连接点）

  程序执行的某个特定位置，如方法调用前、方法调用后、返回、抛出异常等。一般来说，允许使用通知的地方都可称为连接点。

- Pointcut（切点）

- Proxy（代理）

- Target（目标对象）

- Weaving（织入）