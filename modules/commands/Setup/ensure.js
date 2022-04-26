const { MessageEmbed, Permissions } = require("discord.js");
const { theDB } = require("../../utilfunctions")
const { Roles } = require("../../../settings.json");
const emoji = require("../../../emoji")

module.exports = {
    name: require("path").parse(__filename).name, 
    category: "Setup", 
    aliases: [ "savedb"], 
    description: "", 
    run: async (client, message, args, prefix) => {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            theDB(client, message.guild);
            await message.react("<a:yes:933239140718358558>")
            await message.reply(`✅ ***Succesfully Saved ALL The DataBase***`).catch(() => {}); 
        } else {
            message.reply({embeds: [new MessageEmbed()
                .setColor("RED")
                .setTitle(`❌ ERROR | An Error Occurred`)
                .setDescription(`\`\`\`You Don't Have Permission To Run This Command\`\`\``)
                .setFooter(message.guild.name, message.guild.iconURL())
                .setTimestamp()
            ]});
            await message.react("<:no:933239221836206131>")
        }
    }
}
