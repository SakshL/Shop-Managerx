if (process.version.slice(1).split(".")[0] < 16) {
    throw new Error("This codes require Node v16.9.0 or higher to run!");
}

const Discord = require("discord.js");
const mainconfig = require("./mainconfig");

const client = new Discord.Client({
    allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: false,
    },
    failIfNotExists: false,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
    ],
});

client.on("ready", async () => {
    const ownerId = await client.users.fetch(mainconfig.BotOwnerID).catch(() => null);
    if (!ownerId) {
        throw new Error("The BotOwnerID value you provided in mainconfig.js is invalid!");
    }

    mainconfig.OwnerInformation.OwnerID.forEach(async (ownerIddd) => {
        const owner = await client.users.fetch(ownerIddd).catch(() => null);
        if (!owner) {
            throw new Error("One of the OwnerInformation.OwnerID value you provided in mainconfig.js is invalid!");
        }
    });

    const guild = await client.guilds.fetch(mainconfig.ServerID).catch(() => null);
    if (!guild) {
        throw new Error("The ServerID value you provided in mainconfig.js is invalid!");
    }

    const memberRoleId = await guild.roles.fetch(mainconfig.MemberRoleID).catch(() => null);
    if (!memberRoleId) {
        throw new Error("The Member Role ID value you provided in mainconfig.js is invalid!");
    }

    mainconfig.AllMemberRoles.forEach(async (memberId) => {
        const member = await guild.roles.fetch(memberId).catch(() => null);
        if (!member) {
            throw new Error("One of the AllMemberRoles value you provided in mainconfig.js is invalid!");
        }
    });

    const rulesChannel = await guild.channels.fetch(mainconfig.RulesChannel).catch(() => null);
    if (!rulesChannel) {
        throw new Error("The RulesChannel value you provided in mainconfig.js is invalid!");
    }

    const selfRoleChannelId = await guild.channels.fetch(mainconfig.SelfRoleChannelID).catch(() => null);
    if (!selfRoleChannelId) {
        throw new Error("The SelfRoleChannelID value you provided in mainconfig.js is invalid!");
    }

    const botManagerLogs = await guild.channels.fetch(mainconfig.BotManagerLogs).catch(() => null);
    if (!botManagerLogs) {
        throw new Error("The BotManagerLogs value you provided in mainconfig.js is invalid!");
    }

    const boostLogChannel = await guild.channels.fetch(mainconfig.BoostLogChannel).catch(() => null);
    if (!boostLogChannel) {
        throw new Error("The BoostLogChannel value you provided in mainconfig.js is invalid!");
    }

    mainconfig.VaildCats.forEach(async (cat) => {
        const category = await guild.channels.fetch(cat).catch(() => null);
        if (!category) {
            throw new Error("One of the ValidCats value you provided in mainconfig.js is invalid!");
        }
    });

    const generalChat = await guild.channels.fetch(mainconfig.GeneralChat).catch(() => null);
    if (!generalChat) {
        throw new Error("The GeneralChat value you provided in mainconfig.js is invalid!");
    }

    const ownerTicket = await guild.channels.fetch(mainconfig.OwnerTicket).catch(() => null);
    if (!ownerTicket) {
        throw new Error("The OwnerTicket value you provided in mainconfig.js is invalid!");
    }

    const feedbackChannelId = await guild.channels.fetch(mainconfig.FeedBackChannelID).catch(() => null);
    if (!feedbackChannelId) {
        throw new Error("The FeedBackChannelID value you provided in mainconfig.js is invalid!");
    }

    const finishedOrderId = await guild.channels.fetch(mainconfig.FinishedOrderID).catch(() => null);
    if (!finishedOrderId) {
        throw new Error("The FinishedOrderID value you provided in mainconfig.js is invalid!");
    }

    const autoDeleteChannelID = await guild.channels.fetch(mainconfig.AutoDeleteChannelID).catch(() => null);
    if (!autoDeleteChannelID) {
        throw new Error("The AutoDeleteChannelID value you provided in mainconfig.js is invalid!");
    }

    const donationChannelId = await guild.channels.fetch(mainconfig.DonationChannelID).catch(() => null);
    if (!donationChannelId) {
        throw new Error("The DonationChannelID value you provided in mainconfig.js is invalid!");
    }

    Object.values(mainconfig.LoggingChannelID).forEach(async (channelId) => {
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            throw new Error("One of the LoggingChannelID values you provided in mainconfig.js are invalid!");
        }
    });

    Object.values(mainconfig.SeverRoles).forEach(async (roleId) => {
        const role = await guild.roles.fetch(roleId).catch(() => null);
        if (!role) {
            throw new Error("One of the SeverRoles values you provided in mainconfig.js are invalid!");
        }
    });

    const notSakshTicket = await guild.channels.fetch(mainconfig.OwnerInformation.OwnerTicketCat).catch(() => null);
    if (!notSakshTicket) {
        throw new Error("The OwnerInformation.OwnerTicketCat value you provided in mainconfig.js is invalid!");
    }

    Object.values(mainconfig.OrdersChannelID).forEach(async (id) => {
        if (id === mainconfig.OrdersChannelID.TicketMessageID) {
            const channel = await guild.channels.fetch(mainconfig.OrdersChannelID.TicketChannelID).catch(() => null);
            if (!channel) return;

            const msg = channel.messages.fetch(id).catch(() => null);
            if (!msg) {
                console.warn("Not a crash! But the OrdersChannelID.TicketMessageID value you provided in mainconfig.js is invalid!");
            }

            return;
        }

        const channel = await guild.channels.fetch(id).catch(() => null);
        if (!channel) {
            throw new Error("One of the OrdersChannelID value you provided in mainconfig.js is invalid!");
        }
    });

    Object.values(mainconfig.ApplyTickets).forEach(async (id) => {
        const channel = await guild.channels.fetch(id).catch(() => null);
        if (!channel) {
            throw new Error("One of the ApplyTickets value you provided in mainconfig.js is invalid!");
        }
    });

    Object.values(mainconfig.TicketCategorys).forEach(async (id) => {
        const channel = await guild.channels.fetch(id).catch(() => null);
        if (!channel) {
            throw new Error("One of the TicketCategorys value you provided in mainconfig.js is invalid!");
        }
    });
});

require("./Bot")(client);