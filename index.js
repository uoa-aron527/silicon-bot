// Import all required packages
const { Client, Intents, Collection, MessageEmbed, DiscordAPIError, CommandInteraction } = require('discord.js');
const axios = require('axios');
const fs = require('fs'); 
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const prefix = "--";

let topStatsWithID = [];

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

    const user = msg instanceof CommandInteraction ? msg.user : msg.author;

    const embed = new MessageEmbed();

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
        if(parseInt(args[1]) > 59 || parseInt(args[1]) == 1 || parseInt(args[1]) == 2 || parseInt(args[1]) == 17 || parseInt(args[1]) == 27 || parseInt(args[1]) < 1){
            msg.reply("Please enter a legend number except 1,2,17,27 and in between 3 and 59. There's only so many legends :skull:");
        }
        else{
            const getLegendStats = async () => {
                let response = await axios.get(`https://api.brawlhalla.com/legend/${args[1]}/?api_key=${process.env.APIKEY}`);
                return response.data;
            }
        const statsValue = await getLegendStats();

        embed.setTitle(statsValue["bio_name"])
        .setDescription(statsValue["bio_text"])
        .setColor('RANDOM')
        .addFields({
            name: "Bio", value: statsValue["bio_quote"].concat(statsValue["bio_quote_about_attrib"])
        },
        {
            name: "Quote", value: statsValue["bio_quote_from"].concat(statsValue["bio_quote_from_attrib"])
        },
        {
            name: "Weapon One", value: statsValue["weapon_one"], inline: true
        },
        {
            name: "Weapon Two", value: statsValue["weapon_two"], inline: true
        },);

        msg.reply({embeds: [embed]});
        // console.log(statsValue);
        }
    }

    // Command to fetch a player's full time game data. Eg command -> --stats {brawlhallaID}
    if(command == 'stats'){
        const getPlayerStats = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/player/${args[1]}/stats?api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const statsValue = await getPlayerStats();

        // console.log(statsValue["legends"][4]);

        embed.setTitle(statsValue["name"])
        .setDescription("XP - ".concat(statsValue["xp"]))
        .setColor('RANDOM')
        .setThumbnail(user.displayAvatarURL({dynamic: true}))
        .addFields({
            name: "Level", value: statsValue["level"].toString()
        },
        {
            name: "Games Played", value: statsValue["games"].toString()
        },
        {
            name: "Games Won", value: statsValue["wins"].toString()
        },
        {
            name: "Win Percentage", value: ((statsValue["wins"]/statsValue["games"]) * 100).toFixed(2).toString().concat("%")
        },
        {
            name: "Damage by Bombs", value: statsValue["damagebomb"], inline: true
        },
        {
            name: "Bomb KOs", value: statsValue["kobomb"].toString(), inline: true
        },
        {
            name: '\u200b', value: '\u200b', inline: false
        },
        {
            name: "Damage by Mines", value: statsValue["damagemine"], inline: true
        },
        {
            name: "Mine KOs", value: statsValue["komine"].toString(), inline: true
        },
        {
            name: '\u200b', value: '\u200b', inline: false
        },
        {
            name: "Damage by Spikeballs", value: statsValue["damagespikeball"], inline: true
        },
        {
            name: "Spikeball KOs", value: statsValue["kospikeball"].toString(), inline: true
        });

        msg.reply({embeds : [embed]});
        topStatsWithID = [];
    }

    // Command to fetch a player's top 15 legends sorted according to in-game damage done. Eg command -> --top {brawlhallaID}
    if(command == 'top') {
        const getTopStats = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/player/${args[1]}/stats?api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const statsValue = await getTopStats();

        if(statsValue["legends"].length == 0) {
            msg.reply("Sorry, you haven't played with a single legend yet to get any data ;(");
        }

        else {

            for(let i = 0; i < statsValue["legends"].length; i++) {
                if(statsValue["legends"][i]["damagedealt"] !== "0" ) {
                    topStatsWithID.push({"damagedealt": statsValue["legends"][i]["damagedealt"],
                                        "legend_name": statsValue["legends"][i]["legend_name_key"].charAt(0).toUpperCase()
                                        .concat(statsValue["legends"][i]["legend_name_key"].slice(1))});
                }
            }

            topStatsWithID.sort((a, b) => {
                return b["damagedealt"] - a["damagedealt"];
            })

            topStatsWithID = topStatsWithID.slice(0,15);

            console.log(topStatsWithID);
            
            embed.setTitle(statsValue["name"])
            .setDescription("Here are your top 15 legends in regards with damage done")
            .setColor('RANDOM')
            .setThumbnail(user.displayAvatarURL({dynamic: true}));

            let i = 0;

            while(i < 15 && i!= topStatsWithID.length) {
                embed.addFields({
                    name: `${i+1}. ${topStatsWithID[i]["legend_name"]}`,
                    value: topStatsWithID[i]["damagedealt"]
                });
                i++;
            }

            msg.reply({embeds : [embed]});

            topStatsWithID = [];
        }    
    }

    // Command to fetch a player's ranked game stats. Eg command -> --rank {brawlhallaID}
    if(command == 'rank') {
        const getPlayerRank = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/player/${args[1]}/ranked?api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const playerRank = await getPlayerRank();
        console.log(playerRank);
        msg.react("🦾");

        embed.setTitle(playerRank["name"])
        .setDescription("Here is your ranked data")
        .setColor("RANDOM")
        .setThumbnail(user.displayAvatarURL({dynamic: true}))
        .addFields({
            name: "Rating", value: playerRank["rating"].toString()
        },
        {
            name: "Peak Rating", value: playerRank["peak_rating"].toString()
        },
        {
            name: "Tier", value: playerRank["tier"]
        },
        {
            name: "Games Played", value: playerRank["games"].toString()
        },
        {
            name: "Games Won", value: playerRank["wins"].toString()
        },
        {
            name: "Win Percentage", value: (playerRank["wins"] / playerRank["games"] * 100).toFixed(2).toString().concat("%")
        },
        {
            name: "Top Used Legends", value: "Here are your must used legends"
        });

        msg.reply({embeds : [embed]});
    }
    // Command to fetch a player's brawlhallaID using their steamID. Eg command -> --id {steamID}
    if(command == 'id'){
        const getBrawlhallaID = async () => {
            let response = await axios.get(`https://api.brawlhalla.com/search?steamid=${args[1]}&api_key=${process.env.APIKEY}`);
            return response.data;
        }
        const brawlhallaID = await getBrawlhallaID();
        console.log(brawlhallaID["brawlhalla_id"]);
        if(brawlhallaID["brawlhalla_id"] == null) {
            msg.reply(`Sorry, you don't seem to have a BrawlhallaID associated with your provided SteamID of ${args[1]} :smiling_face_with_tear:`);
        }
        else {
            msg.reply(`Hey, your brawlhalla ID is ${brawlhallaID["brawlhalla_id"]}`);
        }
    }
});

client.login(process.env.TOKEN);

