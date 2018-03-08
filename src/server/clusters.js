const cluster = require('cluster'),
    server = require('./app'),
    log = require('./util/log').w;

/**
 * @name miniExchange
 * @description Cluster manager
 */
class miniExchange {
    constructor(obj) {
        this.name = obj.name;
        this.cpus = obj.cpus;
        this.autoRestart = obj.autoRestart;
    }

    start() {
        if (cluster.isMaster) { // make sure If it is master
            for (let i = 0; i < this.cpus; i += 1) { // iterate CPU core length
                console.log(this.name + ': Starting worker #' + i);
                cluster.fork();
            }
            cluster.on('death', function (worker) { // If worker dies
                log('INFO|cluster', this.name + ': Worker ' + worker.pid + ' died.');
                if (this.autoRestart) {
                    log('INFO|cluster', this.name + ': Restarting worker thread...');
                    cluster.fork(); // forking again the worker
                }
            });
        } else {
            new server().listen(); // create a new instance of server If not master
        }
    }
}

module.exports = miniExchange; // export the class as a module