const { PORT } = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const HANDLERS = require('./event-handlers');

global.ROOT_DIR = __dirname;
console.log(global.ROOT_DIR);

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
        new Handler(body, res);
    } else {
        console.log(`Не найден обработчик для события "${type}"`);
    }

    res.end('ok');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
