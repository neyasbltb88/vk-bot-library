const DEFAULT = require('./default');
const show_commands = require('./show_commands');
const show_notes_page = require('./show_notes_page');
const show_category_list_page = require('./show_category_list_page');
const show_note = require('./show_note');
const add_note = require('./add_note');

module.exports = [
    {
        // Вывод списка команд бота
        regex: /^\s*!?\s*команды/iu,
        handler: show_commands
    },
    {
        // Показать страницу категорий
        // https://regex101.com/r/cAb4MG/2
        regex: /^\s*!?\s*категории\s*(\(\s*(?<page>\d+)\s*\))?$/iu,
        handler: show_category_list_page
    },
    {
        // Показать страницу записей из категории
        // https://regex101.com/r/Cpu2KC/4
        regex: /^\s*!?\s*категория\s*(?<category>.+?)\s*(\((?<page>\d+)\))?$/iu,
        handler: show_notes_page
    },
    {
        // Показать одну запись по ее id
        // https://regex101.com/r/wQs6h1/3
        regex: /^\s*!?\s*id:\s*(?<id>\d+)\s*$/iu,
        handler: show_note
    },
    {
        // Добавить запись в категорию
        // https://regex101.com/r/hBbe56/2
        regex: /^\s*!?\s*добавь в категорию\s*(?<category>.+)\s*?\{\{(?<title>.+)\}\}\s*(?<body>[\w\W]*)$/iu,
        handler: add_note
    }
];

module.exports['DEFAULT'] = DEFAULT;
