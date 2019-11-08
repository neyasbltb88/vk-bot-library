const DEFAULT = require('./default');
const show_commands = require('./show_commands');

module.exports = [
    {
        regex: /команды/iu,
        handler: show_commands
    }
];

module.exports['DEFAULT'] = DEFAULT;
