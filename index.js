const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

require('dotenv').config();
const token = process.env.TOKEN;

const prefix = "--";

const PLAYER_STATS_URL = `https://api.brawlhalla.com/player/2/stats?api_key=${process.env.APIKEY}`;
const PLAYER_RANK_URL = `https://api.brawlhalla.com/player/2/ranked?api_key=${process.env.APIKEY}`;

//const fetch = require("node-fetch");

client.once("ready", () => {
    console.log("Silicon is up and running!");
});

client.on("messageCreate", msg => {
    // If invalid prefix or a bot has sent the message, no actions
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;        

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift();

    if(command == 'Hey'){
        msg.channel.send("Yo Silicon here!");
    }
    else if(command == 'source'){
        msg.channel.send("Find me at https://github.com/uoa-aron527/silicon-bot");
    }
});

client.login(token);

