const mongoose = require('mongoose');
const { Author, Category, Note } = require('./models');

module.exports = class {
    constructor(connectUrl) {
        this.connectUrl = connectUrl;
        this.defaultLimit = 10;
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

    // Находит документ категории по ее имени
    async findCategory(name) {
        let regex = new RegExp(name);
        return await Category.findOne({ 'name': { $regex: regex, $options: 'iu' } });
    }

    // Находит массив категорий в соответствии с пагинацией
    async findCategoryListPage(page = 1, limit = this.defaultLimit, populate = '') {
        page = page > 1 ? page : 1;
        limit = limit > 1 ? limit : 1;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let result = {};

        let count = await Category.countDocuments();
        if (!count) {
            return {
                error: true,
                text: 'Не найдено ни одной категории'
            };
        }

        let total = Math.ceil(count / limit);
        if (page > total) {
            return {
                error: true,
                text: `Всего страниц категорий: ${total}`
            };
        }

        let categoryList = await Category.find().setOptions({ skip, limit, populate, lean: true, sort: 'count name' });

        result = {
            categories: [...categoryList],
            pagination: {
                current: page,
                total
            }
        };

        return result;
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

    // Находит документ записи по ее id
    async findNote(id, populate = '') {
        let res = await Note.findById(id)
            .populate(populate)
            .lean(true);

        if (!res) {
            res = {
                error: true,
                text: `Записи с id "${id}" не существует`
            };
        }

        return res;
    }

    // Находит массив записей в категории в соответствии с пагинацией
    async findNotesPage(category, page = 1, limit = this.defaultLimit, populate = '') {
        page = page > 1 ? page : 1;
        limit = limit > 1 ? limit : 1;
        let skip = page > 1 ? (page - 1) * limit : 0;
        let result = {};

        let cat = await this.findCategory(category);
        if (!cat) {
            return {
                error: true,
                text: `Категории "${category}" не существует`
            };
        }

        let total = Math.ceil(cat.count / limit);
        if (page > total) {
            return {
                error: true,
                text: `В категории "${category}" всего страниц: ${total}`
            };
        }

        let notes = await Note.find()
            .select('_id title')
            .where({ category: cat._id })
            .setOptions({ skip, limit, populate, lean: true, sort: '-date' });

        result = {
            category: cat.name,
            notes: [...notes],
            pagination: {
                current: page,
                total
            }
        };

        return result;
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
