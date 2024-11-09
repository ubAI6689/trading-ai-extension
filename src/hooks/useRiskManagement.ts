// src/hooks/useRiskManagement.ts
import { useState, useEffect } from 'react';

interface Position {
  size: number;
  stopLoss: number | null;
  entryPrice: number;
  leverage: number;
}

interface RiskMetrics {
  score: number;
  accountHealth: number;
  achievements: Achievement[];
  alerts: RiskAlert[];
}

export const useRiskManagement = (
  positions: Position[],
  accountBalance: number
) => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    score: 100,
    accountHealth: 100,
    achievements: [],
    alerts: []
  });

  useEffect(() => {
    const calculateRiskMetrics = () => {
      let score = 100;
      let health = 100;
      const newAlerts: RiskAlert[] = [];
      const newAchievements: Achievement[] = [];

      // Check position sizes
      positions.forEach(position => {
        const positionRisk = (position.size * position.leverage) / accountBalance;
        
        if (positionRisk > 0.1) {
          score -= 10;
          health -= 15;
          newAlerts.push({
            id: Date.now().toString(),
            type: 'danger',
            message: 'Position size exceeds 10% of account balance',
            timestamp: Date.now()
          });
        }

        // Check stop losses
        if (!position.stopLoss) {
          score -= 5;
          health -= 10;
          newAlerts.push({
            id: Date.now().toString(),
            type: 'warning',
            message: 'Position opened without stop loss',
            timestamp: Date.now()
          });
        }
      });

      // Add achievements
      if (positions.every(p => p.stopLoss)) {
        newAchievements.push({
          id: 'responsible_trader',
          name: 'Responsible Trader',
          description: 'All positions protected with stop losses',
          earned: true,
          timestamp: Date.now()
        });
      }

      setRiskMetrics({
        score: Math.max(0, score),
        accountHealth: Math.max(0, health),
        achievements: [...newAchievements],
        alerts: [...newAlerts]
      });
    };

    calculateRiskMetrics();
  }, [positions, accountBalance]);

  return riskMetrics;
};