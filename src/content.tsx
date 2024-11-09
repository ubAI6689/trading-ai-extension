// src/content.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import GameFiTradingPanel from './components/GameFiTradingPanel';
import { riskCalculator } from './services/risk-scoring/calculator';
import './styles/globals.css';

// Type for messages from the background script
interface TradeData {
  balance: number;
  positions: Array<{
    size: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    leverage: number;
  }>;
  totalEquity: number;
}

// Observer to watch for trading platform DOM changes
const setupTradingObserver = (callback: (data: TradeData) => void) => {
  // This is a placeholder - you'll need to customize this for specific trading platforms
  const observer = new MutationObserver(() => {
    // Example of extracting data from a trading platform's DOM
    const data = extractTradingData();
    if (data) {
      callback(data);
    }
  });

  // Observe changes to the trading platform's relevant elements
  const targetNode = document.querySelector('#trading-platform-root');
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  return observer;
};

// Function to extract trading data from the platform's DOM
const extractTradingData = (): TradeData | null => {
  try {
    // This is a placeholder - implement specific selectors for each supported platform
    const balance = parseFloat(document.querySelector('.account-balance')?.textContent || '0');
    const positions = Array.from(document.querySelectorAll('.position-row')).map(row => ({
      size: parseFloat(row.querySelector('.position-size')?.textContent || '0'),
      entryPrice: parseFloat(row.querySelector('.entry-price')?.textContent || '0'),
      stopLoss: parseFloat(row.querySelector('.stop-loss')?.textContent || '0'),
      takeProfit: parseFloat(row.querySelector('.take-profit')?.textContent || '0'),
      leverage: parseFloat(row.querySelector('.leverage')?.textContent || '1'),
    }));
    const totalEquity = parseFloat(document.querySelector('.total-equity')?.textContent || '0');

    return { balance, positions, totalEquity };
  } catch (error) {
    console.error('Error extracting trading data:', error);
    return null;
  }
};

function injectGameFiPanel() {
  // Remove existing instance if any
  const existingPanel = document.getElementById('trading-gamefi-root');
  if (existingPanel) {
    existingPanel.remove();
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'trading-gamefi-root';
  document.body.appendChild(container);

  // Add Tailwind CDN
  const tailwindLink = document.createElement('link');
  tailwindLink.href = 'https://cdn.tailwindcss.com';
  tailwindLink.rel = 'stylesheet';
  document.head.appendChild(tailwindLink);

  // Add container styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    #trading-gamefi-root {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
  `;
  document.head.appendChild(styleSheet);

  // Initialize the panel with the GameFi functionality
  const root = createRoot(container);
  
  // Initial data extraction
  const initialData = extractTradingData() || {
    balance: 0,
    positions: [],
    totalEquity: 0
  };

  // Calculate initial risk metrics
  const initialMetrics = riskCalculator.calculateRiskMetrics(initialData);

  // Set up observer for real-time updates
  const observer = setupTradingObserver((data) => {
    // Calculate new metrics whenever trading data changes
    const metrics = riskCalculator.calculateRiskMetrics(data);
    // Use Chrome messaging to update the panel
    chrome.runtime.sendMessage({
      type: 'UPDATE_RISK_METRICS',
      payload: metrics
    });
  });

  // Render the panel with initial data
  root.render(
    <GameFiTradingPanel 
      initialMetrics={initialMetrics}
      onClose={() => {
        observer.disconnect();
        container.remove();
      }}
    />
  );

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_RISK_METRICS') {
      // Handle risk metrics updates
      console.log('Received updated risk metrics:', message.payload);
    }
  });
}

// Function to detect if we're on a supported trading platform
const isSupportedPlatform = (): boolean => {
  // Add logic to detect supported trading platforms
  const supportedPlatforms = [
    'binance.com',
    'coinbase.com',
    'kraken.com',
    // Add more platforms as needed
  ];
  
  return supportedPlatforms.some(platform => 
    window.location.hostname.includes(platform)
  );
};

// Only inject if we're on a supported platform
if (isSupportedPlatform()) {
  injectGameFiPanel();
}