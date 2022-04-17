const express = require('express');
const paypal = require('paypal-rest-sdk');
const config = require("../../config.json")
const fs = require(`fs`);
const path = require("path")
module.exports = client => {
    var webConfig = {
        httpPort: 80,
        https: {
            enabled: true,
            Port: 443,
            key: "/etc/letsencrypt/live/pay.Nexuss.me/privkey.pem",
            cert: "/etc/letsencrypt/live/pay.Nexuss.me/fullchain.pem",
            chain: "/etc/letsencrypt/live/pay.Nexuss.me/chain.pem",
        },
        domain: `https://pay.Nexuss.me`,
        guildId: `964370138356916295`,
        logChannelId: `876417014074339368`,
        AdminlogChannelId: `877178666046599200`,
    }
    client.on("ready", async() => {
        console.log("STARTING THE PAYPAL WEBSITE");
        
        var guild = client.guilds.cache.get(webConfig.guildId);
        if(!guild) return// console.log("PAYPAL: NO GUILD FOUND")
        var logChannel = guild.channels.cache.get(webConfig.logChannelId)
        if(!logChannel) logChannel = await guild.channels.fetch(webConfig.logChannelId).catch(() => {}) || false;

        var AdminlogChannel = guild.channels.cache.get(webConfig.AdminlogChannelId)
        if(!AdminlogChannel) AdminlogChannel = await guild.channels.fetch(webConfig.AdminlogChannelId).catch(() => {}) || false;

        //configure the paypal thingy
        paypal.configure({
            'mode': 'live', //sandbox or live
            'client_id': config.paypal.clientId,
            'client_secret': config.paypal.clientSecret
        });
        
        //define the app and the httpApp
        const app = express();
        app.enable('trust proxy')

        //Middleware Functions
        app.use(express.json());
        app.use(express.urlencoded({
          extended: true
        }));
    
        //LOAD THE ASSETS
        app.use(express.static(path.join(__dirname, './public')));
        //Load .well-known (if available)
        app.use(express.static(path.join(__dirname, '/'), {dotfiles: 'allow'}));
        
        //Configure the index endpoint
        app.get('/', (req, res) => res.sendFile(`${process.cwd()}/modules/paypal/index.html`));
        
        //LOAD THE ROUTERS FOR THE PAYMENTS
        //It will include all success and payment endpoints!
        fs.readdirSync("./modules/paypal/payments/").forEach((dir) => {
            if(fs.existsSync(`./modules/paypal/payments/${dir}/`) && fs.lstatSync(`./modules/paypal/payments/${dir}/`).isDirectory()){
                for (let file of fs.readdirSync(`./modules/paypal/payments/${dir}/`).filter((file) => file.endsWith(".js"))) {
                    require(`./payments/${dir}/${file}`)(client, app, paypal, webConfig, logChannel);
                    console.log(` [X] :: `.magenta + ` LOADED: ./modules/paypal/${dir}/${file}`.brightGreen)
                }
            }else {
                require(`./payments/${dir}`)(client, app, paypal, webConfig, logChannel);
                console.log(` [X] :: `.magenta + ` LOADED: ./modules/paypal/payments/${dir}`.brightGreen)
            }
        });

        

        //THE CANCEL ENDPOINT 
        app.get('/cancel', (req, res) => {
            res.sendFile(`${process.cwd()}/modules/paypal/cancel/index.html`)
        });
    


        
        //START THE HTTP APP SERVER
        const http = require(`http`).createServer(app);
        http.listen(webConfig.httpPort, () => { 
            console.log(`HTTP-Paypal-Paymentserver Started on Port: ${webConfig.httpPort} | Domain: ${webConfig.domain.replace("https://", "http://")}`)
            AdminlogChannel.send(`*HTTP-Paypal-Paymentserver Started on Port:* \`${webConfig.httpPort}\` | Domain: <${webConfig.domain.replace("http://", "https://")}>`)
        });

        //IF HTTPS IS ENABLED
        if(webConfig.https.enabled){
            //REDIRECT TO HTTPS
            app.use(function(request, response, next) {
                if (!request.secure) {
                   return response.redirect("https://" + request.headers.host + request.url);
                }
                next();
            })
            //GET THE SSL KEYS
            const key = fs.readFileSync(webConfig.https.key, `utf8`);
            const cert = fs.readFileSync(webConfig.https.cert, `utf8`);
            const ca = fs.readFileSync(webConfig.https.chain, `utf8`);
            var httpsoptions = { key: key, cert: cert, ca: ca };
            //START THE HTTPS APP SERVER
            const https = require(`https`).createServer(httpsoptions, app);
            https.listen(webConfig.https.Port, () => { 
                console.log(`HTTPS-Paypal-Paymentserver Started on Port: ${webConfig.https.Port} | Domain: ${webConfig.domain}`)
                AdminlogChannel.send(`**HTTPS-Paypal-Paymentserver Started on Port:** \`${webConfig.https.Port}\` | Domain: <${webConfig.domain}>`)
            });
        }
    })
}
