const log = require('./log').w;

/**
 * @name Matching Logic
 * @description Do the matching process with provided company data
 */
class MatchingLogic {
    async start(api, output, callback) {
        function declareWinner(type, data) { // this function helps to iterate all the possible filtering stages
            if (Object.keys(data).length > 0) { // check if we provided with the company data
                let passed = [], notPassed = [];
                switch (type) {
                    case 'BaseTargeting': // fetch companies based on API queries
                        for (let x in data) {
                            (data[x].countryCode >= 0 && data[x].Category >= 0) ? passed.push(data[x]) : notPassed.push(data[x]); // being sure that the database result is valid to current API queries
                        }
                        log('INFO|api|BaseTargeting#1', JSON.stringify({
                            passed: passed.map(c => c.CompanyID),
                            notPassed: notPassed.map(c => c.CompanyID)
                        }), false)
                            .then(() => {
                                declareWinner('BudgetCheck', passed); // proceed next stage with calling same function
                            });
                        break;
                    case 'BudgetCheck': // make sure it has a valid budget
                        for (let x in data) {
                            ((data[x].Budget - parseFloat(api.BaseBid)) >= 0) ? passed.push(data[x]) : notPassed.push(data[x]); // being sure that company has a enough budget to sell it's stocks
                        }
                        log('INFO|api|BudgetCheck#2', JSON.stringify({
                            passed: passed.map(c => c.CompanyID),
                            notPassed: notPassed.map(c => c.CompanyID)
                        }), false)
                            .then(() => {
                                declareWinner('BaseBid', passed); // proceed next stage with calling same function
                            });
                        break;
                    case 'BaseBid': // make sure it has a valid bid
                        for (let x in data) {
                            (data[x].Bid > api.BaseBid) ? passed.push(data[x]) : notPassed.push(data[x]); // being sure that the external bid is lower than the original bid value
                        }
                        log('INFO|api|BaseBid#3', JSON.stringify({
                            passed: passed.map(c => c.CompanyID),
                            notPassed: notPassed.map(c => c.CompanyID)
                        }), false)
                            .then(() => {
                                declareWinner('Shortlist', passed); // proceed next stage with calling same function
                            });
                        break;
                    case 'Shortlist': // making of the shortlist by highest bid value
                        if (data.length > 1) {
                            data = data.find((e) => { // finding the object itself by it's Bid value
                                return e.Bid === Math.max(...data.map(o => o.Bid)); // finding the maximum valued object
                            });
                        } else {
                            data = data[0]
                        }
                        log('INFO|api|Winner#4', data.CompanyID, false)
                            .then(() => {
                                callback(data);  // finish the process
                            });
                        break;
                }
            } else {
                callback(null);
            }
        }
        declareWinner('BaseTargeting', output); // triggering of the core function
    }
}

module.exports = new MatchingLogic(); // export the class as a module