const express = require('express');
const axios = require('axios');
const Logger = require('./logger');

(async () => {
    const nodes = [];
    const nodesDict = {};
    process.argv.slice(2).forEach(x => {
        let tokens = x.split(':');
        let key = parseInt(tokens[0]);
        tokens.splice(0, 1);
        let host = new URL(tokens.join(':'));

        let node = { key, host };
        nodes.push(node)
        nodesDict[key] = node;
    });

    const hostNode = nodes[0];
    const neighborNodes = nodes.slice(1);
    const logger = new Logger(hostNode);

    const app = express();
    let coordinatorKey = nodes.reduce((max, x) => Math.max(max, x.key), nodes[0].key);
    let coordinatorNode = nodesDict[coordinatorKey];
    
    app.get('/alive', (req, res) => res.sendStatus(200));
    app.get('/election', (req, res) => {
        // TODO: implement
        res.sendStatus(500);
    });
    app.get('/victory', (req, res) => {
        // TODO: implement
        res.sendStatus(500);
    });

    setInterval(async () => {
        let url = new URL('/alive', coordinatorNode.host);

        try {
            let response = await axios.get(url.href);
            if (response.status === 200) {
                logger.log(`Coordinator ${coordinatorNode.host.href} is up`);
            } else {
                // TODO: start election
            }
        } catch(error) {
            // TODO: start election
        }
    }, 5000);
    
    app.listen(hostNode.host.port, () => logger.log('Up and listening'));
})();