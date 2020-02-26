const DEFAULT = require('./default');

module.exports = class extends DEFAULT {
    constructor(message) {
        super(message);
        let answer = `✅ Добавить запись в закладки с указанием категории:
*bot_library добавь в категорию Тест
{{ Заголовок записи }}
Содержимое записи

✅ Показать список категорий с записями:
*bot_library категории

✅ Показать содержимое категории:
*bot_library категория git

✅ Для перехода на другие страницы с записями категории:
*bot_library категория git (2)

✅ Показать содержимое записи с указанным id:
*bot_library id:1
`;

        this.reply(answer);
    }
};
