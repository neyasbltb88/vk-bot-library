const CONFIG = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const HANDLERS = require('./event-handlers');
const path = require('path');

global.PATH = {
    ROOT: __dirname,
    API: path.resolve(__dirname, './api.js'),
    CONFIG: path.resolve(__dirname, './config.js'),
    MSG_ACTIONS: path.resolve(__dirname, './event-handlers/message_new/actions')
};

global.CONFIG = CONFIG;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/', (req, res) => {
    const { body } = req;
    const type = body.type;
    const Handler = HANDLERS[type];

    if (Handler) {
        new Handler({ body, res });
    } else {
        console.log(`Не найден обработчик для события "${type}"`);
    }

    res.end('ok');
});

app.listen(CONFIG.PORT, () => console.log(`Example app listening on port ${CONFIG.PORT}!`));
