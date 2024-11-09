// src/components/gamefi/RiskScoreDisplay.tsx
import React from 'react';
import { Shield, Heart, Award } from 'lucide-react';
import type { RiskMetrics } from '../../services/risk-scoring/types';

interface RiskScoreDisplayProps {
  metrics: RiskMetrics;
}

// Add default metrics to prevent undefined errors
const defaultMetrics: RiskMetrics = {
  positionSizeScore: 100,
  stopLossScore: 100,
  riskRewardScore: 100,
  accountRiskScore: 100,
  totalRiskScore: 100,
  healthLevel: 100,
  rank: 'S',
  statusEffects: ['Protected']
};

const RiskScoreDisplay: React.FC<RiskScoreDisplayProps> = ({ 
  metrics = defaultMetrics  // Provide default value
}) => {
  // Rest of the component remains the same
  const getRankColor = (rank: RiskMetrics['rank']) => {
    switch (rank) {
      case 'S': return 'text-purple-500';
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-red-500';
    }
  };

  const getHealthColor = (health: number) => {
    if (health > 80) return 'bg-green-500';
    if (health > 60) return 'bg-blue-500';
    if (health > 40) return 'bg-yellow-500';
    if (health > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      {/* Risk Score and Rank */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          <span className="font-semibold text-gray-700">Risk Score</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-bold text-gray-700">
            {metrics.totalRiskScore}
          </span>
          <span className={`text-2xl font-bold ${getRankColor(metrics.rank)}`}>
            {metrics.rank}
          </span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Account Health</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {metrics.healthLevel}%
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHealthColor(metrics.healthLevel)} transition-all duration-500`}
            style={{ width: `${metrics.healthLevel}%` }}
          />
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Position Size</span>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${metrics.positionSizeScore}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Stop Loss</span>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${metrics.stopLossScore}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Risk/Reward</span>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${metrics.riskRewardScore}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">Account Risk</span>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${metrics.accountRiskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Effects */}
      {metrics.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metrics.statusEffects.map((effect, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                effect === 'Protected' ? 'bg-green-100 text-green-800' :
                effect === 'Vulnerable' ? 'bg-red-100 text-red-800' :
                effect === 'Strengthened' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}
            >
              {effect}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskScoreDisplay;