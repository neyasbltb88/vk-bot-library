const DEFAULT = require('./default');

module.exports = class extends DEFAULT {
    constructor(message, match) {
        super(message);

        this.message = message;
        this.match = match;

        this.dbQuery();
    }

    render(data) {
        let { category, notes, pagination } = data;
        let rows = notes.map(note => {
            return `id:${note._id} ${note.title}`;
        });

        return `${category} [${pagination.current}/${pagination.total}]:\n\n` + rows.join('\n');
    }

    async dbQuery() {
        const { DB } = global;
        let { category, page } = this.match.groups;

        let data = await DB.findNotesPage(category, page);
        // console.log('data: ', data);

        if (data.error) {
            this.reply(data.text);

            return;
        }

        let answer = this.render(data);
        this.reply(answer);
    }
};
