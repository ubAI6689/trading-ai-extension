import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  X,
  BarChart3,
  Activity
} from 'lucide-react';
import config from '../config';
import PatternDisplay from './PatternDisplay';
import { usePatternRecognition } from '../hooks/usePatternRecognition';

// Types for our price data
interface PriceData {
  price: number;
  timestamp: number;
  change24h: number;
  volume24h: number;
  symbol: string;
  name: string;
  sentiment: {
    value: number;  // -100 to 100
    indicators: {
      price: number;
      volume: number;
      momentum: number;
    };
  };
}

// Add after PriceData interface
interface PatternData {
  timestamp: number;
  price: number;
  volume: number;
}

interface Alert {
  id: number;
  message: string;
  type: 'price' | 'volume' | 'technical';
  timestamp: number;
}

const calculateSentiment = (
  currentPrice: number, 
  change24h: number, 
  volume24h: number,
  prevData: PriceData | null
): PriceData['sentiment'] => {
  // Price sentiment (-100 to 100)
  const priceSentiment = Math.min(Math.max(change24h * 10, -100), 100);
  
  // Volume sentiment (-100 to 100)
  let volumeSentiment = 0;
  if (prevData && prevData.volume24h) {
    const volumeChange = ((volume24h - prevData.volume24h) / prevData.volume24h) * 100;
    volumeSentiment = Math.min(Math.max(volumeChange * 5, -100), 100);
  }

  // Momentum (based on price acceleration)
  let momentumSentiment = 0;
  if (prevData && prevData.change24h) {
    const acceleration = change24h - prevData.change24h;
    momentumSentiment = Math.min(Math.max(acceleration * 20, -100), 100);
  }

  // Overall sentiment (weighted average)
  const value = (
    (priceSentiment * 0.5) + 
    (volumeSentiment * 0.3) + 
    (momentumSentiment * 0.2)
  );

  return {
    value,
    indicators: {
      price: priceSentiment,
      volume: volumeSentiment,
      momentum: momentumSentiment
    }
  };
};

const SentimentIndicator: React.FC<{ sentiment: number, label: string }> = ({ sentiment, label }) => {
  const getColor = (value: number) => {
    if (value > 30) return 'bg-green-500';
    if (value > 0) return 'bg-green-300';
    if (value > -30) return 'bg-red-300';
    return 'bg-red-500';
  };

  const width = Math.abs(sentiment);
  const direction = sentiment >= 0 ? 'left' : 'right';

  return (
    <div className="my-1">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{sentiment.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(sentiment)} transition-all duration-500`}
          style={{ 
            width: `${width}%`,
            marginLeft: direction === 'left' ? 0 : `${100 - width}%`
          }}
        />
      </div>
    </div>
  );
};

const COIN_ID = 'bitcoin';

const TradingPanel: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prevData, setPrevData] = useState<PriceData | null>(null);

  // Add after your existing state declarations, before fetchPriceData
  const [priceHistory, setPriceHistory] = useState<PatternData[]>([]);

  // Add the pattern recognition hook here
  const { analysis, isLoading: isAnalyzing } = usePatternRecognition({
    data: priceHistory,
    enabled: !isCollapsed,
    interval: 30000
  });

  const fetchPriceData = async () => {
    try {
      setIsLoading(true);
      
      if (!config.COINGECKO_API_KEY) {
        throw new Error('API key not configured');
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_ID}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&x_cg_demo_api_key=${config.COINGECKO_API_KEY}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data[COIN_ID]) {
        throw new Error('Invalid API response format');
      }

      const coinData = data[COIN_ID];

      const sentiment = calculateSentiment(
        coinData.usd,
        coinData.usd_24h_change || 0,
        coinData.usd_24h_vol || 0,
        prevData
      );
      
      const newPriceData: PriceData = {
        price: coinData.usd,
        timestamp: Date.now(),
        change24h: coinData.usd_24h_change || 0,
        volume24h: coinData.usd_24h_vol || 0,
        symbol: COIN_ID.toUpperCase(),
        name: COIN_ID.charAt(0).toUpperCase() + COIN_ID.slice(1),
        sentiment
      };

      setPrevData(priceData);
      setPriceData(newPriceData);

      // Add after setPriceData(newPriceData);
      // Add to price history for pattern recognition
      const newPatternData: PatternData = {
        timestamp: newPriceData.timestamp,
        price: newPriceData.price,
        volume: newPriceData.volume24h
      };

      setPriceHistory(prev => {
        const history = [...prev, newPatternData];
        // Keep last 100 data points
        return history.slice(-100);
      });
      setError(null);

      // Check for significant price movements
      if (priceData && Math.abs(newPriceData.change24h) > 5) {
        const newAlert: Alert = {
          id: Date.now(),
          message: `${newPriceData.name} moved ${newPriceData.change24h > 0 ? 'up' : 'down'} by ${Math.abs(newPriceData.change24h).toFixed(2)}%`,
          type: 'price',
          timestamp: Date.now()
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }

      // Check for sentiment shifts
      if (prevData && Math.abs(sentiment.value - prevData.sentiment.value) > 30) {
        const newAlert: Alert = {
          id: Date.now(),
          message: `Strong ${sentiment.value > prevData.sentiment.value ? 'positive' : 'negative'} sentiment shift detected`,
          type: 'technical',
          timestamp: Date.now()
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }

    } catch (err) {
      console.error('Error fetching price data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price data');
      setPriceData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(fetchPriceData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isCollapsed) {
    return (
      <div 
        className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-2 cursor-pointer z-50"
        onClick={() => setIsCollapsed(false)}
      >
        <DollarSign className="h-6 w-6 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">
          {priceData ? `${priceData.name} (${priceData.symbol})` : 'Market Overview'}
        </h2>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {error ? (
          <div className="text-red-500 text-sm mb-4 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : isLoading && !priceData ? (
          <div className="text-center py-4 text-gray-500">
            Loading price data...
          </div>
        ) : priceData ? (
          <>
            {/* Price Display */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${priceData.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <div className={`flex items-center ${
                  priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {priceData.change24h >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <span className="font-medium">
                    {Math.abs(priceData.change24h).toFixed(2)}%
                  </span>
                </div>
              </div>
              {priceData.volume24h > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  Volume: ${(priceData.volume24h / 1000000).toFixed(2)}M
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(priceData.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Sentiment Section */}
            <div className="mb-4 border-t border-gray-100 pt-4">
              <div className="flex items-center mb-2">
                <Activity className="h-4 w-4 text-gray-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-700">Market Sentiment</h3>
              </div>
              
              <div className="space-y-3">
                <SentimentIndicator 
                  sentiment={priceData.sentiment.value} 
                  label="Overall Sentiment" 
                />
                <SentimentIndicator 
                  sentiment={priceData.sentiment.indicators.price} 
                  label="Price Action" 
                />
                <SentimentIndicator 
                  sentiment={priceData.sentiment.indicators.volume} 
                  label="Volume" 
                />
                <SentimentIndicator 
                  sentiment={priceData.sentiment.indicators.momentum} 
                  label="Momentum" 
                />
              </div>
            </div>

            {/* Add after Sentiment Section and before Alerts */}
            {/* Pattern Recognition */}
            {isAnalyzing ? (
              <div className="text-center py-2 text-gray-500 text-sm">
                Analyzing patterns...
              </div>
            ) : analysis && (
              <div className="mb-4 border-t border-gray-100 pt-4">
                <PatternDisplay 
                  patterns={analysis.patterns}
                  onPatternClick={(pattern) => {
                    // Add an alert when pattern is clicked
                    setAlerts(prev => [{
                      id: Date.now(),
                      message: `Selected ${pattern.type.replace('_', ' ')} pattern with ${pattern.predictedDirection} trend`,
                      type: 'technical',
                      timestamp: Date.now()
                    }, ...prev.slice(0, 4)]);
                  }}
                />
              </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className="text-sm bg-gray-50 p-2 rounded flex items-start"
                  >
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-gray-700">{alert.message}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TradingPanel;