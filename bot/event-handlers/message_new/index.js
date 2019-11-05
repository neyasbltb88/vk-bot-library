module.exports = class {
    constructor(body, res) {
        console.log('Обработчик события "message_new"');
        console.log(body);

        res.end('ok');
    }
};
