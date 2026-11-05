// CITY LIFE – Main Application Entry
// Coordinates Three.js Game Engine and UI Overlays (HUD, Phone, Map, Garage, Touch Controls)

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine/GameEngine';
import { HUD } from './components/HUD';
import { Phone } from './components/Phone';
import { FullMapModal } from './components/FullMapModal';
import { GarageMenu } from './components/GarageMenu';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const gameEngine = new GameEngine(canvasRef.current);
    setEngine(gameEngine);
    gameEngine.start();

    // Listen for custom game events
    const handleTogglePhone = () => setIsPhoneOpen(prev => !prev);
    const handleToggleMap = () => setIsMapOpen(prev => !prev);
    const handleOpenGarage = () => setIsGarageOpen(true);
    const handleOpenDealership = () => setIsPhoneOpen(true);

    window.addEventListener('city_life_toggle_phone', handleTogglePhone);
    window.addEventListener('city_life_toggle_map', handleToggleMap);
    window.addEventListener('city_life_open_garage', handleOpenGarage);
    window.addEventListener('city_life_open_dealership', handleOpenDealership);

    return () => {
      window.removeEventListener('city_life_toggle_phone', handleTogglePhone);
      window.removeEventListener('city_life_toggle_map', handleToggleMap);
      window.removeEventListener('city_life_open_garage', handleOpenGarage);
      window.removeEventListener('city_life_open_dealership', handleOpenDealership);
      gameEngine.destroy();
    };
  }, []);

  const handleStartGame = () => {
    setIsGameStarted(true);
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock?.();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-rajdhani">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair outline-none"
      />

      {/* Main Menu Welcome Screen */}
      {!isGameStarted && (
        <MainMenu onStartGame={handleStartGame} />
      )}

      {/* Active Game UI Overlays */}
      {isGameStarted && (
        <>
          <HUD
            engine={engine}
            onOpenPhone={() => setIsPhoneOpen(true)}
            onOpenMap={() => setIsMapOpen(true)}
          />

          <Phone
            engine={engine}
            isOpen={isPhoneOpen}
            onClose={() => setIsPhoneOpen(false)}
          />

          <FullMapModal
            engine={engine}
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
          />

          <GarageMenu
            engine={engine}
            isOpen={isGarageOpen}
            onClose={() => setIsGarageOpen(false)}
          />

          <TouchControls engine={engine} />
        </>
      )}
    </div>
  );
};

export default App;
