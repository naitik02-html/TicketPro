
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('./db');
const config = require('./config');
const embeds = require('./embeds');

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
                        'Only authorized support staff can remove users from tickets.'
                    )
                ],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');

        if (targetUser.id === ticket.user_id) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'You cannot remove the ticket owner from their own ticket.'
                    )
                ],
                ephemeral: true
            });
        }

        const ticketMembers = db.getTicketMembers(interaction.channel.id);

        if (!ticketMembers.includes(targetUser.id)) {
            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'This user is not an additional member of this ticket.'
                    )
                ],
                ephemeral: true
            });
        }

        try {
            await interaction.channel.permissionOverwrites.delete(
                targetUser.id
            );

            db.removeTicketMember(
                interaction.channel.id,
                targetUser.id
            );

            return interaction.reply({
                embeds: [
                    embeds.successEmbed(
                        `<@${targetUser.id}> has been removed from this ticket by <@${interaction.user.id}>.`
                    )
                ]
            });

        } catch (error) {
            console.error('[REMOVE USER ERROR]', error);

            return interaction.reply({
                embeds: [
                    embeds.errorEmbed(
                        'Failed to remove this user. Please check bot permissions and try again.'
                    )
                ],
                ephemeral: true
            });
        }
    }
};
