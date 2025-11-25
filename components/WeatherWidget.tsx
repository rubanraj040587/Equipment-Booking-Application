import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  // Mock weather state
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Sunny',
    windSpeed: 12,
    humidity: 45
  });

  useEffect(() => {
    // Simulate slight weather changes every minute
    const interval = setInterval(() => {
      setWeather(prev => ({
        temp: prev.temp + (Math.random() > 0.5 ? 1 : -1),
        condition: Math.random() > 0.8 ? (prev.condition === 'Sunny' ? 'Cloudy' : 'Sunny') : prev.condition,
        windSpeed: Math.max(0, prev.windSpeed + Math.floor(Math.random() * 5) - 2),
        humidity: Math.min(100, Math.max(20, prev.humidity + Math.floor(Math.random() * 6) - 3))
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch(weather.condition) {
      case 'Rainy': return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'Cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      default: return <Sun className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg flex items-center gap-6 min-w-[200px]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-full shadow-sm">
          {getIcon()}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground leading-none">{weather.temp}°C</div>
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{weather.condition}</div>
        </div>
      </div>
      
      <div className="h-8 w-[1px] bg-border"></div>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Wind className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">{weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">{weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
};
