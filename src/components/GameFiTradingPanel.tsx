// src/components/GameFiTradingPanel.tsx
import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, X, DollarSign } from 'lucide-react';
import RiskScore from './gamefi/RiskScore';
import { useRiskManagement } from '../hooks/useRiskManagement';
import config from '../config';

interface GameFiTradingPanelProps {
  onClose?: () => void;
}

const GameFiTradingPanel: React.FC<GameFiTradingPanelProps> = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accountBalance, setAccountBalance] = useState(10000); // Demo balance
  const [positions, setPositions] = useState([]); // Will be populated with real positions

  const riskMetrics = useRiskManagement(positions, accountBalance);

  if (isCollapsed) {
    return (
      <div 
        className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-3 cursor-pointer z-50 flex items-center space-x-2"
        onClick={() => setIsCollapsed(false)}
      >
        <Shield className="h-5 w-5 text-indigo-500" />
        <span className="font-medium text-sm">
          Risk Score: {riskMetrics.score}
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
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <RiskScore 
          score={riskMetrics.score}
          accountHealth={riskMetrics.accountHealth}
          achievements={riskMetrics.achievements}
          recentAlerts={riskMetrics.alerts}
        />
      </div>

      {/* Footer with Account Balance */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Account Balance</span>
          <span className="font-medium">
            ${accountBalance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameFiTradingPanel;