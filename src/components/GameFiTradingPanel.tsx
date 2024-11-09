// src/components/GameFiTradingPanel.tsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Award, 
  Zap, 
  Heart, 
  Sword, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle 
} from 'lucide-react';
import { riskCalculator } from '../services/risk-scoring/calculator';
import { RiskMetrics, DEFAULT_METRICS } from '../services/risk-scoring/types';

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

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap mb-2 z-50">
        {content}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
};

const GameFiTradingPanel: React.FC<GameFiTradingPanelProps> = ({
  accountBalance,
  positions
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<RiskMetrics>(DEFAULT_METRICS);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Calculate level from XP
  useEffect(() => {
    const newLevel = Math.floor(xp / 1000) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      handleAlert(`Level Up! You're now level ${newLevel}`);
    }
  }, [xp, level]);

  // Update metrics when positions change
  useEffect(() => {
    const accountState = {
      balance: accountBalance,
      positions: positions.map(p => ({
        size: p.size,
        entryPrice: p.entryPrice,
        stopLoss: p.stopLoss,
        leverage: p.leverage
      })),
      totalEquity: accountBalance + positions.reduce((sum, p) => sum + p.size, 0)
    };

    const prevMetrics = metrics;
    const newMetrics = riskCalculator.calculateRiskMetrics(accountState);
    setMetrics(newMetrics);

    // Award XP for good trading practices
    if (positions.length > 0) {
      if (newMetrics.stopLossScore > prevMetrics.stopLossScore) {
        handleXpGain(10, 'Good stop loss placement');
      }
      if (newMetrics.positionSizeScore > 80) {
        handleXpGain(15, 'Proper position sizing');
      }
      if (newMetrics.totalRiskScore > 90) {
        handleXpGain(25, 'Excellent risk management');
      }
    }
  }, [accountBalance, positions]);

  const handleXpGain = (amount: number, reason: string) => {
    setXp(prev => prev + amount);
    handleAlert(`+${amount} XP: ${reason}`);
  };

  const handleAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-purple-500';
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  if (isCollapsed) {
    return (
      <div 
        className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-3 cursor-pointer z-50 hover:shadow-xl transition-all"
        onClick={() => setIsCollapsed(false)}
      >
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Risk Score: {metrics.totalRiskScore}</span>
            <span className="text-xs text-gray-500">Level {level} Trader</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      {/* XP Alert Animation */}
      {showAlert && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className="animate-bounce-in-down bg-indigo-500 text-white px-4 py-2 rounded-b-lg text-sm">
            {alertMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <h2 className="font-bold text-lg">Trading Guardian</h2>
          </div>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-white/80 hover:text-white"
          >
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Level & XP Bar */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">Level {level}</span>
          <span className="text-sm text-gray-500">XP: {xp % 1000}/1000</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${(xp % 1000) / 10}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Risk Score */}
        <div className="col-span-2 bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Risk Score</span>
              <Tooltip content="Overall trading safety score based on position size, stop losses, and account risk">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <span className={`text-2xl font-bold ${getRankColor(metrics.rank)}`}>
              {metrics.rank}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                metrics.totalRiskScore > 80 ? 'bg-green-500' :
                metrics.totalRiskScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.totalRiskScore}%` }}
            />
          </div>
        </div>

        {/* Account Safety */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-medium">Account Safety</span>
            <Tooltip content="Measures how well your account is protected against losses">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <span className="text-xl font-bold">{metrics.healthLevel}%</span>
        </div>

        {/* Position Strength */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Sword className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Position Strength</span>
            <Tooltip content="Indicates how well your positions are sized and protected">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <span className="text-xl font-bold">{metrics.positionSizeScore}%</span>
        </div>
      </div>

      {/* Trading Status */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <span className="font-medium">Trading Status</span>
          <Tooltip content="Current state of your trading position and risk management">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <div className="flex flex-wrap gap-2">
          {metrics.statusEffects.map((effect, index) => (
            <Tooltip
              key={index}
              content={
                effect === 'Protected' ? 'All positions have stop losses in place' :
                effect === 'Vulnerable' ? 'Some positions lack stop loss protection' :
                effect === 'Strengthened' ? 'Position sizes are within safe limits' :
                'High leverage detected - increased risk'
              }
            >
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium cursor-help ${
                  effect === 'Protected' ? 'bg-green-100 text-green-800' :
                  effect === 'Vulnerable' ? 'bg-red-100 text-red-800' :
                  effect === 'Strengthened' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                {effect}
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Trading Achievements */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2 mb-3">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">Trading Achievements</span>
          <Tooltip content="Milestones reached through good trading practices">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <div className="space-y-2">
          {metrics.totalRiskScore > 80 && (
            <Tooltip content="Maintained excellent risk management across all positions">
              <div className="flex items-center space-x-2 text-sm text-gray-600 cursor-help">
                <Target className="h-4 w-4 text-green-500" />
                <span>Risk Management Master</span>
              </div>
            </Tooltip>
          )}
          {metrics.stopLossScore > 90 && (
            <Tooltip content="Consistently using proper stop losses">
              <div className="flex items-center space-x-2 text-sm text-gray-600 cursor-help">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Stop Loss Expert</span>
              </div>
            </Tooltip>
          )}
          {metrics.positionSizeScore > 90 && (
            <Tooltip content="Maintaining safe position sizes">
              <div className="flex items-center space-x-2 text-sm text-gray-600 cursor-help">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Position Size Master</span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameFiTradingPanel;