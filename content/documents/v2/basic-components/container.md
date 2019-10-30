+++
title = "容器"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-25"
weight = 502

[menu.v2]
  parent = "basic-components"
  weight = 2
+++

## 简介

Swoft 基于 `PSR-11` 规范设计了自己容器，并基于 **注解** 增强了它的功能。容器是 Swoft 最重要的设计，称得上是 Swoft 的核心精髓，也是 Swoft 各模块的实现基础。本章节将会对容器的相关基础知识做一个介绍，以便大家更好的理解容器。

## 前置知识 - IoC

IoC 即控制反转（Inversion of Control），它不是一门技术而是一种设计思想。利用 IoC 将你设计好的对象交给容器控制，而非传统地在你的对象内直接控制、处理。简单来说就是如此，理论知识总是如此，我们继续下文。

## 前置知识 - DI

DI 为依赖注入（Dependency Injection）的缩写，DI 其实也不是一门技术，它是一种实现 IoC 的方式。同样的，我们先初步认识 IoC 和 DI 的概念，然后继续阅读下方图文深入理解。

## 概念知识

我们知道一台标准的电脑拥有 USB 接口，通过 USB 接口可以扩展电脑功能，如：键盘、鼠标、U 盘、蓝牙、无线网卡等等。只要是拥有标准 USB 接口的设备，连接到电脑上就能使用。现在我们有一台没有 USB 接口的电脑，我们也拥有键盘、鼠标和 U 盘（均为标准 USB 接口设备），当我们需要使用键鼠、U 盘的功能时，就必须 **依赖** USB 接口来实现我们的目标。

![Computer](/img/computer.png)

> 这里的 USB 接口指传统 USB 接口，即 USB-A 接口。

## 理解 IoC 与 DI

让我们继续，我们通过一些伪代码来理解上述的 IoC 及 DI，首先定义我们的电脑：

```php
class Computer
{
    /** @var 电脑型号 */
    private $model;
    
    /** @var 永不断电！ */
    private $powerOn = true;
    
    public function __construct($model)
    {
        $this->model = $model;
    }
    
    public function useKeyboard()
    {
        // 使用键盘（写代码 yes~）
    }
    
    public function useMouse()
    {
        // 使用鼠标
    }
    
    public function useUDisk()
    {
        // 使用 U 盘
    }
}
```

前文提到，我们现在没有 USB，所以我们得依赖 USB 接口实现键鼠、U 盘的使用：

```php
class USBAHub
{
    public function writeCode($computer_model)
    {
    	// 果真写代码！
        echo "电脑 {$computer_model} 已开机，我正在疯狂写代码<br>";
    }
    
    public function paintWithMouse($computer_model)
    {
        // 鼠标画图
        echo "电脑 {$computer_model} 已开机，我正在构建灵感美学<br>";
    }
    
    public function storageWithUDisk($computer_model)
    {
        // U 盘存储
        echo "电脑 {$computer_model} 已开机，我用 U 盘存了...（不可描述）<br>";
    }
}
```

自从有了这个强大的 USB-A Hub 后，我们就能愉快的使用了：

```php
class Computer
{
    private $model;
    
    private $powerOn = true;
    
    public function __construct($model)
    {
        $this->model = $model;
    }
    
    public function useKeyboard()
    {
        // 使用键盘写代码
        (new USBAHub)->writeCode($this->$model);
    }
    
    public function useMouse()
    {
        // 使用鼠标画图
        (new USBAHub)->paintWithMouse($this->$model);
    }
    
    public function useUDisk()
    {
        // 使用 U 盘存储
        (new USBAHub)->storageWithUDisk($this->$model);
    }
}
```

当我们使用这台携带 USB 接口的电脑一天后：

```php
$computer = new Computer('神机 i999 + GXX9080Tx');
$computer->useKeyboard();
$computer->useMouse();
$computer->useUDisk();
```

输出内容：

```
电脑 神机 i999 + GXX9080Tx 已开机，我正在疯狂写代码
电脑 神机 i999 + GXX9080Tx 已开机，我正在构建灵感美学~
电脑 神机 i999 + GXX9080Tx 已开机，我用 U 盘存了...（不可描述）
```

可是即便是当年强大的神机也会面临岁月的折磨，我们的 USB 接口在某天变得老化，速度颇慢，跟不上时代的步伐，更不兼容最新的 **Type-C** 接口，于是我们准备更换到新一代的 USB-C（Type-C）：

![Upgrade](/img/upgrade.png)

但是，USB 接口的更换等同于更换主板（忽略处理器、内存等接口版本差异），拆机、装机、插跳线、配置 BIOS 等工作极其麻烦，我们是否可以将这个工作交给 **别人** 来完成，从而我们当一个电脑的使用者就好？将这个复杂的工作、控制权交给所谓的“别人”替我们完成的思想就叫做 **控制反转**。

> 这个“别人”可以是电脑商贩，也可以是维修店或者朋友。我们现在将“别人”称之为“帮手”。

我们将这项工作移交给 **帮手** 来完成，交给帮手完成的操作实现就是 **依赖注入**。

有了帮手之后，我们通过 **构造函数** 将帮手 **注入** 到电脑中，就能轻松使用 USB 设备了：

```php
use Components\Helper;

class Computer
{
    private $model;
    
    private $powerOn = true;
    
    private $helper;
    
    public function __construct($model, Helper $helper)
    {
        $this->model = $model;
        $this->helper = $helper;
    }
    
    public function useKeyboard()
    {
        // 使用键盘写代码
        $this->helper->writeCode($this->$model);
    }
    
    public function useMouse()
    {
        // 使用鼠标画图
        $this->helper->paintWithMouse($this->$model);
    }
    
    public function useUDisk()
    {
        // 使用 U 盘存储
        $this->helper->storageWithUDisk($this->$model);
    }
}
```

> 注入的方式有三种，分别是：基于构造函数、基于 `setter` 方法、基于接口。其中基于构造函数是最常见的注入方式。

现在我们手中除了旧的 USB-A 的键鼠、U 盘外，也新购置了 USB-C 的键鼠、U 盘，所以我们在使用这台电脑时并不关心 USB 版本：

```php
// 实例化 USB-A
$usbHub = new USBAHub();

// 如果 USB-A 老化，更新使用 USB-C
if($usbHub->isOld()) {
    $usbHub = new USBCHub();
}

// 使用 USB
$computer = new Computer('超级神机 i999 + XXX9080Ti', $usbHub);
```

> 为什么不用 USB-B 呢？USB -B 目前我们见得最多的是在打印机上，而 USB-B 和 USB-A 同样是单面插口，而 USB-C（Type-C）是双面插口（不区分正反面）。所以 USB-C 是更为合理的升级方案。

## 接口约束

前文我们通过电脑 USB 的例子理解了 IoC 和 DI，但缺少实际开发中最重要的一环——利用接口进行约束。我们应当通过接口类约束 USB-A 以及 USB-C 需要实现的功能，前文中的 **帮手** 即为接口：

```php
interface HelperInterface()
{
    public function writeCode(string $model);
    
    public function paintWithMouse(string $model);
    
    public function storageWithUDisk(string $model);
    
    public function isOld(): bool;
}
```

而无论 USB-A 还是 USB-C 均需要实现该接口，以下用 USB-C 举例：

```php
use Components\Interfaces\HelperInterface;

class USBCHub implements HelperInterface
{
    public function writeCode($computer_model)
    {
    	// 键盘写代码
        echo "电脑 {$computer_model} 已开机，我正在疯狂写代码<br>";
    }
    
    public function paintWithMouse($computer_model)
    {
        // 鼠标画图
        echo "电脑 {$computer_model} 已开机，我正在构建灵感美学<br>";
    }
    
    public function storageWithUDisk($computer_model)
    {
        // U 盘存储
        echo "电脑 {$computer_model} 已开机，我用 U 盘存了...（不可描述）<br>";
    }
    
    /**
     * 是否老化
     */
    public function isOld()
    {
        return false;
    }
}
```

> USB-C 也将在某天老化，那时可能会有 USB-D、USB-E、USB-F 存在，届时我们仅需根据 `HelperInterface` 实现相应的 `USB-D`、`USB-E`、`USB-F` 类，并将 `USB-C` 中 `isOld` 方法返回 `true` 即可实现更新，从而平滑过渡到新版本 USB 接口。

## IoC 容器

我们通过前文充分了解了如何利用 DI 实现 IoC，而实际项目中我们可能会面临几十上百个类去处理依赖关系，且类之间还会存在嵌套等问题，那么我们手动实现 IoC 就变得非常困难，效率也低。IoC 容器的出现极其便捷的替我们解决了这一烦恼。

IoC 容器的主要功能：

- 自动管理依赖关系，避免手工管理存在缺陷。
- 需要使用依赖时自动注入所需依赖。
- 管理对象生命周期。

为了更好理解 IoC 容器，我们通过一个简单的示例演示：（**代码仅作演示用，Swoft 已提供完善强大且易用的 IoC 容器**）