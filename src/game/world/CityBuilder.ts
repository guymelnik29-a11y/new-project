// 3D City World Generator for CITY LIFE
// Builds Downtown Skyscrapers, Luxury Hills, Residential Suburbs, Beach & Marina, Airport, Roads, Streetlights & Props

import * as THREE from 'three';

export interface CollisionBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  type: 'building' | 'prop' | 'barrier' | 'water';
  name?: string;
}

export interface LandmarkLocation {
  id: string;
  name: string;
  hebrewName: string;
  type: 'property' | 'business' | 'dealership' | 'garage' | 'airport' | 'mission';
  position: THREE.Vector3;
  color: string;
  icon: string;
}

export class CityBuilder {
  public scene: THREE.Scene;
  public collisionBoxes: CollisionBox[] = [];
  public streetLights: THREE.Light[] = [];
  public windowEmissiveMaterials: THREE.MeshStandardMaterial[] = [];
  public landmarks: LandmarkLocation[] = [];
  public oceanMesh: THREE.Mesh | null = null;
  public rotatingObjects: { mesh: THREE.Object3D; speed: number }[] = [];

  // Procedural canvas textures
  private asphaltTexture: THREE.CanvasTexture | null = null;
  private roadCrossTexture: THREE.CanvasTexture | null = null;
  private sidewalkTexture: THREE.CanvasTexture | null = null;
  private windowTextureDay: THREE.CanvasTexture | null = null;
  private windowTextureNight: THREE.CanvasTexture | null = null;
  private runwayTexture: THREE.CanvasTexture | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.generateTextures();
  }

  private generateTextures() {
    // 1. Asphalt Road Texture (with dashed white lanes & yellow center double line)
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512;
    roadCanvas.height = 512;
    const ctx = roadCanvas.getContext('2d')!;

    // Dark asphalt base
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt grain
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#1a1c20' : '#2b2e35';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Yellow center double divider line
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(250, 0); ctx.lineTo(250, 512);
    ctx.moveTo(262, 0); ctx.lineTo(262, 512);
    ctx.stroke();

    // White dashed lane markers
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 5;
    ctx.setLineDash([30, 25]);
    ctx.beginPath();
    ctx.moveTo(125, 0); ctx.lineTo(125, 512);
    ctx.moveTo(387, 0); ctx.lineTo(387, 512);
    ctx.stroke();

    // Solid outer edge lines
    ctx.setLineDash([]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(15, 0); ctx.lineTo(15, 512);
    ctx.moveTo(497, 0); ctx.lineTo(497, 512);
    ctx.stroke();

    this.asphaltTexture = new THREE.CanvasTexture(roadCanvas);
    this.asphaltTexture.wrapS = THREE.RepeatWrapping;
    this.asphaltTexture.wrapT = THREE.RepeatWrapping;

    // 2. Intersection Road Texture
    const crossCanvas = document.createElement('canvas');
    crossCanvas.width = 512;
    crossCanvas.height = 512;
    const crossCtx = crossCanvas.getContext('2d')!;
    crossCtx.fillStyle = '#22252a';
    crossCtx.fillRect(0, 0, 512, 512);
    // Zebra crosswalks on borders
    crossCtx.fillStyle = '#ffffff';
    for (let i = 40; i < 480; i += 35) {
      crossCtx.fillRect(i, 20, 20, 50); // top
      crossCtx.fillRect(i, 442, 20, 50); // bottom
      crossCtx.fillRect(20, i, 50, 20); // left
      crossCtx.fillRect(442, i, 50, 20); // right
    }
    this.roadCrossTexture = new THREE.CanvasTexture(crossCanvas);

    // 3. Sidewalk Paving Texture
    const swCanvas = document.createElement('canvas');
    swCanvas.width = 256;
    swCanvas.height = 256;
    const swCtx = swCanvas.getContext('2d')!;
    swCtx.fillStyle = '#95a5a6';
    swCtx.fillRect(0, 0, 256, 256);
    swCtx.strokeStyle = '#7f8c8d';
    swCtx.lineWidth = 2;
    for (let x = 0; x <= 256; x += 32) {
      swCtx.beginPath(); swCtx.moveTo(x, 0); swCtx.lineTo(x, 256); swCtx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      swCtx.beginPath(); swCtx.moveTo(0, y); swCtx.lineTo(256, y); swCtx.stroke();
    }
    this.sidewalkTexture = new THREE.CanvasTexture(swCanvas);
    this.sidewalkTexture.wrapS = THREE.RepeatWrapping;
    this.sidewalkTexture.wrapT = THREE.RepeatWrapping;

    // 4. Skyscraper Window Grids (Day / Emissive Night)
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 512;
    winCanvas.height = 512;
    const winCtx = winCanvas.getContext('2d')!;
    winCtx.fillStyle = '#1c2833';
    winCtx.fillRect(0, 0, 512, 512);

    const winEmissCanvas = document.createElement('canvas');
    winEmissCanvas.width = 512;
    winEmissCanvas.height = 512;
    const winEmissCtx = winEmissCanvas.getContext('2d')!;
    winEmissCtx.fillStyle = '#000000';
    winEmissCtx.fillRect(0, 0, 512, 512);

    const cols = 16;
    const rows = 16;
    const w = 512 / cols;
    const h = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = Math.random() > 0.35;
        const tint = Math.random() > 0.4 ? '#fef9e7' : '#d4e6f1';

        winCtx.fillStyle = isLit ? tint : '#2c3e50';
        winCtx.fillRect(c * w + 4, r * h + 4, w - 8, h - 8);

        if (isLit) {
          winEmissCtx.fillStyle = tint;
          winEmissCtx.fillRect(c * w + 4, r * h + 4, w - 8, h - 8);
        }
      }
    }

    this.windowTextureDay = new THREE.CanvasTexture(winCanvas);
    this.windowTextureDay.wrapS = THREE.RepeatWrapping;
    this.windowTextureDay.wrapT = THREE.RepeatWrapping;

    this.windowTextureNight = new THREE.CanvasTexture(winEmissCanvas);
    this.windowTextureNight.wrapS = THREE.RepeatWrapping;
    this.windowTextureNight.wrapT = THREE.RepeatWrapping;

    // 5. Airport Runway Texture
    const runCanvas = document.createElement('canvas');
    runCanvas.width = 512;
    runCanvas.height = 1024;
    const rCtx = runCanvas.getContext('2d')!;
    rCtx.fillStyle = '#1b1d20';
    rCtx.fillRect(0, 0, 512, 1024);
    // Runway threshold piano keys
    rCtx.fillStyle = '#ffffff';
    for (let i = 40; i < 480; i += 40) {
      rCtx.fillRect(i, 40, 24, 120);
      rCtx.fillRect(i, 864, 24, 120);
    }
    // "09L" runway number
    rCtx.font = 'bold 90px Chakra Petch, sans-serif';
    rCtx.textAlign = 'center';
    rCtx.fillText('09L', 256, 250);
    // Centerline dashed
    rCtx.lineWidth = 14;
    rCtx.strokeStyle = '#ffffff';
    rCtx.setLineDash([80, 50]);
    rCtx.beginPath();
    rCtx.moveTo(256, 280);
    rCtx.lineTo(256, 850);
    rCtx.stroke();

    this.runwayTexture = new THREE.CanvasTexture(runCanvas);
  }

  public buildWorld() {
    this.buildGroundAndOcean();
    this.buildRoadNetwork();
    this.buildDowntownSkyscrapers();
    this.buildResidentialSuburbs();
    this.buildSunsetHillsVillas();
    this.buildCoastalBeachAndPier();
    this.buildInternationalAirport();
    this.buildDealershipAndGarage();
    this.buildStreetFurnitureAndTrees();
    this.buildFloatingMarkers();
  }

  // Ground, Grass & Ocean
  private buildGroundAndOcean() {
    // City Base Terrain
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2d3436,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Green Central Park & Grass areas
    const parkGeo = new THREE.PlaneGeometry(160, 160);
    const parkMat = new THREE.MeshStandardMaterial({
      color: 0x27ae60,
      roughness: 0.9,
      metalness: 0.05
    });
    const park = new THREE.Mesh(parkGeo, parkMat);
    park.rotation.x = -Math.PI / 2;
    park.position.set(-60, 0.02, -60);
    park.receiveShadow = true;
    this.scene.add(park);

    // Park Lake
    const lakeGeo = new THREE.CircleGeometry(35, 32);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      roughness: 0.1,
      metalness: 0.8
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(-60, 0.05, -60);
    this.scene.add(lake);

    // Giant Ocean to the South & West
    const oceanGeo = new THREE.PlaneGeometry(1200, 600, 64, 64);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x006699,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -1.2, 380);
    this.scene.add(ocean);
    this.oceanMesh = ocean;

    // Ocean Collision Box (so vehicles sink or bounce)
    this.collisionBoxes.push({
      min: new THREE.Vector3(-600, -10, 240),
      max: new THREE.Vector3(600, 0, 700),
      type: 'water',
      name: 'Pacific Ocean'
    });
  }

  // Modern Roads & Highways Network
  private buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTexture,
      roughness: 0.7,
      metalness: 0.2
    });

    const crossMat = new THREE.MeshStandardMaterial({
      map: this.roadCrossTexture,
      roughness: 0.7,
      metalness: 0.2
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: this.sidewalkTexture,
      roughness: 0.8,
      metalness: 0.1
    });

    // Main Avenue Grid (Avenues along Z and Streets along X)
    const avenuePositionsX = [-180, -90, 0, 90, 180];
    const streetPositionsZ = [-180, -90, 0, 90, 180];
    const roadWidth = 18;
    const cityExtent = 480;

    // North-South Avenues
    avenuePositionsX.forEach(x => {
      const segGeo = new THREE.PlaneGeometry(roadWidth, cityExtent);
      if (this.asphaltTexture) {
        const tex = this.asphaltTexture.clone();
        tex.repeat.set(1, 24);
        tex.needsUpdate = true;
        const mat = roadMat.clone();
        mat.map = tex;
        const road = new THREE.Mesh(segGeo, mat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(x, 0.02, 0);
        road.receiveShadow = true;
        this.scene.add(road);
      }

      // Sidewalks on left and right of road
      [-1, 1].forEach(side => {
        const swGeo = new THREE.BoxGeometry(4, 0.35, cityExtent);
        const sw = new THREE.Mesh(swGeo, sidewalkMat);
        sw.position.set(x + side * (roadWidth / 2 + 2), 0.17, 0);
        sw.receiveShadow = true;
        sw.castShadow = true;
        this.scene.add(sw);
      });
    });

    // East-West Streets
    streetPositionsZ.forEach(z => {
      const segGeo = new THREE.PlaneGeometry(cityExtent, roadWidth);
      if (this.asphaltTexture) {
        const tex = this.asphaltTexture.clone();
        tex.repeat.set(24, 1);
        tex.needsUpdate = true;
        const mat = roadMat.clone();
        mat.map = tex;
        const road = new THREE.Mesh(segGeo, mat);
        road.rotation.x = -Math.PI / 2;
        road.rotation.z = Math.PI / 2;
        road.position.set(0, 0.02, z);
        road.receiveShadow = true;
        this.scene.add(road);
      }

      // Sidewalks on top and bottom of street
      [-1, 1].forEach(side => {
        const swGeo = new THREE.BoxGeometry(cityExtent, 0.35, 4);
        const sw = new THREE.Mesh(swGeo, sidewalkMat);
        sw.position.set(0, 0.17, z + side * (roadWidth / 2 + 2));
        sw.receiveShadow = true;
        sw.castShadow = true;
        this.scene.add(sw);
      });
    });

    // Intersections
    avenuePositionsX.forEach(x => {
      streetPositionsZ.forEach(z => {
        const crossGeo = new THREE.PlaneGeometry(roadWidth + 1, roadWidth + 1);
        const cross = new THREE.Mesh(crossGeo, crossMat);
        cross.rotation.x = -Math.PI / 2;
        cross.position.set(x, 0.03, z);
        cross.receiveShadow = true;
        this.scene.add(cross);

        // Add 4 traffic light poles at major intersections
        this.buildTrafficLights(x, z, roadWidth);
      });
    });

    // Elevated Highway Overpass (running from -220 to +220 at z = -40, y = 8.5m)
    this.buildElevatedHighway(-230, 230, -40, 8.5);
  }

  // Elevated Highway with support pillars and guard rails
  private buildElevatedHighway(xStart: number, xEnd: number, z: number, height: number) {
    const length = Math.abs(xEnd - xStart);
    const width = 20;

    const deckGeo = new THREE.BoxGeometry(length, 1.2, width);
    const deckMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTexture,
      roughness: 0.65,
      metalness: 0.2
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set((xStart + xEnd) / 2, height, z);
    deck.receiveShadow = true;
    deck.castShadow = true;
    this.scene.add(deck);

    // Highway Guardrails
    [-1, 1].forEach(side => {
      const railGeo = new THREE.BoxGeometry(length, 1.4, 0.6);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.7, roughness: 0.3 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set((xStart + xEnd) / 2, height + 1.2, z + side * (width / 2 - 0.3));
      rail.castShadow = true;
      this.scene.add(rail);

      this.collisionBoxes.push({
        min: new THREE.Vector3(xStart, height, z + side * (width / 2 - 0.6)),
        max: new THREE.Vector3(xEnd, height + 2.5, z + side * (width / 2 + 0.6)),
        type: 'barrier'
      });
    });

    // Concrete Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.9 });
    for (let x = xStart + 25; x <= xEnd - 25; x += 45) {
      const pillarGeo = new THREE.CylinderGeometry(1.6, 1.8, height, 16);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, height / 2, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);

      this.collisionBoxes.push({
        min: new THREE.Vector3(x - 2, 0, z - 2),
        max: new THREE.Vector3(x + 2, height, z + 2),
        type: 'barrier'
      });
    }

    // Access Ramps at ends
    this.buildHighwayRamp(xStart - 40, xStart, z, height);
    this.buildHighwayRamp(xEnd + 40, xEnd, z, height, true);
  }

  private buildHighwayRamp(xFrom: number, xTo: number, z: number, targetHeight: number, reverse = false) {
    const rampLength = Math.abs(xTo - xFrom);
    const rampWidth = 18;
    const rampGeo = new THREE.BoxGeometry(rampLength, 1, rampWidth);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.7 });
    const ramp = new THREE.Mesh(rampGeo, rampMat);

    const angle = Math.atan2(targetHeight, rampLength) * (reverse ? 1 : -1);
    ramp.rotation.z = angle;
    ramp.position.set((xFrom + xTo) / 2, targetHeight / 2, z);
    ramp.receiveShadow = true;
    ramp.castShadow = true;
    this.scene.add(ramp);
  }

  // Traffic Lights at Intersections
  private buildTrafficLights(x: number, z: number, roadW: number) {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8, roughness: 0.2 });
    const lightBoxMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const cornerOffset = roadW / 2 + 2.5;
    const corners = [
      { cx: x - cornerOffset, cz: z - cornerOffset, rot: 0 },
      { cx: x + cornerOffset, cz: z + cornerOffset, rot: Math.PI }
    ];

    corners.forEach(c => {
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 6, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(c.cx, 3, c.cz);
      pole.castShadow = true;
      this.scene.add(pole);

      // Horizontal arm
      const armGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.5, 8);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(c.cx + 1.75, 5.8, c.cz);
      this.scene.add(arm);

      // Traffic light box
      const boxGeo = new THREE.BoxGeometry(0.6, 1.8, 0.6);
      const box = new THREE.Mesh(boxGeo, lightBoxMat);
      box.position.set(c.cx + 2.8, 5.5, c.cz);
      this.scene.add(box);

      // Green / Red lenses (emissive)
      const greenLensMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71 });
      const greenLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), greenLensMat);
      greenLens.position.set(c.cx + 2.8, 4.9, c.cz + 0.3);
      this.scene.add(greenLens);

      const redLensMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
      const redLens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), redLensMat);
      redLens.position.set(c.cx + 2.8, 6.1, c.cz + 0.3);
      this.scene.add(redLens);
    });
  }

  // Downtown Skyscrapers with Lit Windows & Rooftops
  private buildDowntownSkyscrapers() {
    const downtownBuildings = [
      // Central Plaza Towers
      { x: 35, z: -35, w: 32, d: 32, h: 110, color: 0x34495e, name: 'Apex Financial Tower', hasHelipad: true },
      { x: 35, z: 35, w: 28, d: 28, h: 95, color: 0x2c3e50, name: 'Nexus Trade Center' },
      { x: -35, z: 35, w: 26, d: 30, h: 80, color: 0x1a252f, name: 'Vanguard Plaza' },
      { x: 60, z: -40, w: 24, d: 24, h: 70, color: 0x2471a3, name: 'Downtown Horizon Loft', isProperty: true },

      // East Corporate Corridor
      { x: 135, z: -35, w: 34, d: 30, h: 125, color: 0x1b4f72, name: 'Skyline Capital Tower', hasSpire: true },
      { x: 135, z: 35, w: 28, d: 26, h: 88, color: 0x2e4053, name: 'Cyberdyne Global' },
      { x: 135, z: -135, w: 30, d: 30, h: 92, color: 0x212f3d, name: 'Omni Media Tower' },
      { x: 35, z: -135, w: 32, d: 26, h: 105, color: 0x283747, name: 'Grand Horizon Center' },
      { x: 120, z: -120, w: 28, d: 28, h: 65, color: 0x512e5f, name: 'Skyline Ultra Club', isBusiness: true },

      // Central Bank & Hotels
      { x: 45, z: 135, w: 36, d: 28, h: 60, color: 0x34495e, name: 'Pacific Grand Hotel' },
      { x: 135, z: 135, w: 30, d: 30, h: 75, color: 0x17202a, name: 'Federal Reserve Bank' }
    ];

    downtownBuildings.forEach(b => {
      this.createSkyscraper(b);
    });
  }

  private createSkyscraper(data: {
    x: number; z: number; w: number; d: number; h: number;
    color: number; name: string; hasHelipad?: boolean; hasSpire?: boolean;
    isProperty?: boolean; isBusiness?: boolean;
  }) {
    // Clone window textures and set repeat count according to dimensions
    const winTexDay = this.windowTextureDay ? this.windowTextureDay.clone() : null;
    const winTexNight = this.windowTextureNight ? this.windowTextureNight.clone() : null;
    if (winTexDay && winTexNight) {
      winTexDay.repeat.set(data.w / 6, data.h / 6);
      winTexNight.repeat.set(data.w / 6, data.h / 6);
      winTexDay.needsUpdate = true;
      winTexNight.needsUpdate = true;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.35,
      metalness: 0.65,
      map: winTexDay,
      emissiveMap: winTexNight,
      emissive: new THREE.Color(0x333333),
      emissiveIntensity: 0.6
    });
    this.windowEmissiveMaterials.push(mat);

    const geo = new THREE.BoxGeometry(data.w, data.h, data.d);
    const building = new THREE.Mesh(geo, mat);
    building.position.set(data.x, data.h / 2, data.z);
    building.castShadow = true;
    building.receiveShadow = true;
    this.scene.add(building);

    // Collision Box
    this.collisionBoxes.push({
      min: new THREE.Vector3(data.x - data.w / 2, 0, data.z - data.d / 2),
      max: new THREE.Vector3(data.x + data.w / 2, data.h, data.z + data.d / 2),
      type: 'building',
      name: data.name
    });

    // Rooftop AC units and details
    const acGeo = new THREE.BoxGeometry(data.w * 0.4, 3, data.d * 0.4);
    const acMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.8 });
    const ac = new THREE.Mesh(acGeo, acMat);
    ac.position.set(data.x, data.h + 1.5, data.z);
    ac.castShadow = true;
    this.scene.add(ac);

    // Helipad if flagged
    if (data.hasHelipad) {
      const padGeo = new THREE.CylinderGeometry(8, 8, 0.4, 16);
      const padCanvas = document.createElement('canvas');
      padCanvas.width = 128; padCanvas.height = 128;
      const pCtx = padCanvas.getContext('2d')!;
      pCtx.fillStyle = '#2c3e50'; pCtx.fillRect(0, 0, 128, 128);
      pCtx.strokeStyle = '#f1c40f'; pCtx.lineWidth = 8;
      pCtx.strokeRect(10, 10, 108, 108);
      pCtx.fillStyle = '#f1c40f'; pCtx.font = 'bold 64px Rajdhani';
      pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
      pCtx.fillText('H', 64, 64);

      const padTex = new THREE.CanvasTexture(padCanvas);
      const padMat = new THREE.MeshStandardMaterial({ map: padTex });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(data.x, data.h + 0.2, data.z);
      this.scene.add(pad);
    }

    // Antenna Spire with blinking red light
    if (data.hasSpire) {
      const spireGeo = new THREE.CylinderGeometry(0.2, 0.8, 22, 8);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(data.x, data.h + 11, data.z);
      this.scene.add(spire);

      // Warning beacon light
      const beaconGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(data.x, data.h + 22, data.z);
      this.scene.add(beacon);
    }

    // Street Entrance Portico / Canopy
    const canopyGeo = new THREE.BoxGeometry(10, 0.8, 5);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(data.x, 4.2, data.z + data.d / 2 + 2.5);
    canopy.castShadow = true;
    this.scene.add(canopy);
  }

  // Starter Residential Suburbs (South-West)
  private buildResidentialSuburbs() {
    // Starter Apartment Building (Where player begins the game!)
    const aptX = -120;
    const aptZ = 160;
    const aptW = 28;
    const aptD = 22;
    const aptH = 36;

    const aptGeo = new THREE.BoxGeometry(aptW, aptH, aptD);
    const aptMat = new THREE.MeshStandardMaterial({
      color: 0x34495e,
      roughness: 0.6,
      metalness: 0.3
    });
    const apt = new THREE.Mesh(aptGeo, aptMat);
    apt.position.set(aptX, aptH / 2, aptZ);
    apt.castShadow = true;
    apt.receiveShadow = true;
    this.scene.add(apt);

    this.collisionBoxes.push({
      min: new THREE.Vector3(aptX - aptW / 2, 0, aptZ - aptD / 2),
      max: new THREE.Vector3(aptX + aptW / 2, aptH, aptZ + aptD / 2),
      type: 'building',
      name: 'Starter Apartment Building'
    });

    // Balconies on apartment facade
    for (let floor = 6; floor < aptH - 4; floor += 6) {
      [-6, 6].forEach(offset => {
        const balcGeo = new THREE.BoxGeometry(7, 1.2, 2.5);
        const balcMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
        const balc = new THREE.Mesh(balcGeo, balcMat);
        balc.position.set(aptX + offset, floor, aptZ + aptD / 2 + 1.2);
        this.scene.add(balc);
      });
    }

    // Marked Parking Spot for Starter Car
    const parkSpotGeo = new THREE.PlaneGeometry(6, 10);
    const parkSpotCanvas = document.createElement('canvas');
    parkSpotCanvas.width = 128; parkSpotCanvas.height = 256;
    const psCtx = parkSpotCanvas.getContext('2d')!;
    psCtx.strokeStyle = '#f1c40f'; psCtx.lineWidth = 12;
    psCtx.strokeRect(10, 10, 108, 236);
    psCtx.fillStyle = '#ffffff'; psCtx.font = 'bold 36px sans-serif';
    psCtx.textAlign = 'center';
    psCtx.fillText('RESERVED', 64, 130);

    const psTex = new THREE.CanvasTexture(parkSpotCanvas);
    const psMat = new THREE.MeshStandardMaterial({ map: psTex, roughness: 0.8 });
    const parkSpot = new THREE.Mesh(parkSpotGeo, psMat);
    parkSpot.rotation.x = -Math.PI / 2;
    parkSpot.position.set(aptX - 18, 0.04, aptZ);
    this.scene.add(parkSpot);

    // Surrounding Townhouses & Residential blocks
    const houseConfigs = [
      { x: -145, z: 120, w: 16, d: 14, h: 12, color: 0xd35400 },
      { x: -145, z: 80, w: 16, d: 14, h: 14, color: 0xc0392b },
      { x: -90, z: 120, w: 18, d: 16, h: 15, color: 0x7f8c8d },
      { x: -90, z: 80, w: 16, d: 14, h: 12, color: 0xd68910 }
    ];

    houseConfigs.forEach(h => {
      const hGeo = new THREE.BoxGeometry(h.w, h.h, h.d);
      const hMat = new THREE.MeshStandardMaterial({ color: h.color, roughness: 0.8 });
      const house = new THREE.Mesh(hGeo, hMat);
      house.position.set(h.x, h.h / 2, h.z);
      house.castShadow = true;
      house.receiveShadow = true;
      this.scene.add(house);

      // Pitched roof
      const roofGeo = new THREE.ConeGeometry(Math.max(h.w, h.d) * 0.75, 5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(h.x, h.h + 2.5, h.z);
      this.scene.add(roof);

      this.collisionBoxes.push({
        min: new THREE.Vector3(h.x - h.w / 2, 0, h.z - h.d / 2),
        max: new THREE.Vector3(h.x + h.w / 2, h.h + 5, h.z + h.d / 2),
        type: 'building'
      });
    });
  }

  // Sunset Hills Luxury Mansions & Villas (North-West)
  private buildSunsetHillsVillas() {
    const villaX = 180;
    const villaZ = 140;

    // Villa Main Mansion Structure (Modern Cantilever Architecture)
    const lowerGeo = new THREE.BoxGeometry(32, 7, 24);
    const modernWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf4f6f7, roughness: 0.3, metalness: 0.1 });
    const lower = new THREE.Mesh(lowerGeo, modernWhiteMat);
    lower.position.set(villaX, 3.5, villaZ);
    lower.castShadow = true;
    lower.receiveShadow = true;
    this.scene.add(lower);

    // Upper Overhanging Level
    const upperGeo = new THREE.BoxGeometry(36, 6, 20);
    const upperMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.2, metalness: 0.4 });
    const upper = new THREE.Mesh(upperGeo, upperMat);
    upper.position.set(villaX + 4, 10, villaZ);
    upper.castShadow = true;
    this.scene.add(upper);

    // Private Swimming Pool with Sun Loungers
    const poolGeo = new THREE.BoxGeometry(16, 1.2, 8);
    const poolWaterMat = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const pool = new THREE.Mesh(poolGeo, poolWaterMat);
    pool.position.set(villaX - 16, 0.4, villaZ);
    this.scene.add(pool);

    // Marble pool deck
    const deckGeo = new THREE.BoxGeometry(22, 0.3, 14);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.4 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(villaX - 16, 0.15, villaZ);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // 4-car Garage
    const garageGeo = new THREE.BoxGeometry(18, 5, 12);
    const garage = new THREE.Mesh(garageGeo, modernWhiteMat);
    garage.position.set(villaX, 2.5, villaZ + 18);
    garage.castShadow = true;
    this.scene.add(garage);

    this.collisionBoxes.push({
      min: new THREE.Vector3(villaX - 18, 0, villaZ - 14),
      max: new THREE.Vector3(villaX + 22, 14, villaZ + 25),
      type: 'building',
      name: 'Sunset Hills Mega Villa'
    });
  }

  // Coastal Beach Promenade, Pier & Marina (South)
  private buildCoastalBeachAndPier() {
    // Sandy Beach Strip
    const beachGeo = new THREE.PlaneGeometry(600, 60);
    const beachMat = new THREE.MeshStandardMaterial({ color: 0xf5cd79, roughness: 0.95 });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, -0.2, 210);
    beach.receiveShadow = true;
    this.scene.add(beach);

    // Wooden Boardwalk Pier stretching out into ocean
    const pierGeo = new THREE.BoxGeometry(16, 1.2, 120);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(-80, 0.4, 260);
    pier.castShadow = true;
    pier.receiveShadow = true;
    this.scene.add(pier);

    // Pier Support Wooden Stilts
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
    for (let z = 210; z <= 310; z += 20) {
      [-6, 6].forEach(xOff => {
        const stiltGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
        const stilt = new THREE.Mesh(stiltGeo, stiltMat);
        stilt.position.set(-80 + xOff, -1, z);
        this.scene.add(stilt);
      });
    }

    // Luxury Yacht Moored at Pier
    const yachtGroup = new THREE.Group();
    const hullGeo = new THREE.ConeGeometry(6, 26, 4);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.4 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = Math.PI / 2;
    hull.rotation.y = Math.PI / 4;
    hull.scale.set(1.4, 1, 0.6);
    yachtGroup.add(hull);

    const cabinGeo = new THREE.BoxGeometry(5, 4, 12);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1a252f, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 2.5, -2);
    yachtGroup.add(cabin);

    yachtGroup.position.set(-65, -0.2, 280);
    this.scene.add(yachtGroup);

    // Marina Bay Penthouse Tower
    const marinaTowerGeo = new THREE.BoxGeometry(30, 85, 28);
    const marinaMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      roughness: 0.25,
      metalness: 0.75
    });
    const marinaTower = new THREE.Mesh(marinaTowerGeo, marinaMat);
    marinaTower.position.set(-80, 42.5, -140);
    marinaTower.castShadow = true;
    marinaTower.receiveShadow = true;
    this.scene.add(marinaTower);

    this.collisionBoxes.push({
      min: new THREE.Vector3(-95, 0, -154),
      max: new THREE.Vector3(-65, 85, -126),
      type: 'building',
      name: 'Marina Bay Penthouse'
    });
  }

  // International Airport with Runway & Control Tower
  private buildInternationalAirport() {
    const aptX = 180;
    const aptZ = -80;

    // Airport Runway
    const runwayGeo = new THREE.PlaneGeometry(35, 240);
    const runwayMat = new THREE.MeshStandardMaterial({
      map: this.runwayTexture,
      roughness: 0.75,
      metalness: 0.15
    });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.rotation.x = -Math.PI / 2;
    runway.position.set(aptX, 0.04, aptZ);
    runway.receiveShadow = true;
    this.scene.add(runway);

    // Runway Edge Lights (Green at threshold, white along edge, red at end)
    for (let z = -190; z <= 30; z += 20) {
      [-18, 18].forEach(xOff => {
        const lightGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(aptX + xOff, 0.3, z);
        this.scene.add(light);
      });
    }

    // Airport Control Tower
    const towerBaseGeo = new THREE.CylinderGeometry(3.5, 4.5, 38, 16);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.5 });
    const tower = new THREE.Mesh(towerBaseGeo, towerMat);
    tower.position.set(aptX - 45, 19, aptZ);
    tower.castShadow = true;
    this.scene.add(tower);

    // Control Cab Glass Observation Top
    const cabGeo = new THREE.CylinderGeometry(7, 5, 6, 16);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.1, metalness: 0.8 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(aptX - 45, 41, aptZ);
    this.scene.add(cab);

    // Airport Hangar (Large arched structure)
    const hangarGeo = new THREE.CylinderGeometry(20, 20, 45, 16, 1, false, 0, Math.PI);
    const hangarMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.6, roughness: 0.4 });
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.rotation.z = Math.PI / 2;
    hangar.position.set(aptX - 45, 0, aptZ + 40);
    hangar.castShadow = true;
    hangar.receiveShadow = true;
    this.scene.add(hangar);

    this.collisionBoxes.push({
      min: new THREE.Vector3(aptX - 65, 0, aptZ - 20),
      max: new THREE.Vector3(aptX - 25, 45, aptZ + 65),
      type: 'building',
      name: 'Airport Terminal & Hangar'
    });
  }

  // Apex Car Dealership & Neon Tuning Garage
  private buildDealershipAndGarage() {
    // 1. Apex Motors Dealership Showroom (Glass Cube with Supercar Turntable)
    const dealX = 0;
    const dealZ = -100;

    const showroomGeo = new THREE.BoxGeometry(32, 10, 26);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x3498db,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.9
    });
    const showroom = new THREE.Mesh(showroomGeo, glassMat);
    showroom.position.set(dealX, 5, dealZ);
    this.scene.add(showroom);

    // Dealership Frame & Roof
    const roofGeo = new THREE.BoxGeometry(34, 1.2, 28);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
    const roof = new THREE.Mesh(roofGeo, frameMat);
    roof.position.set(dealX, 10.6, dealZ);
    roof.castShadow = true;
    this.scene.add(roof);

    // Glowing Neon Brand Sign: "APEX MOTORS"
    const signGeo = new THREE.BoxGeometry(16, 2.5, 0.4);
    const signMat = new THREE.MeshBasicMaterial({ color: 0x00ffee });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(dealX, 12.2, dealZ + 13.5);
    this.scene.add(sign);

    // Rotating Display Turntable inside showroom
    const turntableGeo = new THREE.CylinderGeometry(6, 6, 0.6, 24);
    const ttMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, metalness: 0.8, roughness: 0.2 });
    const turntable = new THREE.Mesh(turntableGeo, ttMat);
    turntable.position.set(dealX, 0.3, dealZ);
    this.scene.add(turntable);
    this.rotatingObjects.push({ mesh: turntable, speed: 0.015 });

    this.collisionBoxes.push({
      min: new THREE.Vector3(dealX - 16, 0, dealZ - 13),
      max: new THREE.Vector3(dealX + 16, 11, dealZ + 13),
      type: 'building',
      name: 'Apex Motors Dealership'
    });

    // 2. Neon Custom Tuning Garage
    const garX = 90;
    const garZ = 60;
    const garGeo = new THREE.BoxGeometry(28, 9, 22);
    const garMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 });
    const garage = new THREE.Mesh(garGeo, garMat);
    garage.position.set(garX, 4.5, garZ);
    garage.castShadow = true;
    this.scene.add(garage);

    // Garage Roll-Up Door
    const doorGeo = new THREE.PlaneGeometry(10, 6.5);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.7, roughness: 0.3 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(garX, 3.25, garZ + 11.05);
    this.scene.add(door);

    // Garage Neon Sign
    const gSignGeo = new THREE.BoxGeometry(14, 2, 0.3);
    const gSignMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const gSign = new THREE.Mesh(gSignGeo, gSignMat);
    gSign.position.set(garX, 8, garZ + 11.2);
    this.scene.add(gSign);

    this.collisionBoxes.push({
      min: new THREE.Vector3(garX - 14, 0, garZ - 11),
      max: new THREE.Vector3(garX + 14, 9, garZ + 11),
      type: 'building',
      name: 'Neon Custom Tuning Garage'
    });
  }

  // Streetlamps, Palm Trees, Park Trees & Street Props
  private buildStreetFurnitureAndTrees() {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x34495e, metalness: 0.8, roughness: 0.3 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff9e6 });

    // Streetlamps along main avenues
    const streetLampCoords = [
      [-180, -45], [-180, 45], [-180, 135],
      [-90, -45], [-90, 45], [-90, 135],
      [0, -45], [0, 45], [0, 135],
      [90, -45], [90, 45], [90, 135],
      [180, -45], [180, 45], [180, 135]
    ];

    streetLampCoords.forEach(([x, z]) => {
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.25, 8.5, 8);
      const pole = new THREE.Mesh(poleGeo, lampMat);
      pole.position.set(x + 11.5, 4.25, z);
      pole.castShadow = true;
      this.scene.add(pole);

      // Curved Lamp Head
      const headGeo = new THREE.BoxGeometry(1.6, 0.3, 0.8);
      const head = new THREE.Mesh(headGeo, lampMat);
      head.position.set(x + 10.8, 8.5, z);
      this.scene.add(head);

      const bulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(x + 10.4, 8.3, z);
      this.scene.add(bulb);

      // Actual SpotLight illuminating the street!
      const spot = new THREE.SpotLight(0xffeedd, 2.8, 35, Math.PI / 4, 0.4, 1.2);
      spot.position.set(x + 10.4, 8.2, z);
      spot.target.position.set(x, 0, z);
      this.scene.add(spot);
      this.scene.add(spot.target);
      this.streetLights.push(spot);
    });

    // Palm Trees near Beach & South District
    for (let x = -200; x <= 200; x += 30) {
      this.createPalmTree(x, 185);
    }

    // Park Trees in Central Park
    const parkTreeCoords = [
      [-75, -75], [-45, -75], [-75, -45], [-45, -45],
      [-80, -60], [-40, -60], [-60, -80], [-60, -40]
    ];
    parkTreeCoords.forEach(([x, z]) => {
      this.createOakTree(x, z);
    });
  }

  private createPalmTree(x: number, z: number) {
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 9, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 4.5, z);
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    this.scene.add(trunk);

    // Palm fronds
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.6 });
    for (let i = 0; i < 6; i++) {
      const frondGeo = new THREE.ConeGeometry(1.6, 6, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.rotation.z = Math.PI / 3;
      frond.rotation.y = (i * Math.PI) / 3;
      frond.position.set(x, 8.8, z);
      this.scene.add(frond);
    }
  }

  private createOakTree(x: number, z: number) {
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 2, z);
    trunk.castShadow = true;
    this.scene.add(trunk);

    const foliageGeo = new THREE.DodecahedronGeometry(3.5, 1);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.8 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(x, 5.5, z);
    foliage.castShadow = true;
    this.scene.add(foliage);
  }

  // Floating 3D Interaction Markers (Home, Garage, Dealership, Mission)
  private buildFloatingMarkers() {
    const markerConfigs: LandmarkLocation[] = [
      { id: 'starter_studio', name: 'Starter Studio', hebrewName: 'דירת סטודיו', type: 'property', position: new THREE.Vector3(-120, 1.5, 172), color: '#3498db', icon: '🏢' },
      { id: 'downtown_loft', name: 'Downtown Loft', hebrewName: 'לופט דאונטאון', type: 'property', position: new THREE.Vector3(60, 1.5, -26), color: '#9b59b6', icon: '🏙️' },
      { id: 'marina_penthouse', name: 'Marina Penthouse', hebrewName: 'פנטהאוז מרינה', type: 'property', position: new THREE.Vector3(-80, 1.5, -125), color: '#1abc9c', icon: '🌇' },
      { id: 'sunset_villa', name: 'Sunset Villa', hebrewName: 'וילת סנסט הילס', type: 'property', position: new THREE.Vector3(180, 1.5, 126), color: '#f1c40f', icon: '🏰' },
      { id: 'neon_garage', name: 'Tuning Garage', hebrewName: 'מוסך שיפורים', type: 'garage', position: new THREE.Vector3(90, 1.5, 73), color: '#e74c3c', icon: '🔧' },
      { id: 'apex_dealership', name: 'Apex Dealership', hebrewName: 'סוכנות אפקס', type: 'dealership', position: new THREE.Vector3(0, 1.5, -86), color: '#e67e22', icon: '🏎️' },
      { id: 'airport', name: 'City Airport', hebrewName: 'שדה התעופה', type: 'airport', position: new THREE.Vector3(180, 1.5, -80), color: '#34495e', icon: '✈️' },
      { id: 'mission_courier', name: 'Express Mission', hebrewName: 'משימת משלוח', type: 'mission', position: new THREE.Vector3(-30, 1.5, 30), color: '#2ecc71', icon: '📦' }
    ];

    markerConfigs.forEach(m => {
      this.landmarks.push(m);

      // Glowing holographic beacon cylinder
      const ringGeo = new THREE.RingGeometry(2.5, 3.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(m.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(m.position);
      ring.position.y = 0.15;
      this.scene.add(ring);

      // Floating rotating diamond icon
      const diamondGeo = new THREE.OctahedronGeometry(1.2, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(m.color),
        emissive: new THREE.Color(m.color),
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.copy(m.position);
      diamond.position.y = 2.8;
      this.scene.add(diamond);

      this.rotatingObjects.push({ mesh: diamond, speed: 0.03 });
    });
  }

  // Update animations: water waves, rotating beacons, night lights
  public update(time: number, isNight: boolean) {
    // Rotate diamonds and turntables
    this.rotatingObjects.forEach(obj => {
      obj.mesh.rotation.y += obj.speed;
    });

    // Wave ripple on ocean
    if (this.oceanMesh && this.oceanMesh.geometry) {
      const pos = this.oceanMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const z = Math.sin(u * 0.05 + time * 2) * 0.4 + Math.cos(v * 0.05 + time * 1.5) * 0.3;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }

    // Streetlights & window emissive intensity based on day/night
    const targetEmissive = isNight ? 1.0 : 0.15;
    this.windowEmissiveMaterials.forEach(m => {
      m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, targetEmissive, 0.05);
    });

    const streetLightIntensity = isNight ? 3.0 : 0.0;
    this.streetLights.forEach(l => {
      l.intensity = THREE.MathUtils.lerp(l.intensity, streetLightIntensity, 0.05);
    });
  }
}
