
const Discord = require('discord.js');
const moment = require('moment');
const fs = require('fs')
const { Roles } = require("../settings.json");
const mainconfig = require("../mainconfig");
const emoji = require("../emoji")
module.exports = {
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
}

function isValidTicket(channel) {
    let validCategories = [
        `${mainconfig.VaildCats}`,
        `${mainconfig.ApplyTickets.PartnerApply}`,
        `${mainconfig.ApplyTickets.PartnerApply}`,
        `${mainconfig.ApplyTickets.PartnerApply}`,
        `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        `${mainconfig.OwnerInformation.NotSakshTicket}`,
        `${mainconfig.StaffApply}`,
        `${mainconfig.OwnerTicket}`,
        `${mainconfig.ApplyTickets.PartnerApply}`,
        `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`,
        `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`
    ];
    if (!validCategories.includes(channel.parentId)) return false;
    return true;
}
//get a bot search
function GetBot(message, arg) {
    var errormessage = `<:no:933239221836206131> I failed finding that Bot...`;
    return new Promise(async (resolve, reject) => {
        var args = arg,
            client = message.client;
        if (!client || !message) return reject("CLIENT IS NOT DEFINED")
        if (!args || args == null || args == undefined) args = message.content.trim().split(/ +/).slice(1);
        let user = message.mentions.users.first();
        if (!user && args[0] && args[0].length == 18) {
            user = await client.users.fetch(args[0])
            if (!user) return reject(errormessage)
            if (user.bot) return resolve(user);
            return reject(`<:no:933239221836206131> USER IS NOT A BOT...`)
        } else if (!user && args[0]) {
            let alluser = await message.guild.members.fetch()
            alluser = [...alluser.values()].filter(member => member.user.bot == true).map(member => String(member.user.tag).toLowerCase())
            user = alluser.find(user => user.startsWith(args.join(" ").toLowerCase()))
            user = message.guild.members.cache.find(me => String(me.user.tag).toLowerCase() == user)
            if (!user || user == null || !user.id) {
                alluser = await message.guild.members.fetch()
                alluser = [...alluser.values()].filter(member => member.user.bot == true).map(member => String(member.displayName + "#" + member.user.discriminator).toLowerCase())
                user = alluser.find(user => user.startsWith(args.join(" ").toLowerCase()))
                user = message.guild.members.cache.find(me => String(me.displayName + "#" + me.user.discriminator).toLowerCase() == user)
                if (!user || user == null || !user.id) return reject(errormessage)
            }
            user = await client.users.fetch(user.user.id)
            if (!user) return reject(errormessage)
            if (user.bot) return resolve(user);
            return reject(`<:no:933239221836206131> USER IS NOT A BOT...`)
        } else {
            user = message.mentions.users.first() || message.author;
            if (user.bot) return resolve(user);
            return reject(`<:no:933239221836206131> USER IS NOT A BOT...`)
        }
    })
}
//get a user search
function GetUser(message, arg) {
    var errormessage = `<:no:933239221836206131> I failed finding that User...`;
    return new Promise(async (resolve, reject) => {
        var args = arg,
            client = message.client;
        if (!client || !message) return reject("CLIENT IS NOT DEFINED")
        if (!args || args == null || args == undefined) args = message.content.trim().split(/ +/).slice(1);
        let user = message.mentions.users.first();
        if (!user && args[0] && args[0].length == 18) {
            user = await client.users.fetch(args[0])
            if (!user) return reject(errormessage)
            return resolve(user);
        } else if (!user && args[0]) {
            let alluser = message.guild.members.cache.map(member => String(member.user.tag).toLowerCase())
            user = alluser.find(user => user.startsWith(args.join(" ").toLowerCase()))
            user = message.guild.members.cache.find(me => String(me.user.tag).toLowerCase() == user)
            if (!user || user == null || !user.id) {
                alluser = message.guild.members.cache.map(member => String(member.displayName + "#" + member.user.discriminator).toLowerCase())
                user = alluser.find(user => user.startsWith(args.join(" ").toLowerCase()))
                user = message.guild.members.cache.find(me => String(me.displayName + "#" + me.user.discriminator).toLowerCase() == user)
                if (!user || user == null || !user.id) return reject(errormessage)
            }
            user = await client.users.fetch(user.user.id)
            if (!user) return reject(errormessage)
            return resolve(user);
        } else {
            user = message.mentions.users.first() || message.author;
            return resolve(user);
        }
    })
}5
//format ms
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
        let ret = time.hours + ' Hr'
        if (time.hours !== 1) {
            ret += 's'
        }
        parts.push(ret)
    }
    if (time.minutes) {
        let ret = time.minutes + ' Min'
        if (time.minutes !== 1) {
            ret += 's'
        }
        parts.push(ret)

    }
    if (time.seconds) {
        let ret = time.seconds + ' Sec'
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
//validate a url
function isvalidurl(u) {
    if (!u) return false;
    url = u.toLowerCase();
    if ((url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".gif") || url.endsWith(".webp") || url.endsWith(".webm") || url.endsWith(".png")) &&
        (url.startsWith("http://") || url.startsWith("https://"))) return true;
    else return false;
}
//Wait for X MS
function delay(delayInms) {
    try {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}
//Set / Ensure the db
function theDB(client, guild) {
    client.setups.ensure("TICKETS", {
        tickets: [], //WAITINGROOM BOT
        tickets2: [], //MUSIC BOT
        tickets3: [], // BOT
        tickets4: [], //Ticket System
        tickets5: [], //Administration Bot
        tickets6: [], //RYTHM CLONE
        tickets7: [], //SOURCE CODE
        tickets8: [], //Custom Bot
        tickets9: [], //Modmail
        tickets10: [],
        tickets11: [],
        tickets12: [],
        tickets13: [],
        tickets_partnerapply: [], //Partner apply
        tickets_teamapply: [] //Team apply
    })
    //SYSTEM BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.ApplyTickets.PartnerApply}`,
        message: `Hey {user}! Thanks for ordering a **System Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | discord.gg/nexusx\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`8 Invites\`, \`1€ / Month\`, \`8€ / Year\`

    __**Payment Methods:**__
    > [Paypal](https://paypal.me/simonNotSaksh), PaySafe, Sofort, Boosting or \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem3");
    //MUSIC BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.ApplyTickets.PartnerApply}`,
        message: `Hey {user}! Thanks for ordering a 🎵 **MUSIC BOT**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | discord.gg/nexusx\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`4 Invites\`, \`0.50€ / Month\`, \`4€ / Year\`

    __**Payment Methods:**__
    > [Paypal](https://paypal.me/simonNotSaksh), PaySafe, Sofort, Boosting or \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem2");
    //RYTHM CLONE
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering a **Rythm Clone**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | .gg/milrato\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`7 Invites\`, \`2€ / Year\`, \`5€ == Lifetime\`

    __**Payment Methods:**__
    > [Paypal](https://www.paypal.me/MilratoDevelopment), [PaySafe Card, Sofort, Others](https://bero-host.de/spenden/qgswlxrzgtll), \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem6");
    //SOURCE CODE
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.OwnerInformation.NotSakshTicket}`,
        message: `Hey {user}! Thanks for opening a TICKET buying a <a:Valid_Code_Developer:933742305398116363> **SOURCE CODE**
    \`\`\`diff
    - Please tell us what Source Code you want to buy and with what Payment Method!
    \`\`\`
    <:arrow:964989830272532501> **What Source Code do you want?**
    __**Here is a short overview of our Prices:**__
    > <:Discord:933238543973773383> <@!734513783338434591> / <@!784364932149280778> | **\`75€\`**
    > <:24_7_Radio:964682810478690324> <@!758796384689192981> | **\`50€\`**
    > <:Public_Waitingroom:964413129389912134> <@!848598637856030721> | **\`25€\`**
    > <:Music_Mixer:964683298339164160> <@!851512749082804285> | **\`25€\`**
    >  <@!742672021422342165> | **\`25€\`**
    > <@!826082973853155359> | **\`20€\`**
    > <:SocialPoster:964683470217556008> <@!855541205505015829> | **\`15€\`**
    > <:Milrato_Global:964683561217187901> <@!858798131587448852> | **\`15€\`**

    __**Payment Methods:**__
    > [Paypal](https://www.paypal.me/MilratoDevelopment), [PaySafe Card, Sofort, Others](https://bero-host.de/spenden/qgswlxrzgtll)


    The <@&${Roles.OwnerRoleId}> will help you soon! (Or a: <@&${Roles.CoOwnerRoleId}> / <@&${Roles.AdminRoleId}>)`,
        adminroles: [Roles.OwnerRoleId, Roles.CoOwnerRoleId, Roles.AdminRoleId],
    }, "ticketsystem7");
    //Custom Bot
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`,
        message: `Hey {user}! Thanks for opening a TICKET buying a <:earlyverifiedbotdev:962706464391172217> **CUSTOM BOT**
    \`\`\`diff
    - Please tell us what features the Bot should have!
    \`\`\`
    <:arrow:964989830272532501> Name, Prefix, Avatar, Colorschema
    <:arrow:964989830272532501> Features, If Music, Lavalink yes/no?
    <:arrow:964989830272532501> When do you need it to be finished?
    <:arrow:964989830272532501> How much are you willing to spend?

    __**Payment Methods:**__
    > [Paypal](https://paypal.me/saksh), PaySafe Card or Sofort


    The <@&936782688495497226> will help you soon! (Or a: <@&935688563805278309>)`,
        adminroles: [Roles.OwnerRoleId, Roles.CoOwnerRoleId],
    }, "ticketsystem8");
    //ADMINISTRATION BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering an 🚫 **Administration Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | .gg/milrato\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`5 Invites\`, \`2€ / Year\`, \`5€ == Lifetime\`

    __**Payment Methods:**__
    > [Paypal](https://www.paypal.me/MilratoDevelopment), [PaySafe Card, Sofort, Others](https://bero-host.de/spenden/qgswlxrzgtll), \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem5");
    //Mod Mail BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.ModMailBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering a 📨 **Mod-Mail Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | https://discord.gg/nexusx\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`3 Invites\`, \`1€ / 100 Days\`, \`2€ / Year\`

    __**Payment Methods:**__
    > [Paypal](https://paypal.me/simonNotSaksh), PaySafe Card, Sofort, Boosting once or \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem9");
    //Waitingroom BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.ApplyTickets.PartnerApply}`,
        message: `Hey {user}! Thanks for ordering a 🕐 **Waitingroom Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | https://discord.gg/nexusx\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`3 Invites\`, \`1€ / 100 Days\`, \`2€ / Year\`

    __**Payment Methods:**__
    > [Paypal](https://paypal.me/simonNotSaksh), PaySafe Card, Sofort, Boosting once or \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem");
    //NSFW & FUN BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering a 🕹️ **NSFW & FUN Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | .gg/milrato\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`3 Invites\`, \`1.5€ / Year\`, \`3€ == Lifetime\`

    __**Payment Methods:**__
    > [Paypal](https://www.paypal.me/MilratoDevelopment), [PaySafe Card, Sofort, Others](https://bero-host.de/spenden/qgswlxrzgtll), \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem10");
    //SECURITY BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering a 🚨 **Security Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | .gg/milrato\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`4 Invites\`, \`2€ / Year\`, \`5€ == Lifetime\`

    __**Payment Methods:**__
    > [Paypal](https://www.paypal.me/MilratoDevelopment), [PaySafe Card, Sofort, Others](https://bero-host.de/spenden/qgswlxrzgtll), \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem11");
    //LAVA MUSIC BOT
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering a  **Lava Music Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | .gg/milrato\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`7 Invites\`, \`2€ / Year\`, \`5€ == Lifetime\`

    __**Payment Methods:**__
    > [Paypal](https://www.paypal.me/MilratoDevelopment), [PaySafe Card, Sofort, Others](https://bero-host.de/spenden/qgswlxrzgtll), \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem12");
    //24/7 Music Bot
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for ordering a :notes: **24/7 Music Bot**

    **Please tell us all of those Informations!** | Otherwise, we can't create your Bot quickly!
    > 
    > <:arrow:964989830272532501> **\` 1. \` What should be the Bot Name?**
    > *(The Bot's Username)*
    > 
    > <:arrow:964989830272532501> **\` 2. \` What should be the PREFIX?**
    > *(The Letter(s) Infront of each Command, e.g: \`!\`)*
    > 
    > <:arrow:964989830272532501> **\` 3. \` What should be the AVATAR?**
    > *(The Bot's Profile Picture)*
    > 
    > <:arrow:964989830272532501> **\` 4. \` What should be the EMBED COLOR?**
    > *(The Color on the Left Side of Embeds)*
    > 
    > <:arrow:964989830272532501> **\` 5. \` What should be the STATUS?**
    > *(e.g: \`!help | https://discord.gg/nexusx\`)*
    > 
    > <:arrow:964989830272532501> **\` 6. \` What should be the STATUS TYPE?** 
    > *(\`PLAYING\` / \`WATCHING\` / \`LISTENING\` / \`STREAMING\` / \`COMPETING\`)*
    > 
    > <:arrow:964989830272532501> Do you have any wishes?

    __**Price:**__
    > \`7 Invites\`, \`0.50€ / Month\`, \`6€ / Year\`

    __**Payment Methods:**__
    > [Paypal](https://paypal.me/simonNotSaksh), PaySafe Card, Sofort, Boosting once or \`INVITES\`

    *Someone will help you soon*`,
        adminroles: [Roles.NewSupporterRoleId, Roles.SupporterRoleId, Roles.BotCreatorRoleId]
    }, "ticketsystem13");
    //ticket counter db
    client.setups.ensure("COUNTER", {
        number: 421
    })
    //PARTNERAPPLY
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        msgid: "848239378942001172",
        channelid: "840491251278676008",
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for opening a Partner-Application
    \`\`\`diff
    - Please tell us some Informations!
    \`\`\`
    __Please write a **TEXT**, not just answer the Qeustions!!__

    **Questions you __need__ to answer:**
    > How old are you and what is your name?
    > Where are you from / What is your Timezone?
    > What is your Discord Server (link)?
    > What can **you** offer us?
    > How do you expect that the Partnership will be like?
    > Do you fit the conditions?
    > Be creative and show other information ...

    **NOTE:**
    > **If it's not similar to an application letter, your application will be denied immediately!**`,
        adminroles: [Roles.AdminRoleId, Roles.ModRoleId],
    }, "ticketsystem_partnerapply");
    //TEAMAPPLY
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        msgid: "938794435788034128",
        channelid: "937668925779505173",
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for opening an Application
    \`\`\`diff
    - Please tell us some Informations!
    \`\`\`
    __Please write a **TEXT**, not just answer the Qeustions!!__

    **Questions you __need__ to answer:**
    > How old are you and what is your name?
    > Where are you from / What is your Timezone?
    > How often are you online + how much time can you spend on this DC?
    > Do you have experience, if so which and how much?
    > How do you expect that the work will be for you?
    > Be creative and show other information ...

    **NOTE:**
    > **If it's not similar to an application letter, your application will be denied immediately!**`,
        adminroles: [Roles.ChiefHumanResources, Roles.HumanResources],
    }, "ticketsystem_teamapply");

    //GENERAL
    //GENERAL
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for opening a TICKET | General Help

    > **Please tell us with what you need help with?**`,
        adminroles: [Roles.SupporterRoleId, Roles.NewSupporterRoleId],
    }, "ticketsystem4");
    //HELP
    client.setups.set(guild.id, {
        enabled: true,
        guildid: guild.id,
        parentid: `${mainconfig.TicketCategorys.AllBotTicketsCategory}`,
        message: `Hey {user}! Thanks for opening a TICKET | Bot Help

    > **Please tell us with what you need help with?**
    > The <@&${Roles.SupporterRoleId}> will try to help you with your Bot Problem as soon as possible!`,
        adminroles: [Roles.SupporterRoleId, Roles.NewSupporterRoleId],
    }, "ticketsystem4");
}
//Function for creating Transcript Buffers
async function create_transcript_buffer(Messages, Channel, Guild) {
    return new Promise(async (resolve, reject) => {
        try {
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
                if (msg.type == "DEFAULT") {
                    let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:mm:ss")
                    let subcontent = `<div class="message-group">` +
                        `<div class="ath-av-container"><img class="ath-av"src="${msg.author.displayAvatarURL({ dynamic: true })}" /></div>` +
                        `<div class="messages">` +
                        `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
                    if (msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
                    subcontent += `<span class="tst">ID: ${msg.author.id} | </span>` +
                        `<span class="tst">${time} ${msg.editedTimestamp ? `(edited)` : msg.editedAt ? `(edited)` : ""}</span>` +
                        `<div class="message">`;
                    if (msg.content) {
                        subcontent += `<div class="content"><div class="markdown"><span class="preserve-whitespace">${markdowntohtml(String(msg.cleanContent ? msg.cleanContent : msg.content).replace(/\n/ig, "<br/>"))}</div></div>`
                    }
                    if (msg.embeds[0]) {
                        subcontent += `<div class="embed"><div class=embed-color-pill style=background-color:"${msg.embeds[0].color ? msg.embeds[0].color : "transparent"}"></div><div class=embed-content-container><div class=embed-content><div class=embed-text>`

                        if (msg.embeds[0].author) {
                            subcontent += `<div class="embed-ath">`;
                            if (msg.embeds[0].author.iconURL) {
                                subcontent += `<img class="embed-ath-icon" src="${msg.embeds[0].author.iconURL}">`
                            }
                            if (msg.embeds[0].author.name) {
                                subcontent += `<div class="embed-ath-name"><span class="markdown">${markdowntohtml(String(msg.embeds[0].author.name).replace(/\n/ig, "<br/>"))}</span></div>`
                            }
                            subcontent += `</div>`
                        } if (msg.embeds[0].title) {
                            subcontent += `<div class="embed-title"><span class="markdown">${markdowntohtml(String(msg.embeds[0].title).replace(/\n/ig, "<br/>"))}</span></div>`;
                        }
                        if (msg.embeds[0].description) {
                            subcontent += `<div class="embed-description preserve-whitespace"><span class="markdown" style="color: rgba(255,255,255,.6) !important;">${markdowntohtml(String(msg.embeds[0].description).replace(/\n/ig, "<br/>"))}</span></div>`;
                        }
                        if (msg.embeds[0].image) {
                            subcontent += `<div class="embed-image-container"><img class="embed-footer-image" src="${msg.embeds[0].image.url}"></div>`
                        }
                        if (msg.embeds[0].fields && msg.embeds[0].fields.length > 0) {
                            subcontent += `<div class="embed-fields">`
                            for (let i = 0; i < msg.embeds[0].fields.length; i++) {
                                subcontent += `<div class="embed-field ${msg.embeds[0].fields[i].inline ? `embed-field--inline` : ``}">`
                                const field = msg.embeds[0].fields[i]
                                if (field.key) {
                                    subcontent += `<div class="embed-field-name">${markdowntohtml(String(field.key).replace(/\n/ig, "<br/>"))}</div>`;
                                }
                                if (field.value) {
                                    subcontent += `<div class="embed-field-value">${markdowntohtml(String(field.value).replace(/\n/ig, "<br/>"))}</div>`;
                                }
                                subcontent += `</div>`
                            }
                            subcontent += `</div>`;
                        }
                        if (msg.embeds[0].footer) {
                            subcontent += `<div class="embed-footer">`;
                            if (msg.embeds[0].footer.iconURL) {
                                subcontent += `<img class="embed-footer-icon" src="${msg.embeds[0].footer.iconURL}">`
                            }
                            if (msg.embeds[0].footer.text) {
                                subcontent += `<div class="embed-footer-text"><span class="markdown">${markdowntohtml(String(msg.embeds[0].footer.text).replace(/\n/ig, "<br/>"))}</span></div>`
                            }
                            subcontent += `</div>`
                        }
                        subcontent += `</div>`;
                        if (msg.embeds[0].thumbnail && msg.embeds[0].thumbnail.url) {
                            subcontent += `<img class="embed-thumbnail" src="${msg.embeds[0].thumbnail.url}">`;
                        }
                        subcontent += `</div></div></div>`;
                    }
                    if (msg.reactions && msg.reactions.cache.size > 0) {
                        subcontent += `<div class="reactions">`
                        for (const reaction of msg.reactions.cache.map(this_Code_is_by_NotSaksh_6969 => this_Code_is_by_NotSaksh_6969)) {
                            subcontent += `<div class=reaction>${reaction.emoji.url ? `<img class="emoji emoji--small" src="${reaction.emoji.url}" alt="${"<" + reaction.emoji.animated ? "a" : "" + ":" + reaction.emoji.name + ":" + reaction.emoji.id + ">"}">` : reaction.emoji.name.toString()}<span class="reaction-count">${reaction.count}</span></div>`
                        }
                        subcontent += `</div>`
                    }
                    subcontent += `</div></div></div>`
                    messagesArray.push(subcontent);
                }
                if (msg.type == "PINS_ADD") {
                    let time = moment(msg.createdTimestamp).format("MMM DD, YYYY HH:mm:ss")
                    let subcontent = `<div class="message-group">` +
                        `<div class="ath-av-container"><img class="ath-av"src="https://cdn-0.emojis.wiki/emoji-pics/twitter/pushpin-twitter.png" style="background-color: #000;filter: alpha(opacity=40);opacity: 0.4;" /></div>` +
                        `<div class="messages">` +
                        `<span class="ath-name" title="${msg.author.username}" style="color: ${msg.member.roles.highest.hexColor};">${msg.author.tag}</span>`;
                    if (msg.author.bot) subcontent += `<span class="bot-tag">BOT</span>`;
                    subcontent += `<span class="tst" style="font-weight:500;color:#848484;font-size: 14px;">pinned a message to this channel.</span><span class="tst">${time}</span></div></div></div>`;
                    messagesArray.push(subcontent);
                }
            });
            baseHTML += `<body><div class="info"><div class="guild-icon-container"> <img class="guild-icon" src="${Guild.iconURL({ dynamic: true })}" />` +
                `</div><div class="metadata">` +
                `<div class="guild-name"><strong>Guild:</strong> ${Guild.name} (<mark>${Guild.id})</mark></div>` +
                `<div class="channel-name"><strong>Channel:</strong> ${Channel.name} (<mark>${Channel.id})</mark></div>` +
                `<div class="channel-message-count"><mark>${messagescount} Messages</mark></div>` +
                `<div class="channel-timezone"><strong>Timezone-Log-Created:</strong> <mark>${moment(Date.now()).format("MMM DD, YYYY HH:mm")}</mark> | <em>[MEZ] Europe/London</em></div>` +
                `</div></div>` +
                `<div class="chatlog">`;
            baseHTML += messagesArray.join("\n");
            baseHTML += `<div class="message-group"><div class="ath-av-container"><img class="ath-av"src="https://discord.com/assets/3437c10597c1526c3dbd98c737c2bcae.svg" /></div><div class="messages"><span class="ath-name" style="color: #ff5151;">TICKET LOG INFORMATION</span><span class="bot-tag">SUPPORT</span><span class="timestamp">Mind this Information</span><div class="message " ><div class="content"><div class="markdown"><span class="preserve-whitespace"><i><blockquote>If there are Files, Attachments, Videos or Images, they won't always be displayed cause they will be unknown and we don't want to spam an API like IMGUR!</blockquote></i></span></div></div></div></div></div></div></body></html>`;
            fs.writeFileSync(`${process.cwd()}/${Channel.name}.html`, baseHTML); //write everything in the docx file
            resolve(`${process.cwd()}/${Channel.name}.html`);
            return;
            function markdowntohtml(tomarkdown) {
                mentionReplace(tomarkdown.split(" "));
                function mentionReplace(splitted) {
                    for (arg of splitted) {
                        const memberatches = arg.match(/<@!?(\d+)>/);
                        const rolematches = arg.match(/<@&(\d+)>/);
                        const channelmatches = arg.match(/<#(\d+)>/);
                        if (rolematches) {
                            let role = Guild.roles.cache.get(rolematches[1])
                            if (role) {
                                let torpleace = new RegExp(rolematches[0], "g")
                                tomarkdown = tomarkdown.replace(torpleace, `<span title="${role.id}" style="color: ${role.hexColor};">@${role.name}</span>`);
                            }
                        }
                        if (memberatches) {
                            let member = Guild.members.cache.get(memberatches[1])
                            if (member) {
                                let torpleace = new RegExp(memberatches[0], "g")
                                tomarkdown = tomarkdown.replace(torpleace, `<span class="mention" title="${member.id}">@${member.user.username}</span>`);
                            }
                        }
                        if (channelmatches) {
                            let channel = Guild.channels.cache.get(channelmatches[1])
                            if (channel) {
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
                    parseMap.forEach(function (p) {
                        output = output.replace(p.pattern, function () {
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
                    for (i in matchList) {
                        if (!matchList.hasOwnProperty(i)) {
                            continue;
                        }
                        replacement = replacement.split("$" + i).join(matchList[i]);
                        replacement = replacement.split("$L" + i).join(matchList[i].length);
                    }
                    if (type === BLOCK) {
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
                    cleaningRuleArray.forEach(function (rule) {
                        string = string.replace(rule.match, rule.replacement);
                    });
                    return string;
                }

                let output__ = parse(tomarkdown);
                return output__;
            }
        } catch (e) {
            reject(e);
            return;
        }
    })
}
//Function for swapping Pages
async function swap_pages2(client, message, embeds) {
    let currentPage = 0;
    let cmduser = message.author;
    if (embeds.length === 1) return message.channel.send({ embeds: [embeds[0]] }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))
    let button_back = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('1').setEmoji("833802907509719130").setLabel("Back")
    let button_home = new Discord.MessageButton().setStyle('DANGER').setCustomId('2').setEmoji("🏠").setLabel("Home")
    let button_forward = new Discord.MessageButton().setStyle('PRIMARY').setCustomId('3').setEmoji('832598861813776394').setLabel("Forward")
    const allbuttons = [new Discord.MessageActionRow().addComponents([button_back, button_home, button_forward])]
    //Send message with buttons
    let swapmsg = await message.channel.send({
        content: `https://nexusx.dev/ - Help Menu`,
        embeds: [embeds[0]],
        components: allbuttons
    });
    //create a collector for the thinggy
    const collector = swapmsg.createMessageComponentCollector({ filter: (i) => i?.isButton() && i?.user && i?.user.id == cmduser.id && i?.message.author.id == client.user.id, time: 180e3 }); //collector for 5 seconds
    //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
    collector.on('collect', async b => {
        if (b?.user.id !== message.author.id)
            return b?.reply({ content: `<:no:933239221836206131> **Only the one who typed ${config.prefix}help is allowed to react!**`, ephemeral: true })
        //page forward
        if (b?.customId == "1") {
            //b?.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
            if (currentPage !== 0) {
                currentPage -= 1
                await swapmsg.edit({ embeds: [embeds[currentPage]], components: allbuttons });
                await b?.deferUpdate();
            } else {
                currentPage = embeds.length - 1
                await swapmsg.edit({ embeds: [embeds[currentPage]], components: allbuttons });
                await b?.deferUpdate();
            }
        }
        //go home
        else if (b?.customId == "2") {
            //b?.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
            currentPage = 0;
            await swapmsg.edit({ embeds: [embeds[currentPage]], components: allbuttons });
            await b?.deferUpdate();
        }
        //go forward
        else if (b?.customId == "3") {
            //b?.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
            if (currentPage < embeds.length - 1) {
                currentPage++;
                await swapmsg.edit({ embeds: [embeds[currentPage]], components: allbuttons });
                await b?.deferUpdate();
            } else {
                currentPage = 0
                await swapmsg.edit({ embeds: [embeds[currentPage]], components: allbuttons });
                await b?.deferUpdate();
            }

        }
    });

}
async function logAction(client, type, user, color, thumbnail, message) {
    let logChannelIds = {
        "botmanagement": `${mainconfig.LoggingChannelID.BotManagementChannelID}`
    };
    let channel = client.channels.cache.get(logChannelIds[`${type}`]) || await client.channels.fetch(logChannelIds[`${type}`]).catch(() => { }) || false;
    if (!channel) return console.log(message, user.tag);

    channel.send({
        embeds: [
            new Discord.MessageEmbed().setColor(color).setThumbnail(thumbnail ? thumbnail : null).setDescription(message.substr(0, 2000)).setFooter("ID: " + user.id, user.displayAvatarURL({ dynamic: true })).setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
        ]
    }).catch(() => { })
}