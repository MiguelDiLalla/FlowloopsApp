/**
 * titlePanel.js - Renders the title and motivational text for FlowLoops
 */

export function initializeTitlePanel() {
  const titlePanel = document.querySelector('.panel.title-text');
  
  if (!titlePanel) {
    console.error('Title panel element not found');
    return;
  }
  
  // Clear existing content
  titlePanel.innerHTML = '';
  
  // Create title container to hold title and install icon
  const titleContainer = document.createElement('div');
  titleContainer.style.display = 'flex';
  titleContainer.style.alignItems = 'center';
  titleContainer.style.gap = '10px';
  titleContainer.className = 'mb-2';
  
  // Create app icon
  const appIcon = document.createElement('img');
  appIcon.src = 'icons/icon-512.png';
  appIcon.alt = 'FlowLoops';
  appIcon.style.height = '70px';
  appIcon.style.width = '70px';
  appIcon.style.borderRadius = '8px';
  
  // Add app icon to the container before the title
  titleContainer.appendChild(appIcon);
  
  // Create title element
  const title = document.createElement('h1');
  title.className = 'text-5xl font-title';
  title.textContent = 'FlowLoops';
  title.style.fontFamily = "'Montagu Slab', serif";
  title.style.fontWeight = "700";
  title.style.fontOpticalSizing = "auto";
  title.style.textAlign = "left";
  
  // Create install icon (only shown when app is not installed)
  const installIcon = document.createElement('button');
  installIcon.id = 'install-icon';
  installIcon.className = 'install-icon';
  installIcon.setAttribute('title', 'Install FlowLoops App');
  installIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
      <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
    </svg>
  `;
  
  // Add elements to the title container
  titleContainer.appendChild(title);
  titleContainer.appendChild(installIcon);
  
  // Create small grey subtitle with linked name
  const subtitleSmallGrey = document.createElement('div');
  subtitleSmallGrey.className = 'text-sm text-gray-50 mt-1';
  subtitleSmallGrey.innerHTML = 'A TimeTeller App, by <a href="https://migueldilalla.github.io/" target="_blank" rel="noopener" style="color: #0d9488; text-decoration: underline;">Miguel Di Lalla</a>';
  subtitleSmallGrey.style.fontFamily = "'Lexend Deca', sans-serif";
  
  // Style the install icon
  Object.assign(installIcon.style, {
    display: 'none', // Hidden by default, will be shown based on install status
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#0d9488',
    padding: '5px',
    borderRadius: '5px',
    transition: 'transform 0.2s, background-color 0.2s'
  });
  
  // Add hover effects
  installIcon.addEventListener('mouseover', () => {
    installIcon.style.transform = 'scale(1.1)';
    installIcon.style.backgroundColor = 'rgba(13, 148, 136, 0.1)';
  });
  
  installIcon.addEventListener('mouseout', () => {
    installIcon.style.transform = 'scale(1)';
    installIcon.style.backgroundColor = 'transparent';
  });
  
  // Append all elements to the panel
  titlePanel.appendChild(titleContainer);
  titlePanel.appendChild(subtitleSmallGrey);
  
  const subtitle = document.createElement('h2');
  subtitle.className = 'text-xl mb-6 text-black/80';
  subtitle.textContent = 'Time is your Friend. Get to know it.';
  subtitle.style.fontFamily = "'Montagu Slab', serif";
  subtitle.style.fontWeight = "600";
  subtitle.style.textAlign = "left";
  
  const description = document.createElement('div');
  description.className = 'text-sm max-w-xs text-black/70';
  description.style.lineHeight = "1.5";
  description.style.fontFamily = "'Lexend Deca', sans-serif";
  
  // Create a proper bullet list
  const bulletList = document.createElement('ul');
  bulletList.style.listStyleType = 'disc';
  bulletList.style.paddingLeft = '1.5rem';
  bulletList.style.marginTop = '0.5rem';
  
  // Add bullet points
  const bulletPoints = [
    "Hit Run to trigger a mystery counter",
    "You can handpick your next focus loop",
    "A new random option will be generated",
    "Track your progress over time"
  ];
  
  bulletPoints.forEach(point => {
    const listItem = document.createElement('li');
    listItem.textContent = point;
    bulletList.appendChild(listItem);
  });
  
  description.appendChild(bulletList);
  
  // Create container for motivational text with typewriter effect
  const motivationalContainer = document.createElement('div');
  motivationalContainer.className = 'motivational-text';
  motivationalContainer.style.textAlign = "left";
  motivationalContainer.style.marginTop = "auto";
  
  // Append all elements to the panel
  titlePanel.appendChild(subtitle);
  titlePanel.appendChild(description);
  titlePanel.appendChild(motivationalContainer);
  
  // Initialize the typewriter effect
  initTypewriterEffect(motivationalContainer);
  
  // Only show install icon if app can be installed
  checkInstallStatus();
  
  return titlePanel;
}

/**
 * Check if the app can be installed and show the install icon accordingly
 */
function checkInstallStatus() {
  // Only show icon if app is not installed yet
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const installIcon = document.getElementById('install-icon');
  
  if (installIcon) {
    // Handler for installation icon
    installIcon.addEventListener('click', () => {
      // Call global installPWA function if available
      if (typeof window.installPWA === 'function') {
        window.installPWA();
      } else {
        console.warn('Install function not available');
      }
    });
    
    // Update visibility of install icon based on app status
    function updateInstallIconVisibility() {
      if (!isStandalone && window.deferredPrompt) {
        installIcon.style.display = 'block';
      } else {
        installIcon.style.display = 'none';
      }
    }
    
    // Initial check
    updateInstallIconVisibility();
    
    // Listen for beforeinstallprompt event to show the icon
    window.addEventListener('beforeinstallprompt', () => {
      updateInstallIconVisibility();
    });
    
    // Listen for appinstalled event to hide the icon
    window.addEventListener('appinstalled', () => {
      installIcon.style.display = 'none';
    });
  }
}

/**
 * Initializes the typewriter effect for motivational quotes
 * @param {HTMLElement} container - The container for the motivational text
 */
function initTypewriterEffect(container) {
  const quotes = [
    "Focus on the flow, not the clock.",
    "One loop at a time.",
    "Progress happens in loops, not lines.",
    "Embrace the randomness of focus.",
    "Less anxiety, more flow.",
    "No pressure, just progress.",
    "Time isn't linear, neither is your work.",
  ];
  
  let currentIndex = 0;
  
  function typeNextQuote() {
    // Clear the container
    container.innerHTML = '';
    
    // Create span for typewriter effect
    const quoteSpan = document.createElement('span');
    quoteSpan.className = 'typewriter';
    quoteSpan.textContent = quotes[currentIndex];
    
    // Add to container
    container.appendChild(quoteSpan);
    
    // Add 'typed' class when typing animation completes
    setTimeout(() => {
      quoteSpan.classList.add('typed');
    }, 2500); // Same as the typing animation duration
    
    // Set timeout for backspace animation
    setTimeout(() => {
      quoteSpan.classList.remove('typed');
      quoteSpan.classList.add('deleting');
    }, 4000); // Start deletion after 4 seconds of display
    
    // Update index for next quote
    currentIndex = (currentIndex + 1) % quotes.length;
    
    // Schedule next quote
    setTimeout(typeNextQuote, 7000); // Change quote every 7 seconds
  }
  
  // Start the cycle
  typeNextQuote();
}

/**
 * Returns a random motivational text for the title panel
 * (Keeping for backward compatibility)
 */
function getRandomMotivationalText() {
  const texts = [
    "Focus on the flow, not the clock.",
    "One loop at a time.",
    "Progress happens in loops, not lines.",
    "Embrace the randomness of focus.",
    "Less anxiety, more flow.",
    "No pressure, just progress.",
    "Time isn't linear, neither is your work.",
  ];
  
  return texts[Math.floor(Math.random() * texts.length)];
}