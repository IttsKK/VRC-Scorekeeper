import React from "react";
import { RefreshCw } from "lucide-react";

interface UpdatePWAProps {
  needsUpdate: boolean;
  onUpdate: () => void;
}

const UpdatePWA = ({ needsUpdate, onUpdate }: UpdatePWAProps) => {
  if (!needsUpdate) return null;

  return (
    <button
      onClick={onUpdate}
      className="text-white active:text-blue-500 md:hover:text-blue-500 relative"
      aria-label="Update app"
      title="Update app to latest version"
    >
      <RefreshCw size={24} className="animate-spin-slow" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
    </button>
  );
};

export default UpdatePWA;
