// src/components/gamefi/RiskScore.tsx
import React from 'react';
import { Shield, Award, AlertTriangle } from 'lucide-react';

interface RiskScoreProps {
  score: number;  // 0-100
  accountHealth: number;  // 0-100
  achievements: Achievement[];
  recentAlerts: RiskAlert[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  timestamp?: number;
}

interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: number;
}

const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  accountHealth,
  achievements,
  recentAlerts
}) => {
  const getHealthColor = (health: number) => {
    if (health > 70) return 'bg-green-500';
    if (health > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Risk Score Display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Shield className={`h-5 w-5 ${score > 70 ? 'text-green-500' : 'text-orange-500'} mr-2`} />
          <span className="font-medium">Risk Score</span>
        </div>
        <span className={`text-lg font-bold ${score > 70 ? 'text-green-500' : 'text-orange-500'}`}>
          {score}
        </span>
      </div>

      {/* Account Health Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Account Health</span>
          <span>{accountHealth}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getHealthColor(accountHealth)} transition-all duration-500`}
            style={{ width: `${accountHealth}%` }}
          />
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-2">
        <div className="flex items-center">
          <Award className="h-4 w-4 text-indigo-500 mr-2" />
          <span className="font-medium">Recent Achievements</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {achievements.slice(0, 4).map(achievement => (
            <div 
              key={achievement.id}
              className={`p-2 rounded-lg border ${
                achievement.earned ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-sm font-medium">{achievement.name}</div>
              <div className="text-xs text-gray-500">{achievement.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Alerts */}
      {recentAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
            <span className="font-medium">Risk Alerts</span>
          </div>
          {recentAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-2 rounded-lg ${
                alert.type === 'danger' ? 'bg-red-50' : 
                alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}
            >
              <div className="text-sm">{alert.message}</div>
              <div className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiskScore;