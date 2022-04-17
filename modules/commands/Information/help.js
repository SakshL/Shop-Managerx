const Discord = require("discord.js");
const { swap_pages2 } = require("../../utilfunctions")
const { Roles } = require("../../../settings.json");
module.exports = {
    name: "help", 
    category: "Information", 
    aliases: ["h", "commandinfo", "cmds", "cmd", "halp"],
    description: "Returns all Commmands, or one specific command", 
    run: async (client, message, args, prefix) => {
        
        var embed1 = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setAuthor("Nexuss | Free Bots Shop | Information Commands Help", message.guild.iconURL({dynamic: true}), "https://discord.gg/notsaksh")
        .addField("\`,help\`", "*Shows all commands*", true)
        .addField("\`,invite @BOT / BOTNAME\`", "*gives u an invite link for a BOT*", true)
        .addField("\`,ping\`", "*Shows the Ping of the Bot*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,uptime\`", "*Shows the Uptime of the Bot*", true)
        .addField("\`,info wait/music/clan/etc.\`", "*Gives Information About the Bots, we offer*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,howtoorder\`", "*Shows how to order a BOT*\n*See the information in <#964370139808141365> & <#964370139808141366>!*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,owner @Bot\`", "*Shows who the Owner of the Bot is*", true)
        .addField("\`,bots @USER\`", "*Shows the Bots of a User*", true)
        .addField("\`,botdetails @BOT\`", "*Shows details about a Bot*", true)
        .addField("\`,paymentinfo @BOT\`", "*Shows the Payment Information about a Bot*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,translate from to ...\`", "*Translates Text from a Language to a Language*\n**Alias:** `tr`", true)
        .addField("\`,modifybot\`", "Shows Info how to Change a CUSTOM BOT from <#964370139808141365>*", true)
        .addField("\`,sendmessage\`", "*Shows Info how to Send a MESSAGE with a CUSTOM BOT*", true)



    var embed2 = new Discord.MessageEmbed()
        .setColor("YELLOW")
        .setAuthor("Nexuss | Free Bots Shop | STAFF TEAM Help", message.guild.iconURL({dynamic: true}), "https://discord.gg/notsaksh")
        .addField("\`,rank [@User]\`", "Shows the Rank of a User!",true)
        .addField("\`,leaderboard [Days to Show]\`", "Shows the Staff Leaderboard\n**Alias**: \`,lb\`",true)
            //.addField("\u200b", "\u200b")                
        .addField("\`,close\`", "*Closes the Current Ticket*", true)
        .addField("\`,settomato\`", "*Sets the Ticket to a Tomato Ticket*", true)
        .addField("\`,setowner\`", "*Sets the Ticket to a Owner Ticket*", true)
        .addField("\`,setmod\`", "*Sets the Ticket to a Mod+ Ticket*", true)
        .addField("\`,setimportant\`", "*Sets the Ticket into an Important State*", true)
        .addField("\`,setwaiting\`", "*Sets the Ticket into a Waiting for Customer Response State*", true)
        .addField("\`,setfinished\`", "*Sets the Ticket into a Finish State*", true)
        .addField("\`,setbot\`", "*Notifies the Bot Creators to create the Bot*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,addticket <@User>\`", "*Adds a User from the Ticket*", true)
        .addField("\`,removeticket <@User>\`", "*Removes a User from the Ticket*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,createbot\` --> Pick the Bot", "*Creates a Order-Bot*", true)
        .addField("\`,cancelcreation\`", "*Cancels the Bot Creation Protection*", true)

    var embed3 = new Discord.MessageEmbed()
        .setColor("ORANGE")
        .setAuthor("Nexuss | Free Bots Shop | Higher Staff (Bot Management Commands)", message.guild.iconURL({dynamic: true}), "https://discord.gg/notsaksh")
        .addField("\`,addbot <@USER> <@Bot <BOTTYPE>\`", "*Adds a Bot to a User*", true)
        .addField("\`,removebot <@USER> <@Bot>\`", "*Removes a Bot to a User*", true)
        .addField("\`,changebot <@USER> <@Bot> <BOTTYPE>\`", "*Changes a Bot*", true)
        .addField("\`,setneworiginalbot\`", "*sets a new original Bot info into the DB*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,payment <Time> <@User> <@Bot>\`", "*Notes the Payment*", true)
        .addField("\`,invitepayment <Time> <@User> <@Bot>\`", "*Notes the Payment for Invites*", true)
        .addField("\`,boostpayment <Time> <@User> <@Bot>\`", "*Notes the Payment for 2xBoosts*", true)
        .addField("\`,removepayment <Time> <@Bot>\`", "*Removes the Payment(s) of this Bot, so that you can set the Payment(s) again!*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,closeall\`", "*Deletes all closed Tickets*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,botmanagement\` | \`,bm\`", "*Manages the Bots on all hosts [Use only when needed]*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,startbot <@Bot>\`", "*Starts a Bot*", true)
        .addField("\`,restartbot <@Bot>\`", "*Restarts a Bot*", true)
        .addField("\`,stopbot <@Bot>\`", "*Stops a Bot*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,removebothost <@Bot>\`", "*Removes a Bot from the Host*", true)
        .addField("\`,recoverbothost <@Bot>\`", "*Recovers a Bot, which got removed from the Host*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,forcestartbot <@Bot>\`", "*Force-Starts a Bot*", true)
        .addField("\`,forcerestartbot <@Bot>\`", "*Force-Restarts a Bot*", true)
        .addField("\`,forcestopbot <@Bot>\`", "*Force-Stops a Bot*", true)
        .addField("\`,noguildremovebothost\`", "*Removes bot host of all no guild bots*", true)

        //togglegeneral, togglepartnerapply, toggleteamapply
    var embed4 = new Discord.MessageEmbed()
        .setColor("RED")
        .setAuthor("Nexuss | Free Bots Shop | Setup Commands", message.guild.iconURL({dynamic: true}), "https://discord.gg/notsaksh")
        .addField("\`,togglepartnerapply\`", "*Enables/Disables the Partner Apply System*", true)
        .addField("\`,toggleteamapply\`", "*Enables/Disables the Team Apply System*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,togglegeneral\`", "*Enables/Disables the General Ticket System*", true)
        .addField("\`,togglesource\`", "*Enables/Disables the Source Order*", true)
        .addField("\`,togglecustom\`", "*Enables/Disables the Custom Source Order*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,toggleclanbot\`", "*Enables/Disables the Clan Bot Order*", true)
        .addField("\`,toggleadmin\`", "*Enables/Disables the Admin Bot Order*", true)
        .addField("\`,togglemusicbot\`", "*Enables/Disables the Music Bot Order*", true)
        .addField("\`,togglerythmclone\`", "*Enables/Disables the Rythm Clone Order*", true)
        .addField("\`,togglewaitingroom\`", "*Enables/Disables the Waitingroom Bot Order*", true)
        .addField("\`,togglemodmail\`", "*Enables/Disables the Mod Mail Bot Order*", true)
            //.addField("\u200b", "\u200b")
        .addField("\`,ensure\` / \`,savedb\` / \`,resetsettings\`", "*Ensures / Saves the Database, so that the default Data get's applied*", true)
        
    swap_pages2(client, message, [
        embed1,
        embed2,
        embed3,
        embed4,
    ]);
    }
}