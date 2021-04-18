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
    return await fetch(url, { method: 'POST', body: formdata })
        .then(res => res.buffer())
        .then(buffer => {
            return buffer
        })
}

exports.getJson = async(url) => {
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.',
        }
    }).catch(err => { throw err })
    return res.data
}

exports.postJson = async(url, formdata) => {
    const res = await axios.post(url, formdata, {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.'
        }
    }).catch(err => { throw err })
    return res.data
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