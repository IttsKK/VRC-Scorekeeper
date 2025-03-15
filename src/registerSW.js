import { registerSW as pwaRegisterSW } from "virtual:pwa-register";

export const registerSW = () => {
  let updateCallback;
  let needsUpdate = false;

  const updateSW = () => {
    if (updateCallback) {
      updateCallback();
    }
  };

  const registration = pwaRegisterSW({
    onNeedRefresh() {
      console.log("New content available; please refresh.");
      needsUpdate = true;
    },
    onOfflineReady() {
      console.log("App is ready to work offline.");
    },
    onRegisteredSW(swScriptUrl, registration) {
      updateCallback = registration;
    },
  });

  return {
    updateSW,
    needsUpdate: () => needsUpdate,
  };
};

// Function to unregister all service workers and clear caches
export const cleanupServiceWorkers = async () => {
  if ("serviceWorker" in navigator) {
    // Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log("Service worker unregistered");
    }

    // Clear all caches
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        console.log("All caches cleared");
      } catch (error) {
        console.error("Error clearing caches:", error);
      }
    }
  }
};

// Function to request fullscreen mode
export const requestFullscreen = () => {
  const element = document.documentElement;

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    /* Safari */
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    /* IE11 */
    element.msRequestFullscreen();
  }
};

// Function to exit fullscreen mode
export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE11 */
    document.msExitFullscreen();
  }
};

// Function to check if the app is in fullscreen mode
export const isFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
};
