const express = require('express');
const axios = require('axios');
const Logger = require('./logger');

let coordinatorNode = null;
let isAwaitingNewCoordinator = false;

(async () => {
    const app = express();
    const nodes = getNodes(process.argv);
    const thisNode = nodes[0];
    const logger = new Logger(process.pid, thisNode);

    const initialCoordinatorKey = nodes.reduce((max, x) => Math.max(max, x.key), nodes[0].key);
    coordinatorNode = nodes.filter(x => x.key === initialCoordinatorKey)[0];

    registerEndpoints(app, nodes, logger);
    setInterval(() => pingCoordinator(nodes, logger), 5000);
    
    app.listen(thisNode.host.port, () => logger.log('Up and listening'));
})();

function getNodes(args) {
    let nodes = args.slice(2).map(x => {
        let tokens = x.split(':');
        return { 
            key: parseInt(tokens[0]),
            host: new URL(tokens.slice(1).join(':'))
        };
    });

    return nodes;
}

function registerEndpoints(app, nodes, logger) {
    app.get('/alive', (req, res) => res.sendStatus(200));

    app.get('/election', (req, res) => {
        isAwaitingNewCoordinator = true;
        res.sendStatus(200);
        processElection(nodes, logger);
    });

    app.get('/victory', (req, res) => {
        isAwaitingNewCoordinator = false;
        coordinatorNode = nodes.filter(x => x.key == req.query.key)[0];
        res.sendStatus(200);
        logger.log(`Set ${coordinatorNode.host.href} as the new coordinator`);
    });
}

async function pingCoordinator(nodes, logger) {
    try {
        let url = new URL('/alive', coordinatorNode.host);
        await axios.get(url.href);
        logger.log(`Coordinator ${coordinatorNode.host.href} is up`);
    } catch(error) {
        logger.log(`Coordinator ${coordinatorNode.host.href} is down!`);
        processElection(nodes, logger);
    }
}

async function processElection(nodes, logger) {
    logger.log('Starting election...');

    let thisNode = nodes[0];
    let candidates = nodes.sort((a, b) => b.key - a.key); // descending order by key

    for (candidate of candidates) {
        if (candidate.key === thisNode.key) {
            logger.log('Declaring self as new coordinator');

            await Promise.all(
                nodes.map(x => {
                    let url = new URL('/victory', x.host);
                    return axios.get(url.href, { params: { key: thisNode.key } });
                })
            ).catch(() => {});
            
            break;
        } else {

            try {
                // send election message to candidate
                let url = new URL('/election', candidate.host);
                await axios.get(url.href);

                // if response received, wait for subsequent victory message (but start over if it never comes)
                setTimeout(() => {
                    if (isAwaitingNewCoordinator) {
                        processElection();
                    }
                }, 10000);

                break;
            } catch (error) {
            }

        }
    }
}