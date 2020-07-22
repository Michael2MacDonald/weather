const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

var mysql = require('mysql');
var con = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.user.setActivity("~help", {type: "WATCHING"});
    // List servers the bot is connected to
    console.log("Servers:");
    client.guilds.cache.forEach( (guild) => { console.log(" - " + guild.name) } );
})

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
      return
    }

    if (receivedMessage.content.startsWith("~")) {
      processCommand(receivedMessage)
    }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    var primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    primaryCommand = primaryCommand.toLowerCase(); // makes primary command lowercase so that we can detect if someone makes a command lIkE tHiS

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments) // There may not be any arguments

    switch (primaryCommand) {
        case 'help':
            helpCommand(arguments, receivedMessage);
        break
        case 'ping':
            pingCommand(arguments, receivedMessage);
        break;
        case 'getdata':
            getDataCommand(arguments, receivedMessage);
        break;
        default:
            receivedMessage.channel.send("I don't understand the command. Try `~help` or `~help [command]`")
    }
}

function helpCommand(arguments, receivedMessage) {
    if (arguments.length > 0) {
      receivedMessage.channel.send("It looks like you might need help with " + arguments)
    } else {
      receivedMessage.channel.send("Commands:\nHelp Message (This Message) `~help` \nHelp Message For Command `~help [command name]` \nTest If The Bot Is Working `~ping`")
    }
}

function pingCommand(arguments, receivedMessage) {
    receivedMessage.channel.send("Pong")
}

function getDataCommand(arguments, receivedMessage) {
  if (arguments.length < 1) {
    receivedMessage.channel.send("Please put some arguments");
  } else {
    con.connect();

    //gets all the data
    let sql = "SELECT * FROM boards"
    con.query(sql, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      } else {
        // I commented this part out so that results would stay as an object

        //results = JSON.stringify(results);
        //console.log(results);

        //makes all args lowercase
        let argsToLowerCase = [];
        for (i = 0; i < arguments.length; i++) {
          argsToLowerCase.push(arguments[i].toLowerCase());
        }

        var specificPlace = results.find(place => place.board_name.toLowerCase().startsWith(argsToLowerCase[0])); // checks for the searched location

        if (specificPlace) { // checks if searched location has been found
          var placeMessage = '';
          placeMessage += "`id` " + specificPlace.id + "\n";
          placeMessage += "`latitude` " + specificPlace.latitude + "\n";
          placeMessage += "`longitude` " + specificPlace.longitude + "\n";
          placeMessage += "`temperature` " + specificPlace.temperature + "\n";
          placeMessage += "`pressure` " + specificPlace.pressure + "\n";
          placeMessage += "`last_time_connected` " + specificPlace.last_time_connected + "\n";
          var placeEmbed = new Discord.MessageEmbed()
            .setColor('#90ee90')
            .setTitle(specificPlace.board_name)
            .setDescription(placeMessage);
          receivedMessage.channel.send(placeEmbed);
        } else {
          receivedMessage.channel.send("Sorry. ;-; We couldn't find the location you were trying to find.");
        }
      }
    });

    con.end();
  }
}

client.login(config.token)
