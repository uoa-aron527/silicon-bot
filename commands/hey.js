module.exports = {
    name: 'hey',
    description: 'This command is to get the bot to introduce itself to the user',
    execute(msg, args){
        msg.channel.send("Yo Silicon here!");
    }
}