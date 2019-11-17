+++
title = "HTTP 服务"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 303

[menu.v1]
  parent = "component-list"
  weight = 3
+++
基于 `\Swoole\Http\Server` 实现的协程HTTP服务, 框架层做了很好的封装, 用户按照传统的 MVC 方式编写代码, 就能获得协程带来的超高性能.

## 请求生命周期

请参考 [框架核心 - 生命周期](../core/framework.md). 了解 **请求生命周期**, 有利于理解HTTP服务各组件, 编写出更好代码.

## HTTP服务组件

- 控制器: Controller, MVC中的C
- 路由: Router, 将 url 配置到 Controller 中的 Action
- 中间件: Middleware, 处理一些前置或者后置逻辑
- 验证器: Validtor, 请求中的数据验证
- RESTFUL: restful 风格的HTTP服务

## 请求与响应

Swoft 的请求与响应实现于 [PSR 7](https://github.com/php-fig/http-message)

请求与响应对象存在于每次 HTTP 请求，这里指的 `Request` 为 `Swoft\Http\Message\Server\Request`，`Response` 为 `Swoft\Http\Message\Server\Response`。

### PSR-7

  <p class="tip"><strong>注意!</strong> 根据PSR-7对象的不可变性(immutable)，所有的 <code>with*</code> 方法都是克隆对象然后返回，必须接收新对象来做进一步处理，或使用链式调用</p>

### 基本方法

PSR-7 接口为请求和响应对象提供了这些公共方法:

- `withProtocolVersion($version)`
- `withHeader($name, $value)`
- `withAddedHeader($name, $value)`
- `withoutHeader($name)`
- `withBody(StreamInterface $body)`

PSR-7 接口为请求对象提供了这些方法:

- `withMethod(string $method)`
- `withUri(UriInterface $uri, $preserveHost = false)`
- `withCookieParams(array $cookies)`
- `withQueryParams(array $query)`
- `withUploadedFiles(array $uploadedFiles)`
- `withParsedBody($data)`
- `withAttribute($name, $value)`
- `withoutAttribute($name)`

PSR-7 接口为响应对象提供了这些方法:

- `withStatus($code, $reasonPhrase = '')`

> 更多请参考 PSR-7 和 查看 `swoft/http-message` 中具体的实现类

<p class="tip">
   <strong>Tips</strong> 可通过使用链式调用的写法使代码变得更简洁
</p>

### 请求对象

#### 如何获取

- 通过 Action 参数注入
- 通过请求上下文获取 `Swoft\Core\RequestContext::getRequest()`
- 通过全局函数 `request()` 获取

#### 请求动作方法

```php
$method = $request->getMethod();
```

#### 请求的URI

每个 HTTP 请求都有一个URI标识所请求的应用程序资源。HTTP 请求 URI 有几个部分:

- Scheme (e.g. `http` or `https`)
- Host (e.g. `example.com`)
- Port (e.g. `80` or `443`)
- Path (e.g. `/users/1`)
- Query `string` (e.g. `sort=created&dir=asc`)

你可以通过请求对象的 `getUri()` 方法获取 PSR-7 [URI对象](http://www.php-fig.org/psr/psr-7/#3-5-psr-http-message-uriinterface):

```php
$uri = $request->getUri();
```

PSR-7 请求对象的 URI 本身就是一个对象,它提供了下列方法检查 HTTP 请求的 URL 部分:

- `getScheme()`
- `getAuthority()`
- `getUserInfo()`
- `getHost()`
- `getPort()`
- `getPath()`
- `getQuery()` (e.g. `a=1&b=2`)
- `getFragment()`

#### 全部的 Headers

```php
$headers = $request->getHeaders();

foreach ($headers as $name => $values) {
    echo $name . ": " . implode(", ", $values);
}
```

#### 指定的 Header

- 返回值是array

```php
$headerValueArray = $request->getHeader('Accept');
```

- 返回值是字符串

```php
$headerValueString = $request->getHeaderLine('Accept');
```

#### 一些辅助方法

- XHR

```php
if ($request->isAjax()) {
    // Do something
}
```

- Content-Type

```php
$contentType = $request->getContentType();
```

#### GET 数据

```php
$data = $request->query();
$some = $request->query('key', 'default value')
```

#### POST 数据

```php
$data = $request->post();
$some = $request->post('key', 'default value')
```

#### GET & POST 数据

```php
$data = $request->input();
$some = $request->input('key', 'default value')
```

#### JSON 数据

仅当 `Content-Type` 为 `application/json` 时有效

```php
$data = $request->json();
$some = $request->json('key', 'default value')
```

#### RAW 数据

```php
$data = $request->raw();
```

#### SERVER 数据

```php
$data = $request->getServerParams();
$some = $request->server('key', 'default value')
```

#### 额外的方法

- 获取 Swoole 的 Request 对象

```php
$swooleRequest = $request->getSwooleRequest();
```

### 响应对象

- 获取 Swoole 的 Response 对象

```php
$swooleResponse = $response->getSwooleResponse();
```

## 中间件 Middleware

中间件是用于控制 **请求到达** 和 **响应请求** 的整个流程的，通常用于对请求进行过滤验证处理，当你需要对请求或响应作出对应的修改或处理，或想调整请求处理的流程时均可以使用中间件来实现。
中间件

### 定义中间件

只需要实现了 `Swoft\Http\Message\Middleware\MiddlewareInterface` 接口均为一个合法的中间件，其中 `process()` 方法为该中间件逻辑处理方法, 可以参考 `Swoft` 项目呢 `app/Middlewares/` 目录下的文件, 比如 `app/Middlewares/ActionTestMiddleware`:

```php
<?php

namespace App\Middlewares;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Swoft\Bean\Annotation\Bean;
use Swoft\Http\Message\Middleware\MiddlewareInterface;


/**
 * @Bean()
 */
class ActionTestMiddleware implements MiddlewareInterface
{

    /**
     * Process an incoming server request and return a response, optionally delegating
     * response creation to a handler.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Server\RequestHandlerInterface $handler
     * @return \Psr\Http\Message\ResponseInterface
     * @throws \InvalidArgumentException
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);
        return $response->withAddedHeader('Middleware-Action-Test', 'success');
    }
}
```

### 使用

#### 配置全局中间件

当你的自定义中间件需要全局请求应用，则可以考虑将此中间件作为全局中间件去使用，只需在 Bean 配置文件内配置 `serverDispatcher` 的 `middlewares` 属性，在数组中加入你的自定义中间件的命名空间地址，相关配置通常在 `config/beans/base.php` 内

```php
// 全局中间件配置: config/beans/base.php
return [
    ...
    'serverDispatcher' => [
        'middlewares' => [
            \Swoft\View\Middleware\ViewMiddleware::class,
            \Swoft\Session\Middleware\SessionMiddleware::class,
        ]
    ],
    ...
];
```

#### 通过注解使用

通过 `@Middleware` 和 `@Middlewares`, 可以很方便的配置中间件到当前的 `Controller` 和 `Action` 内

- 当将此注解应用于 `Controller` 上，则作用域为整个 `Controller`
- 将此注解应用于 `Action` 上，则作用域仅为当前的 `Action`
- `@Middleware` 用于配置单个中间件
- `@Middlewares` 显而易见的是用于配置一组 `@Middleware`，按照定义顺序依次执行, 使用参考 `app/Controllers/MiddlewareController.php`

```php
<?php

namespace App\Controllers;

use Swoft\Http\Server\Bean\Annotation\Controller;
use Swoft\Http\Message\Bean\Annotation\Middleware;
use Swoft\Http\Message\Bean\Annotation\Middlewares;
use Swoft\Http\Server\Bean\Annotation\RequestMapping;
use App\Middlewares\GroupTestMiddleware;
use App\Middlewares\ActionTestMiddleware;
use App\Middlewares\SubMiddleware;
use App\Middlewares\ControlerSubMiddleware;
use App\Middlewares\ControlerTestMiddleware;


/**
 * @Controller("middleware")
 * @Middleware(class=ControlerTestMiddleware::class)
 * @Middlewares({
 *     @Middleware(ControlerSubMiddleware::class)
 * })
 */
class MiddlewareController
{
    /**
     * @RequestMapping()
     * @Middlewares({
     *     @Middleware(GroupTestMiddleware::class),
     *     @Middleware(ActionTestMiddleware::class)
     * })
     * @Middleware(SubMiddleware::class)
     */
    public function action1(): array
    {
        return ['middleware'];
    }

    /**
     * @RequestMapping()
     * @Middleware(SubMiddleware::class)
     * @Middlewares({
     *     @Middleware(GroupTestMiddleware::class),
     *     @Middleware(ActionTestMiddleware::class)
     * })
     */
    public function action2(): array
    {
        return ['middleware2'];
    }

    /**
     * @RequestMapping()
     */
    public function action3(): array
    {
        return ['middleware3'];
    }
}
```

#### 中间件中断返回

当在实现验证检查类的中间件时，经常需要中断当前请求并直接给出响应，以下是中断流程的几种方式

构造一个新的 Response 对象直接返回

```php
public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
{
    $auth = false;
    // 如果验证不通过
    if (!$auth) {
        // response() 函数可以快速从 RequestContext 获得 Response 对象
        return response()->withStatus(401);
    }
    // 委托给下一个中间件处理
    $response = $handler->handle($request);
    return $response;
}
```

抛出异常返回

只要在请求生命周期内抛出的异常会被 `ErrorHandler` 捕获并处理，中间件内抛出也是如此，这部分不属于中间件的内容，顾在此不多做阐述。

### 示例：提前拦截请求

> 注意： 拦截要在 `$handler->handle($request)` 之前

```php
<?php

namespace App\Middlewares;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Swoft\Bean\Annotation\Bean;
use Swoft\Http\Message\Middleware\MiddlewareInterface;

/**
 * @Bean()
 */
class SomeMiddleware implements MiddlewareInterface
{

    /**
     * Process an incoming server request and return a response, optionally delegating
     * response creation to a handler.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Server\RequestHandlerInterface $handler
     * @return \Psr\Http\Message\ResponseInterface
     * @throws \InvalidArgumentException
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $path = $request->getUri()->getPath();

        if ($path === '/favicon.ico') {
            return \response()->withStatus(404);
        }

        return $handler->handle($request);
    }
```

### 示例：允许跨域

```php
<?php

namespace App\Middlewares;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Swoft\Bean\Annotation\Bean;
use Swoft\Http\Message\Middleware\MiddlewareInterface;

/**
 * @Bean()
 */
class CorsMiddleware implements MiddlewareInterface
{
    /**
     * Process an incoming server request and return a response, optionally delegating
     * response creation to a handler.
     *
     * @param \Psr\Http\Message\ServerRequestInterface $request
     * @param \Psr\Http\Server\RequestHandlerInterface $handler
     * @return \Psr\Http\Message\ResponseInterface
     * @throws \InvalidArgumentException
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if ('OPTIONS' === $request->getMethod()) {
            return $this->configResponse(\response());
        }

        $response = $handler->handle($request);

        return $this->configResponse($response);
    }

    private function configResponse(ResponseInterface $response)
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', 'http://mysite')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    }
}
```

## HTTP路由

HTTP路由在 `\Swoft\Http\Server\Router\HandlerMapping` 中实现, 配置文件在 `config/beans/base.php`:

```php
'httpRouter'       => [
    'ignoreLastSlash'  => false, // 是否忽略最后一个斜杠，设置false后，/user/index和/user/index/是两个不同的路由
    'tmpCacheNumber' => 1000,// 缓存路由数，最近一1000条(缓存到路由对象的，重启后失效，只会缓存动态路由)
    'matchAll'       => '', // 匹配所有，所有请求都会匹配到这个uri或闭包
    'currentGroupPrefix' => '', // 将会给所有的路由设置前缀(例如：/api) !!请谨慎使用!!
],
```

> 由于sowft的路由使用全注解方式，所以具体使用请参看控制器章节

## 控制器 Controller

控制器作为HTTP服务的核心组件，串接起一次请求的整个生命周期. 通过 **注解** 的方式，相较于传统的 Controller，代码更简洁，用户可以更关注业务逻辑。

### 路由 Route

主要通过 `@Controller` + `@RequestMapping` 注解实现，通常前者定义 **前缀**，后者定义 **后缀**

- 如下, 访问 index() 的路由是 `/users/list` (`/users` + `list`)

```php
/**
 * @Controller(prefix="/users")
 */
class RouteController
{
    /**
     * @RequestMapping("list")
     */
    public function index(): string
    {
    }
 }
 ```
 
#### `@Controller`

类注解，设置在 Controller 类上，标记当前类是一个http控制器类

- 显式指定路由前缀: `@Controller(prefix="/route")` 或 `@Controller("/route")`
- 隐式指定路由前缀: `@Controller()` 默认自动解析 controller class 的名称，并且使用驼峰格式。

比如:

```php
// file: app/Admin/HttpClientController.php

/**
 * @Controller()
 */
class HttpClientController
{}
```

上面的controller解析时，将会设置路由 `prefix` 为 `httpClient`，注意此操作不会解析文件夹，例如该 `Controller` 位于 `app/Admin/HttpClientController.php`，最终设置的路由 prefix 仍然为 `httpClient`。

#### `@RequestMapping`

方法注解，用于控制类的Action方法上。

```php
/**
 * @RequestMapping(route, method)
 */
 public function some() {}
```

注解参数：

- `route` 设置路由path，也是默认参数。
- `method` 设置允许的请求方法，可以多个。 e.g. `GET` `POST`。

示例:

```php
/**
 * @RequestMapping()
 * @RequestMapping(route="index")
 * @RequestMapping(route="index", method=RequestMethod::GET)
 * @RequestMapping(route="index", method={RequestMethod::POST,RequestMethod::PUT})
 */
 public function some()
 {}
```

- 显式指定路由后缀: `@RequestMapping(route="index")`或 `@RequestMapping("index")`
- 隐式指定路由后缀: 不使用 `@RequestMapping` 或者使用 `@RequestMapping()`, 默认解析方法名为后缀
- 限定HTTP方法: `@RequestMapping(route="index", method=RequestMethod::GET)` 指定路由支持的HTTP方法，默认是支持`GET`和`POST`
  - 比如 `method={RequestMethod::POST,RequestMethod::PUT}` 设置路由支持 `POST` 和 `PUT`
- 指定路由参数: `@RequestMapping(route="anyName/{name}")`，Action 方法中可以直接使用 `$name` 作为方法参数

### 使用说明

- 通常一个完整的路由path等于 Controller的`prefix` **+** Action的`route`
- 当你的action上的路由以 `/` 开头时，那完整的路由就是它，即不会再将 `prefix` 添加到它的前面。
- **请切记要引入相关的注解类**

```php
use Swoft\Http\Server\Bean\Annotation\Controller;
use Swoft\Http\Server\Bean\Annotation\RequestMapping;
use Swoft\Http\Server\Bean\Annotation\RequestMethod;
```

### 快速创建控制器

可以通过命令行命令快速创建控制器类，以方便快速开发使用。

```bash
// Gen DemoController class to `@app/Controllers`
php bin/swoft gen:controller demo --prefix /demo -y

// Gen UserController class to `@app/Controllers`(RESTFul 风格，会默认创建一些action)
php bin/swoft gen:controller user --prefix /users --rest
```

### 示例

常用方法可以参考 [Swoft项目](https://github.com/swoft-cloud/swoft) 的 `app/Controllers/RouteController.php`:

```php
/**
 * @Controller(prefix="/route")
 */
class RouteController
{
    /**
     * @RequestMapping()
     */
    public function index(): string
    {
        return 'index';
    }

    /**
     * @RequestMapping(route="user/{uid}/book/{bid}/{bool}/{name}")
     */
    public function funcArgs(bool $bool, Request $request, int $bid, string $name, int $uid, Response $response): array
    {
        return [$bid, $uid, $bool, $name, \get_class($request), \get_class($response)];
    }
    ...
}
```

### 请求 Request

Swoft HTTP服务中的 Request，是对 [`\Swoole\Http\Request`](https://wiki.swoole.com/wiki/page/328.html) 基于 [PSR-7](https://www.php-fig.org/psr/psr-7/) 标准的封装，常用方法可以参考 `app/Controllers/DemoController.php`:

```php
 public function index(Request $request)
{
    // 获取所有GET参数
    $get = $request->query();
    // 获取name参数默认值defaultName
    $getName = $request->query('name', 'defaultName');
    // 获取所有POST参数
    $post = $request->post();
    // 获取name参数默认值defaultName
    $postName = $request->post('name', 'defaultName');
    // 获取所有参，包括GET或POST
    $inputs = $request->input();
    // 获取name参数默认值defaultName
    $inputName = $request->input('name', 'defaultName');

    return compact('get', 'getName', 'post', 'postName', 'inputs', 'inputName');
}
```

**注意**: [`\Swoole\Http\Request`](https://wiki.swoole.com/wiki/page/328.html) 对 HTTP Request 进行了封装，不能像以往一样使用 `$_POST / $_GET` 等全局变量，也不推荐这样的使用方式，框架层通常都做了更好的封装和兼容，比如 `$_POST` 无法取到 `application/json` 格式的数据

### 响应 Response

Swoft 对HTTP服务的 Response 做了很好的封装，其中一个设计哲学:

> 返回的格式类型，不应该由服务端指定，而是根据客户端请求时的 Header 里面的 Accept 决定

当 Action 返回一个 array 或 Arrayable 对象，Response 将根据 Request Header 的 Accept 来返回数据，目前支持 `View / Json / Raw`

可以参考 `app/Controllers/IndexController.php`:

```php
/**
 * @RequestMapping("/")
 * @View(template="index/index")
 * @return array
 */
public function index(): array
{
    $name = 'Swoft';
    $notes = [
        'New Generation of PHP Framework',
        'High Performance, Coroutine and Full Stack'
    ];
    $links = [
        [
            'name' => 'Home',
            'link' => 'http://www.swoft.org',
        ],
        [
            'name' => 'Documentation',
            'link' => 'http://doc.swoft.org',
        ],
        [
            'name' => 'Issue',
            'link' => 'https://github.com/swoft-cloud/swoft/issues',
        ],
        [
            'name' => 'GitHub',
            'link' => 'https://github.com/swoft-cloud/swoft',
        ],
    ];
    // 返回一个 array 或 Arrayable 对象，Response 将根据 Request Header 的 Accept 来返回数据，目前支持 View, Json, Raw
    return compact('name', 'notes', 'links');
}
```

#### 支持返回的数据类型

- 基本数据类型: `bool` `int` `float(double)` `string`
- `array`
- `\Swoft\Contract\Arrayable` 对象
- `XxxException`: 在 Controller 内抛出异常将由 ExceptionHandler 捕获并进行处理, `4xx/5xx` 的状态码也是通过抛异常, 然后由 ExceptionHandler 捕获并统一进行处理

#### 使用视图

可以通过 `@View` 注解 或 `view()` 帮助函数来使用视图, 可以参考 `app/Controllers/IndexController.php`

### 最佳实践

- 使用 [PSR-7](https://www.php-fig.org/psr/psr-7/) 标准来封装 HTTP服务的 Request 和 Response
- **约定大于配置**, 路由应该在用户看到 URI 的时候, 就能找到相应的 `Controller/Action`

### 其他

Controller 中也可以使用 Bean 相关的方法

> **注意**: `@Controller` 注解已经实现了 `@Bean` 的功能, 不能和 `@Bean` 注解同时使用

其他注解方法, 比如 `@Inject`，参考 [Bean容器](../core/container.md)

## HTTP验证器 Validator

参数验证器可以 PATH(路径参数)/GET/POST 三种参数, 都是通过注解实现. 已经实现常见数据类型参数验证, 整数/正整数/浮点数/字符串类型/枚举类型.

代码可以参考 `app/Controller/ValidatorController`

### 常用注解

#### @Strings

- `@Strings` 字符串类型验证器
- 实例 `@Strings(from=ValidatorFrom::GET, name="name", min=3, max=10, default="boy", template="字段{name}必须在{min}到{max}之间,您提交的值是{value}")`
- from: 参数定义验证数据类型, 默认 POST
- name: 定义验证的名称
- min: 定义字符串最小长度
- max: 定义字符串最大长度
- default: 定义默认值, PATH参数不支持定义默认值, 参数不存在有效
- template: 自定义模板提示

#### @Number

- `@Number` 正整数验证器
- 实例 `@Number(from=ValidatorFrom::GET, name="id", min=5, max=10, default=7, template="字段{name}必须在{min}到{max}之间,您提交的值是{value}")`
- from: 参数定义验证数据类型, 默认POST
- name: 定义验证的名称
- min: 定义最小值
- max: 定义最大值
- default: 定义默认值, PATH参数不支持定义默认值, 参数不存在有效
- template: 自定义模板提示

#### @Integer

- `@Integer` 整数验证器
- 实例 `@Integer(from=ValidatorFrom::PATH, name="id", min=5, max=10, template="字段{name}必须在{min}到{max}之间,您提交的值是{value}")`
- from: 参数定义验证数据类型, 默认 POST
- name: 定义验证的名称
- min: 定义最小值
- max: 定义最大值
- default: 定义默认值, PATH参数不支持定义默认值, 参数不存在有效
- template: 自定义模板提示

#### @Floats

- `@Floats` 浮点数验证器
- 实例 `@Floats(from=ValidatorFrom::POST, name="id", min=5.1, max=5.9, default=5.6, template="字段{name}必须在{min}到{max}之间,您提交的值是{value}")`
- from: 参数定义验证数据类型, 默认 POST
- name: 定义验证的名称
- min: 定义最小值
- max: 定义最大值
- default: 定义默认值, PATH参数不支持定义默认值, 参数不存在有效
- template: 自定义模板提示

#### @Enum

- `@Enum` 枚举验证器
- 实例 `@Enum(from=ValidatorFrom::POST, name="name", values={1,"a",3}, default=1, template="字段{name}必须的,您提交的值是{value}")`
- from: 参数定义验证数据类型, 默认 POST
- values: 定义一个默认枚举数组
- default: 定义默认值, PATH参数不支持定义默认值, 参数不存在有效
- template: 自定义模板提示

## RESTful

通过 [HTTP服务 - Controller](controller.md) 中路由功能, 可以很轻松的实现一个 RESTful 风格的 HTTP服务.

代码参考 `app/Controllers/RestController`:

```php
<?php

namespace App\Controllers;

use Swoft\Http\Server\Bean\Annotation\Controller;
use Swoft\Http\Server\Bean\Annotation\RequestMapping;
use Swoft\Http\Server\Bean\Annotation\RequestMethod;
use Swoft\Http\Message\Server\Request;

/**
 * RESTful和参数验证测试demo
 *
 * @Controller(prefix="/user")
 */
class RestController
{
    /**
     * 查询列表接口
     * 地址:/user/
     *
     * @RequestMapping(route="/user", method={RequestMethod::GET})
     */
    public function list()
    {
        return ['list'];
    }


    /**
     * 创建一个用户
     * 地址:/user
     *
     * @RequestMapping(route="/user", method={RequestMethod::POST,RequestMethod::PUT})
     *
     * @param Request $request
     *
     * @return array
     */
    public function create(Request $request)
    {
        $name = $request->input('name');

        $bodyParams = $request->getBodyParams();
        $bodyParams = empty($bodyParams) ? ["create", $name] : $bodyParams;

        return $bodyParams;
    }

    /**
     * 查询一个用户信息
     * 地址:/user/6
     *
     * @RequestMapping(route="{uid}", method={RequestMethod::GET})
     *
     * @param int $uid
     *
     * @return array
     */
    public function getUser(int $uid)
    {
        return ['getUser', $uid];
    }

    /**
     * 查询用户的书籍信息
     * 地址:/user/6/book/8
     *
     * @RequestMapping(route="{userId}/book/{bookId}", method={RequestMethod::GET})
     *
     * @param int    $userId
     * @param string $bookId
     *
     * @return array
     */
    public function getBookFromUser(int $userId, string $bookId)
    {
        return ['bookFromUser', $userId, $bookId];
    }

    /**
     * 删除一个用户信息
     * 地址:/user/6
     *
     * @RequestMapping(route="{uid}", method={RequestMethod::DELETE})
     *
     * @param int $uid
     *
     * @return array
     */
    public function deleteUser(int $uid)
    {
        return ['delete', $uid];
    }

    /**
     * 更新一个用户信息
     * 地址:/user/6
     *
     * @RequestMapping(route="{uid}", method={RequestMethod::PUT, RequestMethod::PATCH})
     *
     * @param int $uid
     * @param Request $request
     * @return array
     */
    public function updateUser(Request $request, int $uid)
    {
        $body = $request->getBodyParams();
        $body['update'] = 'update';
        $body['uid'] = $uid;

        return $body;
    }
}
```
