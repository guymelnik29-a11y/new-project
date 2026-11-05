// CITY LIFE – עיר בלי גבולות: Data Types & Interfaces

export type WeatherType = 'clear' | 'sunset' | 'night' | 'rain' | 'overcast';

export interface VehicleConfig {
  id: string;
  name: string;
  hebrewName: string;
  category: 'compact' | 'muscle' | 'sedan' | 'suv' | 'supercar' | 'plane';
  price: number;
  topSpeed: number; // km/h
  acceleration: number; // 0-100 rating
  handling: number; // rating 1-100
  color: string;
  neonColor?: string;
  engineLevel: number; // 1 to 3
  description: string;
  unlocked: boolean;
}

export interface PropertyConfig {
  id: string;
  name: string;
  hebrewName: string;
  type: 'apartment' | 'loft' | 'penthouse' | 'villa';
  price: number;
  address: string;
  position: [number, number, number]; // [x, y, z] in world
  interiorPosition?: [number, number, number];
  owned: boolean;
  garageCapacity: number;
  description: string;
  icon: string;
}

export interface BusinessConfig {
  id: string;
  name: string;
  hebrewName: string;
  type: 'cafe' | 'garage' | 'dealership' | 'club';
  price: number;
  incomePerMin: number;
  uncollectedIncome: number;
  lastCollectTime: number;
  position: [number, number, number];
  owned: boolean;
  description: string;
}

export interface MissionConfig {
  id: string;
  title: string;
  hebrewTitle: string;
  description: string;
  reward: number;
  type: 'delivery' | 'race' | 'vip' | 'speed_trap' | 'flight';
  timeLimit: number; // seconds
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  checkpoints?: [number, number, number][];
  requiredVehicle?: string;
  completed: boolean;
}

export interface PlayerStats {
  money: number;
  bankBalance: number;
  reputation: number; // XP / Level
  level: number;
  activeVehicleId: string;
  currentPropertyId: string;
  activeMissionId: string | null;
  currentDistrict: string;
  isDriving: boolean;
  isInsideInterior: boolean;
  interiorId: string | null;
  ownedVehicles: string[];
  ownedProperties: string[];
  ownedBusinesses: string[];
  vehicleUpgrades: Record<string, {
    color: string;
    neonColor: string;
    engineLevel: number;
    rimColor: string;
    hasTurbo: boolean;
  }>;
}

export interface ControlState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jumpOrBrake: boolean;
  nitro: boolean;
  interact: boolean;
  enterExit: boolean;
  horn: boolean;
  lights: boolean;
  changeCamera: boolean;
}

export interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
  postProcessing: boolean;
  soundVolume: number;
  musicVolume: number;
  weather: WeatherType;
  timeOfDay: number; // 0 to 24 (hours)
  autoDayNight: boolean;
  language: 'he' | 'en';
}
