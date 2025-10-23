/**
 * Utility to suppress expected camera permission errors
 * These errors are normal when users deny camera access and are handled gracefully
 */

const EXPECTED_CAMERA_ERRORS = [
  'NotAllowedError',
  'Permission denied',
  'Camera permission denied',
  'Camera test failed',
  'Permission request failed'
];

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let suppressionEnabled = false;

export function enableCameraErrorSuppression() {
  if (suppressionEnabled) return;
  suppressionEnabled = true;

  // Override console.error to filter camera permission errors
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check if this is an expected camera error
    const isExpectedCameraError = EXPECTED_CAMERA_ERRORS.some(errorText => 
      message.includes(errorText)
    );

    // Only log if it's NOT an expected camera error
    if (!isExpectedCameraError) {
      originalConsoleError.apply(console, args);
    }
  };

  // Override console.warn similarly
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    const isExpectedCameraError = EXPECTED_CAMERA_ERRORS.some(errorText => 
      message.includes(errorText)
    );

    if (!isExpectedCameraError) {
      originalConsoleWarn.apply(console, args);
    }
  };
}

export function disableCameraErrorSuppression() {
  if (!suppressionEnabled) return;
  suppressionEnabled = false;

  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}

// Export for debugging purposes
export function restoreConsole() {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  suppressionEnabled = false;
}
