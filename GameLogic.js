/**
 * Game Logic for Roll-Based Football Game
 */

// PASS play outcomes based on 20-sided die roll
export const PASS_OUTCOMES = {
  1: { type: 'INTERCEPTION_TD', description: 'Interception Touchdown!', points: -6, yards: 0, possession: false },
  2: { type: 'INTERCEPTION', description: 'Interception!', points: 0, yards: 0, possession: false },
  3: { type: 'INTERCEPTION', description: 'Interception!', points: 0, yards: 0, possession: false },
  4: { type: 'INCOMPLETE', description: 'Pass Incomplete', points: 0, yards: 0, possession: true },
  5: { type: 'INCOMPLETE', description: 'Pass Incomplete', points: 0, yards: 0, possession: true },
  6: { type: 'INCOMPLETE', description: 'Pass Incomplete', points: 0, yards: 0, possession: true },
  7: { type: 'INCOMPLETE', description: 'Pass Incomplete', points: 0, yards: 0, possession: true },
  8: { type: 'INCOMPLETE', description: 'Pass Incomplete', points: 0, yards: 0, possession: true },
  9: { type: 'INCOMPLETE', description: 'Pass Incomplete', points: 0, yards: 0, possession: true },
  10: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 2, possession: true },
  11: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 2, possession: true },
  12: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 5, possession: true },
  13: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 5, possession: true },
  14: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 5, possession: true },
  15: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 10, possession: true },
  16: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 10, possession: true },
  17: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 10, possession: true },
  18: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 20, possession: true },
  19: { type: 'COMPLETE', description: 'Pass Complete!', points: 0, yards: 30, possession: true },
  20: { type: 'TOUCHDOWN', description: 'TOUCHDOWN!', points: 6, yards: 0, possession: true },
};

// RUN play outcomes based on 20-sided die roll
export const RUN_OUTCOMES = {
  1: { type: 'FUMBLE_TD', description: 'Fumble Return for Touchdown!', points: -6, yards: 0, possession: false },
  2: { type: 'FUMBLE', description: 'Fumble!', points: 0, yards: 0, possession: false },
  3: { type: 'NO_GAIN', description: 'No Gain', points: 0, yards: 0, possession: true },
  4: { type: 'NO_GAIN', description: 'No Gain', points: 0, yards: 0, possession: true },
  5: { type: 'NO_GAIN', description: 'No Gain', points: 0, yards: 0, possession: true },
  6: { type: 'NO_GAIN', description: 'No Gain', points: 0, yards: 0, possession: true },
  7: { type: 'GAIN', description: '2 Yard Run', points: 0, yards: 2, possession: true },
  8: { type: 'GAIN', description: '2 Yard Run', points: 0, yards: 2, possession: true },
  9: { type: 'GAIN', description: '5 Yard Run', points: 0, yards: 5, possession: true },
  10: { type: 'GAIN', description: '5 Yard Run', points: 0, yards: 5, possession: true },
  11: { type: 'GAIN', description: '10 Yard Run', points: 0, yards: 10, possession: true },
  12: { type: 'GAIN', description: '10 Yard Run', points: 0, yards: 10, possession: true },
  13: { type: 'GAIN', description: '10 Yard Run', points: 0, yards: 10, possession: true },
  14: { type: 'GAIN', description: '10 Yard Run', points: 0, yards: 10, possession: true },
  15: { type: 'GAIN', description: '15 Yard Run', points: 0, yards: 15, possession: true },
  16: { type: 'GAIN', description: '15 Yard Run', points: 0, yards: 15, possession: true },
  17: { type: 'GAIN', description: '20 Yard Run', points: 0, yards: 20, possession: true },
  18: { type: 'GAIN', description: '20 Yard Run', points: 0, yards: 20, possession: true },
  19: { type: 'GAIN', description: '25 Yard Run', points: 0, yards: 25, possession: true },
  20: { type: 'TOUCHDOWN', description: 'TOUCHDOWN!', points: 6, yards: 0, possession: true },
};

/**
 * Roll a die with specified number of sides
 * @param {number} sides - Number of sides on the die
 * @returns {number} Random number between 1 and sides
 */
export function rollDie(sides = 20) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Execute a PASS play
 * @returns {Object} Outcome of the pass play
 */
export function executePassPlay() {
  const roll = rollDie(20);
  const outcome = PASS_OUTCOMES[roll];
  return {
    roll,
    ...outcome,
    playType: 'PASS'
  };
}

/**
 * Execute a RUN play
 * @returns {Object} Outcome of the run play
 */
export function executeRunPlay() {
  const roll = rollDie(20);
  const outcome = RUN_OUTCOMES[roll];
  return {
    roll,
    ...outcome,
    playType: 'RUN'
  };
}

/**
 * Calculate new field position after a play
 * @param {number} currentYardLine - Current yard line (0-100, where 0 is own goal, 100 is opponent goal)
 * @param {number} yardsGained - Yards gained on the play
 * @param {boolean} isOffense - Whether the current team is on offense
 * @returns {Object} New yard line and whether touchdown was scored
 */
export function updateFieldPosition(currentYardLine, yardsGained, isOffense) {
  let newYardLine = currentYardLine;
  
  if (isOffense) {
    newYardLine += yardsGained;
    if (newYardLine >= 100) {
      return { yardLine: 100, touchdown: true };
    }
  } else {
    newYardLine -= yardsGained;
    if (newYardLine <= 0) {
      return { yardLine: 0, touchdown: true };
    }
  }
  
  return { yardLine: newYardLine, touchdown: false };
}
