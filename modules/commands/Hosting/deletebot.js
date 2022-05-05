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
    name: "deletebot",
    description: "Deletes a bot from the server",
    usage: "deletebot <botname>",

    /**
     * @param {Message} message 
     * @param {String[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        if (!message.member.roles.cache.has(`${mainconfig.SeverRoles.OwnerRoleId}`)) return message.reply({
            content: `<:no:933239221836206131> **You Are Not Allowed To Execute This Command, Only Owners!**`
        })
        try {
            const logs = client.channels.cache.get(`${mainconfig.LoggingChannelID.BotManagementChannelID}`)
            // let bot = message.mentions.members.first() || client.users.cache.get(args[0])
            let bot
            try {
                bot = await GetBot(message, args);
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("ERROR:" + e)
            }
            if (!bot || !bot.id) return message.channel.send("**<:no:933239221836206131> To Delete The Folder, Please Mention a Bot!**");
            client.bots.ensure(bot.id, {
                info: "There Is No information on This Bot Available.",
                type: "Default"
            })
            let data = client.bots.get(bot.id, "info");
            if (!data || data.type == "Default") throw "E";
            let server = data.toString().split("\n")[6].split(",")[0];
            if (server.includes(".")) server = server.split(".")[3]
            let path = data.toString().split("\n")[2];
            let BotFileName = path.split("/")[path.split("/").length - 1]
            let {
                servers,
                usernames,
                passwords
            } = client.config;
            let theserver = servers[server];
            if (!theserver) return message.reply("❌ Could not find the Server");
            let alldata = false;
            const conn = new Client();

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

            collector.on("collect", (b) => {
                if (b.user.id !== message.author.id)
                    return b.reply({
                        content: `<:no:933239221836206131> **Only <@${message.author.id}> Allowed To React To This Message!**`,
                        ephemeral: true
                    })
                if (b.isButton()) {
                    if (b.customId == "Delete-Bot") {
                        conn.on("ready", () => {
                            conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                                if (err) throw err;
                                let showdata = "";
                                stream.on("close", (code, signal) => {
                                    setTimeout(() => {
                                        if (!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                        alldata = showdata.toString().split(" ")[1];

                                        if (!alldata) {
                                            message.reply(`❌ **Unable to remove the Bot from the Hosting the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`);
                                            return;
                                        }

                                        let botid = parseInt(alldata);

                                        conn.exec(`pm2 delete ${botid}`, (err, stream) => {
                                            if (err) throw err;
                                            stream.on("close", (code, signal) => {
                                                setTimeout(() => {
                                                    conn.exec("pm2 save", (err, stream) => {
                                                        if (err) throw err;
                                                        stream.on("close", (code, signal) => {
                                                            conn.exec(`rm -rf ${path}`, (err, stream) => {
                                                                setTimeout(() => {
                                                                    if (err) throw err;
                                                                    stream.on("close", (code, signal) => {
                                                                        setTimeout(() => {
                                                                            client.bots.delete(bot.id);

                                                                            const embed = new MessageEmbed()
                                                                                .setAuthor({
                                                                                    name: message.author.tag,
                                                                                    iconURL: message.author.displayAvatarURL({
                                                                                        dynamic: true
                                                                                    })
                                                                                })
                                                                                .setThumbnail("https://cdn.discordapp.com/emojis/868145779083198534.gif?size=128&quality=lossless")
                                                                                .setColor("RED")
                                                                                .setFooter({
                                                                                    text: `ID: ${message.author.id}`,
                                                                                    iconURL: message.author.displayAvatarURL({
                                                                                        dynamic: true
                                                                                    })
                                                                                })
                                                                                .setDescription(`👍 **Fully Deleted the Bot of:** ${bot} | ${bot.tag} (\`${bot.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                                            logs.send({
                                                                                embeds: [embed]
                                                                            });

                                                                            deletebot.edit({
                                                                                components: [Buttons_menu_Disabled]
                                                                            })
                                                                            b.reply({
                                                                                content: `:thumbsup: **Fully Deleted the Bot of:** ${bot} | ${bot.tag} (\`${bot.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``
                                                                            })
                                                                        }, 300)
                                                                    }).on('data', (data) => {}).stderr.on('data', (data) => {
                                                                        if (data && data.toString().length > 2) {
                                                                            console.log(data.toString());
                                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                                        }
                                                                    });
                                                                }, 300)
                                                            })
                                                        }).on('data', (data) => {}).stderr.on('data', (data) => {
                                                            if (data && data.toString().length > 2) {
                                                                console.log(data.toString());
                                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                            }
                                                        });
                                                    })
                                                }, 300)
                                            }).on('data', (data) => {}).stderr.on('data', (data) => {
                                                if (data && data.toString().length > 2) {
                                                    console.log(data.toString());
                                                    message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                }
                                            });
                                        })
                                    }, 300)
                                }).on('data', (data) => {
                                    showdata += data + "\n";
                                }).stderr.on('data', (data) => {
                                    showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                                });
                            })
                        }).connect({
                            host: theserver,
                            port: 22,
                            username: usernames[server],
                            password: passwords[server]
                        });
                    }
                    if (b.customId == "Dont-Delete") {
                        deletebot.edit({
                            components: [Buttons_menu_Disabled]
                        })
                        b.reply({
                            content: `**❌ Canceled The Deletion!**`
                        })
                    }
                }
            })
        } catch (e) {
            console.log(e.stack ? String(e.stack).grey : String(e).grey)
            return message.reply("❌ There is no detail Data about this Bot :c")
        }
    }
}