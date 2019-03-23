const { fork } = require('child_process');
const path = require('path');

const network = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
].map((x, i) => `${i}:${x}`);

const processes = [];
network.forEach((x, i) => {
    let args = network.slice();
    args.splice(i, 1);
    args.unshift(x);
    
    let process = fork(path.join(__dirname, 'index.js'), args, { detached: false, stdio: 'inherit' });
    processes.push(process);
});