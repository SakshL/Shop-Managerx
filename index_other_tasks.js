//IMPORTING NPM PACKAGES
const Discord = require('discord.js');
const colors = require("colors");
const Enmap = require("enmap");
//Create the bot client
const client = new Discord.Client({
    allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: false,
    },
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
    ]
});
client.on("warn", e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
client.on("debug", e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
client.on("rateLimit", e => console.log(JSON.stringify(e).grey))
    //DEFINE THE CONFIGURATION FILE
client.config = require("./config.json");
//CREATING THE DATABASES
client.ticketdata = new Enmap({ name: "ticketdata", dataDir: "./dbs/others" });
/**
 * @INFO LOADING SYSTEMS AND MODULES
 */
require("./modules/events/guildMemberAdd")(client)
require("./modules/events/guildMemberUpdate")(client)
require("./modules/events/ready")(client)
require("./modules/events/threadCreate")(client)
require("./modules/others/feedback_system")(client)
require("./modules/others/verifysystem")(client)
//require("./modules/others/guess_the_number")(client)
require("./modules/others/status_role_system")(client)
require("./modules/others/ticket_updatemsg")(client)
require("./modules/others/features")(client)
require("./modules/others/suggest")(client)
require("./modules/others/autodelete")(client)
require("./modules/others/getleastServer")(client)


client.login(client.config.token);