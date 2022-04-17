const { Structures } = require("discord.js");
const APIMessage = require('../../v12/Classes/APIMessage').APIMessage;
const WebhookClient = require('../../v12/Classes/WebhookClient');
const { ApplicationCommandOptionTypes, InteractionResponseTypes } = require('discord.js').Constants;
const MessageFlags = require('discord.js').MessageFlags;

class CommandInteraction extends Structures.get("CommandInteraction") {

    constructor(client, data) {
        super(client, data);
        this.webhook = new WebhookClient(this.applicationID, this.token, this.client.options);
    }

    async reply(content, options) {
        if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
        const apiMessage = content instanceof APIMessage ? content : APIMessage.create(this, content, options);
        const { data, files } = await apiMessage.resolveData().resolveFiles();

        await this.client.api.interactions(this.id, this.token).callback.post({
            data: {
                type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
                data,
            },
            files,
        });
        this.replied = true;
    }

    async followUp(content, options) {
        const apiMessage = content instanceof APIMessage ? content : APIMessage.create(this, content, options);
        const { data, files } = await apiMessage.resolveData().resolveFiles();

        const raw = await this.client.api.webhooks(this.applicationID, this.token).post({
            data,
            files,
        });

        return this.channel?.messages.add(raw) ?? raw;
    }

    async editReply(content, options) {
        const raw = await this.webhook.editMessage('@original', content, options);
        return this.channel?.messages.add(raw) ?? raw;
    }

}

module.exports = CommandInteraction;