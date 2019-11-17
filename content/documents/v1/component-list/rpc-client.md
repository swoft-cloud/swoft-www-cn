+++
title = "RPC 客户端"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 310

[menu.v1]
  parent = "component-list"
  weight = 10
+++
服务调用方法，通过使用服务提供方法，提供的lib接口，调用接口实现服务，不需要了解实现细节。

## RPC 服务

通过相同功能的系统称为一个服务，比如用户系统、订单系统。Swoft 框架为每个服务调用提供一个连接池和熔断器，且只有该服务才能使用。每个服务会定义一个名称，用于查询对应的连接池和熔断器。

- 有关连接池和熔断器的概念和介绍，请查看相关章节了解学习。

## 连接池

每个服务都会有一个连接池，根据连接池名称区别是哪个连接池。连接池定义由两部分组成，连接池和连接池配置。

### 连接池配置

连接池配置和之前一样，继承PoolProperties类，通过properties和env方法配置数据，env会覆盖properties。

```php
class UserPoolConfig extends PoolProperties
{
    /**
     * the name of pool
     *
     * @Value(name="${config.service.user.name}", env="${USER_POOL_NAME}")
     * @var string
     */
    protected $name = "";

    /**
     * Minimum active number of connections
     *
     * @Value(name="${config.service.user.minActive}", env="${USER_POOL_MIN_ACTIVE}")
     * @var int
     */
    protected $minActive = 5;

    /**
     * the maximum number of active connections
     *
     * @Value(name="${config.service.user.maxActive}", env="${USER_POOL_MAX_ACTIVE}")
     * @var int
     */
    protected $maxActive = 50;

    /**
     * the maximum number of wait connections
     *
     * @Value(name="${config.service.user.maxWait}", env="${USER_POOL_MAX_WAIT}")
     * @var int
     */
    protected $maxWait = 100;

    /**
     * Maximum waiting time
     *
     * @Value(name="${config.service.user.maxWaitTime}", env="${USER_POOL_MAX_WAIT_TIME}")
     * @var int
     */
    protected $maxWaitTime = 3;

    /**
     * Maximum idle time
     *
     * @Value(name="${config.service.user.maxIdleTime}", env="${USER_POOL_MAX_IDLE_TIME}")
     * @var int
     */
    protected $maxIdleTime = 60;

    /**
     * the time of connect timeout
     *
     * @Value(name="${config.service.user.timeout}", env="${USER_POOL_TIMEOUT}")
     * @var int
     */
    protected $timeout = 200;

    /**
     * the addresses of connection
     *
     * <pre>
     * [
     *  '127.0.0.1:88',
     *  '127.0.0.1:88'
     * ]
     * </pre>
     *
     * @Value(name="${config.service.user.uri}", env="${USER_POOL_URI}")
     * @var array
     */
    protected $uri = [];

    /**
     * whether to user provider(consul/etcd/zookeeper)
     *
     * @Value(name="${config.service.user.useProvider}", env="${USER_POOL_USE_PROVIDER}")
     * @var bool
     */
    protected $useProvider = false;

    /**
     * the default balancer is random balancer
     *
     * @Value(name="${config.service.user.balancer}", env="${USER_POOL_BALANCER}")
     * @var string
     */
    protected $balancer = BalancerSelector::TYPE_RANDOM;

    /**
     * the default provider is consul provider
     *
     * @Value(name="${config.service.user.provider}", env="${USER_POOL_PROVIDER}")
     * @var string
     */
    protected $provider = ProviderSelector::TYPE_CONSUL;
}
```

### 连接池配置

每个服务连接池，需要定义一个名称，且和熔断器一样，缺省使用类名。

```php
/**
 * the pool of user service
 *
 * @Pool(name="user")
 */
class UserServicePool extends ServicePool
{
    /**
     * @Inject()
     *
     * @var UserPoolConfig
     */
    protected $poolConfig;
}
```

## 熔断器

熔断器概念，请详看服务治理章节。

### 定义熔断器

继承CircuitBreaker类，配置属性信息。一个服务的熔断器名称要和连接池一致。

```php
/**
 * the breaker of user
 *
 * @Breaker("user")
 */
class UserBreaker extends CircuitBreaker
{
    /**
     * The number of successive failures
     * If the arrival, the state switch to open
     *
     * @Value(name="${config.breaker.user.failCount}", env="${USER_BREAKER_FAIL_COUNT}")
     * @var int
     */
    protected $switchToFailCount = 3;

    /**
     * The number of successive successes
     * If the arrival, the state switch to close
     *
     * @Value(name="${config.breaker.user.successCount}", env="${USER_BREAKER_SUCCESS_COUNT}")
     * @var int
     */
    protected $switchToSuccessCount = 3;

    /**
     * Switch close to open delay time
     * The unit is milliseconds
     *
     * @Value(name="${config.breaker.user.delayTime}", env="${USER_BREAKER_DELAY_TIME}")
     * @var int
     */
    protected $delaySwitchTimer = 500;
}

```

## 使用实例

使用比较简单，类似注入普通一个类的实例一样，唯一区别是会有额外的参数。

### 注解

**@Reference**    

- name 定义引用那个服务的接口，缺省使用类名，一般都需要定义
- version 使用该服务的那个版本，用于区别不同版本
- pool 定义使用哪个连接池，如果不为空，不会根据name配置的名称去查找连接池，而是直接使用配置的连接池。
- breaker 定义使用哪个熔断器，如果不为空，不会根据name配置的名称去查找熔断器，而是直接使用配置的熔断器
- packer RPC服务调用，会有一个默认的数据解包器，此参数是指定其它的数据解包器，不使用默认的。

### 实例

```php

/**
 * rpc controller test
 *
 * @Controller(prefix="rpc")
 */
class RpcController
{

    /**
     * @Reference("user")
     *
     * @var DemoInterface
     */
    private $demoService;

    /**
     * @Reference(name="user", version="1.0.1")
     *
     * @var DemoInterface
     */
    private $demoServiceV2;

    /**
     * @Reference("user")
     * @var \App\Lib\MdDemoInterface
     */
    private $mdDemoService;

    /**
     * @RequestMapping(route="call")
     * @return array
     */
    public function call()
    {
        $version  = $this->demoService->getUser('11');
        $version2 = $this->demoServiceV2->getUser('11');

        return [
            'version'  => $version,
            'version2' => $version2,
        ];
    }

    /**
     * Defer call
     */
    public function defer(){
        $defer1 = $this->demoService->deferGetUser('123');
        $defer2 = $this->demoServiceV2->deferGetUsers(['2', '3']);
        $defer3 = $this->demoServiceV2->deferGetUserByCond(1, 2, 'boy', 1.6);

        $result1 = $defer1->getResult();
        $result2 = $defer2->getResult();
        $result3 = $defer3->getResult();

        return [$result1, $result2, $result3];
    }
}
```
> @Reference 注解可以任何Bean实例的类中使用，不仅仅是controller，这里只是测试。如果要使用延迟收包或并发，必须使用deferXxx方法。

### 非 Swoft 框架

如果服务端采用 JSON 协议，非 Swoft 框架可以按照下面的 demo 格式封装调用

```php
$result = call('App\Lib\DemoInterface', '1.0.1', 'getUsers', [['1','2']]);
var_dump($result);

function call(string $interface, string $version, string $method, array $params = [])
{
    $fp = stream_socket_client('tcp://127.0.0.1:8099', $errno, $errstr);
    if (!$fp) {
        throw new Exception("stream_socket_client fail errno={$errno} errstr={$errstr}");
    }

    $data = [
        'interface' => $interface,
        'version'   => $version,
        'method'    => $method,
        'params'    => $params,
        'logid'     => uniqid(),
        'spanid'    => 0,
    ];

    $data = json_encode($data, JSON_UNESCAPED_UNICODE);
    fwrite($fp, $data);
    $result = fread($fp, 1024);
    fclose($fp);
    return $result;
}
```

> 如果服务端rpc 配置了 `package_eof = "\r\n"`, 客户端则需要在发送的data后追加 `\r\n`
