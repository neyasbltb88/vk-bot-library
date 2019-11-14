const axios = require('axios');
const querystring = require('querystring');
const httpBuildQuery = require('http-build-query');
const CONFIG = require('./config.js');

module.exports = (method, params, get) => {
    get = get || false;
    params = {
        v: CONFIG.API_VERSION,
        access_token: CONFIG.TOKEN,
        ...params
    };

    return get
        ? axios.get(`https://api.vk.com/method/${method}?${httpBuildQuery(params)}`).then(data => data.data)
        : axios.post(`https://api.vk.com/method/${method}`, querystring.stringify(params)).then(data => data.data);
};
