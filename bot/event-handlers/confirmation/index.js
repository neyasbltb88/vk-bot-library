module.exports = class {
    constructor(body, res) {
        const { CONFIRMATION } = require(global.ROOT_DIR + '/config');

        res.end(CONFIRMATION);
    }
};
