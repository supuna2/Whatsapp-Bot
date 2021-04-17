const fetch = require('node-fetch')
const axios = require('axios')
const fs = require('fs')

exports.getBuffer = async(url) => {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.' }, method: 'GET' })
    if (!res.ok) throw "Error while fetching data"
    return res.buffer()
}

exports.postBuffer = async(url, formdata) => {
    return await fetch(url, { method: 'POST', body: formdata })
        .then(res => res.buffer())
        .then(buffer => {
            var filename = './temp/' + this.getRandomExt('.png')
            fs.writeFileSync(filename, buffer)
            return filename
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

exports.getRandomExt = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.sleep = async(ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

exports.randomChoice = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}