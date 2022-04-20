const express = require("express");
const http = require("http");
const url = require(`url`);
const path = require(`path`);
const ejs = require("ejs");
const fse = require('fs-extra');
const fs = require("fs")
const scp = require("node-scp").Client;
const passport = require(`passport`);
const bodyParser = require("body-parser");
const Strategy = require(`passport-discord`).Strategy;
const Discord = require('discord.js');
const Path = require("path"); //That's the dashboard for creating bots and managing bots with my OWN unique system 
const {
    Client
} = require('ssh2');
const config = require("../../config.json")
const mainconfig = require("../../mainconfig")
module.exports = client => {
    client.on("ready", () => {
        let milratoGuild = client.guilds.cache.get(`${mainconfig.ServerID}`)
        if (!milratoGuild) return;
        console.log("Loading DashBoard settings".brightGreen)
        
        const app = express();
        const session = require(`express-session`);
        const MemoryStore = require(`memorystore`)(session);
        


        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((obj, done) => done(null, obj));
        passport.use(
            new Strategy({
                clientID: client.user.id,
                clientSecret: client.config.secret,
                callbackURL: client.config.callback, scope: [`identify`]
            },
                (accessToken, refreshToken, profile, done) => {
                    process.nextTick(() => done(null, profile));
                }));
        app.use(session({
            store: new MemoryStore({ checkPeriod: 86400000 }),
            secret: `#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n`,
            resave: false,
            saveUninitialized: false,
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, './views'))
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use('/', express.static(__dirname + '/views'));
        app.use("/", express.static(__dirname + '/', {dotfiles: "allow"}));
        app.use('/', express.static(__dirname + '/public'));
        const checkAuth = (req, res, next) => {
            if (req.isAuthenticated()) return next();
            req.session.backURL = req.url;
            res.redirect("/login");
        };
        app.get(`/login`, (req, res, next) => {
            if (req.session.backURL) {
                req.session.backURL = req.session.backURL;
            } else if (req.headers.referer) {
                const parsed = url.parse(req.headers.referer);
                if (parsed.hostname === app.locals.domain) { req.session.backURL = parsed.path; }
            } else { req.session.backURL = `/`; }
            next();
        }, passport.authenticate(`discord`, {
            prompt: `none`
        }));
        app.get(`/callback`, passport.authenticate(`discord`, {
            failureRedirect: "/"
        }), async (req, res) => {
            res.redirect(`/`)
        });
        //When the website is loaded on the main page, render the main page + with those variables
        app.get("/", (req, res) => {
            res.render("index", {
                req: req,
                user: req.isAuthenticated() ? req.user : null,
                botClient: client,
                callback: client.config.callback,
                BotConfig: client.config,
            });
        })
        //Logout the user and move him back to the main page
        app.get(`/logout`, function (req, res) {
            req.session.destroy(() => {
                req.logout();
                res.redirect(`/`);
            });
        });

        app.get("/team", checkAuth, async (req, res) => {
          if (!req.isAuthenticated() || !req.user) {
                return res.redirect("/?error=true&message=" + encodeURIComponent("Login First!"));
            }
    res.render("team", {
                req: req,
                user: req.isAuthenticated() ? req.user : null,
                milratoGuild: milratoGuild,
                botClient: client,
    });
  });

        app.get("/staff", checkAuth, async (req, res) => {
            if (!req.isAuthenticated() || !req.user) {
                return res.redirect("/?error=true&message=" + encodeURIComponent("Login First!"));
            }
            let member = milratoGuild.members.cache.get(req.user.id);
            if (!member) {
                try {
                    member = await milratoGuild.members.fetch(req.user.id);
                } catch (err) {
                    console.error(`Couldn't fetch ${req.user.id} in ${milratoGuild.name}: ${err}`);
                }
            }
            if (!member) return res.redirect("/?error=true&message=" + encodeURIComponent("I don't have any Data of you, try asking NotSaksh about it."));
            if (member && !member.permissions.has("ADMINISTRATOR") && !member.roles.cache.has("935689526586790028") && !member.roles.cache.has("935689219458863214") && !member.roles.cache.has("936782688495497226") && !member.roles.cache.has("936392972952543282"))
                return res.redirect("/?error=true&message=" + encodeURIComponent("This site is not meant for you! :)"));
            res.render("staff", {
                req: req,
                user: req.isAuthenticated() ? req.user : null,
                milratoGuild: milratoGuild,
                botClient: client,
                callback: client.config.callback,
                BotConfig: client.config,
            });
        })
        app.get("/profile", checkAuth, async (req, res) => {
            if (!req.isAuthenticated() || !req.user) {
                return res.redirect("/?error=true&message=" + encodeURIComponent("Login First!"));
            }
            let member = milratoGuild.members.cache.get(req.user.id);
            if (!member) {
                try {
                    member = await milratoGuild.members.fetch(req.user.id);
                } catch (err) {
                    console.error(`Couldn't fetch ${req.user.id} in ${milratoGuild.name}: ${err}`);
                }
            }
            if (!member) return res.redirect("/?error=true&message=" + encodeURIComponent("I don't have any Data of you, try asking Saksh about it."));
            if (member && !member.permissions.has("ADMINISTRATOR") && !member.roles.cache.has("935689526586790028") && !member.roles.cache.has("935689219458863214") && !member.roles.cache.has("936782688495497226") && !member.roles.cache.has("936392972952543282"))
                return res.redirect("/?error=true&message=" + encodeURIComponent("This site is not meant for you! :)"));
            res.render("profile", {
                req: req,
                user: req.isAuthenticated() ? req.user : null,
                milratoGuild: milratoGuild,
                botClient: client,
                callback: client.config.callback,
                BotConfig: client.config,
            });
        })

        app.get("/createbot", checkAuth, async (req, res) => {
            if (!req.isAuthenticated() || !req.user) {
                return res.redirect("/?error=true&message=" + encodeURIComponent("Login First!"));
            }
            let member = milratoGuild.members.cache.get(req.user.id);
            if (!member) {
                try {
                    member = await milratoGuild.members.fetch(req.user.id);
                } catch (err) {
                    console.error(`Couldn't fetch ${req.user.id} in ${milratoGuild.name}: ${err}`);
                }
            }
            if (!member) return res.redirect("/?error=true&message=" + encodeURIComponent("I don't have any Data of you, try asking Saksh about it."));
            if (client.createingbotmap.has("Creating")) return res.redirect("/?error=true&message=" + encodeURIComponent("Someone else is alread creating a Bot"));
            if (client.getStats) return res.redirect("/?error=true&message=" + encodeURIComponent("I'm starting right now, Please wait until i fetched the least Used node!"));
            if (!member.permissions.has("ADMINISTRATOR") && !member.roles.cache.has("935689219458863214") && !member.roles.cache.has("964370138570842160") && !member.roles.cache.has("831972877480755251"))
                return res.redirect("/?error=true&message=" + encodeURIComponent("This site is not meant for you! :)"));
            res.render("createbot", {
                req: req,
                user: req.isAuthenticated() ? req.user : null,
                milratoGuild: milratoGuild,
                botClient: client,
                callback: client.config.callback,
                BotConfig: client.config,
            });
        })
        app.post("/createbot", checkAuth, async (req, res) => {
            try {
                let member = milratoGuild.members.cache.get(req.user.id);
                if (!member) {
                    try {
                        member = await milratoGuild.members.fetch(req.user.id);
                    } catch (err) {
                        console.error(`Couldn't fetch ${req.user.id} in ${milratoGuild.name}: ${err}`);
                    }
                }
                await delay(750);
                if (!member) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Can't Information Data about you!"));
                if (!member.permissions.has("ADMINISTRATOR") && !member.roles.cache.has("935689219458863214") && !member.roles.cache.has("964370138570842160") && !member.roles.cache.has("831972877480755251"))
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are not allowed to do that!"));
                let { bottype, channel, prefix, status, statustype, token, owner, avatar, footertext, color, filename, botid } = req.body;
                if (!channel)
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Please select the right Channel!"));
                if (!bottype)
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Please select the right BOTTYPE!"));
                var ticketChannel = milratoGuild.channels.cache.get(channel) || await milratoGuild.channels.fetch(channel).catch(() => { }) || false;
                // console.log(ticketChannel)
                if (!ticketChannel)
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Could not find the Ticket Channel"));
                let BotType = "Default";
                let BotDir = "Default";
                if (ticketChannel.parentId === mainconfig.TicketCategorys.SystemBotOrderCategory) {
                    BotType = "System Bot";
                    BotDir = "SYSTEMBOTS";
                }
                if (ticketChannel.parentId === mainconfig.TicketCategorys.MusicBotOrderCategory) {
                    BotType = "Music Bot";
                    BotDir = "MusicBots";
                }
                console.log(bottype,BotDir)
              if (bottype !== BotDir) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are not allowed to create this Bot Type in that Ticket!"));
                if (!prefix) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the PREFIX!"));
                if (!status) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the STATUS!"));
                if (!statustype) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the STATUSTYPE!"));
                if (!token) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the BOT TOKEN!"));
                if (!owner) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the OWNERID!"));
                if (!avatar) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the BOT-AVATAR!"));
                if (!footertext) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the FOOTER-TEXT!"));
                if (!color) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the BOTCOLOR!"));
                if (!filename) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the FILENAME!"));
                if (!botid) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("You are missing the BOT-ID!"));
                //Format all PROBLEMATICS
                filename = filename.split(" ").join("_");
                filename = filename.replace(/[&\/\\#!,+()$~%.'\s":*?<>{}]/g, '_');
                avatar = avatar.split(" ").join("");
                token = token.split(" ").join("");
                color = color.split(" ").join("");
                botid = botid.split(" ").join("");
                prefix = prefix.split(" ").join("");
                owner = owner.split(" ").join("");

                /**
                 * CREATE THE REMOTE HOST CONNECTION DATA
                 */
                 const serverId = client.allServers.least ? client.allServers.least : client.currentServerIP.split(".")[3];
                 const remote_server = {
                     host: client.config.servers[serverId], 
                     port: 22, 
                     username: client.config.usernames[serverId], 
                     password: client.config.passwords[serverId], 
                 };


                console.table({ bottype, channel, prefix, status, statustype, token, owner, avatar, footertext, color, filename, botid, serverId })
                //Check for ERRORS
                if (owner.length < 17 || owner.length > 19) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Invalid Owner ID, that would be a valid example: `921430546813419550`"))
                if (botid.length < 17 || botid.length > 19) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Invalid Bot ID, that would be a valid example: `720351927581278219`"))
                if (token.length != "NzQ4MDg3OTA3NTE2MTUzODg5.X0YVJw.Shmvprj9eW_yfApntj7QUM0sZ_Y".length) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("INVALID TOKEN"))
                if (color.length != 7 || !color.includes("#")) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("NOT A VALID HEX COLOR, That would be a valid COLOR `#ffee33`"))
                let validurl = isvalidurl(avatar)
                if (!validurl) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Not a Valid Bot-Avatar"))
                if (client.createingbotmap.has("Creating")) return res.redirect("/createbot?error=true&message=" + encodeURIComponent("Someone else is alread creating a Bot"));
                //set the anti double creation map value to true
                client.createingbotmap.set("CreatingTime", Date.now());
                client.createingbotmap.set("Creating", ticketChannel.id);
                client.bots.ensure(owner, { "bots": [] });
                client.staffrank.push(member.id, Date.now(), "createdbots")
                client.channels.fetch(`${mainconfig.BoosterID.toString()}`).then(channel => {
                    try {
                        client.users.fetch(owner).then(user => {
                            channel.send({ embeds: [new Discord.MessageEmbed().setColor("#57F287").setFooter(member.user.tag + " | ID: " + member.id, member.user.displayAvatarURL({ dynamic: true })).setDescription(`<@${member.id}> Executed: \`BotCreation - Website\`, for: ${user}, \`CLANBOT_${filename}\`, BOT: <@${botid}>`)] }).catch(console.log)
                        }).catch(e => {
                            channel.send({ embeds: [new Discord.MessageEmbed().setColor("#57F287").setFooter(member.user.tag + " | ID: " + member.id, member.user.displayAvatarURL({ dynamic: true })).setDescription(`<@${member.id}> Executed: \`BotCreation - Website\` , for: ${owner}, \`CLANBOT_${filename}\`, BOT: <@${botid}>`)] }).catch(console.log)
                        })
                    } catch {
                        channel.send({ embeds: [new Discord.MessageEmbed().setColor("#57F287").setFooter(member.user.tag + " | ID: " + member.id, member.user.displayAvatarURL({ dynamic: true })).setDescription(`<@${member.id}> Executed: \`BotCreation - Website\`, for: ${owner}, \`CLANBOT_${filename}\`, BOT: <@${botid}>`)] }).catch(console.log)
                    }
                }).catch(console.log)
                const srcDir = `${process.cwd()}/servicebots/${BotDir}/template`;
                let destDir = `${process.cwd()}/servicebots/${BotDir}/${filename}`;
                console.log(client.allServers.least, client.allServers.current)
                const sshclient = await scp(remote_server)
                /**
                 * CHECK IF BOT ALREADY EXISTS
                 */
                try {
                    let res = await sshclient.exists(destDir);
                    if (res) {
                        filename = `${filename}_2`;
                        destDir = `${process.cwd()}/servicebots/${BotDir}/${filename}`;
                        res = await sshclient.exists(destDir);
                        if (res) {
                            client.createingbotmap.delete("CreatingTime");
                            client.createingbotmap.delete("Creating");
                            console.error(e);
                            return res.redirect("/createbot?error=true&message=" + encodeURIComponent(`${destDir} already exists use another NAME!`.substring(0, 100)))
                        }
                    }
                } catch (e) {
                    client.createingbotmap.delete("CreatingTime");
                    client.createingbotmap.delete("Creating");
                    console.error(e);
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                }




                /**
                 * Download botconfig to a tempbotconfig
                 */
                try {
                    await sshclient.downloadDir(`${srcDir}/botconfig/`, `${srcDir}/tempbotconfig/`)
                } catch (e) {
                    client.createingbotmap.delete("CreatingTime");
                    client.createingbotmap.delete("Creating");
                    console.error(e);
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                }


                /**
                 * EDIT THE BOT CONFIG.JSON FILE
                 */
                const ch = member.user;
                let config = require(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/config.json`);
                config.status.text = status;
                config.status.type = statustype ? statustype : "PLAYING";
                config.status.url = "https://twitch.tv/#";
                config.ownerIDS = [`${mainconfig.OwnerInformation.OwnerID}`];
                config.ownerIDS.push(owner);
                config.prefix = prefix;
                config.token = token;
                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/config.json`, JSON.stringify(config, null, 3), async (e) => {
                    if (e) {
                        client.createingbotmap.delete("CreatingTime");
                        client.createingbotmap.delete("Creating");
                        console.error(e);
                        return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                    }
                });


                /**
                 * EDIT THE BOT EMBED.JSON FILE
                 */
                let embed = require(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/embed.json`);
                embed.color = color;
                embed.footertext = footertext;
                embed.footericon = avatar;
                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig/embed.json`, JSON.stringify(embed, null, 3), async (e) => {
                    if (e) {
                        client.createingbotmap.delete("CreatingTime");
                        client.createingbotmap.delete("Creating");
                        console.error(e);
                        return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                    }
                });



                /**
                 * UPLOAD THE FOLDER
                 */
                try {
                    await sshclient.uploadDir(`${srcDir}/tempbotconfig/`, `${srcDir}/botconfig/`)
                } catch (e) {
                    client.createingbotmap.delete("CreatingTime");
                    client.createingbotmap.delete("Creating");
                    console.error(e);
                    return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                }

                //close the SSHCLIENT
                sshclient.close()


                /**
                 * DELETE THE tempbotconfig FOLDER
                 */
                try {
                    fs.rmSync(`${process.cwd()}/servicebots/${BotDir}/template/tempbotconfig`, { recursive: true });
                } catch (e) {
                    console.error(e)
                }



                /**
                 * CREATE THE NEW BOT AND START IT
                 */
                let failed = false;
                const conn = new Client();
                await new Promise((resolve, reject) => {
                    conn.on('ready', () => {
                        console.log(`EXECUTING`.brightGreen, `cp -r '${srcDir}' '${destDir}'; cd '${destDir}'; pm2 start ecosystem.config.js`);
                        conn.exec(`cp -r '${srcDir}' '${destDir}'; cd '${destDir}'; pm2 start ecosystem.config.js`, async (err, stream) => {
                            if (err) {
                                client.createingbotmap.delete("CreatingTime");
                                client.createingbotmap.delete("Creating");
                                console.error(err);
                                failed = true;
                                res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(err.message ? err.message : err).substring(0, 100)))
                                conn.end();
                                return resolve(true);
                            }
                            stream.on('close', async (code, signal) => {
                                if (failed) {
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    conn.end();
                                    return resolve(true);
                                }
                                setTimeout(() => {
                                    conn.exec("pm2 save", async (err, stream) => {
                                        if (err) {
                                            client.createingbotmap.delete("CreatingTime");
                                            client.createingbotmap.delete("Creating");
                                            console.error(err);
                                            failed = true;
                                            res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(err.message ? err.message : err).substring(0, 100)))
                                            conn.end();
                                            return resolve(true);
                                        }
                                        stream.on('close', async (code, signal) => {
                                            conn.end();
                                            resolve(true);
                                        }).on('data', (data) => {

                                        }).stderr.on('data', (data) => {

                                        });
                                    })
                                }, 250);
                            }).on('data', (data) => {

                            }).stderr.on('data', async (data) => {
                                if (data && data.toString().length > 1) {
                                    client.createingbotmap.delete("CreatingTime");
                                    client.createingbotmap.delete("Creating");
                                    console.error(data.toString());
                                    failed = true;
                                    res.redirect("/createbot?error=true&message=" + encodeURIComponent(data.toString().substring(0, 100)))
                                    return resolve(true);
                                }
                            });
                        })
                    }).connect(remote_server);
                }).catch(async (err) => {
                    client.createingbotmap.delete("CreatingTime");
                    client.createingbotmap.delete("Creating");
                    console.error(err);
                    failed = true;
                    res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(err.message ? err.message : err).substring(0, 100)))
                });

                if (failed) return;

                try {
                    milratoGuild.members.fetch(owner).then(member => member.roles.add("964370138507931694"))
                } catch (e) {
                    console.error(e)
                }
                var botuser = await client.users.fetch(botid);
                try {
                    client.users.fetch(owner).then(user => {
                        user.send({
                            content: `***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                            embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                        }).catch(e => {
                            console.log(e)
                            ticketChannel.send({
                                content: `<@${user.id}> PLEASE SAVE THIS MESSAGE, YOUR DMS ARE DISABLED! (via aScreenshot for example)\n***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                            }).catch(() => { }).then(msg => {
                                msg.pin().catch(() => { })
                            })
                        }).then(msg => {
                            msg.pin().catch(() => { })
                        })
                        user.send({
                            content: `<@${owner}> | **Created by: <@${member.id}> (\`${member.user.tag}\` | \`${member.id}\`)**`,
                            embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready to be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                            ]
                        }).catch(console.error);
                    }).catch(() => { });
                } catch (e) {
                    console.error(e)
                }
                ticketChannel.send({
                    content: `<@${owner}> | **Created by: <@${member.id}> (\`${member.user.tag}\` | \`${member.id}\`)**`,
                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                        .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready to be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                        .addField("<:like:938142052087124008> Rate us on TRUSTPILOT", `> ***We would love it, if you could give us a __HONEST__ Rating on [Trustpilot](https://de.trustpilot.com/review/nexusx.me)*** <3`)
                    ]
                }).catch(() => { });
                client.bots.push(owner, botid, "bots")
                client.bots.set(botid, BotType, "type")
                client.bots.set(botid, `> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``, "info")
                client.createingbotmap.delete("CreatingTime");
                client.createingbotmap.delete("Creating");
                ch.send({
                    content: `✅ ***BOT CREATION WAS SUCCESSFUL***\n\n> Here is just the Bot Creation Information, if the Bot User needs Support etc. so that you have access to it!\n\n> **Go back**: <#${ticketChannel.id}>`,
                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                }).catch(e => { })
                res.redirect("/createbot?successBot=true&message=Creating%20The%20Bot")
                try {
                    ticketChannel.permissionOverwrites.edit(botuser.id, {
                        SEND_MESSAGES: true,
                        EMBED_LINKS: true,
                        VIEW_CHANNEL: true,
                        READ_MESSAGE_HISTORY: true,
                        ATTACH_FILES: true,
                        ADD_REACTIONS: true
                    }).catch(() => { });
                } catch { }

                /**
                    * WRITE THE DATABASE
                    */
                client.bots.ensure(owner, {
                    bots: []
                })
                client.bots.push(owner, botid, "bots")
                client.bots.set(botid, BotType, "type")
                client.bots.set(botid, `> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${serverId}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``, "info")
                client.createingbotmap.delete("CreatingTime");
                client.createingbotmap.delete("Creating");


                /*
                const ch = member.user;
                let config = require(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/config.json`);
                let embed = require(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/embed.json`);
                config.status.text = status;
                config.status.type = statustype ? statustype : "PLAYING";
                config.status.url = "https://twitch.tv/#";
                config.ownerIDS = [`${mainconfig.OwnerInformation.OwnerID}`];
                config.ownerIDS.push(owner);
                config.prefix = prefix;
                config.token = token;
                var globerror = false;
                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/config.json`, JSON.stringify(config, null, 3), async (e) => {
                    if (e) {
                        client.createingbotmap.delete("CreatingTime");
                        client.createingbotmap.delete("Creating");
                        console.error(e);
                        return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                    }
                });
                embed.color = color;
                embed.footertext = footertext;
                embed.footericon = avatar;
                await fs.writeFile(`${process.cwd()}/servicebots/${BotDir}/template/botconfig/embed.json`, JSON.stringify(embed, null, 3), async (e) => {
                    if (e) {
                        client.createingbotmap.delete("CreatingTime");
                        client.createingbotmap.delete("Creating");
                        console.error(e);
                        return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                    }
                });
                if (globerror) return;
                setTimeout(async () => {
                    const srcDir = `${process.cwd()}/servicebots/${BotDir}/template`;
                    const destDir = `${process.cwd()}/servicebots/${BotDir}/${filename}`;
                    fse.copy(srcDir, destDir, {
                            overwrite: true
                    })
                    .then(async () => {
                        require("child_process").exec(`pm2 start ecosystem.config.js`, {
                            cwd: destDir
                        })
                        try {
                            milratoGuild.members.fetch(owner).then(member => member.roles.add("937130001495646328"))
                        } catch (e) {
                            console.error(e)
                        }
                        var botuser = await client.users.fetch(botid);
                        try {
                            client.users.fetch(owner).then(user => {
                                user.send({
                                    content: `***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                }).catch(e => {
                                    ticketChannel.send({
                                        content: `<@${user.id}> PLEASE SAVE THIS MESSAGE, YOUR DMS ARE DISABLED! (via aScreenshot for example)\n***IF YOU ARE HAVING PROBLEMS, or need a restart, or something else! THEN SEND US THIS INFORMATION!!!***\n> This includes: \`BotChanges\`, \`Restarts\`, \`Deletions\`, \`Adjustments & Upgrades\`\n> *This message is also a proof, that you are the original Owner of this BOT*`,
                                        embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                                    }).catch(() => {}).then(msg => {
                                        msg.pin().catch(() => {})
                                    })
                                }).then(msg => {
                                    msg.pin().catch(() => {})
                                })
                                user.send({
                                    content: `<@${owner}> | **Created by: <@${member.id}> (\`${member.user.tag}\` | \`${member.id}\`)**`,
                                    embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                        .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready 2 be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                                    ]
                                }).catch(() => {});
                            }).catch(() => {});
                        } catch (e) {
                            console.error(e)
                        }
                        ticketChannel.send({
                            content: `<@${owner}> | **Created by: <@${member.id}> (\`${member.user.tag}\` | \`${member.id}\`)**`,
                            embeds: [new Discord.MessageEmbed().setColor(client.config.color).addField("📯 Invite link: ", `> [Click here](https://discord.com/oauth2/authorize?client_id=${botuser.id}&scope=bot&permissions=8)`)
                                .addField("💛 Support us", `> **Please give us <#${mainconfig.FeedBackChannelID.toString()}> and stop at <#941439058629001246> so that we can continue hosting Bots!**`).setTitle(`\`${botuser.tag}\` is online and ready 2 be used!`).setDescription(`<@${botuser.id}> is a **${BotType}** and got added to: <@${owner}> Wallet!\nTo get started Type: \`${prefix}help\``).setThumbnail(botuser.displayAvatarURL())
                                .addField("Rate us on TRUSTPILOT", `> ***We would love it, if you could give us a __HONEST__ Rating on [Trustpilot](https://de.trustpilot.com/review/nexusx.me)*** <3`)
                            ]
                        }).catch(() => {});
                        client.bots.push(owner, botid, "bots")
                        client.bots.set(botid, BotType, "type")
                        client.bots.set(botid, `> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``, "info")
                        client.createingbotmap.delete("CreatingTime");
                        client.createingbotmap.delete("Creating");
                        ch.send({
                            content: `✅ ***BOT CREATION WAS SUCCESSFUL***\n\n> Here is just the Bot Creation Information, if the Bot User needs Support etc. so that you have access to it!\n\n> **Go back**: <#${ticketChannel.id}>`,
                            embeds: [new Discord.MessageEmbed().setColor(client.config.color).setDescription(`> **Path:**\n\`\`\`yml\n${destDir}\n\`\`\`\n> **Server:**\n\`\`\`yml\n${String(Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), [])), [])).split(".")[3]}\n\`\`\`\n> **Command:**\n\`\`\`yml\npm2 list | grep "${filename}" --ignore-case\n\`\`\`\n> **Application Information:**\n\`\`\`yml\nLink: https://discord.com/developers/applications/${botid}\nName: ${botuser ? `${botuser.tag}\nIcon: ${botuser.displayAvatarURL()}` : `>>${filename}<<`}\nOriginalOwner: ${client.users.cache.get(owner) ? client.users.cache.get(owner).tag + `(${client.users.cache.get(owner).id})` : owner}\`\`\``).setThumbnail(botuser.displayAvatarURL())]
                        }).catch(e => { })
                        res.redirect("/createbot?successBot=true&message=Creating%20The%20Bot")
                        require("child_process").exec(`pm2 save`)
                        try {
                            ticketChannel.permissionOverwrites.edit(botuser.id, {
                                SEND_MESSAGES: true,
                                EMBED_LINKS: true,
                                VIEW_CHANNEL: true,
                                READ_MESSAGE_HISTORY: true,
                                ATTACH_FILES: true,
                                ADD_REACTIONS: true
                            }).catch(() => {});
                        } catch {}
                    })
                    .catch(async e => {
                        client.createingbotmap.delete("CreatingTime");
                        client.createingbotmap.delete("Creating")
                        return res.redirect("/createbot?error=true&message=" + encodeURIComponent(String(e.message ? e.message : e).substring(0, 100)))
                    });
                }, 100)*/
            } catch (e) {
                console.error(e)
            }
        });
        /**
         * @START THE WEBSITE
         */
         try {
            app.use("*", (req, res, next) => {
                if (req.headers['x-forwarded-proto'] !== 'https')  return res.redirect('https://' + req.headers.host + req.url);
                else return next();
            });
            const key = fs.readFileSync("/etc/letsencrypt/live/dash.nexusx.dev/privkey.pem", `utf8`);
            const cert = fs.readFileSync("/etc/letsencrypt/live/dash.nexusx.dev/fullchain.pem", `utf8`);
            const ca = fs.readFileSync("/etc/letsencrypt/live/dash.nexusx.dev/chain.pem", `utf8`);
            var httpsoptions = { key: key, cert: cert, ca: ca };
            const https = require(`https`).createServer(httpsoptions, app);
            https.listen(443, () => { console.log(`[${client.config.callback.replace("/callback", "").replace("http://", "https://")}]: HTTPS-Website running on 443 port.`)});
        }catch(e){
            console.warn(e)
        }
        app.listen(8080, () => {
            console.log(`[${client.config.callback.replace("/callback", "").replace("https://", "http://")}]: HTTP-Website running on 8080 port.`)
        });
    })

}

//validate a url
function isvalidurl(u) {
    if (!u) return false;
    var url = u.toLowerCase();
    if ((url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".gif") || url.endsWith(".webp") || url.endsWith(".webm") || url.endsWith(".png")) &&
        (url.startsWith("http://") || url.startsWith("https://"))) return true;
    else return false;
}
//Wait for X MS
function delay(delayInms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}