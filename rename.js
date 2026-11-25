const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const config = require('../utils/config');
const embeds = require('../utils/embeds');

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
        if (!ticket) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('This command can only be used inside a ticket channel.')],
                ephemeral: true
            });
        }

        const isStaff = interaction.member.roles.cache.has(config.supportRoleId) ||
            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isStaff) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('Only authorized support staff can rename tickets.')],
                ephemeral: true
            });
        }

        const rawName = interaction.options.getString('name');
        const sanitizedName = rawName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        if (!sanitizedName) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('Please provide a valid alphanumeric channel name.')],
                ephemeral: true
            });
        }

        await interaction.channel.setName(sanitizedName);

        return interaction.reply({
            embeds: [embeds.successEmbed(`Ticket channel renamed to **#${sanitizedName}** by <@${interaction.user.id}>.`)]
        });
    }
};
