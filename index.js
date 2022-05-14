// Import all required packages
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const axios = require('axios');
const fs = require('fs'); 
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const token = process.env.TOKEN;

const prefix = "--";

// This is to create a Collection of all commands as indicated in the /commands directory
client.commands = new Collection();

// Reading every .js file in the /commands directory pertaining to a particular bot command
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once("ready", () => {
    console.log("Silicon is up and running!");
});

client.on("messageCreate", async msg => {
    // If invalid prefix or a bot has sent the message, no actions
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;        

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args[0];

    // Introductory command
    if(command == 'hey'){
        client.commands.get('hey').execute(msg, args);
    }

    // Command leading to Git repo source 
    if(command == 'source'){
        client.commands.get('source').execute(msg, args);
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

    if(command == "embed"){
        const embed = new MessageEmbed();

        embed.setTitle("Here's the embed you made")
        .setDescription("This will display the future stats of players and legends")
        .setColor('RANDOM')
        .setTimestamp()

        msg.reply({embeds: [embed]});
        

    }
});

client.login(token);

