
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('./db');
const config = require('./config');
const embeds = require('./embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename the current ticket channel')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('New name for the ticket channel')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(50)
        ),

    async execute(interaction) {
        const ticket = db.getTicket(interaction.channel.id);

        if (!ticket || ticket.status !== 'open') {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'This command can only be used inside an open ticket channel.'
                    )
                ],
                ephemeral: true
            });
        }

        const isStaff =
            interaction.member.roles.cache.has(config.supportRoleId) ||
            interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            );

        if (!isStaff) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Only authorized support staff can rename tickets.'
                    )
                ],
                ephemeral: true
            });
        }

        const rawName = interaction.options.getString('name');

        const sanitizedName = rawName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 100);

        if (sanitizedName.length < 2) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Please provide a valid channel name containing at least 2 letters or numbers.'
                    )
                ],
                ephemeral: true
            });
        }

        try {
            await interaction.channel.setName(sanitizedName);

            return interaction.reply({
                embeds: [
                    embeds.successEmbed(
                        `Ticket channel renamed to **#${sanitizedName}** by <@${interaction.user.id}>.`
                    )
                ]
            });

        } catch (error) {
            console.error('[RENAME ERROR]', error);

            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Failed to rename this ticket. Please check the bot permissions and try again.'
                    )
                ],
                ephemeral: true
            });
        }
    }
};
