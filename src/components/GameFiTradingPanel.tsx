// src/components/GameFiTradingPanel.tsx
import React, { useState, useEffect } from 'react';
import { Shield, X, ChevronRight } from 'lucide-react';
import RiskScoreDisplay from './gamefi/RiskScoreDisplay';
import { riskCalculator } from '../services/risk-scoring/calculator';
import type { RiskMetrics, TradePosition, AccountState } from '../services/risk-scoring/types';

interface GameFiTradingPanelProps {
  accountBalance: number;
  positions: Array<{
    id: number;
    type: string;
    size: number;
    entryPrice: number;
    stopLoss?: number;
    leverage: number;
  }>;
}

const GameFiTradingPanel: React.FC<GameFiTradingPanelProps> = ({
  accountBalance,
  positions
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<RiskMetrics>({
    positionSizeScore: 100,
    stopLossScore: 100,
    riskRewardScore: 100,
    accountRiskScore: 100,
    totalRiskScore: 100,
    healthLevel: 100,
    rank: 'S',
    statusEffects: ['Protected']
  });

  // Update metrics whenever positions or balance changes
  useEffect(() => {
    const accountState: AccountState = {
      balance: accountBalance,
      positions: positions.map(p => ({
        size: p.size,
        entryPrice: p.entryPrice,
        stopLoss: p.stopLoss,
        leverage: p.leverage
      })),
      totalEquity: accountBalance + positions.reduce((sum, p) => sum + p.size, 0)
    };

    const newMetrics = riskCalculator.calculateRiskMetrics(accountState);
    setMetrics(newMetrics);
  }, [accountBalance, positions]);

  if (isCollapsed) {
    return (
      <div 
        className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-3 cursor-pointer z-50 flex items-center space-x-2"
        onClick={() => setIsCollapsed(false)}
      >
        <Shield className="h-5 w-5 text-indigo-500" />
        <span className="font-medium text-sm">
          Risk Score: {metrics.totalRiskScore}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      {/* Header */}
      <div className="p-4 bg-indigo-50 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          <h2 className="font-semibold text-gray-700">Trading Guardian</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <RiskScoreDisplay metrics={metrics} />
      </div>

      {/* Debug Info - Remove in production */}
      <div className="p-4 border-t text-xs text-gray-500">
        <div>Active Positions: {positions.length}</div>
        <div>Account Balance: ${accountBalance.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default GameFiTradingPanel;