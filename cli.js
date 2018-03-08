const readline = require('readline'),
    request = require('request'),
    fs = require('fs'),
    conf = require('./config.json'),
    mongodb = require('mongodb'),
    dbClient = mongodb.MongoClient,
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    apiQuery = {
        countrycode: null,
        Category: null,
        BaseBid: null
    };

cli_form();

function cli_form() {
    console.log('-----------------------------------');
    console.log('miniExchange Command-line interface');
    console.log('-----------------------------------');
    console.log('[ What do you want to do? ]');
    console.log('1. Screenshot of database');
    console.log('2. Check logs');
    console.log('3. Make a request to API');
    console.log('4. Type anything and enter to exit');

    rl.question('Select by number (without dot): ', (menu_) => {
        if(menu_ == 1) {
            dbClient.connect(conf.database.address + conf.database.name, function (err, db) {
                if (err) throw err;
                db.collection('companies').find().toArray((err, arr) => {
                   for(let x in arr) {
                       console.log(arr[x]);
                   }
                    cli_ask();
                });
            });
        } else if (menu_ == 2) {
            fs.readFile('./logs/log.txt', 'utf8', (err, data) => {
                if(err) {
                    console.log('Could not find the logs... :/');
                } else {
                    console.log(data);
                }
                cli_ask();
            });
        } else if (menu_ == 3) {
            rl.question('Please specify the country code: ', (cc_) => {
                apiQuery.countrycode = cc_;
                rl.question('Please specify the category: ', (c_) => {
                    apiQuery.Category = c_;
                    rl.question('Please specify the bid value: ', (b_) => {
                        apiQuery.BaseBid = b_;
                        request({
                            method: "GET",
                            uri: `http://localhost:${conf.server.port}/api`,
                            json: apiQuery
                        }, (err, res, body) => {
                            console.log('-----------------------------------');
                            console.log('Response:\n' + JSON.stringify(body));
                            console.log('-----------------------------------');
                            cli_ask();
                        })
                    });
                });
            });
        } else {
            console.log('[ Bye! ]');
            process.exit();
        }
    });
}

function cli_ask() {
    rl.question('[ Do you want to start over again (Y/N)? ] ', (again_) => {
        (again_.toLowerCase() === 'y') ? cli_form() : console.log('[ Bye! ]'); process.exit();
    });
}