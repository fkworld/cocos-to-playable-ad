/**
 * 修改部分资源的载入方式,可以根据项目中实际用到的资源进行修改
 * - [注意] window.res 是自己定义的,可以修改
 * - [注意] 需要使用 uglify-js 库进行压缩,所以只能使用es5语法
 */
cc.loader.addDownloadHandlers({
    json: function (item, callback) {
        callback(null, window.res[item.url])
    },
    png: function (item, callback) {
        var img = new Image()
        img.src = window.res[item.url]
        callback(null, img)
    },
    jpg: function (item, callback) {
        var img = new Image()
        img.src = window.res[item.url]
        callback(null, img)
    },
    plist: function (item, callback) {
        callback(null, window.res[item.url])
    },
});
