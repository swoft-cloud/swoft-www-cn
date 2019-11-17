+++
title = "框架安装"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 104

[menu.v1]
  parent = "base-info"
  weight = 4
+++
## composer安装

```bash
composer create-project swoft/swoft swoft
```

> 通过 `Packagist国内镜像` 加速国内下载速度，请参阅 https://packagist.laravel-china.org

## 手动安装

```bash
git clone https://github.com/swoft-cloud/swoft
cd swoft
composer install --no-dev # 不安装 dev 依赖会更快一些
cp .env.example .env
vim .env # 根据需要调整启动参数
```

## Docker方式安装

```bash
docker run -p 80:80 swoft/swoft
```

## Docker-Compose 安装

```bash
git clone https://github.com/swoft-cloud/swoft
cd swoft
docker-compose up
```
