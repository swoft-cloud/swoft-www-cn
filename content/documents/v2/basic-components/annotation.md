+++
title = "注解"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2019-10-24"
weight = 501

[menu.v2]
  parent = "basic-components"
  weight = 1
+++

## 概念介绍

注解（Annotation）又称标注，Java 最早在 2004 年的 JDK 5 中引入的一种注释机制。目前 PHP 官方版本并未提供内置元注解和注解概念，但我们通过 ` ReflectionClass ` 反射类解析 PHP 代码注释从而实现了自己的一套注解机制。

## 如何使用

就像我们日常开发写注释一样，只需在类、方法或成员变量上方按规则添加注释即可，如定义一个控制器及其路由：

```php
use Swoft\Http\Message\Request;
use Swoft\Http\Server\Annotation\Mapping\Controller;
use Swoft\Http\Server\Annotation\Mapping\RequestMapping;

/**
 * Class Home
 *
 * @Controller(prefix="home")
 */
class Home
{
    /**
     * 该方法路由地址为 /home/index
     *
     * @RequestMapping(route="/index", method="post")
     *
     * @param Request $request
     */
    public function index(Request $request)
    {
        // TODO:
    }
}
```

> 注意需引入相关注解（Annotation）类，**且必须以 `/**` 开始并以 `*/` 结束，否则会导致无法解析！**

## 开发规范
Swoft 框架注解规范如下：

- 类注解：所有类注释后面
- 属性注解：属性描述之后，其它注释之前
- 方法注解：方法描述之后，其它注释之前

> 请 **严格** 按照规范使用注解，避免产生错误。如有更佳方式，欢迎提供建议。

## 开发工具

参阅：[快速开始 - 框架安装 - IDE 插件](/documents/v2/quick-start/install/#ide-插件) 在 **IDEA** 或 **PhpStorm** 中安装 **PHP Annotation** 插件以提供开发帮助。

