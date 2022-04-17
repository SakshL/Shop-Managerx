const { MessageComponentTypes } = require('../../v12/Constants');
const BaseMessageComponent = require('../../v12/Classes/interfaces/BaseMessageComponent');
const { verifyString } = require('discord.js').Util;
const { resolveStyle, isEmoji } = require('../../v12/Util');

class MessageButton extends BaseMessageComponent {

    constructor(data = {}) {
        super({ type: 'BUTTON' });
        this.setup(data);
    }

    setup(data) {

        this.style = 'style' in data ? resolveStyle(data.style) : null;

        this.label = ('label' in data && data.label) ? verifyString(data.label) : undefined;

        this.disabled = 'disabled' in data ? data.disabled : false;

        this.emoji = 'emoji' in data ? data.emoji : undefined;

        if ('url' in data && data.url)
            this.url = verifyString(data.url)
        else this.url = undefined;

        if (('id' in data && data.id) || ('custom_id' in data && data.custom_id))
            this.custom_id = data.id || data.custom_id;
        else this.custom_id = undefined

        return this;
    }

    setStyle(style) {
        style = resolveStyle(style);
        this.style = style;
        return this;
    }

    setLabel(label) {
        label = verifyString(label);
        this.label = label;
        return this;
    }

    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }

    setURL(url) {
        this.url = verifyString(url);
        return this;
    }

    setID(id) {
        this.custom_id = verifyString(id);
        return this;
    }

    setEmoji(emoji, animated) {
        if (!emoji) return this;
        if (isEmoji(emoji) === true) this.emoji = { name: verifyString(emoji) }
        else if (emoji.id) this.emoji = { id: emoji.id }
        else if (verifyString(emoji).length > 0) this.emoji = { id: verifyString(emoji) }
        else this.emoji = { name: null, id: null };
        if ((animated && typeof (animated) !== 'boolean') || (emoji.animated && typeof (emoji.animated) !== 'boolean')) throw new SyntaxError('The emoji animated option must be boolean');
        if (this.emoji && typeof (emoji.animated) === 'boolean') this.emoji.animated = emoji.animated;
        if (this.emoji && typeof (animated) === 'boolean') this.emoji.animated = animated;
        return this;
    }

    toJSON() {
        return {
            type: MessageComponentTypes.BUTTON,
            style: this.style,
            label: this.label,
            emoji: this.emoji,
            disabled: this.disabled,
            url: this.url,
            custom_id: this.custom_id
        }
    }

}

module.exports = MessageButton;