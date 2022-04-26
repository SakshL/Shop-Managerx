const { MessageEmbed, Message } = require("discord.js");
const config = require("../../../config.json");
const ee = require("../../../embed.json");
const role = require("../../../settings.json");
const mainconfig  = require("../../../mainconfig");

//Here the command starts
module.exports = {
    name : "clear",

	//running the command with the parameters: client, message, args, user, text, prefix
  run: async (client, message, args) => {
    if (!message.member.permissions.has(role.Roles.OwnerRoleId || role.Roles.FounderId || role.Roles.CoOwnerRoleId || role.Roles.AdminRoleId || role.Roles.ModRoleId))  return;
		let clearamount = Number(args[0]);
		if(!clearamount || clearamount > 1000 || clearamount < 1) return message.reply("Please provide a number between 1 and 1000!");
		try{
				message.channel.bulkDelete(clearamount);
                message.delete().catch(e => console.log("Couldn't delete msg, this is a catch to prevent crash"))
                
		}catch{
			message.reply({embeds: [new MessageEmbed()
                .setColor("RED")
                .setTitle(`❌ ERROR | An Error Occurred`)
                .setDescription(`\`\`\`AN Unknown Error Occurred, Please Try Again.\`\`\``)
                .setFooter(message.guild.name, message.guild.iconURL())
                .setTimestamp()
            ]});
            await message.react("<:no:933239221836206131>")
		}
		
	}
}