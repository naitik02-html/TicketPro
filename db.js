const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'ticketpro.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better performance and concurrency
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT UNIQUE NOT NULL,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        claimed_by TEXT DEFAULT NULL,
        close_reason TEXT DEFAULT NULL,
        created_at INTEGER NOT NULL,
        closed_at INTEGER DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_members (
        channel_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        PRIMARY KEY (channel_id, user_id)
    );
`);

const statements = {
    createTicket: db.prepare(`
        INSERT INTO tickets (channel_id, guild_id, user_id, category, status, created_at)
        VALUES (@channel_id, @guild_id, @user_id, @category, 'open', @created_at)
    `),
    getTicketByChannel: db.prepare(`
        SELECT * FROM tickets WHERE channel_id = ?
    `),
    getOpenTicketByUser: db.prepare(`
        SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'
    `),
    claimTicket: db.prepare(`
        UPDATE tickets SET claimed_by = ? WHERE channel_id = ?
    `),
    unclaimTicket: db.prepare(`
        UPDATE tickets SET claimed_by = NULL WHERE channel_id = ?
    `),
    closeTicket: db.prepare(`
        UPDATE tickets SET status = 'closed', close_reason = ?, closed_at = ? WHERE channel_id = ?
    `),
    reopenTicket: db.prepare(`
        UPDATE tickets SET status = 'open', close_reason = NULL, closed_at = NULL WHERE channel_id = ?
    `),
    deleteTicket: db.prepare(`
        DELETE FROM tickets WHERE channel_id = ?
    `),
    addMember: db.prepare(`
        INSERT OR IGNORE INTO ticket_members (channel_id, user_id) VALUES (?, ?)
    `),
    removeMember: db.prepare(`
        DELETE FROM ticket_members WHERE channel_id = ? AND user_id = ?
    `),
    getMembers: db.prepare(`
        SELECT user_id FROM ticket_members WHERE channel_id = ?
    `),
    clearMembers: db.prepare(`
        DELETE FROM ticket_members WHERE channel_id = ?
    `)
};

module.exports = {
    db,
    createTicket(data) {
        statements.createTicket.run({
            ...data,
            created_at: Date.now()
        });
        return statements.getTicketByChannel.get(data.channel_id);
    },
    getTicket(channelId) {
        return statements.getTicketByChannel.get(channelId);
    },
    getOpenTicketByUser(guildId, userId) {
        return statements.getOpenTicketByUser.get(guildId, userId);
    },
    claimTicket(channelId, staffId) {
        statements.claimTicket.run(staffId, channelId);
        return statements.getTicketByChannel.get(channelId);
    },
    unclaimTicket(channelId) {
        statements.unclaimTicket.run(channelId);
        return statements.getTicketByChannel.get(channelId);
    },
    closeTicket(channelId, reason) {
        statements.closeTicket.run(reason, Date.now(), channelId);
        return statements.getTicketByChannel.get(channelId);
    },
    reopenTicket(channelId) {
        statements.reopenTicket.run(channelId);
        return statements.getTicketByChannel.get(channelId);
    },
    deleteTicket(channelId) {
        statements.clearMembers.run(channelId);
        statements.deleteTicket.run(channelId);
    },
    addTicketMember(channelId, userId) {
        statements.addMember.run(channelId, userId);
    },
    removeTicketMember(channelId, userId) {
        statements.removeMember.run(channelId, userId);
    },
    getTicketMembers(channelId) {
        return statements.getMembers.all(channelId).map(row => row.user_id);
    }
};
