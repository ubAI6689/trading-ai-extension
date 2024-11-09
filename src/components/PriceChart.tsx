// src/components/PriceChart.tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

interface PriceChartProps {
  currentPrice: number;
  positions: Array<{
    id: number;
    type: string;
    size: number;
    entryPrice: number;
    stopLoss?: number;
  }>;
}

interface PriceData {
  timestamp: number;
  price: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ currentPrice, positions }) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [chartWidth, setChartWidth] = useState(600);
  const chartHeight = 300;

  // Update price history
  useEffect(() => {
    setPriceHistory(prev => {
      const newHistory = [
        ...prev,
        { timestamp: Date.now(), price: currentPrice }
      ].slice(-30); // Reduced to 30 points for smoother appearance
      return newHistory;
    });
  }, [currentPrice]);

  // Responsive chart width
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.chart-container');
      if (container) {
        setChartWidth(container.clientWidth - 40); // Subtract padding
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format timestamp for x-axis
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="text-sm text-gray-600">
            Time: {formatXAxis(payload[0].payload.timestamp)}
          </p>
          <p className="text-sm font-bold text-indigo-600">
            Price: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const minPrice = Math.min(...priceHistory.map(d => d.price));
  const maxPrice = Math.max(...priceHistory.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  const yAxisDomain = [
    minPrice - priceRange * 0.1, // Add 10% padding
    maxPrice + priceRange * 0.1
  ];

  return (
    <div className="chart-container w-full">
      <LineChart
        width={chartWidth}
        height={chartHeight}
        data={priceHistory}
        margin={{ top: 5, right: 30, bottom: 5, left: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={formatXAxis}
          interval="preserveEnd"
          minTickGap={50}  // Increased gap between ticks
        />
        <YAxis 
          domain={yAxisDomain}
          tickFormatter={(value) => `$${value.toFixed(0)}`}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Smoother price line */}
        <Line
          type="monotoneX"  // Changed to monotoneX for smoother curve
          dataKey="price"
          stroke="#4F46E5"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}  // Disable animation for smoother updates
        />
        
        {/* Position lines remain the same */}
        {positions.map((position) => (
          <React.Fragment key={position.id}>
            <ReferenceLine
              y={position.entryPrice}
              stroke={position.type === 'long' ? '#10B981' : '#EF4444'}
              strokeDasharray="3 3"
              label={{
                value: `${position.type.toUpperCase()} $${position.entryPrice.toFixed(2)}`,
                position: 'left',
                fill: position.type === 'long' ? '#10B981' : '#EF4444'
              }}
            />
            {position.stopLoss && (
              <ReferenceLine
                y={position.stopLoss}
                stroke="#EF4444"
                strokeDasharray="3 3"
                label={{
                  value: `SL $${position.stopLoss.toFixed(2)}`,
                  position: 'right',
                  fill: '#EF4444'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </LineChart>
    </div>
  );
};

export default PriceChart;