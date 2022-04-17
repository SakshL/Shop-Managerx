//IMPORTING NPM PACKAGES
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const fs = require('fs')
const ms = require("ms");
const Path = require("path");
const emoji = require("../../emoji")
const {
    MessageActionRow, 
	MessageSelectMenu,
    MessageButton
} = require("discord.js");
let Cooldown = new Map();
const mainconfig = require("../../mainconfig")
const settings = require("../../settings.json");

var CronJob = require('cron').CronJob;
const moment = require("moment");
const Roles = {
    FounderId: `${mainconfig.SeverRoles.FounderId}`,
    OwnerRoleId: `${mainconfig.SeverRoles.OwnerRoleId}`,
    CoOwnerRoleId: `${mainconfig.SeverRoles.CoOwnerRoleId}`,
    ChiefHumanResources: `${mainconfig.SeverRoles.ChiefHumanResources}`,
    HumanResources: `${mainconfig.SeverRoles.HumanResources}`,
    AdminRoleId: `${mainconfig.SeverRoles.AdminRoleId}`,
    ModRoleId: `${mainconfig.SeverRoles.ModRoleId}`,
    ChiefSupporterRoleId: `${mainconfig.SeverRoles.ChiefSupporterRoleId}`,
    ChiefBotCreatorRoleId: `${mainconfig.SeverRoles.ChiefBotCreatorRoleId}`,
    BotCreatorRoleId: `${mainconfig.SeverRoles.BotCreatorRoleId}`,
    SupporterRoleId: `${mainconfig.SeverRoles.SupporterRoleId}`,
    NewSupporterRoleId: `${mainconfig.SeverRoles.NewSupporterRoleId}`
}
const overflows = [
    `${mainconfig.overflows}`,
    `${mainconfig.overflows}`
];
module.exports = client => {
    let TicketChannelID = `${mainconfig.OrdersChannelID.TicketChannelID}`;
    let RecoverChannelId = `${mainconfig.OrdersChannelID.RecoverChannelId}`;
    let cooldownamount = 2 * 60 * 1000;
    client.ToDeleteChannels = new CronJob('*/30 * * * * *', async function () {
        let channels = client.setups.get("todelete", "tickets");
        let toDeleteChannels = channels.filter(ch => ch.time - (Date.now() - ch.timestamp) <= 0)
        /* 
            client.setups.push("todelete", {
            channel: channel.id,
            timestamp: Date.now(),
            time: 2.592e8,
        }, "tickets");
        */
        if(toDeleteChannels && toDeleteChannels.length > 0) {
            for(const deleteChannel of toDeleteChannels.map(d => d.channel)) {
                console.log("DELETING THE TICKET:", deleteChannel)
                let Guild = client.guilds.cache.get(`${mainconfig.ServerID}`)
                let channel = Guild.channels.cache.get(deleteChannel) || await Guild.channels.fetch(deleteChannel).catch(() => {}) || false;
                //remove from database
                client.setups.remove("todelete", ch => ch.channel == deleteChannel, "tickets")
                
                if(channel) {
                    let userid = false;
                    try {
                        if(client.setups.has(channel.id)) {
                            userid = client.setups.get(channel.id, "user");
                            client.setups.delete(channel.id);
                        }
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid2 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid3 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid4 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid5 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid6 == channel.id)
                        
                        if(userid.length < 5) {
                            userid = client.setups.findKey(user => user.ticketid == channel.id 
                                || user.ticketid1 == channel.id
                                || user.ticketid2 == channel.id
                                || user.ticketid3 == channel.id
                                || user.ticketid4 == channel.id
                                || user.ticketid5 == channel.id
                                || user.ticketid6 == channel.id
                                || user.ticketid7 == channel.id
                                || user.ticketid8 == channel.id
                                || user.ticketid9 == channel.id
                                || user.ticketid0 == channel.id
                                || user.ticketid10 == channel.id)
                        }
                    } catch (e) {
                        //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    }
                    client.ticketdata.ensure(channel.id, {
                        supporters: [ /* { id: "", messages: 0} */ ]
                    })


                    let parent1 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`);
                    let parent2 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                    let parent3 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                    let parent4 = message.guild.channels.cache.get(`${mainconfig.ClosedTicketFourCategory}`)
                    let parent5 = message.guild.channels.cache.get(`${mainconfig.TicketCategorys.ClosedTicketFiveCategory}`)
                    if( (parent1 && parent1.type == "GUILD_CATEGORY" && parent1.children.size > 50) && 
                        (parent2 && parent2.type == "GUILD_CATEGORY" && parent2.children.size > 50) && 
                        (parent3 && parent3.type == "GUILD_CATEGORY" && parent3.children.size > 50) && 
                        (parent4 && parent4.type == "GUILD_CATEGORY" && parent4.children.size > 50) && 
                        (parent5 && parent5.type == "GUILD_CATEGORY" && parent5.children.size > 50)
                    ) channel.delete().catch(console.warn);


                    let ticketdata = client.ticketdata.get(channel.id, "supporters")
                    ticketdata = ticketdata.map(d => `<@${d.id}> | \`${d.messages} Messages\``)


                    try {
                        msglimit = 1000;
                        //The text content collection
                        let messageCollection = new Discord.Collection(); //make a new collection
                        let channelMessages = await channel.messages.fetch({ //fetch the last 100 messages
                            limit: 100
                        }).catch(() => {}); //catch any error
                        messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
                        let tomanymsgs = 1; //some calculation for the messagelimit
                        if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
                        let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
                        if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
                        while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                            if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
                            tomanymsgs += 1; //add 1 to the counter
                            let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                            channelMessages = await channel.messages.fetch({
                                limit: 100,
                                before: lastMessageId
                            }).catch(() => {}); //Fetch again, 100 messages above the already fetched messages
                            if (channelMessages) //if its true
                                messageCollection = messageCollection.concat(channelMessages); //add them to the collection
                        }
                        //reverse the array to have it listed like the discord chat
                        create_transcript_buffer([...messageCollection.values()], channel, channel.guild).then(async path => {
                            try { // try to send the file
                                const attachment = new Discord.MessageAttachment(path); //send it as an attachment
                                await client.channels.fetch(`${mainconfig.LoggingChannelID.TicketLogChannelID}`).then(async ch => {
                                    try {
                                        client.users.fetch(userid).then(async user => {
                                            await ch.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata.join("\n")}`.substring(0, 1024))
                                                    .setColor("BLURPLE").setFooter(client.user.tag + " | ID: " + client.user.id+"\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${client.user.id}> Executed: \`close\`\n> **For: ${user} \`${user.tag}\` (${userid})**\n> **Channel: \`${channel.name}\` (\`${channel.id}\`)**\n> **Category: \`${channel.parent?.name}\` (\`${channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        }).catch(async e => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            await ch.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata && ticketdata.length > 0 ? ticketdata.join("\n") : "None"}`.substring(0, 1024))
                                                    .setColor("BLURPLE").setFooter(client.user.tag + " | ID: " + client.user.id + "\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${client.user.id}> Executed: \`close\`\n> **For: ${userid}**\n> **Channel: \`${channel.name}\` (\`${channel.id}\`)**\n> **Category: \`${channel.parent?.name}\` (\`${channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        await ch.send({
                                            embeds: [new Discord.MessageEmbed()
                                                .addField("Supporters:", `> ${ticketdata.join("\n")}`.substring(0, 1024))
                                                .setColor("BLURPLE").setFooter(client.user.tag + " | ID: " + client.user.id+"\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                    dynamic: true
                                                })).setDescription(`> 🔒 <@${client.user.id}> Executed: \`close\`\n> **Channel: \`${channel.name}\` (\`${channel.id}\`)**\n> **Category: \`${channel.parent?.name}\` (\`${channel.parentId}\`)**`)
                                            ], files: [attachment]
                                        })
                                    }
                                }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
            
                                if (userid && userid.length > 2) {
                                    try {
                                        await client.users.fetch(userid).then(async user => {
                                            try {
                                                if (channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets");
                                                if (channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets2");
                                                if (channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets3");
                                                if (channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets4");
                                                if (channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets5");
                                                if (channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets6");
                                            } catch (e) {
                                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            }
                                            await user.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .setColor("#6861fe")
                                                    .setTitle(`\`${channel.name}\``)
                                                    .addField(`🔒 CLOSED BY:`, `${client.user.tag} | <@${client.user.id}>`)
                                                    .setFooter(client.user.tag + " | ID: " + client.user.id+"\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                        dynamic: true
                                                    }))
                                                    .addField(`♨️ TYPE:`, `${channel.parent ? channel.parent.name : "UNKOWN"}`)
                                                ], files: [attachment]
                                            }).catch(console.log)
                                        })
                                    } catch (e){  console.log(e)}
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
                    await channel.send({
                        embeds: [new Discord.MessageEmbed()
                            .setColor("#6861fe")
                            .setTitle(`\`${channel.name}\``)
                            .addField(`🔒 CLOSED BY:`, `${client.user.tag} | <@${client.user.id}>`)
                            .addField(`♨️ TYPE:`, `${channel.parent ? channel.parent.name : "UNKOWN"}`)
                        ]
                    }).catch(console.log)
                    
                    if(parent1 && parent1.type == "GUILD_CATEGORY" && parent1.children.size < 50) {
                        await channel.setParent(parent1.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent2 && parent2.type == "GUILD_CATEGORY" && parent2.children.size < 50) {
                        await channel.setParent(parent2.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent3 && parent3.type == "GUILD_CATEGORY" && parent3.children.size < 50) {
                        await channel.setParent(parent3.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent4 && parent4.type == "GUILD_CATEGORY" && parent4.children.size < 50) {
                        await channel.setParent(parent4.id, {lockPermissions:false}).catch(()=>{});
                    } else if(parent5 && parent5.type == "GUILD_CATEGORY" && parent5.children.size < 50) {
                        await channel.setParent(parent5.id, {lockPermissions:false}).catch(()=>{});
                    }
                    await channel.permissionOverwrites.set([
                        {id: channel.guild.id, deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL,Discord.Permissions.FLAGS.SEND_MESSAGES,Discord.Permissions.FLAGS.VIEW_CHANNEL]}
                    ]).catch(()=>{});
                    
                } else {
                    console.log("COULD NOT FIND TICKET CHANNEL ON THE SERVER")
                }               
            }
        }
    }, null, true, 'America/Los_Angeles');
    
    client.on("ready", () => {
        client.ToDeleteChannels.start();
    })
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        let Guild = client.guilds.cache.get(`${mainconfig.ServerID}`)
        let channel = Guild.channels.cache.get(interaction.channelId) || await Guild.channels.fetch(interaction.channelId).catch(() => {}) || false;
        if(interaction.customId == "closeticket"){
            interaction.reply({content: `$ **Now Closing the Ticket!**\n> Don't forget to leave <#${mainconfig.FeedBackChannelID.toString()}> and a review on our <https://de.trustpilot.com/review/Nexuss.me>`, ephemeral: true}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            setTimeout(async() => {
                if(channel) {
                    let userid = false;
                    try {
                        if(client.setups.has(channel.id)) {
                            userid = client.setups.get(channel.id, "user");
                        }
                        
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                        userid = client.setups.findKey(user => user.ticketid == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                            userid = client.setups.findKey(user => user.ticketid2 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                            userid = client.setups.findKey(user => user.ticketid3 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                        userid = client.setups.findKey(user => user.ticketid3 == channel.id)
                        if (!userid && channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`)
                        
                        if(userid.length < 5) {
                            userid = client.setups.findKey(user => user.ticketid == channel.id 
                                || user.ticketid1 == channel.id
                                || user.ticketid2 == channel.id
                                || user.ticketid3 == channel.id
                                || user.ticketid4 == channel.id
                                || user.ticketid5 == channel.id
                                || user.ticketid6 == channel.id
                                || user.ticketid7 == channel.id
                                || user.ticketid8 == channel.id
                                || user.ticketid9 == channel.id
                                || user.ticketid0 == channel.id
                                || user.ticketid10 == channel.id)
                        }
                    } catch (e) {
                        //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                    }
                    client.ticketdata.ensure(channel.id, {
                        supporters: [ /* { id: "", messages: 0} */ ]
                    })


                    let parent1 = channel.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`);
                    let parent2 = channel.guild.channels.cache.get(`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`);
                    
                    if(parent1 && parent1.size > 50 && parent2 && parent2.size > 50){
                        channel.delete().catch(console.warn);
                    }


                    let ticketdata = client.ticketdata.get(channel.id, "supporters")
                    ticketdata = ticketdata.map(d => `<@${d.id}> | \`${d.messages} Messages\``)


                    try {
                        msglimit = 1000;
                        //The text content collection
                        let messageCollection = new Discord.Collection(); //make a new collection
                        let channelMessages = await channel.messages.fetch({ //fetch the last 100 messages
                            limit: 100
                        }).catch(() => {}); //catch any error
                        messageCollection = messageCollection.concat(channelMessages); //add them to the Collection
                        let tomanymsgs = 1; //some calculation for the messagelimit
                        if (Number(msglimit) === 0) msglimit = 100; //if its 0 set it to 100
                        let messagelimit = Number(msglimit) / 100; //devide it by 100 to get a counter
                        if (messagelimit < 1) messagelimit = 1; //set the counter to 1 if its under 1
                        while (channelMessages.size === 100) { //make a loop if there are more then 100 messages in this channel to fetch
                            if (tomanymsgs === messagelimit) break; //if the counter equals to the limit stop the loop
                            tomanymsgs += 1; //add 1 to the counter
                            let lastMessageId = channelMessages.lastKey(); //get key of the already fetched messages above
                            channelMessages = await channel.messages.fetch({
                                limit: 100,
                                before: lastMessageId
                            }).catch(() => {}); //Fetch again, 100 messages above the already fetched messages
                            if (channelMessages) //if its true
                                messageCollection = messageCollection.concat(channelMessages); //add them to the collection
                        }
                        //reverse the array to have it listed like the discord chat
                        create_transcript_buffer([...messageCollection.values()], channel, channel.guild).then(async path => {
                            try { // try to send the file
                                const attachment = new Discord.MessageAttachment(path); //send it as an attachment
                                await client.channels.fetch(`${mainconfig.LoggingChannelID.TicketLogChannelID}`).then(async ch => {
                                    try {
                                        client.users.fetch(userid).then(async user => {
                                            await ch.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata.join("\n")}`.substring(0, 1024))
                                                    .setColor("BLURPLE").setFooter(client.user.tag + " | ID: " + client.user.id+"\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${client.user.id}> Executed: \`close\`\n> **For: ${user} \`${user.tag}\` (${userid})**\n> **Channel: \`${channel.name}\` (\`${channel.id}\`)**\n> **Category: \`${channel.parent?.name}\` (\`${channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        }).catch(async e => {
                                            console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            await ch.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .addField("Supporters:", `> ${ticketdata && ticketdata.length > 0 ? ticketdata.join("\n") : "None"}`.substring(0, 1024))
                                                    .setColor("BLURPLE").setFooter(client.user.tag + " | ID: " + client.user.id + "\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                        dynamic: true
                                                    })).setDescription(`> 🔒 <@${client.user.id}> Executed: \`close\`\n> **For: ${userid}**\n> **Channel: \`${channel.name}\` (\`${channel.id}\`)**\n> **Category: \`${channel.parent?.name}\` (\`${channel.parentId}\`)**`)
                                                ], files: [attachment]
                                            })
                                        })
                                    } catch (e) {
                                        console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                        await ch.send({
                                            embeds: [new Discord.MessageEmbed()
                                                .addField("Supporters:", `> ${ticketdata.join("\n")}`.substring(0, 1024))
                                                .setColor("BLURPLE").setFooter(client.user.tag + " | ID: " + client.user.id+"\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                    dynamic: true
                                                })).setDescription(`> 🔒 <@${client.user.id}> Executed: \`close\`\n> **Channel: \`${channel.name}\` (\`${channel.id}\`)**\n> **Category: \`${channel.parent?.name}\` (\`${channel.parentId}\`)**`)
                                            ], files: [attachment]
                                        })
                                    }
                                }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
            
                                if (userid && userid.length > 2) {
                                    try {
                                        await client.users.fetch(userid).then(async user => {
                                            try {
                                                if (channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets");
                                                if (channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets2");
                                                if (channel.parent && channel.parent.id == `${mainconfig.ApplyTickets.PartnerApply}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets3");
                                                if (channel.parent && channel.parent.id == `${mainconfig.TicketCategorys.AllBotTicketsCategory}`)
                                                    client.setups.remove("TICKETS", user.id, "tickets4");
                                            } catch (e) {
                                                console.log(e.stack ? String(e.stack).grey : String(e).grey)
                                            }
                                            await user.send({
                                                embeds: [new Discord.MessageEmbed()
                                                    .setColor("RED")
                                                    .setTitle(`\`${channel.name}\``)
                                                    .addField(`🔒 CLOSED BY:`, `${client.user.tag} | <@${client.user.id}>`)
                                                    .setFooter(client.user.tag + " | ID: " + client.user.id+"\nTicketLog is attached to the Message!", client.user.displayAvatarURL({
                                                        dynamic: true
                                                    }))
                                                    .addField(`♨️ TYPE:`, `${channel.parent ? channel.parent.name : "UNKOWN"}`)
                                                ], files: [attachment]
                                            }).catch(console.log)
                                        })
                                    } catch (e){  console.log(e)}
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
                    await channel.send({
                        embeds: [new Discord.MessageEmbed()
                            .setColor("RED")
                            .setTitle(`\`${channel.name}\``)
                            .addField(`🔒 CLOSED BY:`, `${client.user.tag} | <@${client.user.id}>`)
                            .addField(`♨️ TYPE:`, `${channel.parent ? channel.parent.name : "UNKOWN"}`)
                        ]
                    }).catch(console.log)
                    if(parent1 && parent1.children.size < 50) {
                        await channel.setParent(parent1.id, {lockPermissions:false}).catch(()=>{});
                    } else {
                        console.log("PARENT 1 is full, using next parent")
                        await channel.setParent(parent2.id, {lockPermissions:false}).catch(()=>{});
                    }
                    await channel.permissionOverwrites.set([
                        {id: channel.guild.id, deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL,Discord.Permissions.FLAGS.SEND_MESSAGES,Discord.Permissions.FLAGS.VIEW_CHANNEL]}
                    ]).catch(()=>{});
                    
                } 
            }, 5000)
        } else if(interaction.customId == "dontcloseticket"){
            interaction.reply({content: `<a:check:964989203656097803> **Not Closing the Ticket!**\n> <@&${Roles.SupporterRoleId}> The Customer needs something!`, ephemeral: false}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            try{client.setups.remove("todelete", ch => ch.channel == interaction.channelId, "tickets")}catch(e){console.log(e)}
        }
    })
    
    //CLAIMING TICKETS
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        if(interaction.customId == "TicketClaim") {
            let { channel, member, guild, message } = interaction;
            if(!guild) guild = client.guilds.cache.get(interaction.guildId);
            if(!member) member = guild.members.cache.get(interaction.user);
            if(!member) member = await guild.members.fetch(interaction.user);
            if (member.roles.highest.rawPosition >= guild.roles.cache.get(Roles.NewSupporterRoleId).rawPosition) {
                if(channel.name.slice(0, 5).includes("💎") && member.roles.highest.rawPosition <= guild.roles.cache.get(Roles.FounderId).rawPosition - 1) {
                    return interaction.reply({ephemeral: true, content: ":x: **You are not allowed to claim, due to the fact its a NotSaksh TICKET**"});
                }
                if(channel.name.slice(0, 5).includes("👑") && member.roles.highest.rawPosition <= guild.roles.cache.get(Roles.CoOwnerRoleId).rawPosition - 1) {
                    return interaction.reply({ephemeral: true, content: ":x: **You are not allowed to claim, due to the fact its a Co-Owner+ Ticket**"});
                }
                if(channel.name.slice(0, 5).includes("💠") && member.roles.highest.rawPosition <= guild.roles.cache.get(Roles.ModRoleId).rawPosition - 1) {
                    return interaction.reply({ephemeral: true, content: ":x: **You are not allowed to claim, due to the fact its a Mod+ Ticket**"});
                }
                if(channel.name.slice(0, 5).includes("❗") && member.roles.highest.rawPosition <= guild.roles.cache.get(Roles.ModRoleId).rawPosition - 1) {
                    return interaction.reply({ephemeral: true, content: ":x: **You are not allowed to claim, due to the fact its a Important (Mod+) Ticket**"});
                }
                if(!channel.permissionsFor(member).has(Discord.Permissions.FLAGS.SEND_MESSAGES)){
                    channel.permissionOverwrites.edit(member.user, {
                        SEND_MESSAGES: true
                    }).catch(e=>{
                        return interaction.reply({ephemeral: true, content: ":x: **Can't change the Permissions of you!**"});
                    });
                }
                interaction.update({content: message.content, embeds: [message.embeds[0]], components: message.components}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("#57F287")
                            .setAuthor(member.user.tag, member.displayAvatarURL({dynamic: true}))
                            .setDescription(`**Ticket Claimed by:** ${member.user}`)
                            .setTimestamp()
                    ]
                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            } else {
                interaction.reply({ephemeral: true, content: ":x: **You are not a Staff Member and Can't Claim the Ticket!**"});
            }
        }
    })

    client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
        if (interaction.message.channel.id == TicketChannelID || interaction.message.channel.id == RecoverChannelId) {
            let menuIndex = settings.ordersystem.find(v => String(v.value).split(" ").join("").substring(0, 25) == String(interaction.values[0]).split(" ").join("").substring(0, 25));
            let user = interaction.user;
            let guild = interaction.message.guild;
            if(menuIndex.type){
                if(Cooldown.has(user.id)){
                    return interaction.reply({content: `:x: **Sorry, but you can create an Order in \`${duration(cooldownamount - (Date.now() - Cooldown.get(user.id))).join(", ")}\` again!**`, ephemeral: true}).catch((e)=>{console.warn(e.stack ? String(e.stack).grey : String(e).grey)})
                }
                switch(menuIndex.type){
                    case "SYSTEMBOTS" : {
                        await interaction.reply({content: `:notes: Creating your Ticket ... `, ephemeral: true}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem3");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __Clan Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets3").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid3"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets3")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened System-Bot-Order-Ticket!!** <#" + client.setups.get(user.id, "ticketid3") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `🤖│s・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets3");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid3");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, 
                            embeds: [
                                new MessageEmbed().setColor("#6861fe")
                                    .setTitle("Thanks for Ordering a System Bot! Send the Parameters!")
                                    .setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`Your System Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});             
                        }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                    } break;
                    case "MusicBots" : {
                        await interaction.reply({content: `Creating your Ticket ... `, ephemeral: true}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem2");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __Music Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets2").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid2"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets2")
                           }
                            else{
                               stopped = true;
                                return interaction.editReply(":x: **You already have an opened Music-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid2") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `🎵│m・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets2");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid2");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle(":notes: Thanks for Ordering a Music Bot! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`:notes: Your Music Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});              
                        })
                    } break;
                    case "RYTHMCLONE" : {
                        await interaction.reply({content: `Creating your Ticket ... `, ephemeral: true}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem6");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __RYTHM CLONE Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets6").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid6"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets6")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Rythm-Clone-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid6") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `⍿🔉│r・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        guild.channels.create(channelname.substring(0, 32), {
                            parent: `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets6");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid6");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle("Thanks for Ordering a Rythm Clone! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`${emojis}  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`Your Rythm Clone Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});            
                        }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                    }break;
                    case "WAITINGROOMBOT" : {
                        await interaction.reply({content: `<:Public_Waitingroom:964413129389912134> Creating your Ticket ... `, ephemeral: true}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __WAITINGROOM Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets6").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Waitingroom-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `🕐│w・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle(`<:Public_Waitingroom:964413129389912134> for Ordering a Waitingroom Bot! Send the Parameters!`)
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`<:Public_Waitingroom:964413129389912134> Your Waitingroom Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});            
                        }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                    }break;
                    case "ADMINISTRATIONBOT" : {
                        await interaction.reply({content: `🚫 Creating your Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem5");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __ADMINISTRATION Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets5").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid5"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets5")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Administration-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid5") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `⍿🚫│a・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets5");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid5");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle("🚫 Thanks for Ordering an Administration Bot! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`🚫 Your Administration Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        })
                    }break;
                    //ticketsystem13
                    case "24_7_MUSIC_BOT" : {
                        await interaction.reply({content: `:notes: Creating your Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem13");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __24/7 Music Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets13").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid13"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets13")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened 24/7-Music-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid5") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `🔃│24・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets13");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid13");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle(":notes: Thanks for Ordering a 24/7 Music Bot! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`:notes: Your 24/7 Music Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        })
                    }break;
                    //ticketsystem9
                    case "MODMAILBOT": {
                        await interaction.reply({content: `Creating your Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem9");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __MOD MAIL Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets9").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid9"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets9")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Mod-Mail-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid5") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📨│m・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets9");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid9");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle("Thanks for Ordering an Mod Mail Bot! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`Your Mod Mail Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        })
                    }break;
                    //ticketsystem12
                    case "LAVAMUSICBOT": {
                        await interaction.reply({content: ` Creating your Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem12");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __Lava Music Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets12").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid12"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets12")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Lava-Music-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid5") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `⍿🩸│l・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets12");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid12");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle(" Thanks for Ordering a Lava Music Bot! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(` Your Lava Music Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        })
                    }break;
                    //ticketsystem11
                    case "SECURITYBOT": {
                        await interaction.reply({content: `<:Super_Mod:935065637636685836> Creating your Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem11");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __Security Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets11").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid11"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets10")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Security-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid5") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `⍿🚨│s・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets11");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid11");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle(`<:Super_Mod:935065637636685836> Thanks for Ordering a Security Bot! Send the Parameters!`)
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`<:Super_Mod:935065637636685836> Your Security Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        })
                    }break;
                    //ticketsystem10
                    case "NSFW_AND_FUN_BOT": {
                        await interaction.reply({content: `🕹️ Creating your Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem10");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __Security Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets10").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid10"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets10")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened NSFW-&-FUN-Bot-Order-Ticket!** <#" + client.setups.get(user.id, "ticketid5") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `⍿🕹️│f・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets10");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid10");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [new MessageEmbed().setColor("#6861fe")
                            .setTitle("🕹️ Thanks for Ordering a NSFW & FUN Bot! Send the Parameters!")
                            .setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`<🕹️ Your NSFW & FUN Bot Order \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        })
                    }break;
                    
                    default: 
                    {
                        interaction.reply({
                            content: ":x: This System will soon be enabled please be patient!",
                            ephemeral: true
                        })
                    }
                    break;


                    case "CUSTOMBOT" : {

                        await interaction.reply({content: `<:Bot_Flag:933238334946439211> Creating your Custom-Bot-Ordering-Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem8");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __CUSTOM Bots__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets8").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid8"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets8")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an custom Bot Order!** <#" + client.setups.get(user.id, "ticketid8") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📛│c・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets8");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid8");
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Custom Bot Order-Ticket \`${ch.name}\` has been created! | CUSTOM BOT`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});      
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, 
                            embeds: [
                                new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for ordering a Custom Bot!").setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                            })
                        });
                    }break;
                    case "SOURCECODE" : {
                        await interaction.reply({content: `<a:Valid_Code_Developer:933742305398116363> Creating your Source-Code-Ordering-Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem7");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not providing __SOURCE CODES__!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets7").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid7"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets7")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Ticket!** <#" + client.setups.get(user.id, "ticketid7") + ">").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `⍿📂│t・`;
                        client.setups.set("COUNTER", 1 + Number(client.setups.get("COUNTER", "number")), "number")
                        var cc = client.setups.get("COUNTER", "number")
                        channelname += String(cc) + `-${user.username}`.replace(/[&\/\\#!,+()$~%.'":*?<>{}]/g,'')
                        
                        
                        let parentId = ticket.parentid;
                        const parentChannel = guild.channels.cache.get(parentId) || await guild.channels.fetch(parentId).catch(()=> {});
                        if(!parentChannel) return interaction.reply({ content: ":x: Could not find ticket parent", ephemeral: true })
                        
                        const overflowParents = overflows.map(pId => guild.channels.cache.get(pId)).filter(Boolean);
                        if(parentChannel.children.size >= 50 && !overflowParents.some(c => c.children.size < 50)) return interaction.reply({ content: ":x: Sorry we do not have enough ticket space for your Ticket, please come back later again!", ephemeral: true })
                        if(parentChannel.children.size >= 50) { parentId = overflowParents.find(c => c.children.size < 50); }

                        guild.channels.create(channelname.substring(0, 32), {
                            parent: parentId,
                            topic: `ticket-${user.id}`
                        }).then(ch => {
                            ch.permissionOverwrites.edit(guild.roles.everyone, { //disabling all roles
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false,
                            });
                            ch.permissionOverwrites.edit(user, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            });
                            if (guild.roles.cache.some(r => ticket.adminroles.includes(r.id))) {
                            for (let i = 0; i < ticket.adminroles.length; i++) {
                                try {
                                    ch.permissionOverwrites.edit(ticket.adminroles[i], { //ticket support role id
                                        SEND_MESSAGES: false,
                                        VIEW_CHANNEL: true,
                                        MANAGE_CHANNELS: true,
                                    });
                                } catch (e) {
                                    console.warn(e.stack ? String(e.stack).grey : String(e).grey)
                                }
                            }
                            }
                            client.setups.push("TICKETS", user.id, "tickets7");
                            client.setups.set(ch.id, user.id, "user");
                            client.setups.set(user.id, ch.id, "ticketid7");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501>  ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left} `, embeds: [
                                new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for ordering a Source Code!").setDescription(ticket.message.replace("{user}", `${user}`)),                                new MessageEmbed().setColor("YELLOW").setTitle(`${emoji.loading} A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                                components: [
                                    new MessageActionRow().addComponents([
                                        new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                    ])
                                ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(msg => {
                                    if(interaction.message.channel.id == RecoverChannelId) msg.reply(`<:Approved:933251888395214948>  **This is a REFUND ORDER**`).catch(() => {});
                                })
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Ticket \`${ch.name}\` has been created! | SOURCE CODE`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                                }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}); 
                        });
                    }break;
                }
            } else {
                return interaction.reply({content: `:x: **Sorry, but something went wrong!**`, ephemeral: true}).catch((e)=>{console.warn(e.stack ? String(e.stack).grey : String(e).grey)})
            }
        }
    });
    
    //Function for creating Transcript Buffers
    async function create_transcript_buffer(Messages, Channel, Guild){
        return new Promise(async (resolve, reject) => {
        try{
            let baseHTML = `<!DOCTYPE html>` + 
            `<html lang="en">` + 
            `<head>` + 
            `<title>${Channel.name}</title>` + 
            `<meta charset="utf-8" />` + 
            `<meta name="viewport" content="width=device-width" />` + 
            `<style>mark{background-color: #202225;color:#F3F3F3;}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-300.woff);font-weight:300}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-400.woff);font-weight:400}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-500.woff);font-weight:500}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-600.woff);font-weight:600}@font-face{font-family:Whitney;src:url(https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/whitney-700.woff);font-weight:700}body{font-family:Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:17px}a{text-decoration:none}a:hover{text-decoration:underline}img{object-fit:contain}.markdown{max-width:100%;line-height:1.3;overflow-wrap:break-word}.preserve-whitespace{white-space:pre-wrap}.spoiler{display:inline-block}.spoiler--hidden{cursor:pointer}.spoiler-text{border-radius:3px}.spoiler--hidden .spoiler-text{color:transparent}.spoiler--hidden .spoiler-text::selection{color:transparent}.spoiler-image{position:relative;overflow:hidden;border-radius:3px}.spoiler--hidden .spoiler-image{box-shadow:0 0 1px 1px rgba(0,0,0,.1)}.spoiler--hidden .spoiler-image *{filter:blur(44px)}.spoiler--hidden .spoiler-image:after{content:"SPOILER";color:#dcddde;background-color:rgba(0,0,0,.6);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:600;padding:100%;border-radius:20px;letter-spacing:.05em;font-size:.9em}.spoiler--hidden:hover .spoiler-image:after{color:#fff;background-color:rgba(0,0,0,.9)}blockquote{margin:.1em 0;padding-left:.6em;border-left:4px solid;border-radius:3px}.pre{font-family:Consolas,"Courier New",Courier,monospace}.pre--multiline{margin-top:.25em;padding:.5em;border:2px solid;border-radius:5px}.pre--inline{padding:2px;border-radius:3px;font-size:.85em}.mention{border-radius:3px;padding:0 2px;color:#dee0fc;background:rgba(88,101,242,.3);font-weight:500}.mention:hover{background:rgba(88,101,242,.6)}.emoji{width:1.25em;height:1.25em;margin:0 .06em;vertical-align:-.4em}.emoji--small{width:1em;height:1em}.emoji--large{width:2.8em;height:2.8em}.chatlog{max-width:100%}.message-group{display:grid;margin:0 .6em;padding:.9em 0;border-top:1px solid;grid-template-columns:auto 1fr}.reference-symbol{grid-column:1;border-style:solid;border-width:2px 0 0 2px;border-radius:8px 0 0 0;margin-left:16px;margin-top:8px}.attachment-icon{float:left;height:100%;margin-right:10px}.reference{display:flex;grid-column:2;margin-left:1.2em;margin-bottom:.25em;font-size:.875em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-items:center}.reference-av{border-radius:50%;height:16px;width:16px;margin-right:.25em}.reference-name{margin-right:.25em;font-weight:600}.reference-link{flex-grow:1;overflow:hidden;text-overflow:ellipsis}.reference-link:hover{text-decoration:none}.reference-content>*{display:inline}.reference-edited-tst{margin-left:.25em;font-size:.8em}.ath-av-container{grid-column:1;width:40px;height:40px}.ath-av{border-radius:50%;height:40px;width:40px}.messages{grid-column:2;margin-left:1.2em;min-width:50%}.messages .bot-tag{top:-.2em}.ath-name{font-weight:500}.tst{margin-left:.3em;font-size:.75em}.message{padding:.1em .3em;margin:0 -.3em;background-color:transparent;transition:background-color 1s ease}.content{font-size:.95em;word-wrap:break-word}.edited-tst{margin-left:.15em;font-size:.8em}.attachment{margin-top:.3em}.attachment-thumbnail{vertical-align:top;max-width:45vw;max-height:225px;border-radius:3px}.attachment-container{height:40px;width:100%;max-width:520px;padding:10px;border:1px solid;border-radius:3px;overflow:hidden;background-color:#6861fe;border-color:#292b2f}.attachment-icon{float:left;height:100%;margin-right:10px}.attachment-filesize{color:#72767d;font-size:12px}.attachment-filename{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.embed{display:flex;margin-top:.3em;max-width:520px}.embed-color-pill{flex-shrink:0;width:.25em;border-top-left-radius:3px;border-bottom-left-radius:3px}.embed-content-container{display:flex;flex-direction:column;padding:.5em .6em;border:1px solid;border-top-right-radius:3px;border-bottom-right-radius:3px}.embed-content{display:flex;width:100%}.embed-text{flex:1}.embed-ath{display:flex;margin-bottom:.3em;align-items:center}.embed-ath-icon{margin-right:.5em;width:20px;height:20px;border-radius:50%}.embed-ath-name{font-size:.875em;font-weight:600}.embed-title{margin-bottom:.2em;font-size:.875em;font-weight:600}.embed-description{font-weight:500;font-size:.85em}.embed-fields{display:flex;flex-wrap:wrap}.embed-field{flex:0;min-width:100%;max-width:506px;padding-top:.6em;font-size:.875em}.embed-field--inline{flex:1;flex-basis:auto;min-width:150px}.embed-field-name{margin-bottom:.2em;font-weight:600}.embed-field-value{font-weight:500}.embed-thumbnail{flex:0;margin-left:1.2em;max-width:80px;max-height:80px;border-radius:3px}.embed-image-container{margin-top:.6em}.embed-image{max-width:500px;max-height:400px;border-radius:3px}.embed-footer{margin-top:.6em}.embed-footer-icon{margin-right:.2em;width:20px;height:20px;border-radius:50%;vertical-align:middle}.embed-footer-text{display:inline;font-size:.75em;font-weight:500}.reactions{display:flex}.reaction{display:flex;align-items:center;margin:.35em .1em .1em .1em;padding:.2em .35em;border-radius:8px}.reaction-count{min-width:9px;margin-left:.35em;font-size:.875em}.bot-tag{position:relative;margin-left:.3em;margin-right:.3em;padding:.05em .3em;border-radius:3px;vertical-align:middle;line-height:1.3;background:#7289da;color:#fff;font-size:.625em;font-weight:500}.postamble{margin:1.4em .3em .6em .3em;padding:1em;border-top:1px solid}body{background-color:#36393e;color:#dcddde}a{color:#0096cf}.spoiler-text{background-color:rgba(255,255,255,.1)}.spoiler--hidden .spoiler-text{background-color:#202225}.spoiler--hidden:hover .spoiler-text{background-color:rgba(32,34,37,.8)}.quote{border-color:#4f545c}.pre{background-color:#6861fe!important}.pre--multiline{border-color:#282b30!important;color:#b9bbbe!important}.preamble__entry{color:#fff}.message-group{border-color:rgba(255,255,255,.1)}.reference-symbol{border-color:#4f545c}.reference-icon{width:20px;display:inline-block;vertical-align:bottom}.reference{color:#b5b6b8}.reference-link{color:#b5b6b8}.reference-link:hover{color:#fff}.reference-edited-tst{color:rgba(255,255,255,.2)}.ath-name{color:#fff}.tst{color:rgba(255,255,255,.2)}.message--highlighted{background-color:rgba(114,137,218,.2)!important}.message--pinned{background-color:rgba(249,168,37,.05)}.edited-tst{color:rgba(255,255,255,.2)}.embed-color-pill--default{background-color:#4f545c}.embed-content-container{background-color:rgba(46,48,54,.3);border-color:rgba(46,48,54,.6)}.embed-ath-name{color:#fff}.embed-ath-name-link{color:#fff}.embed-title{color:#fff}.embed-description{color:rgba(255,255,255,.6)}.embed-field-name{color:#fff}.embed-field-value{color:rgba(255,255,255,.6)}.embed-footer{color:rgba(255,255,255,.6)}.reaction{background-color:rgba(255,255,255,.05)}.reaction-count{color:rgba(255,255,255,.3)}.info{display:flex;max-width:100%;margin:0 5px 10px 5px}.guild-icon-container{flex:0}.guild-icon{max-width:88px;max-height:88px}.metadata{flex:1;margin-left:10px}.guild-name{font-size:1.2em}.channel-name{font-size:1em}.channel-topic{margin-top:2px}.channel-message-count{margin-top:2px}.channel-timezone{margin-top:2px;font-size:.9em}.channel-date-range{margin-top:2px}</style>` +
            `<script>function scrollToMessage(e,t){var o=document.getElementById("message-"+t);null!=o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function scrollToMessage(e,t){var o=document.getElementById("message-"+t);o&&(e.preventDefault(),o.classList.add("message--highlighted"),window.scrollTo({top:o.getBoundingClientRect().top-document.body.getBoundingClientRect().top-window.innerHeight/2,behavior:"smooth"}),window.setTimeout(function(){o.classList.remove("message--highlighted")},2e3))}function showSpoiler(e,t){t&&t.classList.contains("spoiler--hidden")&&(e.preventDefault(),t.classList.remove("spoiler--hidden"))}</script>` + 
            `<script>document.addEventListener('DOMContentLoaded', () => {document.querySelectorAll('.pre--multiline').forEach((block) => {hljs.highlightBlock(block);});});</script>` + 
            `</head>`;
            let messagesArray = []
            let messagescount = Messages.length;
            let msgs = Messages.reverse(); //reverse the array to have it listed like the discord chat
            //now for every message in the array make a new paragraph!
            await msgs.forEach(async msg => {
                //Aug 02, 2021 12:20 AM
                if(msg.type == "DEFAULT"){
                let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:mm:ss")
                let subcontent = `<div class="message-group">` + 
                `<div class="ath-av-container"><img class="ath-av"src="${msg.author.displayAvatarURL({dynamic: true})}" /></div>` + 
                `<div class="messages">` + 
                `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
                if(msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
                subcontent += `<span class="tst">ID: ${msg.author.id} | </span>` + 
                `<span class="tst">${time} ${msg.editedTimestamp ? `(edited)` : msg.editedAt ? `(edited)` : ""}</span>` + 
                `<div class="message">`;
                if (msg.content) {
                    subcontent += `<div class="content"><div class="markdown"><span class="preserve-whitespace">${markdowntohtml(String(msg.cleanContent ? msg.cleanContent : msg.content).replace(/\n/ig, "<br/>"))}</div></div>` 
                } 
                if (msg.embeds[0]){
                    subcontent += `<div class="embed"><div class=embed-color-pill style=background-color:"${msg.embeds[0].color ? msg.embeds[0].color : "transparent"}"></div><div class=embed-content-container><div class=embed-content><div class=embed-text>` 
                    
                    if(msg.embeds[0].author){
                        subcontent += `<div class="embed-ath">`;
                        if(msg.embeds[0].author.iconURL){
                        subcontent += `<img class="embed-ath-icon" src="${msg.embeds[0].author.iconURL}">`
                        }
                        if(msg.embeds[0].author.name){
                        subcontent += `<div class="embed-ath-name"><span class="markdown">${markdowntohtml(String(msg.embeds[0].author.name).replace(/\n/ig, "<br/>"))}</span></div>`
                        }
                        subcontent += `</div>`
                    }if(msg.embeds[0].title){
                        subcontent += `<div class="embed-title"><span class="markdown">${markdowntohtml(String(msg.embeds[0].title).replace(/\n/ig, "<br/>"))}</span></div>`;
                    }
                    if(msg.embeds[0].description){
                        subcontent += `<div class="embed-description preserve-whitespace"><span class="markdown" style="color: rgba(255,255,255,.6) !important;">${markdowntohtml(String(msg.embeds[0].description).replace(/\n/ig, "<br/>"))}</span></div>`;
                    }
                    if(msg.embeds[0].image){
                        subcontent += `<div class="embed-image-container"><img class="embed-footer-image" src="${msg.embeds[0].image.url}"></div>`
                    }
                    if(msg.embeds[0].fields && msg.embeds[0].fields.length > 0){
                        subcontent += `<div class="embed-fields">`
                        for(let i = 0; i < msg.embeds[0].fields.length; i++){
                            subcontent += `<div class="embed-field ${msg.embeds[0].fields[i].inline ? `embed-field--inline` : ``}">`
                            const field = msg.embeds[0].fields[i]
                            if(field.key){
                            subcontent += `<div class="embed-field-name">${markdowntohtml(String(field.key).replace(/\n/ig, "<br/>"))}</div>`;
                            }
                            if(field.value){
                            subcontent += `<div class="embed-field-value">${markdowntohtml(String(field.value).replace(/\n/ig, "<br/>"))}</div>`;
                            }
                            subcontent += `</div>`
                        }
                        subcontent += `</div>`;
                    }
                    if(msg.embeds[0].footer){
                        subcontent += `<div class="embed-footer">`;
                        if(msg.embeds[0].footer.iconURL){
                        subcontent += `<img class="embed-footer-icon" src="${msg.embeds[0].footer.iconURL}">`
                        }
                        if(msg.embeds[0].footer.text){
                        subcontent += `<div class="embed-footer-text"><span class="markdown">${markdowntohtml(String(msg.embeds[0].footer.text).replace(/\n/ig, "<br/>"))}</span></div>`
                        }
                        subcontent += `</div>`
                    }
                    subcontent += `</div>`;
                    if(msg.embeds[0].thumbnail && msg.embeds[0].thumbnail.url){
                        subcontent += `<img class="embed-thumbnail" src="${msg.embeds[0].thumbnail.url}">`;
                    }
                    subcontent += `</div></div></div>`;
                }
                if (msg.reactions && msg.reactions.cache.size > 0){
                    subcontent += `<div class="reactions">`
                    for(const reaction of msg.reactions.cache.map(this_Code_is_by_NotSaksh_6969 => this_Code_is_by_NotSaksh_6969)){                      
                    subcontent += `<div class=reaction>${reaction.emoji.url ? `<img class="emoji emoji--small" src="${reaction.emoji.url}" alt="${"<" + reaction.emoji.animated ? "a" : "" + ":" + reaction.emoji.name + ":" + reaction.emoji.id + ">"}">` : reaction.emoji.name.toString()}<span class="reaction-count">${reaction.count}</span></div>`
                    }
                    subcontent += `</div>`
                }
                subcontent += `</div></div></div>`
                messagesArray.push(subcontent);
                }
                if(msg.type == "PINS_ADD"){
                let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:mm:ss")
                let subcontent = `<div class="message-group">` + 
                `<div class="ath-av-container"><img class="ath-av"src="https://cdn-0.emojis.wiki/emoji-pics/twitter/pushpin-twitter.png" style="background-color: #000;filter: alpha(opacity=40);opacity: 0.4;" /></div>` + 
                `<div class="messages">` + 
                `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
                if(msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
                subcontent += `<span class="tst" style="font-weight:500;color:#848484;font-size: 14px;">pinned a message to this channel.</span><span class="tst">${time}</span></div></div></div>`;
                messagesArray.push(subcontent);
                }
            });
            baseHTML += `<body><div class="info"><div class="guild-icon-container"> <img class="guild-icon" src="${Guild.iconURL({dynamic:true})}" />` +
            `</div><div class="metadata">` +
            `<div class="guild-name"><strong>Guild:</strong> ${Guild.name} (<mark>${Guild.id})</mark></div>` +
            `<div class="channel-name"><strong>Channel:</strong> ${Channel.name} (<mark>${Channel.id})</mark></div>` +
            `<div class="channel-message-count"><mark>${messagescount} Messages</mark></div>` +
            `<div class="channel-timezone"><strong>Timezone-Log-Created:</strong> <mark>${moment(Date.now()).format("MMM DD, YYYY HH:mm")}</mark> | <em>[MEZ] Europe/London</em></div>` +
            `</div></div>` +
            `<div class="chatlog">`;
            baseHTML += messagesArray.join("\n");
            baseHTML += `<div class="message-group"><div class="ath-av-container"><img class="ath-av"src="https://logosmarken.com/wp-content/uploads/2020/12/Discord-Logo.png" /></div><div class="messages"><span class="ath-name" style="color: #ff5151;">TICKET LOG INFORMATION</span><span class="bot-tag">✓ SYSTEM</span><span class="timestamp">Mind this Information</span><div class="message " ><div class="content"><div class="markdown"><span class="preserve-whitespace"><i><blockquote>If there are Files, Attachments, Videos or Images, they won't always be displayed cause they will be unknown and we don't want to spam an API like IMGUR!</blockquote></i></span></div></div></div></div></div></div></body></html>`;
            fs.writeFileSync(`${process.cwd()}/${Channel.name}.html`, baseHTML); //write everything in the docx file
            resolve(`${process.cwd()}/${Channel.name}.html`);
            return;
            function markdowntohtml(tomarkdown){
            mentionReplace(tomarkdown.split(" "));
            function mentionReplace(splitted){
                for(arg of splitted){
                const memberatches = arg.match(/<@!?(\d+)>/);
                const rolematches = arg.match(/<@&(\d+)>/);
                const channelmatches = arg.match(/<#(\d+)>/);
                if (rolematches) {
                    let role = Guild.roles.cache.get(rolematches[1])
                    if(role){
                    let torpleace = new RegExp(rolematches[0], "g")
                    tomarkdown = tomarkdown.replace(torpleace, `<span title="${role.id}" style="color: ${role.hexColor};">@${role.name}</span>`);
                    }
                }
                if(memberatches){
                    let member = Guild.members.cache.get(memberatches[1])
                    if(member){
                    let torpleace = new RegExp(memberatches[0], "g")
                    tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${member.id}">@${member.user.username}</span>`);
                    }
                }
                if(channelmatches){
                    let channel = Guild.channels.cache.get(channelmatches[1])
                    if(channel){
                    let torpleace = new RegExp(channelmatches[0], "g")
                    tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${channel.id}">@${channel.name}</span>`);
                    }
                }
                }
            }
            var output = "";
            var BLOCK = "block";
            var INLINE = "inline";
            var parseMap = [
                {
                // <p>
                pattern: /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
                replace: "$1<br/>",
                type: BLOCK,
                },
                {
                // <blockquote>
                pattern: /\n(?:&gt;|\>)\W*(.*)/g,
                replace: "<blockquote><p>$1</p></blockquote>",
                type: BLOCK,
                },
                {
                // <ul>
                pattern: /\n\s?\*\s*(.*)/g,
                replace: "<ul>\n\t<li>$1</li>\n</ul>",
                type: BLOCK,
                },
                {
                // <ol>
                pattern: /\n\s?[0-9]+\.\s*(.*)/g,
                replace: "<ol>\n\t<li>$1</li>\n</ol>",
                type: BLOCK,
                },
                {
                // <strong>
                pattern: /(\*\*|__)(.*?)\1/g,
                replace: "<strong>$2</strong>",
                type: INLINE,
                },
                {
                // <em>
                pattern: /(\*)(.*?)\1/g,
                replace: "<em>$2</em>",
                type: INLINE,
                },
                {
                // <a>
                pattern: /([^!])\[([^\[]+)\]\(([^\)]+)\)/g,
                replace: "$1<a href=\"$3\">$2</a>",
                type: INLINE,
                },
                {
                // <img>
                pattern: /!\[([^\[]+)\]\(([^\)]+)\)/g,
                replace: "<img src=\"$2\" alt=\"$1\" />",
                type: INLINE,
                },
                {
                // <code>
                pattern: /`(.*?)`/g,
                replace: "<mark>$1</mark>",
                type: INLINE,
                },
            ];
            function parse(string) {
                output = "\n" + string + "\n";
                parseMap.forEach(function(p) {
                output = output.replace(p.pattern, function() {
                    return replace.call(this, arguments, p.replace, p.type);
                });
                });
                output = clean(output);
                output = output.trim();
                output = output.replace(/[\n]{1,}/g, "\n");
                return output;
            }
            function replace(matchList, replacement, type) {
                var i, $$;
                for(i in matchList) {
                if(!matchList.hasOwnProperty(i)) {
                    continue;
                }
                replacement = replacement.split("$" + i).join(matchList[i]);
                replacement = replacement.split("$L" + i).join(matchList[i].length);
                }
                if(type === BLOCK) {
                replacement = replacement.trim() + "\n";
                }
                return replacement;
            }
            function clean(string) {
                var cleaningRuleArray = [
                {
                    match: /<\/([uo]l)>\s*<\1>/g,
                    replacement: "",
                },
                {
                    match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
                    replacement: "$1",
                },
                ];
                cleaningRuleArray.forEach(function(rule) {
                string = string.replace(rule.match, rule.replacement);
                });
                return string;
            }
            
            let output__ = parse(tomarkdown);
            return output__;
            }
        }catch (e){
            reject(e);
            return;
        }
        })          
    }
    function duration(duration, useMilli = false) {
        let remain = duration;
        let days = Math.floor(remain / (1000 * 60 * 60 * 24));
        remain = remain % (1000 * 60 * 60 * 24);
        let hours = Math.floor(remain / (1000 * 60 * 60));
        remain = remain % (1000 * 60 * 60);
        let minutes = Math.floor(remain / (1000 * 60));
        remain = remain % (1000 * 60);
        let seconds = Math.floor(remain / (1000));
        remain = remain % (1000);
        let milliseconds = remain;
        let time = {
            days,
            hours,
            minutes,
            seconds,
            milliseconds
        };
        let parts = []
        if (time.days) {
            let ret = time.days + ' Day'
            if (time.days !== 1) {
                ret += 's'
            }
            parts.push(ret)
        }
        if (time.hours) {
            let ret = time.hours + ' Hour'
            if (time.hours !== 1) {
                ret += 's'
            }
            parts.push(ret)
        }
        if (time.minutes) {
            let ret = time.minutes + ' Minute'
            if (time.minutes !== 1) {
                ret += 's'
            }
            parts.push(ret)

        }
        if (time.seconds) {
            let ret = time.seconds + ' Second'
            if (time.seconds !== 1) {
                ret += 's'
            }
            parts.push(ret)
        }
        if (useMilli && time.milliseconds) {
            let ret = time.milliseconds + ' ms'
            parts.push(ret)
        }
        if (parts.length === 0) {
            return ['instantly']
        } else {
            return parts
        }
    }

}