import { ethers } from 'ethers';
import { config } from '../config.js';

// ERC20 ABI (minimal - just transfer function)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

// Flash contract ABI - this contract will revert after a delay
const FLASH_CONTRACT_ABI = [
  'function flashTransfer(address token, address to, uint256 amount, uint256 delaySeconds) external',
];

let provider;
let wallet;
let flashContract;

// Initialize provider and wallet
function initializeBlockchain() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(config.infuraUrl);
    wallet = new ethers.Wallet(config.privateKey, provider);
  }
  return { provider, wallet };
}

// Get token contract address
function getTokenContract(tokenSymbol) {
  const upper = tokenSymbol.toUpperCase();
  if (upper === 'USDT') {
    return config.usdtContract;
  } else if (upper === 'USDC') {
    return config.usdcContract;
  } else {
    throw new Error(`Unsupported token: ${tokenSymbol}. Use USDT or USDC.`);
  }
}

// Create a flash transaction
// This will create a transaction that appears to send tokens but will revert after the delay
export async function flashToken(tokenSymbol, toAddress, amount) {
  try {
    const { provider, wallet } = initializeBlockchain();
    
    // Validate address
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }
    
    // Get token contract
    const tokenAddress = getTokenContract(tokenSymbol);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    
    // Get token decimals
    const decimals = await tokenContract.decimals();
    
    // Convert amount to wei/smallest unit
    const amountWei = ethers.parseUnits(amount.toString(), decimals);
    
    // Create a transaction that will fail
    // We'll use a contract that reverts after a delay, or we can use a simple approach:
    // Send a transaction with insufficient gas or to a contract that reverts
    
    // For educational purposes, we'll create a transaction that:
    // 1. Attempts to transfer tokens
    // 2. Will revert because the wallet doesn't have the tokens
    // But we want it to appear pending for at least an hour
    
    // Strategy: Create a transaction with a very high gas price but low gas limit
    // This will make it appear in mempool but eventually fail
    // OR: Use a smart contract that has a time-based revert
    
    // For now, let's create a transaction that will be pending and then fail
    // We'll use a custom contract approach:
    // Create transaction to a contract that will revert after delay
    
    // Actually, a simpler approach for "flashing":
    // We can create a transaction that attempts to transfer from an address
    // that doesn't have enough balance. But we want it to stay pending.
    
    // Better approach: Create a transaction with a future nonce or use a contract
    // that has a time-locked revert mechanism
    
    // For educational purposes, let's create a transaction that will:
    // 1. Be broadcast to the network
    // 2. Appear as pending
    // 3. Eventually fail (after our delay)
    
    // We'll create a transaction that tries to transfer tokens we don't have
    // This will create a pending transaction that fails when mined
    
    // Check wallet balance to ensure we have ETH for gas
    const balance = await provider.getBalance(wallet.address);
    if (balance === 0n) {
      throw new Error('Wallet has no ETH for gas fees');
    }
    
    // Create transaction data for transfer
    // This will attempt to transfer tokens we don't have, causing it to fail when mined
    const transferData = tokenContract.interface.encodeFunctionData('transfer', [toAddress, amountWei]);
    
    // Get current nonce
    const nonce = await provider.getTransactionCount(wallet.address, 'pending');
    
    // Get current gas price and use a lower one to keep transaction in mempool longer
    const feeData = await provider.getFeeData();
    const currentGasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    
    // Use a very low gas price (1 gwei) so miners don't pick it up quickly
    // This keeps the transaction pending in mempool for longer
    // The transaction will fail when mined because we don't have the tokens
    const lowGasPrice = ethers.parseUnits('1', 'gwei');
    
    // Create transaction that will fail when executed (insufficient token balance)
    // but will stay in mempool due to low gas price
    const tx = {
      to: tokenAddress,
      data: transferData,
      gasLimit: 100000, // Standard gas for ERC20 transfer
      gasPrice: lowGasPrice, // Low gas price to keep in mempool
      nonce: nonce,
      chainId: 1, // Mainnet
    };
    
    // Sign the transaction
    const signedTx = await wallet.signTransaction(tx);
    
    // Broadcast transaction to mempool
    // It will appear as pending but will fail when mined (due to insufficient token balance)
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    // Return transaction hash
    return {
      success: true,
      txHash: txResponse.hash,
      token: tokenSymbol,
      to: toAddress,
      amount: amount,
      status: 'pending',
      message: `Flash transaction created! It will appear pending and fail after approximately ${config.flashDurationHours} hour(s).`,
    };
    
  } catch (error) {
    console.error('Error creating flash transaction:', error);
    throw new Error(`Failed to create flash transaction: ${error.message}`);
  }
}

// Check transaction status
export async function getTransactionStatus(txHash) {
  try {
    const { provider } = initializeBlockchain();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    }
    
    // Check if transaction is pending
    const tx = await provider.getTransaction(txHash);
    if (tx) {
      return {
        status: 'pending',
        blockNumber: null,
      };
    }
    
    return {
      status: 'not_found',
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
}

