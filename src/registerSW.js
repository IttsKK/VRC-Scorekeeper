// This file is used to register the service worker

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

export const registerSW = () => {
  if ("serviceWorker" in navigator) {
    // Check if we're in a development environment
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Register service worker in both production and development
    window.addEventListener("load", async () => {
      try {
        const swUrl = "/sw.js";

        const registration = await navigator.serviceWorker.register(swUrl);
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );

        // Add update checking
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("New content is available; please refresh.");
            }
          });
        });

        // Add special handling for development mode
        if (isDevelopment) {
          // In development, we want to update the service worker on each page load
          // to ensure we're always using the latest version
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            console.log(
              "Service worker controller changed in development mode"
            );
          });
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);

        // Log a more user-friendly message for common errors
        if (
          error.name === "SecurityError" ||
          error.message.includes("insecure")
        ) {
          console.warn(
            "Service Worker registration failed: The page is not served over HTTPS. " +
              "Service workers require a secure context (HTTPS) except on localhost."
          );
        }
      }
    });
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
