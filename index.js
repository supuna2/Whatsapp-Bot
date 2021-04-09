const { MessageType, GroupSettingChange } = require("@adiwajshing/baileys")
const FormData = require('form-data')
const conn = require("./lol/connect")
const msg = require("./lol/message")
const wa = require("./lol/wa")
const chalk = require('chalk')
const fs = require("fs")

const help = require("./lol/help")
const postBuffer = help.postBuffer
const getBuffer = help.getBuffer
const postJson = help.postJson
const getJson = help.getJson

// import config file
const config = JSON.parse(fs.readFileSync("./config.json"))
const apikey = config.apikey
var prefix = config.prefix
const owner = config.owner
const mods = config.mods
var public = config.public

// import database
const user = JSON.parse(fs.readFileSync("./lol/database/user.json"))
const antinsfw = JSON.parse(fs.readFileSync("./lol/database/group/antinsfw.json"))

conn.connect()
const lolhuman = conn.lolhuman

lolhuman.on('group-participants-update', async(chat) => {
    try {
        var member = chat.participants
        for (var x of member) {
            try {
                if (x == lolhuman.user.jid) return
                var photo = await wa.getPictProfile(x)
                var username = await wa.getUserName(x) || "Guest"
                var from = chat.jid
                var group = await lolhuman.groupMetadata(from)

                // Member Join
                if (chat.action == 'add') {
                    getBuffer(`https://api.lolhuman.xyz/api/welcomeimage?apikey=${apikey}&img=${photo}&text=${username}`).then(image => {
                        text = `${username}, Welkam to ${group.subject}`
                        wa.sendImage(from, image, text)
                    })
                }
                // Member Leave
                if (chat.action == 'remove') {
                    text = `${username}, Sayonara 👋`
                    await wa.sendMessage(from, text)
                }
            } catch {
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
        const istMe = senderNumber == botNumber
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


        // Anti NSFW
        if (isImage && isGroup && antinsfw.includes(from)) {
            filebuffer = await wa.downloadMedia(lol)
            formdata = new FormData()
            formdata.append('img', filebuffer.stream, { knownLength: filebuffer.size });
            postJson(`https://api.lolhuman.xyz/api/nsfwcheck?apikey=${apikey}`, formdata).then((result) => {
                console.log(result.result)
                if (Number(result.result.replace("%", "")) >= 30) return wa.sendFakeStatus(from, "NSFW Detected", "WARNING")
            })
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
                username = await wa.getUserName(sender)
                username = encodeURI(username)
                photo = await wa.getPictProfile(sender)
                getBuffer(`https://api.lolhuman.xyz/api/welcomeimage?apikey=${apikey}&img=${photo}&text=${username}`)
                    .then(async(image) => {
                        text = `Hello, @${senderNumber}\n\n`
                        text += `Verifikasi telah berhasil dilakukan. Silahkan ketik ${prefix}help untuk melihat list command.`
                        await lolhuman.sendMessage(from, image, MessageType.image, { contextInfo: { mentionedJid: [sender], participant: sender }, caption: text })
                    })
                break


                // Self & Owner //
            case 'public':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (public) return await reply('Dah public daritadi mank')
                config["public"] = true
                public = true
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
                await wa.sendFakeStatus(from, "*Success changed to public mode*", "PUBLIC MODE")
                break
            case 'self':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (!public) return await reply('Dah private daritadi mank')
                config["public"] = false
                public = false
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
                await wa.sendFakeStatus(from, "*Success changed to self mode*", "SELF MODE")
                break
            case 'setprefix':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                var newPrefix = args[0] || ""
                config["prefix"] = newPrefix
                prefix = newPrefix
                fs.writeFileSync("./config.json", JSON.stringify(config, null, 4))
                await reply("Success change prefix to: " + prefix)
                break
            case 'broadcast':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                text = args.join(" ")
                for (let chat of totalChat) {
                    await wa.sendMessage(chat.jid, text)
                }
                break
            case 'setthumb':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                media = await lolhuman.downloadMediaMessage(media)
                fs.writeFileSync(`./lol/resource/fakethumb.jpg`, media)
                await wa.sendFakeStatus(from, "*Succes changed image for fakethumb*", "SUCCESS")
                break
            case 'fakethumb':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                media = await lolhuman.downloadMediaMessage(media)
                await wa.sendFakeThumb(from, media)
                break
            case 'stats':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                text = await msg.stats(totalChat)
                await wa.sendFakeStatus(from, text, "BOT STATS")
                break
            case 'block':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (isGroup) {
                    if (mentionUser.length == 0) return await reply("Tag yang mau di block pack")
                    return await wa.blockUser(sender, true)
                }
                await wa.blockUser(sender, true)
                break
            case 'unblock':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (isGroup) {
                    if (mentionUser.length == 0) return await reply("Tag yang mau di unblock pack")
                    return await wa.blockUser(sender, false)
                }
                await wa.blockUser(sender, false)
                break
            case 'leave':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                reply(`Akan keluar dari group ${groupName} dalam 3 detik`).then(async() => {
                    await help.sleep(3000)
                    await lolhuman.groupLeave(from)
                })
                break
            case 'join':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                if (isGroup) return await reply('Maap, command hanya untuk private')
                if (args.length == 0) return await reply('Link group nya mana bwank')
                var link = args[0].replace("https://chat.whatsapp.com/", "")
                await lolhuman.acceptInvite(link)
                break
            case 'clearall':
                if (!isOwner && !istMe) return await reply('Maap ni, gw gk kenal lu')
                for (let chat of totalChat) {
                    await lolhuman.modifyChat(chat.jid, "delete")
                }
                await wa.sendFakeStatus(from, "Success clear all chat", "CLEAR CHAT")
                break


                // Group //
            case 'hidetag':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin && !isOwner && !istMe) return await reply('Sorry nih sorry, lu bukan admin')
                await wa.hideTag(from, args.join(" "))
                break
            case 'imagetag':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin && !isOwner && !istMe) return await reply('Sorry nih sorry, lu bukan admin')
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                buffer = await lolhuman.downloadMediaMessage(media)
                await wa.hideTagImage(from, buffer)
                break
            case 'stickertag':
                if (!isGroup) return await reply('Maap, command hanya untuk group')
                if (!isAdmin && !isOwner && !istMe) return await reply('Sorry nih sorry, lu bukan admin')
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
                    await wa.sendFakeStatus(from, "NSFW telah diaktifkan di group " + groupName, "GROUP SETTING")
                } else if (args[0] === '0') {
                    antinsfw.splice(from, 1)
                    await wa.sendFakeStatus(from, "NSFW telah dinonaktifkan di group " + groupName, "GROUP SETTING")
                } else {
                    return await reply(`Example: ${prefix}${command} 1/0`)
                }
                fs.writeFileSync("./lol/database/group/antinsfw.json", JSON.stringify(antinsfw))
                break


            case 'quotemaker':
                if (!isQuotedImage && !isImage) return await reply('Gambarnya mana?')
                if (args.length == 0) return await reply('Quotesnya mana oy')
                media = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                filebuffer = await wa.downloadMedia(media)
                formdata = new FormData()
                formdata.append('img', filebuffer.stream, { knownLength: filebuffer.size });
                formdata.append('text', args.join(" "));
                postBuffer(`https://api.lolhuman.xyz/api/quotemaker3?apikey=${apikey}`, formdata).then((image) => {
                    wa.sendImage(from, image)
                })
                break
            default:
                if (body.startsWith(">")) {
                    if (!isOwner) return await reply('Maap ni, gw gk kenal lu')
                    return await reply(JSON.stringify(eval(args.join(" ")), null, 2))
                }
        }
    } catch (e) {
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  ERROR  ]"), chalk.keyword("red")(e))
    }
})