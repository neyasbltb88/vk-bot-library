module.exports = class {
    constructor({ body }) {
        console.log(body);

        this.COMMANDS = require(global.PATH.MSG_COMMANDS);

        // Из текста с упоминанием бота выделяет id группы бота и текст сообщения
        // https://regex101.com/r/ZInaMl/2
        this.parseReference = /^[\s\n]*\[club(?<id>\d+)\|.+\](?<text>[\W\w\d\s\n]+)$/;

        // Для очистки текста сообщения от упоминания бота
        // https://regex101.com/r/4Ib6pn/2
        this.clearReference = /^[\s\n]*\[club\d+\|.+\]/;

        // Куда отправлять ответ
        this.peer_id = body.object.message.peer_id;

        // Если в сообщении есть действие(например, вход/выход из беседы), найдем обработчик для него
        if (body.object.message.action) {
            let action = body.object.message.action;
            this.msgActionCaller(action);
        }

        // Если есть текст сообщения, найдем обработчик для команды в нем
        if (body.object.message.text) {
            this.msgCommandCaller(body.object.message);
        }
    }

    // Получает тип действия из сообщения и находит соответствующий обработчик
    msgActionCaller(action) {
        const ACTIONS = require(global.PATH.MSG_ACTIONS);
        const actionHandler = ACTIONS[action.type];

        if (actionHandler) {
            actionHandler(action, this.peer_id);
        }
    }

    // Выделяет команду для бота из сообщения и находит соответствующий обработчик
    msgCommandCaller(message) {
        let { peer_id, from_id } = message;
        // Флаг для сообщения, отправленного в личку боту. В таком случае необязательно упоминать бота
        let isPrivateMessage = peer_id === from_id;
        // Флаг для того, чтобы отметить, был ли найден обработчик для команды из сообщения
        let isHandled = false;
        // Обработчик по умолчанию, который сообщает что не знает полученную команду
        const defaultHandler = this.COMMANDS.DEFAULT;

        if (!isPrivateMessage) {
            // Если сообщение из беседы, ищем в нем упоминание бота
            let match = this.parseReference.exec(message.text);
            console.log('match: ', match);

            // Если не найдено упоминания или оно не для этого бота, то выходим
            if (!match || match.groups.id !== global.CONFIG.GROUP_ID) return;
        }

        // Очищаем сообщение от упоминания
        message.text = message.text.replace(this.clearReference, '').trim();

        // Запускаем цикл по массиву обработчиков команд
        for (let i = 0; i < this.COMMANDS.length; i++) {
            let command = this.COMMANDS[i];

            // Если в тексте сообщения найдено совпадение с регуляркой обработчика, вызываем его и выходим из цикла
            if (command.regex.exec(message.text)) {
                isHandled = true;
                new command.handler(message);

                break;
            }
        }

        // Если после цикла команда осталась не обработанной, сообщает о том, что не знает такой команды
        if (!isHandled) {
            new defaultHandler(message).reply();
        }
    }
};
