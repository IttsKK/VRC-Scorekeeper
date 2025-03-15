import Ring from "./Ring";
import { ScoringMode } from "../App";

const PlusIcon = () => (
  <svg
    width="16"
    height="15"
    viewBox="0 0 16 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" width="4" height="15" rx="1" fill="black" />
    <rect
      x="0.5"
      y="9.5"
      width="4"
      height="15"
      rx="1"
      transform="rotate(-90 0.5 9.5)"
      fill="black"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="16"
    height="5"
    viewBox="0 0 16 5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0.5"
      y="4.5"
      width="4"
      height="15"
      rx="1"
      transform="rotate(-90 0.5 4.5)"
      fill="black"
    />
  </svg>
);

type StakeCounterProps = {
  hasIndicator?: boolean;
  isActive: boolean;
  setActiveStake: () => void;
  rings: ("red" | "blue")[];
  corner: "positive" | "negative" | "none";
  scoringMode?: ScoringMode;
  onCornerChange?: (corner: "positive" | "negative" | "none") => void;
  positiveCornerLimitReached?: boolean;
  negativeCornerLimitReached?: boolean;
};

const StakeCounter = ({
  hasIndicator,
  isActive,
  setActiveStake,
  rings,
  corner,
  scoringMode = "match",
  onCornerChange,
  positiveCornerLimitReached = false,
  negativeCornerLimitReached = false,
}: StakeCounterProps) => {
  // In skills mode, we only show the indicator if it's positive or none
  const shouldShowIndicator =
    hasIndicator && (scoringMode === "match" || corner !== "negative");

  // Function to cycle through corner states when indicator is clicked
  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering setActiveStake

    if (!onCornerChange) return;

    if (scoringMode === "match") {
      // In match mode: none -> positive -> negative -> none
      if (corner === "none") {
        // If positive is unavailable, try negative, then none
        if (positiveCornerLimitReached) {
          if (negativeCornerLimitReached) {
            // Both positive and negative are unavailable, stay at none
            return;
          } else {
            // Skip to negative
            onCornerChange("negative");
          }
        } else {
          // Positive is available
          onCornerChange("positive");
        }
      } else if (corner === "positive") {
        // If negative is unavailable, skip to none
        if (negativeCornerLimitReached) {
          onCornerChange("none");
        } else {
          // Negative is available
          onCornerChange("negative");
        }
      } else {
        // From negative, always go to none
        onCornerChange("none");
      }
    } else {
      // In skills mode: none -> positive -> none
      if (corner === "none") {
        // If positive is unavailable, stay at none
        if (positiveCornerLimitReached) {
          return;
        } else {
          onCornerChange("positive");
        }
      } else {
        // From positive, always go to none
        onCornerChange("none");
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Stake Counter */}
      <div
        className={`w-15 h-37 outline-3 outline-black rounded-[15px] flex flex-col justify-center items-center cursor-pointer gap-[8px] 
          ${isActive ? "bg-[#555555]" : "bg-[#BBBBBB] md:hover:bg-[#8C8C8C]"}`}
        onMouseDown={setActiveStake}
      >
        {/* Render rings; fill empty slots with "off" */}
        {[
          ...Array(6 - rings.length).fill("off"),
          ...rings.slice().reverse(),
        ].map((color, i) => (
          <Ring key={i} color={color as "red" | "blue" | "off"} />
        ))}
      </div>

      {/* Indicator (Optional) */}
      {shouldShowIndicator && (
        <div
          className="mt-[6px] w-[46px] h-[21px] bg-white rounded-full flex items-center justify-center outline-3 outline-black cursor-pointer"
          onClick={handleIndicatorClick}
        >
          {corner === "positive" ? (
            <PlusIcon />
          ) : corner === "negative" && scoringMode === "match" ? (
            <MinusIcon />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StakeCounter;
