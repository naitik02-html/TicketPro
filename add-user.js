const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const config = require('../utils/config');
const embeds = require('../utils/embeds');

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
                embeds: [embeds.errorEmbed('Only authorized support staff can add users to tickets.')],
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({
                embeds: [embeds.errorEmbed('That user is not a valid member of this server.')],
                ephemeral: true
            });
        }

        await interaction.channel.permissionOverwrites.edit(targetUser.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
            AttachFiles: true
        });

        db.addTicketMember(interaction.channel.id, targetUser.id);

        return interaction.reply({
            embeds: [embeds.successEmbed(`<@${targetUser.id}> has been added to this ticket by <@${interaction.user.id}>.`)]
        });
    }
};
