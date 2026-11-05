// Tuning Workshop UI for Neon Auto Works Garage
// Customize paint, neon underglow, engine stages & turbo

import React from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { GameEconomy, VEHICLES_CATALOG } from '../game/economy/GameEconomy';
import { SoundFX } from '../game/audio/SoundFX';
import { X, Wrench, Palette, Zap } from 'lucide-react';
import * as THREE from 'three';

interface GarageMenuProps {
  engine: GameEngine | null;
  isOpen: boolean;
  onClose: () => void;
}

const PAINT_COLORS = [
  { name: 'Ultra Blue', hex: '#3498db' },
  { name: 'Crimson Fury', hex: '#e74c3c' },
  { name: 'Cyber Neon Green', hex: '#2ecc71' },
  { name: 'Sunset Gold', hex: '#f1c40f' },
  { name: 'Electric Purple', hex: '#9b59b6' },
  { name: 'Midnight Onyx', hex: '#111116' },
  { name: 'Pure Pearl White', hex: '#f5f6fa' },
  { name: 'Hyper Orange', hex: '#e67e22' }
];

const NEON_COLORS = [
  { name: 'Cyan Glow', hex: '#00ffff' },
  { name: 'Hot Pink', hex: '#ff007f' },
  { name: 'Acid Green', hex: '#39ff14' },
  { name: 'Deep Purple', hex: '#8a2be2' },
  { name: 'Solar Yellow', hex: '#ffea00' }
];

export const GarageMenu: React.FC<GarageMenuProps> = ({ engine, isOpen, onClose }) => {
  const stats = GameEconomy.getStats();
  if (!isOpen) return null;

  const activeVehId = stats.activeVehicleId;
  const carConfig = VEHICLES_CATALOG.find(v => v.id === activeVehId);
  const currentUpgrade = stats.vehicleUpgrades[activeVehId] || {
    color: '#3498db',
    neonColor: '#00ffff',
    engineLevel: 1,
    hasTurbo: false
  };

  const handleApplyPaint = (hex: string) => {
    const cost = 800;
    const success = GameEconomy.upgradeVehicle(activeVehId, 'color', hex, cost);
    if (success && engine && engine.activeVehicle) {
      engine.activeVehicle.vehicleParts.bodyMaterial.color = new THREE.Color(hex);
      SoundFX.playCashSound();
    }
  };

  const handleApplyNeon = (hex: string) => {
    const cost = 1200;
    const success = GameEconomy.upgradeVehicle(activeVehId, 'neon', hex, cost);
    if (success) {
      SoundFX.playCashSound();
    }
  };

  const handleUpgradeEngine = () => {
    const nextLvl = (currentUpgrade.engineLevel || 1) + 1;
    const cost = nextLvl * 4500;
    const success = GameEconomy.upgradeVehicle(activeVehId, 'engine', nextLvl, cost);
    if (success && engine && engine.activeVehicle) {
      engine.activeVehicle.setEngineLevel(nextLvl);
      SoundFX.playMissionCompleteSound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-rajdhani">
      <div className="bg-zinc-950 border border-red-500/50 rounded-3xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500">
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-wide">NEON CUSTOM TUNING</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">
              Vehicle: {carConfig?.name || 'Selected Ride'}
            </p>
          </div>
        </div>

        {/* 1. Paint Options */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <Palette size={14} /> <span>Custom Body Paint</span>
            </span>
            <span className="text-amber-400 font-mono">$800</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {PAINT_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => handleApplyPaint(c.hex)}
                className="flex items-center space-x-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-white transition-all cursor-pointer text-xs"
              >
                <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                <span className="truncate">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Neon Underglow */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
            <span className="flex items-center space-x-1.5 text-pink-400">
              <Zap size={14} /> <span>Neon Underglow Light</span>
            </span>
            <span className="text-amber-400 font-mono">$1,200</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {NEON_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => handleApplyNeon(c.hex)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-pink-500 transition-all flex flex-col items-center cursor-pointer text-xs"
              >
                <div className="w-6 h-6 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: c.hex, boxShadow: `0 0 10px ${c.hex}` }} />
                <span className="text-[10px] mt-1 truncate">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Performance Upgrades */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="font-bold text-sm">ECU Engine Stage Upgrade</div>
              <div className="text-xs text-gray-400 font-mono">
                Current Level: Stage {currentUpgrade.engineLevel || 1} / 3
              </div>
            </div>
            <button
              onClick={handleUpgradeEngine}
              disabled={(currentUpgrade.engineLevel || 1) >= 3 || stats.money < ((currentUpgrade.engineLevel || 1) + 1) * 4500}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer ${
                (currentUpgrade.engineLevel || 1) < 3 ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {(currentUpgrade.engineLevel || 1) >= 3 ? 'MAXED OUT' : `Upgrade ($${((currentUpgrade.engineLevel || 1) + 1) * 4500})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
