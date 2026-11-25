# 🔮 TicketPro — Professional Discord Ticket Bot
**Developed by I_am_Naitik**

TicketPro is a modular, restart-safe Discord support ticket management system built with **Node.js**, **discord.js v14**, and **SQLite**.

---

## ✨ Features
- **Black & Purple Branding**: Clean, modern Discord embeds and structured action buttons.
- **5 Dedicated Ticket Categories**:
  - 🎫 General Support
  - 💳 Billing Support
  - 🛡️ Player Reports
  - 📋 Staff Applications
  - ⚙️ Other Issues
- **Duplicate Prevention**: Prevents users from spamming multiple open tickets simultaneously.
- **Staff Claim System**: Staff members can claim and unclaim tickets to track ownership.
- **Closing Reason Modal**: Prompts for a closing reason before locking the ticket.
- **HTML Transcripts**: Automatically generates a styled dark-mode HTML transcript upon closing and uploads it to the staff log channel.
- **Persistent SQLite Database**: Survives bot restarts without losing ticket ownership, claim status, or added members.

---

## 🛠️ Discord Developer Portal Setup (Intents & Permissions)
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a **New Application** named `TicketPro`.
2. Navigate to the **Bot** tab:
   - Click **Reset Token** and copy your token (never share it publicly).
   - Under **Privileged Gateway Intents**, enable:
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent** (Required for HTML transcript generation)
3. Navigate to **OAuth2 → URL Generator**:
   - **Scopes**: Check `bot` and `applications.commands`.
   - **Bot Permissions**: Check:
     - `Manage Channels`
     - `Manage Roles`
     - `Send Messages`
     - `Embed Links`
     - `Attach Files`
     - `Read Message History`
     - `Manage Messages`
4. Copy the generated URL and invite TicketPro to your Discord server.

---

## 🚀 Installation & Running Locally
1. **Install Node.js**: Ensure Node.js `v18.17.0` or higher is installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   - Rename `.env.example` to `.env`.
   - Enable **Developer Mode** in Discord (`User Settings → Advanced → Developer Mode`) to copy IDs.
   - Fill in `BOT_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `TICKET_CATEGORY_ID`, `SUPPORT_ROLE_ID`, and `LOG_CHANNEL_ID`.
4. **Deploy Slash Commands**:
   ```bash
   npm run deploy
   ```
5. **Start the Bot**:
   ```bash
   npm start
   ```

---

## 🌐 24/7 Hosting Guide (VPS / PM2)
To keep TicketPro running 24/7 on a Linux VPS (Ubuntu/Debian):
```bash
npm install -g pm2
pm2 start index.js --name "TicketPro"
pm2 save
pm2 startup
```

---

## 📋 Commands Overview
| Command | Permission | Description |
| :--- | :--- | :--- |
| `/ticket-panel` | Administrator | Sends the interactive ticket creation panel. |
| `/add-user <user>` | Support Staff | Grants a user access to the current ticket. |
| `/remove-user <user>` | Support Staff | Revokes a user's access from the current ticket. |
| `/rename <name>` | Support Staff | Renames the current ticket channel. |
