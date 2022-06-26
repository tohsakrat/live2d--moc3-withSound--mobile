# llive2d--moc3-withSound -mobile
- 项在于[l2d-moc3](https://github.com/LitStronger/live2d-moc3)修改。
- 基于Live2D Cubism SDK for Web，你可以在[官方网站](https://www.live2d.com/zh-CHS/download/cubism-sdk/)上获得最新版本
- [官方sdk文档](https://docs.live2d.com/cubism-sdk-manual/warning-for-cubism4-web-r1-update/)聊胜于无，中文版和英文版都是低质机翻，完全没法看……😓主要还是靠自己读源码摸索着改。如果有人能看懂他那个文档跪求交流。
-  在[l2d-moc3](https://github.com/LitStronger/live2d-moc3)基础上：
-   针对最近新live json文件的特性调整了原先代码loder中可能报错的地方。
-   增加了对一些桌宠模型audio和text的支持。
-   增加了对移动端触摸事件的支持。
- 代码未压缩，如有需要可以自己打包一下。

## 参数

index.html中：

![image](https://user-images.githubusercontent.com/45536831/175789460-752fed84-832b-410c-a48a-05c84290bfb7.png)


main.js中
这里是对模型的缩放比例和位置偏移量进行设置。

![image](https://user-images.githubusercontent.com/45536831/175789500-2224e319-c21f-4350-923d-68b6a182287a.png)

## 示例
[达达利亚](https://gzszd.xyz/assets/l2d/Tartaglia.html)
[钟离](https://gzszd.xyz/assets/l2d/Zhongli.html)

作者[来人啊给我退下](https://space.bilibili.com/13975947)

## 展望
在琢磨怎么让同一个页面显示两个l2d，现在即使渲染开了两张画布，依然只有一张能工作。如果有dalao有头绪跪求赐教。
