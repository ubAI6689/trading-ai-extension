// src/components/PatternDisplay.tsx
import React from 'react';
import { Activity, TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';
import type { Pattern } from '../services/pattern-recognition';

interface PatternDisplayProps {
  patterns: Pattern[];
  onPatternClick?: (pattern: Pattern) => void;
}

const patternDescriptions = {
  double_top: 'A bearish reversal pattern showing two peaks at similar price levels',
  double_bottom: 'A bullish reversal pattern showing two troughs at similar price levels',
  head_shoulders: 'A bearish reversal pattern with three peaks, the middle being highest',
  triangle: 'A continuation pattern showing converging trendlines',
  channel: 'A continuation pattern showing parallel trendlines'
};

const PatternDisplay: React.FC<PatternDisplayProps> = ({ patterns, onPatternClick }) => {
  if (!patterns.length) {
    return null;
  }

  const getDirectionIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <MinusCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-3">
        <Activity className="h-4 w-4 text-indigo-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Pattern Analysis</h3>
      </div>

      {patterns.map((pattern, index) => (
        <div 
          key={index}
          className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onPatternClick?.(pattern)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {pattern.type.replace('_', ' ')}
            </span>
            {getDirectionIcon(pattern.predictedDirection)}
          </div>
          
          <p className="text-xs text-gray-500 mb-2">
            {patternDescriptions[pattern.type]}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Confidence: {(pattern.confidence * 100).toFixed(0)}%
            </span>
            {(pattern.supportLevel || pattern.resistanceLevel) && (
              <span className="text-gray-500">
                {pattern.supportLevel ? `Support: $${pattern.supportLevel.toFixed(2)}` : ''}
                {pattern.resistanceLevel ? `Resistance: $${pattern.resistanceLevel.toFixed(2)}` : ''}
              </span>
            )}
          </div>
          
          <div className="mt-2 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pattern.confidence * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatternDisplay;
