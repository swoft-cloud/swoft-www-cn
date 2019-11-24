+++
title = "开发注意事项"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"

weight = 205

[menu.v2]
  parent = "dev-guide"
  weight = 5



+++

## 注意事项

- 禁止使用`$_GET、$_POST、$GLOBALS、$_SERVER、$_FILES、$_COOKIE、$_SESSION、$_REQUEST、$_ENV`等超全局变量
- 谨慎使用`global、static`关键字
- 不要在代码非协程环境中执行`sleep`以及其他睡眠函数，这样会导致整个进程阻塞. `exit/die` 是危险的，会导致 `worker` 进程退出
- 不要在业务代码中使用 `swoole` 不支持的 `hook` , 例如 `MongoDB`,`pgsql client`, 如果需要使用这些扩展需要单独开用户进程执行
- 无法 `hook` 的 `io` 都会同步阻塞进程, 导致`协程`无法切换, 直接的影响就是服务器大规模超时.
- 不建议使用 `curl` 扩展 类似的`GuzzleHttp`, 推荐使用 `swoft` 封装的网络请求包
- Swoole 短名开启 ,在 `php.ini` 中配置`swoole.use_shortname = 'on'`


## 常见问题

### The HTTP server have been running!(PID: xx) 

出现这种问题，是因为服务已经启动了。通常两种方式解决，第一种方式，stop 服务。第二种方式，`kill pid`。

### Could not scan for classes inside xxx which does not appear to be a file nor a folder

出现这种问题是`composer`源的问题，一般会在`创建项目`(`composer create swoft/swoft swoft`)的时候出现，解决办法很简答只需要切换源`全局设置`即可。如：`composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/`。


## 代码格式

推荐参照 [`PSR2`](https://www.php-fig.org/psr/psr-2/) 代码规范 .
