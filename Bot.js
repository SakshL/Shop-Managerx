//IMPORTING NPM PACKAGES
const Discord = require('discord.js');
const colors = require("colors");
const fs = require("fs");
const Enmap = require("enmap");
var CronJob = require('cron').CronJob;
const mainconfig = require("./mainconfig.js");

module.exports = (client) => {
    client.on("warn", e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
    client.on("debug", e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
    client.on("rateLimit", e => console.log(JSON.stringify(e).grey))
    //DEFINE THE CONFIGURATION FILE

    client.config = require("./config.json");
    //Define some global collections
    client.createingbotmap = new Discord.Collection();
    client.cooldowns = new Discord.Collection();
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();

    client.currentServerIP = String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3].split(",")[0];

    client.allServers = {
        current: client.config.servers[client.currentServerIP] ? client.config.servers[client.currentServerIP] : Object.keys(client.config.servers)[0],
        least: null,
        stats: [],
    }


    //CREATING THE DATABASES
    client.setups = new Enmap({ name: "setups", dataDir: "./dbs/others" });
    client.bots = new Enmap({ name: "bots", dataDir: "./dbs/bots" });
    client.payments = new Enmap({ name: "payments", dataDir: "./dbs/payments" });
    client.payments.ensure("payments", { users: [] });
    client.payments.ensure("invitepayments", { users: [] });
    client.staffrank = new Enmap({ name: "staffrank", dataDir: "./dbs/others" });
    client.ticketdata = new Enmap({ name: "ticketdata", dataDir: "./dbs/others" });
    /**
     * @INFO LOADING SYSTEMS AND MODULES
     */
    require("./modules/commands")(client)
    require("./modules/dashboard/index")(client)
    require("./modules/tickets/OrderSystem")(client)
    require("./modules/tickets/TicketSystem")(client)
    require("./modules/others/payment_system")(client)
    require("./modules/others/getleastServer")(client)
    // require('./index_other_tasks')
    /**
     * @INFO LOGGING INTO THE BOT CLIENT
     */
    client.login(client.config.token);
    client.on("ready", () => {

        const stringlength = 69;
        console.log("\n")
        console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.yellow)
        console.log(`     ┃ `.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + `Discord Bot is online!`.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length - `Discord Bot is online!`.length) + "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + ` /--/ ${client.user.tag} /--/ `.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length - ` /--/ ${client.user.tag} /--/ `.length) + "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.yellow)
        console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.yellow)
        console.log(` [ONLINE] `.yellow + `Logged in as: `.green + `${client.user.tag}`.yellow);
        let counter = 0;
        var job = new CronJob('0 * * * * *', function () {
            console.log(" [Status Update] :: ".bgCyan.red + String(counter).bgCyan.brightRed)
            switch (counter) {
                case 0: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusOne}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter++;
                } break;
                case 1: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusTwo}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter++;
                } break;
                case 2: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusThree}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter++;
                } break;
                case 3: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusFour}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter++;
                } break;
                case 4: {
                    try { client.user.setActivity(`Over ${client.guilds.cache.reduce((a, b) => a + b?.memberCount, 0)} Members!`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter++;
                } break;
                case 5: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusFive}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter++;
                } break;
                case 6: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusSix}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter = 0;
                } break;
                default: {
                    try { client.user.setActivity(`${mainconfig.BotSettings.StatusSeven}`, { type: "PLAYING" }) } catch (e) { console.log(String(e)) }
                    counter = 0;
                    counter++;
                } break;
            }
        }, null, true, 'Europe/Berlin');
        job.start();
    })
}