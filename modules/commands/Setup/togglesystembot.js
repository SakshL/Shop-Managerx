const Discord = require("discord.js");
const { swap_pages2 } = require("../../utilfunctions")
const { Roles } = require("../../../settings.json");
const emoji = require("../../../emoji")
module.exports = {
    name: require("path").parse(__filename).name, 
    category: "Setup", 
    aliases: [  ], 
    description: "", 
    run: async (client, message, args, prefix) => {
        if (message.member.roles.highest.rawPosition < message.guild.roles.cache.get(Roles.OwnerRoleId).rawPosition)
            return message.reply(`<:no:933239221836206131> You are not allowed to execute this Command!`);
        client.setups.set(message.guild.id, !client.setups.get(message.guild.id, "ticketsystem3.enabled"), "ticketsystem3.enabled")
        return message.reply(`> ✅ **The SYSTEM BOT ORDER SYSTEM is now: \`${client.setups.get(message.guild.id, "ticketsystem3.enabled") ? "Enabled" : "Disabled"}\`**`)
    }
}