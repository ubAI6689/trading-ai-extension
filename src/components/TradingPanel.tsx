import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  LineChart,
  Clock,
  Activity,
  Volume2,
  AlertTriangle,
  Battery,
  Clipboard
} from 'lucide-react';

const TradingPanel = () => {
  const [sentiment, setSentiment] = useState(0);
  const [price, setPrice] = useState(100);
  const [volume, setVolume] = useState(1000000);
  const [trend, setTrend] = useState('neutral');
  const [alerts, setAlerts] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setPrice(prev => {
        const newPrice = +(prev + change).toFixed(2);
        setTrend(change > 0 ? 'up' : 'down');
        
        // Add alert for significant moves
        if (Math.abs(change) > 1.5) {
          setAlerts(prev => [
            {
              id: Date.now(),
              message: `Significant ${change > 0 ? 'upward' : 'downward'} movement detected`,
              type: 'price'
            },
            ...prev.slice(0, 4) // Keep last 5 alerts
          ]);
        }
        return newPrice;
      });
      
      // Update other metrics
      setSentiment(prev => Math.max(-100, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setVolume(prev => Math.max(0, prev + (Math.random() - 0.5) * 100000));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const togglePanel = () => setIsCollapsed(!isCollapsed);

  // Mock data for time-based metrics
  const timeMetrics = [
    { label: '1H', value: '+0.5%', trend: 'up' },
    { label: '4H', value: '-0.2%', trend: 'down' },
    { label: '1D', value: '+1.2%', trend: 'up' },
    { label: '1W', value: '+3.5%', trend: 'up' }
  ];

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-96'
      } flex flex-col border-l border-gray-200`}
    >
      {/* Toggle Button */}
      <button 
        onClick={togglePanel}
        className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-l-md p-1 shadow-md border border-gray-200"
      >
        {isCollapsed ? '<' : '>'}
      </button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Market Analysis</h1>
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Price Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-gray-500" />
                <span className="text-2xl font-bold ml-1">{price}</span>
              </div>
              {trend === 'up' ? (
                <TrendingUp className="h-6 w-6 text-green-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-500" />
              )}
            </div>

            {/* Time-based metrics */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {timeMetrics.map(metric => (
                <div key={metric.label} className="text-center">
                  <div className="text-xs text-gray-500">{metric.label}</div>
                  <div className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Metrics */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold mb-3">Market Metrics</h2>
            
            {/* Sentiment */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Sentiment</span>
                <span className="text-sm font-medium">{sentiment > 0 ? 'Bullish' : 'Bearish'}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    sentiment > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.abs(sentiment)}%` }}
                />
              </div>
            </div>

            {/* Volume */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Volume</span>
                <span className="text-sm font-medium">
                  {volume.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: '60%' }}
                />
              </div>
            </div>

            {/* Strength Indicator */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Market Strength</span>
                <span className="text-sm font-medium">Moderate</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1 bg-green-500 rounded" />
                ))}
                {[4, 5].map(i => (
                  <div key={i} className="h-1 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold mb-3">Recent Alerts</h2>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="flex items-start p-2 bg-gray-50 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>AI Trading Assistant</span>
              <span>v0.1.0</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TradingPanel;