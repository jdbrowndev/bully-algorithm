class Logger {
    constructor(pid, node) {
        this.pid = pid;
        this.key = node.key;
        this.host = node.host;
    }

    log(message) {
        console.log(`(${this.pid}) ${this.host.href} -- ${message}`);
    }
}

module.exports = Logger;