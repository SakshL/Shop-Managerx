const Discord = require("discord.js");
const { theDB } = require("../../utilfunctions")
const { Roles } = require("../../../settings.json");
const emoji = require("../../../emoji")

module.exports = {
    name: require("path").parse(__filename).name, 
    category: "Setup", 
    aliases: [ "savedb" ], 
    description: "", 
    run: async (client, message, args, prefix) => {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            theDB(client, message.guild);
            await message.channel.send(`✅ **Succesfully Saved ALL The DataBase**`).catch(() => {});//like emoji
        } else {
            message.reply(`<:no:933239221836206131> No Valid Permissions`)
        }
    }
}
