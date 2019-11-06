module.exports = class {
    constructor({ res }) {
        const { CONFIRMATION } = require(global.PATH.CONFIG);

        res.end(CONFIRMATION);
    }
};
