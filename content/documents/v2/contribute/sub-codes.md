+++
title = "提交代码"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 1102

[menu.v2]
  parent = "contribute"
  weight = 2
+++

开发组非常欢迎各位向我们提交PR(Pull Request)，但是为了保证代码质量和统一的风格，向官方的主仓库 [swoft/swoft](https://github.com/swoft-cloud/swoft) 和 **开发仓库** 贡献代码时需要注意代码和 commit 格式

## 发起PR时的注意事项

* 请不要提交 PR 到各个组件仓库，它们都是 **只读的**
* 核心组件的 **开发仓库** 是 [swoft/swoft-component](https://github.com/swoft-cloud/swoft-component)
* 扩展组件的 **开发仓库** 是 [swoft/swoft-ext](https://github.com/swoft-cloud/swoft-ext)
* 请 `fork` 对应的 **开发仓库**，修改后，请把你的PR提交到对应的开发仓库

> 发布版本时官方会将代码同步到各个子仓库

## Commit Message

* `commit message` 只能是英文信息
* 请尽量保证 `commit message` 是有意义的说明
* 最好以 `add:` `update:` `fix:` 等关键字开头

## 代码风格

* 提交的 `PHP` 代码 必须 遵循 `PSR-2` 代码风格
* 合理且有意义的类、方法、变量命名
* 适当的注释，合理的使用空行保持代码的简洁，易于阅读
* 不要包含一些无意义的信息 例如 `@author` 等(_提交者是能够从 commit log 里看到的_)
