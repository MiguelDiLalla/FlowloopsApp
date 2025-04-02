/**
 * buttonsPanel.js - Renders and manages the interactive button grid
 */

export function initializeButtonsPanel(timerManager) {
  const buttonsPanel = document.querySelector('.panel.buttons');
  
  if (!buttonsPanel) {
    console.error('Buttons panel element not found');
    return;
  }
  
  // Set the button panel background color to Tailwind's red-50
  buttonsPanel.style.backgroundColor = '#fef2f2';
  
  // Clear existing content
  buttonsPanel.innerHTML = '';
  
  // Create container for buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons-container';
  
  // Create container for button grid
  const buttonGrid = document.createElement('div');
  buttonGrid.className = 'button-grid';
  
  // State tracking variables
  let isRunning = false;
  let isFirstRun = true; // Track if this is the first time running in the session
  let timerValues = []; // Store the timer values for the session
  let activeTimerIndex = -1; // Track which timer is currently active
  let isMuted = false; // Track mute state for sound effects
  
  // Create the 7 timer buttons
  for (let i = 0; i < 7; i++) {
    const button = createTimerButton(i);
    buttonGrid.appendChild(button);
  }
  
  // Create run/pause button
  const runPauseButton = document.createElement('button');
  runPauseButton.className = 'run-pause-button';
  runPauseButton.textContent = 'Run';
  runPauseButton.id = 'run-pause-btn';
  
  // Create container for run and mute buttons
  const controlButtonsContainer = document.createElement('div');
  controlButtonsContainer.className = 'control-buttons-container';
  controlButtonsContainer.style.display = 'flex';
  controlButtonsContainer.style.alignItems = 'center';
  controlButtonsContainer.style.justifyContent = 'center';
  controlButtonsContainer.style.gap = '10px';
  controlButtonsContainer.style.flexDirection = 'column';
  controlButtonsContainer.style.alignItems = 'center';
  
  // Create mute button
  const muteButton = document.createElement('button');
  muteButton.className = 'mute-button';
  muteButton.id = 'mute-btn';
  muteButton.setAttribute('title', 'Toggle sound effects');
  muteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4-9.4-24.6-9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/>
    </svg>
  `;
  
  // Style the mute button
  Object.assign(muteButton.style, {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9', // Light gray
    color: '#0d9488', // Teal color
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px',
    transition: 'all 0.2s ease'
  });
  
  // Add click handler for mute button
  muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    updateMuteButtonState();
    
    // Store the mute preference in localStorage for persistence
    try {
      localStorage.setItem('flowloops_muted', isMuted ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save mute preference:', error);
    }
  });
  
  // Add hover effects
  muteButton.addEventListener('mouseover', () => {
    muteButton.style.transform = 'scale(1.1)';
  });
  
  muteButton.addEventListener('mouseout', () => {
    muteButton.style.transform = 'scale(1)';
  });
  
  // Function to update mute button appearance based on state
  function updateMuteButtonState() {
    if (isMuted) {
      muteButton.style.backgroundColor = '#f43f5e'; // Rose color
      muteButton.style.color = 'white';
    } else {
      muteButton.style.backgroundColor = '#f1f5f9'; // Light gray
      muteButton.style.color = '#0d9488'; // Teal color
    }
  }
  
  // Load mute preference from localStorage
  try {
    isMuted = localStorage.getItem('flowloops_muted') === 'true';
    updateMuteButtonState();
  } catch (error) {
    console.error('Failed to load mute preference:', error);
  }
  
  // Add click handler for run/pause button
  runPauseButton.addEventListener('click', () => {
    isRunning = !isRunning;
    
    if (isRunning) {
      runPauseButton.textContent = 'Pause';
      runPauseButton.classList.add('running');
      playSound('click');
      
      if (isFirstRun) {
        // First time run - generate new timer values
        startNewSession();
        isFirstRun = false;
      } else {
        // Resuming from pause - keep the existing values
        resumeSession();
      }
    } else {
      // Pausing the session
      runPauseButton.textContent = 'Run';
      runPauseButton.classList.remove('running');
      playSound('click');
      
      // Pause session and hide button values
      pauseSession();
    }
  });
  
  /**
   * Creates a timer button with the given index - moved inside the initializeButtonsPanel scope
   * to access the isRunning state properly
   */
  function createTimerButton(index) {
    const button = document.createElement('button');
    button.className = 'flowloop-button mystery-button';
    button.dataset.index = index;

    // Initial state - mystery value
    button.textContent = '--:--';

    // Add click handler
    button.addEventListener('click', () => {
      if (timerManager) {
        try {
          // Debug logging to track execution
          console.log(`Button ${index} clicked - START`);
          
          // Use the displayed seconds value from the button if available
          let seconds;
          
          if (button.dataset.seconds) {
            // Use the value that was already displayed on the button
            seconds = parseInt(button.dataset.seconds, 10);
            console.log(`Using existing value from button: ${seconds} seconds`);
          } else {
            // Generate a new timer value only if no value was displayed
            seconds = Math.floor(Math.random() * 1141) + 120;
            console.log(`Generated new value: ${seconds} seconds`);
            // Store it immediately so we have a valid value
            button.dataset.seconds = seconds.toString();
          }
          
          // Make sure the running state is set and UI reflects this
          isRunning = true;
          runPauseButton.textContent = 'Pause';
          runPauseButton.classList.add('running');
          
          // IMPORTANT: First stop any existing timer and then set and start the new one
          timerManager.pauseSession(); // Ensure any running timer is stopped first
          
          // Now set and start the new timer with the correct duration
          console.log(`Setting timer to ${seconds} seconds`);
          timerManager.setTimer(seconds);
          console.log(`Starting timer session...`);
          timerManager.startSession();
          
          // Generate a new random value for next time this button is clicked
          const newSeconds = Math.floor(Math.random() * 1141) + 120;
          console.log(`Generated future value for this button: ${newSeconds} seconds`);
          
          // Update the button with the new value
          if (timerManager.formatTime) {
            button.textContent = timerManager.formatTime(newSeconds);
          } else {
            button.textContent = formatTimeDisplay(newSeconds);
          }
          
          // Store the new value for next time
          button.dataset.seconds = newSeconds.toString();
          
          // Update all buttons state to be enabled
          updateButtonStates(true, true);
          
          playSound('gears');
          console.log(`Button ${index} click handler complete`);
        } catch (error) {
          console.error("Error in button click handler:", error);
          // Fallback for error cases
          timerManager.setTimer(300);
          timerManager.startSession();
        }
      }
    });

    return button;
  }
  
  /**
   * Starts a new timer session with fresh values
   */
  function startNewSession() {
    if (timerManager) {
      // Generate new timer values
      timerValues = timerManager.generateRandomTimers(7);
      
      // Choose a random timer to start with
      activeTimerIndex = Math.floor(Math.random() * 7);
      
      // Enable all buttons and show values
      updateButtonStates(true);
      
      // Set the timer with the selected random value
      timerManager.setTimer(timerValues[activeTimerIndex]);
      timerManager.startSession();
    }
  }
  
  /**
   * Resumes a paused session with existing values
   */
  function resumeSession() {
    // Restore button states using existing values
    updateButtonStates(true, false); // true for running, false for don't regenerate
    
    // Restart the timer
    if (timerManager) {
      timerManager.startSession();
    }
  }
  
  /**
   * Pauses the current session
   */
  function pauseSession() {
    // Disable buttons and hide values
    updateButtonStates(false, false); // false for not running, false for not keeping values
    
    // Notify timer manager
    if (timerManager) {
      timerManager.pauseSession();
    }
  }
  
  // Append elements to containers
  controlButtonsContainer.appendChild(muteButton);
  controlButtonsContainer.appendChild(runPauseButton);
  buttonsContainer.appendChild(buttonGrid);
  buttonsContainer.appendChild(controlButtonsContainer);
  buttonsPanel.appendChild(buttonsContainer);
  
  /**
   * Updates button states based on running state
   * @param {boolean} running - Whether the session is running
   * @param {boolean} keepValues - Whether to keep existing values (true) or regenerate (false)
   */
  function updateButtonStates(running, keepValues = false) {
    const buttons = buttonGrid.querySelectorAll('button');
    
    buttons.forEach((button, index) => {
      button.disabled = !running;
      
      if (running) {
        button.classList.add('active');
        
        // Generate or use existing values
        if (!keepValues || !button.dataset.seconds) {
          // Generate a timer value if needed
          const seconds = timerValues[index] || Math.floor(Math.random() * 1081) + 120;
          button.textContent = formatTimeDisplay(seconds);
          
          // Store the seconds value as a data attribute
          button.dataset.seconds = seconds.toString();
          
          // Save in our stored values array
          timerValues[index] = seconds;
        }
      } else {
        // When paused
        button.classList.remove('active');
        
        if (!keepValues) {
          // Hide values if not keeping them
          button.textContent = '--:--';
          delete button.dataset.seconds;
        }
      }
    });
  }
  
  // Initialize button states (disabled by default)
  updateButtonStates(false);
  
  // Store the instance on the DOM element itself for easy access from playSound
  buttonsPanel._buttonsPanelInstance = {
    isMuted: () => isMuted
  };
  
  return {
    panel: buttonsPanel,
    updateButtonStates,
    isRunning: () => isRunning,
    isMuted: () => isMuted,
    setRunning: (state) => {
      isRunning = state;
      if (state) {
        if (isFirstRun) {
          startNewSession();
          isFirstRun = false;
        } else {
          resumeSession();
        }
      } else {
        pauseSession();
      }
      runPauseButton.textContent = state ? 'Pause' : 'Run';
      runPauseButton.classList.toggle('running', state);
    },
    resetSession: () => {
      isFirstRun = true;
      timerValues = [];
      activeTimerIndex = -1;
      updateButtonStates(false);
    }
  };
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

/**
 * Plays a sound effect
 */
function playSound(soundName) {
  // Check for mute setting directly
  try {
    const buttonsPanel = document.querySelector('.panel.buttons');
    
    // First try to access via stored instance
    if (buttonsPanel && buttonsPanel._buttonsPanelInstance && 
        typeof buttonsPanel._buttonsPanelInstance.isMuted === 'function' && 
        buttonsPanel._buttonsPanelInstance.isMuted()) {
      // Skip playing sound if muted
      console.log('Sound muted, not playing:', soundName);
      return;
    }
    
    // Otherwise try to play the sound
    console.log('Playing sound:', soundName);
    let sound = new Audio(`./sounds/${soundName}.wav`);
    sound.play().catch(() => {
      sound = new Audio(`./sounds/${soundName}.mp3`);
      sound.play().catch(console.error);
    });
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
}