const CACHE_VERSION = '1';
const CACHE_NAME = `flowloops-cache-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// Assets to cache immediately on service worker install
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './offline.html', // Fallback page for offline experience
  './styles/animations.css',
  './styles/main.css',
  './styles/base.css',
  './styles/components.css',
  './styles/layout.css',
  './styles/responsive.css',
  './styles/tailwind.css',
  './scripts/main.js',
  './scripts/notificationManager.js',
  './scripts/timerManager.js',
  './scripts/panels/buttonsPanel.js',
  './scripts/panels/historySidebar.js',
  './scripts/panels/titlePanel.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './sounds/click.mp3',
  './sounds/gears.mp3'
];

/**
 * Log helper function with severity levels
 * @param {string} message - Log message
 * @param {string} level - Log level: 'debug', 'info', 'warn', 'error'
 */
function log(message, level = 'info') {
  const prefix = '[FlowLoops SW]';
  switch (level) {
    case 'debug':
      console.debug(`${prefix} ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    case 'info':
    default:
      console.info(`${prefix} ${message}`);
  }
}

// Install event - cache all static assets
self.addEventListener('install', event => {
  log('Service Worker installing...', 'debug');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        log('Cache opened, adding all static resources to cache', 'info');
        return cache.addAll(urlsToCache)
          .then(() => {
            log('All static resources successfully cached', 'info');
          })
          .catch(error => {
            log(`Failed to cache some resources: ${error}`, 'error');
          });
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  log('Service Worker activating...', 'debug');
  
  // Define which caches to keep (based on current version)
  const cacheWhitelist = [
    STATIC_CACHE_NAME, 
    DYNAMIC_CACHE_NAME
  ];
  
  event.waitUntil(
    Promise.all([
      // Clean up old cache versions
      caches.keys().then(cacheNames => {
        log(`Found ${cacheNames.length} cache(s), checking for outdated versions`, 'debug');
        
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              log(`Deleting outdated cache: ${cacheName}`, 'info');
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim clients so the SW is in control immediately
      self.clients.claim().then(() => {
        log('Service worker has claimed all clients', 'info');
      })
    ])
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    log(`Ignoring non-GET request: ${event.request.method}`, 'debug');
    return;
  }
  
  // Handle API requests differently (if needed in the future)
  // if (event.request.url.includes('/api/')) {
  //   // Network-first strategy for API requests would go here
  //   // This is a stub for future dynamic data handling
  //   return;
  // }
  
  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cache
        if (response) {
          log(`Serving request from cache: ${event.request.url}`, 'debug');
          return response;
        }
        
        log(`Cache miss for: ${event.request.url}, fetching from network`, 'debug');
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache the response
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              log(`Received non-cacheable response for: ${event.request.url}`, 'debug');
              return response;
            }
            
            log(`Caching new response for: ${event.request.url}`, 'debug');
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Store the response in the dynamic cache for future use
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                log(`Failed to cache response: ${error}`, 'error');
              });
            
            return response;
          })
          .catch(error => {
            log(`Network fetch failed for: ${event.request.url}. ${error}`, 'warn');
            
            // For HTML pages (navigation), show offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              log(`Serving offline page for HTML request: ${event.request.url}`, 'info');
              return caches.match('./offline.html');
            }
            
            // For images, return our placeholder SVG
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
              log(`Serving placeholder image for: ${event.request.url}`, 'info');
              return caches.match('./icons/offline-image.svg');
            }
            
            // For other resources, just return a simple error response
            return new Response('Network error occurred', {
              status: 408,
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Optional: Listen for push notifications
self.addEventListener('push', event => {
  log('Push notification received', 'info');
  
  if (!event.data) {
    log('No payload in push event', 'warn');
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Something requires your attention',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || './'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'FlowLoops Notification', 
        options
      )
    );
  } catch (error) {
    log(`Error handling push notification: ${error}`, 'error');
  }
});

// Optional: Handle notification clicks
self.addEventListener('notificationclick', event => {
  log('Notification clicked', 'info');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // URL to open (from the notification data or default)
        const url = event.notification.data?.url || './';
        
        // Check if there's already a window/tab open with this URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no open window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

log('Service Worker registered', 'info');