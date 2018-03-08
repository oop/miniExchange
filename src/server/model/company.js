const log = require('../util/log').w;

/**
 * @name company
 * @description The purpose of this class is mainly CRUD process with the MongoDB database
 */
class company {
    getCompany(db, data, callback) { // get the company data with the provided API queries
        db.collection('companies').aggregate([
            {
                $project: {
                    _id: "$_id",
                    countryCode: {$indexOfArray: ["$Countries", data.countrycode]},
                    Category: {$indexOfArray: ["$Category", data.Category]},
                    Budget: "$Budget",
                    Bid: "$Bid",
                    CompanyID: "$CompanyID",
                }
            }
        ], (err, doc) => {
            if (err) {
                log('WARNING|api|db|getCompany', "internal server error: " + err)
                    .then(() => {
                        return callback("Internal server error: " + err, null);
                    });
            }
            if (doc && doc !== 'undefined') {
                return callback(null, doc)
            } else {
                log('WARNING|api|db|getCompany', "undefined document.")
                    .then(() => {
                        return callback("undefined document.", null);
                    });
            }
        });
    }
    updateBudget(db, data, api, callback) { // this is the final process of the matching logic class
        db.collection('companies').updateOne({_id: ObjectID(data._id)}, {
            $set: {
                Budget: Math.round( (data.Budget - api.BaseBid) * 1e2 ) / 1e2
            }
        }, (err, doc) => {
            if(err) {
                log('WARNING|api|db|updateBudget', "internal server error: " + err)
                    .then(() => {
                        return callback("internal server error: " + err, null);
                    });
            }
            if(doc && doc.modifiedCount) {
                return callback(null, data.CompanyID)
            } else {
                log('WARNING|api|db|updateBudget', "undefined document.")
                    .then(() => {
                        return callback("undefined document.", null);
                    });
            }
        });
    }
}

module.exports = new company(); // export the class as a module