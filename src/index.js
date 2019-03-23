const express = require('express');
const axios = require('axios');
const Logger = require('./logger');

const nodes = [];
const nodesDict = {};
process.argv.slice(2).forEach(x => {
    let tokens = x.split(':');
    let key = parseInt(tokens[0]);
    tokens.splice(0, 1);
    let host = new URL(tokens.join(':'));

    let node = { key, host };
    nodes.push(node);
    nodesDict[key] = node;
});

const hostNode = nodes[0];
const neighborNodes = nodes.slice(1);
let coordinatorNode = nodesDict[nodes.reduce((max, x) => Math.max(max, x.key), nodes[0].key)];
let isAwaitingNewCoordinator = false;

(async () => {
    const app = express();
    const logger = new Logger(process.pid, hostNode);
    
    registerEndpoints(app);

    setInterval(async () => {
        let url = new URL('/alive', coordinatorNode.host);

        try {
            let response = await axios.get(url.href);
            if (response.status === 200) {
                logger.log(`Coordinator ${coordinatorNode.host.href} is up`);
            } else {
                processElection(); // TODO: await?
            }
        } catch(error) {
            processElection(); // TODO: await?
        }
    }, 5000);
    
    app.listen(hostNode.host.port, () => logger.log('Up and listening'));
})();

function registerEndpoints(app) {
    app.get('/alive', (req, res) => res.sendStatus(200));
    app.get('/election', (req, res) => {
        isAwaitingNewCoordinator = true;
        res.sendStatus(200);
        processElection(); // TODO: await?
    });
    app.get('/victory', (req, res) => {
        isAwaitingNewCoordinator = false;
        coordinatorNode = neighborNodes.filter(x => x.key == req.query.key)[0];
        res.sendStatus(200);
    });
}

// call if coordinator goes down, or node receives election message
async function processElection() {
    // list out nodes by key, desc order
    let candidates = [hostNode, ...neighborNodes].sort((a, b) => a.key < b.key ? 1 : -1);

    for (candidate of candidates) {
        if (candidate.key === hostNode.key) {
            // declare self as coordinator
            // TODO: any awaiting or error handling needed?
            neighborNodes.forEach(x => {
                let url = new URL('/victory', x.host);
                axios.get(url.href, { params: { key: hostNode.key } }).catch(error => {}); // error is irrelevant
            });
            isAwaitingNewCoordinator = false;
            coordinatorNode = hostNode;
            break;
        } else {

            // send election message to candidate
            try {
                let url = new URL('/election', candidate.host);
                let response = await axios.get(url.href);

                // if response received from election call, wait for victory (but start over if it never comes)
                if (response.status === 200) {
                    setTimeout(() => {
                        if (isAwaitingNewCoordinator) {
                            processElection();
                        }
                    }, 10000);

                    break;
                }
            } catch (error) {
            }

        }
    }
}