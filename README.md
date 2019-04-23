# douban-group-filter

## 介绍

仓库是为豆瓣小组写的 Tampermonkey 小插件，用于从豆瓣小组中高亮包含指定的关键字的帖子，并过滤掉包含想要排除的关键字的帖子。

## 功能
主要功能有：
- 高亮包含指定关键字的帖子
- 隐藏包含指定关键字的帖子；
- 去除标题省略号，展示全部文本；
- 新标签页打开帖子
- 展示是否是楼主的标识
- 展示楼层号
- 淡化已读帖子标题
- 增加帖子内内容跳转

## 使用

使用前：
![使用前](./screen/before.png)

设置高亮和排除的关键字
![使用前](./screen/setting.png)

设置后：
![设置后](./screen/after.png)

**包含摄影的帖子已经被高亮，而包含武汉的帖子已被隐藏。**

## 问题反馈与功能增加
[Issues](https://github.com/tcatche/douban-group-filter/issues)

## 协议
[MIT](./LICENSE)