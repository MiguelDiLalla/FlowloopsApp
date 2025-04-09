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
  
  // Create timer indicator dot 
  const timerIndicator = document.createElement('div');
  timerIndicator.className = 'timer-indicator';
  historySidebar.appendChild(timerIndicator);
  
  // Create mobile timer indicator if mobile nav exists
  let mobileTimerIndicator = null;
  if (mobileNav) {
    // Get the mobile-time-container where we'll place our indicator
    const mobileTimeContainer = mobileNav.querySelector('.mobile-time-container');
    if (mobileTimeContainer) {
      // Position indicator relative to this container
      mobileTimeContainer.style.position = 'relative';
      
      // Create indicator
      mobileTimerIndicator = document.createElement('div');
      mobileTimerIndicator.className = 'mobile-timer-indicator';
      mobileTimeContainer.appendChild(mobileTimerIndicator);
      
      console.log('Mobile timer indicator added to mobile-time-container');
    } else {
      console.log('Mobile time container not found');
    }
  }
  
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
      
      // Add animation for better visibility on change
      mobileTotal.classList.add('animate-fade-in');
    }
    
    if (mobileLast && historyItems.length > 0) {
      const lastItem = historyItems[0]; // First item is the most recent
      mobileLast.textContent = `${lastItem.emoji} Last: +${formatTimeDisplay(lastItem.seconds)}`;
      
      // Add animation for better visibility on change
      mobileLast.classList.add('animate-fade-in');
    } else if (mobileLast) {
      mobileLast.textContent = '';
    }
  }
  
  // Subscribe to timer events if manager is available
  if (timerManager) {
    // Set initial state of timer indicator based on timer state
    if (timerManager.isRunning) {
      timerIndicator.classList.add('running');
      if (mobileTimerIndicator) {
        mobileTimerIndicator.classList.add('running');
      }
    }
    
    // Add event listeners for timer start and pause
    const originalStartSession = timerManager.startSession;
    if (originalStartSession) {
      timerManager.startSession = function() {
        timerIndicator.classList.add('running');
        if (mobileTimerIndicator) {
          mobileTimerIndicator.classList.add('running');
        }
        return originalStartSession.apply(this, arguments);
      };
    }
    
    const originalPauseSession = timerManager.pauseSession;
    if (originalPauseSession) {
      timerManager.pauseSession = function() {
        timerIndicator.classList.remove('running');
        if (mobileTimerIndicator) {
          mobileTimerIndicator.classList.remove('running');
        }
        return originalPauseSession.apply(this, arguments);
      };
    }
    
    // Failsafe: poll timer state every 1s in case we miss events
    setInterval(() => {
      if (timerManager.isRunning) {
        timerIndicator.classList.add('running');
        if (mobileTimerIndicator) {
          mobileTimerIndicator.classList.add('running');
        }
      } else {
        timerIndicator.classList.remove('running');
        if (mobileTimerIndicator) {
          mobileTimerIndicator.classList.remove('running');
        }
      }
    }, 1000);
    
    // Store the original onTimerComplete if it exists
    const originalCallback = timerManager.onTimerComplete;
    
    // Set a new callback that handles both history and previous functionality
    timerManager.onTimerComplete = (durationSec, totalSessionTimeSec) => {
      // Generate a consistent emoji for this entry to use in both displays
      const emoji = getRandomEmoji();
      
      const entry = {
        duration: durationSec,
        timestamp: new Date().toISOString(),
        totalSessionTime: totalSessionTimeSec,
        emoji: emoji
      };
      
      addHistoryEntry(entry);
      
      // Update total time - this updates both desktop and mobile
      updateTotalTime(totalSessionTimeSec);
      
      // Update mobile navigation with same entry data
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
    console.log('Updating total time display with:', seconds, 'seconds');
    
    // Force seconds to be treated as a number
    seconds = Number(seconds) || 0;
    
    // Update history sidebar total
    const totalElement = historySidebar.querySelector('.total');
    if (totalElement) {
      totalElement.textContent = `Total: ${formatTimeDisplay(seconds)}`;
      console.log('Updated history sidebar total:', totalElement.textContent);
    } else {
      console.error('History sidebar total element not found');
    }
    
    // Explicitly update mobile total
    if (mobileNav) {
      const mobileTotal = mobileNav.querySelector('.total');
      if (mobileTotal) {
        mobileTotal.textContent = `Total: ${formatTimeDisplay(seconds)}`;
        console.log('Updated mobile total:', mobileTotal.textContent);
        
        // Add a visual indicator that the value changed
        mobileTotal.classList.remove('animate-fade-in');
        void mobileTotal.offsetWidth; // Force reflow to restart animation
        mobileTotal.classList.add('animate-fade-in');
      } else {
        console.error('Mobile total element not found');
      }
    }
  }
  
  /**
   * Updates the mobile navigation with the latest entry
   */
  function updateMobileNav(entry) {
    if (!mobileNav) return;

    console.log('Updating mobile nav with:', entry);

    // Update last entry
    const mobileLast = mobileNav.querySelector('.last-entry');
    if (mobileLast) {
      mobileLast.textContent = `${entry.emoji} Last: +${formatTimeDisplay(entry.duration)}`;
      
      // Add animation class for feedback
      mobileLast.classList.remove('animate-fade-in');
      // Trigger reflow to restart animation
      void mobileLast.offsetWidth;
      mobileLast.classList.add('animate-fade-in');
      console.log('Mobile last entry updated:', mobileLast.textContent);

      // Remove animation class after animation completes
      setTimeout(() => {
        mobileLast.classList.remove('animate-fade-in');
      }, 300);
    } else {
      console.error('Mobile last entry element not found in:', mobileNav);
    }

    // Update total - ensure consistency with history panel
    const mobileTotal = mobileNav.querySelector('.total');
    if (mobileTotal && entry.totalSessionTime !== undefined) {
      mobileTotal.textContent = `Total: ${formatTimeDisplay(entry.totalSessionTime)}`;
      
      // Update animation
      mobileTotal.classList.remove('animate-fade-in');
      void mobileTotal.offsetWidth;
      mobileTotal.classList.add('animate-fade-in');
      
      console.log('Mobile total updated:', mobileTotal.textContent);
    } else {
      console.error('Mobile total element not found or missing totalSessionTime:',
        mobileTotal ? 'Element found but missing totalSessionTime' : 'Element not found',
        'Entry:', entry
      );
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