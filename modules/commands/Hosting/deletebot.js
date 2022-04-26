const { Message, MessageEmbed } = require('discord.js')
const {Client} = require('ssh2');
const { MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js')
module.exports = {
    name: "deletebot",
    description: "Deletes a bot from the server",
    usage: "deletebot <botname>",

    /**
     * @param {Message} message 
     * @param {String[]} args 
     * @returns 
     */
    run: async(client, message, args) => {
       if(!message.member.roles.cache.has(`964370138570842159`)) return message.reply({content: `:x: **You Are Not Allowed To Execute This Command**`})
        const logs = client.channels.cache.get("964370139225145487")
        let bot = message.mentions.members.first() || client.users.cache.get(args[0])
        if(!bot) return message.channel.send("**Please Mention a Bot!**");
        let data = client.bots.get(bot.id, "info");
        if(!data) return message.channel.send("**This bot is not registered!**");
        let path = data.toString().split("\n")[2];
        let server = data.toString().split("\n")[6].split(",")[0];
        console.log(server)
        let {
            servers,
            usernames,
            passwords
        } = client.config;
        let theserver = servers[server]

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
        const deletebot = await message.reply({content: `:coin: **Are You Sure You Want To Delete ALL Files And Hosting Informations Of ${bot}?**\n> This Step Can't Be Undo, And Is Equivalent To "Complete-Deletion" `, components: [Buttons_menu]})

        let collector = deletebot.createMessageComponentCollector({time: 60000 });

        collector.on("collect" , (b) => {
            if (b.user.id !== message.author.id)
            return b.reply({ content: `<:no:933239221836206131> **Only <@${message.author.id}> Allowed To React To This Message!**`, ephemeral: true })
            if (b.isButton()) {
                if (b.customId == "Delete-Bot") {
                    // Commands where it Deletes the bot!
                    if(!theserver) return message.reply(":x: Could not find the Server");
                    let theusername = usernames[server];
                    let thepassword = passwords[server];
                    const c = new Client();
                    try{
                        c.on("ready", () => {
                            c.exec(`rm -rf ${path}`, (err, stream) => {
                                if(err) return message.channel.send("**:x: Could Not Delete The Bot**");
                                stream.on("close", () => {
                                    c.end()
                                });
                            }
                            );
                            let data = client.bots.get(bot.id, "info");
                            let server = data.toString().split("\n")[6].split(",")[0]
                            let BOT_path = data.toString().split("\n")[2];
                            deletebot.edit({components: [Buttons_menu_Disabled]})
                            b.reply({content: `:thumbsup: **Removed the Bot-Folder of:** ${bot} | ${bot.user.tag} (\`${bot.id}\`)\n**Path:** \`${BOT_path}\`\n**Host:** \`${server}\``})
                            const embed = new MessageEmbed()
                            .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
                            .setThumbnail("https://cdn.discordapp.com/emojis/948085844181397574.webp?size=128&quality=lossless")
                            .setColor("RED")
                            .setFooter({text: `ID: ${message.author.id}`, iconURL: message.author.displayAvatarURL({dynamic: true})})
                            .setDescription(`👍 **Deleted the Bot-Folder of:** ${bot} | ${bot.user.tag} (\`${bot.id}\`)\n**Path:** \`${BOT_path}\`\n**Host:** \`${server}\``)
                            logs.send({embeds: [embed]})
                        }).connect({
                            host: theserver,
                            port: 22,
                            username: theusername,
                            password: thepassword
                        })
                    }catch(err){
                        console.log(err)
                        message.channel.send(`${err}`)
                    }
                }
                if (b.customId == "Dont-Delete") {
                    let data = client.bots.get(bot.id, "info");
             let server = data.toString().split("\n")[6].split(",")[0]
                 let BOT_path = data.toString().split("\n")[2];
                   deletebot.edit({components: [Buttons_menu_Disabled]})
                   b.reply({content: `**❌ Canceled The Deletion!**`})
                }
            }
        })}}