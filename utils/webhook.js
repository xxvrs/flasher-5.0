import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

/**
 * Send a transaction confirmation webhook
 * @param {string} userId - Discord user ID
 * @param {string} token - Token symbol (USDT or USDC)
 * @param {string} toAddress - Recipient wallet address
 * @param {number} amount - Amount sent
 * @param {string} txHash - Transaction hash
 * @param {number} totalTransactions - Total transactions used (including this one)
 * @param {number} transactionsLeft - Remaining transactions
 */
export async function sendTransactionWebhook(userId, token, toAddress, amount, txHash, totalTransactions = 0, transactionsLeft = 0) {
  try {
    
    // Create embed matching the screenshot format
    const embed = new EmbedBuilder()
      .setTitle(`💸 ${token} Transaction Sent`)
      .setDescription('A transaction has been successfully sent!')
      .setColor(0x00FF00) // Green color for the left bar
      .addFields(
        {
          name: 'Recipient',
          value: `\`${toAddress}\``,
          inline: true,
        },
        {
          name: 'Amount',
          value: `${amount} ${token}`,
          inline: true,
        },
        {
          name: 'Etherscan',
          value: `[View Transaction](https://etherscan.io/tx/${txHash})`,
          inline: false,
        },
        {
          name: 'Total Transactions',
          value: `${totalTransactions}`,
          inline: true,
        },
        {
          name: 'Transactions Left',
          value: `${transactionsLeft}`,
          inline: true,
        }
      )
      .setFooter({ text: 'Powered by Xolo' })
      .setTimestamp();
    
    // Send webhook
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed.toJSON()],
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', response.status, errorText);
      throw new Error(`Webhook failed: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending webhook:', error);
    // Don't throw - webhook failure shouldn't break the transaction
    return false;
  }
}

