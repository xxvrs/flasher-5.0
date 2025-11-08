import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands/index.js';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Create commands collection
client.commands = new Collection();

// Register all commands
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

// When bot is ready
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
  
  // Register slash commands
  try {
    console.log('📝 Registering slash commands...');
    const commandData = commands.map(cmd => cmd.data.toJSON());
    
    // Register commands globally (can take up to 1 hour to propagate)
    // For faster testing, use guild commands instead
    if (process.env.GUILD_ID) {
      const guild = readyClient.guilds.cache.get(process.env.GUILD_ID);
      if (guild) {
        await guild.commands.set(commandData);
        console.log(`✅ Commands registered to guild: ${guild.name}`);
      } else {
        console.log('⚠️  GUILD_ID specified but guild not found. Registering globally...');
        await readyClient.application.commands.set(commandData);
        console.log('✅ Commands registered globally (may take up to 1 hour)');
      }
    } else {
      await readyClient.application.commands.set(commandData);
      console.log('✅ Commands registered globally (may take up to 1 hour)');
      console.log('💡 Tip: Set GUILD_ID in .env for instant command updates during development');
    }
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    
    const errorMessage = {
      content: '❌ There was an error while executing this command!',
      ephemeral: true,
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Handle errors
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
if (!config.discordToken) {
  console.error('❌ ERROR: Discord bot token is missing!');
  console.error('Please check config.js - DISCORD_BOT_TOKEN constant should be set.');
  process.exit(1);
}

// Log token status (without exposing the full token)
const tokenPreview = config.discordToken.substring(0, 10) + '...';
console.log(`🔑 Using token: ${tokenPreview}`);
console.log(`📏 Token length: ${config.discordToken.length} characters`);
console.log(`🔢 Token parts: ${config.discordToken.split('.').length}`);

// Debug: Show each part's length
const parts = config.discordToken.split('.');
console.log(`📊 Part lengths: ${parts.map((p, i) => `Part ${i + 1}: ${p.length}`).join(', ')}`);

// Check for non-printable characters
const hasNonPrintable = /[^\x20-\x7E]/.test(config.discordToken);
if (hasNonPrintable) {
  console.warn('⚠️  WARNING: Token contains non-printable characters!');
  const nonPrintableChars = config.discordToken.match(/[^\x20-\x7E]/g);
  console.warn(`   Found: ${nonPrintableChars?.length || 0} non-printable character(s)`);
}

client.login(config.discordToken).catch((error) => {
  console.error('❌ Failed to login:', error.message);
  console.error(`📏 Token length was: ${config.discordToken.length}`);
  console.error(`🔢 Token parts: ${config.discordToken.split('.').length}`);
  console.error('💡 Make sure:');
  console.error('   1. The token in config.js is correct (from Discord Developer Portal)');
  console.error('   2. The bot is enabled in Discord Developer Portal');
  console.error('   3. Message Content Intent is enabled in Discord Developer Portal');
  console.error('   4. The token hasn\'t been reset (if reset, update config.js with new token)');
  process.exit(1);
});

