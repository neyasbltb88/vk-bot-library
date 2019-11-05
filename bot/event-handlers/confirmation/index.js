module.exports = class {
    constructor({ res }) {
        const { CONFIRMATION } = require(global.ROOT_DIR + '/config');

        res.end(CONFIRMATION);
    }
};
