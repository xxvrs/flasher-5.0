// Admin user IDs whitelist
const ADMIN_IDS = [
  '1002141250289422346', // Lucas
];

/**
 * Check if a user is an admin
 * @param {string} userId - Discord user ID
 * @returns {boolean}
 */
export function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

/**
 * Get all admin IDs
 * @returns {string[]}
 */
export function getAdminIds() {
  return [...ADMIN_IDS];
}

