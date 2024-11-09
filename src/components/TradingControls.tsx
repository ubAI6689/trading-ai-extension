// src/components/TradingControls.tsx
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TradingControlsProps {
  currentPrice: number;
  onTrade: (type: 'long' | 'short', size: number, stopLoss: number) => void;
}

const TradingControls: React.FC<TradingControlsProps> = ({ 
  currentPrice, 
  onTrade 
}) => {
  const [stopLossPercent, setStopLossPercent] = useState<number>(2);
  const [tradeSize, setTradeSize] = useState<number>(10000);
  const [showStopLossWarning, setShowStopLossWarning] = useState(false);

  const calculateStopLoss = (type: 'long' | 'short', percent: number) => {
    return type === 'long'
      ? currentPrice * (1 - percent / 100)
      : currentPrice * (1 + percent / 100);
  };

  const validateStopLoss = (type: 'long' | 'short', stopLossPrice: number) => {
    if (type === 'long' && stopLossPrice >= currentPrice) {
      return false;
    }
    if (type === 'short' && stopLossPrice <= currentPrice) {
      return false;
    }
    return true;
  };

  const handleTrade = (type: 'long' | 'short') => {
    const stopLossPrice = calculateStopLoss(type, stopLossPercent);
    
    if (!validateStopLoss(type, stopLossPrice)) {
      setShowStopLossWarning(true);
      return;
    }
    
    setShowStopLossWarning(false);
    onTrade(type, tradeSize, stopLossPrice);
  };

  return (
    <div className="space-y-4">
      {/* Trade Size Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Trade Size
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={tradeSize}
            onChange={(e) => setTradeSize(Math.max(0, Number(e.target.value)))}
            className="block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            min="1"
            step="1000"
          />
          <span className="text-sm text-gray-500 w-12">USD</span>
        </div>
      </div>

      {/* Stop Loss Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Stop Loss (%)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={stopLossPercent}
            onChange={(e) => setStopLossPercent(Math.max(0.1, Math.min(20, Number(e.target.value))))}
            className="block w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            min="0.1"
            max="20"
            step="0.1"
          />
          <span className="text-sm text-gray-500 w-12">%</span>
        </div>
      </div>

      {/* Stop Loss Preview */}
      <div className="flex justify-between text-sm text-gray-500">
        <div>
          Long Stop Loss: ${calculateStopLoss('long', stopLossPercent).toFixed(2)}
        </div>
        <div>
          Short Stop Loss: ${calculateStopLoss('short', stopLossPercent).toFixed(2)}
        </div>
      </div>

      {/* Warning Message */}
      {showStopLossWarning && (
        <div className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          Invalid stop loss placement
        </div>
      )}

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleTrade('long')}
          className="p-4 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center space-x-2 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Long ${tradeSize.toLocaleString()}</span>
        </button>
        <button
          onClick={() => handleTrade('short')}
          className="p-4 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center space-x-2 transition-colors"
        >
          <TrendingDown className="h-5 w-5" />
          <span>Short ${tradeSize.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};

export default TradingControls;