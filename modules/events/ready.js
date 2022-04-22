var CronJob = require('cron').CronJob;
/**
 * STARTING THE MODULE WHILE EXPORTING THE CLIENT INTO IT
 * @param {*} client 
 */
const mainconfig = require("./../../mainconfig.js");

 module.exports = async (client) => {


    client.on("ready", () => {
      
        const stringlength = 69;
        console.log("\n")
        console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.yellow)
        console.log(`     ┃ `.bold.yellow + " ".repeat(-1+stringlength-` ┃ `.length)+ "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + `Discord Bot is online!`.bold.yellow + " ".repeat(-1+stringlength-` ┃ `.length-`Discord Bot is online!`.length)+ "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + ` /--/ ${client.user.tag} /--/ `.bold.yellow+ " ".repeat(-1+stringlength-` ┃ `.length-` /--/ ${client.user.tag} /--/ `.length)+ "┃".bold.yellow)
        console.log(`     ┃ `.bold.yellow + " ".repeat(-1+stringlength-` ┃ `.length)+ "┃".bold.yellow)
        console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.yellow)
        console.log(` [ONLINE] `.yellow + `Logged in as: `.green + `${client.user.tag}`.yellow);
        let counter = 0;
        var job = new CronJob('0 * * * * *', function () {
            console.log(" [Status Update] :: ".bgCyan.red + String(counter).bgCyan.brightRed)
            switch(counter){
                case 0: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusOne}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter++;
                }break;
                case 1: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusTwo}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter++;
                }break;
                case 2: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusThree}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter++;
                }break;
                case 3: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusFour}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter++;
                }break;
                case 4: {
                    try{client.user.setActivity(`Over ${client.guilds.cache.reduce((a, b) => a + b?.memberCount, 0)} Members!`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter++;
                }break;
                case 5: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusFive}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter++;
                }break;
                case 6: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusSix}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter=0;
                }break;
                default: {
                    try{client.user.setActivity(`${mainconfig.BotSettings.StatusSeven}`, {type: "PLAYING"})}catch(e){console.log(String(e))}
                    counter = 0;
                    counter++;
                }break;
            }
        }, null, true, 'Europe/Berlin');
        job.start();
    })
}