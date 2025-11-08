import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as planManager from '../utils/planManager.js';
import { flashToken } from '../utils/blockchain.js';
import { sendTransactionWebhook } from '../utils/webhook.js';
import { isAdmin } from '../utils/adminManager.js';

// Add buyer command
export const addBuyerCommand = {
  data: new SlashCommandBuilder()
    .setName('addbuyer')
    .setDescription('Add a user to the whitelist with a plan')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('Discord user ID')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('transactions')
        .setDescription('Number of transactions they can send')
        .setRequired(true)
        .setMinValue(1))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days they can use the bot')
        .setRequired(true)
        .setMinValue(1))
    .addNumberOption(option =>
      option.setName('max_tx')
        .setDescription('Maximum amount of crypto they can flash per transaction')
        .setRequired(true)
        .setMinValue(0.000001))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    // Check if user is admin (either Discord admin or whitelisted)
    const hasDiscordAdmin = interaction.member?.permissions.has(PermissionFlagsBits.Administrator) || false;
    if (!hasDiscordAdmin && !isAdmin(interaction.user.id)) {
      await interaction.editReply({
        content: '❌ You do not have permission to use this command.',
      });
      return;
    }
    
    try {
      const userId = interaction.options.getString('user_id');
      const transactions = interaction.options.getInteger('transactions');
      const days = interaction.options.getInteger('days');
      const maxTx = interaction.options.getNumber('max_tx');
      
      const plan = await planManager.addPlan(userId, transactions, days, maxTx);
      
      await interaction.editReply({
        content: `✅ Plan added for user <@${userId}>:\n` +
                 `- Transactions: ${plan.transactions}\n` +
                 `- Days: ${plan.days}\n` +
                 `- Max per transaction: ${plan.maxTx}\n` +
                 `- Expires: ${new Date(plan.endDate).toLocaleString()}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    }
  },
};

// Remove plan command
export const removePlanCommand = {
  data: new SlashCommandBuilder()
    .setName('removeplan')
    .setDescription('Remove a user\'s plan')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('Discord user ID')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    // Check if user is admin (either Discord admin or whitelisted)
    const hasDiscordAdmin = interaction.member?.permissions.has(PermissionFlagsBits.Administrator) || false;
    if (!hasDiscordAdmin && !isAdmin(interaction.user.id)) {
      await interaction.editReply({
        content: '❌ You do not have permission to use this command.',
      });
      return;
    }
    
    try {
      const userId = interaction.options.getString('user_id');
      const removed = await planManager.removePlan(userId);
      
      if (removed) {
        await interaction.editReply({
          content: `✅ Plan removed for user <@${userId}>`,
        });
      } else {
        await interaction.editReply({
          content: `❌ No plan found for user <@${userId}>`,
        });
      }
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    }
  },
};

// See plan command (own plan)
export const seePlanCommand = {
  data: new SlashCommandBuilder()
    .setName('see_plan')
    .setDescription('View your current plan status'),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const userId = interaction.user.id;
      const status = await planManager.getPlanStatus(userId);
      
      if (!status) {
        await interaction.editReply({
          content: '❌ You don\'t have an active plan. Contact an administrator to get one.',
        });
        return;
      }
      
      if (status.isExpired) {
        await interaction.editReply({
          content: '❌ Your plan has expired.',
        });
        return;
      }
      
      await interaction.editReply({
        content: `📋 **Your Plan Status:**\n` +
                 `- Transactions remaining: ${status.transactionsLeft} / ${status.transactions}\n` +
                 `- Days remaining: ${status.daysLeft}\n` +
                 `- Max per transaction: ${status.maxTx}\n` +
                 `- Plan expires: ${new Date(status.endDate).toLocaleString()}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    }
  },
};

// See plan user command (admin)
export const seePlanUserCommand = {
  data: new SlashCommandBuilder()
    .setName('see_plan_user')
    .setDescription('View a user\'s plan status (Admin only)')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('Discord user ID')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    // Check if user is admin (either Discord admin or whitelisted)
    const hasDiscordAdmin = interaction.member?.permissions.has(PermissionFlagsBits.Administrator) || false;
    if (!hasDiscordAdmin && !isAdmin(interaction.user.id)) {
      await interaction.editReply({
        content: '❌ You do not have permission to use this command.',
      });
      return;
    }
    
    try {
      const userId = interaction.options.getString('userid');
      const status = await planManager.getPlanStatus(userId);
      
      if (!status) {
        await interaction.editReply({
          content: `❌ No plan found for user <@${userId}>`,
        });
        return;
      }
      
      await interaction.editReply({
        content: `📋 **Plan Status for <@${userId}>:**\n` +
                 `- Transactions: ${status.transactionsUsed} / ${status.transactions} used\n` +
                 `- Transactions remaining: ${status.transactionsLeft}\n` +
                 `- Days remaining: ${status.daysLeft}\n` +
                 `- Max per transaction: ${status.maxTx}\n` +
                 `- Plan expires: ${new Date(status.endDate).toLocaleString()}\n` +
                 `- Status: ${status.isExpired ? '❌ Expired' : '✅ Active'}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    }
  },
};

// Send token command
export const sendTokenCommand = {
  data: new SlashCommandBuilder()
    .setName('sendtoken')
    .setDescription('Flash send ERC20 tokens')
    .addStringOption(option =>
      option.setName('token')
        .setDescription('Token to flash (USDT or USDC)')
        .setRequired(true)
        .addChoices(
          { name: 'USDT', value: 'USDT' },
          { name: 'USDC', value: 'USDC' }
        ))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Recipient wallet address')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('Amount to flash')
        .setRequired(true)
        .setMinValue(0.000001)),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const userId = interaction.user.id;
      const token = interaction.options.getString('token');
      const toAddress = interaction.options.getString('to');
      const amount = interaction.options.getNumber('amount');
      
      // Check if user can send transaction
      const canSend = await planManager.canSendTransaction(userId, amount);
      if (!canSend.allowed) {
        await interaction.editReply({
          content: `❌ Transaction not allowed: ${canSend.reason}`,
        });
        return;
      }
      
      // Flash the token
      const result = await flashToken(token, toAddress, amount);
      
      // Get plan status before recording (to show accurate counts in webhook)
      const planStatusBefore = await planManager.getPlanStatus(userId);
      
      // Record transaction usage
      await planManager.recordTransaction(userId);
      
      // Calculate counts for webhook (increment used count for display)
      const totalTransactions = planStatusBefore ? planStatusBefore.transactionsUsed + 1 : 1;
      const transactionsLeft = planStatusBefore ? Math.max(0, planStatusBefore.transactionsLeft - 1) : 0;
      
      // Send webhook confirmation
      await sendTransactionWebhook(userId, token, toAddress, amount, result.txHash, totalTransactions, transactionsLeft);
      
      await interaction.editReply({
        content: `🚀 **Flash Transaction Created!**\n\n` +
                 `Token: ${result.token}\n` +
                 `To: ${result.to}\n` +
                 `Amount: ${result.amount}\n` +
                 `Transaction Hash: \`${result.txHash}\`\n` +
                 `Status: ${result.status}\n\n` +
                 `${result.message}\n\n` +
                 `View on Etherscan: https://etherscan.io/tx/${result.txHash}`,
      });
    } catch (error) {
      console.error('Send token error:', error);
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    }
  },
};

// Update plan command
export const updatePlanCommand = {
  data: new SlashCommandBuilder()
    .setName('update_plan')
    .setDescription('Update a user\'s plan')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('Discord user ID')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('transactions')
        .setDescription('Number of transactions they can send')
        .setRequired(true)
        .setMinValue(1))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days they can use the bot')
        .setRequired(true)
        .setMinValue(1))
    .addNumberOption(option =>
      option.setName('max_tx')
        .setDescription('Maximum amount of crypto they can flash per transaction')
        .setRequired(true)
        .setMinValue(0.000001))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    // Check if user is admin (either Discord admin or whitelisted)
    const hasDiscordAdmin = interaction.member?.permissions.has(PermissionFlagsBits.Administrator) || false;
    if (!hasDiscordAdmin && !isAdmin(interaction.user.id)) {
      await interaction.editReply({
        content: '❌ You do not have permission to use this command.',
      });
      return;
    }
    
    try {
      const userId = interaction.options.getString('userid');
      const transactions = interaction.options.getInteger('transactions');
      const days = interaction.options.getInteger('days');
      const maxTx = interaction.options.getNumber('max_tx');
      
      const plan = await planManager.updatePlan(userId, transactions, days, maxTx);
      
      await interaction.editReply({
        content: `✅ Plan updated for user <@${userId}>:\n` +
                 `- Transactions: ${plan.transactions} (${plan.transactionsUsed} used)\n` +
                 `- Days: ${plan.days}\n` +
                 `- Max per transaction: ${plan.maxTx}\n` +
                 `- New expiration: ${new Date(plan.endDate).toLocaleString()}`,
      });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    }
  },
};

// Export all commands
export const commands = [
  addBuyerCommand,
  removePlanCommand,
  seePlanCommand,
  seePlanUserCommand,
  sendTokenCommand,
  updatePlanCommand,
];

