const DEFAULT = require('./default');

module.exports = class extends DEFAULT {
    constructor(message, match) {
        super(message);

        this.message = message;
        this.match = match;

        this.dbQuery();
    }

    async render(data) {
        let vkApi = require(global.PATH.VK_API);
        let { _id, title, body, author, category, date } = data;
        let authorId = author.vkId;
        let noteFooterAuthor = '';
        let noteFooterDivide = '';

        try {
            let vkUser = await vkApi('users.get', { user_ids: authorId });
            let { first_name, last_name } = vkUser.response[0];

            // noteFooterAuthor = `Ⓒ[id${authorId}|${first_name} ${last_name}]`;
            noteFooterAuthor = `Ⓒ${first_name} ${last_name}`;
            noteFooterDivide = '-'.repeat(noteFooterAuthor.length) + '-';
            // eslint-disable-next-line no-empty
        } catch (err) {}

        let noteHeader = `id:${_id} [${category.name}]\n${title}\n\n`;
        let noteBody = `${body}\n`;
        let noteFooterDate = `[${date.toLocaleDateString('ru-RU')}]`;

        if (!noteFooterDivide) {
            noteFooterDivide = '-'.repeat(noteFooterDate.length);
        }

        let noteFooter = '\n\n' + noteFooterDivide + '\n' + noteFooterAuthor + ' ' + noteFooterDate;

        return noteHeader + noteBody + noteFooter;
    }

    async dbQuery() {
        const { DB } = global;
        let { id } = this.match.groups;

        let data = await DB.findNote(id, 'author category');
        // console.log('data: ', data);

        if (data.error) {
            this.reply(data.text);

            return;
        }

        let answer = await this.render(data);
        this.reply(answer);
    }
};
