const { MessageEmbed, Permissions, MessageAttachment } = require("discord.js");
const config = require("../../../config.json");
const ee = require("../../../embed.json");
const role = require("../../../settings.json");
  module.exports = { 
    name: "editembed", 
    usage : ", editembed <message-id> ++ New Title ++ Description ++ (img)",
    run: async (client, message, args, cmduser, text, prefix) => {
      if (message.member.permissions.has(role.Roles.OwnerRoleId || role.Roles.FounderId || role.Roles.CoOwnerRoleId || role.Roles.AdminRoleId)) {
        try {
          
          if (!args[0]) return;
          let userargs = args.join(" ").split("++");
          if (!userargs[0]) return ;
            
          let oldembedid = userargs[0];
          let title = userargs[1];
          let desc = userargs.slice(2).join(" ")
          let attachment = false;
          let name = false;
          if (message.attachments.size > 0) {
            if (message.attachments.every(attachispng)) {
              name = Date.now() + ".png"
              attachment = new MessageAttachment(url, name)
            }
            if (message.attachments.every(attachisjpg)) {
              name = Date.now() + ".jpg"
              attachment = new MessageAttachment(url, name)
            }
            if (message.attachments.every(attachisgif)) {
              name = Date.now() + ".gif"
              attachment = new MessageAttachment(url, name)
            }
          }
          message.delete().catch(e => console.log("Couldn't delete msg, this is a catch to prevent crash"))
          let sendembed = new MessageEmbed()
          .setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon) 
            .setTitle(title && desc ? title.substring(0, 256) : "")
            .setDescription(desc ? desc : title ? title.substring(0, 2048) : "")
          if(attachment) {
            sendembed.setImage("attachment://" + name)
          }
          let sendData = {embeds: [sendembed]};
    
          if(attachment){
            sendData.files = [attachment]
          }
        message.channel.messages.fetch(oldembedid).then(msg=>{
          if(!attachment){
            if (msg.attachments.size > 0) {
              if (msg.attachments.every(attachispng)) {
                name = "image.png"
                attachment = new MessageAttachment(url, name)
              }
              if (msg.attachments.every(attachisjpg)) {
                name = "image.jpg"
                attachment = new MessageAttachment(url, name)
              }
              if (msg.attachments.every(attachisgif)) {
                name = "image.gif"
                attachment = new MessageAttachment(url, name)
              }
              if(attachment) {
                sendData.embeds[0].setImage("attachment://" + name)
                sendData.files = [attachment]
              }
            }
          }
          msg.edit(sendData).then(d=>{
            var ee = "Here is your Command, if you wanna use it again!";
            if(message.content.length > 2000){
              ee = "Here is your Command"
            }
            if(message.content.length > 2020){
              ee = ""
            }
            
          })
        }).catch(e=>{
          return message.reply({content : `${e.message ? String(e.message).substring(0, 1900) : String(e).grey.substring(0, 1900)}`, code: "js"});
        })
          
        function attachispng(msgAttach) {
          url = msgAttach.url;
          return url.indexOf("png", url.length - "png".length /*or 3*/ ) !== -1;
        }
        function attachisjpg(msgAttach) {
          url = msgAttach.url;
          return url.indexOf("jpg", url.length - "jpg".length /*or 3*/ ) !== -1;
        }
        function attachisgif(msgAttach) {
          url = msgAttach.url;
          return url.indexOf("gif", url.length - "gif".length /*or 3*/ ) !== -1;
        }
  
        
      } catch (e) {
        console.log(String(e.stack).grey.bgRed)
        return message.reply("error")
      }
    }else {
      message.reply("You don't have rights")
  }
    }
  }
