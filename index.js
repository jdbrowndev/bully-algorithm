const express = require('express');

(async () => {
    const nodesDict = {};
    process.argv.slice(2).forEach(x => {
        let tokens = x.split(':');
        let key = parseInt(tokens[0]);
        tokens.splice(0, 1);
        let host = new URL(tokens.join(':'));
        nodesDict[key] = { key, host };
    });
    const nodes = Object.values(nodesDict);

    const hostNode = nodes[0];
    const neighborNodes = nodes.slice(1);

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
    
    // output logs to files somewhere
    const port = hostNode.host.port;
    app.listen(port, () => console.log(`Node listening on port ${port}`));
})();