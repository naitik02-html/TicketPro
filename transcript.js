const { AttachmentBuilder } = require('discord.js');
const config = require('./config');

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function generateTranscript(channel, ticket, closedBy) {
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        if (messages.size === 0) break;

        allMessages.push(...messages.values());
        lastId = messages.last().id;

        if (messages.size < 100) break;
    }

    allMessages.reverse();

    const messageRows = allMessages.map(msg => {
        const timestamp = new Date(msg.createdTimestamp).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
        const avatar = msg.author.displayAvatarURL({ extension: 'png', size: 64 });
        const username = escapeHtml(msg.author.tag);
        const content = escapeHtml(msg.content).replace(/\n/g, '<br>');

        const attachmentsHtml = msg.attachments.size > 0
            ? `<div class="attachments">${msg.attachments.map(att =>
                `<a href="${att.url}" target="_blank">📎 ${escapeHtml(att.name)}</a>`
            ).join(' ')}</div>`
            : '';

        const embedsHtml = msg.embeds.length > 0
            ? msg.embeds.map(emb => `
                <div class="embed">
                    ${emb.title ? `<div class="embed-title">${escapeHtml(emb.title)}</div>` : ''}
                    ${emb.description ? `<div class="embed-desc">${escapeHtml(emb.description).replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            `).join('')
            : '';

        return `
            <div class="message">
                <img class="avatar" src="${avatar}" alt="avatar" />
                <div class="msg-body">
                    <div class="msg-header">
                        <span class="username">${username}</span>
                        ${msg.author.bot ? '<span class="bot-tag">BOT</span>' : ''}
                        <span class="timestamp">${timestamp}</span>
                    </div>
                    ${content ? `<div class="content">${content}</div>` : ''}
                    ${attachmentsHtml}
                    ${embedsHtml}
                </div>
            </div>
        `;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Transcript - #${escapeHtml(channel.name)}</title>
    <style>
        body {
            background-color: #0b0b0f;
            color: #e4e4e7;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #13131a;
            border: 1px solid #2e1065;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .header {
            background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%);
            padding: 24px;
            border-bottom: 2px solid #7c3aed;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 22px;
            color: #ffffff;
        }
        .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            font-size: 13px;
            color: #d8b4fe;
            margin-top: 12px;
        }
        .messages {
            padding: 20px;
        }
        .message {
            display: flex;
            gap: 14px;
            padding: 12px 0;
            border-bottom: 1px solid #1f1f29;
        }
        .avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 2px solid #7c3aed;
        }
        .msg-body {
            flex: 1;
        }
        .msg-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }
        .username {
            font-weight: 600;
            color: #c084fc;
        }
        .bot-tag {
            background: #7c3aed;
            color: #fff;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
        }
        .timestamp {
            font-size: 12px;
            color: #71717a;
        }
        .content {
            font-size: 14px;
            line-height: 1.5;
            color: #f4f4f5;
        }
        .embed {
            margin-top: 8px;
            background: #181822;
            border-left: 4px solid #7c3aed;
            padding: 10px 14px;
            border-radius: 6px;
        }
        .embed-title {
            font-weight: 600;
            color: #e9d5ff;
            margin-bottom: 4px;
        }
        .embed-desc {
            font-size: 13px;
            color: #a1a1aa;
        }
        .attachments a {
            display: inline-block;
            margin-top: 6px;
            color: #a855f7;
            text-decoration: none;
            font-size: 13px;
        }
        .footer {
            text-align: center;
            padding: 16px;
            font-size: 12px;
            color: #71717a;
            background: #0f0f14;
            border-top: 1px solid #1f1f29;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔮 ${config.botName} — Ticket Transcript</h1>
            <div class="meta">
                <div><strong>Ticket ID:</strong> #${String(ticket.ticket_id).padStart(4, '0')}</div>
                <div><strong>Channel:</strong> #${escapeHtml(channel.name)}</div>
                <div><strong>Category:</strong> ${escapeHtml(ticket.category.toUpperCase())}</div>
                <div><strong>Opened By:</strong> ${escapeHtml(ticket.user_id)}</div>
                <div><strong>Claimed By:</strong> ${ticket.claimed_by ? escapeHtml(ticket.claimed_by) : 'Unclaimed'}</div>
                <div><strong>Closed By:</strong> ${escapeHtml(closedBy.tag)}</div>
                <div><strong>Close Reason:</strong> ${escapeHtml(ticket.close_reason || 'No reason provided')}</div>
                <div><strong>Total Messages:</strong> ${allMessages.length}</div>
            </div>
        </div>
        <div class="messages">
            ${messageRows || '<p>No messages recorded in this ticket.</p>'}
        </div>
        <div class="footer">
            Generated by ${config.botName} • Developed by ${config.developer}
        </div>
    </div>
</body>
</html>`;

    const buffer = Buffer.from(htmlContent, 'utf-8');
    return new AttachmentBuilder(buffer, {
        name: `transcript-${channel.name}-${ticket.ticket_id}.html`
    });
}

module.exports = { generateTranscript };
