import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLANS_FILE = path.join(__dirname, '..', config.plansFile);

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(PLANS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load plans from file
async function loadPlans() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PLANS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// Save plans to file
async function savePlans(plans) {
  await ensureDataDir();
  await fs.writeFile(PLANS_FILE, JSON.stringify(plans, null, 2));
}

// Get user plan
export async function getUserPlan(userId) {
  const plans = await loadPlans();
  return plans[userId] || null;
}

// Add or update user plan
export async function addPlan(userId, transactions, days, maxTx) {
  const plans = await loadPlans();
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  
  plans[userId] = {
    transactions: parseInt(transactions),
    transactionsUsed: 0,
    days: parseInt(days),
    startDate,
    endDate,
    maxTx: parseFloat(maxTx),
    createdAt: startDate,
  };
  
  await savePlans(plans);
  return plans[userId];
}

// Update user plan
export async function updatePlan(userId, transactions, days, maxTx) {
  const plans = await loadPlans();
  if (!plans[userId]) {
    throw new Error('User plan not found');
  }
  
  const currentPlan = plans[userId];
  const newEndDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  
  plans[userId] = {
    ...currentPlan,
    transactions: parseInt(transactions),
    days: parseInt(days),
    endDate: newEndDate,
    maxTx: parseFloat(maxTx),
  };
  
  await savePlans(plans);
  return plans[userId];
}

// Remove user plan
export async function removePlan(userId) {
  const plans = await loadPlans();
  if (plans[userId]) {
    delete plans[userId];
    await savePlans(plans);
    return true;
  }
  return false;
}

// Check if user can send transaction
export async function canSendTransaction(userId, amount) {
  const plan = await getUserPlan(userId);
  if (!plan) {
    return { allowed: false, reason: 'No plan found' };
  }
  
  // Check if plan expired
  const now = new Date();
  const endDate = new Date(plan.endDate);
  if (now > endDate) {
    await removePlan(userId);
    return { allowed: false, reason: 'Plan expired' };
  }
  
  // Check transaction limit
  if (plan.transactionsUsed >= plan.transactions) {
    await removePlan(userId);
    return { allowed: false, reason: 'Transaction limit reached' };
  }
  
  // Check max transaction amount
  if (amount > plan.maxTx) {
    return { allowed: false, reason: `Amount exceeds max transaction limit of ${plan.maxTx}` };
  }
  
  return { allowed: true };
}

// Record transaction usage
export async function recordTransaction(userId) {
  const plans = await loadPlans();
  if (plans[userId]) {
    plans[userId].transactionsUsed += 1;
    
    // Auto-remove if limit reached
    if (plans[userId].transactionsUsed >= plans[userId].transactions) {
      delete plans[userId];
    } else {
      // Check if expired
      const now = new Date();
      const endDate = new Date(plans[userId].endDate);
      if (now > endDate) {
        delete plans[userId];
      }
    }
    
    await savePlans(plans);
  }
}

// Get plan status
export async function getPlanStatus(userId) {
  const plan = await getUserPlan(userId);
  if (!plan) {
    return null;
  }
  
  const now = new Date();
  const endDate = new Date(plan.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
  const transactionsLeft = Math.max(0, plan.transactions - plan.transactionsUsed);
  const isExpired = now > endDate;
  
  return {
    ...plan,
    daysLeft,
    transactionsLeft,
    isExpired,
  };
}

