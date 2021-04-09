const { WAConnection } = require("@adiwajshing/baileys")
const chalk = require('chalk')
const fs = require("fs")

const lolhuman = new WAConnection()
exports.lolhuman = lolhuman

exports.connect = async() => {
    console.log(chalk.whiteBright('╭─── [ LOG ]'))
    let auth = './lolhuman.json'
    lolhuman.logger.level = 'warn'
    lolhuman.on("qr", () => {
        console.log(`QR Siap, Scan Pack`)
    })
    fs.existsSync(auth) && lolhuman.loadAuthInfo(auth)
    lolhuman.on('connecting', () => {
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright("Connecting..."))
    })
    lolhuman.on('open', () => {
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright("WA Version : " + lolhuman.user.phone.wa_version))
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright("OS Version : " + lolhuman.user.phone.os_version))
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright("Device : " + lolhuman.user.phone.device_manufacturer))
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright("Model : " + lolhuman.user.phone.device_model))
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright("OS Build Number : " + lolhuman.user.phone.os_build_number))
        console.log(chalk.whiteBright("├"), chalk.keyword("aqua")("[  STATS  ]"), chalk.whiteBright('Welcome My Senpai'))
        const authInfo = lolhuman.base64EncodedAuthInfo()
        fs.writeFileSync(auth, JSON.stringify(authInfo, null, '\t'))
    })
    await lolhuman.connect({ timeoutMs: 30 * 1000 })
    return lolhuman
}