const DEFAULT = require('./default');

module.exports = class extends DEFAULT {
    constructor(message, match) {
        super(message);

        this.message = message;
        this.match = match;

        this.dbQuery();
    }

    render(data) {
        let { categories, pagination } = data;
        let rows = categories.map(category => {
            return `${category.name} (${category.count})`;
        });

        return `Категории [${pagination.current}/${pagination.total}]:\n\n` + rows.join('\n');
    }

    async dbQuery() {
        const { DB } = global;
        let { page } = this.match.groups;

        let data = await DB.findCategoryListPage(page);
        console.log('data: ', data);

        if (data.error) {
            this.reply(data.text);

            return;
        }

        let answer = this.render(data);
        this.reply(answer);
    }
};
