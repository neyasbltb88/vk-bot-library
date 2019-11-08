const DevelopServer = require('./setup/developServer');

module.exports = async config => {
    if (config.NODE_ENV === 'development') {
        let developServer = new DevelopServer(config);
        await developServer.init();
    }
};
