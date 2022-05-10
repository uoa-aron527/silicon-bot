const { Client, Intents } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

require('dotenv').config();
const token = process.env.TOKEN;

const prefix = "--";

//const fetch = require("node-fetch");

client.once("ready", () => {
    console.log("Silicon is up and running!");
});

client.on("messageCreate", async msg => {
    // If invalid prefix or a bot has sent the message, no actions
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;        

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args[0];

    // Introductory command
    if(command == 'Hey'){
        msg.channel.send("Yo Silicon here!");
    }

    // Command leading to Git repo source 
    if(command == 'source'){
        msg.channel.send("Find me at https://github.com/uoa-aron527/silicon-bot");
    }

    // Command to fetch a character's data. Eg command -> --legend {legendID}
    if(command == 'legend'){
        const getLegendStats = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/legend/${args[1]}/?api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const statsValue = await getLegendStats();
        console.log(statsValue);
    }

    // Command to fetch a player's full time game data. Eg command -> --stats {brawlhallaID}
    if(command == 'stats'){
        const getPlayerStats = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/player/${args[1]}/stats?api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const statsValue = await getPlayerStats();
        console.log(statsValue);
    }

    // Command to fetch a player's brawlhallaID using their steamID. Eg command -> --id {steamID}
    if(command == 'id'){
        const getBrawlhallaID = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/search?steamid=${args[1]}&api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const brawlhallaID = await getBrawlhallaID();
        console.log(brawlhallaID);
        if(brawlhallaID["brawlhalla_id"] == null) {
            msg.reply(`Sorry, you don't seem to have a BrawlhallaID associated with your provided SteamID of ${args[1]} :smiling_face_with_tear:`);
        }
        else {
            msg.reply(`Hey, your brawlhalla ID is ${brawlhallaID["brawlhalla_id"]}`);
        }
    }
});

client.login(token);

