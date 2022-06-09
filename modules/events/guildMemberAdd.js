const Discord = require("discord.js");
/**
 * STARTING THE MODULE WHILE EXPORTING THE CLIENT INTO IT
 * @param {*} client 
 */

const mainconfig = require("../../mainconfig.json")
const emoji = require("..")
module.exports = async (client) => {

    client.on("guildMemberAdd", async member => {


        const { Permissions: { FLAGS } } = require("discord.js")
        if (member.guild && member.user.bot) {
            console.log("BOT GOT ADDED")
            if (member.permissions.has(FLAGS.ADMINISTRATOR) || member.permissions.has(FLAGS.MANAGE_GUILD) || member.permissions.has(FLAGS.KICK_MEMBERS) || member.permissions.has(FLAGS.BAN_MEMBERS) || member.permissions.has(FLAGS.MANAGE_CHANNELS) || member.permissions.has(FLAGS.MANAGE_ROLES) || member.permissions.has(FLAGS.MANAGE_WEBHOOKS)) {
                let AuditData = await member.guild.fetchAuditLogs({
                    limit: 1,
                    type: "BOT_ADD"
                }).then((audit => {
                    return audit.entries.first()
                })).catch((e) => {
                    console.log(e);
                    console.log("KICK BOT!");
                    return member.kick().catch(console.warn);
                })
                let AddedUserID = AuditData.executor.id;
                const WhitelistedUsers = [`${mainconfig.OwnerInformation.OwnerID}`];
                if (WhitelistedUsers.includes(AddedUserID)) {
                    console.log(`Invited by ${AddedUserID}`);
                } else {
                    console.log("KICK BOT!");
                    return member.kick().catch(console.warn);
                }
            } else {
                console.log("NO PERMS BOT", member.permissions.has(FLAGS.ADMINISTRATOR))
            }
        }
    })

    client.on("guildMemberAdd", member => {
        const welcomeChannel = member.guild.channels.cache.find(ch => ch.id === `${mainconfig.GeneralChat}`);
        if (!member.guild || member.guild.id != `${mainconfig.ServerID}`) return
        if (member.user.bot) {
            setTimeout(async () => {
                member.roles.set([`${mainconfig.MemberRoleID}`]).catch(() => { })
            }, 5000)
            return;
        }
        if (!member.user.bot) {
            try {
                welcomeChannel.send(`👋! ${member.user} welcome to **nexusx**`);
                member.send({
                    embeds: [new Discord.MessageEmbed()
                        .setColor("#6861fe")
                        .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))

                        .setDescription(`
Welcome ${member.user} to <:Discord:933238543973773383>  [Nexusx Development](https://nexusx.me)<:Discord:933238543973773383>!

> We are very happy to see you here!

> You can pick up your roles in <#${mainconfig.SelfRoleChannelID.toString()}>

> If you want to order something, you can check out the features in <#${mainconfig.FeaturesChannelID.toString()}> and place an order in <#${mainconfig.OrderChannelID}>

> Please mind the RULES <#${mainconfig.RulesChannel.toString()}>

**Other than that! ENJOY!** :v:`)]
                }).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });
            } catch (e) {
                console.log(e)
            }
            setTimeout(async () => {
                try {
                    let mem = await member;

                    //if (!mem.roles.cache.has("779028739178233886")) mem.roles.add("779028739178233886").catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
                    if (!mem.roles.cache.has(`${mainconfig.AllMemberRoles}`)) mem.roles.add(`${mainconfig.AllMemberRoles}`).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });

                    if (!mem.roles.cache.has(`${mainconfig.AllMemberRoles}`)) mem.roles.add(`${mainconfig.AllMemberRoles}`).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });
                    if (!mem.roles.cache.has(`${mainconfig.AllMemberRoles}`)) mem.roles.add(`${mainconfig.AllMemberRoles}`).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });
                    if (!mem.roles.cache.has(`${mainconfig.AllMemberRoles}`)) mem.roles.add(`${mainconfig.AllMemberRoles}`).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });
                    //CHECK IF USER HAS BOT ROLE
                    if (mem.roles.cache.has(`${mainconfig.MemberRoleID}`)) mem.roles.remove(`${mainconfig.MemberRoleID}`).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });
                    if (mem.roles.cache.has(`${mainconfig.AllMemberRoles}`)) mem.roles.remove(`${mainconfig.AllMemberRoles}`).catch(e => { console.warn(e.stack ? String(e.stack).grey : String(e).grey) });
                } catch (E) {
                    console.log(E)
                }
            }, 3000)
        }

    })
}