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
const settings = require("../../settings.json")
const mainconfig = require("../../mainconfig")

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
    let OrderChannelID = `${mainconfig.OrdersChannelID.OrderChannelID}`;
    let RecoverChannelId = `${mainconfig.OrdersChannelID.RecoverChannelId}`;
    let cooldownamount = 2 * 60 * 1000;
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
            if(interaction.message.channel.id == TicketChannelID || interaction.message.channel.id == OrderChannelID || interaction.message.channel.id == RecoverChannelId){
                interaction.reply({content: `<a:check:964989203656097803> **Ping Successful!** You can now Open a Ticket!`, ephemeral: true})
            }
    })
    client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
        if (interaction.message.channel.id == TicketChannelID) {
            let menuIndex = settings.ticketsystem.find(v => String(v.value).substring(0, 25) == String(interaction.values[0]).substring(0, 25));

            let user = interaction.user;
            let guild = interaction.message.guild;
            if(menuIndex){
                if(Cooldown.has(user.id)){
                    return interaction.reply({content:`:x: **Sorry, but you can create a Ticket in \`${duration(cooldownamount - (Date.now() - Cooldown.get(user.id))).join(", ")}\` again!**`, ephemeral: true}).catch((e)=>{console.warn(e.stack ? String(e.stack).grey : String(e).grey)})
                }
                switch(menuIndex.type){
                    case "HELP" : {
                        await interaction.reply({content: `<:Discord:933238543973773383> Creating your Ticket ... `, ephemeral: true})
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        ////////////////////////
                        /////////////////////////
                        client.setups.set(guild.id,`Hey {user}! Thanks for opening a TICKET | Bot Help
                    
                    > **Please tell us with what you need help with?**
                    > The <@&935689419757854780> will try to help you with your Bot Problem as soon as possible!`, "ticketsystem4.message");
                        let ticket = client.setups.get(guild.id, "ticketsystem4");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but the Ticket System got temporarily disabled!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets4").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid4"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets4")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Ticket!** <#" + client.setups.get(user.id, "ticketid4") + ">");
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📁│t・`;
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
                            client.setups.push("TICKETS", user.id, "tickets4");
                            client.setups.set(user.id, ch.id, "ticketid4");
                            client.setups.set(ch.id, user.id, "user");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501> ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left}`, embeds: [ new MessageEmbed().setColor("#6861fe")
                            .setTitle("📂 Thanks for opening a Ticket | What is the Probelm your Bot is having?").setDescription(ticket.message.replace("{user}", `${user}`)),
                            new MessageEmbed().setColor("ORANGE").setTitle(`${emoji.loading}  A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                        components: [
                            new MessageActionRow().addComponents([
                                new MessageButton().setStyle("SUCCESS").setLabel("Claim the Ticket").setEmoji(`<:Discord:933238543973773383>`).setCustomId("TicketClaim")
                            ])
                        ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            interaction.editReply({content: `<#${ch.id}>`, embeds: [ new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Ticket \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            })              
                        })
                    } break;
                    case "GENERAL" : {
                        await interaction.reply({content: `❓ Creating your Ticket ... `, ephemeral: true})
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        ////////////////////////
                        client.setups.set(guild.id,`Hey {user}! Thanks for opening a TICKET | General Help

                        > **Please tell us with what you need help with?**
                        > The <@&935689419757854780> will try to help you with your Problem as soon as possible!`, "ticketsystem4.message");
                        /////////////////////////
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem4");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but the Ticket System got temporarily disabled!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets4").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid4"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets4")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Ticket!** <#" + client.setups.get(user.id, "ticketid4") + ">");
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📁│t・`;
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
                            client.setups.push("TICKETS", user.id, "tickets4");
                            client.setups.set(user.id, ch.id, "ticketid4");
                            client.setups.set(ch.id, user.id, "user");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501> ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left}`, embeds: [ new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for opening a Ticket | What do you need?").setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("ORANGE").setTitle(`${emoji.loading}  A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            interaction.editReply(`<#${ch.id}>`, {content: `<#${ch.id}>`, embeds: [ new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Ticket \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            })              
                        })
                    } break;
                    case "TEAMAPPLY" : {
                        await interaction.reply({content: `<:Editing:964405541415837716> Creating your Ticket ... `, ephemeral: true})
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        ////////////////////////
                        /////////////////////////
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem_teamapply");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but the Team Application are closed!**\n> Our Team is currently not looking for new Members").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets_teamapply").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid_teamapply"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets_teamapply")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Ticket!** <#" + client.setups.get(user.id, "ticketid_teamapply") + ">");
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📜│ta・`;
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
                            client.setups.push("TICKETS", user.id, "tickets_teamapply");
                            client.setups.set(user.id, ch.id, "ticketid_teamapply");
                            client.setups.set(ch.id, user.id, "user");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501> ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left}`, embeds: [ new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for opening an Application | Tell us something about you!").setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("ORANGE").setTitle(`${emoji.loading}  A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            interaction.editReply(`<#${ch.id}>`, {content: `<#${ch.id}>`, embeds: [ new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Application \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            })              
                        })
                    }break;
                    case "PARTNERAPPLY" : {
                        await interaction.reply({content: `<:Partner:964404569536868392> Creating your Ticket ... `, ephemeral: true})
                        Cooldown.set(user.id, Date.now())
                        setTimeout(()=>Cooldown.delete(user.id), cooldownamount);
                        ////////////////////////
                        /////////////////////////
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem_partnerapply");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but the Partner Application are closed!**\n> We are currently not looking for new Partners").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets_partnerapply").includes(user.id)) {
                            try{
                                let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid_partnerapply"));
                                if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                    client.setups.remove("TICKETS", user.id, "tickets_partnerapply")
                                }
                                else {
                                    stopped = true;
                                    return interaction.editReply(":x: **You already have an opened Ticket!** <#" + client.setups.get(user.id, "ticketid_partnerapply") + ">");
                                }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `🤝│pa・`;
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
                            client.setups.push("TICKETS", user.id, "tickets_partnerapply");
                            client.setups.set(user.id, ch.id, "ticketid_partnerapply");
                            client.setups.set(ch.id, user.id, "user");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501> ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left}`, embeds: [ new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for opening an Partner-Application | Tell us something about you!").setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("ORANGE").setTitle(`${emoji.loading}  A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            interaction.editReply(`<#${ch.id}>`, {content: `<#${ch.id}>`, embeds: [ new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Application \`${ch.name}\` has been created!`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            })              
                        })
                    }break;
                    case "CUSTOMBOT" : {

                        await interaction.reply({content: `<:Bot_Flag:933238334946439211> Creating your Custom-Bot-Ordering-Ticket ... `, ephemeral: true})
                        ////////////////////////
                        /////////////////////////
                        
                        let ticket = client.setups.get(guild.id, "ticketsystem8");
                        if (!ticket.enabled) return interaction.editReply(":x: **We are currently not doing custom Bots, sorry!**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets8").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid8"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets8")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an custom Bot Order!** <#" + client.setups.get(user.id, "ticketid8") + ">");
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📁│t・`;
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
                            client.setups.set(user.id, ch.id, "ticketid8");
                            client.setups.set(ch.id, user.id, "user");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501> ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left}`, embeds: [ new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for ordering a Custom Bot!").setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("ORANGE").setTitle(`${emoji.loading}  A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            interaction.editReply(`<#${ch.id}>`, {content: `<#${ch.id}>`, embeds: [ new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Custom Bot Order-Ticket \`${ch.name}\` has been created! | CUSTOM BOT`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            })              
                        });
                    }break;
                    case "SOURCECODE" : {
                        await interaction.reply({content: `<a:Valid_Code_Developer:933742305398116363> Creating your Source-Code-Ordering-Ticket ... `, ephemeral: true})

                        let ticket = client.setups.get(guild.id, "ticketsystem7");
                        if (!ticket.enabled) return interaction.editReply(":x: **Sorry but we are currently not selling our Public Bots / Template Bots Source Codes**").catch(e => console.warn(e.stack ? String(e.stack).grey : String(e).grey));
                        var stopped = false;
                        if (client.setups.get("TICKETS", "tickets7").includes(user.id)) {
                            try{
                            let ch = guild.channels.cache.get(client.setups.get(user.id, "ticketid7"));
                            if(!ch || ch == null || !ch.id || ch.id == null || [`${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`, `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`].includes(ch.parentId)){
                                client.setups.remove("TICKETS", user.id, "tickets7")
                            }
                            else{
                                stopped = true;
                                return interaction.editReply(":x: **You already have an opened Ticket!** <#" + client.setups.get(user.id, "ticketid7") + ">");
                            }
                            }catch{

                            }
                        }
                        if(stopped) return;
                        let channelname = `📁│t・`;
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
                            client.setups.set(user.id, ch.id, "ticketid7");
                            client.setups.set(ch.id, user.id, "user");
                            ch.send({content: `<@${user.id}> <:arrow:964989830272532501> ${ticket.adminroles.map(r => `<@&${r}>`).join(" | ")} ${emoji.arrow_left}`, embeds: [ new MessageEmbed().setColor("#6861fe").setTitle("📂 Thanks for ordering a Source Code!").setDescription(ticket.message.replace("{user}", `${user}`)),
                                new MessageEmbed().setColor("ORANGE").setTitle(`${emoji.loading}  A Staff Member will claim the Ticket soon!`).setDescription(`**Dear ${user}!**\n> This Ticket will be claimed by a Staff Member as soon as possible!\n\n> *He/She/They will help you then!*\n\n> **Meanwhile, make sure to list us all Information needed!**`).setFooter("Thanks for choosing Nexuss Development ✌️", "https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png")],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton().setStyle("PRIMARY").setLabel("Claim").setEmoji("📝").setCustomId("TicketClaim")
                                ])
                            ]}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                            interaction.editReply(`<#${ch.id}>`, {content: `<#${ch.id}>`, embeds: [ new MessageEmbed()
                                .setColor("#6861fe")
                                .setTitle(`📂 Your Ticket \`${ch.name}\` has been created! | SOURCE CODE`)
                                .addField("💢 ATTENTION", `> *Please make sure, to fill out the Information the Bot sent you in the CHANNEL*`)
                                .addField("💬 The Channel:",`<#${ch.id}>`)], ephemeral: true}).then(msg=>{
                            })              
                        });
                    }break;
                }
            }
        }
    });
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