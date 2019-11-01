+++
title = "命令行"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 601

[menu.v2]
  parent = "core-components"
  weight = 1
+++
swoft 提供了功能强大的命令行应用处理功能，swoft 的 `http server`、`websocket server` 等都是通过命令行启动和管理的

## 安装

```bash
composer require swoft/console
```

## 功能特性

* 命令行的解析运行是基于注解 `@Command` `@CommandMapping` 自动收集注册；
* 支持给命令、命令组设置别名,一个命令可以有多个别名；
* 功能全面的命令行的选项参数解析(命名参数，短选项，长选项 ...)，命令行下 `input`, `output` 管理、使用；
* 命令方法注释自动解析为帮助信息（支持 `@CommandOption` `@CommandArgument` `@example` 等注解）；
* 支持输出多种颜色风格的消息文本(`info`, `comment`, `success`, `warning`, `danger`, `error` 等)；
* 常用的特殊格式信息显示(`section`, `panel`, `padding`, `helpPanel`, `table`, `title`, `list`, `multiList`)；
* 丰富的动态信息显示(`pending/loading`, `pointing`, `spinner`, `counterTxt`, `dynamicText`, `progressTxt`, `progressBar`)；
* 常用的用户信息交互支持(`select`, `multiSelect`, `confirm`, `ask/question`, `askPassword/askHiddenInput`)；
* 颜色输出是 `windows` `linux` `mac` 兼容的，不支持颜色的环境会自动去除相关`CODE`；
* 支持 `协程` 和 `非协程`（传统同步阻塞）两种方式运行命令；
* 内置 `Phar` 打包工具类，可以方便的将应用打包成 `phar` 文件，方便作为工具分发和使用；
* 快速的为当前应用生成 `bash/zsh` 环境下的自动补全脚本(`TODO`)。

> `swoft/console` 基于 [inhere/php-console](https://github.com/inhere/php-console) 改进，并参考了 [symfony/console](https://github.com/symfony/console) 部分特性

## 定义命令

一个命令由命令组和执行命令组成，一个类就是一个命令组，类里面的方法对应操作命令，一个命令的运行，是通过执行命令组对应的操作命令。

{{%alert note%}}
命令逻辑里面可以使用 Swoft 所有功能
{{%/alert%}}

### 命令结构

```bash
                                        value of option: opt1
                                option: opt1  |
                                       |      |
php bin/swoft group:cmd john male 43 --opt1 value1 -y
        |         |      |    |   |                 |
     script    command   |    |   |_____        option: yes, it use shortcat: y, and it is a bool, so no value.
                         |    |___     |
                 argument: name  |   argument: age
                            argument: sex
```

### 参数与选项

* 不以 `-` 开头的都认为是参数 (eg: `status=2` `arg0`)
* 以 `-` 开头的则是选项数据
  * `--` 开头的是长选项(long-option)
  * 一个 `-` 开头的是短选项(short-option)

支持混合式选项的赋值 `--id=154` 和 `--id 154` 是等效的。

**注意:** 输入如下的字符串将会认为是布尔值

* `on|yes|true` -- `true`
* `off|no|false` -- `false`

## 注解

命令的定义主要通过 `@Command` 和 `@CommandMapping` 两个注解。
`@Command` 定义命令组名称，`@CommandMapping` 定义操作命令的映射关系。

命令的命令使用帮助信息，也是通过注解完成定义。

### @Command

**@Command** 定义命令组，标记一个类为 console 命令类。作用域：`class`

拥有属性：

* `name` _string_ 定义命令组名称，如果缺省，根据类名称自动解析
* `alias` _string_ 命令组别名，通过别名仍然可以访问它。_允许多个，以逗号隔开即可_
* `desc` _string_ 命令组描述信息说明，支持颜色标签
* `coroutine` _bool_ 定义是否为协程下运行，默认 true, 框架会启动一个协程运行此组里面的命令

> Tips: 若 `desc` 为空，将会自动解析类的第一行注释作为命令组描述

### @CommandMapping

**@CommandMapping** 定义操作命令映射关系，标明了一个具体的命令。作用域：`method`

拥有属性：

* `name` _string_ 定义命令组名称，如果缺省，会执行使用方法名称
* `alias` _string_ 命令别名，通过别名仍然可以访问它。_允许多个，以逗号隔开即可_
* `desc` _string_ 命令的描述信息说明，支持颜色标签

> Tips: 若 `desc` 为空，将会自动解析类的第一行注释作为描述

### @CommandOption

**@CommandOption** 定义一个命令的选项。作用域：`method|class`

拥有属性：

* `name` _string_ **必填项** 定义命令选项名称。eg: `opt`
* `short` _string_ 定义命令选项名称的短选项。
* `default` _mixed_ 命令选项的默认值
* `desc` _string_ 命令选项的描述信息说明，支持颜色标签
* `type` _string_ 命令选项的值类型
* `mode` _int_ 命令选项的值输入限定：必须，可选 等

> Tips: 特别的 `@CommandOption` 可以用 command 类注释上面，这样子相当于给里面所有的命令都加了公共选项。

### @CommandArgument

**@CommandArgument** 定义一个命令的参数。作用域：`method`

拥有属性：

* `name` _string_ **必填项** 定义命令参数名称。eg: `opt`
* `default` _mixed_ 命令参数的默认值
* `desc` _string_ 命令参数的描述信息说明，支持颜色标签
* `type` _string_ 命令参数的值类型
* `mode` _int_ 命令参数的值输入限定：必须，可选 等

> Tips: 命令参数是根据输入位置(有顺序的)来获取的，`name` 是代码里给这个位置的参数添加的命名。

### example 注释

`@example` 注释会被特殊处理(**不是注解**)，如果你的命令方法上面有这个注释，它的内容也会被显示到命令帮助信息上面。

## 代码示例

```php
/**
 * Provide some commands for manage and watch swoft server project
 *
 * @Command()
 */
class ServeCommand
{
    /**
     * Start the swoft server and monitor the file changes to restart the server
     *
     * @CommandMapping()
     * @CommandArgument("targetPath", type="path",
     *     desc="Your swoft project path, default is current work directory"
     * )
     * @CommandOption("interval", type="integer", default=3,
     *     desc="Interval time for watch files, unit is seconds"
     * )
     * @CommandOption(
     *     "bin-file", short="b", type="string", default="bin/swoft",
     *     desc="Entry file for the swoft project"
     * )
     * @CommandOption(
     *     "start-cmd", short="c", type="string", default="http:start",
     *     desc="the server startup command to be executed"
     * )
     * @CommandOption(
     *     "watch", short="w", default="app,config", type="directories",
     *     desc="List of directories you want to watch, relative the <cyan>targetPath</cyan>"
     * )
     * @example
     *   {binFile} run -c ws:start -b bin/swoft /path/to/php/swoft
     * @param Input $input
     */
    public function run(Input $input): void
    {
        Show::aList([
            'options'   => $input->getOpts(),
            'arguments' => $input->getArgs(),
        ]);
    }
}
```

## 使用与运行

完成定义命令后，可以执行命令，处理对应业务逻辑

* 现在你可以执行 `php bin/swoft`, 命令列表中将会显示 serve 组命令
* 执行 `php bin/swoft serve` 或者 `php bin/swoft serve -h` 将会看到 serve组里拥有的具体命令
* 执行 `php bin/swoft serve:run -h` 将会看到此命令的完整帮助信息

> 如果不特殊设置，`swoft` 默认在 `协程环境` 运行命令

{{%alert note%}}
`command` 里是始终不可能直接操作 `server`，你每运行一次 `command`，都是在一个全新的进程里，除了使用一样的代码，其他毫无关系。
{{%/alert%}}

运行 `命令组` 下面的，某个 `操作` 命令。

```bash
# 运行 http 命令组中的 start 操作
php bin/swoft http:start
```

## 输入输出对象

`输入对象` 是 `Swoft\Console\Input\Input` 的实例，用于获取用户输入的命令参数选项等信息。 命令逻辑里面，可以通过函数参数和全局函数获取输入输出对象。

`输出对象` 是 `Swoft\Console\Output\Output` 的实例，用于显示信息到控制台。命令逻辑里面，可以通过函数参数和全局函数获取输入输出对象。

### 获取输入输出对象

我们可以通过 `方法参数注入` 或 `全局函数` 两种方式来获取输入输出对象，使用方式如下。

方法参数注入示例

```php
/**
 * Test command
 *
 * @Command(coroutine=true)
 */
class TestCommand
{
    /**
     * 使用方法参数注入获取输入对象。
     * @param Input  $input 输入对象
     * @param Output $output 输出对象
     *
     * @CommandMapping("test2")
     */
    public function test(Input $input, Output $output)
    {
        // ......
    }
}
```

全局函数示例

```php
/**
 * Test command
 *
 * @Command(coroutine=true)
 */
class TestCommand
{
    /**
     * 使用全局方法获取输入对象。
     * @CommandMapping()
     */
    public function demo()
    {
        $input = \input(); //输入对象
        $output = \output(); //输出对象
        // ......
    }
}
```

### 使用示例

## 数据展示

Console 数据展示 - 提供格式化信息的输出显示。
