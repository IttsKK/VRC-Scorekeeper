import React, { useState, useEffect } from "react";
import "./App.css";
import { requestFullscreen, exitFullscreen, isFullscreen } from "./registerSW";
import InstallPWA from "./components/InstallPWA";
import { Trash2, Maximize, Minimize } from "lucide-react";
import StakeCounter from "./components/StakeCounter";
import ControlPanel from "./components/ControlPanel";
import { computeScore } from "./utils/scoring";
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

export default function App() {
  const [fullscreenActive, setFullscreenActive] = useState(false);
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

  // Determine if the currently active stake should show corner buttons.
  const stakeHasIndicator = activeStake !== null && activeStake < 5;

  // Helper to modify the active stake.
  const modifyStake = (callback: (s: StakeData) => StakeData) => {
    if (activeStake === null) return;
    setStakes((prev) =>
      prev.map((s, i) => (i === activeStake ? callback(s) : s))
    );
  };

  const addRing = (color: "red" | "blue") => {
    modifyStake((s) =>
      s.rings.length < 6 ? { ...s, rings: [...s.rings, color] } : s
    );
  };

  const removeRing = () => {
    modifyStake((s) => ({ ...s, rings: s.rings.slice(0, -1) }));
  };

  const clearStake = () => {
    modifyStake((s) => ({ ...s, rings: [] }));
  };

  const setCorner = (type: "positive" | "negative" | "none") => {
    modifyStake((s) => ({ ...s, corner: type }));
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
  };

  // Toggle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => setFullscreenActive(isFullscreen());
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Calculate score including alliance counters and climb levels
  const calculateTotalScore = () => {
    const stakesScore = computeScore(stakes);

    // Add alliance counter scores
    let redScore = stakesScore.red;
    let blueScore = stakesScore.blue;

    // Alliance counters score - top ring is worth 3 points, others worth 1 point
    redAllianceRings.forEach((ring, index) => {
      const isTop = index === redAllianceRings.length - 1;
      const points = isTop ? 3 : 1;

      if (ring === "red") redScore += points;
      else if (ring === "blue") blueScore += points;
    });

    blueAllianceRings.forEach((ring, index) => {
      const isTop = index === blueAllianceRings.length - 1;
      const points = isTop ? 3 : 1;

      if (ring === "red") redScore += points;
      else if (ring === "blue") blueScore += points;
    });

    // Add high stake points (6 points)
    if (highStakeColor === "red") redScore += 6;
    else if (highStakeColor === "blue") blueScore += 6;

    // Add auto counter points (6 points each)
    if (redAutoToggled && blueAutoToggled) {
      redScore += 3;
      blueScore += 3;
    } else if (redAutoToggled) {
      redScore += 6;
    } else if (blueAutoToggled) {
      blueScore += 6;
    }

    // Add climb points: level 1 = 0pts, level 2 = 3pts, level 3 = 6pts, level 4 = 12pts
    // For each red robot
    // Helper function to calculate climb points
    const getClimbPoints = (level: number, robotId: string) => {
      // Base points for each level
      const basePoints = level === 4 ? 12 : (level - 1) * 3;

      // Add 2 points for levels 2-4 if the robot's team has high stake
      const bonusPoints =
        level >= 2 &&
        ((robotId.startsWith("red") && highStakeColor === "red") ||
          (robotId.startsWith("blue") && highStakeColor === "blue"))
          ? 2
          : 0;

      return basePoints + bonusPoints;
    };

    // Add climb points for all robots
    const robotIds = ["red1", "red2", "blue1", "blue2"] as const;
    robotIds.forEach((id) => {
      const score = getClimbPoints(climbLevels[id]);
      if (id.startsWith("red")) {
        redScore += score;
      } else {
        blueScore += score;
      }
    });

    return { red: redScore, blue: blueScore };
  };

  const { red, blue } = calculateTotalScore();

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

        <button
          onClick={fullscreenActive ? exitFullscreen : requestFullscreen}
          className="text-white md:hover:text-gray-400 active:text-gray-400"
        >
          {fullscreenActive ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </header>

      {/* Score Section */}
      <div className="text-white flex justify-center gap-26 h-24 pt-4">
        <div className="font-lexend text-5xl font-bold flex items-center justify-end w-32">
          {red}{" "}
          <span className="ml-2 w-4 h-4 bg-red-500 rounded-full outline-3 outline-black"></span>
        </div>
        <div className="font-lexend text-5xl font-bold flex items-center justify-start w-32">
          <span className="mr-2 w-4 h-4 bg-blue-500 rounded-full outline-3 outline-black"></span>{" "}
          {blue}
        </div>
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
              setActiveStake={() =>
                setActiveStake(activeStake === index ? null : index)
              }
              rings={stake.rings}
              corner={stake.corner}
            />
          ))}
        </div>

        {/* Bottom 2 stakes with alliance counters and climb counters */}
        <div className="w-full grid grid-cols-2 max-w-[400px] px-3">
          {/* Left half - climb counters in a 2x2 grid */}
          <div className="flex justify-center">
            <div className="flex flex-col gap-2">
              {/* High Stake Counter */}
              <div className="mb-0.5">
                <HighStakeCounter
                  ringColor={highStakeColor}
                  onUpdate={setHighStakeColor}
                />
              </div>

              {/* Auto Counters */}
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

              {/* Red climb counters */}
              <div className="flex gap-2">
                <ClimbCounter
                  color="red"
                  initialLevel={climbLevels.red1}
                  onLevelChange={(level) => updateClimbLevel("red1", level)}
                />
                <ClimbCounter
                  color="red"
                  initialLevel={climbLevels.red2}
                  onLevelChange={(level) => updateClimbLevel("red2", level)}
                />
              </div>

              {/* Blue climb counters */}
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
                  setActiveStake={() =>
                    setActiveStake(activeStake === 5 ? null : 5)
                  }
                  rings={stakes[5].rings}
                  corner={stakes[5].corner}
                />
                <AllianceCounter
                  color="red"
                  rings={redAllianceRings}
                  onUpdate={setRedAllianceRings}
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                <StakeCounter
                  key={6}
                  hasIndicator={false}
                  isActive={activeStake === 6}
                  setActiveStake={() =>
                    setActiveStake(activeStake === 6 ? null : 6)
                  }
                  rings={stakes[6].rings}
                  corner={stakes[6].corner}
                />
                <AllianceCounter
                  color="blue"
                  rings={blueAllianceRings}
                  onUpdate={setBlueAllianceRings}
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
          setCorner={setCorner}
        />
      </footer>

      {/* Install PWA prompt */}
    </div>
  );
}
