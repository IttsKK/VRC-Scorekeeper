import React, { useState, useEffect } from "react";

type ClimbCounterProps = {
  initialLevel: number;
  onLevelChange?: (level: number) => void;
  color: "red" | "blue";
};

const ClimbCounter: React.FC<ClimbCounterProps> = ({
  initialLevel,
  onLevelChange,
  color,
}) => {
  const [level, setLevel] = useState(initialLevel);

  // Update internal state when initialLevel changes (e.g., on reset)
  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  const handleClick = () => {
    // Cycle through levels 1-4
    const newLevel = level < 4 ? level + 1 : 1;
    setLevel(newLevel);

    if (onLevelChange) {
      onLevelChange(newLevel);
    }
  };

  return (
    <div
      className="w-[70px] h-[70px] outline-3 outline-black rounded-[15px] overflow-hidden flex flex-col cursor-pointer bg-[#BBBBBB] md:hover:bg-[#8C8C8C]"
      onMouseDown={handleClick}
    >
      {/* Four sections, from top to bottom */}
      <div
        className={`flex-1 border-b-3 border-black ${
          level >= 4 ? `bg-${color}-500` : ""
        }`}
      ></div>
      <div
        className={`flex-1 border-b-3 border-black ${
          level >= 3 ? `bg-${color}-500` : ""
        }`}
      ></div>
      <div
        className={`flex-1 border-b-3 border-black ${
          level >= 2 ? `bg-${color}-500` : ""
        }`}
      ></div>
      <div className={`flex-1 ${level >= 1 ? `bg-${color}-500` : ""}`}></div>
    </div>
  );
};

export default ClimbCounter;
