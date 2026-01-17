/**
 * Game State Management
 */

export class GameState {
  constructor() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.currentOffense = 1; // 1 or 2
    this.fieldPosition = 20; // Yard line (0-100, 0 = own goal, 100 = opponent goal)
    this.down = 1;
    this.yardsToGo = 10;
    this.yardsGained = 0;
    this.gameHistory = [];
    this.gameOver = false;
    this.quarter = 1;
    this.timeRemaining = 900; // 15 minutes in seconds (simplified)
  }

  /**
   * Switch possession to the other team
   */
  switchPossession() {
    this.currentOffense = this.currentOffense === 1 ? 2 : 1;
    this.fieldPosition = 20; // Reset to own 20-yard line after possession change
    this.down = 1;
    this.yardsToGo = 10;
  }

  /**
   * Process play outcome
   * @param {Object} outcome - Outcome from executePassPlay or executeRunPlay
   */
  processPlayOutcome(outcome) {
    let newFieldPosition = this.fieldPosition;
    let touchdownScored = false;
    
    // Handle possession change (interceptions)
    if (!outcome.possession) {
      this.switchPossession();
      // Interception means the other team gets the ball at their current field position
      // (or at the point of interception - simplified here)
      newFieldPosition = 100 - this.fieldPosition; // Flip field position
    }

    // Update scores
    if (outcome.points !== 0) {
      if (outcome.points > 0) {
        // Touchdown for current offense
        if (this.currentOffense === 1) {
          this.player1Score += outcome.points;
        } else {
          this.player2Score += outcome.points;
        }
      } else {
        // Points for other team (pick-6)
        if (this.currentOffense === 1) {
          this.player2Score += Math.abs(outcome.points);
        } else {
          this.player1Score += Math.abs(outcome.points);
        }
      }
      
      if (outcome.type === 'TOUCHDOWN' || outcome.type === 'INTERCEPTION_TD' || outcome.type === 'FUMBLE_TD') {
        touchdownScored = true;
        this.switchPossession();
        newFieldPosition = 20;
      }
    }

    // Update field position
    if (outcome.yards > 0 && outcome.possession) {
      const positionUpdate = this.updateFieldPosition(this.fieldPosition, outcome.yards, true);
      newFieldPosition = positionUpdate.yardLine;
      
      if (positionUpdate.touchdown && outcome.type !== 'TOUCHDOWN') {
        // Field position touchdown (reached end zone)
        if (this.currentOffense === 1) {
          this.player1Score += 6;
        } else {
          this.player2Score += 6;
        }
        touchdownScored = true;
        this.switchPossession();
        newFieldPosition = 20;
      }
    }

    this.fieldPosition = newFieldPosition;

    // Update down and distance
    if (outcome.possession && !touchdownScored && outcome.type !== 'INTERCEPTION' && outcome.type !== 'FUMBLE') {
      this.yardsGained += outcome.yards;
      this.yardsToGo -= outcome.yards;
      
      if (this.yardsToGo <= 0) {
        // First down achieved
        this.down = 1;
        this.yardsToGo = 10;
        this.yardsGained = 0;
      } else {
        this.down += 1;
        if (this.down > 4) {
          // Turnover on downs
          this.switchPossession();
          this.fieldPosition = 100 - this.fieldPosition; // Flip field position
          this.down = 1;
          this.yardsToGo = 10;
          this.yardsGained = 0;
        }
      }
    } else if (!outcome.possession) {
      // Interception or Fumble - reset down/distance for new offense
      this.down = 1;
      this.yardsToGo = 10;
      this.yardsGained = 0;
    }

    // Add to game history
    this.gameHistory.push({
      offense: this.currentOffense,
      playType: outcome.playType,
      roll: outcome.roll,
      outcome: outcome,
      score: { player1: this.player1Score, player2: this.player2Score },
      fieldPosition: this.fieldPosition,
      timestamp: new Date()
    });
  }

  /**
   * Update field position helper
   */
  updateFieldPosition(currentYardLine, yardsGained, isOffense) {
    let newYardLine = currentYardLine;
    
    if (isOffense) {
      newYardLine += yardsGained;
      if (newYardLine >= 100) {
        return { yardLine: 100, touchdown: true };
      }
    }
    
    return { yardLine: newYardLine, touchdown: false };
  }

  /**
   * Get current offensive team name
   */
  getCurrentOffenseName() {
    return `Player ${this.currentOffense}`;
  }

  /**
   * Get formatted field position string
   */
  getFieldPositionString() {
    const offense = this.currentOffense;
    const yardLine = this.fieldPosition;
    
    if (yardLine <= 50) {
      return `${offense === 1 ? 'P1' : 'P2'} ${yardLine} yd line`;
    } else {
      return `${offense === 1 ? 'P2' : 'P1'} ${100 - yardLine} yd line`;
    }
  }

  /**
   * Reset game state
   */
  reset() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.currentOffense = 1;
    this.fieldPosition = 20;
    this.down = 1;
    this.yardsToGo = 10;
    this.yardsGained = 0;
    this.gameHistory = [];
    this.gameOver = false;
  }
}
