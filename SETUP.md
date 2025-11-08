# Setup Guide

## Quick Start

1. **Install Node.js** (v18 or higher recommended)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the project root:
   ```
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   INFURA_API_URL=https://mainnet.infura.io/v3/b95b297471124c2db4bc8408ac642c68
   PRIVATE_KEY=770f7961c019f8b3e1c614972a693d46761944f76c37bd00ce943f60acda6468
   USDT_CONTRACT=0xdAC17F958D2ee523a2206206994597C13D831ec7
   USDC_CONTRACT=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
   ```

4. **Get Discord Bot Token**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it and create
   - Go to "Bot" section
   - Click "Add Bot"
   - Under "Token", click "Reset Token" and copy it
   - Paste it in your `.env` file as `DISCORD_BOT_TOKEN`
   - Enable "Message Content Intent" under "Privileged Gateway Intents"
   - Save changes

5. **Invite Bot to Server**
   - Go to "OAuth2" > "URL Generator"
   - Select scopes: `bot` and `applications.commands`
   - Select bot permissions: `Administrator` (or specific permissions)
   - Copy the generated URL and open it in browser
   - Select your server and authorize

6. **Run the Bot**
   ```bash
   npm start
   ```

   For development (auto-reload):
   ```bash
   npm run dev
   ```

## Command Registration

Commands are automatically registered when the bot starts. 

**For faster testing** (commands appear instantly):
- Add `GUILD_ID=your_server_id` to your `.env` file
- Get your server ID by enabling Developer Mode in Discord and right-clicking your server

**Without GUILD_ID**:
- Commands are registered globally and may take up to 1 hour to appear

## Testing

1. Add yourself as a buyer:
   ```
   /addbuyer user_id:YOUR_USER_ID transactions:10 days:30 max_tx:1000
   ```

2. Check your plan:
   ```
   /see_plan
   ```

3. Send a flash transaction:
   ```
   /sendtoken token:USDT to:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb amount:100
   ```

## Troubleshooting

- **Bot doesn respond: Check bot permissions in your server**
- **Commands not appearing: Wait up to 1 hour for global commands, or use GUILD_ID**
- **Transaction errors: Ensure wallet has ETH for gas fees**
- **Plan errors: Check that user ID is correct (enable Developer Mode to get IDs)**

