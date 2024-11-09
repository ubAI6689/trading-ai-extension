// src/content.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import TradingPanel from './components/TradingPanel';
import './styles/globals.css';

function injectTradingPanel() {
  // Remove existing instance if any
  const existingPanel = document.getElementById('trading-ai-root');
  if (existingPanel) {
    existingPanel.remove();
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'trading-ai-root';
  document.body.appendChild(container);

  // Add Tailwind CDN
  const tailwindLink = document.createElement('link');
  tailwindLink.href = 'https://cdn.tailwindcss.com';
  tailwindLink.rel = 'stylesheet';
  document.head.appendChild(tailwindLink);

  // Add container styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    #trading-ai-root {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 2147483647;
    }
  `;
  document.head.appendChild(styleSheet);

  // Render React component
  const root = createRoot(container);
  root.render(<TradingPanel />);
}

// Inject when content script loads
injectTradingPanel();