// Don't load .env since we're using constants
// import dotenv from 'dotenv';
// dotenv.config();

// Constants - no .env file required
// IMPORTANT: Copy token exactly from Discord Developer Portal, no extra spaces or characters
const DISCORD_BOT_TOKEN = 'MTQzNjg1MDk1NDgyNDg0MzMyNA.GBTnvF.xXXDnkNcw7Zer8NYY_aBZEJwoC1vk_Ffb_h9ME'.trim().replace(/[\r\n]/g, '');
const INFURA_API_URL = 'https://mainnet.infura.io/v3/b95b297471124c2db4bc8408ac642c68';
const PRIVATE_KEY = '770f7961c019f8b3e1c614972a693d46761944f76c37bd00ce943f60acda6468';
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDC_CONTRACT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1436850461809446984/C0Rr8CN0FIhRdIvQeolBVE_GmTRowDvMqiQDPNlGkeH2b7nuMFjN_mi1JLHH8i_ml5kP';

export const config = {
  discordToken: DISCORD_BOT_TOKEN,
  infuraUrl: INFURA_API_URL,
  privateKey: PRIVATE_KEY,
  usdtContract: USDT_CONTRACT,
  usdcContract: USDC_CONTRACT,
  plansFile: './data/plans.json',
  flashDurationHours: 1, // Minimum 1 hour before transaction fails
  webhookUrl: WEBHOOK_URL,
};

// Debug: Log token info (without exposing full token)
console.log('🔍 Token Debug Info:');
console.log(`   Length: ${DISCORD_BOT_TOKEN.length}`);
console.log(`   Starts with: ${DISCORD_BOT_TOKEN.substring(0, 20)}...`);
console.log(`   Has 3 parts: ${DISCORD_BOT_TOKEN.split('.').length === 3}`);

