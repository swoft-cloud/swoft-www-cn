+++
title = "认证管理"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 301

[menu.v1]
  parent = "component-list"
  weight = 1
+++
现在支持:

- BasicAuth
- BearerToken (JWT)
- ACL

## 安装
  
```php
composer require swoft/auth
```
  
## 使用

本组件目前实现了 `BasicAuth` 和 `BearerToken` 的验证,以及简单的 `ACL`，使用方法简单，在 `config/beans/base.php` 中的 `serverDispatcher.middlewares` 里 添加 `\Swoft\Auth\Middleware\AuthMiddleware::class` 中间件，如下

```php
'serverDispatcher' => [
    'middlewares' => [
        \Swoft\Auth\Middleware\AuthMiddleware::class,
    ]
],
```

然后在配置文件 `config/properties/app.php` 中添加

```php
'auth' => [
    'jwt' => [
       'algorithm' => 'HS256',
       'secret' => '1231231'
    ],
],
```

- 注意 `secret` 不要使用上述值，修改为你自己的值

## 配置验证管理 AuthManagerInterface

`AuthManager` 是登录验证的核心，本类实现了 `Token` 的验证及缓存，你可以继承这个类实现多种方式登录(配合`accountType`实现)，下面就是一个 `basicAuth` 的 `Demo`

首先实现一个 `Swoft\Auth\Mapping\AccountTypeInterface` 作为我们登录的通道

```php
use Swoft\Auth\Mapping\AccountTypeInterface;
use Swoft\Auth\Bean\AuthResult;

/**
 * @Bean()
 */
class AdminNormalAccount implements AccountTypeInterface
{
    /**
     * @Inject()
     * @var AdminUserDAO
     */
    protected $dao;

    const ROLE = 'role';

    /**
     * @throws \Swoft\Db\Exception\DbException
     */
    public function login(array $data) : AuthResult
    {
        $identity = $data['identity'];
        $credential = $data['credential'];
        $user = $this->dao::findOneByUsername($identity);
        $result = new AuthResult();
        if($user instanceof AdminUserBean && $user->verify($credential)){
            $result->setExtendedData([self::ROLE => $user->getIsAdministrator()]);
            $result->setIdentity($user->getId());
        }
        return $result;
    }

    /**
     * @throws \Swoft\Db\Exception\DbException
     */
    public function authenticate(string $identity) : bool
    {
        return $this->dao::issetUserById($identity);
    }
}
```

然后在我们自己的 `AuthManagerService` 实现这个登录

```php
use Swoft\Auth\AuthManager;
use Swoft\Auth\Mapping\AuthManagerInterface;
use Swoft\Auth\Bean\AuthSession;

/**
 * @Bean()
 */
class AuthManagerService extends AuthManager implements AuthManagerInterface
{
      /**
     * @var string
     */
    protected $cacheClass = Redis::class;

    /**
     * @var bool 开启缓存
     */
    protected $cacheEnable = true;

    public function adminBasicLogin(string $identity, string $credential) : AuthSession
    {
        return $this->login(AdminNormalAccount::class, [
            'identity' => $identity,
            'credential' => $credential
        ]);
    }
}
```

然后在 `config/beans/base.php` 中把系统默认的 `AuthManager` Bean 替换为我们自己的 `AuthManagerService`，添加如下代码进行替换

```php
\Swoft\Auth\Mapping\AuthManagerInterface::class => [
    'class'=>App\Domain\User\Service\AuthManagerService::class
],
```

现在我们就可以在一个 `Controller` 中使用刚才实现的登录方式了

```php
use Swoft\Auth\Constants\AuthConstants;
use Swoft\Http\Message\Server\Request;
use Swoft\Http\Server\Bean\Annotation\Controller;
use Swoft\Http\Server\Bean\Annotation\RequestMapping;
use Swoft\Http\Server\Bean\Annotation\RequestMethod;
use Swoft\Auth\Mapping\AuthManagerInterface;

/**
 * @Controller(prefix="/oauth")
 */
class AuthorizationsResource
{
     /**
     * @RequestMapping(route="token", method={RequestMethod::POST})
     */
    public function oauth(Request $request) : array
    {
        $identity = $request->getAttribute(AuthConstants::BASIC_USER_NAME) ?? '';
        $credential = $request->getAttribute(AuthConstants::BASIC_PASSWORD) ?? '';
        if(!$identity || !$credential){
            return [
                "code" => 400,
                "message" => "Identity and Credential are required."
            ];
        }
        /** @var AuthManagerService $manager */
        $manager = App::getBean(AuthManagerInterface::class);
        /** @var AuthSession $session */
        $session = $manager->adminBasicLogin($identity, $credential);
        $data = [
            'token' => $session->getToken(),
            'expire' => $session->getExpirationTime()
        ];
        return $data;
    }
}

```

现在可以通过 Postman 或 其它请求方式 请求我们的登录接口了

## ACL

我们的权限配置是通过配合的`Token`进行实现的
只要我们的请求中包含如下的`header`值

```php
Authorization: Bearer {token}.
```

那么 `Auth组件` 的中间件就可以识别并解析 `Token`了,下面看看如何实现

### AuthServiceInterface

首先，实现我们自己的`AuthService`，继承自系统默认的`AuthUserService`并实现`Swoft\Auth\Mapping\AuthServiceInterface`接口

```php
use Swoft\Auth\Mapping\AuthServiceInterface;
use Swoft\Auth\AuthUserService;
use Psr\Http\Message\ServerRequestInterface;

/**
 * @Bean()
 */
class AuthService extends AuthUserService implements AuthServiceInterface
{
    /**
     * @Inject()
     * @var OrdinaryUserDAO
     */
    protected $ordinaryDao;

    public function auth(string $requestHandler, ServerRequestInterface $request): bool
    {
        $id = $this->getUserIdentity();
        $role = $this->getUserExtendData()['role'] ?? '' ;
        echo sprintf("你访问了: %s",$requestHandler);
        if($id){
            return true;
        }
        return false;
    }

}
```

在 `config/beans/base.php` 中添加如下代码把系统默认的`Swoft\Auth\Mapping\AuthServiceInterface` Bean 替换掉

```php
\Swoft\Auth\Mapping\AuthServiceInterface::class => [
    // 你的 AuthService 的完整命名空间
    'class' => \App\Domain\User\Service\AuthService::class,
]
```

然后在你想要进行权限控制的 `Controller`上面添加 `Swoft\Auth\Middleware\AclMiddleware::class` 中间件，参考如下

```php
use Swoft\Http\Server\Bean\Annotation\RequestMapping;
use Swoft\Http\Message\Bean\Annotation\Middleware;
use Swoft\Auth\Middleware\AclMiddleware;

/**
 * @Middleware(AclMiddleware::class)
 * @RequestMapping(route="/", method={RequestMethod::GET})
 */
public function index()
{
    $data = [
        'name' => 'Swoft',
        'repo' => 'https://github.com/swoft-cloud/swoft',
        'doc' => 'https://doc.swoft.org/',
        'doc1' => 'https://swoft-cloud.github.io/swoft-doc/',
        'method' => __METHOD__,
    ];
    return $data;
}
```

然后访问上面的路由 `/` ,就可以在控制台看到 `你访问了: ...`

在 `AuthService` 中的 `auth` 里面你可以获取用户的 ID，和自定义的附加字段，如我们上面例子里的 `role` 字段，这个前提是这个请求添加了授权的 `Token`

## 捕捉组件抛出的异常

```php
use Swoft\Bean\Annotation\ExceptionHandler;
use Swoft\Bean\Annotation\Handler;
use Swoft\Http\Message\Server\Response;
use Swoft\Auth\Exception\AuthException;

/**
 * @ExceptionHandler()
 */
class SwoftExceptionHandler
{
    /**
     * @Inject()
     * @var ErrorCodeHelper
     */
    protected $authHelper;


    /**
     * @Handler(AuthException::class)
     */
    public function handleAuthException(Response $response, \Throwable $t) : Response
    {
        $errorCode = $t->getCode();
        $statusCode = 500;
        $message = $t->getMessage();

        if ($this->authHelper->has($errorCode)) {
            $defaultMessage = $this->authHelper->get($errorCode);
            $statusCode = $defaultMessage['statusCode'];
            if (!$message) {
                $message = $defaultMessage['message'];
            }
        }
        $error = [
            'code' => $errorCode,
            'message' => $message ?: 'Unspecified error',
        ];
        return $response->withStatus($statusCode)->json($error);
    }

}
```
