// src/services/risk-scoring/types.ts
export interface TradePosition {
    size: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    leverage: number;
  }
  
  export interface AccountState {
    balance: number;
    positions: TradePosition[];
    totalEquity: number;
  }
  
  export interface RiskMetrics {
    positionSizeScore: number;
    stopLossScore: number;
    riskRewardScore: number;
    accountRiskScore: number;
    totalRiskScore: number;
    healthLevel: number;
    rank: 'S' | 'A' | 'B' | 'C' | 'D';
    statusEffects: string[];
  }
  
  export const DEFAULT_METRICS: RiskMetrics = {
    positionSizeScore: 100,
    stopLossScore: 100,
    riskRewardScore: 100,
    accountRiskScore: 100,
    totalRiskScore: 100,
    healthLevel: 100,
    rank: 'S',
    statusEffects: ['Protected']
  };