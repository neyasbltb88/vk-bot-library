const axios = require('axios');
const vkApi = require('../vkApi');
const HANDLERS = require('../event-handlers');

module.exports = class {
    constructor(config) {
        this.CONFIG = config;

        this.ngrokApi = 'http://localhost:4040/api';
        this.ngrokPublicUrl = null;

        this.groupId = null;
        this.devServerTitle = 'development';
        this.devServerId = null;
        this.ignoreHandlers = ['confirmation'];
    }

    groupIdParser(group) {
        // https://regex101.com/r/2yTNad/1/
        const regex = /(https?:\/\/)?(vk\.com\/)?\/?(club(?<id>\d+)|(?<name>\w+))/;
        const match = regex.exec(group);
        return match.groups.id || match.groups.name;
    }

    /* === ngrok === */
    // Создает нужный туннель
    async setNgrokPublicUrl() {
        let { TUNNEL, PORT } = this.CONFIG;
        let ngrokPublicUrl = null;

        try {
            let res = await axios.post(`${this.ngrokApi}/tunnels`, {
                addr: PORT,
                proto: 'http',
                name: TUNNEL
            });

            ngrokPublicUrl = res.data.public_url;
        } catch (err) {
            // Если ошибка при создании туннеля, значит не запущен ngrok
            // TODO: Сделать адекватный метод запуска ngrok через child_process
            throw new Error('Не запущен ngrok');
        }

        return ngrokPublicUrl;
    }

    // Получает информацию о туннеле
    async getNgrokPublicUrl() {
        let { TUNNEL } = this.CONFIG;
        let ngrokPublicUrl = null;
        try {
            let res = await axios.get(`${this.ngrokApi}/tunnels/${TUNNEL}`);

            if (res.data.public_url) {
                ngrokPublicUrl = res.data.public_url;
            } else {
                new Error(`Не найден туннель ${TUNNEL}`);
            }
        } catch (err) {
            // Если ошибка при получении информации о туннеле, значит его нет, попытаемся создать его
            ngrokPublicUrl = await this.setNgrokPublicUrl();
        }

        return ngrokPublicUrl;
    }
    /* --- ngrok --- */

    /* === Настройка Callback API сообщества === */
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

    findDevServerId(servers) {
        let id = null;
        servers.forEach(server => {
            if (server.title === this.devServerTitle) id = server.id;
        });

        return id;
    }

    async addDevServer() {
        let { SECRET } = this.CONFIG;
        let res = await vkApi('groups.addCallbackServer', {
            title: this.devServerTitle,
            url: this.ngrokPublicUrl,
            group_id: this.groupId,
            secret_key: SECRET
        });

        return res.response.server_id;
    }

    async editDevServer() {
        let { SECRET } = this.CONFIG;
        await vkApi('groups.editCallbackServer', {
            server_id: this.devServerId,
            title: this.devServerTitle,
            url: this.ngrokPublicUrl,
            group_id: this.groupId,
            secret_key: SECRET
        });
    }

    async getClearEventsList() {
        let clearEvents = {};
        let events = await vkApi('groups.getCallbackSettings', {
            group_id: this.groupId,
            server_id: this.devServerId
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

        events.message_edit = '1';

        return events;
    }

    async setCallbackSettings(events) {
        let { API_VERSION } = this.CONFIG;
        await vkApi('groups.setCallbackSettings', {
            group_id: this.groupId,
            server_id: this.devServerId,
            api_version: API_VERSION,
            ...events
        });
    }

    async setupDevCallbackServer() {
        let groupServers = await vkApi('groups.getCallbackServers', {
            group_id: this.groupId
        });
        groupServers = groupServers.response.items;

        let serverId = this.findDevServerId(groupServers);
        if (!serverId) {
            serverId = await this.addDevServer();
            this.devServerId = serverId;
        } else {
            this.devServerId = serverId;
            this.editDevServer();
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
        this.ngrokPublicUrl = await this.getNgrokPublicUrl();
        this.groupId = await this.getGroupId();
        this.CONFIG.GROUP_ID = this.groupId.toString();
        await this.setupDevCallbackServer();
    }
};
