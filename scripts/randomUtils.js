/**
 * randomUtils.js - Centralized utility for random number generation
 * This allows for consistent random value generation and easy debugging
 */

// Configuration for random timer values (in seconds)
const DEFAULT_MIN_SECONDS = 120;  // 2 minutes
const DEFAULT_MAX_SECONDS = 1260; // 21 minutes

// Debug mode flag (can be set by debug panel)
let debugMode = false;
let debugValue = 5; // Default debug value in seconds

/**
 * Generate a random integer between min and max (inclusive)
 * In debug mode, returns the configured debug value
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 */
export function getRandomInt(min, max) {
  if (debugMode) return debugValue;
  
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random timer duration in seconds
 * Uses the default configured range unless overridden
 * 
 * @param {number} [minSeconds=DEFAULT_MIN_SECONDS] - Minimum seconds (default: 120)
 * @param {number} [maxSeconds=DEFAULT_MAX_SECONDS] - Maximum seconds (default: 1260)
 * @returns {number} Random duration in seconds
 */
export function getRandomTimerDuration(minSeconds = DEFAULT_MIN_SECONDS, maxSeconds = DEFAULT_MAX_SECONDS) {
  return getRandomInt(minSeconds, maxSeconds);
}

/**
 * Generate an array of random timer durations
 * 
 * @param {number} count - Number of random durations to generate
 * @param {number} [minSeconds=DEFAULT_MIN_SECONDS] - Minimum seconds (default: 120)
 * @param {number} [maxSeconds=DEFAULT_MAX_SECONDS] - Maximum seconds (default: 1260)
 * @returns {Array<number>} Array of random durations in seconds
 */
export function generateRandomTimers(count, minSeconds = DEFAULT_MIN_SECONDS, maxSeconds = DEFAULT_MAX_SECONDS) {
  const timers = [];
  for (let i = 0; i < count; i++) {
    timers.push(getRandomTimerDuration(minSeconds, maxSeconds));
  }
  return timers;
}

/**
 * Get a random item from an array
 * 
 * @param {Array} array - The array to select from
 * @returns {*} Random item from the array
 */
export function getRandomItem(array) {
  if (!array || array.length === 0) return null;
  const index = getRandomInt(0, array.length - 1);
  return array[index];
}

/**
 * Get a random index from an array
 * 
 * @param {Array} array - The array to get an index for
 * @returns {number} Random index
 */
export function getRandomIndex(array) {
  if (!array || array.length === 0) return -1;
  return getRandomInt(0, array.length - 1);
}

/**
 * Enable or disable debug mode for random values
 * When debug mode is enabled, all random functions return the debug value
 * 
 * @param {boolean} enabled - Whether debug mode should be enabled
 * @param {number} [value] - The value to return in debug mode (default: 5 seconds)
 */
export function setDebugMode(enabled, value = 5) {
  debugMode = enabled;
  if (value !== undefined) {
    debugValue = value;
  }
  
  console.log(`Random utils debug mode ${enabled ? 'enabled' : 'disabled'}${enabled ? ` (fixed value: ${debugValue})` : ''}`);
  return debugMode;
}

/**
 * Check if debug mode is enabled
 * 
 * @returns {boolean} Whether debug mode is enabled
 */
export function isDebugMode() {
  return debugMode;
}

/**
 * Get the current debug value
 * 
 * @returns {number} Current debug value
 */
export function getDebugValue() {
  return debugValue;
}

// Export default configuration
export const DEFAULT_CONFIG = {
  MIN_SECONDS: DEFAULT_MIN_SECONDS,
  MAX_SECONDS: DEFAULT_MAX_SECONDS
};