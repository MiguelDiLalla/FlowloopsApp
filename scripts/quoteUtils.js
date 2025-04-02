/**
 * quoteUtils.js - Utility functions for managing quotes in FlowLoops
 * Handles loading quote dictionaries for use in notifications
 */

/**
 * Load a quotes dictionary from a JSON file
 * @param {string} path - Path to the quotes JSON file
 * @returns {Promise<Object>} Promise resolving to the quotes dictionary
 */
export async function loadQuotesDictionary(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load quotes: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading quotes dictionary:', error);
    return {};
  }
}

/**
 * Configure a notification manager with quotes
 * @param {NotificationManager} notificationManager - The notification manager instance to configure
 * @param {string} quotesPath - Path to the quotes JSON file
 * @param {boolean} [enable=true] - Whether to enable quotes immediately
 * @returns {Promise<NotificationManager>} Promise resolving to the configured notification manager
 */
export async function configureNotificationManagerWithQuotes(notificationManager, quotesPath, enable = true) {
  if (!notificationManager) {
    console.warn('No notification manager provided to configure with quotes');
    return null;
  }
  
  try {
    const quotesDictionary = await loadQuotesDictionary(quotesPath);
    
    // Check if we got a valid dictionary
    if (Object.keys(quotesDictionary).length === 0) {
      console.warn(`No quotes loaded from ${quotesPath}`);
      return notificationManager;
    }
    
    // Configure the notification manager with the quotes
    notificationManager.loadQuotesDictionary(quotesDictionary, enable);
    console.log(`Configured notification manager with ${Object.keys(quotesDictionary).length} quote categories`);
    
    return notificationManager;
  } catch (error) {
    console.error('Error configuring notification manager with quotes:', error);
    return notificationManager;
  }
}