+++
title = "日志"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"

[menu.v2]
  parent = "core-components"
  weight = 11
+++

## 概念介绍

1. 日志，主要用于记录信息，便于问题排查。
2. 根据信息来源，可以分为：控制台日志，应用日志。
3. 根据日志记录内容的`重要程度`，可以分为多个级别：emergency/debug/alert/info/warning/error

## 控制台日志
1. 配置位置：vendor/swoft/framework/src/SwoftApplication.php。如需更改配置，请在application.php文件重新覆盖本函数。
```
    public function getCLoggerConfig(): array
    {
        return [
            'name'    => 'swoft', //名称
            'enable'  => true,    //是否开启
            'output'  => true,    //是否打印到控制台
            'levels'  => '',      //输入日志的级别，为空全部输出，配置示例"info, warning, debug, error"
            'logFile' => ''       //控制台日志默认打印到控制台，也可以配置路径，同时写到指定文件
        ];
    }
```
2. 使用
```
    CLog::info('info');
    CLog::warning('warning');
    
    // 请在 .env 文件配置 SWOFT_DEBUG = 1
    CLog::debug('debug');
    CLog::error('error');
```
3. 输出
```
    // 2019/05/12-07:02:57 [INFO] Swoft\Processor\ConsoleProcessor:handle(33) info
    // 2019/05/12-07:02:57 [WARNING] Swoft\Processor\ConsoleProcessor:handle(33) warning
    // 2019/05/12-07:02:57 [DEBUG] Swoft\Processor\ConsoleProcessor:handle(33) debug
    // 2019/05/12-07:02:57 [ERROR] Swoft\Processor\ConsoleProcessor:handle(33) error
```

## 应用日志
1. 配置位置：bean.php
```
    return [
        'lineFormatter'      => [
            'format'     => '%datetime% [%level_name%] [%channel%] [%event%] [tid:%tid%] [cid:%cid%] [traceid:%traceid%] [spanid:%spanid%] [parentid:%parentid%] %messages%',
            'dateFormat' => 'Y-m-d H:i:s',
        ],
        'noticeHandler'      => [
            'class'     => FileHandler::class,
            'logFile'   => '@runtime/logs/notice.log',
            'formatter' => \bean('lineFormatter'),
            'levels'    => 'notice,info,debug,trace',
        ],
        'applicationHandler' => [
            'class'     => FileHandler::class,
            'logFile'   => '@runtime/logs/error.log',
            'formatter' => \bean('lineFormatter'),
            'levels'    => 'error,warning',
        ],
        'logger'             => [
            'flushRequest' => false,
            'enable'       => false,
            'handlers'     => [
                'application' => \bean('applicationHandler'),
                'notice'      => \bean('noticeHandler'),
            ],
        ]
    ];
```
2. 使用
```
Log::warning('this %s log', 'warning');
Log::error('this %s log', 'error');

// 请在 .env 文件配置 APP_DEBUG = 1
Log::debug('this %s log', 'debug');
Log::info('this %s log', 'info');
```
3. 输出
```
//notice.log
2019-09-16 11:00:56 [debug] [swoft] [request] [tid:3] [cid:3] [traceid:] [spanid:] [parentid:] trace[LotteryController.php:44] this debug log
2019-09-16 11:00:56 [info] [swoft] [request] [tid:3] [cid:3] [traceid:] [spanid:] [parentid:] trace[LotteryController.php:45] this info log

//error.log
2019-09-16 11:00:56 [warning] [swoft] [request] [tid:3] [cid:3] [traceid:] [spanid:] [parentid:] trace[LotteryController.php:46] this warning log
2019-09-16 11:00:56 [error] [swoft] [request] [tid:3] [cid:3] [traceid:] [spanid:] [parentid:] trace[LotteryController.php:47] this error log
```
4. 另外，框架提供了以下`notice`级别的日志函数
```
// Tag start
Log::profileStart('tagName');

// Pushlog
Log::pushLog('key', 'value');
Log::pushLog('key', ['value']);
Log::pushLog('key', 'value');

// Counting
Log::counting('mget', 1, 10);
Log::counting('mget', 2, 10);

// Tag end
Log::profileEnd('tagName');
```
5. 输出
```
//notice.log
2019-09-16 11:00:56 [notice] [swoft] [request] [tid:3] [cid:4] [traceid:] [spanid:] [parentid:] [7.03(ms)] [23(MB)] [/lottery/gift] [key=value key=["value"] key=value] profile[tagName=1.33(ms)/1] counting[mget=3/20]
```

