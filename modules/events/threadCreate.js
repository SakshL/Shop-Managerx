//IMPORTING NPM PACKAGES
const Discord = require('discord.js');
/**
 * STARTING THE MODULE WHILE EXPORTING THE CLIENT INTO IT
 * @param {*} client 
 */
module.exports = async (client) => {

    /**
     * @INFO - Thread Create Logger
     */
    client.on("threadCreate", async (thread) => {
        if(thread.joinable){
			try{
				await thread.join();
			}catch (e){
				console.log(e)
			}
		}
    })
  
}

