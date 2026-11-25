
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const embeds = require('./embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Deploy the TicketPro support panel in the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const isAdmin = interaction.memberPermissions?.has(
            PermissionFlagsBits.Administrator
        );

        if (!isAdmin) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'You need **Administrator** permission to deploy the ticket panel.'
                    )
                ],
                ephemeral: true
            });
        }

        if (!interaction.channel?.isTextBased() || !interaction.channel.isSendable()) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'The ticket panel cannot be deployed in this channel.'
                    )
                ],
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

        try {
            await interaction.deferReply({ ephemeral: true });

            await interaction.channel.send({
                embeds: [embeds.panelEmbed(interaction.guild)],
                components: [row1, row2]
            });

            return interaction.editReply({
                embeds: [
                    embeds.successEmbed(
                        'TicketPro panel has been deployed successfully!'
                    )
                ]
            });

        } catch (error) {
            console.error('[TICKET PANEL ERROR]', error);

            if (interaction.deferred || interaction.replied) {
                return interaction.editReply({
                    embeds: [
                        embeds.errorEmbed(
                            'Failed to deploy the ticket panel. Check the bot permissions and try again.'
                        )
                    ]
                }).catch(() => null);
            }

            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Failed to deploy the ticket panel. Check the bot permissions and try again.'
                    )
                ],
                ephemeral: true
            }).catch(() => null);
        }
    }
};
