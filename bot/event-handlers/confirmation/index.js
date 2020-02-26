module.exports = class {
    constructor({ res }) {
        const { CONFIRMATION } = global.CONFIG;

        console.log('Получен запрос на подтверждение, в ответ будет отправлено: ', CONFIRMATION);

        res.end(CONFIRMATION);
    }
};
