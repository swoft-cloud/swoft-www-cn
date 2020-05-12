+++
title = "验证器"
toc = true
type = "docs"
draft = false
date = "2018-09-19"
lastmod = "2018-09-20"
weight = 609

[menu.v2]
  parent = "core-components"
  weight = 9
+++

正常情况都需要对用户输入参数进行校验，此时就会用到验证器。验证器可以验证控制器中参数，也支持验证 Websocket 参数以及 RPC 参数验证，提供默认和自定义两种类型的验证器，还可添加自定义验证规则。

## 安装

使用验证器前，需要安装验证器组件，安装如下：

```bash
composer require swoft/validator
```

### 启用

成功安装好验证组件后，接下来需要启用验证器，这里以 `Http-server` 启用为例，其它一样(`app/bean.php`)

```php
return [
    // ......
    'httpDispatcher'    => [
        // ......
        'afterMiddlewares' => [
            \Swoft\Http\Server\Middleware\ValidatorMiddleware::class
        ]
        // ......
    ],
    // ......
];
```

> 2.0.5+ 验证器默认没有启动，需要开发者自己开启。

## 声明验证器

一个验证器由多个验证条件组合，建议验证器按数据库表进行组合，这样可以充分的重复利用验证器里面的组合条件。

### 验证器

如下定义一个 TestValidator 验证器，由多个验证项（验证器条件）组成。

```php
<?php declare(strict_types=1);

namespace App\Validator;

use App\Annotation\Mapping\AlphaDash;
use Swoft\Validator\Annotation\Mapping\IsInt;
use Swoft\Validator\Annotation\Mapping\IsString;
use Swoft\Validator\Annotation\Mapping\Validator;

/**
 * Class TestValidator
 *
 * @since 2.0
 *
 * @Validator(name="TestValidator")
 */
class TestValidator
{
    /**
     * @IsString() //类型注解
     * @Email() //条件注解
     * @var string
     */
    protected $name = 'defualtName';

    /**
     * @IsInt(message="type must Integer")
     *
     * @var int
     */
    protected $type;
}
```

### @Validator 注解

声明一个验证器

* `name` 定义验证器的名称，方便引用，如果不定义默认就是类名全路径。

### 验证项

`验证项`是组成验证器的唯一条件，标记有`类型注解`的属性就是一个`验证项`，一个验证器可以有多个`验证项`。

* `属性`的默认值就是`参数`的默认值，如果`属性`没有定义默认值，代表`参数`没有定义默认值且必须传递。
* 一个`属性`必须定义一个`类型注解`，否则不是一个验证项且对参数验证无效。
* 一个属性可以多个`条件注解`，按照定义顺序验证数据。
* 默认`属性`名称就是需要验证的`参数名称`，也可以通过类型注解的 `name` 参数映射需要验证的字段名称。
* 若验证不通过时，将会抛出 `Swoft\Validator\Exception\ValidatorException` 异常。

### 类型注解

一个属性必须定义一个类型注解，否则不是一个验证项且对参数验证无效。

属性的默认值就是参数的默认值，如果属性没有定义默认值，代表参数没有定义默认值且必须传递。

#### @IsArray

验证规则:

验证参数值必须是数组,使用 `is_array()`函数进行校验。

参数说明:

* `name:` 映射需要验证的字段名称，默认属性名称。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@IsArray(name="field", message="error message")`。

#### @IsBool

验证规则:

验证参数值必须是 `bool` 类型，注意字符串 `true` `false` ，会验证成 `bool` 类型,其余数据将会使用`is_bool()`函数进行验证。

参数说明:

* `name:` 映射需要验证的字段名称，默认属性名称。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@IsBool(name="field", message="error message")`。

#### @IsFloat

验证规则:

验证参数值必须是浮点数,使用`filter_var()`函数进行验证。

参数说明:

* `name:` 映射需要验证的字段名称，默认属性名称。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@IsFloat(name="field", message="error message")`。

#### @IsInt

验证规则:

验证参数值必须是整数，使用`filter_var()`函数进行验证。

参数说明:

* `name:` 映射需要验证的字段名称，默认属性名称。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@IsInt(name="field", message="error message")`。

#### @IsString

验证规则:

验证参数值必须是字符串，使用`is_string()`函数进行验证。

参数说明:

* `name:` 映射需要验证的字段名称，默认属性名称。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@IsString(name="field", message="error message")`。

### 条件注解

一个属性可以多个条件注解，按照定义顺序验证数据。

#### @AfterDate

验证规则:

验证参数值必须在某个日期之后，参数支持 `字符串时间戳`、`格式化日期字符串（只支持 Y-m-d H:i:s）`、`整型时间戳`，可在`@IsString` 或 `@IsInt` 类型注解中使用。

参数说明:

* `date:` 要对比的日期值，只能是 `Y-m-d H:i:s` 格式。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@AfterDate(date="2019-01-01 00:00:00", message="error message")`。

#### @Alpha

验证规则:

验证参数值必须是 `大写字母` 或 `小写字母`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Alpha(message="error message")`。

#### @AlphaDash

验证规则:

验证参数值必须是 `大写字母` 、 `小写字母`、`数字`、`短横 -`、`下划线 _`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@AlphaDash(message="error message")`。

#### @AlphaNum

验证规则:

验证参数值必须是 `大写字母` 、 `小写字母`、`数字`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@AlphaNum(message="error message")`。

#### @BeforeDate

验证规则:

验证参数值必须在某个日期之前，支持 `字符串时间戳`、`格式化日期字符串（只支持 Y-m-d H:i:s）`、`整型时间戳`，可在`@IsString` 或 `@IsInt` 类型注解中使用。

参数说明:

* `date:` 要对比的日期值，只能是 `Y-m-d H:i:s` 格式。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@BeforeDate(date="2019-01-01 00:00:00", message="error message")`。

#### @Chs

验证规则:

验证参数值只能是 `中文`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Chs(message="error message")`。

#### @ChsAlpha

验证规则:

验证参数值必须是 `中文`、`大写字母` 、 `小写字母`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@ChsAlpha(message="error message")`。

#### @ChsAlphaDash

验证规则:

验证参数值必须是 `中文`、`大写字母` 、 `小写字母`、`数字`、`短横 -`、`下划线 _`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@ChsAlphaDash(message="error message")`。

#### @ChsAlphaNum

验证规则:

验证参数值必须是 `中文`、`大写字母` 、 `小写字母`、`数字`。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@ChsAlphaNum(message="error message")`。

#### @Confirm

验证规则:

验证参数值必须和另外一个字段参数值相同。

参数说明:

* `name:` 需要确认对比的字段名,在`类型注解`中设置过的 `name` 或者是默认的 `属性名`。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Confirm(name="field", message="error message")`。

#### @Different

验证规则:

验证参数值必须和另外一个字段参数值不同。

参数说明:

* `name:` 需要确认对比的字段名,在`类型注解`中设置过的 `name` 或者是默认的 `属性名`。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Different(name="field", message="error message")`。

#### @GreaterThan

验证规则:

验证参数值必须比另外一个字段参数值大，只支持 `int` 或 `float`, 字符串会被转化为 float 后进行对比。

参数说明:

* `name:` 需要确认对比的字段名,在`类型注解`中设置过的 `name` 或者是默认的 `属性名`。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@GreaterThan(name="field", message="error message")`。

#### @LessThan

验证规则:

验证参数值必须比另外一个字段参数值小，只支持 `int` 或 `float`, 字符串会被转化为 float 后进行对比。

参数说明:

* `name:` 需要确认对比的字段名,在`类型注解`中设置过的 `name` 或者是默认的 `属性名`。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@LessThan(name="field", message="error message")`。

#### @Date

验证规则:

验证参数值必须是日期格式，支持 `字符串时间戳`、`格式化日期字符串（只支持 Y-m-d H:i:s）`、`整型时间戳`，可在`@IsString` 或 `@IsInt` 类型注解中使用。

> 注意由于时间戳的特殊性默认为一个整型 大于 `PHP_INT_MIN` , 小于 `PHP_INT_MAX` 常量的数值均为有效时间戳。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Date(message="error message")`。

#### @DateRange

验证规则:

验证参数值必须在某个日期范围之内（可以等于临界日期），支持 `字符串时间戳`、`格式化日期字符串（只支持 Y-m-d H:i:s）`、`整型时间戳`，可在`@IsString` 或 `@IsInt` 类型注解中使用。

参数说明:

* `start:` 要对比的开始日期值，只能是 `Y-m-d H:i:s` 格式。
* `end:` 要对比的结束日期值，只能是 `Y-m-d H:i:s` 格式。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@DateRange(start="2019-01-01 00:00:00",end="2019-01-01 00:00:00", message="error message")`。

#### @Dns

验证规则:

验证参数值必须是一个具有有效 DNS 记录域名或者ip，使用 `checkdnsrr()` 函数校验。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Dns(message="error message")`。

#### @Email

验证规则:

验证参数值格式必须为邮箱

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Email(message="error message")`。

#### @Enum

验证规则:

验证参数值必须在枚举数组里面。

参数说明:

* `values:` 枚举数组集合
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Enum(values={1,2,3},message="error message")`。

#### @File

验证规则:

验证此参数的值必须是文件，可以是单个文件，也可以是表单数组上传的多个文件。**注意文件上传后文件域的获取需要通过 `Swoft\Http\Message\Request` 对象去获取**。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@File(message="error message")`。

#### @FileMediaType

验证规则:
> 使用此条件前必须使用 `@File` 规则为基础。
验证每个上传的文件 mediaType 类型,支持表单数组，批量文件。

参数说明:

* `mediaType:` mediaType类型数组。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@FileMediaType(mediaType={"image/gif","image/png"},message="error message")`。

#### @FileSize

验证规则:
> 使用此条件前必须使用 `@File` 规则为基础。
验证每个上传的文件尺寸大小（单位 `byte 字节`）,支持表单数组，批量文件。

参数说明:

* `size:` 文件尺寸大小，单位 `byte`。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@FileSize(size=1024,message="error message")`。

#### @FileSuffix

验证规则:

> 使用此条件前必须使用 `@File` 规则为基础。
验证每个上传的文件后缀名,支持表单数组，批量文件。

参数说明:

* `suffix:` 后缀名数组。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@FileSuffix(suffix={"png","jpg"},message="error message")`。

#### @Ip

验证规则:

验证参数值必须是个IP类型。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Ip(message="error message")`。

#### @Length

验证规则:

验证参数值长度限制。

参数说明:

* `min:` 最小值(包含当前值)。
* `max:` 最大值(包含当前值)。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Length(min=1,max=4,message="error message")`。

#### @Low

验证规则:

验证参数值必须是小写字母。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Low(message="error message")`。

#### @Max

验证规则:

最大值验证，必须是整数。

参数说明:

* `value` 最大值(包含当前值)
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Max(value=5,message="error message")`。

#### @Min

验证规则:

最小值验证

参数说明:

* `value` 最小值(包含当前值)
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Min(value=5,message="error message")`。

#### @Mobile

验证规则:

手机号验证。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Mobile(message="error message")`。

#### @NotEmpty

验证规则:

参数值不能为空验证。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@NotEmpty(message="error message")`。

#### @NotInEnum

验证规则:

验证参数值必须不在枚举数组中。

参数说明:

* `values` 枚举数组集合。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@NotInEnum(values={1,2,3},message="error message")`。

#### @NotInRange

验证规则:

验证参数值必须不在范围内

参数说明:

* `min:` 最小值(包含当前值)。
* `max:` 最大值(包含当前值)。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@NotInRange(min=1,max=5,message="error message")`。

#### @Pattern

验证规则:

正则表达式验证。

参数说明:

* `regex:` 正则表达式。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Pattern(regex="/^1\d{10}$/", message="error message")`。

#### @Range

验证规则:

参数值范围验证。

参数说明:

* `min:` 最小值(包含当前值)。
* `max:` 最大值(包含当前值)。
* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Range(min=1,max=5,message="error message")`。

#### @Required

验证规则:

如果属性没有设置默认值时，使用此规则后，若参数传递时没有此字段时会触发拦截。

使用示例:
`@Required()`。


#### @Upper

验证规则:

验证参数值必须是大写字母。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Range(message="error message")`。

#### @Url

验证规则:

验证参数值必须是有效的URL格式，使用 `filter_var()`函数验证。

参数说明:

* `message:` 验证失败时的错误提示，若不设置则默认使用框架内置的。

使用示例:
`@Url(message="error message")`。

> 暂时官方提供了这些条件验证，如果有其它需求可以根据 [自定义验证器规则](#自定义验证器规则) 此章节内容自行添加验证规则。

## 自定义验证器

常见的业务默认验证器就能解决，但是有些业务默认验证器是没法验证，此时就需要用户根据自己业务需求，定义满足自己业务的验证器。

声明验证器很简单

* 定一个类实现 `Swoft\Validator\Contract\ValidatorInterface` 接口
* 实现 `validate` 方法，里面可以定义自己的业务验证器逻辑
* 使用 `@Validator` 注解标记这是一个验证器，此注解使用和功能和之前介绍完全一样

如下定义了一个验证器，验证 `start` 开始时间不能大于 `end` 结束时间

```php
<?php declare(strict_types=1);

namespace App\Validator;

use Swoft\Validator\Annotation\Mapping\Validator;
use Swoft\Validator\Contract\ValidatorInterface;
use Swoft\Validator\Exception\ValidatorException;

/**
 * Class CustomerValidator
 *
 * @since 2.0
 *
 * @Validator(name="userValidator")
 */
class CustomerValidator implements ValidatorInterface
{
    /**
     * @param array $data
     * @param array $params
     *
     * @return array
     * @throws ValidatorException
     */
    public function validate(array $data, array $params): array
    {
        $start = $data['start'] ?? null;
        $end = $data['end'] ?? null;
        if ($start === null && $end === null) {
            throw new ValidatorException('Start time and end time cannot be empty');
        }
        if ($start > $end) {
            throw new ValidatorException('Start cannot be greater than the end time');
        }
        return $data;
    }
}
```

### 验证方法详细介绍

```php
public function validate(array $data, array $params): array
```

* $data 用户输入参数，通过对于的解析器，已解析成数组
* $params 传递给验证器的参数，后续章节详细介绍

验证成返回验证处理后的数据 , 如果验证失败，抛出 `Swoft\Validator\Exception\ValidatorException` 异常，其它由框架处理。如果验证器里面需要修改参数值，可以直接修改，修改后获取值的地方会得到新的值。

## 自定义验证器规则

之前我们介绍过了如何使用自定义验证器，但是有些时候我们想要扩展我们的验证器规则，而非重新自定义一个验证器，对于这种场景的应用，我们也能够比较方便的添加我们自己的验证器规则，请阅读下方详细步骤

> Available: `>= v2.0.3`

我们在  [声明验证器](#声明验证器)  这一节中声明的验证器基础上，添加一个 `password` 字段，使用一个我们自定义的验证规则来验证该字段。

```php
    /**
     * @AlphaDash(message="Passwords can only be alphabet, numbers, dashes, underscores")
     *
     * @var string
     */
    protected $password;
```

如上我们就添加好了一个 `password` 字段，并且使用了一个 `@AlphaDash()` 的验证规则，该规则就是我们接下来要自定义的规则，它的功能是校验该字段的格式，使其只能是 `字母`,`数字`,`-`,`_`。

思考下由于我们的验证规则是以注解的方式工作的，所以定义验证规则，其实也就是相当于定义一个我们自己的自定义注解命令，这一点清楚了之后我们继续。

### 声明规则注解

> **注意** 我们强烈建议你按照  [应用结构](../quick-start/project-skeleton.md) 中的建议，将自定义的注解定义到 `App/Annotation` 路径中。

```php
<?php declare(strict_types=1);

namespace App\Annotation\Mapping;

use Doctrine\Common\Annotations\Annotation\Attribute;
use Doctrine\Common\Annotations\Annotation\Attributes;

/**
 * Class AlphaDash
 *
 * @since 2.0
 *
 * @Annotation
 * @Attributes({
 *     @Attribute("message",type="string")
 * })
 */
class AlphaDash 
{
    /**
     * @var string
     */
    private $message = '';

    /**
     * @var string
     */
    private $name = '';

    /**
     * StringType constructor.
     *
     * @param array $values
     */
    public function __construct(array $values)
    {
        if (isset($values['value'])) {
            $this->message = $values['value'];
        }
        if (isset($values['message'])) {
            $this->message = $values['message'];
        }
        if (isset($values['name'])) {
            $this->name = $values['name'];
        }
    }

    /**
     * @return string
     */
    public function getMessage(): string
    {
        return $this->message;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }
}
```

**@Annotation** 声明这个类是一个注解命令

**@Attributes** 声明注解参数集合

**@Attribute** 声明注解具体的参数

* `name` 参数的名字
* `type` 参数值的类型

### 类属性方法说明

`$message` 就是我们使用该注解时传入的提示。例如 `@IsString(message="该字段必须是字符串")`
`$name` 就是字段的名字，为空的话则默认就是属性名 例如 `@IsString(name="user_name")`
`$value` 则是我们需要传递给验证规则的一些数据，若无需传参则可以不用定义。例如 `@Enum(values=[1,2,3])`
`getMessage()`,`getName()` 方法必须存在。用来获取`$message` 和 `$name` 

### 声明注解解析

至此，我们定义好了注解命令，但是注解命令要想能够执行，则还需要定义一个注解命令的解析器，下方就是一个注解解析器，需要继承
`Swoft\Annotation\Annotation\Parser\Parser` 类。

```php
<?php declare(strict_types=1);

namespace App\Annotation\Parser;

use ReflectionException;
use Swoft\Annotation\Annotation\Mapping\AnnotationParser;
use Swoft\Annotation\Annotation\Parser\Parser;
use App\Annotation\Mapping\AlphaDash;
use Swoft\Validator\Exception\ValidatorException;
use Swoft\Validator\ValidatorRegister;

/**
 * Class AlphaDashParser
 *
 * @AnnotationParser(annotation=AlphaDash::class)
 */
class AlphaDashParser extends Parser
{
    /**
     * @param int $type
     * @param object $annotationObject
     *
     * @return array
     * @throws ReflectionException
     * @throws ValidatorException
     */
    public function parse(int $type, $annotationObject): array
    {
        if ($type != self::TYPE_PROPERTY) {
            return [];
        }
        //向验证器注册一个验证规则
        ValidatorRegister::registerValidatorItem($this->className, $this->propertyName, $annotationObject);
        return [];
    }
}
```

**@Attributes** 声明要解析的注解命令

**parse()** 由于我们继承了 `Swoft\Annotation\Annotation\Parser\Parser` , 而它有声明了一个 `Swoft\Annotation\Annotation\Parser\ParserInterface` 接口,而这个方法正是 `ParserInterface` 这个接口所定义的一个必须由我们来实现的一个接口。
其实这里就是我们要处理的业务逻辑了，Swoft 解析到一个注解命令后，就会执行这个注解所对应的解析器中的 `parse()` 这个方法。

### 声明一个验证规则

经过之前的步骤我们已经定义好了验证规则的注解以及它的解析器，但是我们还没有定义我们的具体的验证规则，所以接下来，我们将声明我们具体的验证规则， 其实很简单，我们只需要实现一个 `Swoft\Validator\Contract\RuleInterface` 接口就可以了。

```php
<?php declare(strict_types=1);

namespace App\Validator\Rule;

use App\Annotation\Mapping\AlphaDash;
use Swoft\Bean\Annotation\Mapping\Bean;
use Swoft\Validator\Contract\RuleInterface;
use Swoft\Validator\Exception\ValidatorException;

/**
 * Class AlphaDashRule
 *
 * @Bean(AlphaDash::class)
 */
class AlphaDashRule implements RuleInterface
{
    /**
     * @param array $data
     * @param string $propertyName
     * @param object $item
     * @param null $default
     *
     * @return array
     * @throws ValidatorException
     */
    public function validate(array $data, string $propertyName, $item, $default = null): array
    {
        $message = $item->getMessage();
        if (!isset($data[$propertyName]) && $default === null) {
            $message = (empty($message)) ? sprintf('%s must exist!', $propertyName) : $message;
            throw new ValidatorException($message);
        }
        $rule = '/^[A-Za-z0-9\-\_]+$/';
        if (preg_match($rule, $data[$propertyName])) {
            return [$data];
        }
        $message = (empty($message)) ? sprintf('%s must be a email', $propertyName) : $message;
        throw new ValidatorException($message);
    }
}
```

**@Bean** 由于验证器内部是通过 `Bean` 容器来获得到我们的验证规则的，代码如下

```php
$rule = BeanFactory::getBean($itemClass);//这里通过容器拿到了我们的验证规则
$data = $rule->validate($data, $propName, $item, $default);
```

所以这里我们就要使用 `@Bean` 来注册我们的验证规则，名字就是和我们的注解命令相同。

**validate()** 这是 `RuleInterface` 接口中规定要实现的方法，到了这里其实就是写我们具体的验证规则了。

array $data 待验证的所有数据
string $propertyName 需要验证的字段名
$item 注解类的对象
$default 字段的默认值

* `array $data` 待验证的所有数据
* `string $propertyName` 需要验证的字段名
* `$item` 注解类的对象
* `$default` 字段的默认值

至此我们已经定义好了一个验证器规则。

## 控制器中使用

如果想在控制器中使用验证器很简单，只需要是一个注解 `@Validate` 就行

* 一个 `action` 可以定义多个 `@Validate` 使用多个验证器
* 多个验证器按照配置顺序验证

如下定义一个 `ValidatorController`, 同时使用默认验证器和自定义验证器以及我们自定义的验证规则。

```php
<?php declare(strict_types=1);

namespace App\Http\Controller;

use Swoft\Http\Message\Request;
use Swoft\Http\Server\Annotation\Mapping\Controller;
use Swoft\Http\Server\Annotation\Mapping\RequestMapping;
use Swoft\Validator\Annotation\Mapping\Validate;

/**
 * Class ValidatorController
 *
 * @Controller()
 */
class ValidatorController
{
    /**
     * 验证TestValidator验证器中的所有已定义字段
     *
     * @RequestMapping()
     * @Validate(validator="TestValidator")
     * @param Request $request
     *
     * @return array
     */
    public function validateAll(Request $request): array
    {
        return $request->getParsedBody();
    }

    /**
     * 仅验证TestValidator验证器中的 type 字段
     *
     * @RequestMapping()
     * @Validate(validator="TestValidator",fields={"type"})
     * @param Request $request
     *
     * @return array
     */
    public function validateType(Request $request): array
    {
        return $request->getParsedBody();
    }

    /**
     * 仅验证TestValidator验证器中的 password 字段 password字段使用的是自定义的验证规则。
     *
     * @RequestMapping()
     * @Validate(validator="TestValidator",fields={"password"})
     * @param Request $request
     *
     * @return array
     */
    public function validatePassword(Request $request): array
    {
        return $request->getParsedBody();
    }

    /**
     * 使用userValidator自定义验证器
     *
     * @RequestMapping()
     * @Validate(validator="userValidator")
     * @param Request $request
     *
     * @return array
     */
    public function validateCustomer(Request $request): array
    {
        return $request->getParsedBody();

    }
}
```

* `$request->getParsedBody()` 所有解析数据
* `$request->parsedBody('key', 'default')`  指定 KEY 解析数据
* `$request->getParsedQuery()` 所有解析的 Query 参数
* `$request->parsedQuery('key', 'default')`  指定 KEY 解析数据(>=2.0.2)

### @Validate

* validator 指定验证器名称
* fields 指定验证器里面验证的字段，这样可以高效的重复使用验证器
* type 默认 `body`，`ValidateType::GET` 验证 GET 请求 query 参数
* params 自定义验证器使用，传递给自定义验证器的参数

{{%alert note%}}
 `$request->getParsedBody()` 获取的请求数据，是已经通过验证器修改的数据。验证器可以支持表单、请求 body 数据验证，但是 body 验证需要定义对应的数据解析器，框架默认提供 JSON/XML 类型数据解析器，详细介绍，请参考 [Http Server](/documents/v2/core-components/http-server/) 章节。
{{%/alert%}}

验证 GET 请求 query 参数：

```php
use Swoft\Validator\Annotation\Mapping\ValidateType;
    /**
     * @RequestMapping()
     * @Validate(validator="TestValidator", type=ValidateType::GET)
     * @param Request $request
     *
     * @return array
     */
    public function validateType(Request $request): array
    {
        return $request->getParsedBody();
    }
```

## 非注解验证器

注解方式引用和使用验证器是有限制，只支持在 Http server/ Rpc server /Websocket server 等特定位置使用，在实际业务开发中，其它地方也会涉及参数的验证。

### 全局方法

```php
function validate(array $data, string $validatorName, array $fields = [], array $userValidators = []): array
```

全局函数使用，当验证器失败会抛出 `Swoft\Validator\Exception\ValidatorException` 异常

* $data 需要验证的数据，必须是数组 KV 格式
* $validatorName 使用的验证器( `@Validator()` 注解标记的 )
* $fields 需要验证的字段，为空验证器所有字段
* $userValidators 同时使用的自定义验证器，支持两种格式。

**示例：** 所有参数验证

```php
use Swoft\Validator\Annotation\Mapping\Validator;

$data = [
    'email' => 'swoft@xx'
]

$result = validate($data, Validator::class);
```

**示例：** 指定字段验证

```php
use Swoft\Validator\Annotation\Mapping\Validator;

$data = [
    'email' => 'swoft@xx'
]

$result = validate($data, Validator::class, ['email']);
```

**示例：** 同时使用自定义验证器

```php
use Swoft\Validator\Annotation\Mapping\Validator;

$data = [
  'start'  => 12,
    'end'    => 16,
];

$result = validate($data, Validator::class, [], ['testUserValidtor']);
```

**示例：** 同时使用自定义验证器且传递参数

```php
use Swoft\Validator\Annotation\Mapping\Validator;

$data = [
    'start'  => 12,
    'end'    => 16,
    'params' => [1, 2]
];

$users = [
    'testUserValidtor' => [1, 2]
];

$result = validate($data, Validator::class, [], $users);
```
