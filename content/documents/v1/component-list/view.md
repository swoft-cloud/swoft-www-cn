+++
title = "视图"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 308

[menu.v1]
  parent = "component-list"
  weight = 8
+++
Swoft 提供了简单方便的视图渲染支持. 使用php原生语法，提供基本的布局，内部引入文件等功能。

## 仓库

github - https://github.com/swoft-cloud/swoft-view

## 安装

视图渲染作为一个额外的独立组件，需要手动安装：

- 通过 composer 命令:

```bash
composer require swoft/view dev-master
```

- 通过 composer.json 配置:

```json
    "swoft/view": "~1.0"
```

## 基本信息

视图核心类文件： `\Swoft\View\Base\View`
注解tag类： `Swoft\View\Bean\Annotation\View`

## 配置视图组件

当你安装了 view 组件后，swoft 将会自动的注册它。

- 为何会自动注册 

:) 请参考： `swoft-view/src/Bootstrap/CoreBean.php`，以及前面的 **组件**

- 视图组件注册到容器里的名称为： `view`
- 基本配置(file: `config/beans/base.php`)

```php
'view' => [
    // class 配置是可以省略的, 因为 view 组件里已经配置了它
    // 'class' => \Swoft\View\Base\View::class,
    'viewsPath' => dirname(__DIR__) . '/resources/views/',
],
```

现在在任何地方都可以通过 `view()` OR `\Swoft::getBean('view')` 来获取组件实例。

### 配置项说明

- `viewsPath` 视图存放路径
- `layout` 默认的布局文件。 调用 `render()` 方法时会默认的使用它
- `suffix` 默认的视图后缀(默认是 `php`)
- `suffixes` 允许的视图后缀列表。 用于判断是否需要添加默认后缀
- `placeholder` 在布局文件里使用的内容占位符。 默认 `{_CONTENT_}`

### 引入其他视图文件

在视图文件里包含其他视图文件，可以使用：

- `include(string $view, array $data, bool $outputIt = true)`
- `fetch(string $view, array $data)`

> 两个方法的区别是 `fetch()` 需要你手动调用 echo `<?= $this->fetch('layouts/default/header') ?>`

**注意：**

> 变量数据有作用域限制。 即是传入视图的变量，无法在包含的视图里直接使用，需要通过第二个参数 `$data` 传入到子级视图

```php
<body>
    <?php $this->include('layouts/default/header', ['logo' => 'xx/yy/logo.jpg']) ?>

    <div class="container">
        <!-- Content here -->
        <div id="page-content" style="padding: 15px 0;">{_CONTENT_}</div>
        <?php $this->include('layouts/default/footer') ?>
    </div>
</body>
```

## 使用视图

- 通过方法： `view()` 渲染一个视图文件
- 通过 `\Swoft::getBean('renderer')->rander('view file')` 渲染一个视图文件
- 在控制器的action注释上还可以快捷的使用 `@View()` 来使用

### 使用示例

```php
/**
 * 控制器demo
 *
 * @Controller(prefix="/demo")
 */
class DemoController
{
    /**
     * 视图渲染demo - 没有使用布局文件(请访问 /demo/view)
     * @RequestMapping()
     * @View(template="index/index") - 将会渲染 `resources/views/index/index.php` 文件
     */
    public function actionView()
    {
        $data = [
            'name' => 'Swoft',
            'repo' => 'https://github.com/swoft-cloud/swoft',
            'doc' => 'https://doc.swoft.org/',
            'method' => __METHOD__,
        ];

        // 根据请求适应返回类型，如请求视图，则会根据 @View() 注解来返回视图
        // 这里return的值将会传递给视图
        return $data;
    }

    /**
     * 视图渲染demo - 使用布局文件(请访问 /demo/layout)
     * @RequestMapping()
     * @View(template="demo/content", layout="layouts/default.php")
     */
    public function actionLayout()
    {
        $layout = 'layouts/default.php';
        $data = [
            'name' => 'Swoft',
            'repo' => 'https://github.com/swoft-cloud/swoft',
            'doc' => 'https://doc.swoft.org/',
            'doc1' => 'https://swoft-cloud.github.io/swoft-doc/',
            'method' => __METHOD__,
            'layoutFile' => $layout
        ];
        return $data;
    }
}
```

### 如何查找视图

- 若你不添加后缀，会自动追加配置的默认后缀
- 使用相对路径时，将会在我们配置的视图目录里找到对应的view文件
- 使用绝对路径时，将直接使用它来渲染。(支持使用路径别名 `@res/views/my-view.php`)

### 使用布局文件

使用布局文件，方式有两种：

1. 在配置中 配置默认的布局文件，那么即使不设置 `layout`，也会使用默认的(视图的可用配置请看上一节)
2. 如示例一样，可以手动设置一个布局文件。它的优先级更高（即使有默认的布局文件，也会使用当前传入的替代。）
3. 你可以传入 `layout=false` 来禁用渲染布局文件

### 视图加载静态文件

Swoft 可以提供静态资源访问的支持，将静态文件放置于根目录下的 `public` 目录内即可，下面是一个引用的示例，注意引用时无需包含 `public`

```html
<script type="text/javascript" src="/static/some.js"></script>
```
