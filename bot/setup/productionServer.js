const vkApi = require('../vkApi');
const HANDLERS = require('../event-handlers');

module.exports = class {
    constructor(config) {
        this.CONFIG = config;
        // Публичный URL сервера, где запущен этот скрипт и куда будет стучаться ВК
        this.serverPublicURL = this.CONFIG.PUBLIC_URL;
        this.serverPublicURL += this.CONFIG.USE_PORT ? `:${this.CONFIG.PORT}` : '';
        this.groupId = null;
        this.prodServerTitle = 'production';
        this.prodServerId = null;
        this.ignoreHandlers = ['confirmation'];
    }

    groupIdParser(group) {
        // https://regex101.com/r/2yTNad/1/
        const regex = /(https?:\/\/)?(vk\.com\/)?\/?(club(?<id>\d+)|(?<name>\w+))/;
        const match = regex.exec(group);
        return match.groups.id || match.groups.name;
    }

    /* === Настройка Callback API сообщества === */
    async getConfirmationCode() {
        let confirmCode = null;
        let group_id = this.CONFIG.GROUP_ID;

        try {
            let res = await vkApi('groups.getCallbackConfirmationCode', { group_id });
            confirmCode = res.response.code;
        } catch (err) {
            throw new Error('Ошибка получения кода подтверждения для добавления сервера');
        }

        return confirmCode;
    }

    async getGroupId() {
        let groupId = null;
        let group = this.groupIdParser(this.CONFIG.GROUP);

        try {
            let res = await vkApi('groups.getById', {
                group_id: group
            });
            groupId = res.response[0].id;
        } catch (err) {
            throw new Error('Ошибка получения id сообщества');
        }

        return groupId;
    }

    findProdServerId(servers) {
        let id = null;
        servers.forEach(server => {
            if (server.title === this.prodServerTitle) id = server.id;
        });

        return id;
    }

    async addProdServer() {
        let { SECRET } = this.CONFIG;
        let res = await vkApi('groups.addCallbackServer', {
            title: this.prodServerTitle,
            url: this.serverPublicURL,
            group_id: this.groupId,
            secret_key: SECRET
        });

        return res.response.server_id;
    }

    async editProdServer() {
        let { SECRET } = this.CONFIG;
        await vkApi('groups.editCallbackServer', {
            server_id: this.prodServerId,
            title: this.prodServerTitle,
            url: this.serverPublicURL,
            group_id: this.groupId,
            secret_key: SECRET
        });
    }

    async getClearEventsList() {
        let clearEvents = {};
        let events = await vkApi('groups.getCallbackSettings', {
            group_id: this.groupId,
            server_id: this.prodServerId
        });
        events = events.response.events;

        for (const key in events) {
            clearEvents[key] = '0';
        }

        return clearEvents;
    }

    getHandledEvents() {
        let events = {};
        for (const key in HANDLERS) {
            if (!this.ignoreHandlers.includes(key)) {
                events[key] = '1';
            }
        }

        return events;
    }

    async setCallbackSettings(events) {
        let { API_VERSION } = this.CONFIG;
        await vkApi('groups.setCallbackSettings', {
            group_id: this.groupId,
            server_id: this.prodServerId,
            api_version: API_VERSION,
            ...events
        });
    }

    async setupProdCallbackServer() {
        let groupServers = await vkApi('groups.getCallbackServers', {
            group_id: this.groupId
        });
        groupServers = groupServers.response.items;

        let serverId = this.findProdServerId(groupServers);
        if (!serverId) {
            serverId = await this.addProdServer();
            this.prodServerId = serverId;
        } else {
            this.prodServerId = serverId;
            this.editProdServer();
        }

        let clearEventsList = await this.getClearEventsList();
        let handledEvents = this.getHandledEvents();

        let newEvents = {
            ...clearEventsList,
            ...handledEvents
        };

        await this.setCallbackSettings(newEvents);
    }
    /* --- Настройка Callback API сообщества --- */

    async init() {
        this.groupId = await this.getGroupId();
        this.CONFIG.GROUP_ID = this.groupId.toString();
        this.CONFIG.CONFIRMATION = await this.getConfirmationCode();
        await this.setupProdCallbackServer();
    }
};
