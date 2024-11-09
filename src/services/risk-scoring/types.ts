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
    positionSizeScore: number;  // 0-100
    stopLossScore: number;      // 0-100
    riskRewardScore: number;    // 0-100
    accountRiskScore: number;   // 0-100
    totalRiskScore: number;     // 0-100
    healthLevel: number;        // 0-100
    rank: 'S' | 'A' | 'B' | 'C' | 'D';
    statusEffects: string[];
  }