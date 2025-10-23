/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// Splash Screen Timing
export const SPLASH_SCREEN_DURATION = 10500; // 10.5 seconds
export const SPLASH_FILL_DURATION = 6000; // 6 seconds to fill
export const SPLASH_PAUSE_DURATION = 4000; // 4 seconds pause

// Form Auto-Behavior Timing
export const FORM_AUTO_REOPEN_DELAY = 2000; // 2 seconds delay before auto-reopening form
export const FORM_SUBMISSION_SUCCESS_DELAY = 1500; // 1.5 seconds delay after successful submission

// Validation Limits
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_MILEAGE = 0;
export const MAX_MILEAGE = 1_000_000;
export const MIN_FUEL_AMOUNT = 0.1;
export const MAX_FUEL_AMOUNT = 500;
export const MIN_FUEL_COST = 0.01;
export const MAX_FUEL_COST = 10_000;

// VIN Validation
export const VIN_LENGTH = 17;
export const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

// API Retry Configuration
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RETRY_BASE_DELAY = 1000; // 1 second
export const DEFAULT_RETRY_MAX_DELAY = 30000; // 30 seconds

// Session Management
export const SESSION_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
export const SESSION_EXPIRY_WARNING = 5 * 60 * 1000; // 5 minutes before expiry

// UI Constants
export const TOAST_AUTO_CLOSE_DURATION = 3000; // 3 seconds
export const LOADING_SPINNER_MIN_DISPLAY = 500; // Minimum 500ms to avoid flash

// File Size Limits
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const PHOTO_QUALITY = 0.9; // JPEG quality for camera captures

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
