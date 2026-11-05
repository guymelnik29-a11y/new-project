// Interactive Property Interiors for CITY LIFE
// Builds 3D rooms: Starter Apartment, Penthouse Loft & Luxury Villa with furniture, bed (sleep), TV & balcony

import * as THREE from 'three';

export interface InteriorSpace {
  id: string;
  name: string;
  root: THREE.Group;
  spawnPoint: THREE.Vector3;
  exitPoint: THREE.Vector3;
  worldExitPosition: THREE.Vector3; // street location when exiting
  bedPosition: THREE.Vector3;
}

export class InteriorManager {
  public scene: THREE.Scene;
  public interiors: Map<string, InteriorSpace> = new Map();
  public activeInterior: InteriorSpace | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildStarterApartment();
    this.buildPenthouseLoft();
  }

  // 1. Starter Studio Apartment
  private buildStarterApartment() {
    const root = new THREE.Group();
    const origin = new THREE.Vector3(0, 500, 0);
    root.position.copy(origin);

    const roomW = 14;
    const roomL = 18;
    const roomH = 4.2;

    // Hardwood Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.4, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);

    // Ceiling with recessed warm spotlights
    const ceilingGeo = new THREE.PlaneGeometry(roomW, roomL);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.9 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomH;
    root.add(ceiling);

    const ceilingLight = new THREE.PointLight(0xfff5e6, 2.5, 18);
    ceilingLight.position.set(0, roomH - 0.5, 0);
    root.add(ceilingLight);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.8 });
    const accentWallMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.3), accentWallMat);
    backWall.position.set(0, roomH / 2, -roomL / 2);
    root.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, roomH, roomL), wallMat);
    leftWall.position.set(-roomW / 2, roomH / 2, 0);
    root.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, roomH, roomL), wallMat);
    rightWall.position.set(roomW / 2, roomH / 2, 0);
    root.add(rightWall);

    // Front Balcony Wall (Glass French doors overlooking city)
    const glassDoorGeo = new THREE.BoxGeometry(roomW, roomH, 0.2);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x81ecec, transparent: true, opacity: 0.45, roughness: 0.1 });
    const glassDoor = new THREE.Mesh(glassDoorGeo, glassMat);
    glassDoor.position.set(0, roomH / 2, roomL / 2);
    root.add(glassDoor);

    // Balcony Deck outside glass door
    const balcGeo = new THREE.BoxGeometry(roomW, 0.3, 4);
    const balc = new THREE.Mesh(balcGeo, floorMat);
    balc.position.set(0, 0, roomL / 2 + 2);
    root.add(balc);

    // Balcony Railing
    const railMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.8 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(roomW, 1.2, 0.1), railMat);
    rail.position.set(0, 0.6, roomL / 2 + 4);
    root.add(rail);

    // --- Furniture ---
    // 1. Bed (interactive for sleep)
    const bedGroup = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(3.2, 0.5, 4.0);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.25;
    bedGroup.add(frame);

    const mattressGeo = new THREE.BoxGeometry(3.0, 0.4, 3.8);
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.9 });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.y = 0.6;
    bedGroup.add(mattress);

    const duvetGeo = new THREE.BoxGeometry(3.02, 0.2, 2.6);
    const duvetMat = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.7 });
    const duvet = new THREE.Mesh(duvetGeo, duvetMat);
    duvet.position.set(0, 0.75, 0.6);
    bedGroup.add(duvet);

    bedGroup.position.set(-roomW / 2 + 2.5, 0, -roomL / 2 + 2.8);
    root.add(bedGroup);

    // 2. Modern Living Room Sofa
    const sofaGroup = new THREE.Group();
    const seatGeo = new THREE.BoxGeometry(4.0, 0.5, 1.8);
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, sofaMat);
    seat.position.y = 0.4;
    sofaGroup.add(seat);

    const backGeo = new THREE.BoxGeometry(4.0, 1.1, 0.5);
    const back = new THREE.Mesh(backGeo, sofaMat);
    back.position.set(0, 0.8, -0.7);
    sofaGroup.add(back);

    sofaGroup.position.set(3, 0, 1);
    root.add(sofaGroup);

    // Coffee table & Carpet
    const carpetGeo = new THREE.PlaneGeometry(5, 4);
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.95 });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(3, 0.02, 3);
    root.add(carpet);

    // 3. Wall-mounted Widescreen TV
    const tvGroup = new THREE.Group();
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    tvGroup.add(frameMesh);

    // TV Screen (glowing animated canvas texture)
    const tvScreenCanvas = document.createElement('canvas');
    tvScreenCanvas.width = 256; tvScreenCanvas.height = 144;
    const tvCtx = tvScreenCanvas.getContext('2d')!;
    tvCtx.fillStyle = '#0984e3'; tvCtx.fillRect(0, 0, 256, 144);
    tvCtx.fillStyle = '#ffffff'; tvCtx.font = 'bold 24px Chakra Petch';
    tvCtx.textAlign = 'center';
    tvCtx.fillText('CITY LIFE NEWS', 128, 60);
    tvCtx.font = '16px sans-serif';
    tvCtx.fillText('Economy Booming in Downtown', 128, 90);

    const tvTex = new THREE.CanvasTexture(tvScreenCanvas);
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.2), new THREE.MeshBasicMaterial({ map: tvTex }));
    screenMesh.position.z = 0.06;
    tvGroup.add(screenMesh);

    tvGroup.position.set(3, 2.2, 5.8);
    tvGroup.rotation.y = Math.PI;
    root.add(tvGroup);

    // 4. Apartment Exit Door Marker
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.2), new THREE.MeshStandardMaterial({ color: 0x7f8c8d }));
    doorFrame.position.set(-roomW / 2 + 1.2, 1.4, roomL / 2 - 0.2);
    root.add(doorFrame);

    const exitGlow = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.2, 16), new THREE.MeshBasicMaterial({ color: 0x2ecc71, side: THREE.DoubleSide }));
    exitGlow.rotation.x = -Math.PI / 2;
    exitGlow.position.set(-roomW / 2 + 1.2, 0.05, roomL / 2 - 1.5);
    root.add(exitGlow);

    this.scene.add(root);

    this.interiors.set('starter_studio', {
      id: 'starter_studio',
      name: 'Starter Studio Apartment',
      root,
      spawnPoint: new THREE.Vector3(0, 500.5, 0),
      exitPoint: new THREE.Vector3(-roomW / 2 + 1.2, 500, roomL / 2 - 1.5),
      worldExitPosition: new THREE.Vector3(-120, 0, 175),
      bedPosition: new THREE.Vector3(-roomW / 2 + 2.5, 500, -roomL / 2 + 2.8)
    });
  }

  // 2. Marina Penthouse Interior
  private buildPenthouseLoft() {
    const root = new THREE.Group();
    const origin = new THREE.Vector3(0, 500, 200);
    root.position.copy(origin);

    const roomW = 22;
    const roomL = 26;
    const roomH = 6.5;

    // Polished White Marble Floor
    const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.15, metalness: 0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    root.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.8 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomH;
    root.add(ceiling);

    // Chandelier Light
    const chLight = new THREE.PointLight(0xffeedd, 3.5, 25);
    chLight.position.set(0, roomH - 1, 0);
    root.add(chLight);

    // Designer Bar Counter
    const barGeo = new THREE.BoxGeometry(6, 1.2, 1.4);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(-6, 0.6, 4);
    root.add(bar);

    // Glass Floor-to-Ceiling Wall overlooking city
    const glassWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), new THREE.MeshStandardMaterial({ color: 0x81ecec, transparent: true, opacity: 0.35 }));
    glassWall.position.set(0, roomH / 2, roomL / 2);
    root.add(glassWall);

    this.scene.add(root);

    this.interiors.set('marina_penthouse', {
      id: 'marina_penthouse',
      name: 'Marina Bay Penthouse',
      root,
      spawnPoint: new THREE.Vector3(0, 500.5, 200),
      exitPoint: new THREE.Vector3(0, 500, 200 + roomL / 2 - 2),
      worldExitPosition: new THREE.Vector3(-80, 0, -125),
      bedPosition: new THREE.Vector3(6, 500, 200 - 6)
    });
  }

  public getInterior(id: string): InteriorSpace | undefined {
    return this.interiors.get(id);
  }
}
