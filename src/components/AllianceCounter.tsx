import Ring from "./Ring";
import { ScoringMode } from "../App";

type AllianceCounterProps = {
  color: "red" | "blue"; // Determines which color gets added on click
  rings: ("red" | "blue")[]; // Rings state passed from parent
  onUpdate: (rings: ("red" | "blue")[]) => void; // Function to update rings in parent
  scoringMode?: ScoringMode; // Scoring mode
  isActive?: boolean; // Whether this counter is active (for skills mode)
  setActiveStake?: () => void; // Function to set this counter as active (for skills mode)
};

const AllianceCounter = ({
  color,
  rings,
  onUpdate,
  scoringMode = "match",
  isActive = false,
  setActiveStake,
}: AllianceCounterProps) => {
  const handleClick = () => {
    if (scoringMode === "match") {
      // Original behavior for match mode
      if (rings.length >= 2) {
        onUpdate([]); // Reset when full
      } else {
        onUpdate([...rings, color]); // Add selected color
      }
    } else if (setActiveStake) {
      // In skills mode, just set this as the active stake
      setActiveStake();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Alliance Stake Counter */}
      <div
        className={`w-15 h-13 outline-3 outline-black rounded-[15px] flex flex-col justify-center items-center cursor-pointer gap-[8px] ${
          color === "red"
            ? isActive
              ? "bg-[#b34040]" // Darker red for active
              : "bg-[#F87171] md:hover:bg-[#b37373]"
            : isActive
            ? "bg-[#3a75b3]" // Darker blue for active
            : "bg-[#51A2FF] md:hover:bg-[#7390b2]"
        }`}
        onMouseDown={handleClick}
      >
        {/* Render rings; fill empty slots with "off" */}
        {[
          ...Array(2 - rings.length).fill("off"),
          ...rings.slice().reverse(),
        ].map((color, i) => (
          <Ring key={i} color={color as "red" | "blue" | "off"} />
        ))}
      </div>
    </div>
  );
};

export default AllianceCounter;
