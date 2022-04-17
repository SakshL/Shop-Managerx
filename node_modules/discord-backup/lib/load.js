"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEmbedChannel = exports.loadBans = exports.loadEmojis = exports.loadAFK = exports.loadChannels = exports.loadRoles = exports.loadConfig = void 0;
var util_1 = require("./util");
/**
 * Restores the guild configuration
 */
var loadConfig = function (guild, backupData) {
    var configPromises = [];
    if (backupData.name) {
        configPromises.push(guild.setName(backupData.name));
    }
    if (backupData.iconBase64) {
        configPromises.push(guild.setIcon(Buffer.from(backupData.iconBase64, 'base64')));
    }
    else if (backupData.iconURL) {
        configPromises.push(guild.setIcon(backupData.iconURL));
    }
    if (backupData.splashBase64) {
        configPromises.push(guild.setSplash(Buffer.from(backupData.splashBase64, 'base64')));
    }
    else if (backupData.splashURL) {
        configPromises.push(guild.setSplash(backupData.splashURL));
    }
    if (backupData.bannerBase64) {
        configPromises.push(guild.setBanner(Buffer.from(backupData.bannerBase64, 'base64')));
    }
    else if (backupData.bannerURL) {
        configPromises.push(guild.setBanner(backupData.bannerURL));
    }
    if (backupData.verificationLevel) {
        configPromises.push(guild.setVerificationLevel(backupData.verificationLevel));
    }
    if (backupData.defaultMessageNotifications) {
        configPromises.push(guild.setDefaultMessageNotifications(backupData.defaultMessageNotifications));
    }
    var changeableExplicitLevel = guild.features.includes('COMMUNITY');
    if (backupData.explicitContentFilter && changeableExplicitLevel) {
        configPromises.push(guild.setExplicitContentFilter(backupData.explicitContentFilter));
    }
    return Promise.all(configPromises);
};
exports.loadConfig = loadConfig;
/**
 * Restore the guild roles
 */
var loadRoles = function (guild, backupData) {
    var rolePromises = [];
    backupData.roles.forEach(function (roleData) {
        if (roleData.isEveryone) {
            rolePromises.push(guild.roles.cache.get(guild.id).edit({
                name: roleData.name,
                color: roleData.color,
                permissions: BigInt(roleData.permissions),
                mentionable: roleData.mentionable
            }));
        }
        else {
            rolePromises.push(guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                permissions: BigInt(roleData.permissions),
                mentionable: roleData.mentionable
            }));
        }
    });
    return Promise.all(rolePromises);
};
exports.loadRoles = loadRoles;
/**
 * Restore the guild channels
 */
var loadChannels = function (guild, backupData, options) {
    var loadChannelPromises = [];
    backupData.channels.categories.forEach(function (categoryData) {
        loadChannelPromises.push(new Promise(function (resolve) {
            util_1.loadCategory(categoryData, guild).then(function (createdCategory) {
                categoryData.children.forEach(function (channelData) {
                    util_1.loadChannel(channelData, guild, createdCategory, options);
                    resolve(true);
                });
            });
        }));
    });
    backupData.channels.others.forEach(function (channelData) {
        loadChannelPromises.push(util_1.loadChannel(channelData, guild, null, options));
    });
    return Promise.all(loadChannelPromises);
};
exports.loadChannels = loadChannels;
/**
 * Restore the afk configuration
 */
var loadAFK = function (guild, backupData) {
    var afkPromises = [];
    if (backupData.afk) {
        afkPromises.push(guild.setAFKChannel(guild.channels.cache.find(function (ch) { return ch.name === backupData.afk.name && ch.type === 'GUILD_VOICE'; })));
        afkPromises.push(guild.setAFKTimeout(backupData.afk.timeout));
    }
    return Promise.all(afkPromises);
};
exports.loadAFK = loadAFK;
/**
 * Restore guild emojis
 */
var loadEmojis = function (guild, backupData) {
    var emojiPromises = [];
    backupData.emojis.forEach(function (emoji) {
        if (emoji.url) {
            emojiPromises.push(guild.emojis.create(emoji.url, emoji.name));
        }
        else if (emoji.base64) {
            emojiPromises.push(guild.emojis.create(Buffer.from(emoji.base64, 'base64'), emoji.name));
        }
    });
    return Promise.all(emojiPromises);
};
exports.loadEmojis = loadEmojis;
/**
 * Restore guild bans
 */
var loadBans = function (guild, backupData) {
    var banPromises = [];
    backupData.bans.forEach(function (ban) {
        banPromises.push(guild.members.ban(ban.id, {
            reason: ban.reason
        }));
    });
    return Promise.all(banPromises);
};
exports.loadBans = loadBans;
/**
 * Restore embedChannel configuration
 */
var loadEmbedChannel = function (guild, backupData) {
    var embedChannelPromises = [];
    if (backupData.widget.channel) {
        embedChannelPromises.push(guild.setWidgetSettings({
            enabled: backupData.widget.enabled,
            channel: guild.channels.cache.find(function (ch) { return ch.name === backupData.widget.channel; })
        }));
    }
    return Promise.all(embedChannelPromises);
};
exports.loadEmbedChannel = loadEmbedChannel;
