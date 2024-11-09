// src/components/TradingSimulator.tsx
import React, { useState, useEffect } from 'react';
import { Line, TrendingUp, TrendingDown, DollarSign, PlayCircle, Shield } from 'lucide-react';
import GameFiTradingPanel from './GameFiTradingPanel';
import { riskCalculator } from '../services/risk-scoring/calculator';

const TradingSimulator = () => {
  const [price, setPrice] = useState(50000);
  const [balance, setBalance] = useState(100000);
  const [positions, setPositions] = useState([]);
  const [showGameFi, setShowGameFi] = useState(true);
  
  // Simulate price movements
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 100;
        return Math.max(prev + change, 100);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTrade = (type, size, stopLoss = null) => {
    const newPosition = {
      id: Date.now(),
      type,
      size,
      entryPrice: price,
      stopLoss,
      leverage: 1,
      timestamp: Date.now()
    };
    
    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - size);
  };

  const closePosition = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      const pnl = position.type === 'long' 
        ? (price - position.entryPrice) * position.size / position.entryPrice
        : (position.entryPrice - price) * position.size / position.entryPrice;
        
      setBalance(prev => prev + position.size + pnl);
      setPositions(prev => prev.filter(p => p.id !== positionId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trading Chart */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">BTC/USD Simulator</h2>
            <button
              onClick={() => setShowGameFi(prev => !prev)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              <Shield className="h-5 w-5" />
              <span>Toggle GameFi Panel</span>
            </button>
          </div>
          
          <div className="text-4xl font-bold mb-4">
            ${price.toFixed(2)}
          </div>
          
          {/* Simple Chart Visual */}
          <div className="h-64 border rounded p-4 mb-6 flex items-center justify-center bg-gray-50">
            <span className="text-gray-500">Price Chart Simulation</span>
          </div>
          
          {/* Trading Controls */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTrade('long', 10000, price * 0.95)}
              className="p-4 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Long $10,000</span>
            </button>
            <button
              onClick={() => handleTrade('short', 10000, price * 1.05)}
              className="p-4 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center space-x-2"
            >
              <TrendingDown className="h-5 w-5" />
              <span>Short $10,000</span>
            </button>
          </div>
        </div>
        
        {/* Account Info */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Account Balance</h3>
            <div className="text-2xl font-bold text-green-500">
              ${balance.toFixed(2)}
            </div>
          </div>
          
          {/* Open Positions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Open Positions</h3>
            <div className="space-y-3">
              {positions.map(position => (
                <div key={position.id} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className={position.type === 'long' ? 'text-green-500' : 'text-red-500'}>
                      {position.type.toUpperCase()} ${position.size}
                    </span>
                    <button
                      onClick={() => closePosition(position.id)}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Entry: ${position.entryPrice.toFixed(2)}
                  </div>
                  {position.stopLoss && (
                    <div className="text-sm text-gray-500">
                      Stop Loss: ${position.stopLoss.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
              {positions.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No open positions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* GameFi Panel */}
      {/* GameFi Panel - Updated props */}
      {showGameFi && (
        <GameFiTradingPanel 
          accountBalance={balance}
          positions={positions}
        />
      )}
    </div>
  );
};

export default TradingSimulator;