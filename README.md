# cocos-to-playable-ad
将 cocos creator 构建出来的 web-mobile 项目打包为 playable-ad 项目，即单 html 文件。

## 如何使用？
- 输入：使用 cocos creator 构建出来的 web-mobile 项目文件夹
- 输出：index.html
- 验证过的 cocos creator 版本：2.1.3

## 核心算法
- 将项目所依赖的资源（暂时只有 png/jpg/json/plist，部分资源需要使用 base64 压缩）读取并写入到 window.res，保存为 res.js。
- 通过 cc.loader.addDownloadHandlers 修改资源载入方式，从 window.res 中载入资源，参考 new-res-loader.js。
- 将 index.html 中所依赖的 css 和 js 文件，包括 res.js/new-res-loader.js 写入到 html 文件本身。

## 依赖模块：
- https://github.com/GoalSmashers/clean-css，压缩 css。
- https://github.com/mishoo/UglifyJS2，压缩 js。
- fs 模块，读写文件。
- path 模块，处理路径相关（其实在项目中只用来获取文件的后缀名）。
- typescript 相关，本项目使用 ts 编写，使用 ts-node 创建。
