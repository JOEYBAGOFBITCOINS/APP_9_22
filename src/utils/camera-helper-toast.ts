import { toast } from 'sonner@2.0.3';

let cameraToastShown = false;

/**
 * Show a one-time helpful toast about camera permissions
 * Only shows once per session
 */
export function showCameraPermissionToast() {
  if (cameraToastShown) return;
  cameraToastShown = true;

  // Wait a bit for the app to load, then show the helpful message
  setTimeout(() => {
    toast.info('📷 Camera Features Available', {
      description: 'You can scan VINs and receipts. Camera permission will be requested when needed.',
      duration: 5000,
    });
  }, 2000);
}

/**
 * Show helpful message when camera permission is denied
 */
export function showCameraPermissionDeniedHelp() {
  toast.warning('Camera Access Required', {
    description: 'To scan receipts and VINs, enable camera in your browser settings and refresh.',
    duration: 8000,
  });
}

/**
 * Reset the toast shown flag (useful for testing)
 */
export function resetCameraToastFlag() {
  cameraToastShown = false;
}
