const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const CONFIG = require('./config');
const HANDLERS = require('./event-handlers');
const serverSetup = require('./server-setup');
const db = require('./db');

global.PATH = {
    ROOT: __dirname,
    VK_API: path.resolve(__dirname, './vkApi'),
    CONFIG: path.resolve(__dirname, './config'),
    MSG_ACTIONS: path.resolve(__dirname, './event-handlers/message_new/actions'),
    MSG_COMMANDS: path.resolve(__dirname, './event-handlers/message_new/commands')
};
global.CONFIG = CONFIG;
const DB = new db(CONFIG.DB_URL);
global.DB = DB;

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

app.listen(CONFIG.PORT, async () => {
    console.log(`Бот запущен на порту: ${CONFIG.PORT}!`);

    // Подключение к базе данных
    await DB.connect();

    // Настройка Callback API сервера в сообществе
    await serverSetup(global.CONFIG);
});
