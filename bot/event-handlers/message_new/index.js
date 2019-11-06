module.exports = class {
    constructor({ body }) {
        console.log('Обработчик события "message_new"');
        console.log(body);

        this.peer_id = body.object.message.peer_id;

        if (body.object.message.action) {
            let action = body.object.message.action;
            this.msgActionCaller(action);
        }
    }

    msgActionCaller(action) {
        const ACTIONS = require(global.PATH.MSG_ACTIONS);
        const actionHandler = ACTIONS[action.type];

        if (actionHandler) {
            actionHandler(action, this.peer_id);
        }
    }
};
