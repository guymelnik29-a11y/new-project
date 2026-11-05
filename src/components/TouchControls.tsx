// Touch Controls Overlay for Mobile & Tablet Devices
// Virtual D-pad, Gas, Brake, Handbrake, Nitro & Interact buttons

import React from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Volume2 } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine | null;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  if (!engine) return null;

  const setControl = (key: keyof typeof engine.controls, value: boolean) => {
    engine.controls[key] = value;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none md:hidden flex justify-between p-4 items-end">
      {/* Left Thumb: Steering / Direction D-Pad */}
      <div className="pointer-events-auto flex flex-col items-center space-y-1">
        <button
          onTouchStart={() => setControl('forward', true)}
          onTouchEnd={() => setControl('forward', false)}
          className="w-14 h-14 bg-black/60 active:bg-cyan-500/80 border border-cyan-500/50 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg"
        >
          <ArrowUp />
        </button>

        <div className="flex space-x-2">
          <button
            onTouchStart={() => setControl('left', true)}
            onTouchEnd={() => setControl('left', false)}
            className="w-14 h-14 bg-black/60 active:bg-cyan-500/80 border border-cyan-500/50 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg"
          >
            <ArrowLeft />
          </button>
          <button
            onTouchStart={() => setControl('backward', true)}
            onTouchEnd={() => setControl('backward', false)}
            className="w-14 h-14 bg-black/60 active:bg-cyan-500/80 border border-cyan-500/50 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg"
          >
            <ArrowDown />
          </button>
          <button
            onTouchStart={() => setControl('right', true)}
            onTouchEnd={() => setControl('right', false)}
            className="w-14 h-14 bg-black/60 active:bg-cyan-500/80 border border-cyan-500/50 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      {/* Right Thumb: Action Pedals & Buttons */}
      <div className="pointer-events-auto flex flex-col items-end space-y-2">
        <div className="flex space-x-2">
          {/* Nitro */}
          <button
            onTouchStart={() => setControl('nitro', true)}
            onTouchEnd={() => setControl('nitro', false)}
            className="w-12 h-12 bg-amber-500/60 active:bg-amber-500 rounded-full flex items-center justify-center text-black font-bold shadow-lg"
          >
            <Zap size={20} />
          </button>

          {/* Interact / Enter Vehicle */}
          <button
            onClick={() => {
              if (engine.isDriving) {
                engine.exitVehicle();
              } else if (engine.interactionAction) {
                engine.interactionAction();
              }
            }}
            className="w-12 h-12 bg-cyan-600/80 active:bg-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
          >
            ACTION
          </button>
        </div>

        <div className="flex space-x-2 items-end">
          {/* Handbrake / Jump */}
          <button
            onTouchStart={() => setControl('jumpOrBrake', true)}
            onTouchEnd={() => setControl('jumpOrBrake', false)}
            className="w-14 h-14 bg-red-600/70 active:bg-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-lg uppercase"
          >
            BRAKE
          </button>

          {/* Drive / Accelerate */}
          <button
            onTouchStart={() => setControl('forward', true)}
            onTouchEnd={() => setControl('forward', false)}
            className="w-16 h-20 bg-emerald-600/80 active:bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg uppercase"
          >
            GAS
          </button>
        </div>
      </div>
    </div>
  );
};
