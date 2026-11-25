
const { Events, ActivityType } = require('discord.js');
const config = require('./config');

module.exports = {
    name: Events.ClientReady,
    once: true,

    execute(client) {
        console.log('====================================');
        console.log(`[ONLINE] ${config.botName} is now online!`);
        console.log(`[BOT] ${client.user.tag}`);
        console.log(`[CREDITS] Developed by ${config.developer}`);
        console.log('====================================');

        client.user.setPresence({
            activities: [
                {
                    name: 'Support Tickets | TicketPro',
                    type: ActivityType.Watching
                }
            ],
            status: 'online'
        });
    }
};
