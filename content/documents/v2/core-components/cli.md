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

### Composer 安装

```bash
composer require swoft/console
```

### Git 仓库

* Github [https://github.com/swoft-cloud/swoft-console](https://github.com/swoft-cloud/swoft-console)

## 参与贡献

欢迎参与贡献，您可以

* fork 我们的开发仓库 [swoft/component](https://github.com/swoft-cloud/swoft-component)
* 修改代码然后发起 PR
* 阅读 [提交代码](/documents/v2/contribute/sub-codes/) 的注意事项

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

* `name` _string_ **必填项** 定义命令选项名称 eg: `opt`
* `short` _string_ 定义命令选项名称的短选项
* `default` _mixed_ 命令选项的默认值
* `desc` _string_ 命令选项的描述信息说明，支持颜色标签
* `type` _string_ 命令选项的值类型
* `mode` _int_ 命令选项的值输入限定：`Command::OPT_BOOLEAN (int 1 可选)`，`Command::OPT_REQUIRED (int 2 必须)`

> Tips: 特别提示 `@CommandOption` 可以用在 `@Command` 类注解上面，这样子相当于给里面所有的命令都加了公共选项。

### @CommandArgument

**@CommandArgument** 定义一个命令的参数。作用域：`method`

拥有属性：

* `name` _string_ **必填项** 定义命令参数名称。eg: `opt`
* `default` _mixed_ 命令参数的默认值
* `desc` _string_ 命令参数的描述信息说明，支持颜色标签
* `type` _string_ 命令参数的值类型
* `mode` _int_ 命令选项的值输入限定：`Command::OPT_BOOLEAN (int 1 可选)`，`Command::OPT_REQUIRED (int 2 必须)`

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

* 现在你可以执行 `php bin/swoft`, 命令列表中将会显示 `serve` 组命令
* 执行 `php bin/swoft serve` 或者 `php bin/swoft serve -h` 将会看到 serve组里拥有的具体命令
* 执行 `php bin/swoft serve:run -h` 将会看到此命令的完整帮助信息

> 如果不特殊设置，`swoft` 默认在 `协程环境` 运行命令

{{%alert note%}}
`command` 里是始终不可能直接操作 `server`，你每运行一次 `command`，都是在一个全新的进程里，除了使用一样的代码，其他毫无关系。
{{%/alert%}}

运行 `serve` 下面的，某个 `run` 命令。

```bash
# 运行 http 命令组中的 start 操作
php bin/swoft serve:run -h
```

渲染效果

{{< figure library="true" src="cli-run-example.png" numbered="false" lightbox="true">}}

### 更多命令

|命令|说明|
|:----|:----|
|php bin/swoft [-h,--help]|查看当前已经定义的所有命令组|
|php bin/swoft -v \| --version|查看当前 swoft 框架版本信息|
|php bin/swoft `xxx` [-h,--help]|查看 `xxx` 命令组帮助信息|
|php bin/swoft `xxx:yyy` -h \|--help|查看 `xxx` 命令组下的 `yyy` 操作的帮助信息|
|php bin/swoft `xxx:yyy`|执行 `xxx` 命令组下的 `yyy` 操作|

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

### 使用输入输出对象

通过前面 [定义命令](#定义命令) 这一部分的介绍，我们已经知道了命令参数，命令选项。

现在，在终端中执行如下的命令，用于演示参数选项等信息的解析。

```bash
php bin/swoft demo:test status=2 name=john arg0 -s=test --page 23 --id=154 -e dev -v vvv -d -rf --debug --test=false
```

> **注意：** 输入如下的字符串将会认为是布尔值

* `on|yes|true` = `true`
* `off|no|false` = `false`

#### 获取基本信息

```php
echo $input->getScriptFile();  // 'bin/swoft' 执行的入口脚本文件
echo $input->getCommand(); // 'demo:test' 命令名称 解析到的第一个参数将会被认为是命令名称，并且不会再存入到 参数列表中
echo $input->getPwd(); // 当前工作目录
```

#### 命令参数信息

> 通常的参数如 `arg0` 只能根据 `index key` 来获取值。但是提供以等号(`=`)连接的方式来指定参数名(eg: `status=2`)

打印所有的参数信息

```php
var_dump($input->getArgs());
```

输出

```php
array(3) {
  'status' => string(1) "2"
  'name' => string(4) "john"
  [0] => string(4) "arg0"
}
```

#### 获取命令参数值

```php
// argument
$first = $input->getFirstArg(); // 'arg0'
$status = $input->getArg('status', 'default value'); // '2'
$status = $input->getInt('status'); // 2
// 获取一个必须的参数，若用户没有输入值，将会抛出错误信息
$id = $input->getRequiredArg('id');
```

#### 命令选项信息

获取解析后的选项信息

* 没有值的选项，将设置默认值为 `bool(true)`
* 短选项不仅仅只是以一个 - 开头，而且名称 只能是一个字符
* 多个(默认值的)短选项可以合并到一起写。如 `-rf` 会被解析为两个短选项 `'r' => bool(true) 'f' => bool(true)`

示例

```php
var_dump($input->getOpts());
// var_dump($input->getLOpts()); // 只打印长选项信息
// var_dump($input->getSOpts()); // 只打印短选项信息
```

输出

```php
array(10) {
  's' => string(4) "test"
  'e' => string(3) "dev"
  'v' => string(3) "vvv"
  'd' => bool(true)
  'r' => bool(true)
  'f' => bool(true)
  'page' => string(2) "23"
  'id' =>   string(3) "154"
  'debug' => bool(true)
  'test' => bool(false)
}
```

#### 获取选项值

输入对象中提供了非常多的选项值获取方法，方便快速的获取需要的信息。

```php
// option
$page = $input->getOpt('page') // '23'
$page = $input->getIntOpt('page') // 23
$debug = $input->getBoolOpt('debug') // True
$test = $input->getBoolOpt('test') // False

$d = $input->getBoolOpt('d') // True
// 获取到一个值就返回，对同一个含义的选项选项非常有用
$showHelp = $input->sameOpt(['h','help']);
// 获取一个必须的选项，若用户没有输入值，将会抛出错误信息
$id = $input->getRequiredOpt('id');
```

#### 读取用户输入

```php
echo "Your name:";
$name = $input->read();
echo 'input is ' . $name; // 'inhere'
```

效果(in terminal)：

```bash
Your name: inhere
input is inhere
```

## 数据展示

Console 数据展示 - 提供格式化信息的输出显示。

主要功能封装在命名空间 `Swoft\Console\Advanced\Formatter` 下，提供了 `Swoft\Console\Helper\Show` 辅助类来快速使用它们。

### 标题文本输出

使用 `Show::title()/$output->title()`

```php
public static function title(string $title, array $opts = [])
```

### 段落式文本输出

使用 `Show::section()/$output->section()`

```php
public static function section(string $title, string|array $body, array $opts = [])
```

### 列表数据展示输出

```php
public static function aList(array $data, string $title, array $opts = [])
```

* `$data array` 列表数据。可以是 `key-value` 形式，也可以只有 `value`，还可以两种混合。
* `$title string` 列表标题。可选的
* `$opts array` 选项设置(**同表格、面板的选项**)
  * `leftChar` 左侧边框字符。默认两个空格，也可以是其他字符(eg: `* .`)
  * `keyStyle` 当 `key-value` 形式时，渲染 `key` 的颜色风格。 默认 `info`, 设为空即是不加颜色渲染
  * `titleStyle` 标题的颜色风格。 默认 `comment`

> `aList` 的默认选项，可以渲染一个命令的帮助信息。

使用 `Show::aList()/$output->aList()`

```php
$title = 'list title';
$data = [
     'name'  => 'value text', // key-value
     'name2' => 'value text 2',
     'more info please XXX', // only value
];
Show::aList($data, $title);
```

渲染效果

{{< figure library="true" src="fmt-list.png" numbered="false" lightbox="true">}}

### 多列表数据展示输出

```php
public static function mList(array $data, array $opts = [])
```

> `mList` 的默认选项，可以渲染一组命令的帮助信息。效果与 `helpPanel()` 相同，并且自定义性更高。

使用 `Show::mList()/$output->mList()` 别名方法 `Show::multiList()`

```php
$data = [
  'list1 title' => [
     'name' => 'value text',
     'name2' => 'value text 2',
  ],
  'list2 title' => [
     'name' => 'value text',
     'name2' => 'value text 2',
  ],
  // ... ...
];

Show::mList($data);
```

渲染效果

{{< figure library="true" src="fmt-multi-list.png" numbered="false" lightbox="true">}}

### 面板展示信息输出

```php
public static function panel(mixed $data, string $title = 'Information Panel', array $opts = [])
```

展示信息面板。比如 命令行应用 开始运行时需要显示一些 版本信息，环境信息等等。

使用 `Show::panel()/$output->panel()`

```php
$data = [
    'application version' => '1.2.0',
    'system version' => '5.2.3',
    'see help' => 'please use php bin/app -h',
    'a only value message',
];
Show::panel($data, 'panel show', ['borderChar' => '#']);
```

渲染效果

{{< figure library="true" src="fmt-panel.png" numbered="false" lightbox="true">}}

### 数据表格信息输出

```php
public static function table(array $data, $title = 'Data Table', array $opts = [])
```

使用 `Show::table()/$output->table()` 可直接渲染从数据库拉取的数据(会自动提取字段名作为表头)

```php
// like from database query's data.
$data = [
 [ col1 => value1, col2 => value2, col3 => value3, ... ], // first row
 [ col1 => value4, col2 => value5, col3 => value6, ... ], // second row
 ... ...
];

Show::table($data, 'a table');
```

自己构造数据时，还要写字段名就有些麻烦了。可以通过选项配置 `$opts` 手动配置表头字段列表

```php
// use custom head
$data = [
 [ value1, value2, value3, ... ], // first row
 [ value4, value5, value6, ... ], // second row
 // ... ...
];

$opts = [
  'showBorder' => true,
  'columns' => [col1, col2, col3, ...]
];
Show::table($data, 'a table', $opts);
```

示例

```php
$data = [
    ['1', 'john', '2', 'john@email.com'],
    ['2', 'tom', '0', 'tom@email.com'],
    ['3', 'jack', '1', 'jack@email.com'],
];
$opts = [
    'showBorder' => true,
    'columns' => ['id', 'name', 'status', 'email']
];
Show::table($data, 'Table Show', $opts);
$opts['showBorder'] = false;
Show::table($data, 'No Border Table Show', $opts);
$opts['bodyStyle'] = 'red';
$opts['showBorder'] = true;
Show::table($data, 'Change Style Table Show', $opts);
$opts['bodyStyle'] = '';
$opts['showBorder'] = true;
$opts['columns'] = [];
Show::table($data, 'No Head Table Show', $opts);
```

渲染效果

{{< figure library="true" src="table-show.png" numbered="false" lightbox="true">}}

### 渲染帮助信息面板

```php
public static function helpPanel(array $config, $showAfterQuit = true)
```

使用 `Show::helpPanel()/$output->helpPanel()`

```php
Show::helpPanel([
    "description" => 'a help panel description text. (help panel show)',
    "usage" => 'a usage text',
    "arguments" => [
        'arg1' => 'arg1 description',
        'arg2' => 'arg2 description',
    ],
    "options" => [
        '--opt1' => 'a long option',
        '-s' => 'a short option',
        '-d' => 'Run the server on daemon.(default: <comment>false</comment>)',
        '-h, --help' => 'Display this help message'
    ],
]);
```

渲染效果

{{< figure library="true" src="fmt-help-panel.png" numbered="false" lightbox="true">}}
