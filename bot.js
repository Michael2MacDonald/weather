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
                    if (message.mentions.users.first()) {
                        console.log(message.mentions.users.first().id);
                    } else {
                        console.log('Nope');
                    }
                    break;
                case 'help':
                    if ((messageWords.length === 1) || (messageWords[1] === '1')) {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 1/3 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> (for admins only) `establish <currency-acronym> <money-in-circulation>` register the country\n';
                        listOfCommands += '> `register` register for a bank account\n';
                        listOfCommands += '> `balance` see how much money you have\n';
                        listOfCommands += '> `exchange` see foreign exchange\n';
                        listOfCommands += '> `check <person>` give money to someone\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                        message.channel.send(listOfCommands);
                    } else if (messageWords[1] === '2') {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 2/3 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> `invest <stock-acronym>` invest in a stock\n';
                        listOfCommands += '> `convert <currency1-acronym> <quantity-of-currency1> <currency2-acronym>` convert money\n';
                        listOfCommands += '> `store` see items for sale\n';
                        listOfCommands += '> `buy <item>` buy an item\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                        message.channel.send(listOfCommands);
                    } else if (messageWords[1] === '3') {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 3/3 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> `recipes` show list of jobs\n';
                        listOfCommands += '> `jobs` show list of jobs\n';
                        listOfCommands += '> `apply <job>` apply for a job\n';
                        listOfCommands += '> `produce <item>` produce an item\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                        message.channel.send(listOfCommands);
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
                                        var newCountry = {
                                            guildID: message.guild.id,
                                            moneyInCirculation: parseInt(moneyInCirculation),
                                            currencyAcronym: currencyAcronym.toUpperCase(),
                                            netWorthNGA: 0,
                                            goods: []
                                        }
                                        moneyData.countries.push(newCountry);
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
                            message.channel.send('Please input the acronym of your currency and how much of your currency is in circulation.');
                        }
                    } else {
                        message.channel.send('You cannot establish this country. Sorry. ;-;');
                    }
                    break;
                case 'register':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var thisCountry = moneyData.countries.find(country => country.guildID === message.guild.id);
                    var thisAcc = moneyData.bankAccounts.find(account => account.accountID === message.author.id);

                    if (thisCountry) {
                        if (thisAcc) {
                            message.channel.send('You already have a bank account.');
                        } else {
                            moneyData.bankAccounts.push({ accountID: message.author.id, balance: [{ "currency": thisCountry.currencyAcronym, "amount": 0 }], job: "", itemProgress: 0 });
                            var processedTransaction = JSON.stringify(moneyData, null, 4);
                            fs.writeFileSync('money.json', processedTransaction);
                            message.channel.send('Congratulations! You now have a bank account!');
                        }
                    } else {
                        message.channel.send('This country has not yet been established. If you are an admin, please establish it.');
                    }
                    break;
                case 'balance':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);

                    var thisAcc = moneyData.bankAccounts.find(account => account.accountID === message.author.id);

                    if (thisAcc) {
                        for (i = 0; i < thisAcc.balance.length; i++) {
                            message.channel.send('You have ' + thisAcc.balance[i].amount + ' ' + thisAcc.balance[i].currency + ' in your bank account');
                        }
                    } else {
                        message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                    }
                    break;
                case 'exchange':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var country1;
                    var country2;

                    var foundCurrency1;
                    var currency1Circ;

                    var bankAccounts = moneyData.bankAccounts;
                    var thisBankAccount = bankAccounts.find(account => account.accountID === message.author.id);
                    var currency1Acc;
                    var currency2Acc;

                    if (messageWords.length !== 4) {
                        message.channel.send('The `exchange` command needs 3 parameters');
                    } else {
                        country1 = moneyData.countries.find(country => country.currencyAcronym === messageWords[1].toUpperCase());
                        country2 = moneyData.countries.find(country => country.currencyAcronym === messageWords[3].toUpperCase());

                        if (country1) {
                            foundCurrency1 = country1.currencyAcronym;
                            currency1Circ = country1.moneyInCirculation;
                        } else {
                            message.channel.send('First currency not recognized. :/');
                        }
                        
                        if (currency1Circ && currency2Circ) {
                            conversionRate = currency2Circ / currency1Circ;
                        }

                        if (!thisBankAccount) {
                            message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                        } else {
                            currency1Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency1);
                            currency2Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency2);
                            
                            if (!foundCurrency1) {
                                message.channel.send('Sorry. ;-; We could not find the currency you were trying to convert.');
                            } else {
                                if (currency1Acc) {
                                    if (currency1Acc.amount <= parseInt(messageWords[2])) {
                                        message.channel.send('You do not have enough ' + currency1Acc.currency + ' to make this transaction.');
                                    } else {
                                        if (!currency2Acc) {
                                            if (foundCurrency2) {
                                                thisBankAccount.balance.push({ "currency": messageWords[3].toUpperCase(), "amount": 0 });
                                                var processedTransaction = JSON.stringify(moneyData, null, 4);
                                                fs.writeFileSync('money.json', processedTransaction);
                                            }
                                        }
                                        currency1Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency1);
                                        currency2Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency2);
                                        if (!currency2Acc) {
                                            message.channel.send('Sorry. ;-; We could not find the currency you were trying to buy.');
                                        } else if (currency1Acc) {
                                            if (foundCurrency2 && (currency1Acc.amount >= parseInt(messageWords[2]))) {
                                                if (conversionRate !== 0) {
                                                    currency1Acc.amount -= parseInt(messageWords[2]);
                                                    currency2Acc.amount += parseInt(messageWords[2]) * conversionRate;
                                                    var processedTransaction = JSON.stringify(moneyData, null, 4);
                                                    fs.writeFileSync('money.json', processedTransaction);
                                                    message.channel.send('Money converted.');
                                                } else {
                                                    message.channel.send('Something went wrong. ;-;');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'check':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var country = moneyData.countries.find(country => country.currencyAcronym === messageWords[1].toUpperCase());

                    var foundCurrency;

                    var bankAccounts = moneyData.bankAccounts;
                    var thisBankAccount = bankAccounts.find(account => account.accountID === message.author.id);
                    var thatBankAccount = bankAccounts.find(account => account.accountID === message.mentions.users.first().id);

                    if (messageWords.length !== 4) {
                        message.channel.send('The `check` command needs 3 parameters');
                    } else {
                        if (country) {
                            foundCurrency = country.currencyAcronym;

                            if (!thisBankAccount) {
                                message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                            } else {
                                if (!thisBankAccount.balance.find(unit => unit.currency === foundCurrency)) {
                                    message.channel.send('You do not have enough ' + foundCurrency + ' to make this transaction.');
                                } else {
                                    var thisAccCurrency = thisBankAccount.balance.find(unit => unit.currency === foundCurrency);
                                    if (thisAccCurrency.amount < parseInt(messageWords[2])) {
                                        message.channel.send('You do not have enough ' + foundCurrency + ' to make this transaction.');
                                    } else {
                                        if (!thatBankAccount) {
                                            message.channel.send('The person you want to send money to does not yet have a bank account.');
                                        } else {
                                            if (!thatBankAccount.balance.find(unit => unit.currency === foundCurrency)) {
                                                thatBankAccount.balance.push({ currency: foundCurrency, amount: 0 });
                                            }
                                            var thatAccCurrency = thatBankAccount.balance.find(unit => unit.currency === foundCurrency);
                                            thisAccCurrency.amount -= parseInt(messageWords[2]);
                                            thatAccCurrency.amount += parseInt(messageWords[2]);
                                            var processedTransaction = JSON.stringify(moneyData, null, 4);
                                            fs.writeFileSync('money.json', processedTransaction);
                                            message.channel.send('Money sent successfully.');
                                        }
                                    }
                                }
                            }
                        } else {
                            message.channel.send('Currency not recognized. :/');
                        }
                    }
                    break;
                case 'convert':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var country1;
                    var country2;

                    var foundCurrency1;
                    var foundCurrency2;
                    var currency1Circ;
                    var currency2Circ;
                    var conversionRate = 0;

                    var bankAccounts = moneyData.bankAccounts;
                    var thisBankAccount = bankAccounts.find(account => account.accountID === message.author.id);
                    var currency1Acc;
                    var currency2Acc;

                    if (messageWords.length !== 4) {
                        message.channel.send('The `convert` command needs 3 parameters');
                    } else {
                        country1 = moneyData.countries.find(country => country.currencyAcronym === messageWords[1].toUpperCase());
                        country2 = moneyData.countries.find(country => country.currencyAcronym === messageWords[3].toUpperCase());

                        if (country1) {
                            foundCurrency1 = country1.currencyAcronym;
                            currency1Circ = country1.moneyInCirculation;
                        } else {
                            message.channel.send('First currency not recognized. :/');
                        }
                        if (country2) {
                            foundCurrency2 = country2.currencyAcronym;
                            currency2Circ = country2.moneyInCirculation;
                        } else {
                            message.channel.send('Second currency not recognized. :/');
                        }
                        
                        if (currency1Circ && currency2Circ) {
                            conversionRate = currency2Circ / currency1Circ;
                        }

                        if (!thisBankAccount) {
                            message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                        } else {
                            currency1Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency1);
                            currency2Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency2);
                            
                            if (!foundCurrency1) {
                                message.channel.send('Sorry. ;-; We could not find the currency you were trying to convert.');
                            } else {
                                if (currency1Acc) {
                                    if (currency1Acc.amount <= parseInt(messageWords[2])) {
                                        message.channel.send('You do not have enough ' + currency1Acc.currency + ' to make this transaction.');
                                    } else {
                                        if (!currency2Acc) {
                                            if (foundCurrency2) {
                                                thisBankAccount.balance.push({ "currency": messageWords[3].toUpperCase(), "amount": 0 });
                                                var processedTransaction = JSON.stringify(moneyData, null, 4);
                                                fs.writeFileSync('money.json', processedTransaction);
                                            }
                                        }
                                        currency1Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency1);
                                        currency2Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency2);
                                        if (!currency2Acc) {
                                            message.channel.send('Sorry. ;-; We could not find the currency you were trying to buy.');
                                        } else if (currency1Acc) {
                                            if (foundCurrency2 && (currency1Acc.amount >= parseInt(messageWords[2]))) {
                                                if (conversionRate !== 0) {
                                                    currency1Acc.amount -= parseInt(messageWords[2]);
                                                    currency2Acc.amount += parseInt(messageWords[2]) * conversionRate;
                                                    var processedTransaction = JSON.stringify(moneyData, null, 4);
                                                    fs.writeFileSync('money.json', processedTransaction);
                                                    message.channel.send('Money converted.');
                                                } else {
                                                    message.channel.send('Something went wrong. ;-;');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'store':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var thisCountryCirc = 0;
                    for (i = 0; i < moneyData.countries.length; i++) {
                        if (moneyData.countries[i].guildID === message.guild.id) {
                            thisCountryCirc = moneyData.countries[i].moneyInCirculation;
                        }
                    }

                    message.channel.send('`store` coming soon!');
                    break;
                case 'invest':
                    message.channel.send('`invest` coming soon!');
                    break;
                case 'recipes':
                    var itemList = '';
                    itemList += '> `memes` + `potato canon` = `deadly hot potato gun`\n';
                    itemList += '> `meat` + `grill` = `cooked meat`\n';
                    itemList += '> `research paper` + `research paper` = `nuke`\n';
                    itemList += '> `researcher` make(s) `research paper`\n';
                    itemList += '> `rice` + `cooked meat` = `meal`\n';
                    message.channel.send(itemList);
                    break;
                case 'jobs':
                    var jobsList = '';
                    jobsList += '> `memelord` make(s) `memes`\n';
                    jobsList += '> `farmer` make(s) `rice` and `meat`\n';
                    jobsList += '> `inventor` make(s) `potato canon`, and `grill`\n';
                    jobsList += '> `researcher` make(s) `research paper`\n';
                    jobsList += '> `tactitioner` make(s) `reverse card`, `bulletproof vest`, and `assassination`\n';
                    message.channel.send(jobsList);
                    break;
                case 'apply':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);

                    var bankAccount = moneyData.bankAccounts.find(account => account.accountID === message.author.id);
                    if (!bankAccount) {
                        message.channel.send('You need a bank account before you get a job.');
                    } else {
                        var theJob = messageWords[1].toLowerCase();
                        function changeJob(job) {
                            bankAccount.job = job;
                            var processedTransaction = JSON.stringify(moneyData, null, 4);
                            fs.writeFileSync('money.json', processedTransaction);
                            message.channel.send('Congratulations! You are now a `'+ job + '`!');
                        }
                        switch (theJob) {
                            case 'memelord':
                                changeJob(theJob);
                                break;
                            case 'farmer':
                                changeJob(theJob);
                                break;
                            case 'inventor':
                                changeJob(theJob);
                                break;
                            case 'researcher':
                                changeJob(theJob);
                                break;
                            case 'tactitioner':
                                changeJob(theJob);
                                break;
                            default:
                                message.channel.send('Sorry. ;-; This is not a job yet.');
                        }
                    }

                    break;
                case 'produce':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);

                    var item = messageText.slice(12);
                    
                    var country = moneyData.countries.find(country => country.guildID === message.guild.id);
                    var countryGoods = country.goods;

                    if (!countryGoods.find(good => good.itemName === item.toLowerCase())) {
                        countryGoods.push({ itemName: item.toLowerCase(), quantity: 1 });
                    } else {
                        countryGoods.find(good => good.itemName === item.toLowerCase()).quantity += 1;
                    }

                    var processedTransaction = JSON.stringify(moneyData, null, 4);
                    fs.writeFileSync('money.json', processedTransaction);

                    const capitalize = (s) => {
                        if (typeof s !== 'string') return ''
                        return s.charAt(0).toUpperCase() + s.slice(1)
                    }
                    
                    message.channel.send(capitalize(item) + ' has been produced. Your country thanks you!');
                    break;
                default:
                    message.channel.send('Unknown command. Please type `mac help` for a list of commands.');
            }
        }
    }
});

client.login('NzI5NTY1NDQyOTUxMjE3MTkz.XwVgIA.bMsxwbcsid1QYbI5yt3YQx1XZfg');