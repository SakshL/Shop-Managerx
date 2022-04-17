//IMPORTING NPM PACKAGES
const Discord = require('discord.js');
const colors = require("colors");
const fs = require("fs");
//Create the bot client
const client = new Discord.Client({
        allowedMentions: {
        	parse: [ "roles", "users" ],
        	repliedUser: false,
	},
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
	],
});
client.on("warn", e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
client.on("debug", e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
client.on("rateLimit", e => console.log(JSON.stringify(e).grey))
//DEFINE THE CONFIGURATION FILE
client.config = require("./config.json");
//Load the paypal System
require("./modules/paypal/index")(client);
/**
 * @INFO LOGGING INTO THE BOT CLIENT
 */
client.login(client.config.token);
