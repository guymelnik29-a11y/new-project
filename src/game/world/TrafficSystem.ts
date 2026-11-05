// Ambient Traffic & Pedestrian System for CITY LIFE
// Creates moving AI cars on road routes & walking pedestrians on sidewalks

import * as THREE from 'three';

interface TrafficCar {
  mesh: THREE.Group;
  speed: number;
  routeAxis: 'x' | 'z';
  coord: number; // constant x or z
  direction: 1 | -1;
  minVal: number;
  maxVal: number;
  wheels: THREE.Group[];
}

interface Pedestrian {
  mesh: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  walkSpeed: number;
  routeAxis: 'x' | 'z';
  coord: number;
  direction: 1 | -1;
  minVal: number;
  maxVal: number;
  cycle: number;
}

export class TrafficSystem {
  public scene: THREE.Scene;
  public trafficCars: TrafficCar[] = [];
  public pedestrians: Pedestrian[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnTrafficCars();
    this.spawnPedestrians();
  }

  private spawnTrafficCars() {
    const carColors = [0x2980b9, 0xe74c3c, 0xf1c40f, 0xecf0f1, 0x2c3e50, 0x16a085, 0x8e44ad];
    const avenues = [-180, -90, 0, 90, 180];
    const streets = [-180, -90, 0, 90, 180];

    // Spawn 10 Avenue Cars (North-South along Z)
    avenues.forEach((x, idx) => {
      [-1, 1].forEach((dir, sIdx) => {
        const color = carColors[(idx * 2 + sIdx) % carColors.length];
        const car = this.createAICarMesh(color);
        const laneOffset = dir === 1 ? 4.5 : -4.5;
        const startZ = -200 + (idx * 50 + sIdx * 30) % 400;

        car.mesh.position.set(x + laneOffset, 0, startZ);
        car.mesh.rotation.y = dir === 1 ? 0 : Math.PI;
        this.scene.add(car.mesh);

        this.trafficCars.push({
          mesh: car.mesh,
          speed: 14 + Math.random() * 6,
          routeAxis: 'z',
          coord: x + laneOffset,
          direction: dir as (1 | -1),
          minVal: -230,
          maxVal: 230,
          wheels: car.wheels
        });
      });
    });

    // Spawn 8 Street Cars (East-West along X)
    streets.slice(0, 4).forEach((z, idx) => {
      [-1, 1].forEach((dir, sIdx) => {
        const color = carColors[(idx * 3 + sIdx + 1) % carColors.length];
        const car = this.createAICarMesh(color);
        const laneOffset = dir === 1 ? 4.5 : -4.5;
        const startX = -200 + (idx * 60 + sIdx * 40) % 400;

        car.mesh.position.set(startX, 0, z + laneOffset);
        car.mesh.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
        this.scene.add(car.mesh);

        this.trafficCars.push({
          mesh: car.mesh,
          speed: 13 + Math.random() * 5,
          routeAxis: 'x',
          coord: z + laneOffset,
          direction: dir as (1 | -1),
          minVal: -230,
          maxVal: 230,
          wheels: car.wheels
        });
      });
    });
  }

  private createAICarMesh(paintColor: number): { mesh: THREE.Group; wheels: THREE.Group[] } {
    const root = new THREE.Group();
    const wheels: THREE.Group[] = [];

    const bodyMat = new THREE.MeshStandardMaterial({ color: paintColor, metalness: 0.7, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 });

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.7, 4.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    body.castShadow = true;
    root.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.6, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.2, -0.2);
    root.add(cabin);

    // Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.6, 0.6].forEach(x => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.1), hlMat);
      hl.position.set(x, 0.65, 2.15);
      root.add(hl);
    });

    // Taillights
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
    [-0.6, 0.6].forEach(x => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.1), tlMat);
      tl.position.set(x, 0.65, -2.15);
      root.add(tl);
    });

    // Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.8 });

    const wheelPositions = [
      [-0.9, 0.4, 1.2],
      [0.9, 0.4, 1.2],
      [-0.9, 0.4, -1.2],
      [0.9, 0.4, -1.2]
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12), tireMat);
      tire.rotation.z = Math.PI / 2;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.32, 8), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      wGroup.position.set(wx, wy, wz);
      root.add(wGroup);
      wheels.push(wGroup);
    });

    return { mesh: root, wheels };
  }

  private spawnPedestrians() {
    const skinColors = [0xe0ac69, 0xf1c27d, 0x8d5524, 0xc68642];
    const shirtColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0x9b59b6, 0xf39c12, 0x1abc9c];

    // Sidewalk pedestrian tracks
    const sidewalkRoutes = [
      { axis: 'z', coord: -168, min: -180, max: 180 },
      { axis: 'z', coord: -78, min: -180, max: 180 },
      { axis: 'z', coord: 12, min: -180, max: 180 },
      { axis: 'z', coord: 102, min: -180, max: 180 },
      { axis: 'x', coord: -78, min: -180, max: 180 },
      { axis: 'x', coord: 12, min: -180, max: 180 },
      { axis: 'x', coord: 102, min: -180, max: 180 }
    ];

    for (let i = 0; i < 18; i++) {
      const route = sidewalkRoutes[i % sidewalkRoutes.length];
      const skinColor = skinColors[i % skinColors.length];
      const shirtColor = shirtColors[i % shirtColors.length];

      const pGroup = new THREE.Group();
      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 });

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.28), shirtMat);
      torso.position.y = 1.0;
      torso.castShadow = true;
      pGroup.add(torso);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), skinMat);
      head.position.y = 1.5;
      pGroup.add(head);

      // Arms
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), shirtMat);
      leftArm.position.set(-0.32, 0.95, 0);
      pGroup.add(leftArm);

      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), shirtMat);
      rightArm.position.set(0.32, 0.95, 0);
      pGroup.add(rightArm);

      // Legs
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), pantsMat);
      leftLeg.position.set(-0.14, 0.38, 0);
      pGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), pantsMat);
      rightLeg.position.set(0.14, 0.38, 0);
      pGroup.add(rightLeg);

      const dir = (Math.random() > 0.5 ? 1 : -1) as (1 | -1);
      const startPos = route.min + Math.random() * (route.max - route.min);

      if (route.axis === 'z') {
        pGroup.position.set(route.coord, 0.35, startPos);
        pGroup.rotation.y = dir === 1 ? 0 : Math.PI;
      } else {
        pGroup.position.set(startPos, 0.35, route.coord);
        pGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      }

      this.scene.add(pGroup);

      this.pedestrians.push({
        mesh: pGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        walkSpeed: 2.2 + Math.random() * 0.8,
        routeAxis: route.axis as ('x' | 'z'),
        coord: route.coord,
        direction: dir,
        minVal: route.min,
        maxVal: route.max,
        cycle: Math.random() * 10
      });
    }
  }

  public update(dt: number, playerCarPos: THREE.Vector3) {
    // 1. Update AI Traffic Cars
    this.trafficCars.forEach(car => {
      let isBlocked = false;

      // Distance check to player vehicle to avoid rear-ending player
      const distToPlayer = car.mesh.position.distanceTo(playerCarPos);
      if (distToPlayer < 10) {
        // Slow down or stop if approaching player from behind
        isBlocked = true;
      }

      if (!isBlocked) {
        const moveDist = car.speed * dt * car.direction;

        if (car.routeAxis === 'z') {
          car.mesh.position.z += moveDist;
          if (car.direction === 1 && car.mesh.position.z > car.maxVal) {
            car.mesh.position.z = car.minVal;
          } else if (car.direction === -1 && car.mesh.position.z < car.minVal) {
            car.mesh.position.z = car.maxVal;
          }
        } else {
          car.mesh.position.x += moveDist;
          if (car.direction === 1 && car.mesh.position.x > car.maxVal) {
            car.mesh.position.x = car.minVal;
          } else if (car.direction === -1 && car.mesh.position.x < car.minVal) {
            car.mesh.position.x = car.maxVal;
          }
        }

        // Spin wheels
        car.wheels.forEach(w => {
          w.rotation.x += car.speed * dt * 2.5;
        });
      }
    });

    // 2. Update AI Walking Pedestrians
    this.pedestrians.forEach(p => {
      const step = p.walkSpeed * dt * p.direction;
      p.cycle += dt * 6;

      if (p.routeAxis === 'z') {
        p.mesh.position.z += step;
        if (p.direction === 1 && p.mesh.position.z > p.maxVal) {
          p.direction = -1;
          p.mesh.rotation.y = Math.PI;
        } else if (p.direction === -1 && p.mesh.position.z < p.minVal) {
          p.direction = 1;
          p.mesh.rotation.y = 0;
        }
      } else {
        p.mesh.position.x += step;
        if (p.direction === 1 && p.mesh.position.x > p.maxVal) {
          p.direction = -1;
          p.mesh.rotation.y = -Math.PI / 2;
        } else if (p.direction === -1 && p.mesh.position.x < p.minVal) {
          p.direction = 1;
          p.mesh.rotation.y = Math.PI / 2;
        }
      }

      // Procedural limb walk animation
      const swing = Math.sin(p.cycle) * 0.55;
      p.leftLeg.rotation.x = swing;
      p.rightLeg.rotation.x = -swing;
      p.leftArm.rotation.x = -swing;
      p.rightArm.rotation.x = swing;
    });
  }
}
