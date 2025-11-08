# Flasher Discord Bot

An educational Discord bot for simulating ERC20 token "flashes" - temporary transactions that appear to send tokens but fail after a period of time.

## ⚠️ Educational Purpose Only

This bot is created purely for educational purposes to learn about blockchain technology and Discord bot development. The "flashing" mechanism demonstrates how transactions can appear pending before failing.

## Features

- **Plan Management**: Whitelist users with customizable plans (transactions, days, max amount)
- **Token Flashing**: Simulate ERC20 token transfers (USDT/USDC) that appear pending then fail
- **Discord Integration**: Full slash command support with admin controls
- **Automatic Cleanup**: Plans automatically removed when expired or limits reached

## Commands

### Admin Commands
- `/addbuyer` - Add a user to whitelist with a plan
- `/removeplan` - Remove a user's plan
- `/see_plan_user` - View any user's plan status
- `/update_plan` - Update a user's plan

### User Commands
- `/see_plan` - View your own plan status
- `/sendtoken` - Flash send ERC20 tokens (USDT or USDC)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Discord bot token:
     ```
     DISCORD_BOT_TOKEN=your_bot_token_here
     ```
   - Optional: Set `GUILD_ID` for faster command updates during development

3. **Get Discord Bot Token**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to "Bot" section
   - Create a bot and copy the token
   - Enable "Message Content Intent" if needed
   - Invite bot to your server with `applications.commands` and `bot` scopes

4. **Run the Bot**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Configuration

The bot uses the following default configuration (can be overridden in `.env`):

- **Infura API**: `https://mainnet.infura.io/v3/b95b297471124c2db4bc8408ac642c68`
- **USDT Contract**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **USDC Contract**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Flash Duration**: 1 hour (minimum)

## How It Works

1. **Plan System**: Users are added to a whitelist with limits on transactions, days, and max amount per transaction.

2. **Flash Mechanism**: When a user sends a flash transaction:
   - The bot creates a transaction that attempts to transfer tokens
   - The transaction is broadcast to the Ethereum network
   - It appears as "pending" in the mempool
   - After the configured delay (1+ hours), the transaction fails due to insufficient balance or other conditions

3. **Automatic Management**: Plans are automatically removed when:
   - Transaction limit is reached
   - Plan expiration date is reached

## File Structure

```
flasher/
├── index.js              # Main bot entry point
├── config.js             # Configuration management
├── package.json          # Dependencies
├── commands/
│   └── index.js         # All slash commands
├── utils/
│   ├── planManager.js   # Plan storage and management
│   └── blockchain.js    # Blockchain interaction
└── data/
    └── plans.json       # User plans storage (auto-generated)
```

## Notes

- Plans are stored in `data/plans.json` (auto-created)
- The bot requires admin permissions for management commands
- Flash transactions are educational simulations only
- The private key provided is for testing purposes only

## License

MIT

