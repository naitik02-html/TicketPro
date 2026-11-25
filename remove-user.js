const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const config = require('../utils/config');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-user')
        .setDescription('Remove a user from the current ticket channel')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to remove from this ticket')
                .setRequired(true)
        ),

    async execute(interaction) {
        const ticket = db.getTicket(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('This command can only be used inside an active ticket channel.')],
                ephemeral: true
            });
        }

        const isStaff = interaction.member.roles.cache.has(config.supportRoleId) ||
            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isStaff) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('Only authorized support staff can remove users from tickets.')],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');

        if (targetUser.id === ticket.user_id) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('You cannot remove the ticket owner from their own ticket.')],
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.delete(targetUser.id).catch(() => null);
        db.removeTicketMember(interaction.channel.id, targetUser.id);

        return interaction.reply({
            embeds: [embeds.successEmbed(`<@${targetUser.id}> has been removed from this ticket by <@${interaction.user.id}>.`)]
        });
    }
};
