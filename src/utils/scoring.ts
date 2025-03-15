// src/utils/scoring.ts
import { StakeData, ClimbLevels, ScoringMode } from "../App";

export function computeScore(stakes: StakeData[]): { red: number; blue: number } {
  let red = 0;
  let blue = 0;

  stakes.forEach((stake, index) => {
    const isMobile = index < 5; // First 5 stakes are mobile goal stakes
    stake.rings.forEach((ring, ringIndex) => {
      const isTop = ringIndex === stake.rings.length - 1;
      let basePoints = isTop ? 3 : 1;
      let multiplier = 1;

      if (isMobile) {
        if (stake.corner === "positive") {
          multiplier = 2;
        } else if (stake.corner === "negative") {
          multiplier = -1;
        }
      }

      const points = basePoints * multiplier;
      if (ring === "red") {
        red += points;
      } else if (ring === "blue") {
        blue += points;
      }
    });
  });

  return { red, blue };
}

// Count total red rings on stakes
export function countRedRingsOnStakes(stakes: StakeData[]): number {
  return stakes.reduce((count, stake) => {
    return count + stake.rings.filter((ring) => ring === "red").length;
  }, 0);
}

// Count total blue rings on stakes
export function countBlueRingsOnStakes(stakes: StakeData[]): number {
  return stakes.reduce((count, stake) => {
    return count + stake.rings.filter((ring) => ring === "blue").length;
  }, 0);
}

// Count total rings by color (including alliance counters)
export function countTotalRingsByColor(
  stakes: StakeData[],
  redAllianceRings: ("red" | "blue")[],
  blueAllianceRings: ("red" | "blue")[]
): { red: number; blue: number } {
  // Count rings on stakes
  const redOnStakes = countRedRingsOnStakes(stakes);
  const blueOnStakes = countBlueRingsOnStakes(stakes);
  
  // Count rings on alliance counters
  const redOnRedAlliance = redAllianceRings.filter(ring => ring === "red").length;
  const blueOnRedAlliance = redAllianceRings.filter(ring => ring === "blue").length;
  const redOnBlueAlliance = blueAllianceRings.filter(ring => ring === "red").length;
  const blueOnBlueAlliance = blueAllianceRings.filter(ring => ring === "blue").length;
  
  // Total counts
  const totalRed = redOnStakes + redOnRedAlliance + redOnBlueAlliance;
  const totalBlue = blueOnStakes + blueOnRedAlliance + blueOnBlueAlliance;
  
  return { red: totalRed, blue: totalBlue };
}

// Check if ring limits are reached
export function checkRingLimits(
  scoringMode: ScoringMode,
  stakes: StakeData[],
  redAllianceRings: ("red" | "blue")[],
  blueAllianceRings: ("red" | "blue")[]
): { redLimitReached: boolean; blueLimitReached: boolean } {
  const { red: totalRed, blue: totalBlue } = countTotalRingsByColor(
    stakes,
    redAllianceRings,
    blueAllianceRings
  );
  
  if (scoringMode === "match") {
    // In match mode, limit is 24 rings per color
    return {
      redLimitReached: totalRed >= 24,
      blueLimitReached: totalBlue >= 24
    };
  } else {
    // In skills mode, limit is 24 red rings and 8 blue rings
    return {
      redLimitReached: totalRed >= 24,
      blueLimitReached: totalBlue >= 10
    };
  }
}

// Helper function to calculate climb points
export function getClimbPoints(level: number, robotId: string, highStakeColor: "red" | "blue" | "off"): number {
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
}

// Calculate total score for both match and skills modes
export function calculateTotalScore(
  scoringMode: ScoringMode,
  stakes: StakeData[],
  redAllianceRings: ("red" | "blue")[],
  blueAllianceRings: ("red" | "blue")[],
  highStakeColor: "red" | "blue" | "off",
  redAutoToggled: boolean,
  blueAutoToggled: boolean,
  climbLevels: ClimbLevels
): { red: number; blue: number } {
  if (scoringMode === "match") {
    return calculateMatchScore(
      stakes,
      redAllianceRings,
      blueAllianceRings,
      highStakeColor,
      redAutoToggled,
      blueAutoToggled,
      climbLevels
    );
  } else {
    return calculateSkillsScore(
      stakes,
      redAllianceRings,
      blueAllianceRings,
      highStakeColor,
      climbLevels
    );
  }
}

// Calculate score for match mode
function calculateMatchScore(
  stakes: StakeData[],
  redAllianceRings: ("red" | "blue")[],
  blueAllianceRings: ("red" | "blue")[],
  highStakeColor: "red" | "blue" | "off",
  redAutoToggled: boolean,
  blueAutoToggled: boolean,
  climbLevels: ClimbLevels
): { red: number; blue: number } {
  // Match scoring mode
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

  // Add climb points for all robots
  const robotIds = ["red1", "red2", "blue1", "blue2"] as const;
  robotIds.forEach((id) => {
    const score = getClimbPoints(climbLevels[id], id, highStakeColor);
    if (id.startsWith("red")) {
      redScore += score;
    } else {
      blueScore += score;
    }
  });

  return { red: redScore, blue: blueScore };
}

// Helper function to score rings in skills mode
function scoreSkillsRings(rings: ("red" | "blue")[], allRedRingsUsed: boolean): number {
  let score = 0;
  
  rings.forEach((ring, ringIndex) => {
    const isTop = ringIndex === rings.length - 1;
    const basePoints = isTop ? 3 : 1;

    // Rule 1: Red rings on top of blue rings do not count for points
    if (ring === "red") {
      // Check if there's a blue ring below this red ring
      const hasBlueRingBelow = rings.slice(0, ringIndex).some(r => r === "blue");
      if (!hasBlueRingBelow) {
        score += basePoints;
      }
    }
    // Rule 2: Blue rings scored on top of red rings when all reds have been scored count the same as a red ring on top would
    else if (ring === "blue") {
      // Only count blue rings if all red rings are used
      if (allRedRingsUsed) {
        // Check if there's at least one red ring below this blue ring
        const hasRedRingBelow = rings.slice(0, ringIndex).some(r => r === "red");
        if (hasRedRingBelow) {
          score += basePoints;
        }
      }
    }
  });
  
  return score;
}

// Calculate score for skills mode
function calculateSkillsScore(
  stakes: StakeData[],
  redAllianceRings: ("red" | "blue")[],
  blueAllianceRings: ("red" | "blue")[],
  highStakeColor: "red" | "blue" | "off",
  climbLevels: ClimbLevels
): { red: number; blue: number } {
  // Skills scoring mode
  let redScore = 0;

  // Count total red rings on stakes and alliance counters
  const { red: totalRedRings } = countTotalRingsByColor(
    stakes,
    redAllianceRings,
    blueAllianceRings
  );
  const allRedRingsUsed = totalRedRings >= 24;

  // Calculate stake scores
  stakes.forEach((stake, index) => {
    const isMobile = index < 5; // First 5 stakes are mobile goal stakes

    if (isMobile) {
      if (stake.corner === "positive") {
        // In skills mode, positive corners add 5 points
        redScore += 5;
      }
    }

    // Score the rings on this stake
    redScore += scoreSkillsRings(stake.rings, allRedRingsUsed);
  });

  // Score alliance counters using the same function as stakes
  redScore += scoreSkillsRings(redAllianceRings, allRedRingsUsed);
  redScore += scoreSkillsRings(blueAllianceRings, allRedRingsUsed);

  // Add high stake points (6 points) - only for red in skills mode
  if (highStakeColor === "red") redScore += 6;

  // Add climb points for red1 only in skills mode
  const level = climbLevels.red1;
  const basePoints = level === 4 ? 12 : (level - 1) * 3;
  const bonusPoints = level >= 2 && highStakeColor === "red" ? 2 : 0;
  redScore += basePoints + bonusPoints;

  return { red: redScore, blue: 0 };
}
