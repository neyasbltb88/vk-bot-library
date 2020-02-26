const DEFAULT = require('./default');

module.exports = class extends DEFAULT {
    constructor(message, match) {
        super(message);

        this.message = message;
        this.match = match;

        this.dbQuery();
    }

    render(data) {
        let { _id } = data;

        return `Статья успешно добавлена в закладки под id:${_id}`;
    }

    async dbQuery() {
        const { DB } = global;
        let { category, title, body } = this.match.groups;

        let data = await DB.addNote({
            category: category.trim(),
            title: title.trim(),
            body: body.trim(),
            attachments: this.message.attachments,
            author: this.message.from_id
        });
        // console.log('data: ', data);

        let answer = this.render(data);
        this.reply(answer);
    }
};
