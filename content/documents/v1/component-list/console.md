+++
title = "命令行"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 302

[menu.v1]
  parent = "component-list"
  weight = 2
+++
命令行一般用户执行一些任务脚本，Swoft 命令行支持协程和非协程（传统同步阻塞）两种方式，
并且所有IO操作方式一样，框架底层自动识别是否为协程环境。

## 命令的定义

一个命令由命令组和执行命令组成，一个类就是一个命令组，类里面的方法对应操作命令，一个命令的运行，是通过执行命令组对应的操作命令。

## 命令行配置

### 扫描文件配置

配置命名运行时，扫描的Bean文件。通过设置一个别名，实现配置文件加载，默认定义在app/config/define.php。

```php
$aliases = [
    // ......
    '@console'    => '@beans/console.php',
    // ......
];

\Swoft\App::setAliases($aliases);
```

### 路由配置

路由配置比较简单，配置命令路由解析信息，通常情况无需配置。若需配置，只需在扫描文件里面配置路由信息，默认配置在app/config/beans/console.php里面。

```php
return [
    // ......
    'commandRoute' => [
        'class' => \Swoft\Console\Router\HandlerMapping::class,
        'suffix' => 'Command',
        'deaultCommand' => 'index',
        'delimiter' => ':',
    ],
    // ......
];
```

- suffix 命令后缀，用于命令组名称缺省时，自动解析命令，参数默认Command
- deaultCommand 默认的操作命令，默认index
- delimiter 命名之间分割符,默认 ":"

## 定义命令

命令的定义主要通过@Command和@Mapping两个注解，`@Command` 定义命令组名称，`@Mapping` 定义操作命令的映射关系。

## 注解

**@Command**

定义命令组

- `name` 参数，定义命令组名称，如果缺省，根据配置后缀自动解析
- `enabled` 是否启用，设为不启用时，将不会显示到命令列表。默认 `true`
- `coroutine` 参数，定义命令是否为协程，默认 false,如果为true，框架会启动一个协程运行该命令

**@Mapping**

定义操作命令映射关系

- `name` 参数，定义操作命令的一个映射名称，如果缺省，会执行使用方法名称。

## 帮助信息

命令帮助信息是命令使用说明信息，也是通过注解完成定义。

- 类描述，对应命令组信息描述
- 方法描述，对应该执行命令的信息描述
- `@Usage` 定义使用命令格式
- `@Options` 定义命令选项参数
- `@Arguments` 定义命令参数
- `@Example` 命令使用例子

## 示例

```php
/**
 * Test command
 *
 * @Command(coroutine=true)
 */
class TestCommand
{
    /**
     * Generate CLI command controller class
     * @Usage {fullCommand} CLASS_NAME SAVE_DIR [--option ...]
     * @Arguments
     *   name       The class name, don't need suffix and ext.(eg. <info>demo</info>)
     *   dir        The class file save dir(default: <info>@app/Commands</info>)
     * @Options
     *   -y, --yes BOOL             Whether to ask when writing a file. default is: <info>True</info>
     *   -o, --override BOOL        Force override exists file. default is: <info>False</info>
     *   -n, --namespace STRING     The class namespace. default is: <info>App\Commands</info>
     *   --suffix STRING            The class name suffix. default is: <info>Command</info>
     *   --tpl-file STRING          The template file name. default is: <info>command.stub</info>
     *   --tpl-dir STRING           The template file dir path.(default: devtool/res/templates)
     * @Example
     *   <info>{fullCommand} demo</info>     Gen DemoCommand class to `@app/Commands`
     *
     * @param Input  $input
     * @param Output $output
     *
     * @Mapping("test2")
     */
    public function test(Input $input, Output $output)
    {
        App::error('this is eror');
        App::trace('this is trace');
        Coroutine::create(function (){
            App::error('this is eror child');
            App::trace('this is trace child');
        });

        var_dump('test', $input, $output, Coroutine::id(),Coroutine::tid());
    }

    /**
     * this demo command
     *
     * @Usage
     *   test:{command} [arguments] [options]
     *
     * @Options
     *   -o,--opt   this is command option
     *
     * @Arguments
     *   arg     this is argument
     *
     * @Example
     *   php swoft test:demo arg=stelin -o opt
     *
     * @Mapping()
     */
    public function demo()
    {
        $hasOpt = input()->hasOpt('o');
        $opt    = input()->getOpt('o');
        $name   = input()->getArg('arg', 'swoft');

        App::trace('this is command log');
        Log::info('this is command info log');
        /* @var UserLogic $logic */
        $logic = App::getBean(UserLogic::class);
        $data  = $logic->getUserInfo(['uid1']);
        var_dump($hasOpt, $opt, $name, $data);
    }
}
```

> 命令逻辑里面可以使用 Swoft 所有功能，唯一不一样的是，如果命令不是协程模式运行，所有IO操作，框架底层会自动切换成传统的同步阻塞，但是使用方法是一样的。

## 运行

- 现在你可以执行 `php bin/swoft`, 命令列表中将会显示 test 命令
- 执行 `php bin/swoft test` 或者 `php bin/swoft test -h` 将会看到 test组里拥有的具体命令
- 执行 `php bin/swoft test:test2 -h` 将会看到此命令的完整帮助信息

## 输入输出

输入输出指的是，获取用户命令参数和显示信息到控制台。命令逻辑里面，可以通过函数参数和全局函数获取输入输出对象。

### 函数参数

如果需要使用输入和输出对象，可以再操作命令函数上，定义输入和输出对象，底层框架会自动注入对象。

```php
/**
 * Test command
 *
 * @Command(coroutine=true)
 */
class TestCommand
{
    /**
     * ......
     *
     * @param Input  $input
     * @param Output $output
     *
     * @Mapping("test2")
     */
    public function test(Input $input, Output $output)
    {
        // ......
    }

}
```

### 全局函数

```php
/**
 * Test command
 *
 * @Command(coroutine=true)
 */
class TestCommand
{
    /**
     * ......
     */
    public function demo()
    {
        $input = \input();
        $output = \output();
        // ......
    }
}
```

## 运行命令

完成定义命令后，可以执行命令，处理对应业务逻辑

### 查看命令

查看当前已经定义的所有命令，如下操作可以看到定义的test命令组。

```php
[root@0dd3950e175b swoft]# php bin/swoft
 ____                __ _
/ ___|_      _____  / _| |_
\___ \ \ /\ / / _ \| |_| __|
 ___) \ V  V / (_) |  _| |_
|____/ \_/\_/ \___/|_|  \__|

Usage:
  php bin/swoft

Commands:
  test    Test command
  entity  the group command list of database entity
  app     There are some help command for application
  server  the group command list of http-server
  rpc     The group command list of rpc server

Options:
  -v,--version  show version
  -h,--help     show help
```

### 查看版本

查看当前 swoft 框架版本信息

```php
[root@0dd3950e175b swoft]# php bin/swoft -v

 ____                __ _
/ ___|_      _____  / _| |_
\___ \ \ /\ / / _ \| |_| __|
 ___) \ V  V / (_) |  _| |_
|____/ \_/\_/ \___/|_|  \__|

swoft: 0.2.2, php: 7.1.5, swoole: 2.1.0
```

### 查看命令组

查看命令组有哪些操作命令，不加 "-h" 参数也可以。

```php
[root@0dd3950e175b swoft]# php bin/swoft test -h
Description:
  Test command

Usage:
  server:{command} [arguments] [options]

Commands:
  test2  this test command
  demo   this demo command

Options:
  -h,--help  Show help of the command group or specified command action
```

### 查看命令帮助信息

查看命令组下面，某个操作命令帮助信息。

```php
[root@0dd3950e175b swoft]# php bin/swoft test:test2 -h
Description:
  this test command

Usage:
  test:{command} [arguments] [options]

Arguments:
  arg  this is argument

Options:
  -o,--o  this is command option

Example:
  php swoft test:test arg=stelin -o opt
```

### 执行命令

运行命令组下面，某个操作命令。

```php
[root@0dd3950e175b swoft]# php bin/swoft test:test2
string(4) "test"
object(Input_5a8ecca785da6)#187 (9) {
    ......
}
int(1)
int(15193079439)
```

## 任务投递

console命令行里面，如果有需要可以通过 Http 和内置队列模式投递任务，队列模式只支持本机。队列模式投递任务，swoft-task 组件版本必须不小 `v1.0.2-beta`.

### 更新组件

```bash
composer update
```

### 升级配置

app/config/server.php新增队列配置

```php
return [
    // ....
    'setting' => [
        'task_ipc_mode'         => env('TASK_IPC_MODE', 3),
        'message_queue_key'     => env('MESSAGE_QUEUE_KEY', 0x70001001),
        'task_tmpdir'           => env('TASK_TMPDIR', '/tmp'),
    ],
];
```

.env 新增配置信息

```ini
TASK_IPC_MODE=3
MESSAGE_QUEUE_KEY=1879052289
TASK_TMPDIR=/tmp/
```

### 投递实例

任务投递和普通操作没有区别，且投递的是异步任务，可以监听onFinish(TaskEvent::FINISH_TASK)事件。详细见Task章节

```php
/**
 * Test command
 *
 * @Command(coroutine=false)
 */
class TestCommand
{
    /**
     * this task command
     *
     * @Usage
     *   {fullCommand} [arguments] [options]
     *
     * @Options
     *   -o,--opt  This is command option
     *
     * @Arguments
     *   arg    This is argument
     *
     * @Example
     *   {fullCommand}
     *
     * @Mapping()
     */
    public function task()
    {
        $result = Task::deliver('sync', 'console', ['console']);
        var_dump($result);
    }
}
```

> 只支持console 非协程投递任务，如果是协程只能通过Http或RPC投递任务
