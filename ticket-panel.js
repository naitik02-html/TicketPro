const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Deploy the TicketPro support panel in the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('You need **Administrator** permission to deploy the ticket panel.')],
                ephemeral: true
            });
        }

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create_general')
                .setLabel('General Support')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_create_billing')
                .setLabel('Billing Support')
                .setEmoji('💳')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('ticket_create_report')
                .setLabel('Player Reports')
                .setEmoji('🛡️')
                .setStyle(ButtonStyle.Danger)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create_staff')
                .setLabel('Staff Applications')
                .setEmoji('📋')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('ticket_create_other')
                .setLabel('Other Issues')
                .setEmoji('⚙️')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.channel.send({
            embeds: [embeds.panelEmbed(interaction.guild)],
            components: [row1, row2]
        });

        return interaction.reply({
            embeds: [embeds.successEmbed('TicketPro panel has been deployed successfully!')],
            ephemeral: true
        });
    }
};
