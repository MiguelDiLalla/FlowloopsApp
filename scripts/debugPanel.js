/**
 * debugPanel.js - Creates a debug panel for FlowLoops
 * Hard-coded to be visible for development purposes
 */

// Global debug state
let isDebugMode = true; // Start with debug mode ON
let isFastMode = false;
let updateInterval = null;
let debugPanelElement = null;

/**
 * Initialize the debug panel
 * @param {Object} timerManager - The timer manager instance
 * @returns {Object} Debug panel control methods
 */
export function initializeDebugPanel(timerManager) {
  // // Add this line at the beginning to toggle off the debug panel 
  // return { toggle: () => {}, isVisible: () => false }; // Return dummy functions
    
  // Create debug panel (visible by default for development)
  createDebugPanel();
  
  // Setup alternative keyboard shortcut (Alt+D)
  setupKeyboardShortcut();
  
  // Start the update interval immediately
  updateInterval = setInterval(() => {
    updateDebugInfo(timerManager);
  }, 200); // Update 5 times per second
  
  // Intercept the timer generation method to override values in fast mode
  if (timerManager && timerManager.generateRandomTimers) {
    const originalGenerateRandomTimers = timerManager.generateRandomTimers;
    timerManager.generateRandomTimers = (count) => {
      const timers = originalGenerateRandomTimers(count);
      // If fast mode is enabled, override all timer values to 5 seconds
      if (isFastMode) {
        return timers.map(() => 5);
      }
      return timers;
    };
  }
  
  // Also intercept the button panel timer generation by adding a global event listener
  document.addEventListener('click', (e) => {
    if (isFastMode && e.target && e.target.classList && 
        e.target.classList.contains('flowloop-button') && 
        timerManager) {
      // If a flow loop button was clicked in fast mode, override the button's value
      setTimeout(() => {
        if (e.target.dataset && e.target.dataset.seconds) {
          const newValue = 5; // 5 seconds in fast mode
          e.target.dataset.seconds = newValue.toString();
          
          if (timerManager.formatTime) {
            e.target.textContent = timerManager.formatTime(newValue);
          } else {
            e.target.textContent = formatTimeDisplay(newValue);
          }
          
          console.log('Fast mode: Overrode button value to 5 seconds');
        }
      }, 10);
    }
  }, true);
  
  // Create interface for other modules
  return {
    toggle: toggleDebugPanel,
    setFastMode,
    isDebugMode: () => isDebugMode,
    isFastMode: () => isFastMode,
  };
  
  /**
   * Creates the debug panel element
   */
  function createDebugPanel() {
    // Create panel if it doesn't exist
    if (!debugPanelElement) {
      debugPanelElement = document.createElement('div');
      debugPanelElement.id = 'debug-panel';
      debugPanelElement.className = 'debug-panel';
      
      // Style the debug panel
      Object.assign(debugPanelElement.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '300px',
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: '9999',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto',
        maxHeight: '80vh'
      });
      
      // Create content
      debugPanelElement.innerHTML = `
        <h3 style="color: #00ff00; margin: 0 0 10px 0;">FlowLoops Debug Panel</h3>
        <div>
          <label>
            <input type="checkbox" id="debug-fast-mode"> Fast Mode (5 sec timers)
          </label>
        </div>
        <div style="font-size: 10px; margin-top: 5px; color: #aaa;">
          Toggle panel: Alt+D
        </div>
        <div id="debug-timer-info" style="margin-top: 15px;">
          <div>Status: <span id="debug-timer-status">-</span></div>
          <div>Current Duration: <span id="debug-timer-duration">-</span></div>
          <div>Remaining: <span id="debug-timer-remaining">-</span></div>
          <div>Total Session Time: <span id="debug-timer-total">-</span></div>
        </div>
        <div style="margin-top: 15px; display: flex; gap: 5px;">
          <button id="debug-force-complete" style="background: #333; color: #00ff00; border: 1px solid #00ff00; padding: 5px 10px;">
            Force Complete (2s)
          </button>
          <button id="debug-reset-all" style="background: #333; color: #ff6666; border: 1px solid #ff6666; padding: 5px 10px;">
            Reset All
          </button>
        </div>
      `;
      
      document.body.appendChild(debugPanelElement);
      
      // Set up fast mode toggle
      const fastModeCheckbox = document.getElementById('debug-fast-mode');
      fastModeCheckbox.checked = isFastMode;
      fastModeCheckbox.addEventListener('change', (e) => {
        setFastMode(e.target.checked);
      });
      
      // Set up force complete button
      const forceCompleteButton = document.getElementById('debug-force-complete');
      forceCompleteButton.addEventListener('click', () => {
        if (timerManager) {
          try {
            console.log('Force Complete button clicked');
            
            // Use the exact same pattern as the grid buttons
            const seconds = 2; // Fixed at 2 seconds
            
            // Make sure the UI shows running state
            const runPauseBtn = document.getElementById('run-pause-btn');
            if (runPauseBtn) {
              runPauseBtn.textContent = 'Pause';
              runPauseBtn.classList.add('running');
            }
            
            // First stop any existing timer
            timerManager.pauseSession();
            
            // Set and start the new timer with 2 seconds
            console.log(`Setting timer to ${seconds} seconds (force complete)`);
            timerManager.setTimer(seconds);
            console.log(`Starting timer session...`);
            timerManager.startSession();
            
            // Enable all buttons in the grid
            const buttons = document.querySelectorAll('.button-grid button');
            buttons.forEach(btn => {
              btn.disabled = false;
              btn.classList.add('active');
            });
            
            console.log('Force Complete processing complete');
          } catch (error) {
            console.error("Error in force complete button:", error);
            // Fallback
            timerManager.setTimer(2);
            timerManager.startSession();
          }
        }
      });

      // Set up reset all button
      const resetAllButton = document.getElementById('debug-reset-all');
      resetAllButton.addEventListener('click', () => {
        if (timerManager) {
          timerManager.resetAllTimers();
          console.log('All timers have been reset.');
        }
      });
    }
  }
  
  /**
   * Sets up keyboard shortcut (Alt+D) to toggle debug panel
   */
  function setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Alt+D - easier shortcut that doesn't conflict with browser functions
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        toggleDebugPanel();
      }
    });
  }
  
  /**
   * Toggles the debug panel visibility
   */
  function toggleDebugPanel() {
    isDebugMode = !isDebugMode;
    
    if (isDebugMode) {
      // Show panel
      debugPanelElement.style.display = 'block';
      
      // Start update interval if not already running
      if (!updateInterval) {
        updateInterval = setInterval(() => {
          updateDebugInfo(timerManager);
        }, 200);
      }
    } else {
      // Hide panel
      debugPanelElement.style.display = 'none';
      
      // Stop update interval
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    }
    
    console.log(`Debug mode ${isDebugMode ? 'enabled' : 'disabled'}`);
    return isDebugMode;
  }
  
  /**
   * Updates debug panel with current timer information
   */
  function updateDebugInfo(timerManager) {
    if (!isDebugMode || !timerManager) return;

    // Get the state from the timer manager
    const state = timerManager.getState ? timerManager.getState() : {
      isRunning: timerManager.isRunning,
      currentDurationSec: timerManager.currentDuration, // Now in seconds
      totalSessionTimeSec: timerManager.totalSessionTime, // Now in seconds
      remainingMs: timerManager.remainingMs || 0
    };

    // Update status
    document.getElementById('debug-timer-status').textContent = 
      state.isRunning ? 'RUNNING' : 'STOPPED';

    // Update current duration (always in seconds now)
    document.getElementById('debug-timer-duration').textContent = 
      `${state.currentDurationSec}s`;

    // Update remaining time - calculate actual remaining time in real-time
    let remainingMs = state.remainingMs; // Use state.remainingMs consistently
    let remainingSec = Math.floor(remainingMs / 1000);
    let formattedMin = Math.floor(remainingSec / 60);
    let formattedSec = (remainingSec % 60).toString().padStart(2, '0');

    document.getElementById('debug-timer-remaining').textContent = 
      `${remainingSec}s (${formattedMin}:${formattedSec})`;

    // Update total time (always in seconds now)
    document.getElementById('debug-timer-total').textContent = 
      `${state.totalSessionTimeSec}s`;

    // Update panel color based on timer state
    if (state.isRunning) {
      document.getElementById('debug-timer-status').style.color = '#00ff00';
    } else {
      document.getElementById('debug-timer-status').style.color = '#ff6666';
    }
  }
  
  /**
   * Sets fast mode - in fast mode, all timer values will be 5 seconds
   * @param {boolean} enabled - Whether fast mode should be enabled
   */
  function setFastMode(enabled) {
    isFastMode = enabled;
    
    // Update the checkbox if it exists
    const checkbox = document.getElementById('debug-fast-mode');
    if (checkbox) {
      checkbox.checked = isFastMode;
    }
    
    // Add a class to document.body for CSS styling changes
    if (isFastMode) {
      document.body.classList.add('debug-fast-mode');
    } else {
      document.body.classList.remove('debug-fast-mode');
    }
    
    // Override current timer if timer is active
    if (isFastMode && timerManager && timerManager.isRunning) {
      if (typeof timerManager.setDuration === 'function') {
        timerManager.setDuration(5);
      } else if (typeof timerManager.setTimer === 'function') {
        timerManager.setTimer(5);
      }
    }
    
    console.log(`Fast mode ${isFastMode ? 'enabled' : 'disabled'} (all timers set to 5 seconds)`);
    
    return isFastMode;
  }
  
  /**
   * Formats seconds into MM:SS format
   * @param {number} seconds - Seconds to format
   * @returns {string} Formatted time string (00:00)
   */
  function formatTimeDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}