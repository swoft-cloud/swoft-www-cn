+++
title = "连接池"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 207

[menu.v1]
  parent = "framework-core"
  weight = 7
+++
## 基础属性

- name 连接池节点名称，用于服务发现
- uri 连接地址信息
- maxActive 最大活跃连接
- maxWait 最大等待连接
- minActive 最小活跃链接数
- maxIdleTime 连接最大空闲时间，单位秒
- maxWaitTime 连接最大等待时间，单位秒
- timeout 超时时间，单位秒

## 具体使用

- [db连接池](../db/config.md) 
- [redis连接池](../cache/config.md) 
