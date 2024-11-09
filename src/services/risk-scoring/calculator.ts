// src/services/risk-scoring/calculator.ts
import { RiskMetrics, AccountState, DEFAULT_METRICS } from './types';

class RiskCalculator {
  private readonly WEIGHTS = {
    positionSize: 0.30,
    stopLoss: 0.25,
    riskReward: 0.25,
    accountRisk: 0.20
  };

  getDefaultMetrics(): RiskMetrics {
    return DEFAULT_METRICS;
  }

  calculateRiskMetrics(account: AccountState): RiskMetrics {
    if (!account.positions.length) {
      return this.getDefaultMetrics();
    }

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

    const healthLevel = totalRiskScore;
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
    let score = 100;
    account.positions.forEach(position => {
      const positionSizePercent = (position.size * position.leverage) / account.balance * 100;
      if (positionSizePercent > 2) {
        score -= (positionSizePercent - 2) * 15;
      }
    });
    return Math.max(0, Math.min(100, score));
  }

  private calculateStopLossScore(account: AccountState): number {
    let score = 100;
    account.positions.forEach(position => {
      if (!position.stopLoss) {
        score -= 40;
      } else {
        const stopLossPercent = Math.abs((position.stopLoss - position.entryPrice) / position.entryPrice * 100);
        if (stopLossPercent > 2) {
          score -= (stopLossPercent - 2) * 10;
        }
      }
    });
    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskRewardScore(account: AccountState): number {
    let score = 100;
    account.positions.forEach(position => {
      if (!position.stopLoss) {
        score -= 50;
      }
    });
    return Math.max(0, Math.min(100, score));
  }

  private calculateAccountRiskScore(account: AccountState): number {
    const totalRiskExposure = account.positions.reduce((total, position) => {
      const riskAmount = position.stopLoss 
        ? Math.abs(position.entryPrice - position.stopLoss) * position.size
        : position.size;
      return total + riskAmount;
    }, 0);

    const riskPercent = (totalRiskExposure / account.balance) * 100;
    const score = 100 - (riskPercent * 5);
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

  private determineRank(score: number): RiskMetrics['rank'] {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  private determineStatusEffects(account: AccountState): string[] {
    const effects: string[] = [];

    if (!account.positions.length) {
      return ['Protected'];
    }

    const hasAllStopLosses = account.positions.every(p => p.stopLoss);
    if (hasAllStopLosses) {
      effects.push('Protected');
    } else {
      effects.push('Vulnerable');
    }

    const hasHighLeverage = account.positions.some(p => p.leverage > 2);
    if (hasHighLeverage) {
      effects.push('Weakened');
    }

    const hasGoodPositionSizing = account.positions.every(p => 
      (p.size * p.leverage) / account.balance <= 0.02
    );
    if (hasGoodPositionSizing) {
      effects.push('Strengthened');
    }

    return effects;
  }
}

export const riskCalculator = new RiskCalculator();