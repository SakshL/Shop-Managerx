/**
 * STARTING THE MODULE WHILE EXPORTING THE CLIENT INTO IT
 * @param {*} client 
 */
 const emoji = require("../../emoji");
 module.exports = async (client) => {

    //GUESS THE NUMBER
    client.on("messageCreate", async (msg) => {
        if (msg.channel.id == `${mainconfig.FeedBackChannelID.toString()}`) {
            let emojis = [`<:Discord:933238543973773383>`, "🥰", "🤩", "😎", "😇", "😍", "🙃", "💝", "❤️", "👀", "🟢", "✅", "🔥", "🌊", "✨", "💫", "💯", "<:like:938142052087124008>", "<:1002blurplelike:935683500235948083>", "👑", "💓", "💞", "🙏"];
            let emoji1 = emojis[Math.floor(Math.random() * emojis.length)];
            const index = emojis.indexOf(emoji1);
            if (index > -1) {
                emojis.splice(index, 1);
            }
            let emoji2 = emojis[Math.floor(Math.random() * emojis.length)];
            let emoji3 = emojis[Math.floor(Math.random() * emojis.length)];
            let emoji4 = emojis[Math.floor(Math.random() * emojis.length)];
            msg.react(emoji1).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            msg.react(emoji2).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            msg.react(emoji3).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
            msg.react(emoji4).catch(e => {console.warn(e.stack ? String(e.stack).grey : String(e).grey)});
        }
    })
}
