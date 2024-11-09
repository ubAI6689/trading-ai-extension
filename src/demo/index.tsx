// src/demo/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import TradingSimulator from '../components/TradingSimulator';
import '../styles/globals.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TradingSimulator />);
}