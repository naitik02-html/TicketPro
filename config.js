require('dotenv').config();

const requiredVars = [
    'BOT_TOKEN',
    'CLIENT_ID',
    'GUILD_ID',
    'TICKET_CATEGORY_ID',
    'SUPPORT_ROLE_ID',
    'LOG_CHANNEL_ID'
];

for (const key of requiredVars) {
    if (!process.env[key]) {
        console.error(`[FATAL ERROR] Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

module.exports = {
    token: process.env.BOT_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    categoryId: process.env.TICKET_CATEGORY_ID,
    supportRoleId: process.env.SUPPORT_ROLE_ID,
    logChannelId: process.env.LOG_CHANNEL_ID,
    botName: process.env.BOT_NAME || 'TicketPro',
    developer: 'I_am_Naitik',
    colors: {
        primary: process.env.EMBED_COLOR || '#7C3AED',   // Royal Purple
        dark: process.env.SECONDARY_COLOR || '#0F0F13',  // Deep Black
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
    },
    categories: {
        general: {
            id: 'general',
            label: 'General Support',
            emoji: '🎫',
            prefix: 'general',
            description: 'General inquiries, account help, and server questions.'
        },
        billing: {
            id: 'billing',
            label: 'Billing Support',
            emoji: '💳',
            prefix: 'billing',
            description: 'Payments, ranks, store purchases, and refund queries.'
        },
        report: {
            id: 'report',
            label: 'Player Reports',
            emoji: '🛡️',
            prefix: 'report',
            description: 'Report rule breakers, cheaters, or toxic behavior.'
        },
        staff: {
            id: 'staff',
            label: 'Staff Applications',
            emoji: '📋',
            prefix: 'staff-app',
            description: 'Apply to join our moderation or support team.'
        },
        other: {
            id: 'other',
            label: 'Other Issues',
            emoji: '⚙️',
            prefix: 'other',
            description: 'Bug reports, partnerships, or unlisted concerns.'
        }
    }
};
