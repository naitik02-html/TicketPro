# 🎫 TicketPro

**A modern, reliable ticket management system for Discord communities.**

Built with Discord.js v14, Node.js and SQLite.

<p align="center">
  <img src="https://img.shields.io/badge/Discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18.17%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-7C3AED?style=flat-square" />
</p>

---

## Overview

TicketPro is a Discord support management bot designed to simplify ticket handling, improve staff coordination and provide a structured support experience.

With persistent storage, interactive controls and automated HTML transcripts, TicketPro provides the essential tools for managing community support efficiently.

## Features

| Feature | Description |
| :--- | :--- |
| Ticket Categories | Five dedicated support categories |
| Interactive Panels | Button-based ticket creation |
| Staff Claim System | Claim and unclaim support tickets |
| User Management | Add or remove members from tickets |
| Closing Modal | Collect closing reasons |
| HTML Transcripts | Generate and upload ticket transcripts |
| Persistent Storage | SQLite-backed ticket data |
| Duplicate Prevention | Prevent multiple open tickets per user |

## Ticket Categories

- General Support
- Billing Support
- Player Reports
- Staff Applications
- Other Issues

## Commands

| Command | Access | Description |
| :--- | :--- | :--- |
| `/ticket-panel` | Administrator | Create a ticket panel |
| `/add-user` | Support Staff | Add a member to a ticket |
| `/remove-user` | Support Staff | Remove a member from a ticket |
| `/rename` | Support Staff | Rename a ticket channel |

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Discord.js v14
- **Language:** JavaScript
- **Database:** SQLite (better-sqlite3)
- **Configuration:** dotenv
- **Transcripts:** HTML

## Installation

**Requirements**
- Node.js 18.17.0 or newer
- A Discord Application
- A Discord Server

**1. Clone the repository**

```bash
git clone https://github.com/naitik02-html/TicketPro.git
cd TicketPro
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file using `.env.example`.

Configure the following variables:

```env
BOT_TOKEN=
CLIENT_ID=
GUILD_ID=
TICKET_CATEGORY_ID=
SUPPORT_ROLE_ID=
LOG_CHANNEL_ID=
```

**4. Deploy slash commands**

```bash
npm run deploy
```

**5. Start TicketPro**

```bash
npm start
```

## Project Structure

```text
TicketPro/
├── commands/
│   ├── add-user.js
│   ├── remove-user.js
│   ├── rename.js
│   └── ticket-panel.js
├── database/
│   └── db.js
├── events/
│   ├── interactionCreate.js
│   └── ready.js
├── utils/
│   ├── config.js
│   ├── embeds.js
│   ├── logger.js
│   └── transcript.js
├── .env.example
├── .gitignore
├── deploy-commands.js
├── index.js
└── package.json
```

## Security

- Never expose your Discord bot token.
- Keep your `.env` file private.
- Never commit credentials or private configuration.
- Use `.env.example` as the public configuration template.

## Developer

**Naitik Srivastava**

GitHub: [@naitik02-html](https://github.com/naitik02-html)

---

<p align="center">
  <b>TicketPro</b><br/>
  <sub>Structured support. Better communities.</sub>
</p>
