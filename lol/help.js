const fetch = require('node-fetch')
const axios = require('axios')
const fs = require('fs')

exports.getBuffer = async(url) => {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.' }, method: 'GET' })
    if (!res.ok) throw "Error while getting buffer"
    return res.buffer()
}

exports.postBufferFile = async(url, formdata) => {
    return await fetch(url, { method: 'POST', body: formdata })
        .then(res => res.buffer())
        .then(buffer => {
            var filename = './temp/' + this.getRandomExt('.png')
            fs.writeFileSync(filename, buffer)
            return filename
        })
}

exports.postBuffer = async(url, formdata) => {
    try {
        const res = await axios.post(url, formdata, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.'
            },
            responseType: "arraybuffer"
        })
        return res.data
    } catch (error) {
        throw error
    }
}

exports.getJson = async(url) => {
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.',
            }
        })
        return res.data
    } catch (error) {
        throw error
    }
}

exports.postJson = async(url, formdata) => {
    try {
        const res = await axios.post(url, formdata, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.'
            }
        })
        return res.data
    } catch (error) {
        throw error
    }
}

exports.getRandomExt = ext => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.sleep = async(ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

exports.randomChoice = array => {
    return array[Math.floor(Math.random() * array.length)]
}

exports.countdownTime = ms => {
    seconds = (ms / 1000).toFixed(0)
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor(seconds % (3600 * 24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)
    var dDisplay = d > 0 ? d + (d == 1 ? " hari, " : " hari, ") : ""
    var hDisplay = h > 0 ? h + (h == 1 ? " jam, " : " jam, ") : ""
    var mDisplay = m > 0 ? m + (m == 1 ? " menit, " : " menit, ") : ""
    var sDisplay = s > 0 ? s + (s == 1 ? " detik" : " detik") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

exports.exifUpdate = async(package, author) => {
    const json = {
        "sticker-pack-name": package,
        "sticker-pack-publisher": author,
    }
    let len = JSON.stringify(json).length
    const f = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
    const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]
    if (len > 256) {
        len = len - 256
        code.unshift(0x01)
    } else {
        code.unshift(0x00)
    }
    const fff = Buffer.from(code)
    const ffff = Buffer.from(JSON.stringify(json))
    if (len < 16) {
        len = len.toString(16)
        len = "0" + len
    } else {
        len = len.toString(16)
    }
    const ff = Buffer.from(len, 'hex')
    const buffer = Buffer.concat([f, ff, fff, ffff])
    fs.writeFileSync(`./lol/resource/exif.exif`, buffer)
}

exports.getRank = (user, nomor) => {
    var sortable = []
    var sorted = []
    for (var x in user) { sortable.push([x, user[x].level * 1000 + user[x].xp]) }
    sortable.sort(function(a, b) { return b[1] - a[1] })
    for (let x of sortable) { sorted.push(x[0]) }
    return sorted.indexOf(nomor) + 1
}