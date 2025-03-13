import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
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

  // Don't show anything if PWA is not supported or already installed
  if (!supportsPWA || isInstalled) {
    return null;
  }

  // Return just the download icon button
  return (
    <button
      onClick={handleInstallClick}
      className="text-white active:text-blue-500 md:hover:text-blue-500"
      aria-label="Install app"
      title="Install app for offline use"
    >
      <Download size={24} />
    </button>
  );
};

export default InstallPWA;
