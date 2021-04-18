const {
    MessageType,
    Mimetype
} = require("@adiwajshing/baileys");
const connect = require('./connect');
const { getRandomExt } = require("./help");
const fs = require('fs')

const lolhuman = connect.lolhuman
const bufferFakeReply = fs.readFileSync('./lol/resource/fakereply.jpg')

exports.sendMessage = async(from, text, options = {}) => {
    await lolhuman.sendMessage(from, text, MessageType.text, options)
}

exports.sendAudio = async(from, buffer) => {
    await lolhuman.sendMessage(from, buffer, MessageType.audio, { mimetype: Mimetype.mp4Audio, ptt: true })
}

exports.sendImage = async(from, buffer, caption = "") => {
    await lolhuman.sendMessage(from, buffer, MessageType.image, { caption: caption })
}

exports.sendImageFile = async(from, filename, caption = "") => {
    await lolhuman.sendMessage(from, fs.readFileSync(filename), MessageType.image, { caption: caption })
    setTimeout(async() => { fs.existsSync(filename) && fs.unlinkSync(filename) }, 5000)
}

exports.sendVideo = async(from, buffer, caption = "") => {
    await lolhuman.sendMessage(from, buffer, MessageType.video, { caption: caption })
}

exports.sendSticker = async(from, buffer, quoted = "") => {
    await lolhuman.sendMessage(from, buffer, MessageType.sticker, { quoted: quoted })
}

exports.sendPdf = async(from, buffer, title = "LoL Human.pdf") => {
    await lolhuman.sendMessage(from, buffer, MessageType.document, { mimetype: Mimetype.pdf, title: title })
}

exports.sendGif = async(from, buffer) => {
    await lolhuman.sendMessage(from, buffer, MessageType.video, { mimetype: Mimetype.gif })
}

exports.sendContact = async(from, nomor, nama) => {
    const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + nama + '\n' + 'ORG:Kontak\n' + 'TEL;type=CELL;type=VOICE;waid=' + nomor + ':+' + nomor + '\n' + 'END:VCARD'
    await lolhuman.sendMessage(from, { displayname: nama, vcard: vcard }, MessageType.contact)
}

exports.sendMention = async(from, text, mentioned, quoted = "") => {
    await lolhuman.sendMessage(from, text, MessageType.text, { quoted: quoted, contextInfo: { mentionedJid: mentioned } })
}

exports.sendImageMention = async(from, buffer, caption = "", mentioned) => {
    await lolhuman.sendMessage(from, buffer, MessageType.image, { contextInfo: { mentionedJid: mentioned }, caption: caption })
}

exports.sendFakeStatus = async(from, text, faketext, mentioned = []) => {
    const options = {
        contextInfo: {
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            quotedMessage: {
                imageMessage: {
                    caption: faketext,
                    jpegThumbnail: bufferFakeReply
                }
            },
            mentionedJid: mentioned
        }
    }
    await lolhuman.sendMessage(from, text, MessageType.text, options)
}

exports.fakeStatusForwarded = async(from, text, faketext) => {
    const options = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            quotedMessage: {
                imageMessage: {
                    caption: faketext,
                    jpegThumbnail: bufferFakeReply
                }
            }
        }
    }
    await lolhuman.sendMessage(from, text, MessageType.text, options)
}

exports.sendFakeThumb = async(from, buffer, caption = "") => {
    let options = {
        thumbnail: fs.readFileSync('./lol/resource/fakethumb.jpg'),
        caption: caption
    }
    await lolhuman.sendMessage(from, buffer, MessageType.image, options)
}

exports.downloadMedia = async(media) => {
    return await lolhuman.downloadAndSaveMediaMessage(media, `./temp/${getRandomExt()}`).then(path => {
        let fileStream = fs.createReadStream(path)
        setTimeout(async() => { fs.existsSync(path) && fs.unlinkSync(path) }, 5000)
        return fileStream
    })
}

exports.hideTag = async(from, text) => {
    members = await this.getGroupParticipants(from)
    await lolhuman.sendMessage(from, text, MessageType.text, { contextInfo: { mentionedJid: members } })
}

exports.hideTagImage = async(from, buffer) => {
    members = await this.getGroupParticipants(from)
    await lolhuman.sendMessage(from, buffer, MessageType.image, { contextInfo: { mentionedJid: members } })
}

exports.hideTagSticker = async(from, buffer) => {
    members = await this.getGroupParticipants(from)
    await lolhuman.sendMessage(from, buffer, MessageType.sticker, { contextInfo: { mentionedJid: members } })
}

exports.hideTagContact = async(from, nomor, nama) => {
    let vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + nama + '\n' + 'ORG:Kontak\n' + 'TEL;type=CELL;type=VOICE;waid=' + nomor + ':+' + nomor + '\n' + 'END:VCARD'
    members = await this.getGroupParticipants(from)
    await lolhuman.sendMessage(from, { displayname: nama, vcard: vcard }, MessageType.contact, { contextInfo: { mentionedJid: members } })
}

exports.blockUser = async(id, block) => {
    if (block) return await lolhuman.blockUser(id, "add")
    await lolhuman.blockUser(id, "remove")
}

exports.getGroupParticipants = async(id) => {
    var members = await lolhuman.groupMetadata(id)
    var members = members.participants
    let mem = []
    for (let i of members) {
        mem.push(i.jid)
    }
    return mem
}

exports.getGroupAdmins = async(participants) => {
    admins = []
    for (let i of participants) {
        i.isAdmin ? admins.push(i.jid) : ''
    }
    return admins
}

exports.getGroupInvitationCode = async(id) => {
    const linkgc = await lolhuman.groupInviteCode(id)
    const code = "https://chat.whatsapp.com/" + linkgc
    return code
}

exports.kickMember = async(id, target = []) => {
    const group = await lolhuman.groupMetadata(id)
    const owner = g.owner.replace("c.us", "s.whatsapp.net")
    const me = lolhuman.user.jid
    for (i of target) {
        if (!i.includes(me) && !i.includes(owner)) {
            await lolhuman.groupRemove(to, [i])
        } else {
            await this.sendMessage(id, "Not Premited!")
            break
        }
    }
}

exports.promoteAdmin = async(to, target = []) => {
    const g = await lolhuman.groupMetadata(to)
    const owner = g.owner.replace("c.us", "s.whatsapp.net")
    const me = lolhuman.user.jid
    for (i of target) {
        if (!i.includes(me) && !i.includes(owner)) {
            await lolhuman.groupMakeAdmin(to, [i])
        } else {
            await this.sendMessage(to, "Not Premited!")
            break
        }
    }
}

exports.demoteAdmin = async(to, target = []) => {
    const g = await lolhuman.groupMetadata(to)
    const owner = g.owner.replace("c.us", "s.whatsapp.net")
    const me = lolhuman.user.jid
    for (i of target) {
        if (!i.includes(me) && !i.includes(owner)) {
            await lolhuman.groupDemoteAdmin(to, [i])
        } else {
            await this.sendMessage(to, "Not Premited!")
            break
        }
    }
}

exports.getUserName = async(jid) => {
    const user = lolhuman.contacts[jid]
    return user != undefined ? user.notify : ""
}

exports.getBio = async(mids) => {
    const pdata = await lolhuman.getStatus(mids)
    if (pdata.status == 401) {
        return pdata.status
    } else {
        return pdata.status
    }
}

exports.getPictProfile = async(mids) => {
    try {
        var url = await lolhuman.getProfilePicture(mids)
    } catch {
        var url = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    }
    return url
}