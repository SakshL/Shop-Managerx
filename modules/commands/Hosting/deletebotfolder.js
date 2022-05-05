const {
    Message,
    MessageEmbed
} = require('discord.js')
const {
    Client
} = require('ssh2');
const mainconfig = require("../../../mainconfig.js")
const {
    MessageButton,
    MessageActionRow,
    MessageSelectMenu
} = require('discord.js')
const {
    isValidTicket,
    GetBot,
    GetUser,
    duration,
    isvalidurl,
    delay,
    theDB,
    create_transcript_buffer,
    swap_pages2,
    logAction
} = require("../../utilfunctions");
module.exports = {
    name: "deletebotfolder",
    description: "Deletes a bot from the server",
    usage: "deletebotfolder <botname>",

    /**
     * @param {Message} message 
     * @param {String[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        if (!message.member.roles.cache.has(`${mainconfig.SeverRoles.OwnerRoleId}`)) return message.reply({
            content: `<:no:933239221836206131> **You Are Not Allowed To Execute This Command, Only Owners!**`
        })
        const logs = client.channels.cache.get(`${mainconfig.LoggingChannelID.BotManagementChannelID}`)
        try {
            var bot;
            try {
                bot = await GetBot(message, args);
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("ERROR:" + e)
            }
            if (!bot || !bot.id) return message.reply("❌ Did not find the User ... ERROR")
            client.bots.ensure(bot.id, {
                info: "No Info available",
                type: "Default"
            })
            let data = client.bots.get(bot.id, "info");
            if (!data || data.type == "Default") throw "E";
            let server = data.toString().split("\n")[6].split(",")[0];
            let path = data.toString().split("\n")[2];
            let BotFileName = path.split("/")[path.split("/").length - 1]
            let {
                servers,
                usernames,
                passwords
            } = client.config;
            let theserver = servers[server];


            const Buttons_menu = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setStyle("SUCCESS")
                    .setLabel(`Yes, Delete Bot`)
                    .setCustomId("Delete-Bot")
                    .setEmoji(`933239140718358558`)
                    .setDisabled(false),
                    new MessageButton()
                    .setStyle("DANGER")
                    .setLabel(`Don't Delete Bot`)
                    .setCustomId("Dont-Delete")
                    .setEmoji(`933239221836206131`)
                    .setDisabled(false),
                )

            const Buttons_menu_Disabled = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setStyle("SUCCESS")
                    .setLabel(`Yes, Delete Bot`)
                    .setCustomId("Delete-Bot")
                    .setEmoji(`933239140718358558`)
                    .setDisabled(true),
                    new MessageButton()
                    .setStyle("DANGER")
                    .setLabel(`Don't Delete Bot`)
                    .setCustomId("Dont-Delete")
                    .setEmoji(`933239221836206131`)
                    .setDisabled(true),
                )
            const deletebot = await message.reply({
                content: `:coin: **Are You Sure You Want To Delete ALL Files Of ${bot}?**\n> This Step Can't Be Undo, And Is Equivalent To "Complete-Deletion" `,
                components: [Buttons_menu]
            })

            let collector = deletebot.createMessageComponentCollector({
                time: 60000
            });

            collector.on("collect", async(b) => {
                if (b.user.id !== message.author.id)
                    return b.reply({
                        content: `<:no:933239221836206131> **Only <@${message.author.id}> Allowed To React To This Message!**`,
                        ephemeral: true
                    })
                if (b.isButton()) {
                    if (b.customId == "Delete-Bot") {
                        // Commands where it Deletes the bot!
                        if (!theserver) return message.reply(":x: Could not find the Server");
                        let theusername = usernames[server];
                        let thepassword = passwords[server];
                        const c = new Client();
                        try {
                            c.on("ready", async() => {
                                c.exec(`rm -rf ${path}`, async(err, stream) => {
                                    if (err) return message.channel.send("**:x: Could Not Delete The Bot**");
                                    console.log(b.message.content)
                                    await b.reply({
                                        content: `:thumbsup: **Removed the Bot-Folder of:** ${bot} | ${bot.user.tag} (\`${bot.id}\`)\n**Path:** \`${BOT_path}\`\n**Host:** \`${server}\``
                                    })
                                    console.log(b.message.content)
                                    stream.on("close", () => {
                                        c.end()
                                    });
                                });
                                let data = client.bots.get(bot.id, "info");
                                let server = data.toString().split("\n")[6].split(",")[0]
                                let BOT_path = data.toString().split("\n")[2];
                                await deletebot.edit({
                                    components: [Buttons_menu_Disabled]
                                })
                                const embed = new MessageEmbed()
                                    .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({
                                        dynamic: true
                                    }))
                                    .setThumbnail("https://cdn.discordapp.com/emojis/948085844181397574.webp?size=128&quality=lossless")
                                    .setColor("RED")
                                    .setFooter({
                                        text: `ID: ${message.author.id}`,
                                        iconURL: message.author.displayAvatarURL({
                                            dynamic: true
                                        })
                                    })
                                    .setDescription(`👍 **Deleted the Bot-Folder of:** ${bot} | ${bot.user.tag} (\`${bot.id}\`)\n**Path:** \`${BOT_path}\`\n**Host:** \`${server}\``)
                                return logs.send({
                                    embeds: [embed]
                                })
                            }).connect({
                                host: theserver,
                                port: 22,
                                username: theusername,
                                password: thepassword
                            })
                        } catch (err) {
                            console.log(err)
                            return message.channel.send(`${err}`)
                        }
                    }
                    if (b.customId == "Dont-Delete") {
                        let data = client.bots.get(bot.id, "info");
                        let server = data.toString().split("\n")[6].split(",")[0]
                        let BOT_path = data.toString().split("\n")[2];
                        await deletebot.edit({
                            components: [Buttons_menu_Disabled]
                        })
                        return b.reply({
                            content: `**❌ Canceled The Deletion!**`
                        })
                    }
                }
                b.deferUpdate().catch(() => {})
            })
        } catch (e) {
            console.log(e.stack ? String(e.stack).grey : String(e).grey)
            return message.reply("❌ There is no detail Data about this Bot :c")
        }
    }
}