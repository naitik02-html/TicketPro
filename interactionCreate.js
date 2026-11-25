const {
    Events,
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const config = require('../utils/config');
const db = require('../database/db');
const embeds = require('../utils/embeds');
const { generateTranscript } = require('../utils/transcript');
const { sendTicketLog } = require('../utils/logger');

function isAuthorizedStaff(member) {
    return (
        member.roles.cache.has(config.supportRoleId) ||
        member.permissions.has(PermissionFlagsBits.Administrator)
    );
}

function getActiveTicketControls(isClaimed = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(isClaimed ? 'ticket_unclaim' : 'ticket_claim')
            .setLabel(isClaimed ? 'Unclaim Ticket' : 'Claim Ticket')
            .setEmoji(isClaimed ? '🔓' : '🙋‍♂️')
            .setStyle(isClaimed ? ButtonStyle.Secondary : ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('ticket_close_prompt')
            .setLabel('Close Ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger)
    );
}

function getClosedTicketControls() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_reopen')
            .setLabel('Reopen Ticket')
            .setEmoji('🔓')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('ticket_delete_prompt')
            .setLabel('Delete Ticket')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger)
    );
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction);
                return;
            }

            if (interaction.isButton() && interaction.customId.startsWith('ticket_create_')) {
                const categoryKey = interaction.customId.replace('ticket_create_', '');
                const categoryObj = config.categories[categoryKey];
                if (!categoryObj) return;

                await interaction.deferReply({ ephemeral: true });

                const existingTicket = db.getOpenTicketByUser(interaction.guild.id, interaction.user.id);
                if (existingTicket) {
                    const existingChannel = await interaction.guild.channels
                        .fetch(existingTicket.channel_id)
                        .catch(() => null);

                    if (existingChannel) {
                        return interaction.editReply({
                            embeds: [
                                embeds.errorEmbed(
                                    `You already have an open ticket at <#${existingChannel.id}>. Please close it before opening a new one.`
                                )
                            ]
                        });
                    } else {
                        db.deleteTicket(existingTicket.channel_id);
                    }
                }

                const cleanUsername = interaction.user.username
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .slice(0, 12) || 'user';

                const channelName = `${categoryObj.prefix}-${cleanUsername}`;

                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: config.categoryId,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks
                            ]
                        },
                        {
                            id: config.supportRoleId,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.ManageMessages
                            ]
                        },
                        {
                            id: interaction.client.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.ManageMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });

                const ticketRecord = db.createTicket({
                    channel_id: ticketChannel.id,
                    guild_id: interaction.guild.id,
                    user_id: interaction.user.id,
                    category: categoryObj.id
                });

                await ticketChannel.send({
                    content: `<@${interaction.user.id}> | <@&${config.supportRoleId}>`,
                    embeds: [embeds.ticketWelcomeEmbed(interaction.user, ticketRecord, categoryObj)],
                    components: [getActiveTicketControls(false)]
                });

                await sendTicketLog(interaction.guild, {
                    action: 'Ticket Created',
                    color: config.colors.primary,
                    ticket: ticketRecord,
                    executor: interaction.user
                });

                return interaction.editReply({
                    embeds: [
                        embeds.successEmbed(
                            `Your ticket has been created! Head over to <#${ticketChannel.id}>.`
                        )
                    ]
                });
            }

            if (interaction.isButton() && interaction.customId === 'ticket_claim') {
                const ticket = db.getTicket(interaction.channel.id);
                if (!ticket) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('Ticket data not found in database.')],
                        ephemeral: true
                    });
                }

                if (!isAuthorizedStaff(interaction.member)) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('Only support staff can claim tickets.')],
                        ephemeral: true
                    });
                }

                if (ticket.claimed_by) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed(`This ticket is already claimed by <@${ticket.claimed_by}>.`)],
                        ephemeral: true
                    });
                }

                const updatedTicket = db.claimTicket(interaction.channel.id, interaction.user.id);

                await interaction.update({
                    components: [getActiveTicketControls(true)]
                });

                await interaction.channel.send({
                    embeds: [
                        embeds.statusEmbed(
                            '🙋‍♂️ Ticket Claimed',
                            `This ticket has been claimed by <@${interaction.user.id}> and will now be handled by them.`,
                            config.colors.primary
                        )
                    ]
                });

                await sendTicketLog(interaction.guild, {
                    action: 'Ticket Claimed',
                    color: config.colors.primary,
                    ticket: updatedTicket,
                    executor: interaction.user
                });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'ticket_unclaim') {
                const ticket = db.getTicket(interaction.channel.id);
                if (!ticket) return;

                if (!isAuthorizedStaff(interaction.member)) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('Only support staff can unclaim tickets.')],
                        ephemeral: true
                    });
                }

                if (ticket.claimed_by !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed(`Only <@${ticket.claimed_by}> or an Administrator can unclaim this ticket.`)],
                        ephemeral: true
                    });
                }

                const updatedTicket = db.unclaimTicket(interaction.channel.id);

                await interaction.update({
                    components: [getActiveTicketControls(false)]
                });

                await interaction.channel.send({
                    embeds: [
                        embeds.statusEmbed(
                            '🔓 Ticket Unclaimed',
                            `<@${interaction.user.id}> has unclaimed this ticket. Another staff member can now take over.`,
                            config.colors.warning
                        )
                    ]
                });

                await sendTicketLog(interaction.guild, {
                    action: 'Ticket Unclaimed',
                    color: config.colors.warning,
                    ticket: updatedTicket,
                    executor: interaction.user
                });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'ticket_close_prompt') {
                const ticket = db.getTicket(interaction.channel.id);
                if (!ticket) return;

                const canClose = interaction.user.id === ticket.user_id || isAuthorizedStaff(interaction.member);
                if (!canClose) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('You do not have permission to close this ticket.')],
                        ephemeral: true
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId('ticket_close_modal')
                    .setTitle('Close Support Ticket');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('close_reason_input')
                    .setLabel('Reason for closing this ticket')
                    .setPlaceholder('e.g., Issue resolved, Player warned, Inactive...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(300);

                modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
                await interaction.showModal(modal);
                return;
            }

            if (interaction.isModalSubmit() && interaction.customId === 'ticket_close_modal') {
                const ticket = db.getTicket(interaction.channel.id);
                if (!ticket) return;

                await interaction.deferReply();

                const reason = interaction.fields.getTextInputValue('close_reason_input');
                const closedTicket = db.closeTicket(interaction.channel.id, reason);

                await interaction.channel.permissionOverwrites.edit(ticket.user_id, {
                    ViewChannel: true,
                    SendMessages: false
                }).catch(() => null);

                const extraMembers = db.getTicketMembers(interaction.channel.id);
                for (const memberId of extraMembers) {
                    await interaction.channel.permissionOverwrites.edit(memberId, {
                        ViewChannel: true,
                        SendMessages: false
                    }).catch(() => null);
                }

                const transcriptAttachment = await generateTranscript(
                    interaction.channel,
                    closedTicket,
                    interaction.user
                );

                await sendTicketLog(interaction.guild, {
                    action: 'Ticket Closed',
                    color: config.colors.warning,
                    ticket: closedTicket,
                    executor: interaction.user,
                    details: [{ name: '📝 Close Reason', value: reason, inline: false }],
                    files: [transcriptAttachment]
                });

                await interaction.editReply({
                    embeds: [
                        embeds.statusEmbed(
                            '🔒 Ticket Closed',
                            `This ticket has been closed by <@${interaction.user.id}>.\n\n**Reason:** ${reason}\n\n*An HTML transcript has been archived to the staff logs.*`,
                            config.colors.warning
                        )
                    ],
                    components: [getClosedTicketControls()]
                });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'ticket_reopen') {
                const ticket = db.getTicket(interaction.channel.id);
                if (!ticket) return;

                if (!isAuthorizedStaff(interaction.member)) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('Only support staff can reopen closed tickets.')],
                        ephemeral: true
                    });
                }

                const reopenedTicket = db.reopenTicket(interaction.channel.id);

                await interaction.channel.permissionOverwrites.edit(ticket.user_id, {
                    ViewChannel: true,
                    SendMessages: true
                }).catch(() => null);

                const extraMembers = db.getTicketMembers(interaction.channel.id);
                for (const memberId of extraMembers) {
                    await interaction.channel.permissionOverwrites.edit(memberId, {
                        ViewChannel: true,
                        SendMessages: true
                    }).catch(() => null);
                }

                await interaction.update({
                    components: [getActiveTicketControls(Boolean(reopenedTicket.claimed_by))]
                });

                await interaction.channel.send({
                    embeds: [
                        embeds.statusEmbed(
                            '🔓 Ticket Reopened',
                            `This ticket has been reopened by <@${interaction.user.id}>.`,
                            config.colors.success
                        )
                    ]
                });

                await sendTicketLog(interaction.guild, {
                    action: 'Ticket Reopened',
                    color: config.colors.success,
                    ticket: reopenedTicket,
                    executor: interaction.user
                });
                return;
            }

            if (interaction.isButton() && interaction.customId === 'ticket_delete_prompt') {
                if (!isAuthorizedStaff(interaction.member)) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('Only support staff can delete tickets.')],
                        ephemeral: true
                    });
                }

                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_delete_confirm')
                        .setLabel('Confirm Delete')
                        .setEmoji('⚠️')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ticket_delete_cancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

                return interaction.reply({
                    embeds: [
                        embeds.statusEmbed(
                            '⚠️ Confirm Ticket Deletion',
                            'Are you sure you want to permanently delete this ticket channel? This action cannot be undone.',
                            config.colors.danger
                        )
                    ],
                    components: [confirmRow],
                    ephemeral: true
                });
            }

            if (interaction.isButton() && interaction.customId === 'ticket_delete_cancel') {
                return interaction.update({
                    embeds: [embeds.statusEmbed('Deletion Cancelled', 'Ticket deletion has been aborted.', config.colors.dark)],
                    components: []
                });
            }

            if (interaction.isButton() && interaction.customId === 'ticket_delete_confirm') {
                const ticket = db.getTicket(interaction.channel.id);
                if (!ticket) return;

                if (!isAuthorizedStaff(interaction.member)) {
                    return interaction.reply({
                        embeds: [embeds.errorEmbed('Only support staff can delete tickets.')],
                        ephemeral: true
                    });
                }

                await interaction.update({
                    embeds: [
                        embeds.statusEmbed(
                            '🗑️ Deleting Ticket...',
                            'This channel will be permanently deleted in 5 seconds.',
                            config.colors.danger
                        )
                    ],
                    components: []
                });

                await sendTicketLog(interaction.guild, {
                    action: 'Ticket Deleted',
                    color: config.colors.danger,
                    ticket,
                    executor: interaction.user
                });

                db.deleteTicket(interaction.channel.id);

                setTimeout(async () => {
                    await interaction.channel.delete().catch(() => null);
                }, 5000);
            }
        } catch (error) {
            console.error('[INTERACTION ERROR]', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [embeds.errorEmbed('An unexpected error occurred while processing your request.')],
                    ephemeral: true
                }).catch(() => null);
            } else {
                await interaction.reply({
                    embeds: [embeds.errorEmbed('An unexpected error occurred while processing your request.')],
                    ephemeral: true
                }).catch(() => null);
            }
        }
    }
};
