const fetch = require('node-fetch')
const axios = require('axios')

exports.getBuffer = async(url) => {
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36.',
        },
        responseType: 'arraybuffer'
    }).catch(err => { throw err })
    return res.data
}

exports.postBuffer = async(url, formdata) => {
    const res = await axios.post(url, formdata, {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${formdata._boundary}`,
        },
        responseType: 'arraybuffer'
    }).catch(err => { throw err })
    return res.data
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