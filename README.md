# bully-algorithm

A Node/Express implementation of the [bully algorithm.](https://en.wikipedia.org/wiki/Bully_algorithm)

## Install

Run `npm install`.

## Run

For a quick demo, run `npm test`. The test script will launch a local 5-node network. The network will elect a coordinator when a node initializes or when the current coordinator does not respond to health checks.

For a custom network, run `npm run start <nodes...>` for each node where `<nodes...>` is a space-separated list of nodes in the network. The first node in each list should be the node being instantiated.

A node should entered as a `<key>:<url>` pair where `<key>` is a unique integer and `<url>` is the node's base URL.

Example 3-node network:
```
npm run start 1:http://localhost:3000 2:http://localhost:3001 3:http://localhost:3002
npm run start 2:http://localhost:3001 1:http://localhost:3000 3:http://localhost:3002
npm run start 3:http://localhost:3002 1:http://localhost:3000 2:http://localhost:3001
```