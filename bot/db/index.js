const mongoose = require('mongoose');
const { Author, Category, Note } = require('./models');

module.exports = class {
    constructor(connectUrl) {
        this.connectUrl = connectUrl;
    }

    /* === Автор === */
    async requireAuthor(vkId) {
        let existAuthor = await this.findAuthor(vkId);

        if (!existAuthor) {
            existAuthor = await this.addAuthor(vkId);
        }

        return existAuthor;
    }

    async incAuthor(author) {
        return await Author.findByIdAndUpdate(author._id, {
            count: author.count + 1,
            lastNoteDate: Date.now()
        });
    }

    async addAuthor(vkId) {
        let newAuthor = new Author({
            vkId,
            count: 0
        });
        let res = await newAuthor.save();

        return res;
    }

    async findAuthor(vkId) {
        return await Author.findOne({ vkId });
    }
    /* --- Автор --- */

    /* === Категории === */
    async requireCategory(name, author) {
        let existCategory = await this.findCategory(name);

        if (!existCategory) {
            existCategory = await this.addCategory(name, author);
        }

        return existCategory;
    }

    async incCategory(category) {
        return await Category.findByIdAndUpdate(category._id, {
            count: category.count + 1
        });
    }

    async addCategory(name, author) {
        let existAuthor = await this.requireAuthor(author);

        let newCategory = new Category({
            name,
            author: existAuthor._id,
            count: 0
        });
        let res = await newCategory.save();

        return res;
    }

    async findCategory(name) {
        return await Category.findOne({ name });
    }
    /* --- Категории --- */

    /* === Записи === */
    async addNote(content) {
        let { category, author } = content;
        let existCategory = await this.requireCategory(category, author);
        let existAuthor = await this.requireAuthor(author);

        content = {
            ...content,
            category: existCategory._id,
            author: existAuthor._id
        };
        let note = new Note(content);
        let res = await note.save();

        if (res) {
            await this.incCategory(existCategory);
            await this.incAuthor(existAuthor);
        }

        return res;
    }

    async findNote(id, populate = '') {
        let res = await Note.findById(id).populate(populate);
        return res;
    }
    /* --- Записи --- */

    async connect() {
        let connection = await mongoose.connect(this.connectUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        return connection;
    }

    async disconnect() {
        let res = await mongoose.disconnect();

        return res;
    }
};
