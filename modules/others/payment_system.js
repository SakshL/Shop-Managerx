//IMPORTING NPM PACKAGES
const Discord = require('discord.js');
const emoji = require("../../emoji");
const {
  Client
} = require('ssh2');
var CronJob = require('cron').CronJob;

/**
 * STARTING THE MODULE WHILE EXPORTING THE CLIENT INTO IT
 * @param {*} client 
 */
module.exports = async (client) => {


  /**************************************************************************
   * @INFO - NORMAL PAYMENT SYSTEM
   **************************************************************************/
  //When he leaves server send information
  client.on("guildMemberRemove", async member => {
    client.payments.ensure("payments", {
      users: []
    })
    await member.guild.members.fetch();
    let data = client.payments.get("payments")
    var botdeletes = data.users.sort((a, b) => a.timestamp - b.timestamp).filter(v => {
      return v.id == member.id
    })
    if (botdeletes && botdeletes.length > 0) {
      for (const botdelete of botdeletes) {
        try {
          let guild = client.guilds.cache.get(botdelete.guild)
          let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!ch) throw "continue";
          let bot = await guild.members.fetch(botdelete.bot).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!bot || !bot.user) throw "continue // NO BOT"
          if (!botdelete.sent) {
            client.bots.ensure(member.id, {
              bots: []
            })
            var bots = client.bots.get(member.id, "bots")
            stopBot(client, botdelete, bot, member)
            await ch.send({content: `<:leave:933722870734024724> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) Bots can be deleted, he/she left the Server!!**\n__The Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`, 
				embeds: [
				  new Discord.MessageEmbed().setColor("RED").setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Is Deleteable", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({dynamic: true})).addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He has no Bots yet!")
				]
			}).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            botdelete.sent = true;
            client.payments.remove("payments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("payments", d => botdelete, "users")
          } else {
            continue;
          }
        } catch (e) {
          console.warn(e.stack ? String(e.stack).grey : String(e).grey)
        }
      }
    }
  })
  //Check for the time every 15 seconds if he needs to pay again
  client.Jobpayments = new CronJob('0 * * * * *', async function () {
    client.payments.ensure("payments", {
      users: []
    })
    let data = client.payments.get("payments")
    var botdeletes = data.users
      .filter(d => Math.floor(d.timestamp / 1000) !== Math.floor(Date.now() / 1000)) //filter instant
      .sort((a, b) => a.timestamp - b.timestamp)
      .filter(v => {
        return Math.floor(v.time) - (Date.now() - v.timestamp) <= 0
      })
    if (botdeletes && botdeletes.length > 0) {
      for (const botdelete of botdeletes) {
        try {
          let guild = client.guilds.cache.get(botdelete.guild)
          let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!ch) continue;
          let bot = await guild.members.fetch(botdelete.bot).catch(E => {})
          if (!bot || !bot.user) {
            client.payments.remove("payments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("payments", d => botdelete, "users")
            continue
          } // NO BOT
          let member = await guild.members.fetch(botdelete.id).catch(E => {})
          if (!member || !member.user) {
            client.payments.remove("payments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("payments", d => botdelete, "users")
            continue
          } // NO MEMBER
          if (!botdelete.sent) {
            client.bots.ensure(member.id, {
              bots: []
            })
            var bots = client.bots.get(member.id, "bots")
            stopBot(client, botdelete, bot, member)
            await ch.send({content: `<a:Money_Price:935490603909799957> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) needs to Pay after ${duration(botdelete.time).map(i=>`\`${i}\``).join(" ")} (Payed at: <t:${Math.floor((Date.now() - botdelete.time) / 1000)}>) again!**\n__The Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`,
              embeds: [new Discord.MessageEmbed()
                .setColor("YELLOW")
                .addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He has no Bots yet!")
                .setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Needs to be payed again!", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({
                  dynamic: true
                }))]
            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            try {
              await member.send({content: `**You need to pay after ${duration(botdelete.time).map(i=>`\`${i}\``).join(" ")} (Payed at: <t:${Math.floor((Date.now() - botdelete.time) / 1000)}>) for your Bot again!**\n__The Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)\n\n> **Please go to <#964370140013658145> and open a Ticket, otherwise your Bot will go offline soon!**`, 
                embeds: [new Discord.MessageEmbed()
                  .setColor("YELLOW")
                  .setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Needs to be payed again!", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({
                    dynamic: true
                  }))]
              }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            } catch {}
            botdelete.sent = true;
            client.payments.remove("payments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("payments", d => botdelete, "users")
          } else {
            continue;
          }
        } catch (e) {
          console.warn(e.stack ? String(e.stack).grey : String(e).grey)
        }
      }
    }
  }, null, true, 'America/Los_Angeles');



  /**************************************************************************
   * @INFO - INVITE PAYMENT SYSTEM
   **************************************************************************/
  //When he leaves server send information
  client.on("guildMemberRemove", async member => {
    client.payments.ensure("invitepayments", {
      users: []
    })
    await member.guild.members.fetch().catch(() => {})
    let data = client.payments.get("invitepayments")
    var botdeletes = data.users.sort((a, b) => a.timestamp - b.timestamp).filter(v => {
      return v.id == member.id
    })
    if (botdeletes && botdeletes.length > 0) {
      for (const botdelete of botdeletes) {
        try {
          let guild = client.guilds.cache.get(botdelete.guild)
          let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!ch) throw "continue";
          let bot = await guild.members.fetch(botdelete.bot).catch(E => {})
          if (!bot || !bot.user) throw "continue // NO BOT"
          if (!botdelete.sent) {
            client.bots.ensure(member.id, {
              bots: []
            })
            var bots = client.bots.get(member.id, "bots")
            stopBot(client, botdelete, bot, member)
            await ch.send({content: `<:leave:933722870734024724> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) Bots can be deleted, he/she left the Server!!**\n__The INVITEPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`, 
              embeds: [new Discord.MessageEmbed().setColor("RED").setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Is Deleteable", bot.user.displayAvatarURL())
                .addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He/She has no Bots yet!")

                .setFooter(member.user.id, member.user.displayAvatarURL({
                  dynamic: true
                }))]
            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            botdelete.sent = true;
            client.payments.remove("invitepayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("invitepayments", d => botdelete, "users")
          } else {
            continue;
          }
        } catch (e) {
          console.warn(e.stack ? String(e.stack).grey : String(e).grey)
        }
      }
    }
  })
  //Check for the time every 15 seconds if he needs to pay again
  client.Jobinvitepayments = new CronJob('30 * * * * *', async function () {
    client.payments.ensure("invitepayments", {
      users: []
    })
    let data = client.payments.get("invitepayments")
    var botdeletes = data.users
      .filter(d => Math.floor(d.timestamp / 1000) !== Math.floor(Date.now() / 1000)) //filter instant
      .sort((a, b) => a.timestamp - b.timestamp)
      .filter(v => {
        return Math.floor(v.time) - (Date.now() - v.timestamp) <= 0
      })
    if (botdeletes && botdeletes.length > 0) {
      for (const botdelete of botdeletes) {
        try {
          let guild = client.guilds.cache.get(botdelete.guild)
          let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!ch) continue;
          let bot = await guild.members.fetch(botdelete.bot).catch(E => {})
          if (!bot || !bot.user) {
            client.payments.remove("invitepayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("invitepayments", d => botdelete, "users")
            continue
          } // NO BOT
          let member = await guild.members.fetch(botdelete.id).catch(E => {})
          if (!member || !member.user) {
            client.payments.remove("invitepayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("invitepayments", d => botdelete, "users")
            continue
          } // NO MEMBER
          if (!botdelete.sent) {
            client.bots.ensure(member.id, {
              bots: []
            })
            var bots = client.bots.get(member.id, "bots")
            stopBot(client, botdelete, bot, member)
            await ch.send({content: `<a:Money_Price:935490603909799957> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) needs to Pay after ${duration(botdelete.time).map(i=>`\`${i}\``).join(" ")} (Payed at: <t:${Math.floor((Date.now() - botdelete.time) / 1000)}>) again!**\n__The INVITEPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`, 
              embeds: [ new Discord.MessageEmbed()
                .setColor("YELLOW")
                .addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He/She has no Bots yet!")
                .setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Needs to be payed again!", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({
                  dynamic: true
               }))]
            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            try {
              await member.send({content: `**You need to pay after ${duration(botdelete.time).map(i=>`\`${i}\``).join(" ")} (Payed at: <t:${Math.floor((Date.now() - botdelete.time) / 1000)}>) for your Bot again!**\n__The INVITEPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)\n\n> **Please go to <#964370140013658145> and open a Ticket, otherwise your Bot will go offline soon!**`, 
                embeds: [new Discord.MessageEmbed()
                  .setColor("YELLOW")
                  .setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Needs to be payed again!", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({
                    dynamic: true
                  }))]
              }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            } catch {}
            botdelete.sent = true;
            client.payments.remove("invitepayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("invitepayments", d => botdelete, "users")
          } else {
            continue;
          }
        } catch (e) {
          console.warn(e.stack ? String(e.stack).grey : String(e).grey)
        }
      }
    }
  }, null, true, 'America/Los_Angeles');



  /**************************************************************************
   * @INFO - BOOST PAYMENT SYSTEM
   **************************************************************************/
  //When he leaves server send information
  client.on("guildMemberRemove", async member => {
    client.payments.ensure("boostpayments", {
      users: []
    })
    await member.guild.members.fetch()
    let data = client.payments.get("boostpayments")
    var botdeletes = data.users.sort((a, b) => a.timestamp - b.timestamp).filter(v => {
      return v.id == member.id
    })
    if (botdeletes && botdeletes.length > 0) {
      for (const botdelete of botdeletes) {
        try {
          let guild = client.guilds.cache.get(botdelete.guild)
          let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!ch) throw "continue";
          let bot = await guild.members.fetch(botdelete.bot).catch(E => {})
          if (!bot || !bot.user) throw "continue // NO BOT"
          if (!botdelete.sent) {
            client.bots.ensure(member.id, {
              bots: []
            })
            var bots = client.bots.get(member.id, "bots")
            stopBot(client, botdelete, bot, member)
            await ch.send({content: `<:leave:933722870734024724> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) Bots can be deleted, he/she left the Server!!**\n__The BOOSTPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`, 
              embeds: [ new Discord.MessageEmbed().setColor("RED").setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Is Deleteable", bot.user.displayAvatarURL())
                .addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He has no Bots yet!")
                .setFooter(member.user.id, member.user.displayAvatarURL({
                  dynamic: true
                }))]
            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            botdelete.sent = true;
            client.payments.remove("boostpayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("boostpayments", d => botdelete, "users")
          } else {
            continue;
          }
        } catch (e) {
          console.warn(e.stack ? String(e.stack).grey : String(e).grey)
        }
      }
    }
  })
  //When he stops boosting, send information
  client.on("guildMemberUpdate", async (oldMember, member) => {
    const oldStatus = oldMember.premiumSince;
    const newStatus = member.premiumSince;
    if (oldStatus && !newStatus) {
      client.payments.ensure("boostpayments", {
        users: []
      })
      await member.guild.members.fetch()
      let data = client.payments.get("boostpayments")
      var botdeletes = data.users.sort((a, b) => a.timestamp - b.timestamp).filter(v => {
        return v.id == member.id
      })
      if (botdeletes && botdeletes.length > 0) {
        for (const botdelete of botdeletes) {
          try {
            let guild = client.guilds.cache.get(botdelete.guild)
            let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            if (!ch) throw "continue";
            let bot = await guild.members.fetch(botdelete.bot).catch(E => {})
            if (!bot || !bot.user) throw "continue // NO BOT"
            if (!botdelete.sent) {
              client.bots.ensure(member.id, {
                bots: []
              });
              var bots = client.bots.get(member.id, "bots");
              stopBot(client, botdelete, bot, member)
              await ch.send({content: `<a:Server_Boosts:933787999387390032> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) Bots can be deleted, he/she stopped boosting us!!**\n__The BOOSTPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`, 
                embeds: [new Discord.MessageEmbed().setColor("RED").setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Is Deleteable", bot.user.displayAvatarURL())
                  .addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He has no Bots yet!")
                  .setFooter(member.user.id, member.user.displayAvatarURL({
                    dynamic: true
                  }))]
              }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
              botdelete.sent = true;
              client.payments.remove("boostpayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users");
              client.payments.push("boostpayments", d => botdelete, "users");
            } else {
              continue;
            }
          } catch (e) {
            console.warn(e.stack ? String(e.stack).grey : String(e).grey)
          }
        }
      }
    }
  })
  //Check for the time every 15 seconds if he needs to pay again
  client.Jobboostpayments = new CronJob('59 * * * * *', async function () {
    client.payments.ensure("boostpayments", {
      users: []
    })
    let data = client.payments.get("boostpayments")
    var botdeletes = data.users
      .filter(d => Math.floor(d.timestamp / 1000) !== Math.floor(Date.now() / 1000)) //filter instant
      .sort((a, b) => a.timestamp - b.timestamp)
      .filter(v => {
        return Math.floor(v.time) - (Date.now() - v.timestamp) <= 0
      })
    if (botdeletes && botdeletes.length > 0) {
      for (const botdelete of botdeletes) {
        try {
          let guild = client.guilds.cache.get(botdelete.guild)
          let ch = await client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
          if (!ch) continue;
          let bot = await guild.members.fetch(botdelete.bot).catch(E => {})
          if (!bot || !bot.user) {
            client.payments.remove("boostpayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("boostpayments", d => botdelete, "users")
            continue
          } // NO BOT
          let member = await guild.members.fetch(botdelete.id).catch(E => {})
          if (!member || !member.user) {
            client.payments.remove("boostpayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("boostpayments", d => botdelete, "users")
            continue
          } // NO MEMBER
          if (!botdelete.sent) {
            client.bots.ensure(member.id, {
              bots: []
            })
            var bots = client.bots.get(member.id, "bots")
            stopBot(client, botdelete, bot, member)
            await ch.send({content: `<a:Money_Price:935490603909799957> **${member.user} | ${member.user.tag} (\`${member.user.id}\`) needs to Pay after ${duration(botdelete.time).map(i=>`\`${i}\``).join(" ")} (Payed at: <t:${Math.floor((Date.now() - botdelete.time) / 1000)}>) again!**\n__The BOOSTPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`,
              embeds: [new Discord.MessageEmbed()
                .setColor("YELLOW")
                .addField("__ALL OF HIS/HER BOTS:__", ">>> " + bots.length > 0 ? bots.length <= 10 ? bots.map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") : bots.slice(0, 10).map(bot => `**${client.bots.get(bot, "type")}** | <@${bot}>`).join("\n") + bots.length - 10 + " More ..." : "He has no Bots yet!")
                .setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Needs to be payed again!", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({
                  dynamic: true
                }))]
            }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            try {
              await member.send({content: `**You need to pay after ${duration(botdelete.time).map(i=>`\`${i}\``).join(" ")} (Payed at: <t:${Math.floor((Date.now() - botdelete.time) / 1000)}>) for your Bot again!**\n__The BOOSTPAYMENT-Bot:__\n> ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)\n\n> **Please go to <#964370140013658145> and open a Ticket, otherwise your Bot will go offline soon!**`, 
                embeds: [new Discord.MessageEmbed()
                  .setColor("YELLOW")
                  .setDescription(`${botdelete.data}`).setAuthor(bot.user.tag + " - Needs to be payed again!", bot.user.displayAvatarURL()).setFooter(member.user.id, member.user.displayAvatarURL({
                    dynamic: true
                  }))]
              }).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            } catch {}
            botdelete.sent = true;
            client.payments.remove("boostpayments", d => d.id == botdelete.id && d.bot == botdelete.bot, "users")
            client.payments.push("boostpayments", d => botdelete, "users")
          } else {
            continue;
          }
        } catch (e) {
          console.warn(e.stack ? String(e.stack).grey : String(e).grey)
        }
      }
    }
  }, null, true, 'America/Los_Angeles');

  /**************************************************************************
   * @INFO - START THE PAYMENT SYSTEMS
   **************************************************************************/
  client.on("ready", () => {
    client.Jobinvitepayments.start();
    client.Jobboostpayments.start();
    client.Jobpayments.start();
  })
  function duration(duration, useMilli = false) {
    let remain = duration;
    let days = Math.floor(remain / (1000 * 60 * 60 * 24));
    remain = remain % (1000 * 60 * 60 * 24);
    let hours = Math.floor(remain / (1000 * 60 * 60));
    remain = remain % (1000 * 60 * 60);
    let minutes = Math.floor(remain / (1000 * 60));
    remain = remain % (1000 * 60);
    let seconds = Math.floor(remain / (1000));
    remain = remain % (1000);
    let milliseconds = remain;
    let time = {
      days,
      hours,
      minutes,
      seconds,
      milliseconds
    };
    let parts = []
    if (time.days) {
      let ret = time.days + ' Day'
      if (time.days !== 1) {
        ret += 's'
      }
      parts.push(ret)
    }
    if (time.hours) {
      let ret = time.hours + ' Hr'
      if (time.hours !== 1) {
        ret += 's'
      }
      parts.push(ret)
    }
    if (time.minutes) {
      let ret = time.minutes + ' Min'
      if (time.minutes !== 1) {
        ret += 's'
      }
      parts.push(ret)
  
    }
    if (time.seconds) {
      let ret = time.seconds + ' Sec'
      if (time.seconds !== 1) {
        ret += 's'
      }
      parts.push(ret)
    }
    if (useMilli && time.milliseconds) {
      let ret = time.milliseconds + ' ms'
      parts.push(ret)
    }
    if (parts.length === 0) {
      return ['instantly', duration]
    } else {
      return parts
    }
  }

  async function stopBot(client, botdelete, bot, member){
    let serverid = parseInt(String(botdelete.data).split("\n")[6])
    let option1 = botdelete.data.toString().split("\n")[10].split('"')[1]

    let {
        servers,
        usernames,
        passwords
    } = client.config;
    let alldata = false;
    try {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(`pm2 list | grep "${option1}" --ignore-case`, (err, stream) => {
                if (err) throw err;
                let showdata = "";
                stream.on('close', (code, signal) => {
                  setTimeout(()=>{
                      alldata = showdata.toString().split(" ")[1]
                      if(alldata){
                        let botid = parseInt(alldata)
                        console.log(`Stopping Bot on: `, servers[String(serverid)], "With ID: ", botid)
                        try{
                          client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(ch=>{
                            ch.send({content: `<a:check:964989203656097803> **Deleted the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)\n> **BOT-ID:** \`${botid}\`, **Server:** \`${serverid}\``})
                            try{
                              member.send({content: `<a:check:964989203656097803> **Stopped your Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)\n> **This is because you need to pay again / stopped paying us / left the Server!**`})
                            }catch (e){
                              console.log(e)
                            }
                          })
                        }catch (e){
                          console.log(e)
                        }
                        conn.exec(`pm2 delete ${botid}`, (err, stream) => {
                          if (err) throw err;
                          conn.exec("pm2 save", (err, stream) => {
                              stream.on('close', (code, signal) => {
                                    conn.end();
                              })
                          })
                      });
                      } else {
                        try{
                          client.channels.fetch("964370139225145485").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)}).then(ch=>{
                            ch.send({content: `<:no:933239221836206131> **Unable to Stop the Bot:** ${bot.user} | ${bot.user.tag} (\`${bot.user.id}\`)`})
                          })
                        }catch (e){
                          console.log(e)
                        }
                        conn.end();
                      }
                      
                  }, 300)
                }).on('data', (data) => {
                    showdata += data + "\n";
                }).stderr.on('data', (data) => {
                    showdata += "{ERROR}  ::  " + data.toString().split("\n").join("\n{ERROR}  ::  ") + "\n";
                });
            });
        }).connect({
            host: servers[String(serverid)],
            port: servers[String(serverid)] == "45.131.67.9" ? 4047 : 22,
            username: usernames[serverid],
            password: passwords[serverid]
        });
    } catch (e){
      console.log(e)
    }
  }
  
}
