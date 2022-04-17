// variables
const colors = require("colors");
const Discord = require("discord.js");
ee = require("../../embed.json")
const emoji = require("../../emoji")


module.exports = async (client) => {
    client.on("messageCreate", async (message) => {
  
    if (!message.guild) return;
if (message.author.bot) return;


if (message.channel.id == "939230702703099904") {
     setTimeout(() => {
         message.delete().catch((e) => { console.log(String(e.stack).grey) })
     }, 1000);

     let suggestReplace = await message.channel.send({
         embeds: [
             new Discord.MessageEmbed()
                 .setAuthor({ name: `New Suggestion from ${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({dynamic: true})}`})
                 .setDescription("\n\nReact with *yes* if you like the suggestion, or with *no* if you don't like it.\n" + "\n>>> " +message.content )
                 .setFooter({ text: "Nexuss", iconURL: 'https://cdn.discordapp.com/attachments/936372059305566219/964968487250436206/unknown.png' })
                 .setColor(ee.color)
         ]
         
     }).catch(e => { console.log(String(e.stack).grey) });
     await suggestReplace.react(`<a:check:964989203656097803>`).then(() => { }).catch(e => { console.log(String(e.stack).grey) });
     await suggestReplace.react("<a:crossred:964647166947786843>").then(() => { }).catch(e => { console.log(String(e.stack).grey) })
    }
    })
}