import React from "react";
import AutoIcon from "../icons/AutoIcon";

type AutoCounterProps = {
  color: "red" | "blue";
  isToggled: boolean;
  onToggle: () => void;
};

const AutoCounter: React.FC<AutoCounterProps> = ({
  color,
  isToggled,
  onToggle,
}) => {
  // Define colors based on the props
  const bgColor = isToggled ? `bg-${color}-500` : "bg-[#BBBBBB]";

  // Define the SVG fill color based on state
  const svgFillColor = isToggled
    ? "#FFFFFF" // White when toggled
    : color === "red"
    ? "#FB2C36"
    : "#2B7FFF"; // Explicit hex colors for red/blue

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-[40px] h-[40px] outline-3 outline-black rounded-[12px] flex items-center justify-center cursor-pointer ${bgColor} md:hover:bg-opacity-80`}
        onMouseDown={onToggle}
      >
        <AutoIcon color={svgFillColor} />
      </div>
    </div>
  );
};

export default AutoCounter;
