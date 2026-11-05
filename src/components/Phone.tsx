// In-Game Smartphone (Tab / Phone Button)
// Apps: LifeBank, Apex Dealership, Dynasty 8 Real Estate, Missions, Valet & Settings/Time

import React, { useState } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import {
  BUSINESSES_CATALOG,
  GameEconomy,
  MISSIONS_CATALOG,
  PROPERTIES_CATALOG,
  VEHICLES_CATALOG
} from '../game/economy/GameEconomy';
import { SoundFX } from '../game/audio/SoundFX';
import {
  X,
  Building,
  Car,
  Briefcase,
  DollarSign,
  Settings,
  ChevronLeft,
  Key,
  Sun,
  Moon,
  CloudRain,
  Flame,
  Volume2
} from 'lucide-react';

interface PhoneProps {
  engine: GameEngine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Phone: React.FC<PhoneProps> = ({ engine, isOpen, onClose }) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const stats = GameEconomy.getStats();
  const transactions = GameEconomy.getTransactions();

  if (!isOpen) return null;

  const handleCollectIncome = () => {
    const total = GameEconomy.collectAllBusinessesIncome();
    if (total > 0) {
      SoundFX.playCashSound();
    }
  };

  const handleBuyVehicle = (id: string) => {
    const success = GameEconomy.buyVehicle(id);
    if (success) {
      SoundFX.playMissionCompleteSound();
    }
  };

  const handleBuyProperty = (id: string) => {
    const success = GameEconomy.buyProperty(id);
    if (success) {
      SoundFX.playMissionCompleteSound();
    }
  };

  const handleBuyBusiness = (id: string) => {
    const success = GameEconomy.buyBusiness(id);
    if (success) {
      SoundFX.playMissionCompleteSound();
    }
  };

  const handleStartMission = (id: string) => {
    GameEconomy.startMission(id);
    onClose();
  };

  const handleSummonValet = (vehicleId: string) => {
    if (engine) {
      engine.summonValetVehicle(vehicleId);
      onClose();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 font-rajdhani">
      {/* Smartphone Outer Chassis */}
      <div className="w-80 h-[560px] bg-zinc-950 border-4 border-zinc-700/80 rounded-[40px] shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative text-white">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full flex items-center justify-center z-20">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 ml-auto mr-2" />
        </div>

        {/* Top Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs text-gray-400 font-mono z-10">
          <span>12:45</span>
          <div className="flex items-center space-x-1.5">
            <span>5G</span>
            <span>100% 🔋</span>
            <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* APP VIEW OR HOME GRID */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
          {activeApp === null ? (
            /* HOME SCREEN APP GRID */
            <div>
              <div className="text-center my-4">
                <div className="text-2xl font-bold tracking-tight text-white">CITY LIFE OS</div>
                <div className="text-xs text-cyan-400 font-mono">${stats.money.toLocaleString()} Available</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {/* 1. LifeBank */}
                <button
                  onClick={() => { setActiveApp('bank'); SoundFX.playClick(); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <DollarSign size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 text-gray-200">LifeBank</span>
                </button>

                {/* 2. Apex Motors */}
                <button
                  onClick={() => { setActiveApp('dealership'); SoundFX.playClick(); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Car size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 text-gray-200">Motors</span>
                </button>

                {/* 3. Dynasty 8 Real Estate */}
                <button
                  onClick={() => { setActiveApp('realestate'); SoundFX.playClick(); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Building size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 text-gray-200">Real Estate</span>
                </button>

                {/* 4. Missions & Jobs */}
                <button
                  onClick={() => { setActiveApp('missions'); SoundFX.playClick(); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Briefcase size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 text-gray-200">Contracts</span>
                </button>

                {/* 5. Valet Delivery */}
                <button
                  onClick={() => { setActiveApp('valet'); SoundFX.playClick(); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Key size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 text-gray-200">Valet</span>
                </button>

                {/* 6. Settings & Time */}
                <button
                  onClick={() => { setActiveApp('settings'); SoundFX.playClick(); }}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Settings size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 text-gray-200">Settings</span>
                </button>
              </div>

              {/* Developer Testing Cash Widget */}
              <div className="mt-8 bg-zinc-900/90 border border-amber-500/30 rounded-xl p-3 text-center">
                <div className="text-xs text-amber-400 font-bold">DEVELOPER TEST TOOL</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Need funds to test luxury villas & hypercars?</div>
                <button
                  onClick={() => { GameEconomy.testCheatAddCash(); }}
                  className="mt-2 w-full py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer shadow-md"
                >
                  +$50,000 Quick Cash
                </button>
              </div>
            </div>
          ) : (
            /* SUB-APP HEADER & VIEW */
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                <button
                  onClick={() => { setActiveApp(null); SoundFX.playClick(); }}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  {activeApp}
                </span>
              </div>

              {/* APP 1: LIFEBANK */}
              {activeApp === 'bank' && (
                <div className="space-y-4 pt-3">
                  <div className="bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-500/40 rounded-xl p-4 text-center">
                    <div className="text-xs text-gray-400 uppercase">Total Liquid Balance</div>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                      ${stats.money.toLocaleString()}
                    </div>
                    <button
                      onClick={handleCollectIncome}
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer shadow-md"
                    >
                      Collect Business Profits
                    </button>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Recent Activity
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {transactions.slice(0, 10).map(t => (
                        <div key={t.id} className="bg-zinc-900/80 p-2 rounded-lg flex items-center justify-between text-xs border border-white/5">
                          <span className="text-gray-300 truncate max-w-[140px]">{t.description}</span>
                          <span className={`font-mono font-bold ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.amount >= 0 ? `+$${t.amount.toLocaleString()}` : `-$${Math.abs(t.amount).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* APP 2: MOTORS DEALERSHIP */}
              {activeApp === 'dealership' && (
                <div className="space-y-3 pt-3">
                  {VEHICLES_CATALOG.map(v => {
                    const isOwned = stats.ownedVehicles.includes(v.id);
                    return (
                      <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-white">{v.name}</div>
                            <div className="text-[10px] text-gray-400">{v.hebrewName}</div>
                          </div>
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {v.price === 0 ? 'FREE' : `$${v.price.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-300">{v.description}</div>
                        <div className="flex items-center space-x-3 text-[10px] text-cyan-400 font-mono">
                          <span>🚀 {v.topSpeed} KM/H</span>
                          <span>⚡ {v.acceleration}/100</span>
                        </div>
                        {isOwned ? (
                          <div className="text-center text-xs text-emerald-400 font-bold py-1 bg-emerald-950/40 rounded border border-emerald-500/30">
                            ✓ OWNED IN GARAGE
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuyVehicle(v.id)}
                            disabled={stats.money < v.price}
                            className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                              stats.money >= v.price ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Buy Vehicle
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* APP 3: DYNASTY 8 REAL ESTATE & BUSINESSES */}
              {activeApp === 'realestate' && (
                <div className="space-y-3 pt-3">
                  <div className="text-xs font-bold text-gray-400 uppercase">Properties</div>
                  {PROPERTIES_CATALOG.map(p => {
                    const isOwned = stats.ownedProperties.includes(p.id);
                    return (
                      <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{p.icon}</span>
                            <div>
                              <div className="font-bold text-xs text-white">{p.name}</div>
                              <div className="text-[9px] text-gray-400">{p.address}</div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-cyan-400 text-xs">
                            {p.price === 0 ? 'STARTER' : `$${p.price.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-300">{p.description}</div>
                        {isOwned ? (
                          <div className="text-center text-xs text-cyan-400 font-bold py-1 bg-cyan-950/40 rounded border border-cyan-500/30">
                            ✓ KEY OWNED
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuyProperty(p.id)}
                            disabled={stats.money < p.price}
                            className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider cursor-pointer ${
                              stats.money >= p.price ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Acquire Property
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <div className="text-xs font-bold text-gray-400 uppercase pt-2">Commercial Businesses</div>
                  {BUSINESSES_CATALOG.map(b => {
                    const isOwned = stats.ownedBusinesses.includes(b.id);
                    return (
                      <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-xs text-white">{b.name}</div>
                            <div className="text-[10px] text-emerald-400 font-mono">+${b.incomePerMin}/min Passive</div>
                          </div>
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            ${b.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-300">{b.description}</div>
                        {isOwned ? (
                          <div className="text-center text-xs text-emerald-400 font-bold py-1 bg-emerald-950/40 rounded border border-emerald-500/30">
                            ✓ GENERATING REVENUE
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuyBusiness(b.id)}
                            disabled={stats.money < b.price}
                            className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wider cursor-pointer ${
                              stats.money >= b.price ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md' : 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Acquire Business
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* APP 4: MISSIONS */}
              {activeApp === 'missions' && (
                <div className="space-y-3 pt-3">
                  {MISSIONS_CATALOG.map(m => (
                    <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-xs text-white">{m.title}</div>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          +${m.reward.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-300">{m.description}</div>
                      <div className="text-[10px] text-gray-400 font-mono">⏱️ Time Limit: {m.timeLimit}s</div>
                      <button
                        onClick={() => handleStartMission(m.id)}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                      >
                        Accept Contract
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* APP 5: VALET SERVICE */}
              {activeApp === 'valet' && (
                <div className="space-y-3 pt-3">
                  <div className="text-xs text-gray-400">Summon any owned car directly to your location:</div>
                  {stats.ownedVehicles.map(vehId => {
                    const car = VEHICLES_CATALOG.find(v => v.id === vehId);
                    if (!car) return null;
                    return (
                      <div key={vehId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-white">{car.name}</div>
                          <div className="text-[10px] text-gray-400">{car.category.toUpperCase()}</div>
                        </div>
                        <button
                          onClick={() => handleSummonValet(vehId)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                        >
                          Deliver Here
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* APP 6: SETTINGS & TIME OF DAY */}
              {activeApp === 'settings' && (
                <div className="space-y-4 pt-3 text-xs">
                  <div>
                    <div className="text-gray-400 font-bold uppercase mb-2">Time of Day</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => engine?.setTimeOfDay(12.0)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <Sun size={16} className="text-yellow-400" />
                        <span>Noon (12:00)</span>
                      </button>
                      <button
                        onClick={() => engine?.setTimeOfDay(18.5)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <Flame size={16} className="text-orange-400" />
                        <span>Sunset (18:30)</span>
                      </button>
                      <button
                        onClick={() => engine?.setTimeOfDay(22.0)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <Moon size={16} className="text-indigo-400" />
                        <span>Night (22:00)</span>
                      </button>
                      <button
                        onClick={() => engine?.setTimeOfDay(7.0)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <Sun size={16} className="text-amber-400" />
                        <span>Sunrise (07:00)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 font-bold uppercase mb-2">Weather Condition</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => engine?.setWeather('clear')}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <Sun size={16} className="text-cyan-400" />
                        <span>Clear Skies</span>
                      </button>
                      <button
                        onClick={() => engine?.setWeather('rain')}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg flex items-center space-x-2 cursor-pointer"
                      >
                        <CloudRain size={16} className="text-blue-400" />
                        <span>Rainstorm</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Phone Bar Button */}
        <div className="h-6 flex items-center justify-center bg-black/60 cursor-pointer" onClick={() => setActiveApp(null)}>
          <div className="w-24 h-1 bg-white/40 rounded-full hover:bg-white" />
        </div>
      </div>
    </div>
  );
};
