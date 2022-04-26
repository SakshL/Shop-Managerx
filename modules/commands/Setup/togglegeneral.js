const { Discord, MessageEmbed }  = require("discord.js");
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
            return message.reply({embeds: [new MessageEmbed()
                .setColor("RED")
                .setTitle(`❌ ERROR | An Error Occurred`)
                .setDescription(`\`\`\`You are not allowed to execute this Command!\`\`\``)
                .setFooter(message.guild.name, message.guild.iconURL())
                .setTimestamp()
            ]});
        client.setups.set(message.guild.id, !client.setups.get(message.guild.id, "ticketsystem4.enabled"), "ticketsystem4.enabled")
        return message.reply(`> ✅ **The General Ticket Support is now: \`${client.setups.get(message.guild.id, "ticketsystem4.enabled") ? "Enabled" : "Disabled"}\`**`)
    }
}