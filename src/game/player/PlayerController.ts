// 3D Player Character & Third-Person Orbital Camera Controller for CITY LIFE
// Features procedural walk/sprint/jump animations, mouse orbit, collision avoidance & enter/exit car transitions

import * as THREE from 'three';
import { ControlState } from '../types';
import { CollisionBox } from '../world/CityBuilder';
import { SoundFX } from '../audio/SoundFX';

export class PlayerController {
  public group: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3(-120, 0, 175); // Starts outside Starter Apartment
  public rotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isGrounded = true;

  // Character body parts for procedural animation
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;

  // Camera Orbit
  public camera: THREE.PerspectiveCamera;
  public cameraYaw = 0;
  public cameraPitch = 0.25; // radians
  public cameraDistance = 5.2;
  public cameraMode: 'chase' | 'fps' | 'hood' = 'chase';

  private walkCycle = 0;
  private stepSoundTimer = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.group = new THREE.Group();

    // Build stylized 3D character
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.5 });
    const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1f3a52, roughness: 0.7 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.9 });

    // Torso / Jacket
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.68, 0.32);
    this.torso = new THREE.Mesh(torsoGeo, jacketMat);
    this.torso.position.y = 1.05;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.32, 0.35, 0.32);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 1.62;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.35, 0.15, 0.35);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.15, 0);
    this.head.add(hair);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
    this.leftArm = new THREE.Mesh(armGeo, jacketMat);
    this.leftArm.position.set(-0.38, 1.0, 0);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, jacketMat);
    this.rightArm.position.set(0.38, 1.0, 0);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.72, 0.22);
    this.leftLeg = new THREE.Mesh(legGeo, jeansMat);
    this.leftLeg.position.set(-0.16, 0.4, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, jeansMat);
    this.rightLeg.position.set(0.16, 0.4, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // Sneakers
    const shoeGeo = new THREE.BoxGeometry(0.22, 0.14, 0.3);
    const lShoe = new THREE.Mesh(shoeGeo, shoesMat);
    lShoe.position.set(0, -0.32, 0.04);
    this.leftLeg.add(lShoe);

    const rShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rShoe.position.set(0, -0.32, 0.04);
    this.rightLeg.add(rShoe);

    this.group.position.copy(this.position);
  }

  public handleMouseMove(dx: number, dy: number) {
    const sensitivity = 0.0022;
    this.cameraYaw -= dx * sensitivity;
    this.cameraPitch = Math.max(-0.25, Math.min(1.2, this.cameraPitch - dy * sensitivity));
  }

  public updateOnFoot(dt: number, controls: ControlState, collisions: CollisionBox[]) {
    // 1. Movement direction relative to camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

    const moveDir = new THREE.Vector3();
    if (controls.forward) moveDir.add(forward);
    if (controls.backward) moveDir.sub(forward);
    if (controls.left) moveDir.sub(right);
    if (controls.right) moveDir.add(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) moveDir.normalize();

    // Speed calculation: Walk = 4.5 m/s, Sprint = 9.5 m/s
    const speed = controls.sprint ? 9.5 : 4.5;
    const targetVelX = moveDir.x * speed;
    const targetVelZ = moveDir.z * speed;

    this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetVelX, dt * 12);
    this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, targetVelZ, dt * 12);

    // Jump & Gravity
    if (controls.jumpOrBrake && this.isGrounded) {
      this.velocity.y = 6.8;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= 22 * dt; // gravity
    }

    // Next proposed position
    const nextPos = this.position.clone().addScaledVector(this.velocity, dt);

    // Ground check (elevated bridge or ground)
    let groundHeight = 0;
    if (nextPos.z > -55 && nextPos.z < -25 && nextPos.x > -230 && nextPos.x < 230) {
      groundHeight = 8.5;
    }

    if (nextPos.y <= groundHeight) {
      nextPos.y = groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Resolve Collisions with buildings & barriers
    this.resolveCollisions(nextPos, collisions);

    this.position.copy(nextPos);
    this.group.position.copy(this.position);

    // Rotate player mesh in movement direction
    if (isMoving) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.rotation.y = THREE.MathUtils.lerp(this.rotation.y, targetAngle, dt * 14);
      this.group.rotation.y = this.rotation.y;
    }

    // Procedural Walking / Running Animation
    this.animateLimbs(dt, isMoving, controls.sprint);

    // Update 3rd person follow camera
    this.updateCameraFollow(dt);
  }

  private resolveCollisions(nextPos: THREE.Vector3, collisions: CollisionBox[]) {
    const playerRadius = 0.45;
    for (const box of collisions) {
      if (box.type === 'water') continue;

      if (
        nextPos.x + playerRadius > box.min.x &&
        nextPos.x - playerRadius < box.max.x &&
        nextPos.z + playerRadius > box.min.z &&
        nextPos.z - playerRadius < box.max.z &&
        nextPos.y < box.max.y &&
        nextPos.y + 1.8 > box.min.y
      ) {
        const dx1 = Math.abs(nextPos.x + playerRadius - box.min.x);
        const dx2 = Math.abs(box.max.x - (nextPos.x - playerRadius));
        const dz1 = Math.abs(nextPos.z + playerRadius - box.min.z);
        const dz2 = Math.abs(box.max.z - (nextPos.z - playerRadius));

        const minOverlap = Math.min(dx1, dx2, dz1, dz2);
        if (minOverlap === dx1) nextPos.x = box.min.x - playerRadius;
        else if (minOverlap === dx2) nextPos.x = box.max.x + playerRadius;
        else if (minOverlap === dz1) nextPos.z = box.min.z - playerRadius;
        else if (minOverlap === dz2) nextPos.z = box.max.z + playerRadius;
        break;
      }
    }
  }

  private animateLimbs(dt: number, isMoving: boolean, isSprinting: boolean) {
    if (isMoving && this.isGrounded) {
      const animSpeed = isSprinting ? 18 : 10;
      this.walkCycle += dt * animSpeed;

      const swing = Math.sin(this.walkCycle) * (isSprinting ? 0.95 : 0.6);
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;

      // Torso tilt & vertical bob
      this.torso.position.y = 1.05 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
      this.head.position.y = 1.62 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;

      // Trigger footstep sound
      this.stepSoundTimer += dt * animSpeed;
      if (this.stepSoundTimer > Math.PI) {
        this.stepSoundTimer = 0;
        SoundFX.playFootstep();
      }
    } else {
      // Idle pose
      this.walkCycle = 0;
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, dt * 10);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, dt * 10);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, dt * 10);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, dt * 10);

      // Idle breathing
      const breath = Math.sin(Date.now() * 0.003) * 0.02;
      this.torso.position.y = 1.05 + breath;
      this.head.position.y = 1.62 + breath;
    }
  }

  public updateCameraFollow(dt: number) {
    const targetLookAt = this.position.clone().add(new THREE.Vector3(0, 1.4, 0));

    // Calculate camera position based on yaw, pitch & distance
    const cx = this.position.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const cy = this.position.y + 1.4 + Math.sin(this.cameraPitch) * this.cameraDistance;
    const cz = this.position.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    const desiredCamPos = new THREE.Vector3(cx, Math.max(0.4, cy), cz);
    this.camera.position.lerp(desiredCamPos, dt * 12);
    this.camera.lookAt(targetLookAt);
  }

  // Follow active vehicle smoothly
  public updateVehicleCamera(dt: number, carPos: THREE.Vector3, carYaw: number, speedKmH: number, isNitro: boolean) {
    // Dynamic FOV for speed sensation
    const targetFov = 65 + Math.min(22, (Math.abs(speedKmH) / 220) * 15 + (isNitro ? 8 : 0));
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 6);
    this.camera.updateProjectionMatrix();

    if (this.cameraMode === 'hood') {
      // Hood camera
      const forward = new THREE.Vector3(0, 0, 1.8).applyEuler(new THREE.Euler(0, carYaw, 0));
      this.camera.position.copy(carPos).add(forward).add(new THREE.Vector3(0, 1.1, 0));
      const lookTarget = carPos.clone().add(new THREE.Vector3(0, 0, 15).applyEuler(new THREE.Euler(0, carYaw, 0)));
      this.camera.lookAt(lookTarget);
      return;
    }

    // 3rd Person Vehicle Chase Camera
    // Trail smoothly behind car orientation with mouse pitch influence
    const dist = 7.5 + (Math.abs(speedKmH) / 220) * 2.5;
    const height = 2.8 + Math.sin(this.cameraPitch) * 2;

    const offset = new THREE.Vector3(0, height, -dist).applyEuler(new THREE.Euler(0, carYaw + this.cameraYaw * 0.35, 0));
    const desiredPos = carPos.clone().add(offset);

    this.camera.position.lerp(desiredPos, dt * 8);

    const lookAtTarget = carPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    this.camera.lookAt(lookAtTarget);
  }
}
