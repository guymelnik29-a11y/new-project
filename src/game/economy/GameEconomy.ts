// Economy, Real Estate, Businesses, Vehicles & Missions Management for CITY LIFE

import { BusinessConfig, MissionConfig, PlayerStats, PropertyConfig, VehicleConfig } from '../types';
import { SoundFX } from '../audio/SoundFX';

export const VEHICLES_CATALOG: VehicleConfig[] = [
  {
    id: 'starter_hatchback',
    name: 'CityRunner Compact',
    hebrewName: 'סיטי ראנר קומפקט',
    category: 'compact',
    price: 0,
    topSpeed: 140,
    acceleration: 60,
    handling: 75,
    color: '#3498db',
    neonColor: '#00ffff',
    engineLevel: 1,
    description: 'A nimble and reliable urban hatchback. Perfect for getting started in the city.',
    unlocked: true,
  },
  {
    id: 'venom_muscle',
    name: 'Venom V8 Muscle',
    hebrewName: 'ונום V8 שרירים',
    category: 'muscle',
    price: 28000,
    topSpeed: 195,
    acceleration: 82,
    handling: 65,
    color: '#e74c3c',
    neonColor: '#ff2200',
    engineLevel: 1,
    description: 'Raw American horsepower, aggressive rear-wheel burnouts and thunderous exhaust notes.',
    unlocked: false,
  },
  {
    id: 'starlight_sedan',
    name: 'Starlight Prestige Sedan',
    hebrewName: 'סטארלייט פרסטיז\' סדאן',
    category: 'sedan',
    price: 55000,
    topSpeed: 215,
    acceleration: 78,
    handling: 85,
    color: '#1a1a24',
    neonColor: '#ffffff',
    engineLevel: 1,
    description: 'Executive luxury with butter-smooth suspension, sound insulation and sleek chrome detailing.',
    unlocked: false,
  },
  {
    id: 'titan_suv',
    name: 'Titan 4x4 Offroader',
    hebrewName: 'טיטאן 4x4 שטח',
    category: 'suv',
    price: 78000,
    topSpeed: 180,
    acceleration: 70,
    handling: 80,
    color: '#27ae60',
    neonColor: '#2ecc71',
    engineLevel: 1,
    description: 'Rugged all-terrain dominance with reinforced bumpers and elevated heavy-duty suspension.',
    unlocked: false,
  },
  {
    id: 'apex_gt',
    name: 'Apex GT Hypercar',
    hebrewName: 'אפקס GT היפרקאר',
    category: 'supercar',
    price: 220000,
    topSpeed: 285,
    acceleration: 96,
    handling: 92,
    color: '#f39c12',
    neonColor: '#00ffee',
    engineLevel: 2,
    description: 'Aerodynamic carbon fiber masterpiece capable of breaking speed records with active aero wing.',
    unlocked: false,
  },
  {
    id: 'aero_jet',
    name: 'SkyLiner Private Plane',
    hebrewName: 'מטוס פרטי סקייליינר',
    category: 'plane',
    price: 450000,
    topSpeed: 340,
    acceleration: 90,
    handling: 70,
    color: '#ffffff',
    engineLevel: 3,
    description: 'Twin-engine executive aircraft stationed at the International Airport for aerial city tours.',
    unlocked: false,
  }
];

export const PROPERTIES_CATALOG: PropertyConfig[] = [
  {
    id: 'starter_studio',
    name: 'South Beach Starter Studio',
    hebrewName: 'דירת סטודיו בסאות\' ביץ\'',
    type: 'apartment',
    price: 0,
    address: '12 Palm Boulevard, South Beach',
    position: [-120, 0, 160],
    interiorPosition: [0, 500, 0],
    owned: true,
    garageCapacity: 1,
    description: 'Your cozy first home in the city with ocean breezes, equipped with bed, sofa, kitchenette & TV.',
    icon: '🏢'
  },
  {
    id: 'downtown_loft',
    name: 'Downtown Horizon Loft',
    hebrewName: 'לופט דאונטאון הוריזון',
    type: 'loft',
    price: 45000,
    address: '88 Financial Plaza, Downtown',
    position: [60, 0, -40],
    interiorPosition: [0, 500, 200],
    owned: false,
    garageCapacity: 2,
    description: 'Modern two-story industrial loft with floor-to-ceiling glass windows facing illuminated skyscrapers.',
    icon: '🏙️'
  },
  {
    id: 'marina_penthouse',
    name: 'Marina Bay Penthouse',
    hebrewName: 'פנטהאוז מרינה ביי',
    type: 'penthouse',
    price: 180000,
    address: '400 Marina View Towers',
    position: [-80, 0, -140],
    interiorPosition: [0, 500, 400],
    owned: false,
    garageCapacity: 3,
    description: 'Spectacular penthouse with panoramic sea view, designer marble bar, hot tub and private elevator.',
    icon: '🌇'
  },
  {
    id: 'sunset_villa',
    name: 'Sunset Hills Mega Villa',
    hebrewName: 'וילת יוקרה סנסט הילס',
    type: 'villa',
    price: 500000,
    address: '1 Royal Crest Ridge, Sunset Hills',
    position: [180, 0, 140],
    interiorPosition: [0, 500, 600],
    owned: false,
    garageCapacity: 5,
    description: 'The pinnacle of success: private swimming pool, sun terrace, palm gardens and 5-car executive garage.',
    icon: '🏰'
  }
];

export const BUSINESSES_CATALOG: BusinessConfig[] = [
  {
    id: 'cafe_bistro',
    name: 'QuickBite Cafe & Bistro',
    hebrewName: 'קפה וביסטרו קוויקבייט',
    type: 'cafe',
    price: 25000,
    incomePerMin: 220,
    uncollectedIncome: 0,
    lastCollectTime: Date.now(),
    position: [-40, 0, 80],
    owned: false,
    description: 'Popular beachside coffee spot and breakfast bistro. Continuous stream of hungry tourists.'
  },
  {
    id: 'neon_garage',
    name: 'Neon Custom Tuning Garage',
    hebrewName: 'מוסך שיפורים ניאון',
    type: 'garage',
    price: 85000,
    incomePerMin: 750,
    uncollectedIncome: 0,
    lastCollectTime: Date.now(),
    position: [90, 0, 60],
    owned: false,
    description: 'High-end aftermarket modification shop servicing street racers and luxury enthusiasts.'
  },
  {
    id: 'apex_dealership',
    name: 'Apex Motors Luxury Dealership',
    hebrewName: 'סוכנות רכבי יוקרה אפקס',
    type: 'dealership',
    price: 260000,
    incomePerMin: 2600,
    uncollectedIncome: 0,
    lastCollectTime: Date.now(),
    position: [0, 0, -100],
    owned: false,
    description: 'Prime downtown glass showroom selling exotics and supercars to the city elite.'
  },
  {
    id: 'skyline_club',
    name: 'Skyline Ultra Lounge & Club',
    hebrewName: 'מועדון סקייליין אולטרה',
    type: 'club',
    price: 650000,
    incomePerMin: 7200,
    uncollectedIncome: 0,
    lastCollectTime: Date.now(),
    position: [120, 0, -120],
    owned: false,
    description: 'The hottest rooftop nightlife destination in the city, with VIP table bookings around the clock.'
  }
];

export const MISSIONS_CATALOG: MissionConfig[] = [
  {
    id: 'mission_courier',
    title: 'High-Speed Express Courier',
    hebrewTitle: 'משלוח חבילה דחוף',
    description: 'Pick up an urgent security document downtown and sprint across the city to the Marina before time expires!',
    reward: 3500,
    type: 'delivery',
    timeLimit: 75,
    startPosition: [-30, 0, 30],
    targetPosition: [-80, 0, -140],
    completed: false
  },
  {
    id: 'mission_street_race',
    title: 'Downtown Midnight Sprint',
    hebrewTitle: 'מרוץ רחוב לילי בדאונטאון',
    description: 'Race through checkpoints across the city highways and downtown avenue against the clock.',
    reward: 6000,
    type: 'race',
    timeLimit: 65,
    startPosition: [0, 0, 0],
    targetPosition: [160, 0, 60],
    checkpoints: [
      [50, 0, 0],
      [120, 0, -60],
      [120, 0, 60],
      [160, 0, 60]
    ],
    completed: false
  },
  {
    id: 'mission_vip_escort',
    title: 'VIP Celebrity Chauffeur',
    hebrewTitle: 'הסעת VIP אל הוילה',
    description: 'Pick up an international music star from the airport terminal and drive smoothly to the Sunset Hills Villa.',
    reward: 9500,
    type: 'vip',
    timeLimit: 90,
    startPosition: [180, 0, -80],
    targetPosition: [180, 0, 140],
    completed: false
  },
  {
    id: 'mission_speed_trap',
    title: 'Highway Speed Record Challenge',
    hebrewTitle: 'אתגר שבירת מהירות בכביש המהיר',
    description: 'Push your vehicle to over 160 km/h along the central expressway bridge to claim the prize.',
    reward: 12000,
    type: 'speed_trap',
    timeLimit: 50,
    startPosition: [-100, 0, 0],
    targetPosition: [100, 0, 0],
    completed: false
  },
  {
    id: 'mission_supercar_transport',
    title: 'Exotic Supercar Delivery',
    hebrewTitle: 'הובלת מכונית-על לסוכנות',
    description: 'Deliver a brand-new pristine supercar to Apex Motors showroom safely without destroying it.',
    reward: 22000,
    type: 'delivery',
    timeLimit: 100,
    startPosition: [-140, 0, -60],
    targetPosition: [0, 0, -100],
    completed: false
  }
];

export interface Transaction {
  id: string;
  amount: number; // positive = income, negative = expense
  description: string;
  hebrewDescription: string;
  timestamp: number;
}

class EconomyManager {
  private stats: PlayerStats = {
    money: 5000,
    bankBalance: 0,
    reputation: 150,
    level: 1,
    activeVehicleId: 'starter_hatchback',
    currentPropertyId: 'starter_studio',
    activeMissionId: null,
    currentDistrict: 'South Beach',
    isDriving: false,
    isInsideInterior: false,
    interiorId: null,
    ownedVehicles: ['starter_hatchback'],
    ownedProperties: ['starter_studio'],
    ownedBusinesses: [],
    vehicleUpgrades: {
      starter_hatchback: {
        color: '#3498db',
        neonColor: '#00ffff',
        engineLevel: 1,
        rimColor: '#cccccc',
        hasTurbo: false
      }
    }
  };

  private transactions: Transaction[] = [
    {
      id: 'tx_init',
      amount: 5000,
      description: 'Starting Life Savings',
      hebrewDescription: 'חסכונות התחלה בעיר',
      timestamp: Date.now()
    }
  ];

  private listeners: Set<() => void> = new Set();
  private missionTimer: number | null = null;
  public missionRemainingTime = 0;
  private passiveIncomeTimer: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.startPassiveIncomeLoop();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
    this.saveToStorage();
  }

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  // Add / Spend Money
  public addMoney(amount: number, description: string, hebrewDescription: string) {
    this.stats.money += amount;
    this.addReputation(Math.floor(amount / 50));
    this.transactions.unshift({
      id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 6),
      amount,
      description,
      hebrewDescription,
      timestamp: Date.now()
    });
    if (this.transactions.length > 50) this.transactions.pop();

    if (amount > 0) {
      SoundFX.playCashSound();
    }
    this.notify();
  }

  public spendMoney(amount: number, description: string, hebrewDescription: string): boolean {
    if (this.stats.money < amount) return false;
    this.stats.money -= amount;
    this.transactions.unshift({
      id: 'tx_' + Date.now() + Math.random().toString(36).substring(2, 6),
      amount: -amount,
      description,
      hebrewDescription,
      timestamp: Date.now()
    });
    SoundFX.playCashSound();
    this.notify();
    return true;
  }

  public addReputation(xp: number) {
    this.stats.reputation += xp;
    const newLevel = Math.floor(Math.sqrt(this.stats.reputation / 100)) + 1;
    if (newLevel > this.stats.level) {
      this.stats.level = newLevel;
      SoundFX.playMissionCompleteSound();
    }
  }

  // Vehicle Management
  public buyVehicle(vehicleId: string): boolean {
    const vehicle = VEHICLES_CATALOG.find(v => v.id === vehicleId);
    if (!vehicle || this.stats.ownedVehicles.includes(vehicleId)) return false;
    if (this.stats.money < vehicle.price) return false;

    if (this.spendMoney(vehicle.price, `Purchased ${vehicle.name}`, `רכישת ${vehicle.hebrewName}`)) {
      this.stats.ownedVehicles.push(vehicleId);
      this.stats.activeVehicleId = vehicleId;
      if (!this.stats.vehicleUpgrades[vehicleId]) {
        this.stats.vehicleUpgrades[vehicleId] = {
          color: vehicle.color,
          neonColor: vehicle.neonColor || '#00ffff',
          engineLevel: vehicle.engineLevel,
          rimColor: '#ffffff',
          hasTurbo: false
        };
      }
      this.notify();
      return true;
    }
    return false;
  }

  public selectActiveVehicle(vehicleId: string) {
    if (this.stats.ownedVehicles.includes(vehicleId)) {
      this.stats.activeVehicleId = vehicleId;
      this.notify();
    }
  }

  public upgradeVehicle(vehicleId: string, upgradeType: 'engine' | 'color' | 'neon' | 'turbo', value: any, cost: number): boolean {
    if (this.stats.money < cost) return false;
    if (!this.stats.vehicleUpgrades[vehicleId]) return false;

    if (this.spendMoney(cost, `Tuning: ${upgradeType}`, `שיפור מוסך: ${upgradeType}`)) {
      if (upgradeType === 'engine') {
        this.stats.vehicleUpgrades[vehicleId].engineLevel = Math.min(3, (this.stats.vehicleUpgrades[vehicleId].engineLevel || 1) + 1);
      } else if (upgradeType === 'color') {
        this.stats.vehicleUpgrades[vehicleId].color = value;
      } else if (upgradeType === 'neon') {
        this.stats.vehicleUpgrades[vehicleId].neonColor = value;
      } else if (upgradeType === 'turbo') {
        this.stats.vehicleUpgrades[vehicleId].hasTurbo = true;
      }
      this.notify();
      return true;
    }
    return false;
  }

  // Property Management
  public buyProperty(propertyId: string): boolean {
    const prop = PROPERTIES_CATALOG.find(p => p.id === propertyId);
    if (!prop || this.stats.ownedProperties.includes(propertyId)) return false;
    if (this.stats.money < prop.price) return false;

    if (this.spendMoney(prop.price, `Purchased ${prop.name}`, `רכישת ${prop.hebrewName}`)) {
      this.stats.ownedProperties.push(propertyId);
      this.stats.currentPropertyId = propertyId;
      this.notify();
      return true;
    }
    return false;
  }

  public setInteriorState(isInside: boolean, interiorId: string | null = null) {
    this.stats.isInsideInterior = isInside;
    this.stats.interiorId = interiorId;
    this.notify();
  }

  // Business Management
  public buyBusiness(businessId: string): boolean {
    const biz = BUSINESSES_CATALOG.find(b => b.id === businessId);
    if (!biz || this.stats.ownedBusinesses.includes(businessId)) return false;
    if (this.stats.money < biz.price) return false;

    if (this.spendMoney(biz.price, `Acquired ${biz.name}`, `רכישת ${biz.hebrewName}`)) {
      this.stats.ownedBusinesses.push(businessId);
      biz.owned = true;
      biz.lastCollectTime = Date.now();
      this.notify();
      return true;
    }
    return false;
  }

  public collectBusinessIncome(businessId: string): number {
    const biz = BUSINESSES_CATALOG.find(b => b.id === businessId);
    if (!biz || !this.stats.ownedBusinesses.includes(businessId)) return 0;

    const amount = Math.floor(biz.uncollectedIncome);
    if (amount > 0) {
      biz.uncollectedIncome = 0;
      this.addMoney(amount, `Profits from ${biz.name}`, `רווחים מ-${biz.hebrewName}`);
      return amount;
    }
    return 0;
  }

  public collectAllBusinessesIncome(): number {
    let total = 0;
    this.stats.ownedBusinesses.forEach(id => {
      const biz = BUSINESSES_CATALOG.find(b => b.id === id);
      if (biz && biz.uncollectedIncome > 0) {
        total += Math.floor(biz.uncollectedIncome);
        biz.uncollectedIncome = 0;
      }
    });
    if (total > 0) {
      this.addMoney(total, 'Total Business Dividends', 'משיכת רווחי כל העסקים');
    }
    return total;
  }

  private startPassiveIncomeLoop() {
    this.passiveIncomeTimer = window.setInterval(() => {
      let updated = false;
      this.stats.ownedBusinesses.forEach(id => {
        const biz = BUSINESSES_CATALOG.find(b => b.id === id);
        if (biz) {
          // Add income every 10 seconds: (incomePerMin / 6)
          biz.uncollectedIncome += (biz.incomePerMin / 6);
          updated = true;
        }
      });
      if (updated) this.notify();
    }, 10000);
  }

  // Missions System
  public startMission(missionId: string): boolean {
    const mission = MISSIONS_CATALOG.find(m => m.id === missionId);
    if (!mission) return false;

    this.stats.activeMissionId = missionId;
    this.missionRemainingTime = mission.timeLimit;

    if (this.missionTimer) clearInterval(this.missionTimer);
    this.missionTimer = window.setInterval(() => {
      this.missionRemainingTime -= 1;
      if (this.missionRemainingTime <= 0) {
        this.failMission('Time expired!');
      } else {
        this.notify();
      }
    }, 1000);

    SoundFX.playClick();
    this.notify();
    return true;
  }

  public completeActiveMission() {
    if (!this.stats.activeMissionId) return;
    const mission = MISSIONS_CATALOG.find(m => m.id === this.stats.activeMissionId);
    if (!mission) return;

    if (this.missionTimer) {
      clearInterval(this.missionTimer);
      this.missionTimer = null;
    }

    mission.completed = true;
    this.addMoney(mission.reward, `Completed: ${mission.title}`, `סיום משימה: ${mission.hebrewTitle}`);
    this.stats.activeMissionId = null;
    SoundFX.playMissionCompleteSound();
    this.notify();
  }

  public failMission(reason = 'Mission Failed') {
    if (this.missionTimer) {
      clearInterval(this.missionTimer);
      this.missionTimer = null;
    }
    this.stats.activeMissionId = null;
    this.notify();
  }

  // Driving State
  public setDriving(isDriving: boolean) {
    this.stats.isDriving = isDriving;
    this.notify();
  }

  public setDistrict(name: string) {
    if (this.stats.currentDistrict !== name) {
      this.stats.currentDistrict = name;
      this.notify();
    }
  }

  // Test cheat for rapid testing / evaluation
  public testCheatAddCash() {
    this.addMoney(50000, 'VIP Developer Sponsorship', 'מענק מפתחים מיוחד לבדיקות');
  }

  // Local Storage Save/Load
  private saveToStorage() {
    try {
      const data = {
        stats: this.stats,
        transactions: this.transactions
      };
      localStorage.setItem('city_life_savegame', JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('city_life_savegame');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.stats) {
          this.stats = { ...this.stats, ...parsed.stats };
          // Ensure owned vehicles have default starting vehicle
          if (!this.stats.ownedVehicles.includes('starter_hatchback')) {
            this.stats.ownedVehicles.push('starter_hatchback');
          }
          if (!this.stats.ownedProperties.includes('starter_studio')) {
            this.stats.ownedProperties.push('starter_studio');
          }
        }
        if (parsed.transactions) {
          this.transactions = parsed.transactions;
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

export const GameEconomy = new EconomyManager();
