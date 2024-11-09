// src/content.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import GameFiTradingPanel from './components/GameFiTradingPanel';
import './styles/globals.css';

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

  // Render React component
  const root = createRoot(container);
  root.render(<GameFiTradingPanel />);
}

// Inject when content script loads
injectGameFiPanel();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_PANEL') {
    const panel = document.getElementById('trading-gamefi-root');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }
});