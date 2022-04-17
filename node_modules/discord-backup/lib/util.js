"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearGuild = exports.loadChannel = exports.loadCategory = exports.fetchTextChannelData = exports.fetchChannelMessages = exports.fetchVoiceChannelData = exports.fetchChannelPermissions = void 0;
var node_fetch_1 = require("node-fetch");
var MaxBitratePerTier = {
    NONE: 64000,
    TIER_1: 128000,
    TIER_2: 256000,
    TIER_3: 384000
};
/**
 * Gets the permissions for a channel
 */
function fetchChannelPermissions(channel) {
    var permissions = [];
    channel.permissionOverwrites.cache
        .filter(function (p) { return p.type === 'role'; })
        .forEach(function (perm) {
        // For each overwrites permission
        var role = channel.guild.roles.cache.get(perm.id);
        if (role) {
            permissions.push({
                roleName: role.name,
                allow: perm.allow.bitfield.toString(),
                deny: perm.deny.bitfield.toString()
            });
        }
    });
    return permissions;
}
exports.fetchChannelPermissions = fetchChannelPermissions;
/**
 * Fetches the voice channel data that is necessary for the backup
 */
function fetchVoiceChannelData(channel) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var channelData;
                    return __generator(this, function (_a) {
                        channelData = {
                            type: 'GUILD_VOICE',
                            name: channel.name,
                            bitrate: channel.bitrate,
                            userLimit: channel.userLimit,
                            parent: channel.parent ? channel.parent.name : null,
                            permissions: fetchChannelPermissions(channel)
                        };
                        /* Return channel data */
                        resolve(channelData);
                        return [2 /*return*/];
                    });
                }); })];
        });
    });
}
exports.fetchVoiceChannelData = fetchVoiceChannelData;
function fetchChannelMessages(channel, options) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, messageCount, fetchOptions, lastMessageId, fetchComplete, fetched;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messages = [];
                    messageCount = isNaN(options.maxMessagesPerChannel) ? 10 : options.maxMessagesPerChannel;
                    fetchOptions = { limit: 100 };
                    fetchComplete = false;
                    _a.label = 1;
                case 1:
                    if (!!fetchComplete) return [3 /*break*/, 4];
                    if (lastMessageId) {
                        fetchOptions.before = lastMessageId;
                    }
                    return [4 /*yield*/, channel.messages.fetch(fetchOptions)];
                case 2:
                    fetched = _a.sent();
                    if (fetched.size === 0) {
                        return [3 /*break*/, 4];
                    }
                    lastMessageId = fetched.last().id;
                    return [4 /*yield*/, Promise.all(fetched.map(function (msg) { return __awaiter(_this, void 0, void 0, function () {
                            var files;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!msg.author || messages.length >= messageCount) {
                                            fetchComplete = true;
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, Promise.all(msg.attachments.map(function (a) { return __awaiter(_this, void 0, void 0, function () {
                                                var attach;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            attach = a.url;
                                                            if (!(a.url && ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi'].includes(a.url))) return [3 /*break*/, 2];
                                                            if (!(options.saveImages && options.saveImages === 'base64')) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, (node_fetch_1.default(a.url).then(function (res) { return res.buffer(); }))];
                                                        case 1:
                                                            attach = (_a.sent()).toString('base64');
                                                            _a.label = 2;
                                                        case 2: return [2 /*return*/, {
                                                                name: a.name,
                                                                attachment: attach
                                                            }];
                                                    }
                                                });
                                            }); }))];
                                    case 1:
                                        files = _a.sent();
                                        messages.push({
                                            username: msg.author.username,
                                            avatar: msg.author.displayAvatarURL(),
                                            content: msg.cleanContent,
                                            embeds: msg.embeds,
                                            files: files,
                                            pinned: msg.pinned
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, messages];
            }
        });
    });
}
exports.fetchChannelMessages = fetchChannelMessages;
/**
 * Fetches the text channel data that is necessary for the backup
 */
function fetchTextChannelData(channel, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var channelData, _a, _b;
                    var _this = this;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                channelData = {
                                    type: channel.type,
                                    name: channel.name,
                                    nsfw: channel.nsfw,
                                    rateLimitPerUser: channel.type === 'GUILD_TEXT' ? channel.rateLimitPerUser : undefined,
                                    parent: channel.parent ? channel.parent.name : null,
                                    topic: channel.topic,
                                    permissions: fetchChannelPermissions(channel),
                                    messages: [],
                                    isNews: channel.type === 'GUILD_NEWS',
                                    threads: []
                                };
                                if (!(channel.threads.cache.size > 0)) return [3 /*break*/, 2];
                                return [4 /*yield*/, Promise.all(channel.threads.cache.map(function (thread) { return __awaiter(_this, void 0, void 0, function () {
                                        var threadData, _a, _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    threadData = {
                                                        type: thread.type,
                                                        name: thread.name,
                                                        archived: thread.archived,
                                                        autoArchiveDuration: thread.autoArchiveDuration,
                                                        locked: thread.locked,
                                                        rateLimitPerUser: thread.rateLimitPerUser,
                                                        messages: []
                                                    };
                                                    _c.label = 1;
                                                case 1:
                                                    _c.trys.push([1, 3, , 4]);
                                                    _a = threadData;
                                                    return [4 /*yield*/, fetchChannelMessages(thread, options)];
                                                case 2:
                                                    _a.messages = _c.sent();
                                                    /* Return thread data */
                                                    channelData.threads.push(threadData);
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    _b = _c.sent();
                                                    channelData.threads.push(threadData);
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                            case 1:
                                _c.sent();
                                _c.label = 2;
                            case 2:
                                _c.trys.push([2, 4, , 5]);
                                _a = channelData;
                                return [4 /*yield*/, fetchChannelMessages(channel, options)];
                            case 3:
                                _a.messages = _c.sent();
                                /* Return channel data */
                                resolve(channelData);
                                return [3 /*break*/, 5];
                            case 4:
                                _b = _c.sent();
                                resolve(channelData);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.fetchTextChannelData = fetchTextChannelData;
/**
 * Creates a category for the guild
 */
function loadCategory(categoryData, guild) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    guild.channels.create(categoryData.name, {
                        type: 'GUILD_CATEGORY'
                    }).then(function (category) { return __awaiter(_this, void 0, void 0, function () {
                        var finalPermissions;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    finalPermissions = [];
                                    categoryData.permissions.forEach(function (perm) {
                                        var role = guild.roles.cache.find(function (r) { return r.name === perm.roleName; });
                                        if (role) {
                                            finalPermissions.push({
                                                id: role.id,
                                                allow: BigInt(perm.allow),
                                                deny: BigInt(perm.deny)
                                            });
                                        }
                                    });
                                    return [4 /*yield*/, category.permissionOverwrites.set(finalPermissions)];
                                case 1:
                                    _a.sent();
                                    resolve(category); // Return the category
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                })];
        });
    });
}
exports.loadCategory = loadCategory;
/**
 * Create a channel and returns it
 */
function loadChannel(channelData, guild, category, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var loadMessages, createOptions, bitrate, bitrates;
                    var _this = this;
                    return __generator(this, function (_a) {
                        loadMessages = function (channel, messages, previousWebhook) {
                            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var webhook, _a, _i, messages_1, msg, sentMsg;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = previousWebhook;
                                            if (_a) return [3 /*break*/, 2];
                                            return [4 /*yield*/, channel.createWebhook('MessagesBackup', {
                                                    avatar: channel.client.user.displayAvatarURL()
                                                }).catch(function () { })];
                                        case 1:
                                            _a = (_b.sent());
                                            _b.label = 2;
                                        case 2:
                                            webhook = _a;
                                            if (!webhook)
                                                return [2 /*return*/, resolve()];
                                            messages = messages
                                                .filter(function (m) { return m.content.length > 0 || m.embeds.length > 0 || m.files.length > 0; })
                                                .reverse();
                                            messages = messages.slice(messages.length - options.maxMessagesPerChannel);
                                            _i = 0, messages_1 = messages;
                                            _b.label = 3;
                                        case 3:
                                            if (!(_i < messages_1.length)) return [3 /*break*/, 7];
                                            msg = messages_1[_i];
                                            return [4 /*yield*/, webhook
                                                    .send({
                                                    content: msg.content.length ? msg.content : undefined,
                                                    username: msg.username,
                                                    avatarURL: msg.avatar,
                                                    embeds: msg.embeds,
                                                    files: msg.files,
                                                    allowedMentions: options.allowedMentions,
                                                    threadId: channel.isThread() ? channel.id : undefined
                                                })
                                                    .catch(function (err) {
                                                    console.log(err.message);
                                                })];
                                        case 4:
                                            sentMsg = _b.sent();
                                            if (!(msg.pinned && sentMsg)) return [3 /*break*/, 6];
                                            return [4 /*yield*/, sentMsg.pin()];
                                        case 5:
                                            _b.sent();
                                            _b.label = 6;
                                        case 6:
                                            _i++;
                                            return [3 /*break*/, 3];
                                        case 7:
                                            resolve(webhook);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        };
                        createOptions = {
                            type: null,
                            parent: category
                        };
                        if (channelData.type === 'GUILD_TEXT' || channelData.type === 'GUILD_NEWS') {
                            createOptions.topic = channelData.topic;
                            createOptions.nsfw = channelData.nsfw;
                            createOptions.rateLimitPerUser = channelData.rateLimitPerUser;
                            createOptions.type =
                                channelData.isNews && guild.features.includes('NEWS') ? 'GUILD_NEWS' : 'GUILD_TEXT';
                        }
                        else if (channelData.type === 'GUILD_VOICE') {
                            bitrate = channelData.bitrate;
                            bitrates = Object.values(MaxBitratePerTier);
                            while (bitrate > MaxBitratePerTier[guild.premiumTier]) {
                                bitrate = bitrates[Object.keys(MaxBitratePerTier).indexOf(guild.premiumTier) - 1];
                            }
                            createOptions.bitrate = bitrate;
                            createOptions.userLimit = channelData.userLimit;
                            createOptions.type = 'GUILD_VOICE';
                        }
                        guild.channels.create(channelData.name, createOptions).then(function (channel) { return __awaiter(_this, void 0, void 0, function () {
                            var finalPermissions, webhook_1;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        finalPermissions = [];
                                        channelData.permissions.forEach(function (perm) {
                                            var role = guild.roles.cache.find(function (r) { return r.name === perm.roleName; });
                                            if (role) {
                                                finalPermissions.push({
                                                    id: role.id,
                                                    allow: BigInt(perm.allow),
                                                    deny: BigInt(perm.deny)
                                                });
                                            }
                                        });
                                        return [4 /*yield*/, channel.permissionOverwrites.set(finalPermissions)];
                                    case 1:
                                        _a.sent();
                                        if (!(channelData.type === 'GUILD_TEXT')) return [3 /*break*/, 6];
                                        if (!(channelData.messages.length > 0)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, loadMessages(channel, channelData.messages).catch(function () { })];
                                    case 2:
                                        webhook_1 = _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        if (!(channelData.threads.length > 0)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, Promise.all(channelData.threads.map(function (threadData) { return __awaiter(_this, void 0, void 0, function () {
                                                var autoArchiveDuration;
                                                return __generator(this, function (_a) {
                                                    autoArchiveDuration = threadData.autoArchiveDuration;
                                                    if (!guild.features.includes('SEVEN_DAY_THREAD_ARCHIVE') && autoArchiveDuration === 10080)
                                                        autoArchiveDuration = 4320;
                                                    if (!guild.features.includes('THREE_DAY_THREAD_ARCHIVE') && autoArchiveDuration === 4320)
                                                        autoArchiveDuration = 1440;
                                                    return [2 /*return*/, channel.threads.create({
                                                            name: threadData.name,
                                                            autoArchiveDuration: autoArchiveDuration
                                                        }).then(function (thread) {
                                                            if (!webhook_1)
                                                                return;
                                                            return loadMessages(thread, threadData.messages, webhook_1);
                                                        })];
                                                });
                                            }); }))];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5: return [2 /*return*/, channel];
                                    case 6:
                                        resolve(channel); // Return the channel
                                        _a.label = 7;
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                    });
                }); })];
        });
    });
}
exports.loadChannel = loadChannel;
/**
 * Delete all roles, all channels, all emojis, etc... of a guild
 */
function clearGuild(guild) {
    return __awaiter(this, void 0, void 0, function () {
        var webhooks, bans;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guild.roles.cache
                        .filter(function (role) { return !role.managed && role.editable && role.id !== guild.id; })
                        .forEach(function (role) {
                        role.delete().catch(function () { });
                    });
                    guild.channels.cache.forEach(function (channel) {
                        channel.delete().catch(function () { });
                    });
                    guild.emojis.cache.forEach(function (emoji) {
                        emoji.delete().catch(function () { });
                    });
                    return [4 /*yield*/, guild.fetchWebhooks()];
                case 1:
                    webhooks = _a.sent();
                    webhooks.forEach(function (webhook) {
                        webhook.delete().catch(function () { });
                    });
                    return [4 /*yield*/, guild.bans.fetch()];
                case 2:
                    bans = _a.sent();
                    bans.forEach(function (ban) {
                        guild.members.unban(ban.user).catch(function () { });
                    });
                    guild.setAFKChannel(null);
                    guild.setAFKTimeout(60 * 5);
                    guild.setIcon(null);
                    guild.setBanner(null).catch(function () { });
                    guild.setSplash(null).catch(function () { });
                    guild.setDefaultMessageNotifications('ONLY_MENTIONS');
                    guild.setWidgetSettings({
                        enabled: false,
                        channel: null
                    });
                    if (!guild.features.includes('COMMUNITY')) {
                        guild.setExplicitContentFilter('DISABLED');
                        guild.setVerificationLevel('NONE');
                    }
                    guild.setSystemChannel(null);
                    guild.setSystemChannelFlags(['SUPPRESS_GUILD_REMINDER_NOTIFICATIONS', 'SUPPRESS_JOIN_NOTIFICATIONS', 'SUPPRESS_PREMIUM_SUBSCRIPTIONS']);
                    return [2 /*return*/];
            }
        });
    });
}
exports.clearGuild = clearGuild;
