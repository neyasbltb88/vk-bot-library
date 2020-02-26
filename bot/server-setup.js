const DevelopServer = require('./setup/developServer');
const ProductionServer = require('./setup/productionServer');

module.exports = async config => {
    if (config.NODE_ENV === 'development') {
        let developServer = new DevelopServer(config);
        await developServer.init();
    } else {
        let productionServer = new ProductionServer(config);
        await productionServer.init();
    }
};
