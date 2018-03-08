const conf = require('./config.json'),
    cluster = require('./src/server/clusters'),
    os = require('os'),
    clusterInst = new cluster({ // declare new cluster object with the properties
        name: conf.cluster.clusterName,
        cpus: os.cpus().length,
        autoRestart: conf.cluster.autoRestart
    });

clusterInst.start(); // trigger the cluster