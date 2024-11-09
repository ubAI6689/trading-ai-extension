// src/components/PatternLoadingState.tsx
import React from 'react';
import { Brain } from 'lucide-react';

const PatternLoadingState: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 bg-indigo-50 rounded-lg p-3">
      <Brain className="h-4 w-4 text-indigo-500 animate-pulse" />
      <span className="text-sm text-indigo-600">Analyzing market patterns...</span>
    </div>
  );
};

export default PatternLoadingState;