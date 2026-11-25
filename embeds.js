const { EmbedBuilder } = require('discord.js');
const config = require('./config');

function baseEmbed(color = config.colors.primary) {
    return new EmbedBuilder()
        .setColor(color)
        .setFooter({
            text: `${config.botName} • Developed by ${config.developer}`
        })
        .setTimestamp();
}

module.exports = {
    panelEmbed(guild) {
        return baseEmbed(config.colors.primary)
            .setAuthor({
                name: `${guild.name} — Support Center`,
                iconURL: guild.iconURL({ dynamic: true }) || undefined
            })
            .setTitle('🔮 Need Assistance? Open a Support Ticket')
            .setDescription(
                'Select the category below that best matches your inquiry. A private support channel will be created immediately for you and our staff team.\n\n' +
                '**Available Categories:**\n' +
                '> 🎫 **General Support** — Account help & server inquiries\n' +
                '> 💳 **Billing Support** — Store purchases, ranks & payments\n' +
                '> 🛡️ **Player Reports** — Report rule breakers or misconduct\n' +
                '> 📋 **Staff Applications** — Join our moderation team\n' +
                '> ⚙️ **Other Issues** — Bug reports, partnerships & miscellaneous\n\n' +
                '*Please avoid opening duplicate tickets. Our team responds as quickly as possible.*'
            );
    },

    ticketWelcomeEmbed(user, ticket, categoryObj) {
        return baseEmbed(config.colors.dark)
            .setTitle(`${categoryObj.emoji} Ticket #${String(ticket.ticket_id).padStart(4, '0')} — ${categoryObj.label}`)
            .setDescription(
                `Welcome <@${user.id}>! Thank you for contacting **${config.botName}**.\n` +
                'Please describe your issue in complete detail below while a staff member reviews your ticket.'
            )
            .addFields(
                { name: '👤 Ticket Owner', value: `<@${user.id}>`, inline: true },
                { name: '📂 Category', value: categoryObj.label, inline: true },
                { name: '📌 Status', value: '🟢 Open (Unclaimed)', inline: true }
            );
    },

    statusEmbed(title, description, color = config.colors.primary) {
        return baseEmbed(color)
            .setTitle(title)
            .setDescription(description);
    },

    errorEmbed(message) {
        return baseEmbed(config.colors.danger)
            .setTitle('❌ Action Denied')
            .setDescription(message);
    },

    successEmbed(message) {
        return baseEmbed(config.colors.success)
            .setTitle('✅ Success')
            .setDescription(message);
    }
};
