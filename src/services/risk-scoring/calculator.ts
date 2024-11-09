// src/services/risk-scoring/calculator.ts
export class RiskCalculator {
    private readonly WEIGHTS = {
      positionSize: 0.30,
      stopLoss: 0.25,
      riskReward: 0.25,
      accountRisk: 0.20
    };
  
    calculateRiskMetrics(account: AccountState): RiskMetrics {
      const positionSizeScore = this.calculatePositionSizeScore(account);
      const stopLossScore = this.calculateStopLossScore(account);
      const riskRewardScore = this.calculateRiskRewardScore(account);
      const accountRiskScore = this.calculateAccountRiskScore(account);
  
      const totalRiskScore = this.calculateTotalScore({
        positionSizeScore,
        stopLossScore,
        riskRewardScore,
        accountRiskScore
      });
  
      const healthLevel = this.calculateHealthLevel(totalRiskScore);
      const rank = this.determineRank(totalRiskScore);
      const statusEffects = this.determineStatusEffects(account);
  
      return {
        positionSizeScore,
        stopLossScore,
        riskRewardScore,
        accountRiskScore,
        totalRiskScore,
        healthLevel,
        rank,
        statusEffects
      };
    }
  
    private calculatePositionSizeScore(account: AccountState): number {
      if (account.positions.length === 0) return 100;
      
      let score = 100;
      
      account.positions.forEach(position => {
        const positionSizePercent = (position.size * position.leverage) / account.balance * 100;
        
        // More aggressive scoring
        if (positionSizePercent > 2) {
          score -= (positionSizePercent - 2) * 15;  // Increased penalty
        }
      });
  
      return Math.max(0, Math.min(100, score));
    }
  
    private calculateStopLossScore(account: AccountState): number {
      if (account.positions.length === 0) return 100;
      
      let score = 100;
      
      account.positions.forEach(position => {
        if (!position.stopLoss) {
          score -= 40; // Increased penalty for no stop loss
        } else {
          const stopLossPercent = Math.abs((position.stopLoss - position.entryPrice) / position.entryPrice * 100);
          if (stopLossPercent > 2) {
            score -= (stopLossPercent - 2) * 10; // Increased penalty for wide stops
          }
        }
      });
  
      return Math.max(0, Math.min(100, score));
    }
  
    private calculateRiskRewardScore(account: AccountState): number {
      if (account.positions.length === 0) return 100;
      
      let score = 100;
      
      account.positions.forEach(position => {
        if (position.stopLoss && position.takeProfit) {
          const risk = Math.abs(position.stopLoss - position.entryPrice);
          const reward = Math.abs(position.takeProfit - position.entryPrice);
          const riskRewardRatio = reward / risk;
          
          if (riskRewardRatio < 2) {
            score -= (2 - riskRewardRatio) * 20;
          }
        } else if (!position.takeProfit && position.stopLoss) {
          score -= 25; // Penalty for missing take profit
        } else {
          score -= 50; // Bigger penalty for missing both
        }
      });
  
      return Math.max(0, Math.min(100, score));
    }
  
    private calculateAccountRiskScore(account: AccountState): number {
      if (account.positions.length === 0) return 100;
      
      const totalRiskExposure = account.positions.reduce((total, position) => {
        if (position.stopLoss) {
          const riskAmount = Math.abs(position.entryPrice - position.stopLoss) * position.size;
          return total + riskAmount;
        }
        return total + position.size; // Consider full position size as risk if no stop loss
      }, 0);
  
      const riskPercent = (totalRiskExposure / account.balance) * 100;
      let score = 100 - (riskPercent * 5); // Deduct 5 points for each 1% at risk
  
      return Math.max(0, Math.min(100, score));
    }
  
    private calculateTotalScore(scores: {
      positionSizeScore: number;
      stopLossScore: number;
      riskRewardScore: number;
      accountRiskScore: number;
    }): number {
      return Math.round(
        scores.positionSizeScore * this.WEIGHTS.positionSize +
        scores.stopLossScore * this.WEIGHTS.stopLoss +
        scores.riskRewardScore * this.WEIGHTS.riskReward +
        scores.accountRiskScore * this.WEIGHTS.accountRisk
      );
    }
  
    private calculateHealthLevel(totalScore: number): number {
      return totalScore; // Health level directly corresponds to total score
    }
  
    private determineRank(score: number): RiskMetrics['rank'] {
      if (score >= 90) return 'S';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B';
      if (score >= 60) return 'C';
      return 'D';
    }
  
    private determineStatusEffects(account: AccountState): string[] {
      const effects: string[] = [];
  
      if (account.positions.length === 0) {
        effects.push('Protected');
        return effects;
      }
  
      // Check for stop losses
      const hasAllStopLosses = account.positions.every(p => p.stopLoss);
      if (hasAllStopLosses) {
        effects.push('Protected');
      } else {
        effects.push('Vulnerable');
      }
  
      // Check leverage
      const hasHighLeverage = account.positions.some(p => p.leverage > 2);
      if (hasHighLeverage) {
        effects.push('Weakened');
      }
  
      // Check position sizing
      const hasGoodPositionSizing = account.positions.every(p => 
        (p.size * p.leverage) / account.balance <= 0.02
      );
      if (hasGoodPositionSizing) {
        effects.push('Strengthened');
      }
  
      return effects;
    }
  }
  
  // Create and export a single instance
  export const riskCalculator = new RiskCalculator();