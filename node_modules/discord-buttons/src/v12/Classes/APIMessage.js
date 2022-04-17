const { APIMessage: dAPIMessage, MessageEmbed } = require("discord.js");
const Util = require('../Util');
const { MessageComponentTypes } = require('../Constants.js');
const BaseMessageComponent = require('./interfaces/BaseMessageComponent');
const MessageActionRow = require('./MessageActionRow');

class sendAPICallback extends dAPIMessage {
    resolveData() {

        if (this.data) {
            return this;
        }

        if (typeof (this.options.content) === 'object') {
            this.options = this.options.content;
            this.options.content = null;
        }

        super.resolveData();

        if (this.options.content instanceof MessageEmbed) {
            this.data.embed = this.options.content;
            this.data.content = null;
        }

        if (this.options.flags) {
            this.data.flags = parseInt(this.options.flags);
        }

        if (typeof (this.options.ephemeral) === 'boolean' && this.options.ephemeral === true) {
            this.data.flags = 64;
        }

        let components = [];
        let hasActionRow = false;
        if (MessageComponentTypes[this.options.type]) {
            if (this.options.type === MessageComponentTypes.ACTION_ROW) {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: this.options.components.map(b => BaseMessageComponent.create(Util.resolveButton(b)))
                });
                hasActionRow = true;
            } else {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [BaseMessageComponent.create(Util.resolveButton(this.options))]
                });
            }
        }

        if (this.options.component) {

            if (this.options.component instanceof MessageActionRow) {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: this.options.component.components.map(b => BaseMessageComponent.create(Util.resolveButton(b)))
                });
            } else {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [BaseMessageComponent.create(Util.resolveButton(this.options.component))]
                });
            }
        }

        if (this.options.components) {

            if (Array.isArray(this.options.components)) {
                if (hasActionRow === false) {
                    components.push(...this.options.components.map(c => {
                        let buttons = [];

                        buttons.push(...c.components.map(b => BaseMessageComponent.create(Util.resolveButton(b))));

                        return {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: buttons
                        }
                    }));
                }
            } else {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: this.options.components.components.map(b => BaseMessageComponent.create(Util.resolveButton(b)))
                })
            }
        }

        if (this.options.buttons) {
            components.push({
                type: MessageComponentTypes.ACTION_ROW,
                components: Array.isArray(this.options.buttons) ? this.options.buttons.map(b => BaseMessageComponent.create(Util.resolveButton(b))) : [BaseMessageComponent.create(Util.resolveButton(this.options.buttons))]
            });
        }

        if (this.options.button) {
            components.push({
                type: MessageComponentTypes.ACTION_ROW,
                components: Array.isArray(this.options.button) ? this.options.button.map(b => BaseMessageComponent.create(Util.resolveButton(b))) : [BaseMessageComponent.create(Util.resolveButton(this.options.button))]
            });
        }

        if (this.options === null && !this.options === undefined) components = [];

        if (typeof components.length == 'number') {
            this.data.components = components.length === 0 ? [] : components;
        }

        return this;
    }
}

class APIMessage extends dAPIMessage {
    resolveData() {

        if (this.data) {
            return this;
        }

        if (typeof (this.options.content) === 'object') {
            this.options = this.options.content;
            this.options.content = null;
        }

        super.resolveData();

        if (this.options.content instanceof MessageEmbed) {
            this.data.embed = this.options.content;
            this.data.content = null;
        }

        let components = [];
        let hasActionRow = false;
        if (MessageComponentTypes[this.options.type]) {
            if (this.options.type === MessageComponentTypes.ACTION_ROW) {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: this.options.components.map(b => BaseMessageComponent.create(Util.resolveButton(b)))
                });
                hasActionRow = true;
            } else {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [BaseMessageComponent.create(Util.resolveButton(this.options))]
                });
            }
        }

        if (this.options.component) {

            if (this.options.component instanceof MessageActionRow) {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: this.options.component.components.map(b => BaseMessageComponent.create(Util.resolveButton(b)))
                });
            } else {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [BaseMessageComponent.create(Util.resolveButton(this.options.component))]
                });
            }
        }

        if (this.options.components) {

            if (Array.isArray(this.options.components)) {
                if (hasActionRow === false) {
                    components.push(...this.options.components.map(c => {
                        let buttons = [];

                        buttons.push(...c.components.map(b => BaseMessageComponent.create(Util.resolveButton(b))));

                        return {
                            type: MessageComponentTypes.ACTION_ROW,
                            components: buttons
                        }
                    }));
                }
            } else {
                components.push({
                    type: MessageComponentTypes.ACTION_ROW,
                    components: this.options.components.components.map(b => BaseMessageComponent.create(Util.resolveButton(b)))
                })
            }
        }

        if (this.options.buttons) {
            components.push({
                type: MessageComponentTypes.ACTION_ROW,
                components: Array.isArray(this.options.buttons) ? this.options.buttons.map(b => BaseMessageComponent.create(Util.resolveButton(b))) : [BaseMessageComponent.create(Util.resolveButton(this.options.buttons))]
            });
        }

        if (this.options.button) {
            components.push({
                type: MessageComponentTypes.ACTION_ROW,
                components: Array.isArray(this.options.button) ? this.options.button.map(b => BaseMessageComponent.create(Util.resolveButton(b))) : [BaseMessageComponent.create(Util.resolveButton(this.options.button))]
            });
        }

        if (this.options === null && !this.options === undefined) components = [];

        if (typeof components.length == 'number') {
            this.data.components = components.length === 0 ? [] : components;
        }

        return this;
    }
}

module.exports = {
    sendAPICallback,
    APIMessage
}