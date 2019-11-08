const DEFAULT = require('./default');

module.exports = class extends DEFAULT {
    constructor(message) {
        super(message);
        let answer = 'Запрос на показ команд бота';

        this.reply(answer);
    }
};
