// src/components/TradingSimulator.tsx
import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import GameFiTradingPanel from './GameFiTradingPanel';
import PriceChart from './PriceChart';
import TradingControls from './TradingControls';

interface Position {
  id: number;
  type: 'long' | 'short';
  size: number;
  entryPrice: number;
  stopLoss: number;
  leverage: number;
  timestamp: number;
}

const TradingSimulator: React.FC = () => {
  const [price, setPrice] = useState(75000);
  const [balance, setBalance] = useState(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showGameFi, setShowGameFi] = useState(true);
  
  // Simulate price movements
  useEffect(() => {
    let prevPrice = price;
    const interval = setInterval(() => {
      setPrice(prev => {
        const volatility = 0.0005; // 0.05% volatility
        const trend = 0.0001; // Slight upward trend
        const randomWalk = (Math.random() - 0.45) * volatility * prev;
        const smoothingFactor = 0.7;
        
        const newPrice = prev + (randomWalk * smoothingFactor) + (trend * prev);
        prevPrice = newPrice;
        
        return Math.max(newPrice, 100);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle new trades
  const handleTrade = (type: 'long' | 'short', size: number, stopLoss: number) => {
    const newPosition: Position = {
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

  // Handle closing positions
  const closePosition = (positionId: number) => {
    const position = positions.find(p => p.id === positionId);
    if (position) {
      const pnl = position.type === 'long' 
        ? (price - position.entryPrice) * position.size / position.entryPrice
        : (position.entryPrice - price) * position.size / position.entryPrice;
        
      setBalance(prev => prev + position.size + pnl);
      setPositions(prev => prev.filter(p => p.id !== positionId));
    }
  };

  // Check for stop losses
  useEffect(() => {
    positions.forEach(position => {
      if (position.type === 'long' && price <= position.stopLoss) {
        closePosition(position.id);
      } else if (position.type === 'short' && price >= position.stopLoss) {
        closePosition(position.id);
      }
    });
  }, [price, positions]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Trading Panel */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
          {/* Header */}
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
          
          {/* Current Price */}
          <div className="text-4xl font-bold mb-4">
            ${price.toFixed(2)}
          </div>
          
          {/* Chart */}
          <div className="mb-6">
            <PriceChart currentPrice={price} positions={positions} />
          </div>
          
          {/* Trading Controls */}
          <TradingControls 
            currentPrice={price}
            onTrade={handleTrade}
          />
        </div>
        
        {/* Account Panel */}
        <div className="space-y-4">
          {/* Account Balance */}
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
                      {position.type.toUpperCase()} ${position.size.toLocaleString()}
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
                  <div className="text-sm text-gray-500">
                    Stop Loss: ${position.stopLoss.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    PNL: ${(position.type === 'long' 
                      ? (price - position.entryPrice) * position.size / position.entryPrice 
                      : (position.entryPrice - price) * position.size / position.entryPrice
                    ).toFixed(2)}
                  </div>
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