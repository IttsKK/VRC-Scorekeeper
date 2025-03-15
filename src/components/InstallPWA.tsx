import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import UpdatePWA from "./UpdatePWA";
import { registerSW } from "../registerSW";

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Register service worker and get update functions
    const { updateSW: update, needsUpdate: checkUpdate } = registerSW();
    setUpdateSW(() => update);

    // Check for updates periodically
    const updateChecker = setInterval(() => {
      setNeedsUpdate(checkUpdate());
    }, 5000);

    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as any);
    };

    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
      window.removeEventListener("appinstalled", () => setIsInstalled(true));
      clearInterval(updateChecker);
    };
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptInstall) {
      return;
    }
    (promptInstall as any).prompt();
    (promptInstall as any).userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
    });
  };

  const handleUpdate = () => {
    if (updateSW) {
      updateSW();
      setNeedsUpdate(false);
    }
  };

  return (
    <>
      {!supportsPWA || isInstalled ? null : (
        <button
          onClick={handleInstallClick}
          className="text-white active:text-blue-500 md:hover:text-blue-500"
          aria-label="Install app"
          title="Install app for offline use"
        >
          <Download size={24} />
        </button>
      )}
      <UpdatePWA needsUpdate={needsUpdate} onUpdate={handleUpdate} />
    </>
  );
};

export default InstallPWA;
