import * as fs from "fs"
import * as path from "path"
import * as uglify from "uglify-js"
import CleanCSS = require("clean-css")


export namespace X {

    /** 一些配置参数
     * - [注意] 路径问题.start脚本与web-mobile同层级,因此相对路径需要带上web-mobile;cocos在调用资源时没有web-mobile,需要在最后去掉
     */
    const C = {
        BASE_PATH: "src/web-mobile",            // web-mobile包基础路径
        RES_PATH: "src/web-mobile/res",         // web-mobile包下的res路径
        RES_BASE64_PREFIX: {                    // 一些资源的base64编码前缀(根据项目自行扩充)
            ".png": "data:image/png;base64,",
            ".jpg": "data:image/jpeg;base64,",
        },
        OUTPUT_RES_JS: "dist/res.js",           // 输出文件res.js
        OUTPUT_INDEX_HTML: "dist/index.html",   // 输出文件index.html的路径
        INPUT_HTML_FILE: "src/web-mobile/index.html",
        INPUT_CSS_FILES: [
            "src/web-mobile/style-mobile.css"
        ],
        INPUT_JS_FILES: [
            "dist/res.js",                      // 注意这里先输出再输入
            "src/web-mobile/cocos2d-js-min.js",
            "src/web-mobile/main.js",
            "src/web-mobile/src/settings.js",
            "src/web-mobile/src/project.js",
            "src/new-res-loader.js",
            "src/game-start.js",
        ],
    }

    /**
     * 读取文件(有额外处理,需要封装一次)
     * - 如果是特定格式,则返回base64编码后的内容
     * - 如果是一般格式,直接返回文件内容(string)
     * @param filepath
     */
    function read_file(filepath: string): string {
        let file = fs.readFileSync(filepath)
        let extname = path.extname(filepath)
        if (Reflect.has(C.RES_BASE64_PREFIX, extname)) {
            return `${C.RES_BASE64_PREFIX[extname]}${file.toString("base64")}`
        } else {
            return file.toString()
        }
    }

    /**
     * 获取路径下的所有子文件路径(深度遍历)
     * @param filepath
     */
    function get_all_child_file(filepath: string): string[] {
        let children = [filepath]
        for (; ;) {
            // 如果都是file类型的,则跳出循环
            if (children.every(v => fs.statSync(v).isFile())) { break }
            // 如果至少有1个directroy类型,则删除这一项,并加入其子项
            children.forEach((child, i) => {
                if (fs.statSync(child).isDirectory()) {
                    delete children[i]
                    let child_children = fs.readdirSync(child).map(v => `${child}/${v}`)
                    children.push(...child_children)
                }
            })
        }
        return children
    }

    /**
     * 将所有res路径下的资源转化为res.js
     * - 存储方式为:res-url(注意是相对的),res文件内容字符串或编码
     */
    function res_to_js() {
        // 读取并写入到一个对象中
        let res_object = {}
        let res_path_list = get_all_child_file(C.RES_PATH)
        res_path_list.forEach(path => {
            // 注意,存储时删除BASE_PATH前置
            let store_path = path.replace(new RegExp(`^${C.BASE_PATH}/`), "")
            res_object[store_path] = read_file(path)
        })
        // 写入文件
        fs.writeFileSync(C.OUTPUT_RES_JS, `window.res=${JSON.stringify(res_object)}`)
    }

    /** 将js文件转化为html文件内容(包括压缩过程) */
    function get_js_file_to_html_str(js_filepath: string): string {
        let js = read_file(js_filepath)
        let min_js = uglify.minify(js).code
        return min_js
    }

    /** 将css文件转化为html文件内容(包括压缩过程) */
    function get_css_file_to_html_str(css_filepath: string): string {
        let css = read_file(css_filepath)
        let min_css = new CleanCSS().minify(css).styles
        return `<style>${min_css}</style>`
    }

    /** 执行任务 */
    export function do_task() {
        // 前置:将res资源写成res.js
        console.time("写入res.js")
        res_to_js()
        console.timeEnd("写入res.js")


        // 清理html
        console.time("清理html")
        let html = read_file(C.INPUT_HTML_FILE)
        html = html.replace(/<link rel="stylesheet".*\/>/gs, "")
        html = html.replace(/<script.*<\/script>/gs, "")
        console.timeEnd("清理html")

        // 写入css
        console.time("写入css到html")
        C.INPUT_CSS_FILES.forEach(v => {
            html = html.replace(/<\/head>/, `${get_css_file_to_html_str(v)}\n</head>`)
        })
        console.timeEnd("写入css到html")

        // 写入js
        console.time("写入js到html")
        C.INPUT_JS_FILES.forEach(v => {
            html = html.replace(/<\/body>/, `<script type="text/javascript">${get_js_file_to_html_str(v)}</script>\n</body>`)
        })
        console.timeEnd("写入js到html")

        // 写入文件并提示成功
        console.time("输出html文件")
        fs.writeFileSync(C.OUTPUT_INDEX_HTML, html)
        console.timeEnd("输出html文件")
    }
}

X.do_task()
