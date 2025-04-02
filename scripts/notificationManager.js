/**
 * notificationManager.js - Manages system notifications for the FlowLoops app
 * Handles permissions, sending browser notifications, and event bindings
 */

/**
 * NotificationManager - A class that manages browser notifications with event handling
 * @class
 */
export class NotificationManager {
  #notificationsEnabled = false;
  #isSupported = false;
  #eventListeners = {};
  #notificationQueue = [];
  #isProcessingQueue = false;
  #defaultAutoClose = 5000; // ms
  #defaultIcon = './icons/icon-192.png';
  #defaultBadge = './icons/icon-192.png';
  #defaultVibration = [100, 50, 100];
  
  // Add quotes-related properties
  #quotesDictionary = {};
  #quotesEnabled = false;

  /**
   * Creates a new NotificationManager instance
   * @param {Object} options - Configuration options
   * @param {number} [options.autoCloseDelay=5000] - Default auto-close delay in ms
   * @param {string} [options.defaultIcon='./icons/icon-192.png'] - Default notification icon path
   * @param {string} [options.defaultBadge='./icons/icon-192.png'] - Default notification badge path
   * @param {Array} [options.defaultVibration=[100,50,100]] - Default vibration pattern
   * @param {boolean} [options.requestOnInit=true] - Whether to request permission on initialization
   * @param {Object} [options.quotesDictionary] - Dictionary with categories, emojis and quotes
   * @param {boolean} [options.enableQuotes=false] - Whether to enable quotes in notifications
   */
  constructor(options = {}) {
    // Check if notifications are supported
    this.#isSupported = 'Notification' in window;
    
    // Set configuration options
    this.#defaultAutoClose = options.autoCloseDelay || this.#defaultAutoClose;
    this.#defaultIcon = options.defaultIcon || this.#defaultIcon;
    this.#defaultBadge = options.defaultBadge || this.#defaultBadge;
    this.#defaultVibration = options.defaultVibration || this.#defaultVibration;
    
    // Check if we already have permission
    if (this.#isSupported && Notification.permission === 'granted') {
      this.#notificationsEnabled = true;
    }
    
    // Initialize quotes dictionary if provided
    if (options.quotesDictionary) {
      this.loadQuotesDictionary(options.quotesDictionary, options.enableQuotes);
    }
    
    // Request permission on initialization if specified
    if (options.requestOnInit !== false && this.#isSupported) {
      this.requestPermission();
    }
  }
  
  /**
   * Load quotes dictionary for use in notifications
   * @param {Object} dictionary - Dictionary with categories, emojis and quotes
   * @param {boolean} [enable=false] - Enable quotes in notifications
   * @returns {NotificationManager} - Returns this instance for chaining
   */
  loadQuotesDictionary(dictionary, enable = false) {
    this.#quotesDictionary = dictionary || {};
    this.#quotesEnabled = enable && Object.keys(this.#quotesDictionary).length > 0;
    return this;
  }

  /**
   * Enable or disable adding quotes to notifications
   * @param {boolean} enable - Whether to enable quotes
   * @returns {NotificationManager} - Returns this instance for chaining
   */
  enableQuotes(enable = true) {
    this.#quotesEnabled = enable && Object.keys(this.#quotesDictionary).length > 0;
    return this;
  }

  /**
   * Get a random element from an array
   * @private
   * @param {Array} array - Source array
   * @returns {*} Random element
   */
  #getRandomElement(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get a random quote and emoji from the dictionary
   * @private
   * @returns {Object|null} Object with quote and emoji, or null if no dictionary
   */
  #getRandomQuote() {
    if (!this.#quotesEnabled || Object.keys(this.#quotesDictionary).length === 0) {
      return null;
    }
    
    // Get random category
    const categories = Object.keys(this.#quotesDictionary);
    const category = this.#getRandomElement(categories);
    
    if (!category) return null;
    
    // Extract emoji from category name (assuming format "Category Name 🚀")
    const emojiMatch = category.match(/\p{Emoji}+$/u);
    const emoji = emojiMatch ? emojiMatch[0] : '';
    
    // Get random quote from that category
    const quotes = this.#quotesDictionary[category];
    const quote = this.#getRandomElement(Array.isArray(quotes) ? quotes : []);
    
    if (!quote) return null;
    
    return {
      quote,
      emoji,
      category
    };
  }
  
  /**
   * Request permission to show notifications
   * @returns {Promise} Promise resolving to true if permission granted
   */
  async requestPermission() {
    if (!this.#isSupported) {
      this.#triggerEvent('error', { message: 'Notifications not supported in this browser' });
      console.warn('Notifications not supported in this browser');
      return false;
    }
    
    // Check current permission status
    if (Notification.permission === 'granted') {
      this.#notificationsEnabled = true;
      this.#triggerEvent('permissiongranted');
      return true;
    }
    
    // If denied previously, we can't ask again
    if (Notification.permission === 'denied') {
      this.#triggerEvent('permissiondenied');
      console.warn('Notification permission previously denied');
      return false;
    }
    
    // Request permission
    try {
      const permission = await Notification.requestPermission();
      this.#notificationsEnabled = permission === 'granted';
      
      if (this.#notificationsEnabled) {
        this.#triggerEvent('permissiongranted');
      } else {
        this.#triggerEvent('permissiondenied');
      }
      
      return this.#notificationsEnabled;
    } catch (error) {
      this.#triggerEvent('error', { error });
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Send a notification to the user
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {Object} options - Additional notification options
   * @returns {Promise<boolean>} Promise resolving to true if notification was sent
   */
  async sendNotification(title, body, options = {}) {
    // Add to queue regardless of current permission state
    return new Promise((resolve) => {
      this.#notificationQueue.push({
        title,
        body,
        options,
        resolve
      });
      
      this.#processQueue();
    });
  }
  
  /**
   * Process the notification queue
   * @private
   */
  async #processQueue() {
    // Don't start processing if already processing
    if (this.#isProcessingQueue) return;
    
    this.#isProcessingQueue = true;
    
    // Request permission if not enabled yet
    if (!this.#notificationsEnabled) {
      const granted = await this.requestPermission();
      if (!granted) {
        // Reject all queued notifications
        while (this.#notificationQueue.length > 0) {
          const item = this.#notificationQueue.shift();
          item.resolve(false);
        }
        this.#isProcessingQueue = false;
        return;
      }
    }
    
    // Process all queued notifications
    while (this.#notificationQueue.length > 0) {
      const item = this.#notificationQueue.shift();
      const result = await this.#createNotification(item.title, item.body, item.options);
      item.resolve(result);
      
      // Small delay between notifications if there are more in the queue
      if (this.#notificationQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    this.#isProcessingQueue = false;
  }
  
  /**
   * Creates and shows a notification
   * @private
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {Object} options - Additional notification options
   * @returns {Promise<boolean>} Promise resolving to true if successful
   */
  async #createNotification(title, body, options = {}) {
    // Extract callback options
    const {
      onClick,
      onClose,
      onError,
      onShow,
      silent = false,
      autoClose = true,
      autoCloseDelay = this.#defaultAutoClose,
      skipQuote = false, // New option to skip quote for this notification
      ...notificationOptions
    } = options;
    
    // Add random quote to body if enabled and not explicitly skipped
    let finalBody = body;
    if (this.#quotesEnabled && !skipQuote) {
      const randomQuote = this.#getRandomQuote();
      if (randomQuote) {
        finalBody = `${body}\n\n"${randomQuote.quote}" ${randomQuote.emoji}`;
      }
    }
    
    // Merge default options
    const mergedOptions = {
      body: finalBody, // Use the modified body
      icon: this.#defaultIcon,
      badge: this.#defaultBadge,
      silent,
      ...notificationOptions
    };
    
    // Only add vibration if not silent
    if (!silent) {
      mergedOptions.vibrate = mergedOptions.vibrate || this.#defaultVibration;
    }
    
    // Create and show the notification
    try {
      const notification = new Notification(title, mergedOptions);
      let notificationClosed = false;
      
      // Set up event handlers
      notification.onclick = (event) => {
        if (onClick) {
          onClick(event, notification);
        } else {
          // Default behavior: focus window and close notification
          window.focus();
          notification.close();
        }
        this.#triggerEvent('click', { title, body, notification, event });
      };
      
      notification.onshow = (event) => {
        if (onShow) onShow(event, notification);
        this.#triggerEvent('show', { title, body, notification, event });
      };
      
      notification.onerror = (event) => {
        if (onError) onError(event, notification);
        this.#triggerEvent('notificationerror', { title, body, notification, event });
        return false;
      };
      
      notification.onclose = (event) => {
        notificationClosed = true;
        if (onClose) onClose(event, notification);
        this.#triggerEvent('close', { title, body, notification, event });
      };
      
      // Auto-close after delay if enabled
      if (autoClose) {
        setTimeout(() => {
          if (!notificationClosed) {
            notification.close();
          }
        }, autoCloseDelay);
      }
      
      return true;
    } catch (error) {
      this.#triggerEvent('error', { error, title, body });
      console.error('Error creating notification:', error);
      return false;
    }
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {NotificationManager} - Returns this instance for chaining
   */
  on(event, handler) {
    if (!this.#eventListeners[event]) {
      this.#eventListeners[event] = [];
    }
    this.#eventListeners[event].push(handler);
    return this;
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} [handler] - Event handler function (if omitted, removes all handlers for event)
   * @returns {NotificationManager} - Returns this instance for chaining
   */
  off(event, handler) {
    if (!this.#eventListeners[event]) {
      return this;
    }
    
    if (!handler) {
      // Remove all handlers for this event
      delete this.#eventListeners[event];
    } else {
      // Remove specific handler
      this.#eventListeners[event] = this.#eventListeners[event].filter(h => h !== handler);
    }
    
    return this;
  }
  
  /**
   * Trigger an event
   * @private
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  #triggerEvent(event, data = {}) {
    if (!this.#eventListeners[event]) {
      return;
    }
    
    const eventObj = {
      type: event,
      timestamp: new Date(),
      ...data
    };
    
    for (const handler of this.#eventListeners[event]) {
      try {
        handler(eventObj);
      } catch (error) {
        console.error(`Error in notification ${event} event handler:`, error);
      }
    }
  }
  
  /**
   * Backwards compatibility alias for sendNotification
   */
  notify(title, body, options = {}) {
    return this.sendNotification(title, body, options);
  }
  
  /**
   * Get whether notifications are enabled
   * @returns {boolean}
   */
  get isEnabled() {
    return this.#notificationsEnabled;
  }
  
  /**
   * Get whether notifications are supported by the browser
   * @returns {boolean}
   */
  get isSupported() {
    return this.#isSupported;
  }
  
  /**
   * Get current notification permission state
   * @returns {string} 'granted', 'denied', or 'default'
   */
  get permissionState() {
    return this.#isSupported ? Notification.permission : 'unsupported';
  }
  
  /**
   * Get whether quotes are enabled for notifications
   * @returns {boolean}
   */
  get quotesEnabled() {
    return this.#quotesEnabled;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use the NotificationManager class instead
 */
export function initializeNotifications(options = {}) {
  const manager = new NotificationManager({
    requestOnInit: true,
    ...options
  });
  
  return manager; // Return the actual manager instance for direct access to all methods
}