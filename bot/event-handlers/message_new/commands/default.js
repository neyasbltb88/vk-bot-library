module.exports = class {
    constructor({ peer_id }) {
        this.peer = peer_id;
        this.answer = `Я не знаю такой команды😒`;
    }

    async reply(answer = this.answer) {
        const api = require(global.PATH.API);
        let res = await api('messages.send', {
            peer_id: this.peer,
            message: answer,
            random_id: Date.now()
        });

        return res;
    }
};
