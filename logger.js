const { EmbedBuilder } = require('discord.js');
const config = require('./config');

async function sendTicketLog(guild, { action, color, ticket, executor, details = [], files = [] }) {
    try {
        const logChannel = await guild.channels.fetch(config.logChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setColor(color || config.colors.primary)
            .setTitle(`📜 Ticket Log — ${action}`)
            .addFields(
                { name: '🎫 Ticket', value: `#${String(ticket.ticket_id).padStart(4, '0')} (<#${ticket.channel_id}>)`, inline: true },
                { name: '👤 Owner', value: `<@${ticket.user_id}>`, inline: true },
                { name: '🛠️ Action By', value: `${executor} (\`${executor.id}\`)`, inline: true },
                { name: '📂 Category', value: ticket.category.toUpperCase(), inline: true },
                { name: '📌 Claimed By', value: ticket.claimed_by ? `<@${ticket.claimed_by}>` : 'Unclaimed', inline: true },
                ...details
            )
            .setFooter({ text: `${config.botName} • Developed by ${config.developer}` })
            .setTimestamp();

        await logChannel.send({ embeds: [embed], files });
    } catch (error) {
        console.error('[LOG ERROR] Failed to send ticket log:', error);
    }
}

module.exports = { sendTicketLog };
