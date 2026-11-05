// Main Menu & Welcome Splash Screen for CITY LIFE
// Cinematic launch overlay with Controls Guide and Feature Highlights

import React from 'react';
import { Play, Sparkles, Navigation, Shield, Award } from 'lucide-react';
import { SoundFX } from '../game/audio/SoundFX';

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const handlePlay = () => {
    SoundFX.init();
    SoundFX.resume();
    SoundFX.playCashSound();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-t from-black via-zinc-950/90 to-transparent backdrop-blur-sm flex flex-col justify-between p-8 font-rajdhani text-white select-none">
      {/* Top Brand Bar */}
      <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🏙️</span>
          <div>
            <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CITY LIFE
            </h1>
            <p className="text-xs text-cyan-300 font-bold uppercase tracking-widest font-heebo">
              עיר בלי גבולות – 3D OPEN WORLD
            </p>
          </div>
        </div>

        <div className="bg-black/60 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-300 font-mono">
          v1.0.0 | WebGL 3D Life Simulator
        </div>
      </div>

      {/* Center Cinematic Hero */}
      <div className="w-full max-w-3xl mx-auto text-center my-auto flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-cyan-950/60 border border-cyan-500/40 rounded-full px-4 py-1.5 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles size={14} />
          <span>Complete 3D Open World Life Simulation</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
          BUILD YOUR EMPIRE IN A LIVING 3D CITY
        </h2>

        <p className="text-base text-gray-300 mt-4 max-w-xl font-sans">
          Drive sports cars, buy luxury apartments and villas, acquire businesses, complete contracts and climb to the top of the urban hierarchy.
        </p>

        {/* Start Game Button */}
        <button
          onClick={handlePlay}
          className="mt-8 px-10 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.6)] transform hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 cursor-pointer tracking-wider"
        >
          <Play size={24} fill="currentColor" />
          <span>START PLAYING NOW</span>
        </button>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-4 mt-10 w-full text-left">
          <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-cyan-400 font-bold text-sm flex items-center space-x-1.5">
              <span>🏎️</span> <span>Real Driving & Physics</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Supercars, Muscle cars, SUVs & working Airport private aircraft.</div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-amber-400 font-bold text-sm flex items-center space-x-1.5">
              <span>🏰</span> <span>Real Estate & Interiors</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Walk into apartments, penthouses & Sunset Hills mega villas.</div>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 backdrop-blur-md">
            <div className="text-emerald-400 font-bold text-sm flex items-center space-x-1.5">
              <span>💼</span> <span>Living Economy</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Start with $5,000. Earn passive income from cafes, clubs & dealerships.</div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Summary */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-4 font-mono">
        <div><span className="text-cyan-400 font-bold">WASD / Arrows</span> : Move / Steer</div>
        <div><span className="text-cyan-400 font-bold">Shift</span> : Sprint / Nitro</div>
        <div><span className="text-cyan-400 font-bold">Space</span> : Jump / Handbrake</div>
        <div><span className="text-cyan-400 font-bold">F / E</span> : Enter Car / Interact</div>
        <div><span className="text-cyan-400 font-bold">Tab / M</span> : Phone / City Map</div>
      </div>
    </div>
  );
};
