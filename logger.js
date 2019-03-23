class Logger {
    constructor(node) {
        this.key = node.key;
        this.host = node.host;
    }

    log(message) {
        console.log(`${this.host.href} -- ${message}`);
    }
}

module.exports = Logger;