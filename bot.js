const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('mac help', { type: 'WATCHING' })
    .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
    .catch(console.error);
});

var commandPrefix = 'mac';

client.on('message', message => {

    var messageText = message.content;
    if (typeof messageText === 'string' || messageText instanceof String) {
        var messageWords = messageText.split(" ");
        if (messageWords[0].toLowerCase() === commandPrefix) {
            messageWords.shift();
            var cmd = messageWords[0];
            switch(cmd) {
                case 'test':
                    if (message.member.permissions.has('ADMINISTRATOR')) {
                        console.log('Yep');
                    } else {
                        console.log('Aww man');
                    }
                    break;
                case 'help':
                    if ((messageWords.length === 1) || (messageWords[1] === '1')) {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 1/2 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> (for admins only) `establish <currency-acronym> <money-in-circulation>` register the country\n';
                        listOfCommands += '> `register` register for a bank account\n';
                        listOfCommands += '> `balance` see how much money you have\n';
                        listOfCommands += '> `exchange` see foreign exchange\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                        message.channel.send(listOfCommands);
                    } else if ((messageWords.length === 1) || (messageWords[1] === '1')) {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 2/2 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> `check <person>` give money to someone\n';
                        listOfCommands += '> `invest <stock-acronym>` invest in a stock\n';
                        listOfCommands += '> `convert <currency1-acronym> <quantity-of-currency1> <currency2-acronym>` convert money\n';
                        listOfCommands += '> `store` see items for sale\n';
                        listOfCommands += '> `buy <item>` buy an item\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                    }
                    break;
                case 'establish':
                    if (message.member.permissions.has('ADMINISTRATOR')) {
                        if (messageWords.length === 3) {
                            var currencyAcronym = messageWords[1];
                            var moneyInCirculation = messageWords[2];
                            var moneyRaw = fs.readFileSync('money.json');
                            var moneyData = JSON.parse(moneyRaw);
                            var foundCountry = false;
                            for (i = 0; i < moneyData.countries.length; i++) {
                                if (message.guild.id === moneyData.countries[i].guildID) {
                                    foundCountry = true;
                                    message.channel.send('This country has already been established.');
                                }
                            }
                            if (!foundCountry) {
                                if (!Number.isNaN(parseInt(moneyInCirculation))) {
                                    if (currencyAcronym.length <= 3) {
                                        moneyData.countries.push({ guildID: message.guild.id, moneyInCirculation: parseInt(moneyInCirculation), currencyAcronym: currencyAcronym.toUpperCase(), netWorthNGA: 5000 });
                                        var processedTransaction = JSON.stringify(moneyData, null, 4);
                                        fs.writeFileSync('money.json', processedTransaction);
                                        message.channel.send('Congratulations! Your country has now been established in the interserver bank!');
                                    } else {
                                        message.channel.send('Your acronym is too long. Please give another acronym.');
                                    }
                                } else {
                                    message.channel.send('Sorry. You put an invalid number for the amount of currency in your country.');
                                }
                            }
                        } else {
                            message.channel.send('Please input the acronym of your currency ad how much of your currency is in circulation.');
                        }
                    } else {
                        message.channel.send('You cannot establish this country. Sorry. ;-;');
                    }
                    break;
                case 'register':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    var foundAccount = false;
                    for (i = 0; i < moneyData.bankAccounts.length; i++) {
                        if (message.author.id === moneyData.bankAccounts[i].accountID) {
                            foundAccount = true;
                            message.channel.send('You already have a bank account.')
                        }
                    }
                    if (!foundAccount) {
                        moneyData.bankAccounts.push({ accountID: message.author.id, balance: [] });
                        var processedTransaction = JSON.stringify(moneyData, null, 4);
                        fs.writeFileSync('money.json', processedTransaction);
                        message.channel.send('Congratulations! You now have a bank account!');
                    }
                    break;
                case 'balance':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    var foundAccount = false;
                    for (i = 0; i < moneyData.bankAccounts.length; i++) {
                        if (message.author.id === moneyData.bankAccounts[i].accountID) {
                            foundAccount = true;
                            for (j = 0; j < moneyData.bankAccounts[i].balance.length; j++) {
                                message.channel.send('You have ' + moneyData.bankAccounts[i].balance[j][1] + ' ' + moneyData.bankAccounts[i].balance[j][0] + ' in your bank account');
                            }
                        }
                    }
                    if (!foundAccount) {
                        message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                    }
                    break;
                case 'exchange':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    var thisMoneyCirc = 0;
                    var foundCountry = false;
                    for (i = 0; i < moneyData.countries.length; i++) {
                        if (message.guild.id === moneyData.countries[i].guildID) {
                            foundCountry = true;
                            thisMoneyCirc = moneyData.countries[i].moneyInCirculation;
                        }
                    }
                    if (!foundCountry) {
                        message.channel.send('This country is not in the Interserver Bank yet. Please tell the owner of this country to register this country.');
                    } else {
                        var currencyMessage = '';
                        for (i = 0; i < moneyData.countries.length; i++) {
                            currencyMessage += '> `' + moneyData.countries[i].currencyAcronym+ '` ' + moneyData.countries[i].moneyInCirculation/thisMoneyCirc + '\n';
                        }
                        message.channel.send(currencyMessage);
                    }
                    break;
                case 'check':
                    message.channel.send('`check` coming soon!');
                    break;
                case 'convert':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var foundAccount = false;
                    var bankAccounts = moneyData.bankAccounts;
                    var thisBankAccount;
                    
                    var foundCurrency1 = false;
                    var foundCurrency2 = false;
                    var currency1Circ = 0;
                    var currency2Circ = 0;
                    var conversionRate = 0;
                    
                    var enoughCurrency1 = false;
                    if (messageWords.length !== 4) {
                        message.channel.send('The `convert` command needs 3 parameters');
                    } else {
                        for (i = 0; i < bankAccounts.length; i++) {
                            if (message.author.id === bankAccounts[i].accountID) {
                                foundAccount = true;
                                thisBankAccount = bankAccounts[i];
                            }
                        }
                        if (!foundAccount) {
                            message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                        } else {
                            for (i = 0; i < thisBankAccount.balance.length; i++) {
                                if (thisBankAccount.balance[i][0] === messageWords[1].toUpperCase()) {
                                    foundCurrency1 = true;
                                    if (thisBankAccount.balance[i][1] < parseInt(messageWords[2])) {
                                        message.channel.send('You do not have enough ' + thisBankAccount.balance[i][0].toUpperCase() + ' to make this transaction.');
                                    } else {
                                        enoughCurrency1 = true;                                        
                                    }
                                }
                                if (thisBankAccount.balance[i][0] === messageWords[3].toUpperCase()) {
                                    foundCurrency2 = true;
                                }
                            }
                            if (!foundCurrency1) {
                                message.channel.send('Sorry. ;-; We could not find the currency you were trying to convert.');
                            } else {
                                if (enoughCurrency1) {
                                    if (!foundCurrency2) {
                                        for (i = 0; i < moneyData.countries.length; i++) {
                                            if (moneyData.countries[i].currencyAcronym === messageWords[3].toUpperCase()) {
                                                foundCurrency2 = true;
                                                thisBankAccount.balance.push([messageWords[3].toUpperCase(), 0]);
                                                var processedTransaction = JSON.stringify(moneyData, null, 4);
                                                fs.writeFileSync('money.json', processedTransaction);
                                            }
                                        }
                                    }
                                    if (!foundCurrency2) {
                                        message.channel.send('Sorry. ;-; We could not find the currency you were trying to buy.');
                                    }
                                }
                            }
                            if (foundCurrency1 && foundCurrency2 && enoughCurrency1) {
                                for (i = 0; i < moneyData.countries.length; i++) {
                                    if (moneyData.countries[i].currencyAcronym === messageWords[1].toUpperCase()) {
                                        currency1Circ = moneyData.countries[i].moneyInCirculation;
                                    }
                                    if (moneyData.countries[i].currencyAcronym === messageWords[3].toUpperCase()) {
                                        currency2Circ = moneyData.countries[i].moneyInCirculation;
                                    }
                                }
                                conversionRate = currency2Circ/currency1Circ;
                                for (i = 0; i < thisBankAccount.balance.length; i++) {
                                    if (thisBankAccount.balance[i][0] === messageWords[1].toUpperCase()) {
                                        thisBankAccount.balance[i][1] -= parseInt(messageWords[2]);
                                    }
                                    if (thisBankAccount.balance[i][0] === messageWords[3].toUpperCase()) {
                                        thisBankAccount.balance[i][1] += parseInt(messageWords[2]) * conversionRate;
                                    }
                                }
                                var processedTransaction = JSON.stringify(moneyData, null, 4);
                                fs.writeFileSync('money.json', processedTransaction);
                                message.channel.send('Money converted.');
                            }
                        }
                    }
                    break;
                case 'invest':
                    message.channel.send('`invest` coming soon!');
                    break;
                default:
                    message.channel.send('Unknown command. Please type `mac help` for a list of commands.');
            }
        }
    }
});

client.login('NzI5NTY1NDQyOTUxMjE3MTkz.XwKzIA.YtSvRj0RUCA-c6QOyPN9nK6G_kU');