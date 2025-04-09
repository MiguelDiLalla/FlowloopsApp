/**
 * timerManager.js - Manages timer logic for the FlowLoops app
 * Handles starting, pausing, resetting timers, and generating random intervals
 * Class-based implementation with event dispatching for better integration
 */

import { generateRandomTimers, getRandomIndex } from './randomUtils.js';

/**
 * TimerManager - A class that manages timer logic with event dispatching capabilities
 * @class
 */
export class TimerManager {
  // Private fields using ES2022 syntax
  #currentTimer = null;
  #isRunning = false;
  #startTime = null;
  #pausedTime = null;
  #currentDurationSec = 0;  // Changed to seconds
  #totalSessionTimeSec = 0; // Changed to seconds
  #sessionStartTime = null;
  #remainingMs = 0;
  #notificationManager = null;
  #eventListeners = {};

  /**
   * Creates a new TimerManager instance
   * @param {Object} notificationManager - Optional notification manager to display timer notifications
   */
  constructor(notificationManager = null) {
    this.#notificationManager = notificationManager;
  }

  /**
   * Adds an event listener for timer events
   * @param {string} eventName - Event name ('start', 'pause', 'reset', 'complete')
   * @param {Function} callback - Function to call when event is triggered
   */
  addEventListener(eventName, callback) {
    if (!this.#eventListeners[eventName]) {
      this.#eventListeners[eventName] = [];
    }
    this.#eventListeners[eventName].push(callback);
  }

  /**
   * Removes an event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - The callback to remove
   */
  removeEventListener(eventName, callback) {
    if (!this.#eventListeners[eventName]) return;
    
    this.#eventListeners[eventName] = this.#eventListeners[eventName].filter(
      listener => listener !== callback
    );
  }

  /**
   * Dispatches an event to all registered listeners
   * @private
   * @param {string} eventName - Event name to dispatch
   * @param {Object} data - Event data to pass to listeners
   */
  #dispatchEvent(eventName, data = {}) {
    if (!this.#eventListeners[eventName]) return;
    
    const event = {
      type: eventName,
      target: this,
      data,
      timestamp: new Date()
    };
    
    this.#eventListeners[eventName].forEach(callback => {
      try {
        callback(event);
      } catch (err) {
        console.error(`Error in ${eventName} event listener:`, err);
      }
    });
  }

  /**
   * Generates random timer durations between 120-1260 seconds (2-21 minutes)
   * @param {number} count - Number of timers to generate (default: 8)
   * @returns {Array} Array of random durations in seconds
   */
  generateRandomTimers(count = 8) {
    // Use the centralized random utility
    return generateRandomTimers(count);
  }
  
  /**
   * Picks a random timer from the array and sets it as current duration
   * @param {Array} timers - Array of timer durations in seconds
   * @returns {number} Index of the selected timer
   */
  selectRandom(timers) {
    if (!timers || !timers.length) {
      throw new Error('No timers provided to select from');
    }
    
    const randomIndex = getRandomIndex(timers);
    this.setDuration(timers[randomIndex]);
    return randomIndex;
  }
  
  /**
   * Sets the current timer to the specified duration
   * @param {number} seconds - Duration in seconds
   */
  setDuration(seconds) {
    // Clear any existing timer
    if (this.#currentTimer) {
      clearTimeout(this.#currentTimer);
      this.#currentTimer = null;
    }
    
    // Set new timer duration in seconds
    this.#currentDurationSec = seconds;
    this.#remainingMs = seconds * 1000;
    
    // If we're already running, start the new timer
    if (this.#isRunning) {
      this.start();
    }
    
    this.#dispatchEvent('durationChange', { seconds });
  }
  
  /**
   * Starts the current timer
   */
  start() {
    // Don't do anything if already running
    if (this.#isRunning) {
      return;
    }
    
    // Initialize session start time if this is the first timer
    if (!this.#sessionStartTime) {
      this.#sessionStartTime = new Date();
      this.#totalSessionTimeSec = 0;
    }
    
    // Set running state
    this.#isRunning = true;
    this.#startTime = new Date();
    
    // Handle case where timer was paused
    if (this.#pausedTime) {
      this.#pausedTime = null;
    }
    
    // If no duration is set, don't start timer
    if (this.#currentDurationSec <= 0) {
      return;
    }
    
    // Set timeout for timer completion
    this.#currentTimer = setTimeout(() => {
      this.#timerComplete();
    }, this.#remainingMs);
    
    this.#dispatchEvent('start', { 
      duration: this.#currentDurationSec, 
      remaining: this.#remainingMs 
    });
  }
  
  /**
   * Pauses the current timer
   */
  pause() {
    // Don't do anything if not running
    if (!this.#isRunning) {
      return;
    }
    
    // Update state
    this.#isRunning = false;
    this.#pausedTime = new Date();
    
    // Calculate remaining time
    if (this.#startTime) {
      const elapsedMs = new Date() - this.#startTime;
      this.#remainingMs = Math.max(0, this.#remainingMs - elapsedMs);
    }
    
    // Clear the current timer
    if (this.#currentTimer) {
      clearTimeout(this.#currentTimer);
      this.#currentTimer = null;
    }
    
    this.#dispatchEvent('pause', { 
      duration: this.#currentDurationSec, 
      remaining: this.#remainingMs 
    });
  }
  
  /**
   * Resets the current timer and total session
   */
  reset() {
    // Clear any running timer
    if (this.#currentTimer) {
      clearTimeout(this.#currentTimer);
      this.#currentTimer = null;
    }
    
    // Reset state
    this.#isRunning = false;
    this.#startTime = null;
    this.#pausedTime = null;
    this.#currentDurationSec = 0;
    this.#remainingMs = 0;
    this.#totalSessionTimeSec = 0;
    this.#sessionStartTime = null;
    
    this.#dispatchEvent('reset', {});
  }
  
  /**
   * Handles timer completion
   * @private
   */
  #timerComplete() {
    console.log('Timer complete - current duration:', this.#currentDurationSec, 
                'previous total:', this.#totalSessionTimeSec);
    
    // Update total session time (ensure it's treated as a number)
    const prevTotal = this.#totalSessionTimeSec;
    this.#totalSessionTimeSec = Number(this.#totalSessionTimeSec || 0) + Number(this.#currentDurationSec || 0);
    
    console.log('New total session time:', this.#totalSessionTimeSec);
    
    // Trigger notification
    if (this.#notificationManager) {
      // Simplified message to allow the notificationManager to append quotes
      this.#notificationManager.notify(
        'Timer Complete!',
        `Your ${this.#formatTimeMinSec(this.#currentDurationSec)} loop is done. Total: ${this.#formatTimeMinSec(this.#totalSessionTimeSec)}`
      );
    }
    
    // Reset current timer state but KEEP the running state
    this.#currentTimer = null;
    this.#remainingMs = 0;
    
    // Dispatch completion event
    this.#dispatchEvent('complete', {
      duration: this.#currentDurationSec,
      totalTime: this.#totalSessionTimeSec
    });
  }
  
  /**
   * Formats seconds into MM:SS format (minute:seconds)
   * @private
   * @param {number} seconds - Seconds to format
   * @returns {string} Formatted time string (00:00)
   */
  #formatTimeMinSec(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    
    // Always return in MM:SS format, with leading zeros
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Gets the current state of the timer
   * @returns {Object} Current timer state
   */
  getState() {
    return {
      isRunning: this.#isRunning,
      currentDurationSec: this.#currentDurationSec,
      totalSessionTimeSec: this.#totalSessionTimeSec,
      remainingMs: this.remainingMs,
      elapsedMs: this.#startTime && this.#isRunning ? 
        (new Date() - this.#startTime) : 0,
      sessionActive: Boolean(this.#sessionStartTime)
    };
  }
  
  // Public getters for common properties
  
  /**
   * Check if timer is currently running
   * @returns {boolean} True if timer is running
   */
  get isRunning() {
    return this.#isRunning;
  }
  
  /**
   * Get current timer duration in seconds
   * @returns {number} Current duration in seconds
   */
  get currentDuration() {
    return this.#currentDurationSec;
  }
  
  /**
   * Get total session time in seconds
   * @returns {number} Total session time in seconds
   */
  get totalSessionTime() {
    return this.#totalSessionTimeSec;
  }
  
  /**
   * Get remaining time in milliseconds
   * @returns {number} Remaining time in ms
   */
  get remainingMs() {
    // If not running, just return the stored value
    if (!this.#isRunning) {
      return this.#remainingMs;
    }
    
    // If there's no active timer (between timers) or no start time, return 0
    if (!this.#currentTimer || !this.#startTime) {
      return 0;
    }
    
    // Calculate current remaining time if running with an active timer
    const elapsedMs = new Date() - this.#startTime;
    return Math.max(0, this.#remainingMs - elapsedMs);
  }

  /**
   * Format a time in seconds to a display string (MM:SS)
   * @param {number} seconds - Time in seconds to format
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    return this.#formatTimeMinSec(seconds);
  }
}

// Legacy support for older code
export function initializeTimerManager(notificationManager) {
  const timerManager = new TimerManager(notificationManager);
  
  return {
    generateRandomTimers: (count) => timerManager.generateRandomTimers(count),
    selectRandomTimer: (timers) => timerManager.selectRandom(timers),
    
    // Updated to expect seconds
    setTimer: (seconds) => timerManager.setDuration(seconds),
    startTimer: () => timerManager.start(),
    pauseTimer: () => timerManager.pause(),
    resetTimer: () => timerManager.reset(),
    
    // Session management methods
    startSession: () => timerManager.start(),
    pauseSession: () => timerManager.pause(),
    
    // Format time
    formatTime: (seconds) => timerManager.formatTime(seconds),
    
    // Add complete reset function for debug panel
    resetAllTimers: () => {
      // Reset the timer
      timerManager.reset();
      
      // Reset session state in buttonsPanel if it exists
      const buttonsPanel = document.querySelector('.panel.buttons');
      if (buttonsPanel && buttonsPanel._buttonsPanelInstance && buttonsPanel._buttonsPanelInstance.resetSession) {
        buttonsPanel._buttonsPanelInstance.resetSession();
      }
      
      // Clear history sidebar
      const logContainer = document.querySelector('#log-container');
      if (logContainer) {
        logContainer.innerHTML = '';
      }
      
      // Reset total time display
      const totalElements = document.querySelectorAll('.total');
      totalElements.forEach(el => {
        el.textContent = 'Total: 00:00';
      });
      
      // Reset mobile navigation
      const mobileLast = document.querySelector('.mobile-nav .last-entry');
      if (mobileLast) {
        mobileLast.textContent = '';
      }
      
      // Reset button states if needed
      const runPauseBtn = document.getElementById('run-pause-btn');
      if (runPauseBtn) {
        runPauseBtn.textContent = 'Run';
        runPauseBtn.classList.remove('running');
      }
      
      // Disable buttons
      const buttons = document.querySelectorAll('.button-grid button');
      buttons.forEach(button => {
        button.disabled = true;
        button.classList.remove('active');
        button.textContent = '--:--';
        delete button.dataset.seconds;
      });
      
      console.log('Timer and UI completely reset');
    },
    
    set onTimerComplete(callback) {
      // Remove any existing listener
      timerManager.removeEventListener('complete', timerManager._legacyCallback);
      
      // Store the callback
      timerManager._legacyCallback = (event) => {
        callback(event.data.duration, event.data.totalTime);
      };
      
      // Add the listener
      timerManager.addEventListener('complete', timerManager._legacyCallback);
    },
    
    get isRunning() {
      return timerManager.isRunning;
    },
    
    get currentDuration() {
      return timerManager.currentDuration;
    },
    
    get totalSessionTime() {
      return timerManager.totalSessionTime;
    },
    
    // Added getState to expose internal state for debugging
    getState: () => timerManager.getState()
  };
}