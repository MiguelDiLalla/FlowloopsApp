/**
 * historySidebar.js - Renders and manages the history sidebar
 * Shows logs of completed sessions with times and provides visual feedback
 */

export function initializeHistorySidebar(timerManager) {
  const historySidebar = document.querySelector('.history-sidebar');
  const mobileNav = document.querySelector('.mobile-nav');
  
  if (!historySidebar) {
    console.error('History sidebar element not found');
    return;
  }
  
  // Clear existing content
  historySidebar.innerHTML = '';
  
  // Create container for log entries
  const logContainer = document.createElement('div');
  logContainer.id = 'log-container';
  
  // Get saved history from localStorage if available
  const historyItems = loadHistoryFromStorage() || [];
  const totalSeconds = historyItems.reduce((total, item) => total + item.seconds, 0);
  
  // Create history items from saved data (or empty if none exists)
  if (historyItems.length > 0) {
    // Show saved history items
    historyItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'item';
      itemElement.textContent = `${item.emoji} +${formatTimeDisplay(item.seconds)}`;
      logContainer.appendChild(itemElement);
    });
    
    // Apply dimming effect to older entries
    applyDimmingEffect(logContainer);
    
    // Enforce maximum entries in the UI
    enforceMaxEntries(logContainer, 5);
  }
  
  // Create total time display
  const totalContainer = document.createElement('div');
  totalContainer.className = 'total';
  totalContainer.textContent = `Total: ${formatTimeDisplay(totalSeconds)}`;
  
  // Append elements to sidebar
  historySidebar.appendChild(logContainer);
  historySidebar.appendChild(totalContainer);
  
  // Initialize mobile nav if it exists
  if (mobileNav) {
    const mobileTotal = mobileNav.querySelector('.total');
    const mobileLast = mobileNav.querySelector('.last-entry');
    
    if (mobileTotal) {
      mobileTotal.textContent = `Total: ${formatTimeDisplay(totalSeconds)}`;
    }
    
    if (mobileLast && historyItems.length > 0) {
      const lastItem = historyItems[0]; // First item is the most recent
      mobileLast.textContent = `${lastItem.emoji} Last: +${formatTimeDisplay(lastItem.seconds)}`;
    } else if (mobileLast) {
      mobileLast.textContent = '';
    }
  }
  
  // Subscribe to timer events if manager is available
  if (timerManager) {
    // Store the original onTimerComplete if it exists
    const originalCallback = timerManager.onTimerComplete;
    
    // Set a new callback that handles both history and previous functionality
    timerManager.onTimerComplete = (durationSec, totalSessionTimeSec) => {
      const entry = {
        duration: durationSec,
        timestamp: new Date().toISOString(),
        totalSessionTime: totalSessionTimeSec,
        emoji: getRandomEmoji()
      };
      
      addHistoryEntry(entry);
      
      // Update total time
      updateTotalTime(totalSessionTimeSec);
      
      // Update mobile navigation
      updateMobileNav(entry);
      
      // Ensure we enforce max entries again here
      const logContainer = historySidebar.querySelector('#log-container');
      if (logContainer) {
        enforceMaxEntries(logContainer, 5);
      }
      
      // Call original callback if it exists
      if (originalCallback && typeof originalCallback === 'function') {
        originalCallback(durationSec, totalSessionTimeSec);
      }
    };
  }
  
  /**
   * Updates the total time display
   * @param {number} seconds - Total session time in seconds
   */
  function updateTotalTime(seconds) {
    const totalElement = historySidebar.querySelector('.total');
    if (totalElement) {
      totalElement.textContent = `Total: ${formatTimeDisplay(seconds)}`;
    }
    
    // Update mobile total as well
    if (mobileNav) {
      const mobileTotal = mobileNav.querySelector('.total');
      if (mobileTotal) {
        mobileTotal.textContent = `Total: ${formatTimeDisplay(seconds)}`;
      }
    }
  }
  
  /**
   * Updates the mobile navigation with the latest entry
   */
  function updateMobileNav(entry) {
    if (!mobileNav) return;

    // Update last entry
    const mobileLast = mobileNav.querySelector('.last-entry');
    if (mobileLast) {
      mobileLast.textContent = `${entry.emoji} Last: +${formatTimeDisplay(entry.duration)}`;
      mobileLast.classList.add('animate-fade-in');

      setTimeout(() => {
        mobileLast.classList.remove('animate-fade-in');
      }, 300);
    }

    // Update total
    const mobileTotal = mobileNav.querySelector('.total');
    if (mobileTotal && entry.totalSessionTime) {
      mobileTotal.textContent = `Total: ${formatTimeDisplay(entry.totalSessionTime)}`;
    }
  }
  
  /**
   * Load history data from localStorage
   * @returns {Array} Array of history items or null if not found
   */
  function loadHistoryFromStorage() {
    try {
      const savedHistory = localStorage.getItem('flowloops_history');
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
      return null;
    } catch (error) {
      console.error('Error loading history from storage:', error);
      return null;
    }
  }
  
  /**
   * Save history data to localStorage
   * @param {Array} historyItems - Array of history items to save
   */
  function saveHistoryToStorage(historyItems) {
    try {
      localStorage.setItem('flowloops_history', JSON.stringify(historyItems));
    } catch (error) {
      console.error('Error saving history to storage:', error);
    }
  }
  
  // Public interface for the module
  return {
    panel: historySidebar,
    addHistoryEntry,
    updateTotalTime,
    clearHistory: () => {
      const logContainer = historySidebar.querySelector('#log-container');
      if (logContainer) {
        logContainer.innerHTML = '';
      }
      updateTotalTime(0);
      saveHistoryToStorage([]);
    }
  };
  
  /**
   * Adds a new history entry to the log
   * @param {Object} entry - The entry details
   * @param {number} entry.duration - Duration in seconds
   * @param {Date|string} entry.timestamp - When the timer completed
   * @param {number} entry.totalSessionTime - Total session time in seconds
   * @param {string} [entry.emoji] - Emoji to display (random if not provided)
   */
  function addHistoryEntry(entry) {
    const logContainer = historySidebar.querySelector('#log-container');
    if (!logContainer) return;
    
    // Create log entry element
    const logEntry = document.createElement('div');
    logEntry.className = 'item animate-fade-in';
    
    // Use provided emoji or get a random one
    const emoji = entry.emoji || getRandomEmoji();
    
    // Format the entry
    logEntry.textContent = `${emoji} +${formatTimeDisplay(entry.duration)}`;
    
    // Insert at the top of log container (newest first)
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // Update total time
    updateTotalTime(entry.totalSessionTime);
    
    // Update mobile nav
    const mobileEntry = { ...entry, emoji };
    updateMobileNav(mobileEntry);
    
    // Directly enforce max entries by removing extra elements
    const entries = logContainer.querySelectorAll('.item');
    if (entries.length > 5) {
      // Remove all entries beyond the 5th one
      for (let i = 5; i < entries.length; i++) {
        if (entries[i] && entries[i].parentNode) {
          entries[i].parentNode.removeChild(entries[i]);
        }
      }
    }
    
    // Save to localStorage (keep up to 20 items in storage)
    saveHistoryItem({
      emoji,
      seconds: entry.duration,
      timestamp: entry.timestamp || new Date().toISOString(),
      totalSeconds: entry.totalSessionTime
    });
  }
  
  /**
   * Enforces a maximum number of entries in the log container
   * @param {HTMLElement} container - The log container element
   * @param {number} maxEntries - Maximum number of entries to keep
   */
  function enforceMaxEntries(container, maxEntries) {
    const entries = Array.from(container.querySelectorAll('.item'));
    
    // If we have more entries than the maximum allowed
    if (entries.length > maxEntries) {
      console.log(`Removing ${entries.length - maxEntries} excess history entries`);
      
      // Remove all entries beyond the maximum limit immediately
      for (let i = maxEntries; i < entries.length; i++) {
        if (entries[i] && entries[i].parentNode) {
          entries[i].parentNode.removeChild(entries[i]);
        }
      }
    }
  }
  
  /**
   * Applies dimming effect to entries based on their position
   * @param {HTMLElement} container - The log container element
   */
  function applyDimmingEffect(container) {
    // The CSS automatically handles dimming based on :nth-child selectors
    // No JavaScript needed here - the CSS does the work for us
    console.log('Dimming is handled by CSS :nth-child selectors');
  }
  
  /**
   * Save a history item to localStorage
   * @param {Object} item - The history item to save
   */
  function saveHistoryItem(item) {
    try {
      // Get existing history
      const history = loadHistoryFromStorage() || [];
      
      // Add new item at the beginning (newest first)
      history.unshift(item);
      
      // Limit to 20 items
      if (history.length > 20) {
        history.length = 20;
      }
      
      // Save back to localStorage
      saveHistoryToStorage(history);
    } catch (error) {
      console.error('Error saving history item:', error);
    }
  }
}

/**
 * Returns a random emoji for the history entry
 */
function getRandomEmoji() {
  const emojis = ['🍄', '🎯', '🌊', '🔥', '⚡', '🌈', '🧠', '🎨', '🚀'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Formats seconds into MM:SS format (minute:seconds)
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string (00:00)
 */
function formatTimeDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  
  // Always return in MM:SS format, with leading zeros
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}