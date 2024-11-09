// src/services/achievements.ts
export const achievements = {
    RISK_MASTER: {
      id: 'risk_master',
      name: 'Risk Master',
      description: 'Maintained healthy risk levels for 7 days straight',
      points: 100
    },
    STOP_LOSS_SAGE: {
      id: 'stop_loss_sage',
      name: 'Stop Loss Sage',
      description: 'Protected all trades with stop losses for 24 hours',
      points: 50
    },
    POSITION_MASTER: {
      id: 'position_master',
      name: 'Position Master',
      description: 'Kept all position sizes under 2% for a week',
      points: 75
    }
  } as const;