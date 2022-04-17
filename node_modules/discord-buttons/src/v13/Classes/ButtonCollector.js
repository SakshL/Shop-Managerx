const { Collector, Message } = require("discord.js");
const Collection = require('discord.js').Collection;
const { Events } = require('discord.js').Constants;

class ButtonCollector extends Collector {
  constructor(data, filter, options = {}) {
    super(data.client, filter, options);

    this.message = data instanceof Message ? data : null;

    this.channel = this.message ? this.message.channel : data;

    this.users = new Collection();

    this.total = 0;

    this.empty = this.empty.bind(this);
    this._handleChannelDeletion = this._handleChannelDeletion.bind(this);
    this._handleGuildDeletion = this._handleGuildDeletion.bind(this);
    this._handleMessageDeletion = this._handleMessageDeletion.bind(this);

    this.client.incrementMaxListeners();
    this.client.on('clickButton', this.handleCollect);

    if (this.message) this.client.on(Events.MESSAGE_DELETE, this._handleMessageDeletion);

    this.client.on(Events.CHANNEL_DELETE, this._handleChannelDeletion);
    this.client.on(Events.GUILD_DELETE, this._handleGuildDeletion);

    this.once('end', () => {
      this.client.removeListener('clickButton', this.handleCollect);

      if (this.message) this.client.removeListener(Events.MESSAGE_DELETE, this._handleMessageDeletion);

      this.client.removeListener(Events.CHANNEL_DELETE, this._handleChannelDeletion);
      this.client.removeListener(Events.GUILD_DELETE, this._handleGuildDeletion);
      this.client.decrementMaxListeners();
    });

    this.on('collect', async (data) => {
      this.total++;
      if (!button.clicker.user) await button.clicker.fetch();
      this.users.set(data.clicker.user.id, data.clicker.user);
    });
  }

  collect(button) {
    if (this.message) {
      return button.message.id === this.message.id ? button.discordID : null;
    }
    return button.channel.id === this.channel.id ? button.discordID : null;
  }

  dispose(button) {
    if (this.message) {
      return button.message.id === this.message.id ? button.discordID : null;
    }
    return button.channel.id === this.channel.id ? button.discordID : null;
  }

  empty() {
    this.total = 0;
    this.collected.clear();
    this.users.clear();
    this.checkEnd();
  }

  get endReason() {
    if (this.options.max && this.total >= this.options.max) return 'limit';
    if (this.options.maxButtons && this.collected.size >= this.options.maxButtons) return 'buttonLimit';
    if (this.options.maxUsers && this.users.size >= this.options.maxUsers) return 'userLimit';
    return null;
  }

  _handleMessageDeletion(message) {
    if (this.message && message.id === this.message.id) {
      this.stop('messageDelete');
    }
  }

  _handleChannelDeletion(channel) {
    if (channel.id === this.channel.id) {
      this.stop('channelDelete');
    }
  }

  _handleGuildDeletion(guild) {
    if (this.channel.guild && guild.id === this.channel.guild.id) {
      this.stop('guildDelete');
    }
  }
}

module.exports = ButtonCollector;