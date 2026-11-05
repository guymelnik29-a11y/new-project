// 3D Vehicle Models Generator for CITY LIFE
// Builds Hypercar, Muscle Car, Luxury Sedan, Offroad SUV, Starter Hatchback & Airplane

import * as THREE from 'three';

export interface VehicleParts {
  root: THREE.Group;
  bodyMesh: THREE.Mesh;
  bodyMaterial: THREE.MeshStandardMaterial;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  headlightLeft: THREE.SpotLight;
  headlightRight: THREE.SpotLight;
  brakeLightMesh: THREE.Mesh;
  brakeLightMaterial: THREE.MeshBasicMaterial;
  nitroFlames: THREE.Mesh[];
  category: string;
}

export class VehicleModelFactory {
  public static createVehicle(category: string, paintColor = '#3498db', neonColor = '#00ffff'): VehicleParts {
    const root = new THREE.Group();

    // Body Paint Material (Metallic PBR with subtle reflections)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(paintColor),
      metalness: 0.85,
      roughness: 0.25
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1c2833, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, metalness: 0.95, roughness: 0.1 });

    let bodyMesh: THREE.Mesh;
    let wheelRadius = 0.42;
    let wheelWidth = 0.32;
    let wheelbase = 2.6;
    let trackWidth = 1.8;
    let carHeight = 1.35;
    let nitroFlames: THREE.Mesh[] = [];

    // Distinct vehicle shapes based on category
    if (category === 'supercar') {
      // APEX GT: Low, wide, wedge shape with rear diffuser & GT wing
      wheelbase = 2.7;
      trackWidth = 2.0;
      carHeight = 1.15;
      wheelRadius = 0.44;

      const bodyGeo = new THREE.BoxGeometry(2.0, 0.65, 4.6);
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
      bodyMesh.position.y = 0.55;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      // Cabin greenhouse
      const cabinGeo = new THREE.BoxGeometry(1.6, 0.55, 2.2);
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.0, -0.2);
      root.add(cabin);

      // GT Rear Wing
      const wingGeo = new THREE.BoxGeometry(1.9, 0.08, 0.45);
      const wing = new THREE.Mesh(wingGeo, darkTrimMat);
      wing.position.set(0, 1.25, -2.1);
      root.add(wing);

      // Wing struts
      [-0.6, 0.6].forEach(x => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.15), darkTrimMat);
        strut.position.set(x, 1.05, -2.1);
        root.add(strut);
      });
    } else if (category === 'muscle') {
      // VENOM V8: Aggressive square shoulders, hood scoop, quad exhaust
      wheelbase = 2.8;
      trackWidth = 1.9;
      carHeight = 1.3;

      const bodyGeo = new THREE.BoxGeometry(1.95, 0.75, 4.8);
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
      bodyMesh.position.y = 0.65;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      // Fastback roof
      const cabinGeo = new THREE.BoxGeometry(1.65, 0.6, 2.4);
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.18, -0.4);
      root.add(cabin);

      // Supercharger Hood Scoop
      const scoopGeo = new THREE.BoxGeometry(0.65, 0.22, 0.9);
      const scoop = new THREE.Mesh(scoopGeo, chromeMat);
      scoop.position.set(0, 1.1, 1.1);
      root.add(scoop);
    } else if (category === 'suv') {
      // TITAN 4x4: Elevated ride height, roof rack, flared arches
      wheelbase = 2.85;
      trackWidth = 2.1;
      carHeight = 1.8;
      wheelRadius = 0.55;
      wheelWidth = 0.4;

      const bodyGeo = new THREE.BoxGeometry(2.1, 0.9, 4.7);
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
      bodyMesh.position.y = 0.95;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const cabinGeo = new THREE.BoxGeometry(1.85, 0.85, 3.2);
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.6, -0.2);
      root.add(cabin);

      // Roof Bars
      const rackGeo = new THREE.BoxGeometry(1.6, 0.1, 2.6);
      const rack = new THREE.Mesh(rackGeo, darkTrimMat);
      rack.position.set(0, 2.1, -0.2);
      root.add(rack);
    } else if (category === 'sedan') {
      // STARLIGHT LUXURY SEDAN: Sleek executive profile with chrome grille
      wheelbase = 2.9;
      trackWidth = 1.85;
      carHeight = 1.4;

      const bodyGeo = new THREE.BoxGeometry(1.85, 0.72, 4.9);
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
      bodyMesh.position.y = 0.65;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const cabinGeo = new THREE.BoxGeometry(1.55, 0.65, 2.7);
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.2, -0.1);
      root.add(cabin);

      // Chrome front grille
      const grilleGeo = new THREE.BoxGeometry(1.2, 0.4, 0.1);
      const grille = new THREE.Mesh(grilleGeo, chromeMat);
      grille.position.set(0, 0.65, 2.46);
      root.add(grille);
    } else if (category === 'plane') {
      // AEROPLANE: Fuselage, wings, tail fin, jet engines
      wheelbase = 4.0;
      trackWidth = 3.0;
      carHeight = 2.2;

      const bodyGeo = new THREE.CylinderGeometry(1.1, 0.9, 11, 16);
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
      bodyMesh.rotation.x = Math.PI / 2;
      bodyMesh.position.y = 1.8;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      // Cockpit windows
      const cockpitGeo = new THREE.SphereGeometry(1.0, 12, 12, 0, Math.PI, 0, Math.PI / 2);
      const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
      cockpit.rotation.x = -Math.PI / 4;
      cockpit.position.set(0, 2.4, 3.8);
      root.add(cockpit);

      // Airplane Main Wings
      const wingGeo = new THREE.BoxGeometry(14, 0.2, 2.4);
      const wing = new THREE.Mesh(wingGeo, bodyMaterial);
      wing.position.set(0, 1.6, 0);
      root.add(wing);

      // Vertical Tail Fin
      const tailFinGeo = new THREE.BoxGeometry(0.2, 2.5, 1.8);
      const tailFin = new THREE.Mesh(tailFinGeo, bodyMaterial);
      tailFin.position.set(0, 3.2, -4.8);
      root.add(tailFin);
    } else {
      // STARTER HATCHBACK: Compact city car
      wheelbase = 2.4;
      trackWidth = 1.7;
      carHeight = 1.4;

      const bodyGeo = new THREE.BoxGeometry(1.7, 0.72, 3.8);
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
      bodyMesh.position.y = 0.65;
      bodyMesh.castShadow = true;
      root.add(bodyMesh);

      const cabinGeo = new THREE.BoxGeometry(1.45, 0.65, 2.2);
      const cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.2, -0.2);
      root.add(cabin);
    }

    // Neon Underglow Light Tube
    if (neonColor) {
      const neonGeo = new THREE.BoxGeometry(trackWidth - 0.4, 0.05, wheelbase);
      const neonMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(neonColor) });
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.position.y = 0.15;
      root.add(neon);
    }

    // 4 Wheels
    const createWheel = () => {
      const wGroup = new THREE.Group();
      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      // Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.68, wheelRadius * 0.68, wheelWidth + 0.02, 12);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9, roughness: 0.2 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      return wGroup;
    };

    const frontLeftWheel = createWheel();
    const frontRightWheel = createWheel();
    const rearLeftWheel = createWheel();
    const rearRightWheel = createWheel();

    const halfTrack = trackWidth / 2;
    const halfBase = wheelbase / 2;

    frontLeftWheel.position.set(-halfTrack, wheelRadius, halfBase);
    frontRightWheel.position.set(halfTrack, wheelRadius, halfBase);
    rearLeftWheel.position.set(-halfTrack, wheelRadius, -halfBase);
    rearRightWheel.position.set(halfTrack, wheelRadius, -halfBase);

    root.add(frontLeftWheel);
    root.add(frontRightWheel);
    root.add(rearLeftWheel);
    root.add(rearRightWheel);

    // Front Headlights (SpotLights + Emissive lens meshes)
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.1), hlMat);
    lensL.position.set(-trackWidth * 0.38, 0.7, halfBase + 0.95);
    root.add(lensL);

    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.1), hlMat);
    lensR.position.set(trackWidth * 0.38, 0.7, halfBase + 0.95);
    root.add(lensR);

    const headlightLeft = new THREE.SpotLight(0xffffff, 2.5, 45, Math.PI / 5, 0.3, 1.2);
    headlightLeft.position.set(-trackWidth * 0.38, 0.7, halfBase + 1.0);
    const targetL = new THREE.Object3D();
    targetL.position.set(-trackWidth * 0.38, 0.2, halfBase + 25);
    root.add(targetL);
    headlightLeft.target = targetL;
    root.add(headlightLeft);

    const headlightRight = new THREE.SpotLight(0xffffff, 2.5, 45, Math.PI / 5, 0.3, 1.2);
    headlightRight.position.set(trackWidth * 0.38, 0.7, halfBase + 1.0);
    const targetR = new THREE.Object3D();
    targetR.position.set(trackWidth * 0.38, 0.2, halfBase + 25);
    root.add(targetR);
    headlightRight.target = targetR;
    root.add(headlightRight);

    // Rear Brake / Taillights
    const brakeLightMaterial = new THREE.MeshBasicMaterial({ color: 0x990000 });
    const brakeLightGeo = new THREE.BoxGeometry(trackWidth * 0.8, 0.15, 0.1);
    const brakeLightMesh = new THREE.Mesh(brakeLightGeo, brakeLightMaterial);
    brakeLightMesh.position.set(0, 0.75, -halfBase - 0.95);
    root.add(brakeLightMesh);

    // Nitro Flame particle meshes
    [-0.35, 0.35].forEach(x => {
      const flameGeo = new THREE.ConeGeometry(0.12, 0.8, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.45, -halfBase - 1.2);
      root.add(flame);
      nitroFlames.push(flame);
    });

    return {
      root,
      bodyMesh,
      bodyMaterial,
      frontLeftWheel,
      frontRightWheel,
      rearLeftWheel,
      rearRightWheel,
      headlightLeft,
      headlightRight,
      brakeLightMesh,
      brakeLightMaterial,
      nitroFlames,
      category
    };
  }
}
