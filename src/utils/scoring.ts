// src/utils/scoring.ts
import { StakeData } from "../App";

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
