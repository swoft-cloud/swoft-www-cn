+++
title = "开发者工具"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 318

[menu.v1]
  parent = "component-list"
  weight = 18
+++
swoft 提供了一些内置的工具方便开发者使用。

## 安装组件

绝大部分工具都放置在组件 `swoft/devtool` 中

```bash
composer require swoft/devtool
```

## CLI帮助命令

提供了一写CLI帮助命令，以便用户快速生成一些基本class。生成后的类文件只需稍加调整就可使用

- 运行环境检查
- 提供database table实体类生成
- 提供基本的class模板文件生成

## 方便的web UI

- server, application 信息显示
- 已注册的路由信息(http,websocket,rpc)
- 简单的webSocket测试工具
- 简单的日志查看
- web版的类文件生成
- ... ...
- 等等各种关于服务器和应用的信息查看

## 更多功能

后续会根据用户需要增加更多的帮助工具，欢迎用户提供意见和贡献代码

## 仓库

- github https://github.com/swoft-cloud/swoft-devtool

## 参与贡献

您可以 fork 仓库修改然后发起 PR

## DevTool 配置

要完整的启用 DevTool, 需要添加一些配置和进行一点操作。

<div class="alert alert-danger alert-dismissible" role="alert">
  <strong>警告!</strong> 
  <p>由于 1.0 没法禁用组件，线上一定不能安装 devtool 组件！</p>
</div>

### 开始配置

1. 在 `config/beans/base.php` 添加 HTTP 中间件让 DevTool 介入请求声明周期

```php
'serverDispatcher' => [
      'middlewares' => [
          // ...
          \Swoft\Devtool\Middleware\DevToolMiddleware::class,
      ]
 ],
```

2. DevTool 配置，用于标识是否启用某些功能(`config/properties/app.php`)，如不存在可自行添加配置

```php
'devtool' => [
    // 是否开启 DevTool，默认值为 false
    'enable' => true,
    // (可选)前台运行服务器时，是否打印事件调用到 Console
    'logEventToConsole' => true,
    // (可选)前台运行服务器时，是否打印 HTTP 请求到 Console
    'logHttpRequestToConsole' => true,
],
```

3. 发布 DevTool 的静态资源到项目的 `public` 目录

在项目目录下执行：

```bash
php bin/swoft dev:publish swoft/devtool
// -f 将会删除旧的资源，每次devtool更新后请都带上这个选项重新执行一次命令
php bin/swoft dev:publish swoft/devtool -f
```

4. 好了，现在你可以通过浏览器访问 `SCHEME://HOST:PORT/__devtool`（e.g. `http://127.0.0.1:80/__devtool`）

5. 如果你能看到下面的截图，说明已经成功安装并启用

{{< figure library="true" src="v1-devtool.jpg" numbered="false" lightbox="true">}}


### 可能的问题

如果你访问这个地址 `HOST:PORT/__devtool` 报错或没有任何显示

- 确认访问地址正确，`HOST:PORT` + `/__devtool`
- 确认`PORT`是否正确，`PORT`为当前`HTTP服务`配置的端口
- 确认资源是否成功发布
- 确认你的 `public` 目录是可被浏览器访问的
- 确认安装或更新组件后 **重启** 了服务器

> 由于之前 swoole 静态资源访问漏洞问题，swoft现在默认是关闭了访问public静态资源目录，要使用注意先要打开对应配置。

### 注意

> ！！打开 DevTool 会对服务器的运行和性能造成一定影响，请在进行压力测试前，将其关闭。

## 命令创建实体

> 目前仅支持MYSQL驱动

如果想通过数据表来映射当前的ORM，可以通过命令行的形式来创建实体，前提是你要确保你的数据库配置已经完成并且可连接可读取数据

### 命令说明

通过以下命令可以查看创建实体命令的帮助

```bash
php bin/swoft entity:create -h
```

详情说明如下：

```bash
Description:
  Auto create entity by table structure

Usage:
  entity:create -d[|--database] <database>
  entity:create -d[|--database] <database> [table]
  entity:create -d[|--database] <database> -i[|--include] <table>
  entity:create -d[|--database] <database> -i[|--include] <table1,table2>
  entity:create -d[|--database] <database> -i[|--include] <table1,table2> -e[|--exclude] <table3>
  entity:create -d[|--database] <database> -i[|--include] <table1,table2> -e[|--exclude] <table3,table4>

Options:
  -d                    数据库
  --database            数据库
  -i                    指定特定的数据表，多表之间用逗号分隔
  --include             指定特定的数据表，多表之间用逗号分隔
  -e                    排除指定的数据表，多表之间用逗号分隔
  --exclude             排除指定的数据表，多表之间用逗号分隔
  --remove-table-prefix 去除表前缀
  --entity-file-path    实体路径(必须在以@app开头并且在app目录下存在的目录,否则将会重定向到@app/Models/Entity)

Example:
  php bin/swoft entity:create -d test
```

## 文件生成命令

使用 `php bin/swoft gen` 可以查看到现在支持生成的文件类型

```bash
% php bin/swoft gen
Description:
  Generate some common application template classes[built-in]

Usage:
  gen:{command} [arguments] [options]

Commands:
  command     Generate CLI command controller class
  controller  Generate HTTP controller class
  websocket   Generate WebSocket controller class
  rpcService  Generate RPC service class
  listener    Generate an event listener class
  middleware  Generate HTTP middleware class
  task        Generate user task class
  process     Generate user custom process class

Options:
  -h, --help  Show help of the command group or specified command action

```

> 关于每个命令的具体使用信息，可以用 `php bin/swoft gen:{command} -h` 来查看 

### 生成http controller

使用命令 `php bin/swoft gen:controller`

- 使用示例

```bash
php bin/swoft gen:controller demo --prefix /demo -y          // Gen DemoController class to `@app/Controllers`
php bin/swoft gen:controller user --prefix /users --rest     // Gen UserController class to `@app/Controllers`(RESTFul type)
```

> 更多选项信息请使用 `php bin/swoft gen:controller -h` 查看

### 生成http middleware

使用命令 `php bin/swoft gen:middleware`

- 使用示例

```bash
php bin/swoft gen:middleware demo    // Gen DemoMiddleware class to `@app/Middlewares`
```

> 更多选项信息请使用 `php bin/swoft gen:middleware -h` 查看

### 生成cli command

使用命令 `php bin/swoft gen:command`

- 使用示例

```bash
php bin/swoft gen:command demo     // Gen DemoCommand class to `@app/Commands`
```

> 更多选项信息请使用 `php bin/swoft gen:command -h` 查看

### 生成ws controller

使用命令 `php bin/swoft gen:websocket`

- 使用示例

```bash
php bin/swoft gen:websocket echo  // Gen EchoController class to `@app/WebSocket`
```

> 更多选项信息请使用 `php bin/swoft gen:websocket -h` 查看

### 生成事件监听器

使用命令 `php bin/swoft gen:listener`

- 使用示例

```bash
php bin/swoft gen:listener demo    // Gen DemoListener class to `@app/Listener`
```

### 生成自定义header头注释

使用命令：`php bin/swoft gen:controller --tpl-dir ./ --tpl-file header`

- 使用示例

```bash
php bin/swoft gen:controller abc --tpl-dir ./templates   // Gen DemoController class to `@app/Controllers`
```

把 /vendor/swoft/devtool/res/templates 目录拷贝出来放到自己想要放置的目录，本示例放在根目录。

修改 file-header.stub 文件，生成代码的使用 --tpl-dir 指定模版目录。

- `--tpl-dir` 注释文件所在目录
- `--tpl-file` 注释文件名称

> 更多选项信息请使用 `php bin/swoft gen:listener -h` 查看
