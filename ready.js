const { Events, ActivityType } = require('discord.js');
const config = require('../utils/config');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`[ONLINE] ${config.botName} logged in as ${client.user.tag}`);
        console.log(`[CREDITS] Developed by ${config.developer}`);

        client.user.setPresence({
            activities: [{
                name: 'Support Tickets | TicketPro',
                type: ActivityType.Watching
            }],
            status: 'online'
        });
    }
};
