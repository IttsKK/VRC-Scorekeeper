import React, { useState, useEffect } from "react";
import "./App.css";
import { requestFullscreen, exitFullscreen, isFullscreen } from "./registerSW";
import InstallPWA from "./components/InstallPWA";
import { Trash2, Maximize, Minimize, Swords, Trophy } from "lucide-react";
import StakeCounter from "./components/StakeCounter";
import ControlPanel from "./components/ControlPanel";
import {
  computeScore,
  calculateTotalScore,
  countRedRingsOnStakes,
  countBlueRingsOnStakes,
  countTotalRingsByColor,
  checkRingLimits,
} from "./utils/scoring";
import AllianceCounter from "./components/AllianceCounter";
import ClimbCounter from "./components/ClimbCounter";
import HighStakeCounter from "./components/HighStakeCounter";
import AutoCounter from "./components/AutoCounter";

export type StakeData = {
  rings: ("red" | "blue")[];
  corner: "positive" | "negative" | "none";
};

// Define a type for climb levels
export type ClimbLevels = {
  red1: number;
  red2: number;
  blue1: number;
  blue2: number;
};

// Define scoring modes
export type ScoringMode = "match" | "skills";

export default function App() {
  const [fullscreenActive, setFullscreenActive] = useState(false);
  // Add state for scoring mode
  const [scoringMode, setScoringMode] = useState<ScoringMode>("match");

  // Initialize 7 stakes with empty rings and no corner selected.
  const [stakes, setStakes] = useState<StakeData[]>(
    Array.from({ length: 7 }, () => ({ rings: [], corner: "none" }))
  );
  const [activeStake, setActiveStake] = useState<number | null>(null);

  // Add state for alliance counters
  const [redAllianceRings, setRedAllianceRings] = useState<("red" | "blue")[]>(
    []
  );
  const [blueAllianceRings, setBlueAllianceRings] = useState<
    ("red" | "blue")[]
  >([]);

  // Add state for tracking if alliance counters are active in skills mode
  const [redAllianceActive, setRedAllianceActive] = useState(false);
  const [blueAllianceActive, setBlueAllianceActive] = useState(false);

  // Add state for high stake counter
  const [highStakeColor, setHighStakeColor] = useState<"red" | "blue" | "off">(
    "off"
  );

  // Add state for auto counters
  const [redAutoToggled, setRedAutoToggled] = useState(false);
  const [blueAutoToggled, setBlueAutoToggled] = useState(false);

  // Use a single state object for all climb levels
  const [climbLevels, setClimbLevels] = useState<ClimbLevels>({
    red1: 1,
    red2: 1,
    blue1: 1,
    blue2: 1,
  });

  // Track corner counts
  const [positiveCornerCount, setPositiveCornerCount] = useState(0);
  const [negativeCornerCount, setNegativeCornerCount] = useState(0);

  // Determine if the currently active stake should show corner buttons.
  const stakeHasIndicator = activeStake !== null && activeStake < 5;

  // Check if ring limits are reached
  const { redLimitReached, blueLimitReached } = checkRingLimits(
    scoringMode,
    stakes,
    redAllianceRings,
    blueAllianceRings
  );

  // Check if corner limits are reached
  const positiveCornerLimitReached =
    (scoringMode === "match" && positiveCornerCount >= 2) ||
    (scoringMode === "skills" && positiveCornerCount >= 4);

  const negativeCornerLimitReached =
    (scoringMode === "match" && negativeCornerCount >= 2) ||
    scoringMode === "skills"; // Always reached in skills mode

  // Update corner counts when stakes change
  useEffect(() => {
    const positiveCount = stakes.filter(
      (stake) => stake.corner === "positive"
    ).length;
    const negativeCount = stakes.filter(
      (stake) => stake.corner === "negative"
    ).length;

    setPositiveCornerCount(positiveCount);
    setNegativeCornerCount(negativeCount);
  }, [stakes]);

  // Helper to modify the active stake.
  const modifyStake = (callback: (s: StakeData) => StakeData) => {
    if (activeStake === null) return;
    setStakes((prev) =>
      prev.map((s, i) => (i === activeStake ? callback(s) : s))
    );
  };

  // Helper to modify alliance rings in skills mode
  const modifyAllianceRings = (
    color: "red" | "blue",
    callback: (rings: ("red" | "blue")[]) => ("red" | "blue")[]
  ) => {
    if (color === "red" && redAllianceActive) {
      setRedAllianceRings(callback);
    } else if (color === "blue" && blueAllianceActive) {
      setBlueAllianceRings(callback);
    }
  };

  const addRing = (color: "red" | "blue") => {
    // Check if we've reached the ring limit for this color
    if (
      (color === "red" && redLimitReached) ||
      (color === "blue" && blueLimitReached)
    ) {
      return;
    }

    // Check if we're modifying a regular stake
    if (activeStake !== null) {
      modifyStake((s) =>
        s.rings.length < 6 ? { ...s, rings: [...s.rings, color] } : s
      );
    }
    // Check if we're modifying an alliance counter in skills mode
    else if (scoringMode === "skills") {
      if (redAllianceActive) {
        setRedAllianceRings((prev) =>
          prev.length < 2 ? [...prev, color] : prev
        );
      } else if (blueAllianceActive) {
        setBlueAllianceRings((prev) =>
          prev.length < 2 ? [...prev, color] : prev
        );
      }
    }
  };

  const removeRing = () => {
    // Check if we're modifying a regular stake
    if (activeStake !== null) {
      modifyStake((s) => ({ ...s, rings: s.rings.slice(0, -1) }));
    }
    // Check if we're modifying an alliance counter in skills mode
    else if (scoringMode === "skills") {
      if (redAllianceActive) {
        setRedAllianceRings((prev) => prev.slice(0, -1));
      } else if (blueAllianceActive) {
        setBlueAllianceRings((prev) => prev.slice(0, -1));
      }
    }
  };

  const clearStake = () => {
    // Check if we're modifying a regular stake
    if (activeStake !== null) {
      modifyStake((s) => ({ ...s, rings: [] }));
    }
    // Check if we're modifying an alliance counter in skills mode
    else if (scoringMode === "skills") {
      if (redAllianceActive) {
        setRedAllianceRings([]);
      } else if (blueAllianceActive) {
        setBlueAllianceRings([]);
      }
    }
  };

  const setCorner = (type: "positive" | "negative" | "none") => {
    // In skills mode, only allow positive or none
    if (scoringMode === "skills" && type === "negative") {
      return;
    }

    // Check corner limits
    if (
      type === "positive" &&
      positiveCornerLimitReached &&
      activeStake !== null &&
      stakes[activeStake].corner !== "positive"
    ) {
      return;
    }

    if (
      type === "negative" &&
      negativeCornerLimitReached &&
      activeStake !== null &&
      stakes[activeStake].corner !== "negative"
    ) {
      return;
    }

    modifyStake((s) => ({ ...s, corner: type }));
  };

  // New function to update corner for any stake by index
  const updateCornerForStake = (
    index: number,
    type: "positive" | "negative" | "none"
  ) => {
    // In skills mode, only allow positive or none
    if (scoringMode === "skills" && type === "negative") {
      return;
    }

    // Check if we're trying to add a positive corner when limit is reached
    if (
      type === "positive" &&
      positiveCornerLimitReached &&
      stakes[index].corner !== "positive"
    ) {
      return;
    }

    // Check if we're trying to add a negative corner when limit is reached
    if (
      type === "negative" &&
      negativeCornerLimitReached &&
      stakes[index].corner !== "negative"
    ) {
      return;
    }

    // Update the corner for the specified stake
    setStakes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, corner: type } : s))
    );
  };

  // Helper function to update a specific climb level
  const updateClimbLevel = (key: keyof ClimbLevels, level: number) => {
    setClimbLevels((prev) => ({
      ...prev,
      [key]: level,
    }));
  };

  const clearAll = () => {
    setStakes(Array.from({ length: 7 }, () => ({ rings: [], corner: "none" })));
    setActiveStake(null);
    setRedAllianceRings([]);
    setBlueAllianceRings([]);
    setRedAllianceActive(false);
    setBlueAllianceActive(false);
    setHighStakeColor("off");
    setRedAutoToggled(false);
    setBlueAutoToggled(false);
    // Reset all climb levels to 1
    setClimbLevels({
      red1: 1,
      red2: 1,
      blue1: 1,
      blue2: 1,
    });
    // Reset corner counts
    setPositiveCornerCount(0);
    setNegativeCornerCount(0);
  };

  // Toggle scoring mode
  const toggleScoringMode = () => {
    setScoringMode((prev) => (prev === "match" ? "skills" : "match"));
    clearAll(); // Reset all counters when switching modes
  };

  // Toggle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => setFullscreenActive(isFullscreen());
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Calculate the total score using the imported function
  const { red, blue } = calculateTotalScore(
    scoringMode,
    stakes,
    redAllianceRings,
    blueAllianceRings,
    highStakeColor,
    redAutoToggled,
    blueAutoToggled,
    climbLevels
  );

  // Helper to handle alliance counter clicks in skills mode
  const handleAllianceClick = (color: "red" | "blue") => {
    // Clear any active stake
    setActiveStake(null);

    if (color === "red") {
      setRedAllianceActive((prev) => !prev);
      setBlueAllianceActive(false);
    } else {
      setBlueAllianceActive((prev) => !prev);
      setRedAllianceActive(false);
    }
  };

  // Get the total red rings count for skills mode
  const totalRedRings = countRedRingsOnStakes(stakes);
  const allRedRingsUsed = totalRedRings >= 24;

  // Get ring counts for display
  const { red: totalRedRingsCount, blue: totalBlueRingsCount } =
    countTotalRingsByColor(stakes, redAllianceRings, blueAllianceRings);

  return (
    <div className="bg-background-500 min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-12 bg-black text-white flex justify-between items-center px-8 py-10">
        <div className="flex items-center gap-8">
          <button
            onClick={clearAll}
            className="text-white active:text-red-500 md:hover:text-red-500"
          >
            <Trash2 size={24} />
          </button>
          <InstallPWA />
        </div>

        <div className="flex items-center">
          {/* Mode toggle button */}
          <button
            onClick={toggleScoringMode}
            className="mr-6 p-2 rounded-md text-white flex items-center justify-center hover:bg-gray-600 active:bg-gray-500"
          >
            {scoringMode === "match" ? (
              <Swords size={24} />
            ) : (
              <Trophy size={24} />
            )}
          </button>

          <button
            onClick={fullscreenActive ? exitFullscreen : requestFullscreen}
            className="text-white md:hover:text-gray-400 active:text-gray-400"
          >
            {fullscreenActive ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </header>

      {/* Score Section */}
      <div className="text-white flex justify-center h-24 pt-4">
        {scoringMode === "match" ? (
          <div className="flex gap-26">
            <div className="font-lexend text-5xl font-bold flex items-center justify-end w-32">
              {red}{" "}
              <span className="ml-2 w-4 h-4 bg-red-500 rounded-full outline-3 outline-black"></span>
            </div>
            <div className="font-lexend text-5xl font-bold flex items-center justify-start w-32">
              <span className="mr-2 w-4 h-4 bg-blue-500 rounded-full outline-3 outline-black"></span>{" "}
              {blue}
            </div>
          </div>
        ) : (
          <div className="font-lexend text-5xl font-bold flex items-center justify-center">
            {red}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center gap-1">
        {/* Top 5 stakes */}
        <div className="grid grid-cols-5 gap-4 p-4">
          {stakes.slice(0, 5).map((stake, index) => (
            <StakeCounter
              key={index}
              hasIndicator={true}
              isActive={activeStake === index}
              setActiveStake={() => {
                setActiveStake(activeStake === index ? null : index);
                setRedAllianceActive(false);
                setBlueAllianceActive(false);
              }}
              rings={stake.rings}
              corner={stake.corner}
              scoringMode={scoringMode}
              onCornerChange={(corner) => updateCornerForStake(index, corner)}
              positiveCornerLimitReached={
                positiveCornerLimitReached && stake.corner !== "positive"
              }
              negativeCornerLimitReached={
                negativeCornerLimitReached && stake.corner !== "negative"
              }
            />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="w-full grid grid-cols-2 max-w-[400px] px-3">
          {/* Left half - climb counters in a 2x2 grid */}
          <div className="flex justify-center">
            <div className="flex flex-col gap-2">
              {/* High Stake Counter */}
              <div className="mb-0.5">
                <HighStakeCounter
                  ringColor={highStakeColor}
                  onUpdate={
                    scoringMode === "skills"
                      ? (color) =>
                          setHighStakeColor(color === "blue" ? "off" : color)
                      : setHighStakeColor
                  }
                />
              </div>

              {/* Auto Counters - only show in match mode */}
              {scoringMode === "match" && (
                <div className="flex justify-center gap-9 mb-0.5">
                  <AutoCounter
                    color="red"
                    isToggled={redAutoToggled}
                    onToggle={() => setRedAutoToggled(!redAutoToggled)}
                  />
                  <AutoCounter
                    color="blue"
                    isToggled={blueAutoToggled}
                    onToggle={() => setBlueAutoToggled(!blueAutoToggled)}
                  />
                </div>
              )}

              {/* Red climb counters - in skills mode, only show one */}
              <div className="flex gap-2">
                <ClimbCounter
                  color="red"
                  initialLevel={climbLevels.red1}
                  onLevelChange={(level) => updateClimbLevel("red1", level)}
                />
                {scoringMode === "match" && (
                  <ClimbCounter
                    color="red"
                    initialLevel={climbLevels.red2}
                    onLevelChange={(level) => updateClimbLevel("red2", level)}
                  />
                )}
              </div>

              {/* Blue climb counters - only show in match mode */}
              {scoringMode === "match" && (
                <div className="flex gap-2">
                  <ClimbCounter
                    color="blue"
                    initialLevel={climbLevels.blue1}
                    onLevelChange={(level) => updateClimbLevel("blue1", level)}
                  />
                  <ClimbCounter
                    color="blue"
                    initialLevel={climbLevels.blue2}
                    onLevelChange={(level) => updateClimbLevel("blue2", level)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right half - alliance stakes */}
          <div className="flex justify-center items-center h-full">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-4">
                <StakeCounter
                  key={5}
                  hasIndicator={false}
                  isActive={activeStake === 5}
                  setActiveStake={() => {
                    setActiveStake(activeStake === 5 ? null : 5);
                    setRedAllianceActive(false);
                    setBlueAllianceActive(false);
                  }}
                  rings={stakes[5].rings}
                  corner={stakes[5].corner}
                  scoringMode={scoringMode}
                  onCornerChange={(corner) => updateCornerForStake(5, corner)}
                  positiveCornerLimitReached={
                    positiveCornerLimitReached &&
                    stakes[5].corner !== "positive"
                  }
                  negativeCornerLimitReached={
                    negativeCornerLimitReached &&
                    stakes[5].corner !== "negative"
                  }
                />
                <AllianceCounter
                  color="red"
                  rings={redAllianceRings}
                  onUpdate={
                    scoringMode === "match" ? setRedAllianceRings : () => {}
                  }
                  scoringMode={scoringMode}
                  isActive={redAllianceActive}
                  setActiveStake={() => handleAllianceClick("red")}
                />
              </div>

              {/* Always show blue alliance counter, but behavior changes in skills mode */}
              <div className="flex flex-col items-center gap-4">
                <StakeCounter
                  key={6}
                  hasIndicator={false}
                  isActive={activeStake === 6}
                  setActiveStake={() => {
                    setActiveStake(activeStake === 6 ? null : 6);
                    setRedAllianceActive(false);
                    setBlueAllianceActive(false);
                  }}
                  rings={stakes[6].rings}
                  corner={stakes[6].corner}
                  scoringMode={scoringMode}
                  onCornerChange={(corner) => updateCornerForStake(6, corner)}
                  positiveCornerLimitReached={
                    positiveCornerLimitReached &&
                    stakes[6].corner !== "positive"
                  }
                  negativeCornerLimitReached={
                    negativeCornerLimitReached &&
                    stakes[6].corner !== "negative"
                  }
                />
                <AllianceCounter
                  color="blue"
                  rings={blueAllianceRings}
                  onUpdate={
                    scoringMode === "match" ? setBlueAllianceRings : () => {}
                  }
                  scoringMode={scoringMode}
                  isActive={blueAllianceActive}
                  setActiveStake={() => handleAllianceClick("blue")}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Controls */}
      <footer>
        <ControlPanel
          hasIndicator={stakeHasIndicator}
          activeCorner={
            activeStake !== null ? stakes[activeStake].corner : "none"
          }
          addRing={addRing}
          removeRing={removeRing}
          clearStake={clearStake}
          setCorner={
            activeStake !== null
              ? (type) => updateCornerForStake(activeStake, type)
              : () => {}
          }
          scoringMode={scoringMode}
          redLimitReached={redLimitReached}
          blueLimitReached={blueLimitReached}
          positiveCornerLimitReached={positiveCornerLimitReached}
          negativeCornerLimitReached={negativeCornerLimitReached}
        />
      </footer>
    </div>
  );
}
