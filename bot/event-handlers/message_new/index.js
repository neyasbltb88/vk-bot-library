const ACTIONS = require('./actions');

module.exports = class {
    constructor({ body }) {
        console.log('Обработчик события "message_new"');
        console.log(body);

        this.peer_id = body.object.message.peer_id;

        if (body.object.message.action) {
            let action = body.object.message.action;
            this.actionCaller(action);
        }
    }

    actionCaller(action) {
        const actionHandler = ACTIONS[action.type];

        if (actionHandler) {
            actionHandler(action, this.peer_id);
        }
    }
};
