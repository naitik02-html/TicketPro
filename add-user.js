
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('./db');
const config = require('./config');
const embeds = require('./embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-user')
        .setDescription('Add a user to the current ticket channel')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The member to add to this ticket')
                .setRequired(true)
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
            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isStaff) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Only authorized support staff can add users to tickets.'
                    )
                ],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');

        if (targetUser.bot) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed('Bots cannot be added to tickets.')
                ],
                ephemeral: true
            });
        }

        if (
            targetUser.id === ticket.user_id ||
            db.getTicketMembers(interaction.channel.id).includes(targetUser.id)
        ) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed('This user is already a member of this ticket.')
                ],
                ephemeral: true
            });
        }

        const targetMember = await interaction.guild.members
            .fetch(targetUser.id)
            .catch(() => null);

        if (!targetMember) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'That user is not a valid member of this server.'
                    )
                ],
                ephemeral: true
            });
        }

        try {
            await interaction.channel.permissionOverwrites.edit(targetUser.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                EmbedLinks: true
            });

            db.addTicketMember(interaction.channel.id, targetUser.id);

            return interaction.reply({
                embeds: [
                    embeds.successEmbed(
                        `<@${targetUser.id}> has been added to this ticket by <@${interaction.user.id}>.`
                    )
                ]
            });

        } catch (error) {
            console.error('[ADD USER ERROR]', error);

            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Failed to add this user. Please check the bot permissions and try again.'
                    )
                ],
                ephemeral: true
            });
        }
    }
};
