module.exports = async ({ member_id }, peer_id) => {
    const vkApi = require(global.PATH.VK_API);

    try {
        let user = await vkApi('users.get', { user_ids: member_id });

        if (user.response && user.response[0]) {
            user = user.response[0];
            let message = `Пока, ${user.first_name}!`;

            await vkApi('messages.send', {
                peer_id,
                message,
                random_id: Date.now()
            });
        }
        // eslint-disable-next-line no-empty
    } catch (err) {}
};
