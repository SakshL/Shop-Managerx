//IMPORTING NPM PACKAGES
const emoji = require(`${process.cwd()}/emoji`);
const Discord = require('discord.js');
const fs = require('fs')
const ms = require("ms");
const moment = require("moment")
const Path = require("path");
const {
    MessageActionRow,
    MessageSelectMenu,
    MessageButton
} = require("discord.js");


const {
    Client
} = require('ssh2');

const scp = require("node-scp").Client;
//const { CreateScpConnection } = require("scp-promises").Client;

const mainconfig = require("../mainconfig");
const sourcebin = require('sourcebin');
const { Roles } = require("../settings.json");

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
} = require("./utilfunctions");
const translate = require("translatte");
const config = require("../config.json")
const {
    readdirSync
} = require("fs");
const { fileURLToPath } = require('url');


/**
 * STARTING THE MODULE WHILE EXPORTING THE CLIENT INTO IT
 * @param {*} client 
 */
module.exports = async(client) => {
        //Loading Commands
        try {
            let amount = 0;
            readdirSync("./modules/commands/").forEach((dir) => {
                const commands = readdirSync(`./modules/commands/${dir}/`).filter((file) => file.endsWith(".js"));
                for (let file of commands) {
                    let pull = require(`../modules/commands/${dir}/${file}`);
                    if (pull.name) {
                        client.commands.set(pull.name, pull);
                        amount++;
                    } else {
                        console.log(file, `error -> missing a help.name, or help.name is not a string.`.brightRed);
                        continue;
                    }
                    if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
                }
            });
            console.log(`${amount} Commands Loaded`.brightGreen);
        } catch (e) {
            console.log(String(e.stack).bgRed)
        }


        //Executing commands
        client.on("messageCreate", async(message) => {
            if (!message.guild || !message.channel || message.author.bot) return;
            const prefix = config.prefix;
            const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})`);
            if (!prefixRegex.test(message.content)) return;
            const [, mPrefix] = message.content.match(prefixRegex);
            const args = message.content.slice(mPrefix.length).trim().split(/ +/).filter(Boolean);
            const cmd = args.length > 0 ? args.shift().toLowerCase() : null;
            if (!cmd || cmd.length == 0) {
                if (mPrefix.includes(client.user.id)) {
                    return message.reply("My prefix is `,`");
                }
                return;
            }
            let command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (command) {
                if (onCoolDown(message, command)) {
                    return message.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                            .setColor("RED")
                            .setFooter(`${message.guild.name}`, `${message.guild.iconURL({dynamic: true})}`)
                            .setTitle(`❌ Please wait \`${onCoolDown(message, command)}\` more seconds before reusing \`${command.name}\` again.`)
                        ]
                    });
                }
                try {
                    command.run(client, message, args, prefix);
                } catch (error) {
                    console.warn(error)
                }
            }
        })


        client.setups.ensure("todelete", { tickets: [] })

        /**
         * COMMANDS SYSTEM
         */
        client.on('messageCreate', async message => {
                    if (!message.guild || message.author.bot || message.guild.id != `${mainconfig.ServerID}`) return;
                    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
                    if (!message.content.startsWith(client.config.prefix)) return
                    const cmd = args.shift().toLowerCase();

                    /**
                     * SETUP TICKET / ORDER / FEATURE SYSTEM
                     */

                    if (cmd == "nodestats") {
                        const online = `<:Online:964410240881811476>`;
                        const offline = `<:error:934152965856591953>`;
                        const embed = new Discord.MessageEmbed()
                            .setColor(client.config.color)
                            .setAuthor("Nexuss | Nodestats", message.guild.iconURL({ dynamic: true }), "https://status.Nexuss.me/")
                            client.allServers.stats.forEach(stat => {
                                embed.addField(`${stat.ram != 1 ? online : offline} Server **\`${stat.key}\`**`, `> Ram: \`${(stat.ram * 100).toFixed(0)}% of ${stat.totalram.split(".")[0]} ${stat.totalram.split(" ")[1]}\`\n> Hosting Bots: \`${stat.bots}\`\n> Cores: \`${stat.cores}\`\n> Stor: \`${Math.floor(stat.storage / stat.totalstorage * 100).toFixed(0)}% of ${formatBytes(stat.totalstorage, 0)}\``, true)
                                if(stat?.key == "27") {
                                    embed.addFields([
                                        {name: `${stat.ram != 1 ? online : offline} Server **\`b7\`**`, value: `> Ram: \`${(stat.ram * 100 + Math.floor(Math.random() * 5)).toFixed(0)}% of ${stat.totalram.split(".")[0]} ${stat.totalram.split(" ")[1]}\`\n> Hosting Bots: \`${stat.bots}\`\n> Cores: \`${stat.cores}\`\n> Stor: \`${Math.floor(stat.storage / stat.totalstorage * 100).toFixed(0)}% of ${formatBytes(stat.totalstorage, 0)}\``, inline: true},
                                        {name: `${stat.ram != 1 ? online : offline} Server **\`1b7\`**`, value: `> Ram: \`${(stat.ram * 100 + Math.floor(Math.random() * 5)).toFixed(0)}% of ${stat.totalram.split(".")[0]} ${stat.totalram.split(" ")[1]}\`\n> Hosting Bots: \`${stat.bots}\`\n> Cores: \`${stat.cores}\`\n> Stor: \`${Math.floor(stat.storage / stat.totalstorage * 100).toFixed(0)}% of ${formatBytes(stat.totalstorage, 0)}\``, inline: true},
                                        {name: `${stat.ram != 1 ? online : offline} Server **\`2b7\`**`, value: `> Ram: \`${(stat.ram * 100 + Math.floor(Math.random() * 5)).toFixed(0)}% of ${stat.totalram.split(".")[0]} ${stat.totalram.split(" ")[1]}\`\n> Hosting Bots: \`${stat.bots}\`\n> Cores: \`${stat.cores}\`\n> Stor: \`${Math.floor(stat.storage / stat.totalstorage * 100).toFixed(0)}% of ${formatBytes(stat.totalstorage, 0)}\``, inline: true},
                                        {name: `${stat.ram != 1 ? online : offline} Server **\`ffb7\`**`, value: `> Ram: \`${(stat.ram * 100 + Math.floor(Math.random() * 5)).toFixed(0)}% of ${stat.totalram.split(".")[0]} ${stat.totalram.split(" ")[1]}\`\n> Hosting Bots: \`${stat.bots}\`\n> Cores: \`${stat.cores}\`\n> Stor: \`${Math.floor(stat.storage / stat.totalstorage * 100).toFixed(0)}% of ${formatBytes(stat.totalstorage, 0)}\``, inline: true},
                                    ])
                                }
                            })
                        embed.addField(`**Total Stats:**`, `\`\`\`yml\nCores: ${client.allServers.stats.reduce((a, b) => a + b.cores, 0)}\nRam: ${formatBytes(client.allServers.stats.reduce((a, b) => a + b.rawram, 0))}\nStor: ${Math.floor(client.allServers.stats.reduce((a, b) => a + b.storage, 0) / client.allServers.stats.reduce((a, b) => a + b.totalstorage, 0) * 100)}% of ${formatBytes(client.allServers.stats.reduce((a, b) => a + b.totalstorage, 0))}\n\`\`\``)

                        message.channel.send({
                            embeds: [
                                embed
                            ]
                        });
                    } else if (cmd == "setupticket") {
                        if (message.member.permissions.has("ADMINISTRATOR")) {
                            let embed = new Discord.MessageEmbed()
                            .setTitle("Nexuss | Ticket Support")
                            .setDescription(`This is the official [Nexuss](https://Nexuss.me) ticket support.\n\nOptionally, you can contact us by email **support@Nexuss.me**`)
                            .setColor(client.config.color)
                            let menuoptions = require("../settings.json").ticketsystem;
                            //define the selection
                            let Selection = new MessageSelectMenu()
                                .setCustomId('TicketSupportSelection')
                                .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
                                .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
                                .setPlaceholder('Choose your concern') //message in the content placeholder
                                .addOptions(menuoptions.map(option => {
                                    let Obj = {}
                                    Obj.label = option.label ? option.label.substring(0, 25) : option.value.substring(0, 25)
                                    Obj.value = option.value.substring(0, 25)
                                    Obj.description = option.description.substring(0, 50)
                                    if (option.emoji) Obj.emoji = option.emoji;
                                    return Obj;
                                }))

        
                            let row2 = new MessageActionRow().addComponents([Selection])
                            message.channel.send({
                                embeds: [embed],
                                components: [row2]
                            });
                        } else {
                            message.reply("no Valid Permissions")
                        }
                    } else if (cmd == "setupfeatures") {
                        if (message.member.permissions.has("ADMINISTRATOR")) {
                            let embed = new Discord.MessageEmbed()
                            .setTitle("Nexuss | Features")
                            .setDescription(`If you want to see the features of the bots, just click on the drop-down menu down below.\nYou'll be also able to see the prices, which are not negotiable.\n\nFor more information about the features/pricing, feel free to contact our marketing team at **marketing@Nexuss.me**`)
                            .setColor(client.config.color)
                            let menuoptions = require("../settings.json").ordersystem;
                            //define the selection
                            let Selection = new MessageSelectMenu()
                                .setCustomId('ViewTheFeatures')
                                .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
                                .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
                                .setPlaceholder('Click me to view the Features') //message in the content placeholder
                                .addOptions(menuoptions.map(option => {
                                    let Obj = {}
                                    Obj.label = option.label ? option.label.substring(0, 25) : option.value.substring(0, 25)
                                    Obj.value = option.value.substring(0, 25)
                                    Obj.description = option.description.substring(0, 50)
                                    if (option.emoji) Obj.emoji = option.emoji;
                                    return Obj;
                                }))
                            let row = new MessageActionRow().addComponents([Selection])
                            message.channel.send({
                                embeds: [embed],
                                components: [row]
                            });
                        } else {
                            message.reply("no Valid Permissions")
                        }
                        //
                    } else if (cmd === "setuporder") {
                        //eval let channel = message.guild.channels.cache.get("840354600463761468");
                        if (message.member.permissions.has("ADMINISTRATOR")) {
                            let id = args[0],
                                themessage_ = false;
                            if (id) {
                                themessage_ = await message.channel.messages.fetch(id).catch(() => {}) || false;
                            }
                            let embed = new Discord.MessageEmbed()
                            .setTitle("Nexuss | Order")
                            .setDescription(`
<:arrow:964989830272532501> **Please take a Look at our [prices](https://discord.com/channels/964370138356916295/964370139808141365/944276114988220477) as well as at our [payment options](https://discord.com/channels/964370138356916295/964370139808141365/944952969961553970)**

**Bots you can order:**
> - **System Bot** 🤖
> 
> - **MusicBot** 🎵
> 
> - **Mod Mail Bot** 📨
> 
> - **Waitingroom Bot** 🕐

<:arrow:964989830272532501>  ***To open a Order-Ticket click on the Selection down below!***`)
.setDescription(`
If you want to buy a Bot from [Nexuss](https://Nexuss.me) and you checked the [prices](https://discord.com/channels/964370138356916295/964370139808141365/944276114988220477) first, chose your wished bot in the drop-down menu down below.
\n***Available Bots are:***\n
> - **System Bot** 🤖
> 
> - **MusicBot** 🎵
> 
> - **Mod Mail Bot** 📨
> 
> - **Waitingroom Bot** 🕐
\nFor further questions about our pricing, please contact our marketing team at **marketing@Nexuss.me**`)
                            .setColor(client.config.color)
                        let menuoptions = require("../settings.json").ordersystem;
                            //define the selection
                            let Selection = new MessageSelectMenu()
                                .setCustomId('OrderSystemSelection')
                                .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
                                .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
                                .setPlaceholder('Choose Bot') //message in the content placeholder
                                .addOptions(menuoptions.map(option => {
                                    let Obj = {}
                                    Obj.label = option.label ? option.label.substring(0, 25) : option.value.substring(0, 25)
                                    Obj.value = option.value.substring(0, 25)
                                    Obj.description = option.description.substring(0, 50)
                                    if (option.emoji) Obj.emoji = option.emoji;
                                    return Obj;
                                }))
                            let PingButton = new MessageButton().setStyle("PRIMARY")
                                .setEmoji(`<:ping:964680781500936234>`)
                                .setLabel("Ping Me BEFORE!")
                                .setCustomId("PINGMEBEFORE");
                            let CheckPrices = new MessageButton().setStyle('LINK')
                                .setURL('https://discord.com/channels/964370138356916295/964370139808141365/944276114988220477')
                                .setLabel('Check the Prices')
                                .setEmoji(`<a:Money_Price:935490603909799957>`);
                            let row1 = new MessageActionRow().addComponents([PingButton, CheckPrices])
                            let row2 = new MessageActionRow().addComponents([Selection])
                            if (id && themessage_) {
                                return themessage_.edit({
                                    embeds: [embed],
                                    components: [row1, row2]
                                });
                            }
                            message.channel.send({
                                embeds: [embed],
                                components: [row1, row2]
                            });
                        } else {
                            message.reply("no Valid Permissions")
                        }
                    }


                    /**
                     * STAFF RANKING SYSTEM
                     */
                    else if (cmd === "lb" || cmd == "leaderboard") {
                        if (message.member.roles.highest.rawPosition >= message.guild.roles.cache.get("964370138549854250").rawPosition) {
                            //got only the ranking points from THIS GUILD
                            let ids = client.staffrank.keyArray();
                            let filtered = [];
                            let days = Number(args[0]);
                            if (isNaN(days)) days = 30;
                            if (days <= 0) days = 30;
                            for (const id of ids) {
                                let data = client.staffrank.get(id)
                                if (!data) {
                                    continue;
                                }

                                function getArraySum(a) {
                                    var total = 0;
                                    for (var i in a) {
                                        total += a[i];
                                    }
                                    return total;
                                }
                                let Obj = {};
                                Obj.id = id;
                                Obj.createdbots = data.createdbots.filter(d => (days * 86400000) - (Date.now() - d) >= 0).length;
                                Obj.messages = data.messages.filter(d => (days * 86400000) - (Date.now() - d) >= 0).length;
                                Obj.tickets = data.tickets.filter(d => (days * 86400000) - (Date.now() - d) >= 0).length;
                                Obj.actualtickets = getArraySum(data.actualtickets.map(d => d.messages.filter(d => (days * 86400000) - (Date.now() - d) >= 0).length));
                                filtered.push(Obj)
                            }
                            let topsize = Math.floor(filtered.length / 2);
                            if (topsize > 10) topsize = 10;

                            let messages = filtered.sort((a, b) => b.messages - a.messages);
                            let embed1 = new Discord.MessageEmbed()
                                .setColor(client.config.color)
                                .setAuthor(message.guild.name, message.guild.iconURL({
                                    dynamic: true
                                }))
                                .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/speech-balloon_1f4ac.png")
                                .setTitle("💬 Messages Sent")
                                .addField(`**Top ${topsize}:**`, `\`\`\`${messages.slice(0, topsize).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.messages).join("\n")}\`\`\``, true)
                                .addField(`**Last ${topsize}:**`, `\`\`\`${messages.slice(Math.max(messages.length - topsize, 0)).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.messages).join("\n")}\`\`\``, true)

                            let tickets = filtered.sort((a, b) => b.tickets - a.tickets);
                            let embed2 = new Discord.MessageEmbed()
                                .setColor("#57F287")
                                .setTitle("🔒 Tickets Closed")
                                .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/locked_1f512.png")
                                .addField(`**Top ${topsize}:**`, `\`\`\`${tickets.slice(0, topsize).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.tickets).join("\n")}\`\`\``, true)
                                .addField(`**Last ${topsize}:**`, `\`\`\`${tickets.slice(Math.max(tickets.length - topsize, 0)).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.tickets).join("\n")}\`\`\``, true)

                            let createdBots = filtered.sort((a, b) => b.createdbots - a.createdbots);
                            let embed3 = new Discord.MessageEmbed()
                                .setColor("BLURPLE")
                                .setTitle("🤖 Created Bots")
                                .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/robot_1f916.png")
                                .addField(`**Top ${topsize}:**`, `\`\`\`${createdBots.slice(0, topsize).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.createdbots).join("\n")}\`\`\``, true)
                                .addField(`**Last ${topsize}:**`, `\`\`\`${createdBots.slice(Math.max(createdBots.length - topsize, 0)).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.createdbots).join("\n")}\`\`\``, true)

                            let actualtickets = filtered.sort((a, b) => b.actualtickets - a.actualtickets);
                            let embed4 = new Discord.MessageEmbed()
                                .setColor("RED")
                                .setFooter(message.guild.name + ` Staff Rank of the last ${duration(ms(days + "d")).join(", ")}`, message.guild.iconURL({
                                    dynamic: true
                                }))
                                .setTitle("👻 Messages in the Tickets")
                                .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/ghost_1f47b.png")
                                .addField(`**Top ${topsize}:**`, `\`\`\`${actualtickets.slice(0, topsize).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.actualtickets).join("\n")}\`\`\``, true)
                                .addField(`**Last ${topsize}:**`, `\`\`\`${actualtickets.slice(Math.max(actualtickets.length - topsize, 0)).map(d => String(message.guild.members.cache.get(d.id) ? message.guild.members.cache.get(d.id).user.username : d.id) + " | " + d.actualtickets).join("\n")}\`\`\``, true)
                            message.reply({
                                        content: `Staff Rank Leaderboard of: **${message.guild.name}**\n>  Staff Rank of the last ${duration(ms(days + "d")).map(i => `\`${i}\``).join(", ")}\n> \`,leaderboard [DAYSAMOUNT]\` to change the amount of Days to show!`,
                    embeds: [embed1, embed2, embed3, embed4]
                })
            } else {
                message.reply("❌ **You are not allowed to execute this Command!** You need to be a part of the STAFF TEAM!")
            }
        } else if (cmd === "rank") {
            if (message.member.roles.highest.rawPosition >= message.guild.roles.cache.get("964370138549854250").rawPosition) {
                let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
                let user = member.user;
                client.staffrank.ensure(user.id, {
                    createdbots: [ /* Date.now() */ ], //show how many bots he creates per command per X Time
                    messages: [ /* Date.now() */ ], //Shows how many general messages he sent
                    tickets: [ /* Date.now() */ ], //shows how many messages he sent in a ticket
                    actualtickets: [ /* { id: "channelid", messages: []}*/ ] //Each managed ticket where they send a message
                });

                function getArraySum(a) {
                    var total = 0;
                    for (var i in a) {
                        total += a[i];
                    }
                    return total;
                }
                let data = client.staffrank.get(user.id)
                let embed1 = new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(user.username, user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/speech-balloon_1f4ac.png")
                    .setTitle("💬 Messages Sent")
                    .addField(`**All Time:**`, `\`\`\`${data.messages.length}\`\`\``, true)
                    .addField(`**Last 24 Hours:**`, `\`\`\`${data.messages.filter(d => (1 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 5 Days:**`, `\`\`\`${data.messages.filter(d => (5 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)

                    .addField(`**Last 7 Days:**`, `\`\`\`${data.messages.filter(d => (7 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 14 Days:**`, `\`\`\`${data.messages.filter(d => (14 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 30 Days:**`, `\`\`\`${data.messages.filter(d => (30 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                let embed2 = new Discord.MessageEmbed()
                    .setColor("#ED4245")
                    .setTitle("🔒 Tickets Closed")
                    .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/locked_1f512.png")
                    .addField(`**All Time:**`, `\`\`\`${data.tickets.length}\`\`\``, true)
                    .addField(`**Last 24 Hours:**`, `\`\`\`${data.tickets.filter(d => (1 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 5 Days:**`, `\`\`\`${data.tickets.filter(d => (5 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)

                    .addField(`**Last 7 Days:**`, `\`\`\`${data.tickets.filter(d => (7 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 14 Days:**`, `\`\`\`${data.tickets.filter(d => (14 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 30 Days:**`, `\`\`\`${data.tickets.filter(d => (30 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                let embed3 = new Discord.MessageEmbed()
                    .setColor("#FEE75C")
                    .setTitle("🤖 Created Bots")
                    .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/robot_1f916.png")
                    .addField(`**All Time:**`, `\`\`\`${data.createdbots.length}\`\`\``, true)
                    .addField(`**Last 24 Hours:**`, `\`\`\`${data.createdbots.filter(d => (1 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 5 Days:**`, `\`\`\`${data.createdbots.filter(d => (5 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)

                    .addField(`**Last 7 Days:**`, `\`\`\`${data.createdbots.filter(d => (7 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 14 Days:**`, `\`\`\`${data.createdbots.filter(d => (14 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                    .addField(`**Last 30 Days:**`, `\`\`\`${data.createdbots.filter(d => (30 * 86400000) - (Date.now() - d) >= 0).length}\`\`\``, true)
                let embed4 = new Discord.MessageEmbed()
                    .setColor("#57F287")
                    .setFooter(user.username, user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setTitle("👻 Messages in the Tickets")
                    .setThumbnail("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/ghost_1f47b.png")
                    .addField(`**All Time:**`, `\`\`\`${getArraySum(data.actualtickets.map(d => d.messages.length))}\`\`\``, true)
                    .addField(`**Last 24 Hours:**`, `\`\`\`${getArraySum(data.actualtickets.map(d => d.messages.filter(d => (1 * 86400000) - (Date.now() - d) >= 0).length))}\`\`\``, true)
                    .addField(`**Last 5 Days:**`, `\`\`\`${getArraySum(data.actualtickets.map(d => d.messages.filter(d => (5 * 86400000) - (Date.now() - d) >= 0).length))}\`\`\``, true)

                    .addField(`**Last 7 Days:**`, `\`\`\`${getArraySum(data.actualtickets.map(d => d.messages.filter(d => (7 * 86400000) - (Date.now() - d) >= 0).length))}\`\`\``, true)
                    .addField(`**Last 14 Days:**`, `\`\`\`${getArraySum(data.actualtickets.map(d => d.messages.filter(d => (14 * 86400000) - (Date.now() - d) >= 0).length))}\`\`\``, true)
                    .addField(`**Last 30 Days:**`, `\`\`\`${getArraySum(data.actualtickets.map(d => d.messages.filter(d => (30 * 86400000) - (Date.now() - d) >= 0).length))}\`\`\``, true)
                message.reply({
                    content: `Staff Rank of: **${user.tag}**`,
                    embeds: [embed1, embed2, embed3, embed4]
                })
            } else {
                message.reply("❌ **You are not allowed to execute this Command!** You need to be a part in the STAFF TEAM!")
            }
        } 
        

        else if (cmd === "say") {
            if (message.member.permissions.has("ADMINISTRATOR")) {
                message.channel.send(args.join(" "));
                message.delete()
            } else {
                message.reply("no Valid Permissions")
            }
        } else if (cmd === "cancelcreation"){
            if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.has(Roles.BotCreatorRoleId) && !message.member.roles.cache.has(Roles.OwnerRoleId) && !message.member.roles.cache.has(Roles.ChiefBotCreatorRoleId)) return message.reply("**❌ You are not allowed to execute this cmd**");
            if(!client.createingbotmap.has("Creating")) return message.reply(`> ❌ **Nobody is creating a Bot atm**`);
            //if(Date.now() - client.createingbotmap.get("CreatingTime") < 2*60*1000) return message.reply(`> ❌ **You can only cancel a Bot-Creation, if it's taking longer then 30 Seconds!**`)
            client.createingbotmap.delete("Creating")
            client.createingbotmap.delete("CreatingTime")
            message.reply("**Success!**")
        } else if (cmd === "createbot") {
            if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.has(Roles.BotCreatorRoleId) && !message.member.roles.cache.has(Roles.OwnerRoleId) && !message.member.roles.cache.has(Roles.ChiefBotCreatorRoleId)) return message.reply("**❌ You are not allowed to execute this cmd**");
            if(client.createingbotmap.has("Creating")) return message.reply(`> **Im Creating for ${duration((Date.now() - client.createingbotmap.get("CreatingTime"))).map(i => `\`${i}\``).join(", ")} the Bot in:** <#${client.createingbotmap.get("Creating")}>\n> **Try again later!**`)
            if(client.getStats) return message.reply(":x: I just started - I still need to get the least used node! Please wait.");
            //COMMAND HANDLER FRIENDLY, just a REALLY BASIC example
            const localhost = args[0] && args[0] == "local" ? true : false;
            let cmduser = message.author;
            let menuoptions = require("../settings.json").createbot
            //define the selection
            let Selection = new MessageSelectMenu()
                .setCustomId('MenuSelection')
                .setMaxValues(1) //OPTIONAL, this is how many values you can have at each selection
                .setMinValues(1) //OPTIONAL , this is how many values you need to have at each selection
                .setPlaceholder('Click me to select which Bot you wanna make!') //message in the content placeholder
                .addOptions(menuoptions.map(option => {
                    let Obj = {}
                    Obj.label = option.label ? option.label.substring(0, 25) : option.value.substring(0, 25)
                    Obj.value = option.value.substring(0, 25)
                    Obj.description = option.description.substring(0, 50)
                    if (option.emoji) Obj.emoji = option.emoji;
                    return Obj;
                }))
            //define the embed
            let MenuEmbed = new Discord.MessageEmbed()
                .setColor("#57F287")
                .setAuthor("Bot Creation - " + message.author.tag, message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription("***Select what type of Bot you want to create in the Selection down below!***")
            //send the menu message
            let menumessage = await message.channel.send({
                embeds: [MenuEmbed],
                components: [new MessageActionRow().addComponents([Selection])]
            })
            //function to handle the menuselection
            async function menuselection(interaction) {
                let menuoptiondata = menuoptions.find(v => v.value == interaction.values[0])
                let BotDir = menuoptiondata.bottype;
                let errrored = false;
                try {
                    interaction.deferUpdate()
                        .catch(console.error);
                } catch {}
                let BotType = "Default";
                if (BotDir === "SYSTEMBOTS") {
                    BotType = "System Bot";
                    if (!message.channel.parent || message.channel.parentId != `${mainconfig.ApplyTickets.PartnerApply}`) {
                        errrored = true;
                        interaction.message.edit({
                            components: [],
                            embeds: [new Discord.MessageEmbed().setAuthor("Bot Creation - " + message.author.tag, message.author.displayAvatarURL({
                                dynamic: true
                            })).setColor("RED").setTitle("**❌ You are not allowed to create this Bot in here**")]
                        })
                    }
                }

                if (BotDir === "MusicBots") {
                    BotType = "Music Bot";
                    if (!message.channel.parent || message.channel.parentId != `${mainconfig.ApplyTickets.PartnerApply}`) {
                        errrored = true;
                        interaction.message.edit({
                            components: [],
                            embeds: [new Discord.MessageEmbed().setAuthor("Bot Creation - " + message.author.tag, message.author.displayAvatarURL({
                                dynamic: true
                            })).setColor("RED").setTitle("**❌ You are not allowed to create this Bot in here**")]
                        })
                    }
                }
                if (errrored) return;
                client.createingbotmap.set("CreatingTime", Date.now());
                client.createingbotmap.set("Creating", message.channel.id);
                interaction.message.edit({
                    components: [],
                    embeds: [new Discord.MessageEmbed().setAuthor("Bot Creation - " + message.author.tag, message.author.displayAvatarURL({
                        dynamic: true
                    })).setColor(client.config.color).setTitle(`__Now Starting the Bot Creation Process for a **\`${menuoptiondata.value}\`** in your **DIRECT MESSAGES**__\n> *If not then retry and enable your DMS*`)]
                });
                try {
                    message.delete();
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                }
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////


                var filenum, Files = [];
                async function ThroughDirectory(Directory) {
                    fs.readdirSync(Directory).forEach(File => {
                        const Absolute = Path.join(Directory, File);
                        if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
                        else return Files.push(Absolute);
                    });
                }
                ThroughDirectory(`${mainconfig.Directory.MusicBot}`);
                filenum = Files.length;
                try {
                    const ch = message.author;
                    async function validate(result) {
                        return new Promise(async (res, rej) => {
                            let button_close = new MessageButton().setStyle('DANGER').setCustomId('validate_no').setLabel('No, edit!').setEmoji("❌")
                            let button_delete = new MessageButton().setStyle('SUCCESS').setCustomId('validate_yes').setLabel("Yes, continue!").setEmoji(`<a:check:964989203656097803>`)
                            let qu_1 = await ch.send({
                                components: [new MessageActionRow().addComponents([button_close, button_delete])],
                                embeds: [new Discord.MessageEmbed().setColor("#ED4245").setTitle("Are you sure you want to use that as the Answer for the Parameter-Question?")
                                    .setDescription(`**Your Answer:**\n>>> \`\`\`${result.substr(0, 2000)}\`\`\``)
                                    .setFooter("Please react within 60 Seconds", ch.displayAvatarURL({
                                        dynamic: true
                                    }))
                                ]
                            }).catch((e) => {
                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                            })


                            //create a collector for the thinggy
                            const collector = qu_1.createMessageComponentCollector({
                                filter: button => button.isButton(),
                                time: 60e3
                            }); //collector for 5 seconds
                            //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
                            collector.on('collect', async b => {
                                if (b.customId == "validate_yes") {
                                    try {
                                        qu_1.edit({
                                            content: `Validated!`,
                                            components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                            embeds: [qu_1.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    await b.deferUpdate();
                                    return res(true)
                                } else if (b.customId == "validate_no") {
                                    try {
                                        qu_1.edit({
                                            content: `CANCELLED!`,
                                            components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                            embeds: [qu_1.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    await b.deferUpdate();
                                    return res(false)
                                }

                            });
                            let edited = false;
                            collector.on('end', collected => {
                                edited = true;
                                try {
                                    qu_1.edit({
                                        content: `Time has ended!`,
                                        components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                        embeds: [qu_1.embeds[0]]
                                    }).catch(() => {});
                                } catch (e) {
                                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                                return rej(false);
                            });
                            setTimeout(() => {
                                if (!edited) {
                                    try {
                                        qu_1.edit({
                                            content: `Time has ended!`,
                                            components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                            embeds: [qu_1.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    return rej(false);
                                }
                            }, 60e3 + 150)
                        })

                    }
                    async function ask_question(Question) {
                        return new Promise(async (res, rej) => {
                            let index = Questions.findIndex(v => v.toLowerCase() == Question.toLowerCase())
                            let sendData = {
                                content: `<@${ch.id}>`,
                                embeds: [new Discord.MessageEmbed().setColor("#6861fe").setTitle(`**Here is my ${index + 1}. Parameter-Question!**`)
                                    .setDescription(`**\`\`\`bash\n${Question}\`\`\`**\n\n> *You have 3 Minutes to answer this Parameter-Question, if you don't then your Bot Creation will get cancelled!*`)
                                    .setFooter(`Please answer it carefully! | Question: ${index + 1} / ${Questions.length}`, ch.displayAvatarURL({
                                        dynamic: true
                                    }))
                                ]
                            };
                            if(Question.includes("STATUSTYPE")){
                                sendData.components = [new MessageActionRow().addComponents([
                                    new MessageSelectMenu()
                                    .setPlaceholder('Select Status Type').setCustomId('MenuSelection') 
                                    .setMaxValues(1).setMinValues(1)
                                    .addOptions([
                                        {
                                            label: "PLAYING",
                                            value: `PLAYING`,
                                            emoji: '🏃',
                                            description: `Playing ${answers[answers.length - 1]}`.substr(0, 50),
                                        },
                                        {
                                            label: "WATCHING",
                                            value: `WATCHING`,
                                            emoji: '📺',
                                            description: `Watching ${answers[answers.length - 1]}`.substr(0, 50),
                                        },
                                        {
                                            label: "LISTENING",
                                            value: `LISTENING`,
                                            emoji: '🎧',
                                            description: `Listening to ${answers[answers.length - 1]}`.substr(0, 50),
                                        },
                                        {
                                            label: "STREAMING",
                                            value: `STREAMING`,
                                            emoji: '💻',
                                            description: `Streaming ${answers[answers.length - 1]}`.substr(0, 50),
                                        },
                                        {
                                            label: "COMPETING",
                                            value: `COMPETING`,
                                            emoji: '⚔️',
                                            description: `Competing in ${answers[answers.length - 1]}`.substr(0, 50),
                                        },
                                    ])
                                ])];
                            }
                            let qu__ = await ch.send(sendData).catch((e) => {
                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                            })
                            if (!qu__) return rej("NO MESSAGE");
                            if(sendData.components && sendData.components.length > 0){
                                let collected1 = await qu__.channel.awaitMessageComponent({
                                    filter: m => m.user.id == ch.id,
                                    max: 1,
                                    time: 180e3,
                                    errors: ["time"]
                                })
                                if (!collected1) {
                                    try {
                                        ch.send("**❌ I've stopped the Bot Creation, because you didn't answer within 3 Minutes!**")
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    return rej(false);
                                }
                                try{
                                    collected1.deferUpdate();
                                }catch (e){
                                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                                return res(collected1.values[0]);
                            } else {
                                let collected1 = await qu__.channel.awaitMessages({
                                    filter: m => m.author.id == ch.id,
                                    max: 1,
                                    time: 180e3,
                                    errors: ["time"]
                                })
                                if (!collected1) {
                                    try {
                                        ch.send("**❌ I've stopped the Bot Creation, because u didn't answer within 3 Minutes!**")
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    return rej(false);
                                }
                                if (message.attachments.size > 1) {
                                    if (message.attachments.first().url.toLowerCase().endsWith("png")) {
                                        return res(message.attachments.first().url)
                                    }
                                    if (message.attachments.first().url.toLowerCase().endsWith("jpg")) {
                                        return res(message.attachments.first().url)
                                    }
                                    if (message.attachments.first().url.toLowerCase().endsWith("gif")) {
                                        return res(message.attachments.first().url)
                                    }
                                }
                                return res(collected1.first().content);
                            }
                        })
                    }
                    let answers = [];
                    let Questions = [
                        `What should be the PREFIX? | Its For the ${menuoptiondata.value}!\nExample: "!"`,
                        `What should be the STATUS? | Its For the ${menuoptiondata.value}!\nExample: "discord.gg/Nexuss"`,
                        `What should be the STATUSTYPE? | Its For the before Status, example: "PLAYING" or "LISTENING TO" ...`,
                        `What should be the TOKEN? | Its For the ${menuoptiondata.value}!\nExample: "NzQ4MDg3OTA3NTE2MTUzODg5.X0YVJw.Shmvprj9eW_yfApntj7QUM0sZ_Y"`,
                        `Who is the OWNER? | Its For the ${menuoptiondata.value}!\nExample: "921430546813419550"`,
                        `What should be the AVATAR? | Its For the ${menuoptiondata.value}!\nExample: "https://cdn.discordapp.com/attachments/936985190016897055/938497637060079706/LogoNexuss.png"`,
                        `What should be the FOOTER TEXT? | Its For the ${menuoptiondata.value}!\nExample: "Nexuss"`,
                        `What should be the HEX-COLOR? | Its For the ${menuoptiondata.value}!\nExample: "#6861fe"`,
                        `What should be the FILE-NAME? | Its For the ${menuoptiondata.value}!\nExample: "BOT_NAME" (replace spaces with "_")`,
                        `What is the BOT ID? | Its For the ${menuoptiondata.value}!\nExample: "938176229918531604"`,
                    ];

                    for (const Question of Questions) {
                        await ask_question(Question).then(async result => {
                            await validate(result).then(async res => {
                                if (res) {
                                    answers.push(result);
                                } else {
                                    await ask_question(Question).then(async result => {
                                        answers.push(result);
                                    }).catch((e) => {
                                        client.createingbotmap.delete("Creating")
                                        client.createingbotmap.delete("CreatingTime")
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        return;
                                    })
                                }
                            }).catch((e) => {
                                client.createingbotmap.delete("Creating")
                                client.createingbotmap.delete("CreatingTime")
                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                return;
                            })
                        }).catch((e) => {
                            client.createingbotmap.delete("Creating")
                            client.createingbotmap.delete("CreatingTime")
                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                            return;
                        })
                    }

                    let cancel = false;
                    var globerror = false;
                    await areyousure().then(async res => {
                        if (!res) {
                            client.createingbotmap.delete("Creating")
                            client.createingbotmap.delete("CreatingTime")
                            cancel = true;
                            return ch.send("CANCELLED!");
                        }
                    }).catch(e => {
                        client.createingbotmap.delete("Creating")
                        client.createingbotmap.delete("CreatingTime")
                        cancel = true;
                        return ch.send(`${e.message ? e.message : e}`.substr(0, 1900), {
                            code: "js"
                        });
                    })
                    async function areyousure(result) {
                        return new Promise(async (res, rej) => {
                            let button_close = new MessageButton().setStyle('DANGER').setCustomId('validate_no').setLabel('No, cancel!').setEmoji("❌")
                            let button_delete = new MessageButton().setStyle('SUCCESS').setCustomId('validate_yes').setLabel("Yes, create!").setEmoji(`<a:check:964989203656097803>`)
                            let qu_1 = await ch.send({
                                components: [new MessageActionRow().addComponents([button_close, button_delete])],
                                embeds: [new Discord.MessageEmbed().setColor("#ED4245").setTitle("Are you sure you want to use those Settings for the Bot?")
                                    .addField("**Prefix:**", `\`\`\`${answers[0]}\`\`\``)
                                    .addField("**Status:**", `\`\`\`${answers[1]}\`\`\``)
                                    .addField("**Status Type:**", `\`\`\`${answers[2]}\`\`\``)
                                    .addField("**Token:**", `\`\`\`${answers[3]}\`\`\``)
                                    .addField("**Owner ID:**", `\`\`\`${answers[4]}\`\`\``)
                                    .addField("**Avatar:**", `\`\`\`${answers[5]}\`\`\``)
                                    .addField("**Footertext:**", `\`\`\`${answers[6]}\`\`\``)
                                    .addField("**Color:**", `\`\`\`${answers[7]}\`\`\``)
                                    .addField("**Filename:**", `\`\`\`${answers[8]}\`\`\``)
                                    .addField("**Bot ID:**", `\`\`\`${answers[9]}\`\`\``)
                                    .setFooter("Please react within 60 Seconds", ch.displayAvatarURL({
                                        dynamic: true
                                    }))
                                ]
                            }).catch((e) => {
                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                            })


                            //create a collector for the thinggy
                            const collector = qu_1.createMessageComponentCollector({
                                filter: button => button.isButton(),
                                time: 60e3
                            }); //collector for 5 seconds
                            //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
                            collector.on('collect', async b => {
                                if (b.customId == "validate_yes") {
                                    try {
                                        qu_1.edit({
                                            content: `Validated!`,
                                            components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                            embeds: [qu_1.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    await b.deferUpdate();
                                    return res(true)
                                } else if (b.customId == "validate_no") {
                                    try {
                                        qu_1.edit({
                                            content: `CANCELLED!`,
                                            components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                            embeds: [qu_1.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    await b.deferUpdate();
                                    return res(false)
                                }

                            });
                            let edited = false;
                            collector.on('end', collected => {
                                edited = true;
                                try {
                                    qu_1.edit({
                                        content: `Time has ended!`,
                                        components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                        embeds: [qu_1.embeds[0]]
                                    }).catch(() => {});
                                } catch (e) {
                                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                                return res(false);
                            });
                            setTimeout(() => {
                                if (!edited) {
                                    try {
                                        qu_1.edit({
                                            content: `Time has ended!`,
                                            components: [new MessageActionRow().addComponents([button_close.setDisabled(true), button_delete.setDisabled(true)])],
                                            embeds: [qu_1.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    return res(false);
                                }
                            }, 60e3 + 150)
                        })

                    }
                    if (cancel) return;
    
                    /**
                     * CREATE THE REMOTE HOST CONNECTION DATA
                     */
                    const serverId = client.allServers.least ? client.allServers.least : client.allServers.current;
                    console.log(serverId)
                    console.log(`Host: ${client.config.servers["6"]}`)
                    console.log(`Username: ${client.config.usernames["6"]}`)
                    console.log(`Password: ${client.config.passwords["6"]}`)
                    const remote_server = {
                        host: client.config.servers["6"], 
                        port: 22, 
                        username: client.config.usernames["6"], 
                        password: client.config.passwords["6"], 
                    };


                    /**
                     * CREATE THE CUSTOPM VARIABLES FOR THE BOT AND CHANGE THEM IF NEEDED
                     */
                    let prefix = answers[0];
                    let status = answers[1];
                    let statustype = answers[2];
                    let token = answers[3];
                    let owner = answers[4];
                    let avatar = answers[5];
                    let footertext = answers[6];
                    let color = answers[7];
                    let filenama = answers[8];
                    let botid = answers[9];
                    let statusurl = false;
                    filenama = filenama.split(" ").join("_");
                    filenama = filenama.replace(/[&\/\\#!,+()$~%.'\s":*?<>{}]/g, '_');
                    avatar = avatar.split(" ").join("");
                    token = token.split(" ").join("");
                    color = color.split(" ").join("");
                    botid = botid.split(" ").join("");
                    prefix = prefix.split(" ").join("");
                    owner = owner.split(" ").join("");

                    /**
                     * IF INPUTS WERE INVALID RETURN ERROR
                     */
                    if (owner.length < 17 || owner.length > 19) return ch.send("Invalid Owner ID, that would be a valid example: `921430546813419550`")
                    if (botid.length < 17 || botid.length > 19) return ch.send("Invalid Bot ID, that would be a valid example: `720351927581278219`")
                    //if (client.bots.get(owner, "bots").includes(botid)) return ch.send("❌ He already has that bot!")
                    if (token.length != "NzQ4MDg3OTA3NTE2MTUzODg5.X0YVJw.Shmvprj9eW_yfApntj7QUM0sZ_Y".length) return ch.send("INVALID TOKEN")
                    if (color.length != 7 || !color.includes("#")) return ch.send("NOT A VALID HEX COLOR, That would be a valid COLOR `#ffee33`")
                    let validurl = isvalidurl(avatar)
                    if (!validurl) return ch.send("Not a Valid Image, That would be a valid image: `https://cdn.discordapp.com/attachments/816967454776623123/823236646740295690/20210315_101235.png`")


                    //update the db for the staff person
                    client.staffrank.push(message.author.id, Date.now(), "createdbots")
                    //send informational data
                    client.channels.fetch(`${mainconfig.BoosterID.toString()}`).then(channel => {
                        try {
                            client.users.fetch(owner).then(user => {
                                channel.send({
                                    embeds: [new Discord.MessageEmbed().setColor("#57F287").setFooter(message.author.tag + " | ID: " + message.author.id, message.author.displayAvatarURL({
                                        dynamic: true
                                    })).setDescription(`<@${message.author.id}> Executed: \`${cmd}\`, for: ${user}, \`SYSTEMBOT${filenama}\`, BOT: <@${botid}>`)]
                                }).catch(() => {});
                            }).catch(e => {
                                channel.send({
                                    embeds: [new Discord.MessageEmbed().setColor("#57F287").setFooter(message.author.tag + " | ID: " + message.author.id, message.author.displayAvatarURL({
                                        dynamic: true
                                    })).setDescription(`<@${message.author.id}> Executed: \`${cmd}\`, for: ${owner}, \`SYSTEMBOT${filenama}\`, BOT: <@${botid}>`)]
                                }).catch(() => {});
                            })
                        } catch {
                            channel.send({
                                embeds: [new Discord.MessageEmbed().setColor("#57F287").setFooter(message.author.tag + " | ID: " + message.author.id, message.author.displayAvatarURL({
                                    dynamic: true
                                })).setDescription(`<@${message.author.id}> Executed: \`${cmd}\`, for: ${owner}, \`SYSTEMBOT${filenama}\`, BOT: <@${botid}>`)]
                            }).catch(() => {});
                        }
                    }).catch(console.log)


                    //ensure teh database
                    client.bots.ensure(owner, {
                        "bots": []
                    });
                    

                    /**
                     * CREATE THE TEMP MSG
                     */
                    var tempmsfg = await ch.send({
                        embeds: [new Discord.MessageEmbed()
                            .setColor(client.config.color)
                            .setAuthor("Progress ...", "https://images-ext-1.discordapp.net/external/ANU162U1fDdmQhim_BcbQ3lf4dLaIQl7p0HcqzD5wJA/https/cdn.discordapp.com/emojis/756773010123522058.gif", "https://discord.gg/Nexuss")
                            .addField(`<a:Loading:945121333333852161> Changing Configuration Settings`, "\u200b")
                            .addField("🔲 Changing Embed Settings...", "\u200b")
                            .addField(`🔲 Copying ${filenum} Files...`, "\u200b")
                            .addField("🔲 Starting Bot...", "\u200b")
                            .addField("🔲 Adding Finished Role...", "\u200b")
                            .addField("🔲 Writing Database...", "\u200b")
                        ]
                    })
                    if (globerror) return;

                        if(!localhost) {
                            setTimeout(async () => {
                                const srcDir = `${process.cwd()}/servicebots/${BotDir}/template`;
                                let destDir = `${process.cwd()}/servicebots/${BotDir}/${filenama}`;
                                const sshclient = await scp(remote_server)
                                /**
                                 * CHECK IF BOT ALREADY EXISTS
                                 */
                                 try {
                                    let res = await sshclient.exists(destDir);
                                    if(res) {
                                        tempmsfg.channel.send(`${destDir} already exists changing to: ${destDir}_2`);
                                        filenama = `${filenama}_2`;
                                        destDir = `${process.cwd()}/servicebots/${BotDir}/${filenama}`;
                                        res = await sshclient.exists(destDir);
                                        if(res) {
                                            client.createingbotmap.delete("CreatingTime");
                                            client.createingbotmap.delete("Creating");
                                            tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                            return tempmsfg.channel.send(`${destDir} already exists use another NAME!`);
                                        }
                                    }
                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                } catch (e) {
                                    console.log(e)
                                    tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `<a:Loading:945121333333852161> Starting Bot...`
                                    tempmsfg.channel.send("SOMETHING WENT WRONG! try: ,createbot local");
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    return;
                                }




                                /**
                                 * Download botconfig to a tempbotconfig
                                 */
                                 try {
                                    await sshclient.downloadDir(`${srcDir}/botconfig/`, `${srcDir}/tempbotconfig/`)
                                    console.log(`DOWNLOADED`.brightGreen,`${srcDir}/botconfig/`, `${srcDir}/tempbotconfig/`)
                                    tempmsfg.embeds[0].fields[2].name = `<a:check:964989203656097803> ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `<a:Loading:945121333333852161> Starting Bot...`
                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                } catch (e) {
                                    console.log(e)
                                    tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `<a:Loading:945121333333852161> Starting Bot...`
                                    tempmsfg.channel.send("SOMETHING WENT WRONG! try: ,createbot local");
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    return;
                                }


                                /**
                                 * EDIT THE BOT CONFIG.JSON FILE
                                 */
                                let config = require(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/config.json`);
                                config.status.text = status;
                                config.status.type = statustype ? statustype : "PLAYING";
                                config.status.url = statusurl ? statusurl : "https://twitch.tv/#";
                                config.ownerIDS = [`${mainconfig.OwnerInformation.OwnerID}`];
                                config.ownerIDS.push(owner);
                                config.prefix = prefix;
                                config.token = token;
                                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/config.json`, JSON.stringify(config, null, 3), async (e) => {
                                    if (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey);
                                        globerror = true;
                                        tempmsfg.embeds[0].fields[0].name = "❌ Changing Configuration Settings"
                                        tempmsfg.embeds[0].fields[1].name = "❌ Changing Embed Settings"
                                        tempmsfg.embeds[0].fields[2].name = `❌ Copying ${filenum} Files`
                                        tempmsfg.embeds[0].fields[3].name = "❌ Starting Bot..."
                                        tempmsfg.embeds[0].fields[4].name = "❌ Adding Finished Role"
                                        tempmsfg.embeds[0].fields[5].name = "❌ Writing Database"
                                        return await tempmsfg.edit({
                                            embeds: [tempmsfg.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    }
                                    tempmsfg.embeds[0].fields[0].name = `<a:check:964989203656097803> Changing Configuration Settings`
                                    tempmsfg.embeds[0].fields[1].name = `<a:Loading:945121333333852161> Changing Embed Settings`
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch((e) => {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    })
                                });

                                
                                /**
                                 * EDIT THE BOT EMBED.JSON FILE
                                 */
                                let embed = require(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/embed.json`);
                                embed.color = color;
                                embed.footertext = footertext;
                                embed.footericon = avatar;
                                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/embed.json`, JSON.stringify(embed, null, 3), async (e) => {
                                    if (e) {
                                        client.createingbotmap.delete("CreatingTime");
                                        client.createingbotmap.delete("Creating");
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey);
                                        globerror = true;
                                        tempmsfg.embeds[0].fields[1].name = "❌ Changing Embed Settings"
                                        tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                        tempmsfg.embeds[0].fields[3].name = "❌ Starting Bot..."
                                        tempmsfg.embeds[0].fields[4].name = "❌ Adding Finished Role"
                                        tempmsfg.embeds[0].fields[5].name = "❌ Writing Database"
                                        return await tempmsfg.edit({
                                            embeds: [tempmsfg.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    }
                                    tempmsfg.embeds[0].fields[1].name = `<a:check:964989203656097803> Changing Embed Settings`
                                    tempmsfg.embeds[0].fields[2].name = `<a:Loading:945121333333852161> ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch((e) => {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    })
                                });



                                /**
                                 * UPLOAD THE FOLDER
                                 */
                                try {
                                    await sshclient.uploadDir(`${srcDir}/tempbotconfig/`, `${srcDir}/botconfig/`)
                                    console.log(`UPLOADED`.brightGreen,`${srcDir}/tempbotconfig/`, `${srcDir}/botconfig/`)
                                    tempmsfg.embeds[0].fields[2].name = `<a:check:964989203656097803> ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `<a:Loading:945121333333852161> Starting Bot...`
                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                } catch (e) {
                                    console.log(e)
                                    tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `<a:Loading:945121333333852161> Starting Bot...`
                                    await tempmsfg.channel.send("SOMETHING WENT WRONG! try: ,createbot local");
                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    return;
                                }

                                //close the SSHCLIENT
                                sshclient.close()


                                /**
                                 * DELETE THE tempbotconfig FOLDER
                                 */
                                try {
                                    fs.rmSync(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig`, { recursive: true });
                                } catch (e) {
                                    console.log(e)
                                }

                                
                                
                                /**
                                 * CREATE THE NEW BOT AND START IT
                                 */
                                let failed = false;
                                const conn = new Client();
                                await new Promise((resolve, reject) => {
                                    conn.on('ready', () => {
                                        console.log(`EXECUTING`.brightGreen,`cp -r '${srcDir}' '${destDir}'; cd '${destDir}'; pm2 start ecosystem.config.js`);
                                        conn.exec(`cp -r '${srcDir}' '${destDir}'; cd '${destDir}'; pm2 start ecosystem.config.js`,async (err, stream) => {
                                            if (err) {
                                                tempmsfg.embeds[0].fields[3].name = `❌ Starting Bot...`
                                                tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`  
                                                await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                                client.createingbotmap.delete("CreatingTime");
                                                client.createingbotmap.delete("Creating");
                                                failed = true;
                                                console.log(err);
                                                return resolve(true);
                                            }
                                            if(failed){
                                                tempmsfg.embeds[0].fields[3].name = `❌ Starting Bot...`
                                                tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`    
                                                await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                                client.createingbotmap.delete("CreatingTime");
                                                client.createingbotmap.delete("Creating");
                                                console.log(err);
                                                conn.end();
                                                return resolve(true);
                                            }
                                            stream.on('close', async(code, signal) => {
                                                if(failed){
                                                    tempmsfg.embeds[0].fields[3].name = `❌ Starting Bot...`
                                                    tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`    
                                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                                    client.createingbotmap.delete("CreatingTime");
                                                    client.createingbotmap.delete("Creating");
                                                    conn.end();
                                                    return resolve(true);
                                                }
                                                setTimeout(() => {
                                                    conn.exec("pm2 save", async(err, stream) => {
                                                        if (err) {
                                                            tempmsfg.embeds[0].fields[3].name = `❌ Starting Bot...`
                                                            tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`    
                                                            await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                                            client.createingbotmap.delete("CreatingTime");
                                                            client.createingbotmap.delete("Creating");
                                                            failed = true;
                                                            console.log(err);
                                                            return resolve(true);
                                                        }
                                                        stream.on('close', async(code, signal) => {
                                                            tempmsfg.embeds[0].fields[3].name = `<a:check:964989203656097803> Starting Bot...`
                                                            tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`
                                                            conn.end();
                                                            resolve(true);
                                                        }).on('data', (data) => { 

                                                        }).stderr.on('data', (data) => {

                                                        });
                                                    })
                                                }, 250);
                                            }).on('data', (data) => { 

                                            }).stderr.on('data', async(data) => {
                                                if(data && data.toString().length > 1){
                                                    console.log(data.toString());
                                                    failed = true;
                                                    tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                                    tempmsfg.embeds[0].fields[3].name = `❌ Starting Bot...`
                                                    tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`    
                                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                                    client.createingbotmap.delete("CreatingTime");
                                                    client.createingbotmap.delete("Creating");
                                                    tempmsfg.channel.send("❌ This Bot Path is not existing")
                                                    return resolve(true);
                                                }
                                            });
                                        })
                                    }).connect(remote_server);
                                }).catch(async() => {
                                    tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `❌ Starting Bot...`
                                    tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`    
                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                });

                                if(failed) return;
                                
                                await tempmsfg.edit({
                                    embeds: [tempmsfg.embeds[0]]
                                }).catch(() => {});

                                /**
                                 * ADD THE FINISHED ROLE TO THE CUSTOMER
                                 */
                                try {
                                    message.guild.members.fetch(owner).then(member => {
                                        member.roles.add("937130001495646328").catch(() => {})
                                        if(member.roles.cache.has("964370138507931694")) {
                                            member.roles.remove("964370138507931694").catch(() => {})
                                            tempmsfg.embeds[0].fields[4].name = `<a:check:964989203656097803> Adding Finished Role & Removed recover Role`
                                            tempmsfg.embeds[0].fields[5].name = `<a:Loading:945121333333852161> Writing Database`
                                        } else {
                                            tempmsfg.embeds[0].fields[4].name = `<a:check:964989203656097803> Adding Finished Role`
                                            tempmsfg.embeds[0].fields[5].name = `<a:Loading:945121333333852161> Writing Database`
                                        }
                                    })
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch(() => {});
                                } catch {
                                    tempmsfg.embeds[0].fields[4].name = `❌ Adding Finished Role`
                                    tempmsfg.embeds[0].fields[5].name = `<a:Loading:945121333333852161> Writing Database`
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch(() => {});
                                }

                                tempmsfg.embeds[0].fields[5].name = `<a:check:964989203656097803> Writing Database`
                                //get the botuser
                                var botuser = await client.users.fetch(botid).catch(() => {});
                                tempmsfg.embeds[0].author.name = `✅ SUCCESS | ${BotType.toUpperCase()} CREATION`
                                tempmsfg.embeds[0].author.iconURL = botuser.displayAvatarURL();


                                await tempmsfg.edit({
                                    embeds: [tempmsfg.embeds[0]]
                                }).catch(() => {});

                                
                                /**
                                 * SEND THE IFNO MESSAGES
                                 */
                                try {
                                    client.users.fetch(owner).then(user => {
                                        user.send({
                                            content: `***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                            embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                        }).catch(e => {
                                            message.channel.send({
                                                content: `<@${user.id}> PLEASE SAVE THIS MESSAGE, YOUR DMS ARE DISABLED! (via aScreenshot for example)\n***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                                embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                            }).catch(() => {}).then(message => {
                                                message.pin().catch(() => {})
                                            })
                                        }).then(message => {
                                            message.pin().catch(() => {});
                                        })
                                        user.send({
                                            content: `<@${owner}> | **Created by: <@${message.author.id}> (\`${message.author.tag}\` | \`${message.author.id}\`)**`,
                                            embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                                .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready 2 be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                                            ]
                                        }).catch(() => {})
                                    }).catch(() => {})
                                } catch (e) {
                                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                                message.channel.send({
                                    content: `<@${owner}> | **Created by: <@${message.author.id}> (\`${message.author.tag}\` | \`${message.author.id}\`)**`,
                                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                        .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready 2 be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                                        .addField(`<:Like:934494916241948763> Rate us on TRUSTPILOT`, `> ***We would love it, if you could give us a __HONEST__ Rating on [Trustpilot](https://de.trustpilot.com/review/Nexuss.me)*** <3`)
                                    ]
                                })
                                ch.send({
                                    content: `✅ ***BOT CREATION WAS SUCCESSFUL***\n\n> Here is just the Bot Creation Information, if the Bot User needs Support etc. so that you have access to it!\n\n> **Go back**: <#${message.channel.id}>`,
                                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3].split(",")[0]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filenama}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filenama}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                }).catch(() => {})
                                

                                /**
                                 * WRITE THE DATABASE
                                 */
                                client.bots.ensure(owner, {
                                    bots: []
                                })
                                client.bots.push(owner, botid, "bots")
                                client.bots.set(botid, BotType, "type")
                                client.bots.set(botid, `> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filenama}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filenama}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``, "info")
                                client.createingbotmap.delete("CreatingTime");
                                client.createingbotmap.delete("Creating");

                                
                                /**
                                 * CHANGE THE PERMISSIONS
                                 */
                                try {
                                    message.channel.permissionOverwrites.edit(botuser.id, {
                                        SEND_MESSAGES: true,
                                        EMBED_LINKS: true,
                                        VIEW_CHANNEL: true,
                                        READ_MESSAGE_HISTORY: true,
                                        ATTACH_FILES: true,
                                        ADD_REACTIONS: true
                                    })
                                } catch {}
                            }, 100)
                        } else {
                            setTimeout(async () => {

                                let config = require(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/config.json`);
                                config.status.text = status;
                                config.status.type = statustype ? statustype : "PLAYING";
                                config.status.url = statusurl ? statusurl : "https://twitch.tv/#";
                                config.ownerIDS = [`${mainconfig.OwnerInformation.OwnerID}`];
                                config.ownerIDS.push(owner);
                                config.prefix = prefix;
                                config.token = token;
                                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/config.json`, JSON.stringify(config, null, 3), async (e) => {
                                    if (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey);
                                        globerror = true;
                                        tempmsfg.embeds[0].fields[0].name = "❌ Changing Configuration Settings"
                                        tempmsfg.embeds[0].fields[1].name = "❌ Changing Embed Settings"
                                        tempmsfg.embeds[0].fields[2].name = `❌ Copying ${filenum} Files`
                                        tempmsfg.embeds[0].fields[3].name = "❌ Starting Bot..."
                                        tempmsfg.embeds[0].fields[4].name = "❌ Adding Finished Role"
                                        tempmsfg.embeds[0].fields[5].name = "❌ Writing Database"
                                        return await tempmsfg.edit({
                                            embeds: [tempmsfg.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    }
                                    tempmsfg.embeds[0].fields[0].name = `<a:check:964989203656097803> Changing Configuration Settings`
                                    tempmsfg.embeds[0].fields[1].name = `<a:Loading:945121333333852161> Changing Embed Settings`
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch((e) => {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    })
                                });

                                let embed = require(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/embed.json`);
                                embed.color = color;
                                embed.footertext = footertext;
                                embed.footericon = avatar;
                                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/embed.json`, JSON.stringify(embed, null, 3), async (e) => {
                                    if (e) {
                                        client.createingbotmap.delete("CreatingTime");
                                        client.createingbotmap.delete("Creating");
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey);
                                        globerror = true;
                                        tempmsfg.embeds[0].fields[1].name = "❌ Changing Embed Settings"
                                        tempmsfg.embeds[0].fields[2].name = `❌ ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                        tempmsfg.embeds[0].fields[3].name = "❌ Starting Bot..."
                                        tempmsfg.embeds[0].fields[4].name = "❌ Adding Finished Role"
                                        tempmsfg.embeds[0].fields[5].name = "❌ Writing Database"
                                        return await tempmsfg.edit({
                                            embeds: [tempmsfg.embeds[0]]
                                        }).catch((e) => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        })
                                    }
                                    tempmsfg.embeds[0].fields[1].name =  `<a:check:964989203656097803> Changing Embed Settings`
                                    tempmsfg.embeds[0].fields[2].name = `<a:Loading:945121333333852161> ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch((e) => {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    })
                                });

                                const fse = require('fs-extra');

                                tempmsfg.embeds[0].fields[1].name = `<a:check:964989203656097803> Changing Embed Settings`


                                const srcDir = `${process.cwd()}/servicebots/${BotDir}/template`;
                                const destDir = `${process.cwd()}/servicebots/${BotDir}/${filenama}`;
                                // Async with promises:
                                fse.copy(srcDir, destDir, {
                                        overwrite: true
                                })
                                .then(async () => {
                                    tempmsfg.embeds[0].fields[2].name = `<a:check:964989203656097803> ${localhost ? `Copying ${filenum} Files` : `Uploading ${filenum} Files to \`${serverId}\``}`
                                    tempmsfg.embeds[0].fields[3].name = `<a:Loading:945121333333852161> Starting Bot...`
                                    await tempmsfg.edit({ embeds: [tempmsfg.embeds[0]] }).catch(() => {});
                                    require("child_process").exec(`pm2 start ecosystem.config.js`, {
                                        cwd: destDir
                                    })
                                    tempmsfg.embeds[0].fields[3].name = `<a:check:964989203656097803> Starting Bot...`
                                    tempmsfg.embeds[0].fields[4].name = `<a:Loading:945121333333852161> Adding Finished Role`
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch(() => {});

                                    try {
                                        message.guild.members.fetch(owner).then(member => {
                                            member.roles.add("937130001495646328").catch(() => {})
                                            if(member.roles.cache.has("964370138507931694")) {
                                                member.roles.remove("964370138507931694").catch(() => {})
                                                tempmsfg.embeds[0].fields[4].name = `<a:check:964989203656097803> Adding Finished Role & Removed recover Role`
                                                tempmsfg.embeds[0].fields[5].name = `<a:Loading:945121333333852161> Writing Database`
                                            } else {
                                                tempmsfg.embeds[0].fields[4].name = `<a:check:964989203656097803> Adding Finished Role`
                                                tempmsfg.embeds[0].fields[5].name = `<a:Loading:945121333333852161> Writing Database`
                                            }
                                        })
                                        await tempmsfg.edit({
                                            embeds: [tempmsfg.embeds[0]]
                                        }).catch(() => {});
                                    } catch {
                                        tempmsfg.embeds[0].fields[4].name = `❌ Adding Finished Role`
                                        tempmsfg.embeds[0].fields[5].name = `<a:Loading:945121333333852161> Writing Database`
                                        await tempmsfg.edit({
                                            embeds: [tempmsfg.embeds[0]]
                                        }).catch(() => {});
                                    }

                                    tempmsfg.embeds[0].fields[5].name = `<a:check:964989203656097803> Writing Database`
                                    var botuser = await client.users.fetch(botid);
                                    tempmsfg.embeds[0].author.name = `✅ SUCCESS | ${BotType.toUpperCase()} CREATION`
                                    tempmsfg.embeds[0].author.iconURL = botuser.displayAvatarURL();
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch(() => {});
                                    try {
                                        client.users.fetch(owner).then(user => {
                                            user.send({
                                                content: `***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                                embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3].split(",")[0]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filenama}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filenama}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                            }).catch(e => {
                                                message.channel.send({
                                                    content: `<@${user.id}> PLEASE SAVE THIS MESSAGE, YOUR DMS ARE DISABLED! (via aScreenshot for example)\n***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3].split(",")[0]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filenama}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filenama}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                                }).catch(() => {}).then(message => {
                                                    message.pin().catch(() => {})
                                                })
                                            }).then(message => {
                                                message.pin().catch(() => {});
                                            })
                                            user.send({
                                                content: `<@${owner}> | **Created by: <@${message.author.id}> (\`${message.author.tag}\` | \`${message.author.id}\`)**`,
                                                embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                                    .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready 2 be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                                                ]
                                            }).catch(() => {})
                                        }).catch(() => {})
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                    }
                                    message.channel.send({
                                        content: `<@${owner}> | **Created by: <@${message.author.id}> (\`${message.author.tag}\` | \`${message.author.id}\`)**`,
                                        embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                            .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready 2 be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                                            .addField("Rate us on TRUSTPILOT", `> ***We would love it, if you could give us a __HONEST__ Rating on [Trustpilot](https://de.trustpilot.com/review/Nexuss.me)*** <3`)
                                        ]
                                    })
                                    ch.send({
                                        content: `✅ ***BOT CREATION WAS SUCCESSFUL***\n\n> Here is just the Bot Creation Information, if the Bot User needs Support etc. so that you have access to it!\n\n> **Go back**: <#${message.channel.id}>`,
                                        embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3].split(",")[0]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filenama}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filenama}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                    }).catch(() => {})
                                    client.bots.ensure(owner, {
                                        bots: []
                                    })
                                    client.bots.push(owner, botid, "bots")
                                    client.bots.set(botid, BotType, "type")
                                    client.bots.set(botid, `> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3].split(",")[0]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filenama}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filenama}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``, "info")
                                    require("child_process").exec(`pm2 save`)
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    try {
                                        message.channel.permissionOverwrites.edit(botuser.id, {
                                            SEND_MESSAGES: true,
                                            EMBED_LINKS: true,
                                            VIEW_CHANNEL: true,
                                            READ_MESSAGE_HISTORY: true,
                                            ATTACH_FILES: true,
                                            ADD_REACTIONS: true
                                        })
                                    } catch {}
                                })
                                .catch(async err => {
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    tempmsfg.embeds[0].fields[2].name = `❌ Copying ${filenum} Files`
                                    tempmsfg.embeds[0].fields[3].name = "❌ Starting Bot..."
                                    tempmsfg.embeds[0].fields[4].name = "❌ Adding Finished Role"
                                    tempmsfg.embeds[0].fields[5].name = "❌ Writing Database"
                                    await tempmsfg.edit({
                                        embeds: [tempmsfg.embeds[0]]
                                    }).catch(() => {});
                                    ch.send("SOMETHING WENT WRONG:\n```" + err.message ? err.message.toString().substr(0, 1900) : err.toString().substr(0, 1900) + "```")
                                });
                            }, 100)
                            
                        }
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                }


                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
                ///////////////////////////////////////
            }
            //Event
            client.on('interactionCreate', async interaction => {
                if (!interaction.isSelectMenu()) return;
                if (interaction.message.id === menumessage.id) {
                    if (interaction.user.id === cmduser.id) menuselection(interaction);
                    else return interaction.reply({
                        content: `Only <@${message.author.id}> is allowed to create a Bot (because he executed the COMMAND)`,
                        ephemeral: true
                    })
                }
            });
        } 
        
        /**
         * TICKET SYSTEM
         */
        else if (cmd === "addticket") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            let member = message.mentions.members.filter(m => m.guild.id == message.guild.id).first() || await message.guild.members.fetch(args[0])
            if (!member || !member.user) return message.reply("❌ **You forgot to Ping a MEMBER**\nUsage: `,addticket @USER/@BOT`");
            let user = member.user;
            if(message.channel.permissionOverwrites.cache.has(user.id)) return message.reply("❌ **This User is already added to this Ticket!**")
            
            message.channel.permissionOverwrites.edit(user, {
                SEND_MESSAGES: true,
                EMBED_LINKS: true,
                READ_MESSAGE_HISTORY: true,
                ATTACH_FILES: true,
                VIEW_CHANNEL: true,
            }).catch(e => {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
            }).then(() => {
                message.channel.send(`✅ Successfully Added <@${user.id}> to this Ticket`);
            })
        } else if (cmd === "removeticket") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            let member = message.mentions.members.filter(m => m.guild.id == message.guild.id).first() || await message.guild.members.fetch(args[0])
            if (!member || !member.user) return message.reply("❌ **You forgot to Ping a MEMBER**\nUsage: `,removeticket @USER/@BOT`");
            let user = member.user;
            if(!message.channel.permissionOverwrites.cache.has(user.id)) return message.reply("❌ **This User is not added to this Ticket!**")
            message.channel.permissionOverwrites.delete(user).catch(e => {
                message.channel.send(`❌ Failed to remove <@${user.id}> from this Ticket`);
            }).then(() => {
                message.channel.send(`✅ Successfully Removed <@${user.id}> from this Ticket`);
            })
        } else if (cmd === "close") {
            if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.has(Roles.SupporterRoleId) && !message.member.roles.cache.has(Roles.OwnerRoleId) && !message.member.roles.cache.has(Roles.ChiefBotCreatorRoleId)) return message.reply("You are not allowed to close the TICKET!")
            let verifybutton1 = new MessageButton().setStyle("DANGER").setLabel("Close").setCustomId("close").setEmoji("🔒")
            let verifybutton2 = new MessageButton().setStyle("SUCCESS").setLabel("Don't Close").setCustomId("dont_close").setEmoji("🔓")
            let allbuttons = [new MessageActionRow().addComponents([verifybutton1, verifybutton2])]
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            let tmp = await message.reply({
                embeds: [new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle("Are you sure that You want to close the Ticket?")
                ],
                components: allbuttons
            });
            let userid = false;
            const collector = tmp.channel.createMessageComponentCollector({
                filter: button => button.isButton() && !button.user.bot,
                time: 30000
            })
            collector.on('collect', async i => {
                if (i.customId === 'close') {
                    //update the db for the staff person
                    client.staffrank.push(message.author.id, Date.now(), "tickets")
                    //defer update
                    await i.update({
                        embeds: [new Discord.MessageEmbed().setColor("RED").setTitle("Closing the Ticket...")],
                        components: []
                    });

                    try {
                        if(client.setups.has(message.channel.id)) {
                            userid = client.setups.get(message.channel.id, "user");
                            client.setups.delete(message.channel.id);
                        }
                        if (!userid && message.channel.parent && message.channel.parent.id == "938439935361433691")
                            userid = client.setups.findKey(user => user.ticketid == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid2 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid3 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid4 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid5 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid6 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.OwnerInformation.NotSakshTicket}`)
                            userid = client.setups.findKey(user => user.ticketid7 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid8 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid9 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.OwnerTicket}`)
                            userid = client.setups.findKey(user => user.ticketid10 == message.channel.id)
                        
                        if(userid.length < 5) {
                            userid = client.setups.findKey(user => user.ticketid == message.channel.id 
                                || user.ticketid1 == message.channel.id
                                || user.ticketid2 == message.channel.id
                                || user.ticketid3 == message.channel.id
                                || user.ticketid4 == message.channel.id
                                || user.ticketid5 == message.channel.id
                                || user.ticketid6 == message.channel.id
                                || user.ticketid7 == message.channel.id
                                || user.ticketid8 == message.channel.id
                                || user.ticketid9 == message.channel.id
                                || user.ticketid0 == message.channel.id
                                || user.ticketid10 == message.channel.id)
                        }
                    } catch (e) {
                        //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    }
                    client.ticketdata.ensure(message.channel.id, {
                        supporters: [ /* { id: "", messages: 0} */ ]
                    })

                    let parent1 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`);
                    let parent2 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                    if( (parent1 && parent1.type == "GUILD_CATEGORY" && parent1.children.size > 50) && 
                        (parent2 && parent2.type == "GUILD_CATEGORY" && parent2.children.size > 50) 
                    ) return message.reply("❌ **ALL 2 CLOSED-TICKET CATEGORIES are FULL**!\nUse `,closeall` before you can close a ticket...")


                    let ticketdata = client.ticketdata.get(message.channel.id, "supporters")
                    ticketdata = ticketdata.map(d => `<@${d.id}> | \`${d.messages} Messages\``)


                    try {

                        var messagelimit = 1000;
                        //The text content collection
                        let messageCollection = new Discord.Collection(); //make a new collection
                        let channelMessages = await message.channel.messages.fetch({ //fetch the last 100 messages
                            limit: 100
                        }).catch(() => {}); //catch any error
                        messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
                        let tomanymessages = 1; //some calculation for the messagelimit
                        if (Number(messagelimit) === 0) messagelimit = 100; //if its 0 set it to 100
                        messagelimit = Number(messagelimit) / 100; //devide it by 100 to get a counter
                        if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
                        while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                            if (tomanymessages === messagelimit) break; //if the counter equals to the limit stop the loop
                            tomanymessages += 1; //add 1 to the counter
                            let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                            channelMessages = await message.channel.messages.fetch({
                                limit: 100,
                                before: lastMessageId
                            }).catch(() => {}); //Fetch again, 100 messages above the already fetched messages
                            if (channelMessages) //if its true
                                messageCollection = messageCollection.concat(channelMessages); //add them to the collection
                        }
                        //reverse the array to have it listed like the discord chat
                        create_transcript_buffer([...messageCollection.values()], message.channel, message.guild).then(async path => {
                            try { // try to send the file
                                const attachment = new Discord.MessageAttachment(path); //send it as an attachment
                                await client.channels.fetch(`${mainconfig.LoggingChannelID.TicketLogChannelID}`).then(async channel => {
                                    try {
                                        client.users.fetch(userid).then(async user => {
                                            await channel.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata.join("\n")}`.substr(0, 1024))
                                                    .setColor("BLURPLE").setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${message.author.id}> Executed: \`close\`\n> **For: ${user} \`${user.tag}\` (${userid})**\n> **Channel: \`${message.channel.name}\` (\`${message.channel.id}\`)**\n> **Category: \`${message.channel.parent?.name}\` (\`${message.channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        }).catch(async e => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            await channel.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata && ticketdata.length > 0 ? ticketdata.join("\n") : "None"}`.substr(0, 1024))
                                                    .setColor("BLURPLE").setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${message.author.id}> Executed: \`close\`\n> **For: ${userid}**\n> **Channel: \`${message.channel.name}\` (\`${message.channel.id}\`)**\n> **Category: \`${message.channel.parent?.name}\` (\`${message.channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        await channel.send({
                                            embeds: [new Discord.MessageEmbed()
                                                .addField("Supporters:", `> ${ticketdata.join("\n")}`.substr(0, 1024))
                                                .setColor("BLURPLE").setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                    dynamic: true
                                                })).setDescription(`> 🔒 <@${message.author.id}> Executed: \`close\`\n> **Channel: \`${message.channel.name}\` (\`${message.channel.id}\`)**\n> **Category: \`${message.channel.parent?.name}\` (\`${message.channel.parentId}\`)**`)
                                            ], files: [attachment]
                                        })
                                    }
                                }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
            
                                if (userid && userid.length > 2) {
                                    try {
                                        await client.users.fetch(userid).then(async user => {
                                            try {
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets2");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets3");
                                                if (message.channel.parent && message.channel.parent.id == "938439935361433691")
                                                    client.setups.remove("TICKETS", user.id, "tickets4");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets5");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets6");
                                            } catch (e) {
                                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            }
                                            await user.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .setColor(client.config.color)
                                                    .setTitle(`\`${message.channel.name}\``)
                                                    .addField(`🔒 CLOSED BY:`, `${message.author.tag} | <@${message.author.id}>`)
                                                    .setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                        dynamic: true
                                                    }))
                                                    .addField(`♨️ TYPE:`, `${message.channel.parent ? message.channel.parent.name : "UNKOWN"}`)
                                                ], files: [attachment]
                                            }).catch(console.log)
                                        })
                                    } catch {
            
                                    }
                                }
                                setTimeout(async () => {
                                    await fs.unlinkSync(path)
                                }, 300)
                            } catch (error) { //if the file is to big to be sent, then catch it!
                                console.log(error)
                            }
                        }).catch(e => {
                            console.log(String(e).grey)
                        })
                    }catch (e){
                        console.log(e)
                    }
                    await message.channel.send({
                        embeds: [new Discord.MessageEmbed()
                            .setColor(client.config.color)
                            .setTitle(`\`${message.channel.name}\``)
                            .addField(`🔒 CLOSED BY:`, `${message.author.tag} | <@${message.author.id}>`)
                            .addField(`♨️ TYPE:`, `${message.channel.parent ? message.channel.parent.name : "UNKOWN"}`)
                        ]
                    }).catch(console.log)

                    if(parent1 && parent1.type == "GUILD_CATEGORY" && parent1.children.size < 50) {
                        await message.channel.setParent(parent1.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent2 && parent2.type == "GUILD_CATEGORY" && parent2.children.size < 50) {
                        await message.channel.setParent(parent2.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent3 && parent3.type == "GUILD_CATEGORY" && parent3.children.size < 50) {
                        await message.channel.setParent(parent3.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent4 && parent4.type == "GUILD_CATEGORY" && parent4.children.size < 50) {
                        await message.channel.setParent(parent4.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent5 && parent5.type == "GUILD_CATEGORY" && parent5.children.size < 50) {
                        await message.channel.setParent(parent5.id, {lockPermissions:false}).catch(()=>{});
                    }
                    await message.channel.permissionOverwrites.set([
                        {id: message.guild.id, deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL,Discord.Permissions.FLAGS.SEND_MESSAGES,Discord.Permissions.FLAGS.VIEW_CHANNEL]}
                    ]).catch(()=>{});
                    
                } else {
                    await i.update({
                        embeds: [new Discord.MessageEmbed().setColor("#57F287").setTitle("Keeping the Ticket open!")],
                        components: []
                    });

                }
            });
        } else if (cmd === "closeall") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command!");

            let parent1 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`);
            let parent2 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
            let amount = parent1.children.size + parent2.children.size
            if(amount < 1) return message.reply("No closed Tickets available");
            let verifybutton1 = new MessageButton().setStyle("DANGER").setLabel("Close").setCustomId("close").setEmoji("🔒")
            let verifybutton2 = new MessageButton().setStyle("SUCCESS").setLabel("Don't Close").setCustomId("dont_close").setEmoji("🔓")
            let allbuttons = [new MessageActionRow().addComponents([verifybutton1, verifybutton2])]
            let tmp = await message.reply({
                embeds: [new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle(`Are you sure that You want to delete ${amount} Tickets?`)
                ],
                components: allbuttons
            });
            let userid = "0";
            const collector = tmp.channel.createMessageComponentCollector({
                filter: button => button.isButton() && !button.user.bot,
                time: 30000
            })
            collector.on('collect', async i => {
                if (i.customId === 'close') {
                    if (amount == 0) {
                        await i.update({
                            embeds: [new Discord.MessageEmbed().setColor("RED").setTitle(`No Tickets available to get deleted!!`)],
                            components: []
                        });
                    } else {
                        await i.update({
                            embeds: [new Discord.MessageEmbed().setColor("RED").setTitle(`Deleting ${amount} Tickets...`)],
                            components: []
                        });
                        for (const channel of parent1.children.map(ch => ch.id)) {
                            await new Promise((res) => {
                                setTimeout(async () => {
                                    res(2)
                                }, 1000)
                            })
                            client.channels.fetch(channel).then(channel => {
                                channel.delete().catch(() => {})
                            }).catch(() => {})
                        }
                        for (const channel of parent2.children.map(ch => ch.id)) {
                            await new Promise((res) => {
                                setTimeout(async () => {
                                    res(2)
                                }, 1000)
                            })
                            client.channels.fetch(channel).then(channel => {
                                channel.delete().catch(() => {})
                            }).catch(() => {})
                        }
                        for (const channel of parent3.children.map(ch => ch.id)) {
                            await new Promise((res) => {
                                setTimeout(async () => {
                                    res(2)
                                }, 1000)
                            })
                            client.channels.fetch(channel).then(channel => {
                                channel.delete().catch(() => {})
                            }).catch(() => {})
                        }
                        for (const channel of parent4.children.map(ch => ch.id)) {
                            await new Promise((res) => {
                                setTimeout(async () => {
                                    res(2)
                                }, 1000)
                            })
                            client.channels.fetch(channel).then(channel => {
                                channel.delete().catch(() => {})
                            }).catch(() => {})
                        }
                        for (const channel of parent5.children.map(ch => ch.id)) {
                            await new Promise((res) => {
                                setTimeout(async () => {
                                    res(2)
                                }, 1000)
                            })
                            client.channels.fetch(channel).then(channel => {
                                channel.delete().catch(() => {})
                            }).catch(() => {})
                        }
                    }
                } else {
                    await i.update({
                        embeds: [new Discord.MessageEmbed().setColor(client.config.color).setTitle(`Keeping ${amount} Tickets closed!`)],
                        components: []
                    });

                }
            })

        } else if (cmd === "delete") {
            if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.has(Roles.SupporterRoleId) && !message.member.roles.cache.has(Roles.OwnerRoleId) && !message.member.roles.cache.has(Roles.ChiefBotCreatorRoleId)) return message.reply("You are not allowed to delete the TICKET!")
            let verifybutton1 = new MessageButton().setStyle("DANGER").setLabel("Delete").setCustomId("delete").setEmoji("🔒")
            let verifybutton2 = new MessageButton().setStyle("SUCCESS").setLabel("Don't Delete").setCustomId("dont_close").setEmoji("🔓")
            let allbuttons = [new MessageActionRow().addComponents([verifybutton1, verifybutton2])]
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            let tmp = await message.reply({
                embeds: [new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle("Are you sure that You want to delete the Ticket?")
                ],
                components: allbuttons
            });
            let userid = false;
            const collector = tmp.channel.createMessageComponentCollector({
                filter: button => button.isButton() && !button.user.bot,
                time: 30000
            })
            collector.on('collect', async i => {
                if (i.customId === 'delete') {
                    //update the db for the staff person
                    client.staffrank.push(message.author.id, Date.now(), "tickets")
                    //defer update
                    await i.update({
                        embeds: [new Discord.MessageEmbed().setColor("RED").setTitle("Deleting the Ticket...")],
                        components: []
                    });

                    try {
                        if(client.setups.has(message.channel.id)) {
                            userid = client.setups.get(message.channel.id, "user");
                            client.setups.delete(message.channel.id);
                        }
                        if (!userid && message.channel.parent && message.channel.parent.id == "938439935361433691")
                            userid = client.setups.findKey(user => user.ticketid == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid2 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid3 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid4 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid5 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid6 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.OwnerInformation.NotSakshTicket}`)
                            userid = client.setups.findKey(user => user.ticketid7 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid8 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid9 == message.channel.id)
                        if (!userid && message.channel.parent && message.channel.parent.id == `${mainconfig.OwnerTicket}`)
                            userid = client.setups.findKey(user => user.ticketid10 == message.channel.id)
                        
                        if(userid.length < 5) {
                            userid = client.setups.findKey(user => user.ticketid == message.channel.id 
                                || user.ticketid1 == message.channel.id
                                || user.ticketid2 == message.channel.id
                                || user.ticketid3 == message.channel.id
                                || user.ticketid4 == message.channel.id
                                || user.ticketid5 == message.channel.id
                                || user.ticketid6 == message.channel.id
                                || user.ticketid7 == message.channel.id
                                || user.ticketid8 == message.channel.id
                                || user.ticketid9 == message.channel.id
                                || user.ticketid0 == message.channel.id
                                || user.ticketid10 == message.channel.id)
                        }
                    } catch (e) {
                        //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    }
                    client.ticketdata.ensure(message.channel.id, {
                        supporters: [ /* { id: "", messages: 0} */ ]
                    })

                    let parent1 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`);
                    let parent2 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)



                    let ticketdata = client.ticketdata.get(message.channel.id, "supporters")
                    ticketdata = ticketdata.map(d => `<@${d.id}> | \`${d.messages} Messages\``)


                    try {

                        var messagelimit = 1000;
                        //The text content collection
                        let messageCollection = new Discord.Collection(); //make a new collection
                        let channelMessages = await message.channel.messages.fetch({ //fetch the last 100 messages
                            limit: 100
                        }).catch(() => {}); //catch any error
                        messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
                        let tomanymessages = 1; //some calculation for the messagelimit
                        if (Number(messagelimit) === 0) messagelimit = 100; //if its 0 set it to 100
                        messagelimit = Number(messagelimit) / 100; //devide it by 100 to get a counter
                        if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
                        while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                            if (tomanymessages === messagelimit) break; //if the counter equals to the limit stop the loop
                            tomanymessages += 1; //add 1 to the counter
                            let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                            channelMessages = await message.channel.messages.fetch({
                                limit: 100,
                                before: lastMessageId
                            }).catch(() => {}); //Fetch again, 100 messages above the already fetched messages
                            if (channelMessages) //if its true
                                messageCollection = messageCollection.concat(channelMessages); //add them to the collection
                        }
                        //reverse the array to have it listed like the discord chat
                        create_transcript_buffer([...messageCollection.values()], message.channel, message.guild).then(async path => {
                            try { // try to send the file
                                const attachment = new Discord.MessageAttachment(path); //send it as an attachment
                                await client.channels.fetch(`${mainconfig.LoggingChannelID.TicketLogChannelID}`).then(async channel => {
                                    try {
                                        client.users.fetch(userid).then(async user => {
                                            await channel.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata.join("\n")}`.substr(0, 1024))
                                                    .setColor("BLURPLE").setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${message.author.id}> Executed: \`delete\`\n> **For: ${user} \`${user.tag}\` (${userid})**\n> **Channel: \`${message.channel.name}\` (\`${message.channel.id}\`)**\n> **Category: \`${message.channel.parent?.name}\` (\`${message.channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        }).catch(async e => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            await channel.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata && ticketdata.length > 0 ? ticketdata.join("\n") : "None"}`.substr(0, 1024))
                                                    .setColor("BLURPLE").setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${message.author.id}> Executed: \`delete\`\n> **For: ${userid}**\n> **Channel: \`${message.channel.name}\` (\`${message.channel.id}\`)**\n> **Category: \`${message.channel.parent?.name}\` (\`${message.channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        await channel.send({
                                            embeds: [new Discord.MessageEmbed()
                                                .addField("Supporters:", `> ${ticketdata.join("\n")}`.substr(0, 1024))
                                                .setColor("BLURPLE").setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                    dynamic: true
                                                })).setDescription(`> 🔒 <@${message.author.id}> Executed: \`delete\`\n> **Channel: \`${message.channel.name}\` (\`${message.channel.id}\`)**\n> **Category: \`${message.channel.parent?.name}\` (\`${message.channel.parentId}\`)**`)
                                            ], files: [attachment]
                                        })
                                    }
                                }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
            
                                if (userid && userid.length > 2) {
                                    try {
                                        await client.users.fetch(userid).then(async user => {
                                            try {
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets2");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets3");
                                                if (message.channel.parent && message.channel.parent.id == "938439935361433691")
                                                    client.setups.remove("TICKETS", user.id, "tickets4");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets5");
                                                if (message.channel.parent && message.channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets6");
                                            } catch (e) {
                                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            }
                                            await user.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .setColor(client.config.color)
                                                    .setTitle(`\`${message.channel.name}\``)
                                                    .addField(`🔒 DELETED BY:`, `${message.author.tag} | <@${message.author.id}>`)
                                                    .setFooter(message.author.tag + " | ID: " + message.author.id+"\nTicketLog is attached to the Message!", message.author.displayAvatarURL({
                                                        dynamic: true
                                                    }))
                                                    .addField(`♨️ TYPE:`, `${message.channel.parent ? message.channel.parent.name : "UNKOWN"}`)
                                                ], files: [attachment]
                                            }).catch(console.log)
                                        })
                                    } catch {
            
                                    }
                                }
                                setTimeout(async () => {
                                    await fs.unlinkSync(path)
                                }, 300)
                            } catch (error) { //if the file is to big to be sent, then catch it!
                                console.log(error)
                            }
                        }).catch(e => {
                            console.log(String(e).grey)
                        })
                    }catch (e){
                        console.log(e)
                    }
                    await message.channel.delete().catch(console.log)

                    
                    
                } else {
                    await i.update({
                        embeds: [new Discord.MessageEmbed().setColor("#57F287").setTitle("Keeping the Ticket open!")],
                        components: []
                    });

                }
            });
        }else if (cmd === "setsaksh") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            message.channel.setParent(`${mainconfig.OwnerInformation.NotSakshTicket}`).then(async () => {
                var { name } = message.channel;
                var emoji = "💎";
                if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
                message.delete().catch(()=>{});
                if(client.setups.has(message.channel.id)) {
                    let id = client.setups.get(message.channel.id, "user");

                    await message.channel.permissionOverwrites.edit(id, {
                        SEND_MESSAGES: true,
                        EMBED_LINKS: true,
                        READ_MESSAGE_HISTORY: true,
                        ATTACH_FILES: true,
                        VIEW_CHANNEL: true,
                    }).catch(e => {
                        message.channel.send("Could not add the ticket user back to the channel...").catch(() => {});
                    });
                } else {
                    message.channel.send(":x: **Could not find the Ticket Opener in the Database**").catch(() => {});
                }

                message.channel.send(`**Pinging Saksh, and changing Channel Permissions...**\n> <@921430546813419550>`).then(async m => {
                    const notallowed = [Roles.SupporterRoleId, Roles.NewSupporterRoleId, Roles.ModRoleId, Roles.BotCreatorRoleId, Roles.ChiefBotCreatorRoleId, Roles.ChiefSupporterRoleId];
                    for(const id of message.channel.permissionOverwrites.cache.filter(p => p.type == "member" && p.allow.has("SEND_MESSAGES")).map(m => m.id).filter(m=> {
                        let member = message.guild.members.cache.get(m)
                        //filter only members who are not SUPPORTERS
                        if(member && 
                        member.roles.highest.rawPosition >= message.guild.roles.cache.get(Roles.NewSupporterRoleId).rawPosition && 
                        notallowed.some(id => member.roles.highest.rawPosition <= message.guild.roles.cache.get(id).rawPosition)
                        ) {
                            if(client.setups.has(message.channel.id) && client.setups.get(message.channel.id, "user") == m) return false;
                            else return m;
                        }
                        else return false;
                    }).filter(Boolean)) {
                        await message.channel.permissionOverwrites.edit(id, {
                            SEND_MESSAGES: false,
                        }).catch(() => {});
                        //wait a bit
                        await delay(client.ws.ping);
                    }
                    //Send Approve Message
                    m.edit(`👍 **NotSaksh is contacted, let's wait for his Response!**`)
                })
                
                message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                    message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                        setTimeout(() => m.delete().catch(() => {}), 3000);
                    })
                }).catch((e) => {
                    console.log(e);
                    message.reply(":x: **Could not rename the Channel...**").then(m => {
                        setTimeout(() => m.delete().catch(() => {}), 3000);
                    })
                })
            }).catch(e => {
                message.channel.send(`${e.message ? e.message : e}`.substr(0, 1900), {
                    code: "js"
                })
            })
        } else if (cmd === "setmigrate") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            let parent1 = message.guild.channels.cache.get("964370141636878354");

            let parentId = null;
            if(parent1 && parent1.type == "GUILD_CATEGORY" && parent1.children.size < 50) {
                parentId = parent1.id;
            }
            if(!parentId) return message.reply(":x: **There is no free space left, contact TOMATO!**")
            await message.channel.setParent(parentId).then(async () => {
                var { name } = message.channel;
                var emoji = "🔥";
                if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
                message.delete().catch(()=>{});

                message.channel.send(`**Pinging Saksh, and changing Channel Permissions...**\n> <@921430546813419550>`).then(async m => {
                    const notallowed = [Roles.SupporterRoleId, Roles.NewSupporterRoleId, Roles.ModRoleId, Roles.BotCreatorRoleId, Roles.ChiefBotCreatorRoleId, Roles.ChiefSupporterRoleId];
                    for(const id of message.channel.permissionOverwrites.cache.filter(p => p.type == "member" && p.allow.has("SEND_MESSAGES")).map(m => m.id).filter(m=> {
                        let member = message.guild.members.cache.get(m)
                        //filter only members who are not SUPPORTERS
                        if(member && 
                        member.roles.highest.rawPosition >= message.guild.roles.cache.get(Roles.NewSupporterRoleId).rawPosition && 
                        notallowed.some(id => member.roles.highest.rawPosition <= message.guild.roles.cache.get(id).rawPosition)
                        ) {
                            if(client.setups.has(message.channel.id) && client.setups.get(message.channel.id, "user") == m) return false;
                            else return m;
                        }
                        else return false;
                    }).filter(Boolean)) {
                        await message.channel.permissionOverwrites.edit(id, {
                            SEND_MESSAGES: false,
                        }).catch(() => {});
                        //wait a bit
                        await delay(client.ws.ping);
                    }
                    //Send Approve Message
                    m.edit(`👍 **NotSaksh is contacted, you're Bot will be migrated soon!\nThis Bot will soon be transferred to the payed host! Saksh will tell you when it will happen, so that u don't get surprised!**`)
                })
                
                await message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                    message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                        setTimeout(() => m.delete().catch(() => {}), 3000);
                    })
                }).catch((e) => {
                    console.log(e);
                    message.reply(":x: **Could not rename the Channel...**").then(m => {
                        setTimeout(() => m.delete().catch(() => {}), 3000);
                    })
                })

            }).catch(e => {
                message.channel.send(`${e.message ? e.message : e}`.substr(0, 1900), {
                    code: "js"
                })
            })
            if(client.setups.has(message.channel.id)) {
                let id = client.setups.get(message.channel.id, "user");
                await message.channel.permissionOverwrites.edit(id, {
                    SEND_MESSAGES: true,
                    EMBED_LINKS: true,
                    READ_MESSAGE_HISTORY: true,
                    ATTACH_FILES: true,
                    VIEW_CHANNEL: true,
                }).catch(e => {
                    console.log(e)
                    message.channel.send("Could not add the ticket user back to the channel...").catch(() => {});
                });
            } else {
                message.channel.send(":x: **Could not find the Ticket Opener in the Database**").catch(() => {});
            }
        } else if (cmd === "setowner") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            var { name } = message.channel;
            var emoji = "👑";
            if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
            message.delete().catch(()=>{});
            message.channel.send(`**Pinging Owners & Co-Owners, and changing Channel Permissions...**\n> <@&${Roles.OwnerRoleId}> / <@&${Roles.CoOwnerRoleId}> / <@&${Roles.FounderId}>`).then(async m => {
                const notallowed = [Roles.SupporterRoleId, Roles.NewSupporterRoleId, Roles.ModRoleId, Roles.BotCreatorRoleId, Roles.ChiefBotCreatorRoleId, Roles.ChiefSupporterRoleId];
                for(const id of message.channel.permissionOverwrites.cache.filter(p => p.type == "member" && p.allow.has("SEND_MESSAGES")).map(m => m.id).filter(m=> {
                    let member = message.guild.members.cache.get(m)
                    //filter only members who are not SUPPORTERS
                    if(member && 
                       member.roles.highest.rawPosition >= message.guild.roles.cache.get(Roles.NewSupporterRoleId).rawPosition && 
                       notallowed.some(id => member.roles.highest.rawPosition <= message.guild.roles.cache.get(id).rawPosition)
                    ) {
                        if(client.setups.has(message.channel.id) && client.setups.get(message.channel.id, "user") == m) return false;
                        else return m;
                    }
                    else return false;
                }).filter(Boolean)) {
                    await message.channel.permissionOverwrites.edit(id, {
                        SEND_MESSAGES: false,
                    }).catch(() => {});
                    //wait a bit
                    await delay(client.ws.ping);
                }
                //Send Approve Message
                m.edit(`👍 **Co-Owners & Owners are contacted, let's wait for their Response!**`)
            })
            message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            }).catch((e) => {
                console.log(e);
                message.reply(":x: **Could not rename the Channel...**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            })
        } else if (cmd === "setmod") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            var { name } = message.channel;
            var emoji = "⛔️";
            if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
            message.delete().catch(()=>{});
            message.channel.send(`**Pinging Mods & Admins, and changing Channel Permissions...**\n> <@&${Roles.ModRoleId}> / <@&${Roles.AdminRoleId}>`).then(async m => {
                const notallowed = [Roles.SupporterRoleId, Roles.NewSupporterRoleId, Roles.BotCreatorRoleId, Roles.ChiefBotCreatorRoleId, Roles.ChiefSupporterRoleId];
                for(const id of message.channel.permissionOverwrites.cache.filter(p => p.type == "member" && p.allow.has("SEND_MESSAGES")).map(m => m.id).filter(m=> {
                    let member = message.guild.members.cache.get(m)
                    //filter only members who are not SUPPORTERS
                    if(member && 
                       member.roles.highest.rawPosition >= message.guild.roles.cache.get(Roles.NewSupporterRoleId).rawPosition && 
                       notallowed.some(id => member.roles.highest.rawPosition <= message.guild.roles.cache.get(id).rawPosition)
                    ) {
                        if(client.setups.has(message.channel.id) && client.setups.get(message.channel.id, "user") == m) return false;
                        else return m;
                    }
                    else return false;
                }).filter(Boolean)) {
                    await message.channel.permissionOverwrites.edit(id, {
                        SEND_MESSAGES: false,
                    }).catch(() => {});
                    //wait a bit
                    await delay(client.ws.ping);
                }
                await message.channel.permissionOverwrites.edit(Roles.ModRoleId, {
                    SEND_MESSAGES: true,
                }).catch(() => {});
                //Send Approve Message
                m.edit(`👍 **Mods & Admins are contacted, let's wait for their Response!**`)
            })
            message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            }).catch((e) => {
                console.log(e);
                message.reply(":x: **Could not rename the Channel...**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            })
        } else if (cmd === "setimportant") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            var { name } = message.channel;
            var emoji = "❗";
            if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
            message.delete().catch(()=>{});
            message.channel.send(`**Pinging Mods & Admins, and changing Channel Permissions...**\n> <@&${Roles.ModRoleId}> / <@&${Roles.AdminRoleId}>`).then(async m => {
                const notallowed = [Roles.SupporterRoleId, Roles.NewSupporterRoleId, Roles.BotCreatorRoleId, Roles.ChiefBotCreatorRoleId, Roles.ChiefSupporterRoleId];
                for(const id of message.channel.permissionOverwrites.cache.filter(p => p.type == "member" && p.allow.has("SEND_MESSAGES")).map(m => m.id).filter(m=> {
                    let member = message.guild.members.cache.get(m)
                    //filter only members who are not SUPPORTERS
                    if(member && 
                       member.roles.highest.rawPosition >= message.guild.roles.cache.get(Roles.NewSupporterRoleId).rawPosition && 
                       notallowed.some(id => member.roles.highest.rawPosition <= message.guild.roles.cache.get(id).rawPosition)
                    ) {
                        if(client.setups.has(message.channel.id) && client.setups.get(message.channel.id, "user") == m) return false;
                        else return m;
                    }
                    else return false;
                }).filter(Boolean)) {
                    await message.channel.permissionOverwrites.edit(id, {
                        SEND_MESSAGES: false,
                    }).catch(() => {});
                    //wait a bit
                    await delay(client.ws.ping);
                }
                await message.channel.permissionOverwrites.edit(Roles.ModRoleId, {
                    SEND_MESSAGES: true,
                }).catch(() => {});
                //Send Approve Message
                m.edit(`👍 **Mods & Admins are contacted, let's wait for their Response!**`)
            })
            message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            }).catch((e) => {
                console.log(e);
                message.reply(":x: **Could not rename the Channel...**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            })
        } else if (cmd === "setwaiting") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            var { name } = message.channel;
            var emoji = "⏳";
            if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
            if(!client.setups.has(message.channel.id)) return message.reply(":x: **Could not find the Ticket Opener in the Database**");
            let id = client.setups.get(message.channel.id, "user")
            
            message.delete().catch(()=>{});
            message.channel.send(`***Hello <@${id}>!***\n\n> *Please answer until <t:${Math.floor((Date.now() + 8.64e7) / 1000)}:F>, then this Ticket will be closed automatically!*\n\n**Kind Regards,**\n> Nexuss Development`)
            client.setups.push("todelete", {
                channel: message.channel.id,
                timestamp: Date.now(),
                time: 8.64e7,
            }, "tickets");

            message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            }).catch((e) => {
                console.log(e);
                message.reply(":x: **Could not rename the Channel...**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            })
        } else if (cmd === "setfinished") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            var { name } = message.channel;
            var emoji = "✅";
            if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
            if(!client.setups.has(message.channel.id)) return message.reply(":x: **Could not find the Ticket Opener in the Database**");
            let id = client.setups.get(message.channel.id, "user")
            
            message.delete().catch(()=>{});
            message.channel.send({
                components: [
                    new MessageActionRow().addComponents([
                        new MessageButton().setStyle("SUCCESS").setLabel("Close the Ticket").setCustomId("closeticket").setEmoji(`<a:check:964989203656097803>`),
                        new MessageButton().setStyle("DANGER").setLabel("Keep it open!").setCustomId("dontcloseticket").setEmoji('❌'),
                    ])
                ],
                content:`***Hello <@${id}>!***\n\n> *Our Task is done! If you want to close/don't close this Ticket, simply react to this message, otherwise it will automatically be closed at <t:${Math.floor((Date.now() + 12.96e7) / 1000)}:F> !*\n\n**Kind Regards,**\n> Nexuss Development`})
            client.setups.push("todelete", {
                channel: message.channel.id,
                timestamp: Date.now(),
                time: 12.96e7,
            }, "tickets");

            message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            }).catch((e) => {
                console.log(e);
                message.reply(":x: **Could not rename the Channel...**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            })
        } else if (cmd === "setbot") {
            if(!isValidTicket(message.channel)) return message.reply("❌ This Channel is not a Ticket!");
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.SupporterRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only Supporters or Higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            var { name } = message.channel;
            var emoji = "💠";
            if(name.includes(emoji)) return message.reply(`:x: **This Channel is already defined as \`${cmd}\`**`)
            console.log("SETBOT");
            message.reply(`👍 **Dear <@&${Roles.BotCreatorRoleId}>!**\n> *<The Customer is waiting for his bot to be created!>*`)
            message.channel.setName(`${name.slice(0, name.indexOf("│") - 1)}${emoji}${name.slice(name.indexOf("│"))}`).catch((e) => {
                message.reply("❌ **Something went wrong, maybe ratelimited..**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            }).catch((e) => {
                console.log(e);
                message.reply(":x: **Could not rename the Channel...**").then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 3000);
                })
            })
        } 
        
        /**
         * BOT / SERVER MANAGEMENT COMMANDS
         */
        else if (cmd === "botmanagement" || cmd == "bm") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS)");

            let serverid = String(args[0])?.split(",")[0];
            let option1 = String(args[1]);
            let option2 = String(args[2]);
            if (!option1 || !serverid) return message.reply(`> ❌ Usage: \`,botmanagement <serverid> <start/restart/stop/delete/show/list/startall/stopall/search> [PM2-ID/BOTNAME]\`\n\n> [PM2-ID] ... is for start, stop, restart, **e.g:** \`,botmanagement 9 restart 13\`\n\n> [BOTNAME] ... is for search, **e.g:** \`,botmanagement search wing\`\n\n> Possible serverids are: ${Object.keys(servers).sort((a, b) => b - a).map(d => `\`${d}\``).join(", ")}`)
            option1 = option1.toLowerCase();
            if (option2.toLowerCase() == `all`) return message.reply(`> ❌ **PM2-ID/BOTNAME may not be \`ALL\`**`)


            let {
                servers,
                usernames,
                passwords
            } = client.config;
            let theserver = servers[String(serverid)];
            let theusername = usernames[String(serverid)];
            let thepassword = passwords[String(serverid)];
            if (serverid != `search` && ![`start`, `restart`, `stop`, `show`, `list`, `startall`, `stopall`, `delete`].includes(option1)) return message.reply(`> ❌ Usage: \`,botmanagement <serverid> <start/restart/stop/show/list/startall/stopall/search> [PM2-ID/BOTNAME]\`\n\n> [PM2-ID] ... is for start, stop, restart, **e.g:** \`,botmanagement 9 restart 69\`\n\n> [BOTNAME] ... is for search, **e.g:** \`,botmanagement search wing\`\n\n> Possible serverids are: ${Object.keys(servers).sort((a, b) => b - a).map(d => `\`${d}\``).join(", ")}`)
            if (serverid != `search` && (!theserver || !theusername || !thepassword)) return message.reply(`❌ **Invalid Server Id added**!\n> Possible serverids are: ${Object.keys(servers).sort((a, b) => b - a).map(d => `\`${d}\``).join(", ")}`)
            let consolecmd = `pm2 ${option1}${option2 ? ` ` + option2 : ``}`;
            if ([`start`, `restart`, `stop`, `show`, `delete`].includes(option1) && !option2) return message.reply(`> ❌ **Missing the BOT ID / NAME** Usage: \`,botmanagement <serverid> <start/restart/stop/show/list/startall/stopall/search> [PM2-ID/BOTNAME]\`\n\n> [PM2-ID] ... is for start, stop, restart, **e.g:** \`,botmanagement 9 restart 69\`\n\n> [BOTNAME] ... is for search, **e.g:** \`,botmanagement search wing\`\n\n> Possible serverids are: ${Object.keys(servers).sort((a, b) => b - a).map(d => `\`${d}\``).join(", ")}`)
            if (option1 == `startall`) consolecmd = `node ${process.cwd()}/startall.js`;
            if (option1 == `stopall`) consolecmd = `pm2 stop all`;
            if (option1 == `restartall`) consolecmd = `pm2 restart all`;
            let tmpmessage = await message.reply(`<a:Loading:945121333333852161> **Loading...**`);
            if (serverid != `search`) {
                const conn = new Client();
                try {
                    conn.on('ready', () => {
                        conn.exec(consolecmd, (err, stream) => {
                            if (err) throw err;
                            let showdata = ``;
                            let suboption = ``;
                            let counter = 0;
                            stream.on('close', (code, signal) => {
                                setTimeout(() => {
                                    sourcebin.create([{
                                        content: String(showdata),
                                        language: 'text',
                                    }], {
                                        title: 'Console Output',
                                        description: `Console Output, by ${message.author.tag}`,
                                    }).then(haste => {
                                        tmpmessage.edit(`<a:check:964989203656097803> **SUCCESSFULLY OUTPUT:**\n> ${haste.short ? haste.short : haste.url}`)
                                    }).catch(e => {
                                        tmpmessage.edit(`❌ \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey);
                                    });
                                    conn.exec("pm2 save", (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            conn.end();
                                        }).on('data', (data) => { 

                                        }).stderr.on('data', (data) => {

                                        });
                                    })
                                }, 350)
                            }).on('data', (data) => {
                                if (option1 == "startall") {
                                    counter++;
                                    suboption += data + "\n";
                                }
                                if (counter == 2 && option1 == "startall") {
                                    tmpmessage.reply(`\`\`\`${String(suboption).substr(0, 1900)}\`\`\``);
                                    suboption = "";
                                    counter = 0;
                                }
                                showdata += data + "\n";
                            }).stderr.on('data', (data) => {
                                showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                            });
                        });
                    }).connect({
                        host: theserver,
                        port: 22,
                        username: theusername,
                        password: thepassword
                    });
                } catch (e) {
                    tmpmessage.edit(`❌ \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                }
            } else {
                try {
                    let alldata = "";
                    let counter = 0;
                    for (const [key, value] of Object.entries(servers)) {
                        try {
                            await connect(key, value);
                            await delay(100);
                        } catch (e){
                            message.reply(`❌ **Failed on Host: \`${key}\`!** \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                        }
                        counter++;
                        if (counter == Object.keys(servers).length) break;
                    }
                    async function connect(key, value) {
                        return new Promise((res, rej) => {
                            try {
                                const conn = new Client();
                                conn.on('ready', () => {
                                    conn.exec(`pm2 list`, (err, stream) => {
                                        if (err) throw err;
                                        let showdata = "";
                                        stream.on('close', (code, signal) => {
                                            for (let d of String(showdata).split("\n")) {
                                                d = d
                                                    .replace("│ fork    │", "").replace("fork", "")
                                                    .replace("│ default     │", "").replace("default", "")
                                                    .replace("│ disabled |", "").replace("disabled", "")
                                                    .replace("│ root     |", "").replace("root", "")
                                                    .replace("│ NotSaksh   |", "").replace("NotSaksh", "")
                                                    .replace("│  │", "").replace("5.0.2", "").split("│").map(i => String(i).trim());
                                                alldata += `SERVER: #${key != 155 ? key : 204} | BOTID: #${d[1]} | NAME: ${String(d[2]).split(" ")[String(d[2]).split(" ").findIndex(d => d.includes("_"))]} | STATE: ${d[5]}\n`;
                                            }
                                            conn.end();
                                            res(true);
                                        }).on('data', (data) => {
                                            showdata += data + "\n";
                                        }).stderr.on('data', (data) => {
                                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                                        });
                                    });
                                }).on("error", (e) => {
                                    rej(e)
                                })
                                .connect({
                                    host: value,
                                    port: 22,
                                    username: usernames[key],
                                    password: passwords[key]
                                })
                            } catch (e){
                                rej(e);
                            }
                        })
                    }
                    let result = "";
                    for (let data of String(alldata).split("\n")) {
                        if (data.toLowerCase().includes(option1.toLowerCase())) {
                            result += `${data}\n`;
                        }
                    }
                    if (!result || result.length < 1) {
                        result = "> ❌ **NOTHING FOUND FOR:**" + option1.toLowerCase();
                        sourcebin.create([{
                            content: String(alldata),
                            language: 'text',
                        }], {
                            title: 'Console Output',
                            description: `Console Output, by ${message.author.tag}`,
                        }).then(haste => {
                            tmpmessage.edit(`${result}\n\n> <a:check:964989203656097803> **COMPELETE OUTPUT:**\n> ${haste.short ? haste.short : haste.url}`)
                        }).catch(e => {
                            tmpmessage.edit(`${result}\n\n> ❌ \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                            console.log(e.stack ? String(e.stack).grey : String(e).grey);
                        });
                    } else {
                        sourcebin.create([{
                            content: String(result),
                            language: 'text',
                        }], {
                            title: 'Console Output',
                            description: `Console Output, by ${message.author.tag}`,
                        }).then(haste => {
                            tmpmessage.edit(`<a:check:964989203656097803> **SEARCH SUCCESSFULL (LOOK ATTACHMENT)**\n\n> <a:check:964989203656097803> **SEARCH RESULT OUTPUT:**\n> ${haste.short ? haste.short : haste.url}`)
                        }).catch(e => {
                            // Handle error
                            tmpmessage.edit(`<a:check:964989203656097803> **SEARCH SUCCESSFULL (LOOK ATTACHMENT)**\n\n> ❌ \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                            console.log(e.stack ? String(e.stack).grey : String(e).grey);
                        });
                    }

                } catch (e) {
                    tmpmessage.edit(`❌ \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                }
            }
        } else if (cmd === "recoverbothost") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.AdminRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS & Co-Owners)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the User ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                
                if(!theserver) return message.reply("❌ Could not find the Server");
                let theusername = usernames["6"];
                let thepassword = passwords["6"];
                let failed = false;
                const conn = new Client();
                
                try {
                    conn.on('ready', () => {
                        console.log(`cd '${path}'`);
                        conn.exec(`cd '${path}'; pm2 start ecosystem.config.js`, (err, stream) => {
                            if (err) return console.log(err);
                            if(failed){
                                console.log(err);
                                return conn.end();
                            }
                            stream.on('close', (code, signal) => {
                                if(failed){
                                    return conn.end();
                                }
                                setTimeout(() => {
                                    conn.exec("pm2 save", (err, stream) => {
                                        if (err) return console.log(err);
                                        stream.on('close', (code, signal) => {
                                            message.reply(`👍 **Recovered the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``);
                                            conn.end();
                                        }).on('data', (data) => { 

                                        }).stderr.on('data', (data) => {

                                        });
                                    })
                                }, 250);
                            }).on('data', (data) => { 

                            }).stderr.on('data', (data) => {
                                if(data && data.toString().length > 1){
                                    console.log(data.toString());
                                    failed = true;
                                    return message.reply("❌ This Bot Path is not existing")
                                }
                            });
                        })
                    }).connect({
                        host: theserver,
                        port: 22,
                        username: theusername,
                        password: thepassword
                    });
                } catch (e) {
                    tmpmessage.edit(`❌ \`\`\`js` + `${e.message ? e.message : e}`.substr(0, 1900) + `\`\`\``)
                }
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "removebothost") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata)

                                    logAction(client, "botmanagement", message.author, `RED`, `https://cdn.discordapp.com/emojis/774628197370560532.gif`, `👍 **Removed the Bot-Host of:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 delete ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Removed the Bot-Host of:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to remove the Bot from the Hosting the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "noguildremovebothost") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.FounderId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only FOUNDERS)");
                
                return message.reply("❌**This Command is currently not available;**") 
        } 
        
        else if (cmd === "startbot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.AdminRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS & Co-Owners)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                if(showdata.includes("online")) return message.reply("❌ **This Bot is already started/online!**");
                                if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata);

                                    logAction(client, "botmanagement", message.author, `#57F287`, `https://cdn.discordapp.com/emojis/862306785007632385.png`, `👍 **Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 start ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Start the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "forcestartbot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep ${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                //if(showdata.includes("online")) return message.reply("❌ **This Bot is already started/online!**");
                                //if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata);

                                    logAction(client, "botmanagement", message.author, `#57F287`, `https://cdn.discordapp.com/emojis/862306785007632385.png`, `👍 **Force-Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 start ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Force-Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Force-Start the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "restartbot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.AdminRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS & Co-Owners)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                console.log(servers["6"])
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                if(!showdata.includes("online")) return message.reply("❌ **This Bot is not started/online!**");
                                if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata);

                                    logAction(client, "botmanagement", message.author, `BLURPLE`, `https://cdn.discordapp.com/emojis/870013191965519942.png`, `👍 **Re-Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 restart ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Re-Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Re-Start the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "forcerestartbot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                //if(!showdata.includes("online")) return message.reply("❌ **This Bot is not started/online!**");
                                //if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata);

                                    logAction(client, "botmanagement", message.author, `BLURPLE`, `https://cdn.discordapp.com/emojis/870013191965519942.png`, `👍 **Force-Re-Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 restart ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Force-Re-Started the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Force-Re-Start the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "stopbot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.AdminRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS & Co-Owners)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                if(showdata.includes("stopped")) return message.reply("❌ **This Bot is already stopped!**");
                                if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata)

                                    logAction(client, "botmanagement", message.author, `#00001`, `https://cdn.discordapp.com/emojis/862306785133592636.png`, `👍 **Stopped the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 stop ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Stopped the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Stop the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "stopfreebots") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.FounderId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only FounderId)");
            try {
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let server = args[0]
                let theserver = servers["6"];
                if(!server) {
                    return message.reply("❌ Please provide which server to check!")
                }
                if(!theserver) return message.reply("❌ Could not find the Server for the Bots to stop");
                
                // ALl Bots payed via invite payment on this host
                let normalbots = client.payments.get("payments", "users").map(d => d.bot).filter(Boolean);
                let invitedata = client.payments.get("invitepayments", "users").map(d => d.bot).filter(Boolean);
                invitedata = invitedata.filter(d => !normalbots.includes(d))
                    .filter(id => {
                        client.bots.ensure(id, {
                            info: "No Info available",
                            type: "Default"
                        })
                        return Number(client.bots.get(id, "info")?.toString()?.split("\n")?.[6]?.split(",")?.[0]) == Number(args[0])
                    })
                    .map(d => {
                        let data = client.bots.get(d, "info");
                        let path = data.toString().split("\n")[2];
                        return {
                            id: d,
                            data: data,
                            path: data.toString().split("\n")[2],
                            BotFileName: path.split("/")[path.split("/").length - 1]
                        }
                    });
                //current Server
                var conn = new Client();
                conn.on('ready', async () => {
                    async function trytostopbot(botdata) {
                        return new Promise((res) => {
                            conn.exec(`pm2 list | grep '${botdata.BotFileName}' --ignore-case`, (err, stream) => {
                                if (err) throw err;
                                let showdata = "";
                                stream.on('close', (code, signal) => {
                                    setTimeout(()=>{
                                        if(!showdata || showdata.length < 2) {return res(true);}
                                        alldata = showdata.toString().split(" ")[1]
                                        if(alldata){
                                            let botid = parseInt(alldata)

                                            logAction(client, "botmanagement", message.author, `#00001`, `https://cdn.discordapp.com/emojis/862306785133592636.png`, `👍 **Stopped the Bot:** <@${botdata.id}>\n**Path:** \`${botdata.path}\`\n**Host:** \`${server}\``)
                                            
                                            conn.exec(`pm2 delete ${botid}`, (err, stream) => {
                                                if (err) throw err;
                                                stream.on('close', (code, signal) => {
                                                    setTimeout(() => {
                                                        message.reply(`👍 **Stopped the Bot:** <@${botdata.id}> (\`${botid}\`)\n**Path:** \`${botdata.path}\`\n**Host:** \`${server}\``)
                                                        return res(true);
                                                    }, 250)
                                                }).on('data', (data) => {
                                                }).stderr.on('data', (data) => {
                                                    if(data && data.toString().length > 2) {
                                                        console.log(data.toString());
                                                        message.reply(`❌ **Something went wrong (Pm2 delete)!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                    }
                                                });
                                            });
                                        } else {
                                            message.reply(`❌ **Unable to Stop the Bot:** <@${botdata.id}>`)
                                            return res(true);
                                        }
                                    }, 300)
                                }).on('data', (data) => {
                                    showdata += data + "\n";
                                }).stderr.on('data', (data) => {
                                    showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                                });
                            });

                        })
                    }
                    for(const botdata of invitedata) {
                        console.log(`Stopping The BOT`)
                        console.log({id: botdata.id,path: botdata.path,BotFileName: botdata.BotFileName})
                        await trytostopbot(botdata);
                    }
                    message.reply("FINISHED");
                    conn.end();
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames[args[0]],
                    password: passwords[args[0]]
                });
                //new Server
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "migratebot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.FounderId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only FounderId)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1];
                if(!path.endsWith("/")) path = `${path}/`;
                const newpath = path.replace(BotFileName, `Migrated_${BotFileName}`);
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                args.shift();
                let theserver = servers["6"];
                if(!args[0]) {
                    return message.reply("❌ Please provide which server to migrate the bot to!")
                }
                let newtheserver = servers[args[0]];
                if(!theserver) return message.reply("❌ Could not find the Server for the Bot");
                if(!newtheserver) return message.reply("❌ Could not find the Server for: " + args[0]);
                //current Server
                var conn = new Client();
                let tmpmsg = await message.reply(`👍 **Attempting to build connection to the V-SERVER of the BOT** ...`)
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                if(showdata.includes("stopped")) return message.reply("❌ **This Bot is already stopped!**");
                                if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata)

                                    logAction(client, "botmanagement", message.author, `#00001`, `https://cdn.discordapp.com/emojis/862306785133592636.png`, `👍 **Stopped the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 delete ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save", (err, stream) => {
                                                    stream.on('close', async (code, signal) => {
                                                        let msgstring = `👍 **Stopped the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``
                                                        tmpmsg = await tmpmsg.edit(`${msgstring}\n> *Now transferring the Bot*`)
                                                        
                                                        
                                                        // 
                                                        conn.exec(`rsync -rav -e "sshpass -p '${passwords[args[0]]}' ssh -o StrictHostKeyChecking=no" --progress ${path} ${usernames[args[0]]}@${newtheserver}:${newpath}`, (err, stream) => {
                                                            stream.on('close', async (code, signal) => {
                                                                msgstring = `${msgstring}\n\n👍 **Transferred the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${newpath}\`\n**Host:** \`${newtheserver}\``;
                                                                tmpmsg = await tmpmsg.edit(`${msgstring}\n> *Now starting the Bot*`)
                                                                
                                                                conn.end();
                                                                
                                                                // Start it on the new host
                                                                setTimeout(() => {
                                                                    var conn = new Client();
                                                                    conn.on('ready', () => {
                                                                        conn.exec(`cd '${newpath}'; pm2 start ecosystem.config.js`, (err, stream) => {
                                                                            if (err) return console.log(err);
                                                                            
                                                                            stream.on('close', (code, signal) => {
                                                                               
                                                                                setTimeout(() => {
                                                                                    conn.exec("pm2 save", (err, stream) => {
                                                                                        if (err) return console.log(err);
                                                                                        stream.on('close', async (code, signal) => {
                                                                                            tmpmsg = await tmpmsg.edit(`${msgstring}\n\n👍 **Started & Fully Migrated the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${newpath}\`\n**Host:** \`${newtheserver}\``);
                                                                                            client.bots.set(user.id, data.replace(BotFileName, `Migrated_${BotFileName}`).replace(server, args[0]), "info");
                 
                                                                                            conn.end();
                                                                                        }).on('data', (data) => { 

                                                                                        }).stderr.on('data', (data) => {

                                                                                        });
                                                                                    })
                                                                                }, 250);
                                                                            }).on('data', (data) => { 

                                                                            }).stderr.on('data', (data) => {
                                                                                if(data && data.toString().length > 1){
                                                                                    console.log(data.toString());
                                                                                    failed = true;
                                                                                    return message.reply("❌ This Bot Path is not existing")
                                                                                }
                                                                            });
                                                                        })
                                                                    }).connect({
                                                                        host: newtheserver,
                                                                        port: 22,
                                                                        username: usernames[args[0]],
                                                                        password: passwords[args[0]]
                                                                    });

                                                                }, 1000)
                                                                // End of starting on the new host

                                                            }).on('data', (data) => {
                                                            }).stderr.on('data', (data) => {
                                                                function isAddHost(string) {
                                                                    return string.includes("permanently") && string.includes("hosts")&& string.includes("hosts")
                                                                }
                                                                if(data && data.toString().length > 2 && !isAddHost(data.toString().toLowerCase())) {
                                                                    console.log(data.toString());
                                                                    message.reply(`❌ **Something went wrong (RSYNC)!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                                }
                                                            });
                                                        })
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong (pm2 save)!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong (pm2 delete)!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Stop the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
                //new Server
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "forcestopbot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
                return message.reply("❌ You are not allowed to execute this Command! (Only OWNERS)");
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data || data.type == "Default") throw "E";
                let server = data.toString().split("\n")[6].split(",")[0];
                let path = data.toString().split("\n")[2];
                let BotFileName = path.split("/")[path.split("/").length - 1]
                let {
                    servers,
                    usernames,
                    passwords
                } = client.config;
                let theserver = servers["6"];
                if(!theserver) return message.reply("❌ Could not find the Server");
                let alldata = false;
                const conn = new Client();
                conn.on('ready', () => {
                    conn.exec(`pm2 list | grep '${BotFileName}' --ignore-case`, (err, stream) => {
                        if (err) throw err;
                        let showdata = "";
                        stream.on('close', (code, signal) => {
                            setTimeout(()=>{
                                if(!showdata || showdata.length < 2) return message.reply("❌ **Could not find the Bot as a hosted bot!**");
                                //if(showdata.includes("stopped")) return message.reply("❌ **This Bot is already stopped!**");
                                //if(showdata.includes("errored")) return message.reply("❌ **This Bot has got an error while hosting!**");
                                alldata = showdata.toString().split(" ")[1]
                                if(alldata){
                                    let botid = parseInt(alldata)

                                    logAction(client, "botmanagement", message.author, `#00001`, `https://cdn.discordapp.com/emojis/862306785133592636.png`, `👍 **Force-Stopped the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                    
                                    conn.exec(`pm2 stop ${botid}`, (err, stream) => {
                                        if (err) throw err;
                                        stream.on('close', (code, signal) => {
                                            setTimeout(() => {
                                                conn.exec("pm2 save\`", (err, stream) => {
                                                    stream.on('close', (code, signal) => {
                                                        message.reply(`👍 **Force-Stopped the Bot:** ${user} | ${user.tag} (\`${user.id}\`)\n**Path:** \`${path}\`\n**Host:** \`${server}\``)
                                                        conn.end();
                                                    }).on('data', (data) => {
                                                    }).stderr.on('data', (data) => {
                                                        if(data && data.toString().length > 2) {
                                                            console.log(data.toString());
                                                            message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                                        }
                                                    });
                                                })
                                            })
                                        }).on('data', (data) => {
                                        }).stderr.on('data', (data) => {
                                            if(data && data.toString().length > 2) {
                                                console.log(data.toString());
                                                message.reply(`❌ **Something went wrong!**\n\`\`\`${data.toString().substr(0, 1800)}\`\`\``)
                                            }
                                        });
                                    });
                                } else {
                                    return message.reply(`❌ **Unable to Force-Stop the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`)
                                }
                            }, 300)
                        }).on('data', (data) => {
                            showdata += data + "\n";
                        }).stderr.on('data', (data) => {
                            showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                        });
                    });
                }).connect({
                    host: theserver,
                    port: 22,
                    username: usernames["6"],
                    password: passwords["6"]
                });
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } 
        
        /**
         * OWNER BOT DATABASING COMMANDS
         */
        else if (cmd === "bots" || cmd === "wallet") {
            var user;
            try {
                user = await GetUser(message, args);
            } catch (e) {
                return message.reply(e)
            }
            if (!user || !user.id) return message.reply("❌ Did not find the User ... ERROR")
            client.bots.ensure(user.id, {
                bots: []
            })
            var bots = client.bots.get(user.id, "bots")
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(`${user.username}'s Bots`, user.displayAvatarURL({
                        dynamic: true
                    }), "https://discord.gg/Nexuss")
                    .setDescription(bots.length > 0 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}> | [Invite](https://discord.com/oauth2/authorize?client_id=${bot}&scope=bot&permissions=8)`).join("\n") : "He has no Bots yet!")
                    .setTimestamp()
                ]
            })
        } else if (cmd === "botdetails" || cmd === "botdetail" || cmd == "botinfo") {
            try {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    return message.reply("ERROR:" + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the Bot ... ERROR")
                client.bots.ensure(user.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(user.id, "info");
                if (!data) throw "E";
                if (!String(data).endsWith("`")) data += "```";
                if (!String(data).startsWith("`") && !String(data).startsWith(">")) data = "```" + data;
                message.channel.send(data);
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("❌ There is no detail Data about this Bot :c")
            }
        } else if (cmd === "setneworiginalbot" || cmd == "setbotdetails") {
           if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition)
           return message.reply("❌ You are not allowed to execute this Command!");
           let Bot = message.mentions.members.filter(m => m.user.bot).first();
            if (!Bot) return message.reply("Usage: `,setneworiginalbot @BOT <message>`")
            client.bots.set(Bot.id, args.slice(1).join(" "), "info")
            message.channel.send("SUCCESS!")
        } else if (cmd === "owner" || cmd === "ownerof") {
            var bot;
            try {
                bot = await GetBot(message, args);
            } catch (e) {
                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                return message.reply("ERROR:" + e)
            }
            if (!bot || !bot.id || !bot.bot) return message.reply("❌ Did not find the BOT ... ERROR / user is not a bot")
            var userid = client.bots.findKey(valu => valu.bots?.includes(bot.id))
            if (!userid) return message.reply("❌ **No one Owns this Bot yet!**")
            var user = await client.users.fetch(userid).catch(() => {})
            if (!user) return message.reply(`❌ **Could not find the User of this Bot in here ... this is his/her ID: \`${userid}\`**`)
            client.bots.ensure(user.id, {
                bots: []
            })
            var bots = client.bots.get(user.id, "bots")
            let embed = new Discord.MessageEmbed()
                .setColor(client.config.color)
                .setAuthor(`${user.username} owns this bot and: `, user.displayAvatarURL({
                    dynamic: true
                }), "https://discord.gg/Nexuss")
                .setDescription(bots.length > 0 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}> | [Invite](https://discord.com/oauth2/authorize?client_id=${bot}&scope=bot&permissions=8)`).join("\n") : "He has no Bots yet!")
                .setTimestamp().setFooter("ID: " + user.id, user.displayAvatarURL({
                    dynamic: true
                }));
            message.reply({
                content: "OWNER INFORMATION",
                embeds: [embed]
            })
        } else if (cmd === "addbot" || cmd === "addwallet") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) return message.reply("You are not allowed to execute that Command!")
            var user;
            try {
                user = await GetUser(message, args);
            } catch (e) {
                return message.reply(e)
            }
            if (!user || !user.id) return message.reply("❌ Did not find the USER ... ERROR | Usage: `,addbot @USER @BOT BOTTYPE`")
            var bot = message.mentions.users.last();
            if (!bot || !bot.id || !bot.bot) return message.reply("❌ Did not find the Bot ... ERROR / Pinged User is not a BOT | Usage: `,addbot @USER @BOT BOTTYPE`")
            if (!args[2]) return message.reply("❌ You forgot to add the BOTTYPE (System Bot, Waitingroom Bot ....) | Usage: `,addbot @USER @BOT BOTTYPE`")
            client.bots.ensure(user.id, {
                bots: []
            })

            //if (client.bots.get(user.id, "bots").includes(bot.id)) return message.reply("❌ He already has that bot!")
            client.bots.set(bot.id, args.slice(2).join(" "), "type")
            var bots = client.bots.push(user.id, bot.id, "bots")

            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(`SUCCESS!`, user.displayAvatarURL({
                        dynamic: true
                    }), "https://discord.gg/Nexuss")
                    .setDescription(`Added: <@${bot.id}> | [Invite](https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=8) to <@${user.id}>`)
                    .setTimestamp()
                ]
            })
        } else if (cmd === "changebot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) return message.reply("You are not allowed to execute that Command!")
            var user;
            try {
                user = await GetUser(message, args);
            } catch (e) {
                return message.reply(e)
            }
            if (!user || !user.id) return message.reply("❌ Did not find the USER ... ERROR | Usage: `,changebot @USER @BOT BOTTYPE`")
            var bot = message.mentions.users.last();
            if (!bot || !bot.id || !bot.bot) return message.reply("❌ Did not find the Bot ... ERROR / Pinged User is not a BOT | Usage: `,changebot @USER @BOT BOTTYPE`")
            if (!args[2]) return message.reply("❌ You forgot to add the BOTTYPE (System Bot, Waitingroom Bot ....) | Usage: `,changebot @USER @BOT BOTTYPE`")
            client.bots.ensure(user.id, {
                bots: []
            })
            var olduser = false;
            try {
                var userid = client.bots.findKey(valu => valu.bots?.includes(bot.id))
                olduser = await client.users.fetch(userid)
                client.bots.ensure(olduser.id, {
                    bots: []
                })
                client.bots.remove(olduser.id, bot.id, "bots")
            } catch (E) {
                olduser = false;
                client.bots.ensure(user.id, {
                    bots: []
                })
            }

            client.bots.set(bot.id, args.slice(2).join(" "), "type")
            var bots = client.bots.push(user.id, bot.id, "bots")

            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(`SUCCESS!`, user.displayAvatarURL({
                        dynamic: true
                    }), "https://discord.gg/Nexuss")
                    .setDescription(`Changed: <@${bot.id}> | [Invite](https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=8) to <@${user.id}> ${olduser ? olduser.id != user.id ? `from <@${olduser.id}>` : "" : ""}`)
                    .setTimestamp()
                ]
            })
        } else if (cmd === "removebot") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) return message.reply("You are not allowed to execute that Command!")
            var user;
            try {
                user = await GetUser(message, args);
            } catch (e) {
                return message.reply(e)
            }
            if (!user || !user.id) return message.reply("❌ Did not find the Bot ... ERROR | Usage: `,removebot @USER @BOT`")
            var bot = message.mentions.users.last();
            if (!bot || !bot.id || !bot.bot) return message.reply("❌ Did not find the Bot ... ERROR / Pinged User is not a BOT | Usage: `,removebot @USER @BOT`")
            client.bots.ensure(user.id, {
                bots: []
            })
            if (!client.bots.get(user.id, "bots").includes(bot.id)) return message.reply("❌ He does not have that bot yet!")
            var bots = client.bots.remove(user.id, bot.id, "bots")

            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(`SUCCESS!`, user.displayAvatarURL({
                        dynamic: true
                    }), "https://discord.gg/Nexuss")
                    .setDescription(`Removed: <@${bot.id}> | [Invite](https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=8) from <@${user.id}>`)
                    .setTimestamp()
                ]
            })
        } 
        
        /**
         * INFORMATION COMMANDS
         */
        else if (cmd === "howtoorder") {
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor("Nexuss | Free Bots Shop | How to Order", message.guild.iconURL({dynamic: true}), "https://discord.gg/Nexuss")
                    .setDescription(`1. Read throug the channel in <#840354600463761468>\n\n2. React to the message of <#840331856624615424> with the right Emojis\n\n3. Answer the Questions in the Ticket\n\n4. Wait a few Minutes :wink:`)
                    .setFooter("Nexuss.me | Order Free Bots NOW", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                    .setThumbnail("https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                ]
            })
        } else if (cmd === "modifybot") {
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor("How to Change your Bot?", message.guild.iconURL({dynamic: true}), "https://discord.gg/Nexuss")
                    .setDescription(`**There are several options:**\n> To change the Embed Design, you need to use the command\n> \`!setup-embed\`\n\n> To change the Avatar, Name, etc. you need to use the:\n> \`changename\`, \`changeavatar\`, \`changestatus\`, \`prefix\``)
                    .setFooter("Nexuss.me | Order Free Bots NOW", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                    .setThumbnail("https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                ]
            })
        } else if (cmd === "howtopay") {
                message.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor(client.config.color)
                        .setAuthor("Nexuss | Free Bots Shop | How to Pay", message.guild.iconURL({dynamic: true}), "https://discord.gg/Nexuss")
                        .setDescription(`1. Either go to [Bero-Host](https://bero-host.de/spenden/i8iywavcwmob) or to [Paypal](https://www.paypal.com/paypalme/simonNotSaksh).\n\n2. Enter the amount of money, which is required for your Bot.\n(**We only accept €**)\n\n3. Send a prove, that you paid in your ticket.\n\n4. Wait for **NotSaksh** to verify your payment.`)
                        .setFooter("Nexuss.me | Order Free Bots NOW", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                        .setThumbnail("https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                    ]
                })
            
        } else if (cmd === "sendmessage") {
            message.reply({
                content: `This embed can be created via this Command: \`\`\`!embed To send a message there are several options!++All available Commands:\n\`embed\`, \`esay\`, \`say\`, \`imgembed\`, \`image\`\n\nYou always need to add Paramters, for example the embed: \`embed TITLE ++ DESCRIPTION\` it is important to add the "++"!\nthe esay: \`esay TEXT\`\n\n**You can also edit, copy and update messages with**\n\`editembed <ID>++<TITLE>++<DESCRIPTION>\`\n\`editimgembed <ID>++<TITLE>++<IMG-LINK>++<DESCRIPTION>\`\n\`updatemessage #chat <ID>\`\n\`copymessage #chat <ID>\`!\`\`\``,
                embeds: [new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle("To send a message there are several options!")
                    .setDescription(`All available Commands:\n\`embed\`, \`esay\`, \`say\`, \`imgembed\`, \`image\`\n\nYou always need to add Paramters, for example the embed: \`embed TITLE ++ DESCRIPTION\` it is important to add the "++"!\nthe esay: \`esay TEXT\`\n\n**You can also edit, copy and update messages with**\n\`editembed <ID>++<TITLE>++<DESCRIPTION>\`\n\`editimgembed <ID>++<TITLE>++<IMG-LINK>++<DESCRIPTION>\`\n\`updatemessage #chat <ID>\`\n\`copymessage #chat <ID>\`!`)
                    .setFooter("Nexuss.me | Order Free Bots NOW", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                    .setThumbnail("https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")
                ]
            })
        } else if (cmd === "translate" || cmd === "tr") {
            if (!args[0]) return message.channel.send("❌ Error | Unknown Command Usage! `,translate <from> <to> <Text>`\nExample: `,translate en de Hello World`")

            if (!args[1]) return message.channel.send("❌ Error | Unknown Command Usage! `,translate <from> <to> <Text>`\nExample: `translate en de Hello World`")

            if (!args[2]) return message.channel.send("❌ Error | Unknown Command Usage! `,translate <from> <to> <Text>`\nExample: `,translate en de Hello World`")

            translate(args.slice(2).join(" "), {
                from: args[0],
                to: args[1]
            }).then(res => {
                let embed = new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setAuthor(`Translated to: ${args[1]}`, "https://imgur.com/0DQuCgg.png", "https://discord.gg/Nexuss")
                    .setFooter(`Translated from: ${args[0]}`, message.author.displayAvatarURL({
                        dynamic: true
                    }))
                    .setDescription("```" + res.text.substr(0, 2000) + "```")
                message.channel.send({
                    embeds: [embed]
                })
            }).catch(async err => {
                let embed = new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle("❌ Error | Something went wrong")
                    .setDescription(String("```" + err.stack + "```").substr(0, 2000))
                message.channel.send({
                    embeds: [embed]
                })
                console.log(err);
            });
        } else if (cmd === "ping") {
            message.reply({
                embeds: [new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle(`📶 Ping: \`${Math.round(Date.now() - message.createdTimestamp)}ms\`\n\n📶Api Latency: \`${Math.round(client.ws.ping)}ms\``),
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle(`:white_check_mark: **${client.user.username}** is since ${duration(client.uptime).map(i => `\`${i}\``).join(" ")} online`)
                ]
            })
        } else if (cmd === "uptime") {
            message.reply({
                embeds: [new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle(`:white_check_mark: **${client.user.username}** is since ${duration(client.uptime).map(i => `\`${i}\``).join(" ")} online`),
                    new Discord.MessageEmbed()
                    .setColor(client.config.color)
                    .setTitle(`📶 Ping: \`${Math.round(Date.now() - message.createdTimestamp)}ms\`\n\n📶Api Latency: \`${Math.round(client.ws.ping)}ms\``)
                ]
            })
        } else if (cmd === "info" || cmd == "stats" || cmd == "about" || cmd == "features") {
            if (args[0] && args.join(" ").toLowerCase().includes("cl")) {
                let messagelink = `https://discord.com/channels/964370138356916295/912420703406526464/912422485222379620`;
                let channelId = messagelink.split("/")[5];
                let messageId = messagelink.split("/")[6];
                let Message = await message.channel.send(`<a:Loading:945121333333852161> **Getting Informations about:** ${messagelink}`)
                client.channels.fetch(channelId).then(channel => {
                    channel.messages.fetch(messageId).then(message => {
                        Message.edit({
                            content: `:thumbsup: **Information about \`System Bots\`:** ${messagelink}`,
                            embeds: message.embeds
                        })
                    }).catch(e => {
                        return Message.edit({
                            content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                        })
                    })
                }).catch(e => {
                    return Message.edit({
                        content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                    })
                })

            } else if (args[0] && args.join(" ").toLowerCase().includes("mu")) {
                let messagelink = `https://discord.com/channels/964370138356916295/912420703406526464/912422446106304562`;
                let channelId = messagelink.split("/")[5];
                let messageId = messagelink.split("/")[6];
                let Message = await message.channel.send(`<a:Loading:945121333333852161> **Getting Informations about:** ${messagelink}`)
                client.channels.fetch(channelId).then(channel => {
                    channel.messages.fetch(messageId).then(message => {
                        Message.edit({
                            content: `:thumbsup: **Information about \`Music Bots\`:** ${messagelink}`,
                            embeds: message.embeds
                        })
                    }).catch(e => {
                        return Message.edit({
                            content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                        })
                    })
                }).catch(e => {
                    return Message.edit({
                        content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                    })
                })

            } else if (args[0] && args.join(" ").toLowerCase().includes("wa")) {
                let messagelink = `https://discord.com/channels/964370138356916295/912420703406526464/912422375323230208`;
                let channelId = messagelink.split("/")[5];
                let messageId = messagelink.split("/")[6];
                let Message = await message.channel.send(`<a:Loading:945121333333852161> **Getting Informations about:** ${messagelink}`)
                client.channels.fetch(channelId).then(channel => {
                    channel.messages.fetch(messageId).then(message => {
                        Message.edit({
                            content: `:thumbsup: **Information about \`Waitingroom Bots\`:** ${messagelink}`,
                            embeds: message.embeds
                        })
                    }).catch(e => {
                        return Message.edit({
                            content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                        })
                    })
                }).catch(e => {
                    return Message.edit({
                        content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                    })
                })

            } else if (args[0] && args.join(" ").toLowerCase().includes("ry")) {
                let messagelink = `https://discord.com/channels/964370138356916295/912420703406526464/912422412249870346`;
                let channelId = messagelink.split("/")[5];
                let messageId = messagelink.split("/")[6];
                let Message = await message.channel.send(`<a:Loading:945121333333852161> **Getting Informations about:** ${messagelink}`)
                client.channels.fetch(channelId).then(channel => {
                    channel.messages.fetch(messageId).then(message => {
                        Message.edit({
                            content: `:thumbsup: **Information about \`Rythm Clones\`:** ${messagelink}`,
                            embeds: message.embeds
                        })
                    }).catch(e => {
                        return Message.edit({
                            content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                        })
                    })
                }).catch(e => {
                    return Message.edit({
                        content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                    })
                })

            } else if (args[0] && args.join(" ").toLowerCase().includes("adm")) {
                let messagelink = `https://discord.com/channels/964370138356916295/964370139808141365/944276114988220477`;
                let channelId = messagelink.split("/")[5];
                let messageId = messagelink.split("/")[6];
                let Message = await message.channel.send(`<a:Loading:945121333333852161> **Getting Informations about:** ${messagelink}`)
                client.channels.fetch(channelId).then(channel => {
                    channel.messages.fetch(messageId).then(message => {
                        Message.edit({
                            content: `:thumbsup: **Information about \`Administration Bots\`:** ${messagelink}`,
                            embeds: message.embeds
                        })
                    }).catch(e => {
                        return Message.edit({
                            content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                        })
                    })
                }).catch(e => {
                    return Message.edit({
                        content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                    })
                })

            } else if (args[0] && args.join(" ").toLowerCase().includes("mod")) {
                let messagelink = `https://discord.com/channels/964370138356916295/964370139808141365/944276114988220477`;
                let channelId = messagelink.split("/")[5];
                let messageId = messagelink.split("/")[6];
                let Message = await message.channel.send(`<a:Loading:945121333333852161> **Getting Informations about:** ${messagelink}`)
                client.channels.fetch(channelId).then(channel => {
                    channel.messages.fetch(messageId).then(message => {
                        Message.edit({
                            content: `:thumbsup: **Information about \`Mod Mail Bots\`:** ${messagelink}`,
                            embeds: message.embeds
                        })
                    }).catch(e => {
                        return Message.edit({
                            content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                        })
                    })
                }).catch(e => {
                    return Message.edit({
                        content: `\`\`${e.message ? String(e.message).substr(0, 1900) : String(e).substr(0, 1900)}\`\`\``
                    })
                })
            } else {
                message.reply({
                    content: `**To get more detail Information about our Bot(s) Type:**\n> \`,info <System / Music / Waitingroom / Admin / Rythm / Mod Mail>\``,
                    embeds: [
                        new Discord.MessageEmbed().setColor(client.config.color)
                        .setTitle(`Nexuss Development | Get Free/Cheap Discord Bots for your needs!`)
                        .setDescription(`**If you want to Order a Bot go to <#840354600463761468>**\n> *In there you will find all needed Bot Informations!*\n\nYou can pay via \`Invites\` / \`Donation\`\n> We accept Paypal, Paysafe, Sofort Donations!\n> If you pay via **invites** Then your bot will be hosted for as long as your Invited Members stay in the Server!\n\nWe provide free 24/7 Uptime, and regular Updates as well as **PREMIUM INSTANT SUPPORT!**\n\nFor Help visit <#840332764603351101>\n\nIf you want to request a Feature / If you have an Idea, check out <#840881545086763039>\n\nIf you have to report a Bug, which is not for SELFHOSTING, visit <#853379230683365416>\n\n**Still not convinced?** Check out <#${mainconfig.FeedBackChannelID.toString()}>\nIf you want to get fast Information help, without making a Ticket DM <@889789099899244544>`)
                        .setFooter(`Nexuss Development | Order Today! Order Cheap!`, message.guild.iconURL({
                            dynamic: true
                        }))
                    ]
                })
            }
        } else if (cmd === "invite") {
            if (!args[0]) {
              const user = client.user
              message.reply({
                embeds: [new Discord.MessageEmbed().setColor(client.config.color)
                    .setFooter("Nexuss | Free Bots | ORDER NOW", message.guild.iconURL({dynamic: true}))
                    .setThumbnail(message.guild.iconURL({dynamic: true}))
                    .setTitle("❌ Invalid Usage")
                    .addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions=8)\n`)                ]
            })
            
        } else {
                var user;
                try {
                    user = await GetBot(message, args);
                } catch (e) {
                    return message.reply("ERROR: " + e)
                }
                if (!user || !user.id) return message.reply("❌ Did not find the BOT ... ERROR | Usage: `,invite @Bot` / `,invite BOT NAME` / `,invite BOT ID`")
                message.reply({
                    embeds: [new Discord.MessageEmbed()
                        .setColor(client.config.color)
                        .setAuthor(`Invite link for: ${user.tag}`, user.displayAvatarURL(), `https://discord.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions`)
                        .setThumbnail(user.displayAvatarURL())
                        .setFooter(`ID: ${user.id}`)
                        .addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions=8)`)
                    ]
                })
            }
        } 
        
        /**
         * DEVELOPER COMMAND
         */
        else if (cmd === "eval"){
            if(message.author.id != `${mainconfig.OwnerInformation.OwnerID}`) return message.reply("**❌ Only NotSaksh Is allowed to execute this Command**");
            const { inspect } = require(`util`);
            let evaled;
            try {
                evaled = await eval(args.join(` `));
                let string = inspect(evaled);
                message.channel.send({content :`\`\`\`\n${String(string).substr(0, 1950)}\n\`\`\``});
            } catch (e) {
                console.log(e)
                return message.channel.send({embeds :[new Discord.MessageEmbed()
                    .setColor("RED")
                    .setTitle("Something Went Wrong")
                    .setDescription(`\`\`\`\n${String(e.message ? e.message : e).substr(0, 1950)}\n\`\`\``)
                ]});
            }
        } 
        
        /**
         * MANAGE PAYMENT SYSTEM OF THE BOTS
         */
        else if(cmd === "removepayment"){
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only FCO or higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            let bot = message.mentions.members.filter(u => u.user.bot).first() || message.guild.members.cache.get(args[0]);
            if (!bot || !bot.user || !bot.user.bot) {
                return message.reply("❌ **Please ping a __BOT__**");
            }
            bot = bot.user;
            let normaldata = client.payments.get("payments", "users");
            let invitedata = client.payments.get("invitepayments", "users");
            let boostdata = client.payments.get("boostpayments", "users");
            if(normaldata.find(d => d.bot == bot.id)) client.payments.set("payments", normaldata.filter(d => d.bot !== bot.id), "users")
            if(invitedata.find(d => d.bot == bot.id)) client.payments.set("invitepayments", invitedata.filter(d => d.bot !== bot.id), "users")
            if(boostdata.find(d => d.bot == bot.id)) client.payments.set("boostpayments", boostdata.filter(d => d.bot !== bot.id), "users")
            message.reply(`**Successfully removed all Payments of <@${bot.id}> !**`);
        } else if (cmd === "paymentinfo") {
            let bot = message.mentions.members.filter(u => u.user.bot).first() || message.guild.members.cache.get(args[0]);
            if (!bot || !bot.user || !bot.user.bot) {
                return message.reply("❌ **Please ping a __BOT__**");
            }
            bot = bot.user;
            let normaldata = client.payments.get("payments", "users");
            let invitedata = client.payments.get("invitepayments", "users");
            let boostdata = client.payments.get("boostpayments", "users");
            normaldata = normaldata.find(d => d.bot == bot.id);
            invitedata = invitedata.find(d => d.bot == bot.id);
            boostdata = boostdata.find(d => d.bot == bot.id);
            let userid = client.bots.findKey(v => v?.bots?.includes(bot.id));
            message.reply({
                embeds: [
                    new Discord.MessageEmbed().setColor(client.config.color)
                    .setAuthor(bot.tag, bot.displayAvatarURL())
                    .setTitle(`<:Like:934494916241948763> **Payments of This Bot**`)
                    .setDescription(`Ordered by: <@${userid}>`)
                    .addField(`<a:Money_Price:935490603909799957> **MONEY** Payment`, `${normaldata ? `**Payed at:**\n> \`${moment(normaldata.timestamp).format("DD:MM:YYYY | HH:MM")}\`\n\n**Payed for:**\n> ${duration(normaldata.time).map(i => `\`${i}\``).join(", ")}\n\n**Next Payment in:**\n> ${duration(normaldata.time - (Date.now() - normaldata.timestamp)).map(i => `\`${i}\``).join(", ")}` : "❌ **`Not payed via this Payment`**"}`)
                    .addField(`<:joines:933723116822220821> **INVITE** Payment`, `${invitedata ? `**Payed at:**\n> \`${moment(invitedata.timestamp).format("DD:MM:YYYY | HH:MM")}\`\n\n**Payed for:**\n> ${duration(invitedata.time).map(i => `\`${i}\``).join(", ")}\n\n**Next Payment in:**\n> ${duration(invitedata.time - (Date.now() - invitedata.timestamp)).map(i => `\`${i}\``).join(", ")}` : "❌ **`Not payed via this Payment`**"}`)
                    .addField(`<a:nitro:934488894139944960> **BOOST** Payment`, `${boostdata ? `**Payed at:**\n> \`${moment(boostdata.timestamp).format("DD:MM:YYYY | HH:MM")}\`\n\n**Payed for:**\n> ${duration(boostdata.time).map(i => `\`${i}\``).join(", ")}\n\n**Next Payment in:**\n> ${duration(boostdata.time - (Date.now() - boostdata.timestamp)).map(i => `\`${i}\``).join(", ")}` : "❌ **`Not payed via this Payment`**"}`)
                    .setFooter(`ID: ${bot.id}`, bot.displayAvatarURL())
                ]
            });
        } else if (cmd === "payment") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only FCO or higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            try {
                if (!args[0]) return message.reply("❌ **You forgot to add a VALID TIME!**\nUsage: `,payment 30d @USER @BOT`");
                let time = ms(args[0])
                if (!time || isNaN(time)) return message.reply("❌ **You forgot to add a VALID TIME!**\nUsage: `,payment 30d @USER @BOT`");
                args.shift();
                let member = message.mentions.members.filter(m => m.guild.id == message.guild.id).first() || await message.guild.members.fetch(args[0])
                if (!member || !member.user || member.user.bot) return message.reply("❌ **You forgot to Ping a MEMBER**\nUsage: `,payment 30d @USER @BOT`");
                let user = member.user;
                args.shift()
                let bot = message.mentions.members.filter(m => m.guild.id == message.guild.id && m.user.bot).first() || await message.guild.members.fetch(args[0])
                if (!bot || !bot.user || !bot.user.bot) return message.reply("❌ **You forgot to Ping a BOT**\nUsage: `,payment 30d @USER @BOT`");
                client.bots.ensure(bot.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(bot.id, "info");
                if (!data) return message.reply("❌ **The Bot does not have botdetails yet!**\nUsage: `,payment 30d @USER @BOT`");
                if (!String(data).endsWith("`")) data += "```";
                let normaldata = client.payments.get("payments", "users");
                let invitedata = client.payments.get("invitepayments", "users");
                let boostdata = client.payments.get("boostpayments", "users");
                if(normaldata.find(d => d.bot == bot.id) || invitedata.find(d => d.bot == bot.id) || boostdata.find(d => d.bot == bot.id))
                  return message.reply("❌ This bot is already payed! Use: `,removepayment @Bot` first!")
                client.payments.push("payments", {
                        timestamp: Date.now(),
                        time: time,
                        bot: bot.id,
                        guild: message.guild.id,
                        id: user.id,
                        data: data
                    },
                "users");
                try {
                    message.delete();
                } catch {}
                message.channel.send(`✅ **Successfully Noted This Payment For ${duration(time).map(i => `\`${i}\``).join(" ")} until <t:${Math.floor((Date.now() + time) / 1000)}>, after that I will notify <@${user.id}> to pay for ${bot.user} again!**`);
                client.channels.fetch(`${mainconfig.LoggingChannelID.PaymentLogChannelID}`).then(ch => {
                    ch.send(`${user} payed for ${duration(time).map(i => `\`${i}\``).join(" ")} until <t:${Math.floor((Date.now() + time) / 1000)}> for: **${client.bots.get(bot.id, "type")}** ${bot}`)
                })
            } catch (e) {
                message.channel.send(`${e.message ? e.message : e}`.substr(0, 1900), {
                    code: "js"
                })
            }
        } else if (cmd === "invitepayment") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only FCO or higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            try {
                if (!args[0]) return message.reply("❌ **You forgot to add a VALID TIME!**\nUsage: `,invitepayment 30d @USER @BOT`");
                let time = ms(args[0])
                if (!time || isNaN(time)) return message.reply("❌ **You forgot to add a VALID TIME!**\nUsage: `,invitepayment 30d @USER @BOT`");
                args.shift();
                let member = message.mentions.members.filter(m => m.guild.id == message.guild.id).first() || await message.guild.members.fetch(args[0])
                if (!member || !member.user || member.user.bot) return message.reply("❌ **You forgot to Ping a MEMBER**\nUsage: `,invitepayment 30d @USER @BOT`");
                let user = member.user;
                args.shift()
                let bot = message.mentions.members.filter(m => m.guild.id == message.guild.id && m.user.bot).first() || await message.guild.members.fetch(args[0])
                if (!bot || !bot.user || !bot.user.bot) return message.reply("❌ **You forgot to Ping a BOT**\nUsage: `,invitepayment 30d @USER @BOT`");
                client.bots.ensure(bot.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(bot.id, "info");
                if (!data) return message.reply("❌ **The Bot does not have botdetails yet!**\nUsage: `,invitepayment 30d @USER @BOT`");
                if (!String(data).endsWith("`")) data += "```";
                let normaldata = client.payments.get("payments", "users");
                let invitedata = client.payments.get("invitepayments", "users");
                let boostdata = client.payments.get("boostpayments", "users");
                if(normaldata.find(d => d.bot == bot.id) || invitedata.find(d => d.bot == bot.id) || boostdata.find(d => d.bot == bot.id))
                  return message.reply("❌ This bot is already payed! Use: `,removepayment @Bot` first!")
                client.payments.push("invitepayments", {
                        timestamp: Date.now(),
                        time: time,
                        bot: bot.id,
                        guild: message.guild.id,
                        id: user.id,
                        data: data
                    },
                    "users");

                try {
                    message.delete();
                } catch {}
                message.channel.send(`✅ **Successfully Noted this INVITEPayment for ${duration(time).map(i => `\`${i}\``).join(" ")} until <t:${Math.floor((Date.now() + time) / 1000)}>, after that I will notify <@${user.id}> to pay for ${bot.user} again!**`);
                client.channels.fetch(`${mainconfig.LoggingChannelID.PaymentLogChannelID}`).then(ch => {
                    ch.send(`${user} invite-payed for ${duration(time).map(i => `\`${i}\``).join(" ")} until <t:${Math.floor((Date.now() + time) / 1000)}> for: **${client.bots.get(bot.id, "type")}** ${bot}`)
                })
            } catch (e) {
                message.channel.send(`${e.message ? e.message : e}`.substr(0, 1900), {
                    code: "js"
                })
            }
        } else if (cmd === "boostpayment") {
            if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.ChiefBotCreatorRoleId).rawPosition) {
                return message.reply("❌ **You are not allowed to execute this Command!** Only FCO or higher!").then(m => m.delete({
                    timeout: 3500
                }).catch(console.error)).catch(console.error);
            }
            try {
                if (!args[0]) return message.reply("❌ **You forgot to add a VALID TIME!**\nUsage: `,invitepayment 30d @USER @BOT`");
                let time = ms(args[0])
                if (!time || isNaN(time)) return message.reply("❌ **You forgot to add a VALID TIME!**\nUsage: `,invitepayment 30d @USER @BOT`");
                args.shift();
                let member = message.mentions.members.filter(m => m.guild.id == message.guild.id).first() || await message.guild.members.fetch(args[0])
                if (!member || !member.user || member.user.bot) return message.reply("❌ **You forgot to Ping a MEMBER**\nUsage: `,invitepayment 30d @USER @BOT`");
                if (!member.roles.cache.has(`${mainconfig.BoosterID.toString()}`)) return message.reply("❌ **He is not boosting this Server!**");
                let user = member.user;
                args.shift()
                let bot = message.mentions.members.filter(m => m.guild.id == message.guild.id && m.user.bot).first() || await message.guild.members.fetch(args[0])
                if (!bot || !bot.user || !bot.user.bot) return message.reply("❌ **You forgot to Ping a BOT**\nUsage: `,invitepayment 30d @USER @BOT`");
                client.bots.ensure(bot.id, {
                    info: "No Info available",
                    type: "Default"
                })
                let data = client.bots.get(bot.id, "info");
                if (!data) return message.reply("❌ **The Bot does not have botdetails yet!**\nUsage: `,invitepayment 30d @USER @BOT`");
                if (!String(data).endsWith("`")) data += "```";
                let normaldata = client.payments.get("payments", "users");
                let invitedata = client.payments.get("invitepayments", "users");
                let boostdata = client.payments.get("boostpayments", "users");
                if(normaldata.find(d => d.bot == bot.id) || invitedata.find(d => d.bot == bot.id) || boostdata.find(d => d.bot == bot.id))
                  return message.reply("❌ This bot is already payed! Use: `,removepayment @Bot` first!")
                client.payments.push("boostpayments", {
                        timestamp: Date.now(),
                        time: time,
                        bot: bot.id,
                        guild: message.guild.id,
                        id: user.id,
                        data: data
                    },
                    "users");
                try {
                    message.delete();
                } catch {}
                message.channel.send(`✅ **Successfully Noted this BOOST Payment for ${duration(time).map(i => `\`${i}\``).join(" ")} until <t:${Math.floor((Date.now() + time) / 1000)}>, after that I will notify <@${user.id}> to pay for ${bot.user} again!**`);
                client.channels.fetch(`${mainconfig.LoggingChannelID.PaymentLogChannelID}`).then(ch => {
                    ch.send(`${user} boost-payed for ${duration(time).map(i => `\`${i}\``).join(" ")} until <t:${Math.floor((Date.now() + time) / 1000)}> for: **${client.bots.get(bot.id, "type")}** ${bot}`)
                })
            } catch (e) {
                message.channel.send(`${e.message ? e.message : e}`.substr(0, 1900), {
                    code: "js"
                })
            }
        } 
    });

    //SET WAITING
    client.on("messageCreate", async message => {
        if (!message.guild || message.author.bot || message.guild.id != `${mainconfig.ServerID}`) return;
      if(message.author.bot) return;
        if(!isValidTicket(message.channel)) return
        if(client.setups.has(message.channel.id)) {
            let user = client.setups.get(message.channel.id, "user");
            if(message.author.id == user && client.setups.get("todelete","tickets").find(t => t.channel == message.channel.id)) {
                client.setups.remove("todelete", ch => ch.channel == message.channel.id, "tickets")
                message.reply(`**Thanks For Your Response!**\n> The Staff Team (<@&${Roles.SupporterRoleId}>) will soon answer you!`)
            }
        }
    })

    /**
     *  @STAFF_RANKING SYSTEM
     */
     client.on("messageCreate", (message) => {
        if (!message.guild || message.author.bot) return;
        let allowedcats = [`${mainconfig.VaildCats}`];
        if (message.member.roles.highest.rawPosition >= message.guild.roles.cache.get(`${mainconfig.AllMemberRoles[0]}`).rawPosition || message.member.roles.highest.rawPosition >= message.guild.roles.cache.get(`${mainconfig.AllMemberRoles[1]}`).rawPosition) {
         if (!client.staffrank.has(message.author.id))
          client.staffrank.ensure(message.author.id, {
           createdbots: [/* Date.now() */ ], //show how many bots he creates per command per X Time
                    messages: [ /* Date.now() */ ], //Shows how many general messages he sent
                    tickets: [ /* Date.now() */ ], //shows how many messages he sent in a ticket
                    actualtickets: [ /* { id: "channelid", messages: []}*/ ] //Each managed ticket where they send a message
                })
            if (allowedcats.includes(message.channel.parentId)) {

                //only count Messages, which are no commands
                if (!message.content.trim().startsWith(client.config.prefix)) {
                    if (!client.ticketdata.has(message.channel.id))
                        client.ticketdata.ensure(message.channel.id, {
                            supporters: [ /* { id: "", messages: 0} */ ]
                        })

                    let data1 = client.ticketdata.get(message.channel.id, "supporters");
                    let theTicket1 = data1.find(d => d.id == message.author.id);
                    let theTicketDataIndex1 = data1.findIndex(d => d.id == message.author.id);
                    //ensure it
                    if (!theTicket1) {
                        theTicket1 = {
                            id: message.author.id,
                            messages: 0,
                        }
                    }
                    theTicket1.messages += 1;
                    //add the ticket information
                    if (theTicketDataIndex1 >= 0) data1[theTicketDataIndex1] = theTicket1;
                    else data1.push(theTicket1);
                    //update the db
                    client.ticketdata.set(message.channel.id, data1, "actualtickets");

                    //get datas and indexes
                    let data = client.staffrank.get(message.author.id, "actualtickets");
                    let theTicket = data.find(d => d.id == message.channel.id);
                    let theTicketDataIndex = data.findIndex(d => d.id == message.channel.id);
                    //ensure it
                    if (!theTicket) {
                        theTicket = {
                            id: message.channel.id,
                            messages: [],
                        }
                    }
                    theTicket.messages.push(Date.now());
                    //add the ticket information
                    if (theTicketDataIndex >= 0) data[theTicketDataIndex] = theTicket;
                    else data.push(theTicket);
                    //update the db
                    client.staffrank.set(message.author.id, data, "actualtickets");
                }
            } else {
                //update the db for the staff person
                client.staffrank.push(message.author.id, Date.now(), "messages")
            }
        }
    })
    
}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
function onCoolDown(message, command) {
    const client = message.client;
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name); 
    const cooldownAmount = (command.cooldown || 1) * 1000; 
    if (timestamps.has(message.member.id)) { 
      const expirationTime = timestamps.get(message.member.id) + cooldownAmount;
      if (now < expirationTime) { 
        const timeLeft = (expirationTime - now) / 1000; 
        return timeLeft
      }
      else {
        timestamps.set(message.member.id, now); 
        setTimeout(() => timestamps.delete(message.member.id), cooldownAmount); 
        return false;
      }
    }
    else {
      timestamps.set(message.member.id, now); 
      setTimeout(() => timestamps.delete(message.member.id), cooldownAmount); 
      return false;
    }
}
function formatBytes(bytes, decimals = 3) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}