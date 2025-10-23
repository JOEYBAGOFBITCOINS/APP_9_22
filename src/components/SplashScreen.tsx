import React, { useEffect, useState } from 'react';
import { napletonLogo } from '../media/logo';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const SplashScreen: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(0);

  useEffect(() => {
    const FILL_DURATION = 6000; // 6 seconds to fill
    const PAUSE_DURATION = 4000; // 4 seconds pause at 19.31
    const INTERVAL_MS = 50; // Update every 50ms for smoother animation
    const TARGET_GALLONS = 19.31;
    const TARGET_FUEL_LEVEL = 100;
    
    // Calculate increments for 6 second fill duration
    const totalIntervals = FILL_DURATION / INTERVAL_MS; // 120 intervals
    const gallonIncrement = TARGET_GALLONS / totalIntervals; // ~0.16092 per interval
    const fuelIncrement = TARGET_FUEL_LEVEL / totalIntervals; // ~0.833% per interval
    
    // Counter animation - gallons counting up from 0.000 to 19.31 in 6 seconds, then pause for 4 seconds
    const counterInterval = setInterval(() => {
      setCounter(prev => {
        const newValue = prev + gallonIncrement;
        if (newValue >= TARGET_GALLONS) {
          clearInterval(counterInterval);
          return TARGET_GALLONS;
        }
        return newValue;
      });
    }, INTERVAL_MS);

    // Fuel level animation - fills up to 100% in 6 seconds, then pause for 4 seconds
    const fuelInterval = setInterval(() => {
      setFuelLevel(prev => {
        const newValue = prev + fuelIncrement;
        if (newValue >= TARGET_FUEL_LEVEL) {
          clearInterval(fuelInterval);
          return TARGET_FUEL_LEVEL;
        }
        return newValue;
      });
    }, INTERVAL_MS);

    return () => {
      clearInterval(counterInterval);
      clearInterval(fuelInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 flex items-center justify-center overflow-hidden">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>

      {/* Main Gas Pump */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-6">
        {/* Pump Body */}
        <div className="relative bg-gradient-to-br from-blue-900/90 via-slate-800/90 to-blue-950/90 rounded-3xl shadow-2xl backdrop-blur-sm border border-blue-700/30 overflow-hidden"
             style={{
               boxShadow: `
                 0 0 60px rgba(59, 130, 246, 0.2),
                 inset 0 2px 40px rgba(0,0,0,0.3),
                 inset 0 0 60px rgba(59, 130, 246, 0.05)
               `
             }}>
          
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl"
               style={{
                 background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.15), transparent 50%)',
                 pointerEvents: 'none'
               }}></div>

          {/* Top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>

          <div className="relative p-6 space-y-4">
            {/* Napleton Logo Panel */}
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-8 border border-blue-500/20 backdrop-blur-sm"
                 style={{
                   boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0,0,0,0.3)'
                 }}>
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              
              <img 
                src={napletonLogo}
                alt="Napleton Automotive Group"
                className="relative h-32 w-auto mx-auto object-contain drop-shadow-lg"
              />
            </div>

            {/* Price Display Panel */}
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-sm overflow-hidden"
                 style={{
                   boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0,0,0,0.3)'
                 }}>
              {/* Screen glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              
              <div className="relative flex items-center justify-between">
                {/* Dollar Amount */}
                <div className="flex items-baseline">
                  <span className="text-5xl text-blue-100 mr-1">$</span>
                  <span className="text-6xl text-blue-50"
                        style={{
                          textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                    {counter.toFixed(2)}
                  </span>
                </div>
                
                {/* Grade indicators */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-slate-900/50 rounded-lg border border-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl text-slate-500">9</span>
                  </div>
                  <div className="text-xs text-slate-600">91</div>
                </div>
              </div>
            </div>

            {/* Welcome Panel */}
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-sm overflow-hidden"
                 style={{
                   boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0,0,0,0.3)'
                 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              
              <div className="relative text-center">
                <div className="text-slate-300 text-xl">Welcome to</div>
                <div className="text-slate-200 text-2xl mt-1">
                  FuelTrakr<sup className="text-sm">®</sup>
                </div>
              </div>
            </div>

            {/* Fuel Tank Window */}
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-3 border border-blue-500/20 backdrop-blur-sm overflow-hidden"
                 style={{
                   boxShadow: 'inset 0 1px 2px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0,0,0,0.3)'
                 }}>
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              
              {/* Glass tank container */}
              <div className="relative h-96 bg-gradient-to-b from-slate-950/80 to-black/80 rounded-xl overflow-hidden border border-blue-500/10">
                {/* Glass reflection effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-30"></div>
                <div className="absolute top-0 left-4 w-24 h-48 bg-gradient-to-br from-white/20 to-transparent blur-2xl pointer-events-none z-30"></div>

                {/* Bubbles animation */}
                <div className="absolute inset-0 overflow-hidden z-10">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-white/20 backdrop-blur-sm"
                      style={{
                        width: `${Math.random() * 8 + 3}px`,
                        height: `${Math.random() * 8 + 3}px`,
                        left: `${Math.random() * 70}%`,
                        bottom: `${Math.max(0, fuelLevel - 20)}%`,
                        animation: `bubble-rise ${4 + Math.random() * 4}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 3}s`,
                        opacity: fuelLevel > 5 ? 0.6 : 0,
                        boxShadow: '0 0 4px rgba(245, 158, 11, 0.4)'
                      }}
                    />
                  ))}
                </div>

                {/* Animated fuel liquid */}
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out z-5"
                  style={{
                    height: `${fuelLevel}%`,
                    background: `linear-gradient(to top, 
                      rgba(217, 119, 6, 0.85) 0%,
                      rgba(245, 158, 11, 0.75) 20%,
                      rgba(251, 191, 36, 0.65) 40%,
                      rgba(252, 211, 77, 0.55) 60%,
                      rgba(253, 224, 71, 0.4) 80%,
                      rgba(254, 240, 138, 0.25) 100%
                    )`,
                    boxShadow: `
                      0 -10px 40px rgba(245, 158, 11, 0.4),
                      inset 0 -10px 30px rgba(217, 119, 6, 0.3)
                    `
                  }}
                >
                  {/* Liquid surface wave */}
                  <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 right-0 h-32 bg-amber-400/20"
                      style={{
                        animation: 'wave 4s ease-in-out infinite',
                        transform: 'translateY(-50%)'
                      }}
                    />
                    <div 
                      className="absolute top-0 left-0 right-0 h-32 bg-yellow-300/10"
                      style={{
                        animation: 'wave 5s ease-in-out infinite reverse',
                        animationDelay: '0.5s',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </div>

                  {/* Shimmer effect */}
                  {fuelLevel > 0 && (
                    <div 
                      className="absolute left-0 right-0 opacity-50"
                      style={{
                        bottom: `${Math.max(0, fuelLevel - 15)}%`,
                        height: `${Math.min(fuelLevel, 60)}%`,
                        background: 'linear-gradient(to top, transparent, rgba(252, 211, 77, 0.5), transparent)',
                        animation: 'shimmer 3s ease-in-out infinite'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom edge highlight */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bubble-rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-450px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes wave {
          0%, 100% {
            border-radius: 45% 55% 50% 50% / 55% 45% 55% 45%;
          }
          25% {
            border-radius: 50% 50% 45% 55% / 45% 55% 45% 55%;
          }
          50% {
            border-radius: 55% 45% 50% 50% / 50% 50% 50% 50%;
          }
          75% {
            border-radius: 50% 50% 55% 45% / 55% 45% 55% 45%;
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};
