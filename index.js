const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

require('dotenv').config();
const token = process.env.TOKEN;

//const fetch = require("node-fetch");

client.once("ready", () => {
    console.log("Silicon is online!");
});

client.on("messageCreate", async msg => {
    if(msg.content == 'Hey'){
    msg.reply("Yo Silico here!");
    }
});

client.login(token);

