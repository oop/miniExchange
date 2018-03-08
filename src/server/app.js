const conf = require('../../config.json'),
    mongodb = require('mongodb'),
    dbClient = mongodb.MongoClient,
    http = require('http'),
    express = require('express'),
    app = express(),
    io = require('socket.io'),
    bodyParser = require('body-parser'),
    path = require('path'),
    port = process.env.PORT || conf.server.port,
    {check, validationResult} = require('express-validator/check'),
    {matchedData} = require('express-validator/filter'),
    log = require('./util/log').w,
    company = require('./model/company'),
    mLogic = require('./util/matching.logic');

/**
 * @name Server
 * @description This class contains ExpressJS, HTTP, SocketIO and providing other fundamental codes.
 */
class Server {
    listen() {
        dbClient.connect(conf.database.address + conf.database.name, function (err, db) { // connection of MongoDB
            if (err) throw err;
            global.ObjectID = function(id) {
                return new mongodb.ObjectID(id);
            };
            app.use(bodyParser.urlencoded({extended: false})); // implementing bodyParser middleware to ExpressJS
            app.use(bodyParser.json());
            app.use(express.static(path.join(__dirname, '../client'))); // making /client folder accessible to everyone when HTTP server is on

            app.get('/api', [ // the API route for fetching the queries
                check('countrycode').exists().isLength({min: 2, max: 2}).withMessage('Country code should be only 2 chars long'), // some validations of queries
                check('Category').exists().isLength({
                    min: 1,
                    max: 25
                }).withMessage('Category should be at least 1 chars long'),
                check('BaseBid').exists().custom((value, {req}) => value >= conf.app.minBid).withMessage('Base bid should be at least 10 cent')
            ], (req, res) => {
                const errors = validationResult(req); // getting the filtered data from validation middleware
                if (!errors.isEmpty()) { // checking for errors
                    return res.status(422).json({success: false, err: errors.mapped()});
                }
                const data = matchedData(req); // getting the valid data
                company.getCompany(db, data, (err, obj) => { // fetching the companies based on the API queries
                    if(err) throw err;
                    mLogic.start(data, obj, (logic) => { // start doing test stages of companies to get the correct one
                        if(logic === null) {
                             return res.json({success: false, msg: "Could not find any company."})
                        } else {
                            company.updateBudget(db, logic, data, (err, company) => { // update the correct companies' budget
                                return res.json(company);
                            });
                        }
                    });
                });
            });
        });
        const server = http.createServer(app).listen(port); // connection of HTTP server
        global.socket = io(server); // connection of SocketIO
    }
}

module.exports = Server; // export the class as a module