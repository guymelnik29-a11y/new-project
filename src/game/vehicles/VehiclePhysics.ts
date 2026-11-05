// Vehicle Physics & Driving Simulation for CITY LIFE
// Features realistic arcade dynamics: acceleration, braking, drifting, nitro, suspension roll & airplane flight

import * as THREE from 'three';
import { ControlState } from '../types';
import { VehicleParts } from './VehicleModel';
import { CollisionBox } from '../world/CityBuilder';
import { SoundFX } from '../audio/SoundFX';

export class VehiclePhysics {
  public vehicleParts: VehicleParts;
  public position: THREE.Vector3 = new THREE.Vector3();
  public rotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public speedKmH = 0;
  public steerAngle = 0;
  public driftSlip = 0;
  public nitroLevel = 100;
  public isNitroActive = false;
  public currentGear = 1;
  public rpm = 0.2;

  // Flight variables for airplane
  public altitude = 0;
  public pitch = 0;
  public roll = 0;

  // Vehicle configuration attributes
  public maxSpeed = 160; // km/h
  public accelerationRate = 22; // m/s^2
  public brakeRate = 35;
  public handlingFactor = 1.0;
  public engineUpgradeLevel = 1;

  private wheelSpin = 0;

  constructor(parts: VehicleParts, startPos: THREE.Vector3, startYaw = 0) {
    this.vehicleParts = parts;
    this.position.copy(startPos);
    this.rotation.y = startYaw;
    this.vehicleParts.root.position.copy(this.position);
    this.vehicleParts.root.rotation.copy(this.rotation);

    this.configureCategoryAttributes(parts.category);
  }

  public configureCategoryAttributes(category: string) {
    switch (category) {
      case 'supercar':
        this.maxSpeed = 285;
        this.accelerationRate = 36;
        this.brakeRate = 48;
        this.handlingFactor = 1.25;
        break;
      case 'muscle':
        this.maxSpeed = 205;
        this.accelerationRate = 30;
        this.brakeRate = 34;
        this.handlingFactor = 0.95;
        break;
      case 'sedan':
        this.maxSpeed = 215;
        this.accelerationRate = 26;
        this.brakeRate = 36;
        this.handlingFactor = 1.1;
        break;
      case 'suv':
        this.maxSpeed = 180;
        this.accelerationRate = 24;
        this.brakeRate = 32;
        this.handlingFactor = 0.9;
        break;
      case 'plane':
        this.maxSpeed = 340;
        this.accelerationRate = 32;
        this.brakeRate = 20;
        this.handlingFactor = 0.85;
        break;
      default: // compact starter
        this.maxSpeed = 145;
        this.accelerationRate = 20;
        this.brakeRate = 30;
        this.handlingFactor = 1.0;
        break;
    }
  }

  public setEngineLevel(lvl: number) {
    this.engineUpgradeLevel = lvl;
    this.maxSpeed *= 1 + (lvl - 1) * 0.12;
    this.accelerationRate *= 1 + (lvl - 1) * 0.15;
  }

  public update(dt: number, controls: ControlState, collisions: CollisionBox[]) {
    const isPlane = this.vehicleParts.category === 'plane';

    if (isPlane && this.speedKmH > 80 && (controls.forward || this.position.y > 2)) {
      this.updateAirplanePhysics(dt, controls, collisions);
    } else {
      this.updateGroundVehiclePhysics(dt, controls, collisions);
    }

    // Audio & Visual updates
    this.updateAudioAndVisuals(dt, controls);
  }

  private updateGroundVehiclePhysics(dt: number, controls: ControlState, collisions: CollisionBox[]) {
    // 1. Steering
    const targetSteer = (controls.left ? 1 : 0) - (controls.right ? 1 : 0);
    // Steering damping at higher speeds for high-speed stability
    const speedRatio = Math.min(1, Math.abs(this.speedKmH) / 180);
    const maxSteerRad = (0.55 - speedRatio * 0.28) * this.handlingFactor;

    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteer * maxSteerRad, dt * 10);

    // 2. Throttle & Nitro
    let effectiveMaxSpeed = this.maxSpeed;
    let throttleAccel = this.accelerationRate;

    this.isNitroActive = controls.nitro && this.nitroLevel > 2 && controls.forward;
    if (this.isNitroActive) {
      this.nitroLevel = Math.max(0, this.nitroLevel - dt * 25);
      effectiveMaxSpeed *= 1.25;
      throttleAccel *= 1.6;
    } else {
      this.nitroLevel = Math.min(100, this.nitroLevel + dt * 10); // recharge
    }

    const currentSpeed = this.velocity.length() * (this.velocity.dot(new THREE.Vector3(0, 0, 1).applyEuler(this.rotation)) >= 0 ? 1 : -1);
    const forwardDir = new THREE.Vector3(0, 0, 1).applyEuler(this.rotation);

    // Forward / Reverse / Brake
    if (controls.forward) {
      if (currentSpeed < effectiveMaxSpeed / 3.6) {
        this.velocity.addScaledVector(forwardDir, throttleAccel * dt);
      }
    } else if (controls.backward) {
      if (currentSpeed > 1) {
        // Braking while moving forward
        this.velocity.addScaledVector(forwardDir, -this.brakeRate * dt);
      } else {
        // Reverse
        if (currentSpeed > -40 / 3.6) {
          this.velocity.addScaledVector(forwardDir, -this.accelerationRate * 0.6 * dt);
        }
      }
    } else {
      // Natural rolling drag
      this.velocity.multiplyScalar(Math.pow(0.985, dt * 60));
    }

    // 3. Handbrake / Drifting
    const isHandbraking = controls.jumpOrBrake;
    const lateralDir = new THREE.Vector3(1, 0, 0).applyEuler(this.rotation);
    const lateralSpeed = this.velocity.dot(lateralDir);

    let gripFactor = 0.92;
    if (isHandbraking) {
      gripFactor = 0.985; // slide laterally
      this.driftSlip = Math.min(1.0, this.driftSlip + dt * 3);
      this.velocity.addScaledVector(forwardDir, -this.brakeRate * 0.8 * dt);
    } else {
      this.driftSlip = Math.max(0, this.driftSlip - dt * 4);
    }

    // Apply lateral grip friction
    this.velocity.addScaledVector(lateralDir, -lateralSpeed * (1 - gripFactor));

    // Turn vehicle based on forward speed and steering angle
    const linearSpeed = this.velocity.dot(forwardDir);
    const yawRate = (linearSpeed / 2.6) * Math.sin(this.steerAngle) * (isHandbraking ? 1.6 : 1.0);
    this.rotation.y += yawRate * dt;

    // Apply speed in forward direction with slight slip angle
    this.speedKmH = Math.round(linearSpeed * 3.6);

    // 4. Position Integration & Collisions
    const nextPos = this.position.clone().addScaledVector(this.velocity, dt);

    // Ground height (y = 0 default, or elevated bridge)
    if (nextPos.z > -55 && nextPos.z < -25 && nextPos.x > -230 && nextPos.x < 230) {
      nextPos.y = THREE.MathUtils.lerp(nextPos.y, 8.5, dt * 10);
    } else {
      nextPos.y = THREE.MathUtils.lerp(nextPos.y, 0, dt * 15);
    }

    // Resolve Collisions
    this.resolveCollisions(nextPos, collisions);

    this.position.copy(nextPos);
    this.vehicleParts.root.position.copy(this.position);
    this.vehicleParts.root.rotation.y = this.rotation.y;

    // Suspension Body Roll & Pitch
    const chassisRoll = -this.steerAngle * Math.min(1, Math.abs(linearSpeed) / 15) * 0.12;
    const chassisPitch = (controls.forward ? -0.04 : controls.backward ? 0.06 : 0);
    this.vehicleParts.bodyMesh.rotation.z = THREE.MathUtils.lerp(this.vehicleParts.bodyMesh.rotation.z, chassisRoll, dt * 12);
    this.vehicleParts.bodyMesh.rotation.x = THREE.MathUtils.lerp(this.vehicleParts.bodyMesh.rotation.x, chassisPitch, dt * 12);
  }

  private updateAirplanePhysics(dt: number, controls: ControlState, collisions: CollisionBox[]) {
    const forwardDir = new THREE.Vector3(0, 0, 1).applyEuler(this.rotation);

    if (controls.forward) {
      this.velocity.addScaledVector(forwardDir, this.accelerationRate * dt);
    }
    if (controls.backward) {
      this.velocity.multiplyScalar(0.98);
    }

    // Pitch control (W/S or Up/Down)
    if (controls.forward && this.position.y > 1) {
      this.rotation.x = THREE.MathUtils.lerp(this.rotation.x, 0.15, dt * 2);
    } else {
      this.rotation.x = THREE.MathUtils.lerp(this.rotation.x, 0, dt * 2);
    }

    // Yaw & Roll
    if (controls.left) {
      this.rotation.y += 1.2 * dt;
      this.rotation.z = THREE.MathUtils.lerp(this.rotation.z, 0.4, dt * 4);
    } else if (controls.right) {
      this.rotation.y -= 1.2 * dt;
      this.rotation.z = THREE.MathUtils.lerp(this.rotation.z, -0.4, dt * 4);
    } else {
      this.rotation.z = THREE.MathUtils.lerp(this.rotation.z, 0, dt * 4);
    }

    // Climb with speed
    const linearSpeed = this.velocity.length();
    this.speedKmH = Math.round(linearSpeed * 3.6);

    if (this.speedKmH > 100 && controls.jumpOrBrake) {
      // Climb
      this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, 14, dt * 3);
    } else if (this.position.y > 0.5) {
      this.velocity.y -= 9.8 * 0.4 * dt; // gravity
    } else {
      this.velocity.y = 0;
      this.position.y = 0;
    }

    const nextPos = this.position.clone().addScaledVector(this.velocity, dt);
    if (nextPos.y < 0) nextPos.y = 0;

    this.position.copy(nextPos);
    this.vehicleParts.root.position.copy(this.position);
    this.vehicleParts.root.rotation.copy(this.rotation);
  }

  private resolveCollisions(nextPos: THREE.Vector3, collisions: CollisionBox[]) {
    const carRadius = 1.4;
    for (const box of collisions) {
      if (box.type === 'water') continue;

      if (
        nextPos.x + carRadius > box.min.x &&
        nextPos.x - carRadius < box.max.x &&
        nextPos.z + carRadius > box.min.z &&
        nextPos.z - carRadius < box.max.z &&
        nextPos.y < box.max.y &&
        nextPos.y + 1.5 > box.min.y
      ) {
        // Push vehicle out along shortest axis
        const dx1 = Math.abs(nextPos.x + carRadius - box.min.x);
        const dx2 = Math.abs(box.max.x - (nextPos.x - carRadius));
        const dz1 = Math.abs(nextPos.z + carRadius - box.min.z);
        const dz2 = Math.abs(box.max.z - (nextPos.z - carRadius));

        const minOverlap = Math.min(dx1, dx2, dz1, dz2);
        if (minOverlap === dx1) nextPos.x = box.min.x - carRadius;
        else if (minOverlap === dx2) nextPos.x = box.max.x + carRadius;
        else if (minOverlap === dz1) nextPos.z = box.min.z - carRadius;
        else if (minOverlap === dz2) nextPos.z = box.max.z + carRadius;

        // Bounce back velocity
        this.velocity.multiplyScalar(-0.4);
        break;
      }
    }
  }

  private updateAudioAndVisuals(dt: number, controls: ControlState) {
    // Wheel spin
    const linearSpeed = this.velocity.length();
    this.wheelSpin += linearSpeed * dt * 2.5;

    this.vehicleParts.frontLeftWheel.rotation.x = this.wheelSpin;
    this.vehicleParts.frontRightWheel.rotation.x = this.wheelSpin;
    this.vehicleParts.rearLeftWheel.rotation.x = this.wheelSpin;
    this.vehicleParts.rearRightWheel.rotation.x = this.wheelSpin;

    // Front wheel steering rotation
    this.vehicleParts.frontLeftWheel.rotation.y = this.steerAngle;
    this.vehicleParts.frontRightWheel.rotation.y = this.steerAngle;

    // Brake Lights (glow bright red when braking or reversing)
    const isBraking = controls.backward || controls.jumpOrBrake;
    this.vehicleParts.brakeLightMaterial.color.setHex(isBraking ? 0xff0000 : 0x440000);

    // Nitro flame visibility
    this.vehicleParts.nitroFlames.forEach(flame => {
      (flame.material as THREE.MeshBasicMaterial).opacity = this.isNitroActive ? (0.7 + Math.random() * 0.3) : 0;
      if (this.isNitroActive) {
        flame.scale.set(1 + Math.random() * 0.3, 1 + Math.random() * 0.5, 1);
      }
    });

    // Horn
    if (controls.horn) {
      SoundFX.startHorn();
    } else {
      SoundFX.stopHorn();
    }

    // Engine Audio
    const throttle = (controls.forward ? 1 : 0) + (this.isNitroActive ? 0.5 : 0);
    SoundFX.updateEngine(this.speedKmH, throttle, this.maxSpeed);

    // Tire Screech
    SoundFX.updateTireScreech(this.driftSlip);

    // Calculate gear and RPM for UI
    const norm = Math.min(1, Math.abs(this.speedKmH) / this.maxSpeed);
    this.currentGear = Math.max(1, Math.min(6, Math.floor(norm * 5) + 1));
    this.rpm = 0.2 + (norm * 5 % 1) * 0.8;
  }
}
