// FlowLoops main entry point
const DEBUG_MODE = true;

// Import modules
import { initializeTitlePanel } from './panels/titlePanel.js';
import { initializeButtonsPanel } from './panels/buttonsPanel.js';
import { initializeHistorySidebar } from './panels/historySidebar.js';
import { initializeTimerManager } from './timerManager.js';
import { initializeNotifications, NotificationManager } from './notificationManager.js';
import { initializeDebugPanel } from './debugPanel.js';
import { configureNotificationManagerWithQuotes } from './quoteUtils.js'; // New import

// PWA installation support
let deferredPrompt;
let isInstallPromptVisible = false; // Installation prompt visibility flag (false by default)
let installContainer = null; // Reference to installation container

// Global PWA status flag
window.isStandalone = window.matchMedia('(display-mode: standalone)').matches;

// Make deferredPrompt and installPWA available globally for the install icon
window.deferredPrompt = null;

/**
 * Initialize the application
 * @returns {Object} Core service instances for testing and reuse
 */
async function initApp() {
  if (DEBUG_MODE) console.log('FlowLoops App Initializing...');
  
  // Store service instances for potential export
  const services = {};
  
  // Initialize PWA installation handler
  initializePWASupport();
  
  // Initialize core services
  let notificationManager, timerManager;
  
  try {
    notificationManager = initializeNotifications();
    if (DEBUG_MODE) console.log('Notification manager initialized');
    
    // Configure notification manager with quotes
    try {
      await configureNotificationManagerWithQuotes(
        notificationManager, 
        './quote-sets/flowloops-quotes.json',
        true // Enable quotes by default
      );
      if (DEBUG_MODE) console.log('Quotes loaded and enabled for notifications');
    } catch (error) {
      console.error('Failed to configure quotes for notifications:', error);
    }
    
    services.notificationManager = notificationManager;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    notificationManager = null;
  }
  
  try {
    timerManager = initializeTimerManager(notificationManager);
    if (DEBUG_MODE) console.log('Timer manager initialized');
    services.timerManager = timerManager;
  } catch (error) {
    console.error('Failed to initialize timer manager:', error);
    timerManager = null;
  }
  
  // Initialize UI panels
  try {
    initializeTitlePanel();
    if (DEBUG_MODE) console.log('Title panel initialized');
  } catch (error) {
    console.error('Failed to initialize title panel:', error);
  }
  
  try {
    initializeButtonsPanel(timerManager);
    if (DEBUG_MODE) console.log('Buttons panel initialized');
  } catch (error) {
    console.error('Failed to initialize buttons panel:', error);
  }
  
  try {
    initializeHistorySidebar(timerManager);
    if (DEBUG_MODE) console.log('History sidebar initialized');
  } catch (error) {
    console.error('Failed to initialize history sidebar:', error);
  }
  
  // Initialize debug panel (hidden by default)
  try {
    const debugPanel = initializeDebugPanel(timerManager);
    services.debugPanel = debugPanel;
    if (DEBUG_MODE) console.log('Debug panel initialized (toggle with Ctrl+Shift+D)');
  } catch (error) {
    console.error('Failed to initialize debug panel:', error);
  }

  if (DEBUG_MODE) console.log('FlowLoops App Initialized');
  
  return services;
}

/**
 * Initialize PWA installation support
 */
function initializePWASupport() {
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 76+ from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    window.deferredPrompt = e; // Also set on window for global access
    
    if (DEBUG_MODE) console.log('App is installable, saved install prompt');
    
    // Show custom install button in the UI
    showInstallPromotion();
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    // Log app installed
    if (DEBUG_MODE) console.log('FlowLoops app was installed');
    
    // Hide install promotion
    hideInstallPromotion();
    
    // Update standalone status flag
    window.isStandalone = true;
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    window.deferredPrompt = null; // Also clear from window
  });
  
  // Check if app is launched in standalone mode (PWA)
  if (window.isStandalone) {
    if (DEBUG_MODE) console.log('App launched in standalone mode (PWA)');
  }
  
  // Listen for display mode changes
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    window.isStandalone = e.matches;
    if (DEBUG_MODE) console.log(`Display mode changed, standalone: ${window.isStandalone}`);
  });
  
  // Setup keyboard shortcut for install prompt (Alt+I)
  setupInstallKeyboardShortcut();
  
  // Make installPWA available globally
  window.installPWA = installPWA;
}

/**
 * Sets up keyboard shortcut (Alt+I) to toggle install prompt
 */
function setupInstallKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    // Alt+I shortcut for install prompt
    if (e.altKey && e.key === 'i' && deferredPrompt) {
      e.preventDefault();
      toggleInstallPromotion();
    }
  });
}

/**
 * Toggle installation promotion visibility
 * @returns {boolean} Current visibility state
 */
function toggleInstallPromotion() {
  if (window.isStandalone) return false; // Don't show if already installed
  
  isInstallPromptVisible = !isInstallPromptVisible;
  
  // Find or create the install container
  installContainer = document.getElementById('install-container') || createInstallContainer();
  
  if (isInstallPromptVisible) {
    installContainer.style.display = 'flex';
  } else {
    installContainer.style.display = 'none';
  }
  
  console.log(`Install promotion ${isInstallPromptVisible ? 'shown' : 'hidden'}`);
  return isInstallPromptVisible;
}

/**
 * Show installation promotion UI
 */
function showInstallPromotion() {
  // Don't show if already installed
  if (window.isStandalone) return;
  
  // Find or create the install button container in the UI
  installContainer = document.getElementById('install-container') || createInstallContainer();
  
  // Keep it hidden by default - user must explicitly toggle it
  // isInstallPromptVisible remains false
  if (installContainer) {
    installContainer.style.display = 'none';
  }
}

/**
 * Create install promotion container if it doesn't exist
 * @returns {HTMLElement} The created container element
 */
function createInstallContainer() {
  const container = document.createElement('div');
  container.id = 'install-container';
  
  // Style similar to debug panel, positioned top-right like the debug panel
  Object.assign(container.style, {
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
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  });
  
  // Create content with big buttons
  container.innerHTML = `
    <h3 style="color: #00ff00; margin: 0 0 10px 0;">Install FlowLoops App</h3>
    <p style="margin: 0 0 15px 0;">Add FlowLoops to your home screen for a better experience!</p>
    <div style="font-size: 10px; margin-top: 5px; color: #aaa;">Toggle panel: Alt+I</div>
    <div style="display: flex; gap: 10px;">
      <button id="install-button" style="flex: 1; background: #0d9488; color: white; border: none; padding: 12px 5px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer;">YES!</button>
      <button id="dismiss-install" style="flex: 1; background: #475569; color: white; border: none; padding: 12px 5px; font-size: 14px; font-weight: bold; border-radius: 5px; cursor: pointer;">not today mate</button>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Add hover effects for buttons
  const installButton = document.getElementById('install-button');
  const dismissButton = document.getElementById('dismiss-install');
  
  // Install button hover effects
  installButton.addEventListener('mouseover', () => {
    installButton.style.backgroundColor = '#0f766e';
    installButton.style.transform = 'scale(1.05)';
  });
  
  installButton.addEventListener('mouseout', () => {
    installButton.style.backgroundColor = '#0d9488';
    installButton.style.transform = 'scale(1)';
  });
  
  // Dismiss button hover effects
  dismissButton.addEventListener('mouseover', () => {
    dismissButton.style.backgroundColor = '#334155';
    dismissButton.style.transform = 'scale(1.05)';
  });
  
  dismissButton.addEventListener('mouseout', () => {
    dismissButton.style.backgroundColor = '#475569';
    dismissButton.style.transform = 'scale(1)';
  });
  
  // Add event listeners for button functionality
  installButton.addEventListener('click', installPWA);
  dismissButton.addEventListener('click', hideInstallPromotion);
  
  // Add transition for smoother appearance/disappearance
  container.style.transition = 'opacity 0.3s ease';
  
  return container;
}

/**
 * Hide installation promotion UI
 */
function hideInstallPromotion() {
  isInstallPromptVisible = false;
  const container = document.getElementById('install-container');
  if (container) {
    container.style.display = 'none';
  }
}

/**
 * Check if current device is mobile
 * @returns {boolean} True if device is likely mobile
 */
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Trigger the PWA installation flow
 */
function installPWA() {
  if (!deferredPrompt) {
    if (DEBUG_MODE) console.log('No installation prompt available');
    return;
  }
  
  // Show the installation prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      if (DEBUG_MODE) console.log('User accepted the install prompt');
    } else {
      if (DEBUG_MODE) console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt - it can only be used once
    deferredPrompt = null;
  });
}

/**
 * Check Service Worker registration status
 */
function checkServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    if (DEBUG_MODE) console.warn('Service Worker not supported in this browser');
    return;
  }
  
  navigator.serviceWorker.ready
    .then(registration => {
      if (DEBUG_MODE) console.log('Service Worker is active and ready:', registration.active.scriptURL);
    })
    .catch(error => {
      if (DEBUG_MODE) console.warn('Service Worker not yet active:', error);
    });
    
  // Also check if a controller exists
  if (!navigator.serviceWorker.controller) {
    if (DEBUG_MODE) console.warn('Page not controlled by Service Worker (first load)');
  }
}

/**
 * Formats time in minutes to MM:SS format (minute:seconds)
 * @param {number} minutes - Minutes to format
 * @returns {string} Formatted time in MM:SS format with leading zeros
 */
function formatTimeDisplay(minutes) {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  
  // Always return in MM:SS format, with leading zeros
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Add this function to wire components together
function wireComponents(timerManager, buttonsPanel, historySidebar) {
  // Store a reference to the buttonsPanel instance on the DOM element itself
  // This allows other components like timerManager to access it for reset operations
  if (buttonsPanel) {
    const panelElement = document.querySelector('.panel.buttons');
    if (panelElement) {
      panelElement._buttonsPanelInstance = buttonsPanel;
    }
  }
  
  // Set up timer completion handler
  timerManager.onTimerComplete = (duration, totalTime) => {
    // Update history sidebar
    const historyPanel = document.querySelector('.history-sidebar');
    if (historyPanel) {
      const logContainer = historyPanel.querySelector('#log-container');
      if (logContainer) {
        const emoji = ['🍄', '🎯', '🌊', '🔥', '⚡', '🌈', '🧠', '🎨', '🚀'][Math.floor(Math.random() * 9)];
        const entry = document.createElement('div');
        entry.className = 'item animate-fade-in';
        
        // Use the formatTime helper from timerManager if available
        const timeDisplay = timerManager.formatTime ? 
          timerManager.formatTime(duration) : formatTimeDisplay(duration);
          
        entry.textContent = `${emoji} +${timeDisplay}`;
        logContainer.insertBefore(entry, logContainer.firstChild);

        // Update total time
        const totalElement = historyPanel.querySelector('.total');
        if (totalElement) {
          const totalDisplay = timerManager.formatTime ? 
            timerManager.formatTime(totalTime) : formatTimeDisplay(totalTime);
            
          totalElement.textContent = `Total: ${totalDisplay}`;
        }
      }
    }

    // Auto-select a new random button
    setTimeout(() => {
      const buttons = document.querySelectorAll('.button-grid button');
      if (buttons.length > 0) {
        const randomIndex = Math.floor(Math.random() * buttons.length);
        buttons[randomIndex].click();
      }
    }, 1000);
  };
}

// Update DOMContentLoaded to handle async initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the app (now async)
  const services = await initApp();

  // Wire components together with proper instances
  if (services.timerManager) {
    // Store references to UI components
    const buttonsPanel = document.querySelector('.panel.buttons');
    const historySidebar = document.querySelector('.history-sidebar');
    
    // Connect all components
    wireComponents(services.timerManager, buttonsPanel, historySidebar);
  }

  // Check Service Worker status
  setTimeout(checkServiceWorkerStatus, 1000);
});

// Export functions and services for testability or external use
export { initApp, installPWA, isMobileDevice };
