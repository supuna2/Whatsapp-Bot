const { MessageType, GroupSettingChange } = require("@adiwajshing/baileys")
const { exec, execSync } = require('child_process')
const FormData = require('form-data')
const conn = require("./lol/connect")
const msg = require("./lol/message")
const wa = require("./lol/wa")
const chalk = require('chalk')
const fs = require("fs")

const help = require("./lol/help")
const { postBuffer, postBufferFile, postJson, getBuffer, getJson, getRandomExt, sleep, countdownTime, randomChoice } = help

// import config file
const config = require("./config.json")
const apikey = config.apikey
var prefix = config.prefix
const owner = config.owner
const mods = config.mods
var public = config.public

// Declare variable
const packageSticker = "LoL"
const authorSticker = "Human"

// import database
const user = JSON.parse(fs.readFileSync("./lol/database/user.json"))
const antinsfw = JSON.parse(fs.readFileSync("./lol/database/group/antinsfw.json"))
const antilink = JSON.parse(fs.readFileSync("./lol/database/group/antilink.json"))

conn.connect()
const lolhuman = conn.lolhuman

lolhuman.on('group-participants-update', async(chat) => {
    try {
        var member = chat.participants
        for (var x of member) {
            try {
                if (x == lolhuman.user.jid || !public) return
                var from = chat.jid
                var photouser = await wa.getPictProfile(x)
                var photogroup = await wa.getPictProfile(from)
                var username = await wa.getUserName(x)
                var group = await lolhuman.groupMetadata(from)
                param = `?apikey=${apikey}&img1=${photouser}&img2=${photogroup}&background=https://i.ibb.co/8B6Q84n/LTqHsfYS.jpg&username=${username}&member=${group.participants.length}&groupname=${group.subject}`

                // Member Join
                if (chat.action == 'add') {
                    console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  JOINS  ]"), chalk.keyword("white")(x.split("@")[0]), "to", chalk.keyword("yellow")(group.subject))
                    text = "@{nomor}, Welkam to {groupname}".format({ nomor: x.split("@")[0], groupname: group.subject })
                    image = `https://api.lolhuman.xyz/api/base/welcome${param}`
                    await wa.sendImageUrl(from, image, text, { contextInfo: { mentionedJid: [x] } })
                }
                // Member Leave
                if (chat.action == 'remove') {
                    console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[ LEAVE ]"), chalk.keyword("white")(x.split("@")[0]), "from", chalk.keyword("yellow")(group.subject))
                    text = `${username}, Sayonara 👋`
                    image = `https://api.lolhuman.xyz/api/base/leave${param}`
                    await wa.sendImageUrl(from, image, text, { contextInfo: { mentionedJid: [x] } })
                }
            } catch (e) {
                continue
            }
        }
    } catch (e) {
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  ERROR  ]"), chalk.keyword("red")(e))
    }
})

lolhuman.on('chat-update', async(lol) => {
    try {
        if (!lol.hasNewMessage) return
        if (!lol.messages) return
        if (lol.key && lol.key.remoteJid == 'status@broadcast') return
        lol = lol.messages.all()[0]
        if (!lol.message) return
        const from = lol.key.remoteJid
        const type = Object.keys(lol.message)[0]
        const quoted = type == 'extendedTextMessage' && lol.message.extendedTextMessage.contextInfo != null ? lol.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const typeQuoted = Object.keys(quoted)[0]
        const body = lol.message.conversation || lol.message[type].caption || lol.message[type].text || ""

        if (prefix != "") {
            if (!body.startsWith(prefix)) {
                cmd = false
                comm = ""
            } else {
                cmd = true
                comm = body.slice(1).trim().split(" ").shift().toLowerCase()
            }
        } else {
            cmd = false
            comm = body.trim().split(" ").shift().toLowerCase()
        }

        const reply = async(teks) => {
            await lolhuman.sendMessage(from, teks, MessageType.text, { quoted: lol })
        }

        const command = comm
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = cmd
        const botNumber = lolhuman.user.jid.split("@")[0]
        const isGroup = from.endsWith('@g.us')
        const sender = lol.key.fromMe ? botNumber : isGroup ? lol.participant : lol.key.remoteJid
        const senderNumber = sender.split("@")[0]
        const groupMetadata = isGroup ? await lolhuman.groupMetadata(from) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const groupMembers = isGroup ? groupMetadata.participants : ''
        const groupAdmins = isGroup ? await wa.getGroupAdmins(groupMembers) : []
        const isAdmin = groupAdmins.includes(sender)
        const botAdmin = groupAdmins.includes(lolhuman.user.jid)
        const totalChat = lolhuman.chats.all()
        const itsMe = senderNumber == botNumber
        const isOwner = senderNumber == owner || senderNumber == botNumber || mods.includes(senderNumber)

        const mentionByTag = type == "extendedTextMessage" && lol.message.extendedTextMessage.contextInfo != null ? lol.message.extendedTextMessage.contextInfo.mentionedJid : []
        const mentionByReply = type == "extendedTextMessage" && lol.message.extendedTextMessage.contextInfo != null ? lol.message.extendedTextMessage.contextInfo.participant || "" : ""
        const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
        mention != undefined ? mention.push(mentionByReply) : []
        const mentionUser = mention != undefined ? mention.filter(n => n) : []

        const isImage = type == 'imageMessage'
        const isVideo = type == 'videoMessage'
        const isAudio = type == 'audioMessage'
        const isSticker = type == 'stickerMessage'
        const isContact = type == 'contactMessage'
        const isLocation = type == 'locationMessage'

        typeMessage = body.substr(0, 50).replace(/\n/g, '')
        if (isImage) typeMessage = "Image"
        else if (isVideo) typeMessage = "Video"
        else if (isAudio) typeMessage = "Audio"
        else if (isSticker) typeMessage = "Sticker"
        else if (isContact) typeMessage = "Contact"
        else if (isLocation) typeMessage = "Location"

        const isQuoted = type == 'extendedTextMessage'
        const isQuotedImage = isQuoted && typeQuoted == 'imageMessage'
        const isQuotedVideo = isQuoted && typeQuoted == 'videoMessage'
        const isQuotedAudio = isQuoted && typeQuoted == 'audioMessage'
        const isQuotedSticker = isQuoted && typeQuoted == 'stickerMessage'
        const isQuotedContact = isQuoted && typeQuoted == 'contactMessage'
        const isQuotedLocation = isQuoted && typeQuoted == 'locationMessage'

        if (!public) {
            mods.indexOf(botNumber) === -1 ? mods.push(botNumber) : false
            mods.indexOf(owner) === -1 ? mods.push(owner) : false
            if (!mods.includes(senderNumber)) return
            mods.slice(mods.indexOf(owner), 1)
        }

        if (!isGroup && !isCmd) console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[ PRIVATE ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.keyword("yellow")(senderNumber))
        if (isGroup && !isCmd) console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  GROUP  ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.keyword("yellow")(senderNumber), chalk.greenBright("in"), chalk.keyword("yellow")(groupName))
        if (!isGroup && isCmd) console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[ COMMAND ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.keyword("yellow")(senderNumber))
        if (isGroup && isCmd) console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[ COMMAND ]"), chalk.whiteBright(typeMessage), chalk.greenBright("from"), chalk.keyword("yellow")(senderNumber), chalk.greenBright("in"), chalk.keyword("yellow")(groupName))

        if (body == "prefix") {
            await reply("Prefix saat ini: " + prefix)
        }

        var media = isQuoted && type == 'extendedTextMessage' ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
        var filename = './temp/' + getRandomExt()

        // Anti NSFW
        if (isImage && isGroup && antinsfw.includes(from)) {
            filebuffer = await wa.downloadMedia(lol)
            formdata = new FormData()
            formdata.append('img', filebuffer, filebuffer.fileName)
            result = await postJson(`https://api.lolhuman.xyz/api/nsfwcheck?apikey=${apikey}`, formdata)
            if (Number(result.result.replace("%", "")) >= 30) return wa.sendFakeStatus(from, "NSFW Detected with score: " + result.result, "WARNING")
        }

        // Anti Link
        if (antilink.includes(from) && body.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/) && !isCmd && !itsMe) {
            return wa.sendFakeStatus(from, "Link Detected: " + body.match(/(https?:\/\/[^ ]*)/)[1], "WARNING")
        }


        switch (command) {
            case 'owner':
                await wa.sendContact(from, owner, "LoL Human")
                break
            case 'help':
                username = await wa.getUserName(sender)
                text = msg.help(username, prefix)
                await wa.sendFakeStatus(from, text, "📖 Help")
                break
            case 'verify':
                if (user.hasOwnProperty(senderNumber)) return await wa.sendFakeStatus(from, 'Maaf Anda telah terdaftar sebelumnya', 'VERIFIED')
                username = await wa.getUserName(sender)
                username = encodeURI(username)
                photo = await wa.getPictProfile(sender)
                await getBuffer(`https://api.lolhuman.xyz/api/welcomeimage?apikey=${apikey}&img=${photo}&text=${username}`)
                    .then(async(image) => {
                        var data = {}
                        data["name"] = senderUsername
                        data["language"] = "id"
                        data["at"] = moment.tz('Asia/Jakarta').format('HH:mm:ss DD MMMM YYYY')
                        user[senderNumber] = data
                        text = language.verify.format({ nomor: senderNumber, prefix: prefix })
                        await wa.sendImageMention(from, image, text, [sender]).then(() => {
                            fs.writeFileSync('./lol/database/user.json', JSON.stringify(user))
                        })
                    })
                break
            case 'sticker':
                if ((isQuotedImage && isImage) && (isQuotedVideo && isVideo)) return await reply('Gambarnya mana?')
                var filepath = await lolhuman.downloadAndSaveMediaMessage(media, filename)
                var randomName = getRandomExt('.webp')
                ffmpeg(`./${filepath}`)
                    .input(filepath)
                    .on('error', () => {
                        fs.unlinkSync(filepath)
                        reply("Terjadi kesalahan saat mengconvert sticker.")
                    })
                    .on('end', () => {
                        buffer = fs.readFileSync(randomName)
                        wa.sendSticker(from, buffer, lol)
                        fs.unlinkSync(filepath)
                        fs.unlinkSync(randomName)
                    })
                    .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                    .toFormat('webp')
                    .save(randomName)
                break
            case 'toimg':
                if (!isQuotedSticker) return await reply('Stickernya mana?')
                await lolhuman.downloadAndSaveMediaMessage(media, filename).then(async(path) => {
                    let randomName = getRandomExt(".png")
                    randomName = './temp/' + randomName
                    exec(`ffmpeg -i ${path} ${randomName}`, async(err) => {
                        fs.unlinkSync(path)
                        if (err) return await reply("Terjadi kesalahan saat mengconvert gambar.")
                        let buffer = fs.readFileSync(randomName)
                        await wa.sendImage(from, buffer).then(() => {
                            fs.unlinkSync(randomName)
                        })
                    })
                })
                break
            case 'tomp3':
                if (!isQuotedVideo && !isVideo) return await reply('Videonya mana?')
                await lolhuman.downloadAndSaveMediaMessage(media, filename).then(async(path) => {
                    let randomName = getRandomExt(".mp3")
                    randomName = './temp/' + randomName
                    exec(`ffmpeg -i ${path} ${randomName}`, async(err) => {
                        fs.unlinkSync(path)
                        if (err) return await reply("Terjadi kesalahan saat mengconvert gambar.")
                        let buffer = fs.readFileSync(randomName)
                        await wa.sendAudio(from, buffer).then(() => {
                            fs.unlinkSync(randomName)
                        })
                    })
                })
                break


                // Self & Owner //
            case 'public':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (public) return await reply('Dah public daritadi mank')
                config["public"] = true
                public = true
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
                await wa.sendFakeStatus(from, "*Success changed to public mode*", "PUBLIC MODE")
                break
            case 'self':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (!public) return await reply('Dah private daritadi mank')
                config["public"] = false
                public = false
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
                await wa.sendFakeStatus(from, "*Success changed to self mode*", "SELF MODE")
                break
            case 'setprefix':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                var newPrefix = args[0] || ""
                config["prefix"] = newPrefix
                prefix = newPrefix
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
                await reply("Success change prefix to: " + prefix)
                break
            case 'broadcast':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                text = args.join(" ")
                for (let chat of totalChat) {
                    await wa.sendMessage(chat.jid, text)
                }
                break
            case 'setthumb':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                media = await lolhuman.downloadMediaMessage(media)
                fs.writeFileSync(`./lol/resource/fakethumb.jpg`, media)
                await wa.sendFakeStatus(from, "*Succes changed image for fakethumb*", "SUCCESS")
                break
            case 'fakethumb':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                media = await lolhuman.downloadMediaMessage(media)
                await wa.sendFakeThumb(from, media)
                break
            case 'stats':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                text = await msg.stats(totalChat)
                await wa.sendFakeStatus(from, text, "BOT STATS")
                break
            case 'block':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (isGroup) {
                    if (mentionUser.length == 0) return await reply("Tag yang mau di block pack")
                    return await wa.blockUser(sender, true)
                }
                await wa.blockUser(sender, true)
                break
            case 'unblock':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (isGroup) {
                    if (mentionUser.length == 0) return await reply("Tag yang mau di unblock pack")
                    return await wa.blockUser(sender, false)
                }
                await wa.blockUser(sender, false)
                break
            case 'leave':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                reply(`Akan keluar dari group ${groupName} dalam 3 detik`).then(async() => {
                    await help.sleep(3000)
                    await lolhuman.groupLeave(from)
                })
                break
            case 'join':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                if (isGroup) return await reply('Maap, command hanya untuk private')
                if (args.length == 0) return await reply('Link group nya mana bwank')
                var link = args[0].replace("https://chat.whatsapp.com/", "")
                await lolhuman.acceptInvite(link)
                break
            case 'clearall':
                if (!isOwner && !itsMe) return await reply('Maap ni, gw gk kenal lu')
                for (let chat of totalChat) {
                    await lolhuman.modifyChat(chat.jid, "delete")
                }
                await wa.sendFakeStatus(from, "Success clear all chat", "CLEAR CHAT")
                break
            case 'del':
                if (!isOwner && !itsMe) return await reply("Maap ni, gw gk kenal lu")
                await lolhuman.deleteMessage(from, { id: lol.message.extendedTextMessage.contextInfo.stanzaId, remoteJid: from, fromMe: true })
                break
            case 'colong':
                if (!isOwner && !itsMe) return await reply("Maap ni, gw gk kenal lu")
                if (!isQuotedSticker) return await reply('Stickernya mana?')
                await lolhuman.downloadAndSaveMediaMessage(media, filename).then(async(filepath) => {
                    var randomName = getRandomExt(".webp")
                    exec(`webpmux -set exif ./lol/resource/exif.exif ${filepath} -o ./temp/${randomName}`).on("close", async(data) => {
                        await wa.sendSticker(from, fs.readFileSync(`./temp/${randomName}`))
                        fs.unlinkSync(filepath)
                        fs.unlinkSync(`./temp/${randomName}`)
                    })
                })
                break
            case 'exif':
                if (!isOwner && !itsMe) return await reply("Maap ni, gw gk kenal lu")
                if (args.length == 0) return await reply(`Example: ${prefix}${command} LoL|Human`)
                var text = args.join(" ").split("|")
                await help.exifUpdate(text[0], text[1])
                await wa.sendFakeStatus(from, "Succes Mengubah Exif", "EXIF")
                break


                // Group //
            case 'hidetag':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin && !isOwner && !itsMe) return await reply('Sorry nih sorry, lu bukan admin')
                await wa.hideTag(from, args.join(" "))
                break
            case 'imagetag':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin && !isOwner && !itsMe) return await reply('Sorry nih sorry, lu bukan admin')
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                buffer = await lolhuman.downloadMediaMessage(media)
                await wa.hideTagImage(from, buffer)
                break
            case 'stickertag':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin && !isOwner && !itsMe) return await reply('Sorry nih sorry, lu bukan admin')
                if (!isQuotedImage && !isImage) return await reply('Stickernya mana?')
                media = isQuotedSticker ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                buffer = await lolhuman.downloadMediaMessage(media)
                await wa.hideTagSticker(from, buffer)
                break
            case 'promote':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (!botAdmin) return await reply('Monmaap ni, jadiin bot admin dulu atuh')
                if (mentionUser.length == 0) return await reply('Tag yang mau kau jadikan admin')
                await wa.promoteAdmin(from, mentionUser)
                await reply(`Success promote member`)
                break
            case 'demote':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (!botAdmin) return await reply('Monmaap ni, jadiin bot admin dulu atuh')
                if (mentionUser.length == 0) return await reply('Tag yang mau kau jadikan admin')
                await wa.demoteAdmin(from, mentionUser)
                await reply(`Success demote member`)
                break
            case 'admin':
                var text = msg.admin(groupAdmins, groupName)
                await wa.sendFakeStatus(from, text, "LIST ADMIN", groupAdmins)
                break
            case 'linkgc':
                var link = await wa.getGroupInvitationCode(from)
                await wa.sendFakeStatus(from, link, "LINK GROUP")
                break
            case 'group':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (!botAdmin) return await reply('Monmaap ni, jadiin bot admin dulu atuh')
                if (args[0] === 'open') {
                    lolhuman.groupSettingChange(from, GroupSettingChange.messageSend, false).then(() => {
                        wa.sendFakeStatus(from, "*Group telah dibuka untuk khalayak umum*", "GROUP SETTING")
                    })
                } else if (args[0] === 'close') {
                    lolhuman.groupSettingChange(from, GroupSettingChange.messageSend, true).then(() => {
                        wa.sendFakeStatus(from, "*Group telah ditutup untuk khalayak umum*", "GROUP SETTING")
                    })
                } else {
                    await reply(`Example: ${prefix}${command} open/close`)
                }
                break
            case 'setname':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (!botAdmin) return await reply('Monmaap ni, jadiin bot admin dulu atuh')
                var newName = args.join(" ")
                lolhuman.groupUpdateSubject(from, newName).then(() => {
                    wa.sendFakeStatus(from, "Nama group telah diubah menjadi " + newName, "GROUP SETTING")
                })
                break
            case 'setdesc':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (!botAdmin) return await reply('Monmaap ni, jadiin bot admin dulu atuh')
                var newDesc = args.join(" ")
                lolhuman.groupUpdateDescription(from, newDesc).then(() => {
                    wa.sendFakeStatus(from, "Deskripsi group telah diubah menjadi " + newDesc, "GROUP SETTING")
                })
            case 'antinsfw':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (args[0] === '1') {
                    if (antinsfw.indexOf(from) === -1) antinsfw.push(from)
                    await wa.sendFakeStatus(from, "Anti NSFW telah diaktifkan di group " + groupName, "GROUP SETTING")
                } else if (args[0] === '0') {
                    antinsfw.splice(from, 1)
                    await wa.sendFakeStatus(from, "Anti NSFW telah dinonaktifkan di group " + groupName, "GROUP SETTING")
                } else {
                    return await reply(`Example: ${prefix}${command} 1/0`)
                }
                fs.writeFileSync("./lol/database/group/antinsfw.json", JSON.stringify(antinsfw))
                break
            case 'antilink':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin) return await reply('Sorry nih sorry, lu bukan admin')
                if (args[0] === '1') {
                    if (antilink.indexOf(from) === -1) antilink.push(from)
                    await wa.sendFakeStatus(from, "Anti Link telah diaktifkan di group " + groupName, "GROUP SETTING")
                } else if (args[0] === '0') {
                    antilink.splice(from, 1)
                    await wa.sendFakeStatus(from, "Anti Link telah dinonaktifkan di group " + groupName, "GROUP SETTING")
                } else { return await reply(`Example: ${prefix}${command} 1/0`) }
                fs.writeFileSync("./lol/database/group/antilink.json", JSON.stringify(antilink))
                break


            case 'quotemaker':
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                if (args.length == 0) return await reply('Quotesnya mana oy')
                await wa.downloadMedia(media).then(async(filebuffer) => {
                    formdata = new FormData()
                    formdata.append('img', filebuffer, filebuffer.fileName)
                    formdata.append('text', args.join(" "))
                    await postBufferFile(`https://api.lolhuman.xyz/api/quotemaker3?apikey=${apikey}`, formdata).then(async(image) => {
                        await wa.sendImageFile(from, image)
                    })
                })
                break
            case 'waifu':
                await getBuffer(`https://api.lolhuman.xyz/api/random/waifu?apikey=${apikey}`).then(async(image) => {
                    await wa.sendImage(from, image)
                })
                break
            case 'smoji':
                if (args.length == 0) return reply(`Emojinya mana oy`)
                emoji = args[0]
                try { emoji = encodeURI(emoji[0]) } catch { emoji = encodeURI(emoji) }
                result = await getJson(`https://api.lolhuman.xyz/api/smoji3/${emoji}?apikey=${apikey}`)
                await getBuffer(`https://api.lolhuman.xyz/api/convert/towebp?apikey=${apikey}&img=${result.result.emoji.whatsapp}&package=${packageSticker}&author=${authorSticker}`).then(async(sticker) => {
                    await wa.sendSticker(from, sticker)
                })
                break
            case 'jadwalsholat':
                if (args.length == 0) return reply(`_Example: ${prefix}${command} yogyakarta_`)
                var daerah = args.join(" ")
                var result = await getJson(`https://api.lolhuman.xyz/api/sholat/${daerah}?apikey=${apikey}`)
                result = result.result
                text = `╭───「 Jadwal Sholat 」\n`
                text += `├❏ Wilayah : ${result.wilayah}\n│\n`
                text += `├❏ Tanggal : ${result.tanggal}\n│\n`
                text += `├❏ \`\`\`Sahur   : ${result.sahur}\`\`\`\n`
                text += `├❏ \`\`\`Imsak   : ${result.imsak}\`\`\`\n`
                text += `├❏ \`\`\`Subuh   : ${result.subuh}\`\`\`\n`
                text += `├❏ \`\`\`Dhuha   : ${result.dhuha}\`\`\`\n`
                text += `├❏ \`\`\`Dzuhur  : ${result.dzuhur}\`\`\`\n`
                text += `├❏ \`\`\`Ashar   : ${result.ashar}\`\`\`\n`
                text += `├❏ \`\`\`Maghrib : ${result.maghrib}\`\`\`\n`
                text += `├❏ \`\`\`Isya    : ${result.isya}\`\`\`\n│\n`
                text += `╰───「 LoL Human 」`
                await wa.sendFakeStatus(from, text, result.wilayah.toUpperCase())
                break

            default:
                if (body.startsWith(">")) {
                    if (!isOwner) return await reply('Maap ni, gw gk kenal lu')
                    return await reply(JSON.stringify(eval(body.slice(1).trim()), null, 2))
                }
        }
    } catch (e) {
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  ERROR  ]"), chalk.keyword("red")(e))
    }
})