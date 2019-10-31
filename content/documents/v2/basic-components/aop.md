+++
title = "AOP"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-29"
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

    通知是织入到目标类连接点上的一段代码，例如上方的权限检查及记录日志。

- Aspect（切面）

    切面由通知和切点组成，通知明确了目的，而切点明确目的地。

- Introduction（引介）

    引介指向一个现有类增加方法或字段属性。引介还可以在不改变现有类代码的情况下实现新的接口。

- Joinpoint（连接点）

    程序执行的某个特定位置，将通知放置的地方。如方法调用前、方法调用后、返回、抛出异常等。允许使用通知的地方都可称为连接点。

- Pointcut（切点）

    切点指需织入目标的方法。假设一个目标对象（类）中拥有 10 个方法，需要在其中 3 个方法中织入通知，这 3 个方法称为切点。

- Proxy（代理）

    应用通知的对象，详细内容参见设计模式里面的代理模式。代理实现了切面的业务， Swoft 使用了 **PHP-Parser** 库实现 AOP。

- Target（目标对象）

    被通知的对象类。目标含有真正的业务逻辑，可被无感知的织入。

- Weaving（织入）

    将切面应用至目标对象以创建新代理对象的过程。

## 运用声明

### 声明切面

通过注解 `@Aspect` 将类定义为切面类：

```php
<?php declare(strict_types=1);

use Swoft\Aop\Annotation\Mapping\Aspect;

/**
 * @Aspect(order=1)
 */
class DemoAspect
{
    // TODO: ...
}
```

- `order`：用于指定优先级，数字越小则优先执行。

### 声明切点

> 目标类必须指定为携带 `namespace` 的完整路径或如示例代码中在顶部 `use`。

示例代码：

```php
<?php declare(strict_types=1);

namespace App\Aspect;

use App\Services\OrderService;
use App\Services\UserService;
use Swoft\Aop\Annotation\Mapping\Aspect;
use Swoft\Aop\Annotation\Mapping\PointAnnotation;
use Swoft\Aop\Annotation\Mapping\PointBean;
use Swoft\Aop\Annotation\Mapping\PointExecution;
use Swoft\Http\Server\Annotation\Mapping\RequestMapping;

/**
 * @Aspect(order=1)
 *
 * @PointBean(
 *     include={OrderService::class,UserService::class},
 *     exclude={}
 * )
 *
 * @PointAnnotation(
 *     include={RequestMapping::class},
 *     exclude={}
 * )
 *
 * @PointExecution(
 *     include={OrderService::createOrder,UserService::getUserBalance},
 *     exclude={OrderService::generateOrder}
 * )
 */
class DemoAspect
{
    // TODO: ...
}

```
- PointBean：定义目标类切点
  - `include`：需被 **指定** 为切点的目标类集合
  - `exclude`：需被 **排除** 为切点的目标类集合
- PointAnnotation：定义 **注解类** 切点，所有使用对应注解的方法均会通过该切面类代理
  - `inlucde`：需被 **织入** 的注解类集合
  - `exclude`：需被 **排除** 的注解类集合
- PointExecution：定义确切的目标类方法。
  - `include`：需被 **织入** 的目标类方法集合，支持正则表达式
  - `exclude`：需被 **排除** 的目标类方法集合，支持正则表达式

> 使用正则表达式时，参数内容 **必须** 使用双引号 `" "` 包裹；命名空间分隔符 **必须** 使用 `\` 转义，同时双引号内 **必须** 是类的完整路径。 
>
> 以上注解定义的关系为并集，定义的排除为并集后的结果。建议为了便于理解和使用，一个切面类尽量只使用其中一个注解。 

### 声明通知

```php
<?php declare(strict_types=1);

namespace App\Aspect;

use App\Services\OrderService;
use App\Services\UserService;
use Swoft\Aop\Annotation\Mapping\After;
use Swoft\Aop\Annotation\Mapping\AfterReturning;
use Swoft\Aop\Annotation\Mapping\AfterThrowing;
use Swoft\Aop\Annotation\Mapping\Around;
use Swoft\Aop\Annotation\Mapping\Aspect;
use Swoft\Aop\Annotation\Mapping\Before;
use Swoft\Aop\Annotation\Mapping\PointExecution;
use Swoft\Aop\Point\JoinPoint;
use Swoft\Aop\Point\ProceedingJoinPoint;
use Throwable;

/**
 * @Aspect(order=1)
 *
 * @PointExecution(
 *     include={OrderService::createOrder,UserService::getUserBalance},
 *     exclude={OrderService::generateOrder}
 * )
 */
class DemoAspect
{

    /**
     * 前置通知
     *
     * @Before()
     */
    public function beforeAdvice()
    {

    }

    /**
     * 后置通知
     *
     * @After()
     */
    public function afterAdvice()
    {

    }

    /**
     * 返回通知
     *
     * @AfterReturning()
     *
     * @param JoinPoint $joinPoint
     *
     * @return mixed
     */
    public function afterReturnAdvice(JoinPoint $joinPoint)
    {
        $ret = $joinPoint->getReturn();
        // 返回
        return $ret;
    }

    /**
     * 异常通知
     *
     * @AfterThrowing()
     *
     * @param Throwable $throwable
     */
    public function afterThrowingAdvice(Throwable $throwable)
    {

    }

    /**
     * 环绕通知
     *
     * @Around()
     *
     * @param ProceedingJoinPoint $proceedingJoinPoint
     *
     * @return mixed
     * @throws Throwable
     */
    public function aroundAdvice(ProceedingJoinPoint $proceedingJoinPoint)
    {
        // 前置通知
        $ret = $proceedingJoinPoint->proceed();
        // 后置通知
        return $ret;
    }
}
```

- `@Before`：前置通知。在目标方法之前执行
- `@After`：后置通知。在目标方法之后执行
- `@AfterReturing`：返回通知
- `@AfterThrowing`：异常通知。目标方法异常时执行
- `@Around`：环绕通知。等同于前置通知加上后置通知，在目标方法之前及之后执行

## 业务示例

为了更好的理解，我们使用前置、后置通知实现一个用于计算代码执行时长的例子。

### 控制器

在控制器中测试更为直观：

```php
<?php declare(strict_types=1);

namespace App\Http\Controller;

use Swoft\Http\Server\Annotation\Mapping\Controller;
use Swoft\Http\Server\Annotation\Mapping\RequestMapping;

/**
 * @Controller(prefix="test")
 */
class TestRunTimeController
{

    /**
     * 闭包递归，计算阶乘
     *
     * @RequestMapping(route="factorial/{number}")
     *
     * @param int $number
     *
     * @return array
     */
    public function factorial(int $number): array
    {
        $factorial = function ($arg) use (&$factorial) {
            if ($arg == 1) {
                return $arg;
            }
            return $arg * $factorial($arg - 1);
        };
        return [$factorial($number)];
    }

    /**
     * 计算 1-1000 和，最后休眠 1s
     *
     * @RequestMapping(route="sum")
     */
    public function sumAndSleep(): array
    {
        $sum = 0;
        for ($i = 1; $i <= 1000; $i++) {
            $sum = $sum + $i;
        }
        sleep(1);
        return [$sum];
    }
}
```

启动 HTTP 服务后，我们可以通过访问下方两个地址执行代码：



1. [http://localhost:18306/test/factorial/100](http://localhost:18306/test/factorial/100)
2. [http://localhost:18306/test/sum](http://localhost:18306/test/sum)

### 切面类

前文已强调，通过 AOP 我们可以在不侵入原有代码的情况下实现额外的操作。请看示例：

```php
<?php declare(strict_types=1);

namespace App\Aspect;

use App\Http\Controller\TestRunTimeController;
use Swoft\Aop\Annotation\Mapping\After;
use Swoft\Aop\Annotation\Mapping\Aspect;
use Swoft\Aop\Annotation\Mapping\Before;
use Swoft\Aop\Annotation\Mapping\PointBean;
use Swoft\Aop\Point\JoinPoint;

/**
 * @Aspect(order=1)
 *
 * @PointBean(include={TestRunTimeController::class})
 */
class CalculateRunTimeAspect {

    /** @var float 执行开始 */
    private $time_begin;

    /**
     * 前置通知
     *
     * @Before()
     */
    public function beforeAdvice()
    {
        // 起点时间
        $this->time_begin = microtime(true);
    }

    /**
     * 后置通知
     *
     * @After()
     *
     * @param JoinPoint $joinPoint
     */
    public function afterAdvice(JoinPoint $joinPoint)
    {
        /** @var float 执行结束 */
        $timeFinish = microtime(true);
        $method = $joinPoint->getMethod();
        $runtime = round(($timeFinish - $this->time_begin) * 1000, 3);
        echo "{$method} 方法，本次执行时间为: {$runtime}ms \n";
    }
}
```

编写完成后重启 HTTP 服务，然后再次访问：



1. [http://localhost:18306/test/factorial/100](http://localhost:18306/test/factorial/100)
2. [http://localhost:18306/test/sum](http://localhost:18306/test/sum)

得到结果后返回控制台查看执行时间：

```bash
factorial 方法，本次执行时间为: 0.107ms
sumAndSleep 方法，本次执行时间为: 1000.319ms
```

## 通知执行顺序

前文已提到，多个切面按照 `order` 属性值进行优先级划分，数字越小优先执行。而在一个切面中的多个通知同样也按照顺序执行。

### 单切面

- 正常顺序

    ![Singular Aspect Normal](/img/singular-aspect-normal.jpg)

    1. `@Around` 环绕通知 **前** 置部分
    2. `@Before` 前置通知
    3. 目标对象方法
    4. `@Around` 环绕通知 **后** 置部分
    5. `@After` 后置通知
    6. `@AfterReturn` 返回通知

- 异常顺序

    ![Singular Aspect Exception](/img/singular-aspect-exception.jpg)
  
    1. `@Around` 环绕通知 **前** 置部分
    2. `@Before` 前置通知
    3. 目标对象方法
    4. `@Around` 环绕通知 **后** 置部分
    5. `@After` 后置通知
    6. `@AfterThrowing` 异常通知

### 多切面

![Multiple Aspects](/img/multiple-aspects.jpg)

以正常情况为例：

1. 切面 1 `@Around` 环绕通知 **前** 置部分
2. 切面 1 `@Before` 前置通知
3. 切面 2 `@Around` 环绕通知 **前** 置部分
4. 切面 2 `@Before` 前置通知
5. 目标对象方法
6. 切面 2 `@Around` 环绕通知 **后** 置部分
7. 切面 2 `@After` 后置通知
8. 切面 2 `@AfterReturn` 返回通知
9. 切面 1 `@Around` 环绕通知 **后** 置通知
10. 切面 1 `@After` 后置通知
11. 切面 1 `@AfterReturn` 返回通知

## 注意事项

AOP 仅拦截 `public` 及 `protected` 修饰的方法，不会拦截 `private` 方法。

此外，在 Swoft AOP 中，如果某个方法内调用了另一个 **被织入** 的方法时，AOP 也会向该方法织入通知。例如我们定义了一个类 `A`，它有两个 `public` 方法 `func1` 和 `func2`，然后我们定义一个切面，使用 `@PointBean(include={A::class})` 注解将 `A` 类（所有方法）进行织入，示例代码：

```php
<?php
class A
{
    function func1()
    {
        echo "func1 \n";
    }

    function func2()
    {
        $this->func1();
        echo "func2 \n";
    }
}
```

 当我们执行 `func2` 时，我们的切面会被执行 **两次**，两次执行的顺序相同。切面会先对 `func2` 织入通知，其次对 `func1` 织入通知。