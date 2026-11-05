// CITY LIFE – Main Game Engine Coordinator
// Unites Three.js Renderer, Physics, Day/Night Cycle, Weather, Player, Vehicles, Traffic, Audio & Minimap

import * as THREE from 'three';
import { ControlState, GameSettings, WeatherType } from '../types';
import { CityBuilder } from '../world/CityBuilder';
import { PlayerController } from '../player/PlayerController';
import { VehicleModelFactory, VehicleParts } from '../vehicles/VehicleModel';
import { VehiclePhysics } from '../vehicles/VehiclePhysics';
import { TrafficSystem } from '../world/TrafficSystem';
import { InteriorManager } from '../world/InteriorManager';
import { GameEconomy, VEHICLES_CATALOG } from '../economy/GameEconomy';
import { SoundFX } from '../audio/SoundFX';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // World & Systems
  public city: CityBuilder;
  public player: PlayerController;
  public traffic: TrafficSystem;
  public interiors: InteriorManager;

  // Active Vehicle & Spawned Vehicles Map
  public activeVehicle: VehiclePhysics | null = null;
  public parkedVehicles: Map<string, VehiclePhysics> = new Map();

  // Day / Night & Sky
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemiLight: THREE.HemisphereLight;
  public timeOfDay = 14.5; // 14:30 PM (Midday default)
  public autoDayNight = true;
  public currentWeather: WeatherType = 'clear';

  // Rain particle system
  private rainParticles: THREE.Points | null = null;
  private rainGeo: THREE.BufferGeometry | null = null;

  // Game Settings & Controls
  public settings: GameSettings = {
    graphicsQuality: 'high',
    shadows: true,
    postProcessing: true,
    soundVolume: 0.8,
    musicVolume: 0.5,
    weather: 'clear',
    timeOfDay: 14.5,
    autoDayNight: true,
    language: 'he'
  };

  public controls: ControlState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jumpOrBrake: false,
    nitro: false,
    interact: false,
    enterExit: false,
    horn: false,
    lights: false,
    changeCamera: false
  };

  // Interaction State exposed to UI
  public interactionPrompt: string | null = null;
  public interactionAction: (() => void) | null = null;
  public isDriving = false;

  private isRunning = false;
  private lastTime = performance.now();
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // 1. Three.js Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0022);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.2, 1000);

    // 3. Lighting System
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(100, 160, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    const shadowD = 180;
    this.sunLight.shadow.camera.left = -shadowD;
    this.sunLight.shadow.camera.right = shadowD;
    this.sunLight.shadow.camera.top = shadowD;
    this.sunLight.shadow.camera.bottom = -shadowD;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // 4. Initialize World & Subsystems
    this.city = new CityBuilder(this.scene);
    this.city.buildWorld();

    this.player = new PlayerController(this.camera);
    this.scene.add(this.player.group);

    this.traffic = new TrafficSystem(this.scene);
    this.interiors = new InteriorManager(this.scene);

    // 5. Setup Rain Particles
    this.setupRainParticles();

    // 6. Spawn Starting Vehicles in World
    this.spawnInitialVehicles();

    // 7. Event Listeners
    this.bindEvents();

    // 8. Sound System Init
    SoundFX.init();
  }

  private setupRainParticles() {
    const rainCount = 3500;
    this.rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 160;
      positions[i + 1] = Math.random() * 80;
      positions[i + 2] = (Math.random() - 0.5) * 160;
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x81ecec,
      size: 0.25,
      transparent: true,
      opacity: 0
    });
    this.rainParticles = new THREE.Points(this.rainGeo, rainMat);
    this.scene.add(this.rainParticles);
  }

  // Spawn Starter Hatchback, Showroom Supercar and Airport Plane
  private spawnInitialVehicles() {
    // 1. Player's Starter Hatchback (Parked outside Starter Apartment)
    const stats = GameEconomy.getStats();
    const upgrade = stats.vehicleUpgrades['starter_hatchback'] || { color: '#3498db', neonColor: '#00ffff' };
    const starterParts = VehicleModelFactory.createVehicle('compact', upgrade.color, upgrade.neonColor);
    this.scene.add(starterParts.root);

    const starterPhysics = new VehiclePhysics(starterParts, new THREE.Vector3(-138, 0, 160), -Math.PI / 2);
    this.parkedVehicles.set('starter_hatchback', starterPhysics);

    // 2. Apex GT Supercar in Showroom
    const apexParts = VehicleModelFactory.createVehicle('supercar', '#f39c12', '#00ffee');
    this.scene.add(apexParts.root);
    const apexPhysics = new VehiclePhysics(apexParts, new THREE.Vector3(0, 0.4, -100), 0);
    this.parkedVehicles.set('apex_gt', apexPhysics);

    // 3. SkyLiner Airplane at Airport Runway
    const planeParts = VehicleModelFactory.createVehicle('plane', '#ffffff');
    this.scene.add(planeParts.root);
    const planePhysics = new VehiclePhysics(planeParts, new THREE.Vector3(180, 0, -140), 0);
    this.parkedVehicles.set('aero_jet', planePhysics);

    // 4. Venom Muscle Car in Downtown
    const muscleParts = VehicleModelFactory.createVehicle('muscle', '#e74c3c', '#ff2200');
    this.scene.add(muscleParts.root);
    const musclePhysics = new VehiclePhysics(muscleParts, new THREE.Vector3(35, 0, -70), Math.PI);
    this.parkedVehicles.set('venom_muscle', musclePhysics);
  }

  // Enter Vehicle
  public enterVehicle(veh: VehiclePhysics) {
    this.activeVehicle = veh;
    this.isDriving = true;
    GameEconomy.setDriving(true);

    // Hide on-foot player model and sit inside vehicle
    this.player.group.visible = false;
    SoundFX.resume();
  }

  // Exit Vehicle
  public exitVehicle() {
    if (!this.activeVehicle) return;

    // Spawn player beside vehicle driver side
    const exitOffset = new THREE.Vector3(-2.2, 0, 0).applyEuler(new THREE.Euler(0, this.activeVehicle.rotation.y, 0));
    const exitPos = this.activeVehicle.position.clone().add(exitOffset);
    exitPos.y = this.activeVehicle.position.y;

    this.player.position.copy(exitPos);
    this.player.group.position.copy(exitPos);
    this.player.velocity.set(0, 0, 0);
    this.player.group.visible = true;

    this.activeVehicle.speedKmH = 0;
    this.activeVehicle.velocity.set(0, 0, 0);
    SoundFX.stopEngine();

    this.activeVehicle = null;
    this.isDriving = false;
    GameEconomy.setDriving(false);
  }

  // Summon Valet Vehicle (delivers car right in front of player)
  public summonValetVehicle(vehicleId: string) {
    let veh = this.parkedVehicles.get(vehicleId);
    const catalogItem = VEHICLES_CATALOG.find(v => v.id === vehicleId);
    if (!catalogItem) return;

    const stats = GameEconomy.getStats();
    const upgrade = stats.vehicleUpgrades[vehicleId] || { color: catalogItem.color, neonColor: catalogItem.neonColor };

    if (!veh) {
      const parts = VehicleModelFactory.createVehicle(catalogItem.category, upgrade.color, upgrade.neonColor);
      this.scene.add(parts.root);
      veh = new VehiclePhysics(parts, new THREE.Vector3(), 0);
      this.parkedVehicles.set(vehicleId, veh);
    }

    // Place 5 meters ahead of player
    const spawnDir = new THREE.Vector3(0, 0, 5).applyEuler(new THREE.Euler(0, this.player.cameraYaw + Math.PI, 0));
    const targetPos = this.player.position.clone().add(spawnDir);
    targetPos.y = this.player.position.y;

    veh.position.copy(targetPos);
    veh.rotation.y = this.player.cameraYaw + Math.PI / 2;
    veh.velocity.set(0, 0, 0);
    veh.speedKmH = 0;
    veh.vehicleParts.root.position.copy(targetPos);
    veh.vehicleParts.root.rotation.y = veh.rotation.y;

    SoundFX.playCashSound();
  }

  // Day / Night & Weather Cycle
  public setTimeOfDay(hour: number) {
    this.timeOfDay = hour % 24;
    this.updateLightingAndSky();
  }

  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;
    if (this.rainParticles) {
      const mat = this.rainParticles.material as THREE.PointsMaterial;
      mat.opacity = weather === 'rain' ? 0.75 : 0;
    }
    this.updateLightingAndSky();
  }

  private updateLightingAndSky() {
    const isNight = this.timeOfDay < 5.5 || this.timeOfDay > 19.5;
    const isSunset = this.timeOfDay >= 18.0 && this.timeOfDay <= 19.5;
    const isSunrise = this.timeOfDay >= 5.5 && this.timeOfDay <= 7.0;

    // Sun angle calculation
    const sunAngle = ((this.timeOfDay - 6) / 24) * Math.PI * 2;
    const sunDistance = 220;
    const sunX = Math.cos(sunAngle) * sunDistance;
    const sunY = Math.sin(sunAngle) * sunDistance;
    const sunZ = 80;

    this.sunLight.position.set(sunX, Math.max(10, sunY), sunZ);

    if (isNight) {
      // Night Palette
      this.scene.background = new THREE.Color(0x0a0e17);
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color(0x0a0e17);
      }
      this.ambientLight.color.setHex(0x1a2536);
      this.ambientLight.intensity = 0.35;
      this.sunLight.color.setHex(0x34495e);
      this.sunLight.intensity = 0.3;
      this.renderer.toneMappingExposure = 1.1;
    } else if (isSunset || isSunrise) {
      // Golden Hour / Sunset
      const sunsetColor = new THREE.Color(0xff7675);
      this.scene.background = sunsetColor;
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color(0xfd79a8);
      }
      this.ambientLight.color.setHex(0xe17055);
      this.ambientLight.intensity = 0.55;
      this.sunLight.color.setHex(0xffaa66);
      this.sunLight.intensity = 2.2;
      this.renderer.toneMappingExposure = 1.05;
    } else {
      // Clear Daytime
      const skyBlue = this.currentWeather === 'rain' ? new THREE.Color(0x7f8c8d) : new THREE.Color(0x74b9ff);
      this.scene.background = skyBlue;
      if (this.scene.fog) {
        this.scene.fog.color = skyBlue;
      }
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 0.5;
      this.sunLight.color.setHex(0xfffaed);
      this.sunLight.intensity = 2.4;
      this.renderer.toneMappingExposure = 1.0;
    }

    // City streetlights and illuminated building windows
    this.city.update(this.lastTime * 0.001, isNight);
  }

  // Check interactive proximity (Vehicles, Doors, Markers)
  private updateInteractions() {
    this.interactionPrompt = null;
    this.interactionAction = null;

    if (this.isDriving && this.activeVehicle) {
      this.interactionPrompt = '[F] Exit Vehicle';
      this.interactionAction = () => this.exitVehicle();
      return;
    }

    // 1. Check nearby parked vehicles to enter
    for (const [id, veh] of this.parkedVehicles.entries()) {
      const dist = this.player.position.distanceTo(veh.position);
      if (dist < 4.2) {
        const cat = VEHICLES_CATALOG.find(v => v.id === id);
        const name = cat ? cat.name : 'Vehicle';
        this.interactionPrompt = `[F] Enter ${name}`;
        this.interactionAction = () => this.enterVehicle(veh);
        return;
      }
    }

    // 2. Check interactive landmarks (Starter Apartment, Dealership, Garage, Missions)
    for (const landmark of this.city.landmarks) {
      const dist = this.player.position.distanceTo(landmark.position);
      if (dist < 4.5) {
        if (landmark.type === 'property') {
          this.interactionPrompt = `[E] Enter ${landmark.name}`;
          this.interactionAction = () => {
            const interior = this.interiors.getInterior(landmark.id);
            if (interior) {
              this.player.position.copy(interior.spawnPoint);
              this.player.group.position.copy(interior.spawnPoint);
              GameEconomy.setInteriorState(true, landmark.id);
              SoundFX.playClick();
            }
          };
        } else if (landmark.type === 'garage') {
          this.interactionPrompt = '[E] Open Tuning Workshop';
          this.interactionAction = () => {
            window.dispatchEvent(new CustomEvent('city_life_open_garage'));
            SoundFX.playClick();
          };
        } else if (landmark.type === 'dealership') {
          this.interactionPrompt = '[E] Enter Apex Dealership';
          this.interactionAction = () => {
            window.dispatchEvent(new CustomEvent('city_life_open_dealership'));
            SoundFX.playClick();
          };
        } else if (landmark.type === 'mission') {
          this.interactionPrompt = `[E] Start ${landmark.name}`;
          this.interactionAction = () => {
            GameEconomy.startMission('mission_courier');
          };
        }
        return;
      }
    }

    // 3. Check Interior Exit or Bed
    const currentStats = GameEconomy.getStats();
    if (currentStats.isInsideInterior && currentStats.interiorId) {
      const currentInt = this.interiors.getInterior(currentStats.interiorId);
      if (currentInt) {
        // Near exit door
        if (this.player.position.distanceTo(currentInt.exitPoint) < 3.2) {
          this.interactionPrompt = '[E] Exit to City';
          this.interactionAction = () => {
            this.player.position.copy(currentInt.worldExitPosition);
            this.player.group.position.copy(currentInt.worldExitPosition);
            GameEconomy.setInteriorState(false, null);
            SoundFX.playClick();
          };
          return;
        }

        // Near Bed (Sleep action advances time)
        if (this.player.position.distanceTo(currentInt.bedPosition) < 3.2) {
          this.interactionPrompt = '[E] Rest & Sleep (Wake at 08:00 AM)';
          this.interactionAction = () => {
            this.setTimeOfDay(8.0);
            SoundFX.playCashSound();
          };
          return;
        }
      }
    }
  }

  // Game Loop
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = Math.min(0.08, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Advance Day / Night Cycle
    if (this.autoDayNight) {
      this.timeOfDay = (this.timeOfDay + dt * 0.08) % 24;
      this.updateLightingAndSky();
    }

    // Update Rain particles
    if (this.currentWeather === 'rain' && this.rainParticles && this.rainGeo) {
      const positions = this.rainGeo.attributes.position.array as Float32Array;
      const refX = this.isDriving && this.activeVehicle ? this.activeVehicle.position.x : this.player.position.x;
      const refZ = this.isDriving && this.activeVehicle ? this.activeVehicle.position.z : this.player.position.z;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= dt * 65;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 60;
          positions[i] = refX + (Math.random() - 0.5) * 140;
          positions[i + 2] = refZ + (Math.random() - 0.5) * 140;
        }
      }
      this.rainGeo.attributes.position.needsUpdate = true;
    }

    // Active Driving vs Walking update
    if (this.isDriving && this.activeVehicle) {
      this.activeVehicle.update(dt, this.controls, this.city.collisionBoxes);
      this.player.updateVehicleCamera(
        dt,
        this.activeVehicle.position,
        this.activeVehicle.rotation.y,
        this.activeVehicle.speedKmH,
        this.activeVehicle.isNitroActive
      );
      this.traffic.update(dt, this.activeVehicle.position);
    } else {
      this.player.updateOnFoot(dt, this.controls, this.city.collisionBoxes);
      this.traffic.update(dt, this.player.position);
    }

    // Check interaction prompt
    this.updateInteractions();

    // Check active mission objective triggers
    this.checkMissionProgress();

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private checkMissionProgress() {
    const stats = GameEconomy.getStats();
    if (!stats.activeMissionId) return;

    const currentPos = this.isDriving && this.activeVehicle ? this.activeVehicle.position : this.player.position;

    // Mission 1: Courier
    if (stats.activeMissionId === 'mission_courier') {
      const target = new THREE.Vector3(-80, 0, -140);
      if (currentPos.distanceTo(target) < 14) {
        GameEconomy.completeActiveMission();
      }
    }
    // Mission 2: Race
    else if (stats.activeMissionId === 'mission_street_race') {
      const target = new THREE.Vector3(160, 0, 60);
      if (currentPos.distanceTo(target) < 16) {
        GameEconomy.completeActiveMission();
      }
    }
    // Mission 4: Speed challenge
    else if (stats.activeMissionId === 'mission_speed_trap') {
      if (this.isDriving && this.activeVehicle && this.activeVehicle.speedKmH > 155) {
        GameEconomy.completeActiveMission();
      }
    }
  }

  // Keyboard & Mouse Events
  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onWindowResize);

    this.canvas.addEventListener('click', () => {
      SoundFX.resume();
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock?.();
      }
    });
  }

  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.controls.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.controls.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.controls.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.controls.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.controls.sprint = true;
        this.controls.nitro = true;
        if (this.isDriving && this.activeVehicle && this.activeVehicle.nitroLevel > 5) {
          SoundFX.playNitroSound();
        }
        break;
      case 'Space':
        this.controls.jumpOrBrake = true;
        break;
      case 'KeyF':
        this.controls.enterExit = true;
        if (this.isDriving) {
          this.exitVehicle();
        } else if (this.interactionAction && this.interactionPrompt?.includes('[F]')) {
          this.interactionAction();
        }
        break;
      case 'KeyE':
        this.controls.interact = true;
        if (this.interactionAction && this.interactionPrompt?.includes('[E]')) {
          this.interactionAction();
        }
        break;
      case 'KeyH':
        this.controls.horn = true;
        break;
      case 'KeyC':
        this.player.cameraMode = this.player.cameraMode === 'chase' ? 'hood' : 'chase';
        break;
      case 'KeyR':
        SoundFX.toggleRadio();
        break;
      case 'Tab':
      case 'KeyM':
        // Prevent default tab navigation and toggle phone or map
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(e.code === 'KeyM' ? 'city_life_toggle_map' : 'city_life_toggle_phone'));
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.controls.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.controls.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.controls.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.controls.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.controls.sprint = false;
        this.controls.nitro = false;
        break;
      case 'Space':
        this.controls.jumpOrBrake = false;
        break;
      case 'KeyH':
        this.controls.horn = false;
        break;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement === this.canvas) {
      this.player.handleMouseMove(e.movementX, e.movementY);
    }
  };

  private onWindowResize = () => {
    if (!this.canvas) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
}
