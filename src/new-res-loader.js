/** 官网范例,反正看不懂
 * - https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_1_%E2%80%93_JavaScript's_UTF-16_%3E_base64
 */
function b64ToUint6(nChr) {
    return nChr > 64 && nChr < 91
        ? nChr - 65 : nChr > 96 && nChr < 123
            ? nChr - 71 : nChr > 47 && nChr < 58
                ? nChr + 4 : nChr === 43
                    ? 62 : nChr === 47
                        ? 63 : 0
}

/** 官网范例+1,看不懂+1,作用是将base64编码的字符串转为ArrayBuffer */
function base64DecToArr(sBase64, nBlockSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length
    var nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2
    var aBytes = new Uint8Array(nOutLen)
    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++ , nOutIdx++) {
                aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0
        }
    }
    return aBytes
}

/**
 * 修改部分资源的载入方式,可以根据项目中实际用到的资源进行修改
 * - [注意] window.res 是自己定义的,可以修改
 */
cc.loader.addDownloadHandlers({
    json: function (item, callback) {
        callback(null, window.res[item.url])
    },
    plist: function (item, callback) {
        callback(null, window.res[item.url])
    },
    png: function (item, callback) {
        var img = new Image()
        img.src = "data:image/png;base64," + window.res[item.url]
        callback(null, img)
    },
    jpg: function (item, callback) {
        var img = new Image()
        img.src = "data:image/jpeg;base64," + window.res[item.url]
        callback(null, img)
    },
    mp3: function (item, callback) {
        cc.sys.__audioSupport.context.decodeAudioData(
            base64DecToArr(window.res[item.url]).buffer,
            // success
            function (buffer) {
                callback(null, buffer)
            },
            // fail
            function (buffer) {
                callback(new Error("mp3-res-fail"), null)
            }
        )
    },
})
