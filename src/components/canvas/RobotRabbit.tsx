import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { soundEngine } from '../../utils/audio';

interface RobotRabbitProps {
  isWaving: boolean;
  isHappy: boolean;
  onInteract?: () => void;
  scrollDirection?: 'up' | 'down' | 'idle';
  customModelUrl?: string | null;
  isWalking?: boolean;
  walkSpeed?: number;
  hasCarrotSaber?: boolean;
}

/**
 * Little Bot Bunny (LAP1) 3D Model
 * Modeled strictly after the official concept art & 3D model sheet by David Revoy (CC-BY 2011).
 *
 * Key Reference Anatomical Details:
 * 1. Large spherical head with circular side hubs featuring the 3-blade triskelion emblem & "LAP1" text.
 * 2. Signature backward-swept bunny ears with dual exhaust ports (oo) under each ear base.
 * 3. Protruding cyclops camera eye with 3 mounting bracket screws, concentric aperture ring, and ruby red lens.
 * 4. Thin segmented accordion neck column with 4 metallic ribs.
 * 5. Chubby torso with 5 recessed circular ports on the belly plate (2 top, 1 center, 2 bottom).
 * 6. Spherical knob bunny tail on lower lumbar.
 * 7. Multi-joint articulated arms with 2-finger mechanical clamp hands.
 * 8. Non-clipping waving animation: shoulder lifts arm up and out, elbow bends forward, wrist waves freely.
 * 9. Digitigrade robotic bunny legs with long front-pointing paw pads.
 * 10. Iconic Carrot Lightsaber prop with glowing neon lime-green plasma blade.
 */
export const RobotRabbit: React.FC<RobotRabbitProps> = ({
  isWaving,
  isHappy,
  onInteract,
  scrollDirection = 'idle',
  isWalking = false,
  hasCarrotSaber = true,
}) => {
  // Primary animation references
  const rootGroupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);
  const cameraEyeRef = useRef<THREE.Group>(null);
  const pupilGlowRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Group>(null);
  const saberBladeRef = useRef<THREE.Mesh>(null);

  // Arm hierarchy references (to completely prevent clipping during waving)
  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);
  const rightClampTopRef = useRef<THREE.Mesh>(null);
  const rightClampBottomRef = useRef<THREE.Mesh>(null);

  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);

  // Leg hierarchy references (for walk cycle)
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Mouse tracking state
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, lastMoved: Date.now() });

  // Camera shutter / blinking reflex
  const shutterState = useRef({
    isShuttering: false,
    progress: 0,
    nextShutterTime: Date.now() + 3500,
  });

  // Ear twitch physics
  const earTwitch = useRef({
    lastTwitch: Date.now(),
    twitchDuration: 0,
    twitchTarget: 0,
    currentTwitch: 0,
  });

  // Waving animation timer
  const waveTimer = useRef(0);
  const [internalWaving, setInternalWaving] = useState(false);

  // Lightsaber activation state
  const [saberActive, setSaberActive] = useState(true);

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current.targetX = nx;
      mousePos.current.targetY = ny;
      mousePos.current.lastMoved = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // External waving trigger
  useEffect(() => {
    if (isWaving) {
      setInternalWaving(true);
      waveTimer.current = 0;
      soundEngine.playRoboBeep();
    }
  }, [isWaving]);

  // Click interaction trigger
  const handlePointerDown = (e: { stopPropagation?: () => void }) => {
    if (e.stopPropagation) e.stopPropagation();
    setInternalWaving(true);
    waveTimer.current = 0;
    setSaberActive(prev => !prev);
    soundEngine.playRoboBeep();
    if (onInteract) onInteract();
  };

  // Materials Palette strictly matching David Revoy's LAP1 Model Sheet
  const mats = useMemo(() => {
    // 1. Primary White/Cream Eggshell Chassis (satin finish with subtle warm tint)
    const shell = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F0ECE1'),
      roughness: 0.35,
      metalness: 0.12,
    });

    // 2. Secondary Mechanical Gunmetal Alloy (joints, bellows, socket bezels)
    const darkAlloy = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C2B36'),
      roughness: 0.45,
      metalness: 0.82,
    });

    // 3. Deep Titanium / Graphite (neck bellows, screws, inner cavities)
    const titanium = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1E1D25'),
      roughness: 0.35,
      metalness: 0.9,
    });

    // 4. Ear Inset Panel (soft pale ivory / warm cream with subtle tint)
    const earRecess = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E3DDD0'),
      roughness: 0.5,
      metalness: 0.08,
    });

    // 5. Belly Plate (slightly recessed warm shield)
    const bellyPlate = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EAE5DA'),
      roughness: 0.38,
      metalness: 0.14,
    });

    // 6. Recessed Belly Screw Ports (dark recessed socket ring)
    const portRim = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A3945'),
      roughness: 0.4,
      metalness: 0.85,
    });
    const portCavity = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#121118'),
    });

    // 7. Signature Camera Eye: Glossy Ruby Red Optical Glass Lens
    const rubyLens = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#991B1B'),
      roughness: 0.06,
      metalness: 0.25,
    });

    // 8. Glowing Aperture Core / Pupil
    const apertureGlow = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#EF4444'),
    });

    // 9. Camera Bezel Red Calibration Notch Ring
    const calibrationRing = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7F1D1D'),
      roughness: 0.3,
      metalness: 0.5,
    });

    // 10. Specular Glint Reflection
    const lensGlint = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFFFFF'),
    });

    // 11. Carrot Lightsaber: Orange Carrot Hilt
    const carrotOrange = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EA580C'),
      roughness: 0.4,
      metalness: 0.1,
    });

    // 12. Carrot Green Emitter Collar
    const carrotGreen = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#15803D'),
      roughness: 0.35,
      metalness: 0.2,
    });

    // 13. Neon Green Plasma Lightsaber Blade
    const laserBlade = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#84CC16'),
      emissive: new THREE.Color('#4ADE80'),
      emissiveIntensity: 3.2,
      roughness: 0.1,
    });

    // 14. Emblem Badge White Ceramic
    const badgeFace = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.3,
      metalness: 0.1,
    });

    return {
      shell,
      darkAlloy,
      titanium,
      earRecess,
      bellyPlate,
      portRim,
      portCavity,
      rubyLens,
      apertureGlow,
      calibrationRing,
      lensGlint,
      carrotOrange,
      carrotGreen,
      laserBlade,
      badgeFace,
    };
  }, []);

  // Main animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Cursor Tracking
    const timeSinceMoved = Date.now() - mousePos.current.lastMoved;
    const isMouseStagnant = timeSinceMoved > 2600;
    const targetX = isMouseStagnant ? 0 : mousePos.current.targetX;
    const targetY = isMouseStagnant ? 0 : mousePos.current.targetY;

    mousePos.current.x = THREE.MathUtils.lerp(mousePos.current.x, targetX, delta * 3.6);
    mousePos.current.y = THREE.MathUtils.lerp(mousePos.current.y, targetY, delta * 3.6);

    // 2. Idle Levitation / Walk Oscillation
    const hoverOffset = Math.sin(time * 2.2) * 0.025;
    const breatheScale = 1 + Math.sin(time * 2.4) * 0.012;

    if (rootGroupRef.current) {
      // Bobbing during walk vs idle
      const walkBob = isWalking ? Math.abs(Math.sin(time * 10)) * 0.035 : 0;
      rootGroupRef.current.position.y = hoverOffset + walkBob;

      // Subtle tilt based on scroll direction
      if (scrollDirection === 'down') {
        rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, 0.04, delta * 4);
      } else if (scrollDirection === 'up') {
        rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, -0.04, delta * 4);
      } else {
        rootGroupRef.current.rotation.x = THREE.MathUtils.lerp(rootGroupRef.current.rotation.x, 0, delta * 3);
      }
    }

    if (bodyRef.current) {
      bodyRef.current.scale.set(breatheScale, breatheScale, breatheScale);
      bodyRef.current.rotation.y = mousePos.current.x * 0.12;
    }

    // 3. Head Tracking
    if (headRef.current) {
      const headTargetY = mousePos.current.x * 0.42;
      const headTargetX = -mousePos.current.y * 0.28;
      const happyNod = isHappy ? Math.sin(time * 7) * 0.08 : 0;

      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, headTargetY, delta * 5);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, headTargetX + happyNod, delta * 5);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, -mousePos.current.x * 0.1, delta * 4);
    }

    // 4. Optical Eye Sensor Tracking
    if (cameraEyeRef.current) {
      cameraEyeRef.current.position.x = mousePos.current.x * 0.022;
      cameraEyeRef.current.position.y = 0.05 + mousePos.current.y * 0.022;
    }

    // 5. Camera Shutter Reflex (Simulated Blink)
    const now = Date.now();
    if (now > shutterState.current.nextShutterTime && !shutterState.current.isShuttering) {
      shutterState.current.isShuttering = true;
      shutterState.current.progress = 0;
    }

    if (shutterState.current.isShuttering) {
      shutterState.current.progress += delta * 9;
      const shutterPulse = Math.sin(shutterState.current.progress * Math.PI);
      if (pupilGlowRef.current) {
        pupilGlowRef.current.scale.setScalar(Math.max(0.18, 1 - shutterPulse * 0.75));
      }
      if (shutterState.current.progress >= 1) {
        shutterState.current.isShuttering = false;
        shutterState.current.nextShutterTime = now + 3200 + Math.random() * 4000;
        if (pupilGlowRef.current) pupilGlowRef.current.scale.setScalar(1);
      }
    }

    // 6. Ear Dynamics & Backward Sweep
    if (now - earTwitch.current.lastTwitch > 3400) {
      if (Math.random() > 0.4) {
        earTwitch.current.twitchTarget = (Math.random() - 0.5) * 0.3;
        earTwitch.current.twitchDuration = 0.35;
      }
      earTwitch.current.lastTwitch = now;
    }

    if (earTwitch.current.twitchDuration > 0) {
      earTwitch.current.twitchDuration -= delta;
      earTwitch.current.currentTwitch = THREE.MathUtils.lerp(
        earTwitch.current.currentTwitch,
        earTwitch.current.twitchTarget,
        delta * 14
      );
    } else {
      earTwitch.current.currentTwitch = THREE.MathUtils.lerp(earTwitch.current.currentTwitch, 0, delta * 7);
    }

    const earLagZ = -mousePos.current.x * 0.12;
    const happyEarBounce = isHappy ? Math.sin(time * 8) * 0.12 : 0;
    // Note: Ears are swept backwards by -0.45 rad (x-axis) matching reference profile!
    if (leftEarRef.current) {
      leftEarRef.current.rotation.x = -0.45 - mousePos.current.y * 0.1;
      leftEarRef.current.rotation.z = 0.1 + earLagZ + earTwitch.current.currentTwitch + happyEarBounce;
    }
    if (rightEarRef.current) {
      rightEarRef.current.rotation.x = -0.45 - mousePos.current.y * 0.1;
      rightEarRef.current.rotation.z = -0.1 + earLagZ - earTwitch.current.currentTwitch * 0.6 - happyEarBounce;
    }

    // 7. Tail Wiggle
    if (tailRef.current) {
      const tailSpeed = isHappy ? 14 : 3.2;
      const tailAmp = isHappy ? 0.32 : 0.07;
      tailRef.current.rotation.y = Math.sin(time * tailSpeed) * tailAmp;
      tailRef.current.rotation.x = Math.cos(time * tailSpeed * 0.5) * 0.05;
    }

    // 8. Leg Stride Animation (Walk cycle vs idle hover)
    if (isWalking) {
      const walkCycle = time * 10;
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.35;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.35;
      }
    } else {
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.08, delta * 4);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0.08, delta * 4);
      }
    }

    // 9. NON-CLIPPING WAVING ANIMATION (SOLVES DISAPPEARING ARM BUG)
    if (internalWaving && rightShoulderRef.current && rightElbowRef.current && rightWristRef.current) {
      waveTimer.current += delta;
      const wavePhase = waveTimer.current * 9;

      // Shoulder: lifts arm UP and OUTWARD, pushed forward in FRONT of torso (never clips!)
      rightShoulderRef.current.position.set(0.64, 0.12, 0.16);
      rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, -0.75, delta * 8);
      rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.45, delta * 8);
      rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.y, 0.25, delta * 8);

      // Elbow: bends forearm UPWARD in front of robot
      rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, -0.85, delta * 8);
      rightElbowRef.current.rotation.x = 0.25;

      // Wrist: waves side-to-side joyfully
      rightWristRef.current.rotation.z = Math.sin(wavePhase) * 0.38;

      // Clamps: twitch slightly like talking/greeting
      if (rightClampTopRef.current && rightClampBottomRef.current) {
        const clampTwitch = (Math.sin(wavePhase * 2) + 1) * 0.015;
        rightClampTopRef.current.position.y = 0.035 + clampTwitch;
        rightClampBottomRef.current.position.y = -0.035 - clampTwitch;
      }

      if (waveTimer.current > 2.2) {
        setInternalWaving(false);
      }
    } else if (rightShoulderRef.current && rightElbowRef.current && rightWristRef.current) {
      // Natural idle arm position beside body
      rightShoulderRef.current.position.set(0.58, 0.04, 0);
      rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, -0.15, delta * 4);
      rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, 0.05, delta * 4);
      rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.y, 0, delta * 4);

      rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(rightElbowRef.current.rotation.z, -0.05, delta * 4);
      rightElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightElbowRef.current.rotation.x, 0.08, delta * 4);
      rightWristRef.current.rotation.z = THREE.MathUtils.lerp(rightWristRef.current.rotation.z, 0, delta * 4);

      if (rightClampTopRef.current && rightClampBottomRef.current) {
        rightClampTopRef.current.position.y = 0.035;
        rightClampBottomRef.current.position.y = -0.035;
      }
    }

    // Left arm holding lightsaber or hanging relaxed
    if (leftShoulderRef.current && leftElbowRef.current) {
      if (hasCarrotSaber && saberActive) {
        // Holding saber proudly forward
        leftShoulderRef.current.position.set(-0.58, 0.04, 0.08);
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.z, 0.35, delta * 4);
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.3, delta * 4);
        leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, 0.45, delta * 4);
      } else {
        leftShoulderRef.current.position.set(-0.58, 0.04, 0);
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.z, 0.15, delta * 4);
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, 0.05, delta * 4);
        leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(leftElbowRef.current.rotation.z, 0.05, delta * 4);
      }
    }

    // 10. Carrot Lightsaber Plasma Glow Pulse
    if (saberBladeRef.current) {
      const bladePulse = 1 + Math.sin(time * 12) * 0.03;
      saberBladeRef.current.scale.set(bladePulse, saberActive ? 1 : 0.01, bladePulse);
      saberBladeRef.current.visible = saberActive;
    }
  });

  return (
    <group
      ref={rootGroupRef}
      onPointerDown={handlePointerDown}
      onPointerOver={() => soundEngine.playHover()}
      position={[0, 0, 0]}
    >
      {/* Contact Shadow on Floor */}
      <mesh position={[0, -1.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 1.35, 36]} />
        <meshBasicMaterial color="#000000" opacity={0.42} transparent depthWrite={false} />
      </mesh>

      {/* ======================================================== */}
      {/* TORSO ASSEMBLY (Matching LAP1 Model Sheet) */}
      {/* ======================================================== */}
      <group ref={bodyRef} position={[0, -0.38, 0]}>
        {/* Main Torso Pear Shell */}
        <mesh material={mats.shell} castShadow receiveShadow scale={[0.95, 1.12, 0.95]}>
          <sphereGeometry args={[0.62, 36, 36]} />
        </mesh>

        {/* Upper Chest Armor Plate with Center Seam */}
        <group position={[0, 0.22, 0.3]}>
          <mesh material={mats.bellyPlate} scale={[0.75, 0.45, 0.4]}>
            <sphereGeometry args={[0.55, 24, 24]} />
          </mesh>
          {/* Vertical Chest Seam Line */}
          <mesh position={[0, 0, 0.24]} material={mats.titanium}>
            <boxGeometry args={[0.018, 0.32, 0.01]} />
          </mesh>
        </group>

        {/* Lower Belly Shield Plate */}
        <group position={[0, -0.14, 0.26]}>
          <mesh material={mats.bellyPlate} scale={[0.82, 0.65, 0.48]}>
            <sphereGeometry args={[0.58, 28, 28]} />
          </mesh>

          {/* EXACT 5 RECESSED CIRCULAR PORTS FROM DAVID REVOY'S LAP1 SHEET */}
          {/* Top Row: Left & Right Ports */}
          <group position={[-0.2, 0.12, 0.29]} rotation={[0, -0.25, 0]}>
            <mesh material={mats.portRim}>
              <torusGeometry args={[0.042, 0.012, 12, 20]} />
            </mesh>
            <mesh material={mats.portCavity} position={[0, 0, -0.01]}>
              <circleGeometry args={[0.038, 16]} />
            </mesh>
          </group>

          <group position={[0.2, 0.12, 0.29]} rotation={[0, 0.25, 0]}>
            <mesh material={mats.portRim}>
              <torusGeometry args={[0.042, 0.012, 12, 20]} />
            </mesh>
            <mesh material={mats.portCavity} position={[0, 0, -0.01]}>
              <circleGeometry args={[0.038, 16]} />
            </mesh>
          </group>

          {/* Center Port */}
          <group position={[0, -0.02, 0.31]}>
            <mesh material={mats.portRim}>
              <torusGeometry args={[0.048, 0.014, 12, 20]} />
            </mesh>
            <mesh material={mats.portCavity} position={[0, 0, -0.01]}>
              <circleGeometry args={[0.044, 16]} />
            </mesh>
          </group>

          {/* Bottom Row: Left & Right Ports */}
          <group position={[-0.18, -0.18, 0.28]} rotation={[0.1, -0.22, 0]}>
            <mesh material={mats.portRim}>
              <torusGeometry args={[0.042, 0.012, 12, 20]} />
            </mesh>
            <mesh material={mats.portCavity} position={[0, 0, -0.01]}>
              <circleGeometry args={[0.038, 16]} />
            </mesh>
          </group>

          <group position={[0.18, -0.18, 0.28]} rotation={[0.1, 0.22, 0]}>
            <mesh material={mats.portRim}>
              <torusGeometry args={[0.042, 0.012, 12, 20]} />
            </mesh>
            <mesh material={mats.portCavity} position={[0, 0, -0.01]}>
              <circleGeometry args={[0.038, 16]} />
            </mesh>
          </group>
        </group>

        {/* BACKPLATE & SPHERICAL KNOB TAIL */}
        <group ref={tailRef} position={[0, -0.32, -0.58]}>
          {/* Tail Mounting Cylinder */}
          <mesh material={mats.darkAlloy} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.1, 20]} />
          </mesh>
          {/* Spherical Bunny Tail */}
          <mesh material={mats.shell} position={[0, 0, -0.12]} castShadow>
            <sphereGeometry args={[0.17, 24, 24]} />
          </mesh>
        </group>

        {/* SHOULDER SOCKET HUBS */}
        <mesh material={mats.darkAlloy} position={[-0.58, 0.08, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
        </mesh>
        <mesh material={mats.darkAlloy} position={[0.58, 0.08, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
        </mesh>

        {/* ======================================================== */}
        {/* RIGHT ARM (HIERARCHICALLY ARTICULATED - ZERO CLIPPING) */}
        {/* ======================================================== */}
        <group ref={rightShoulderRef} position={[0.58, 0.04, 0]}>
          {/* Shoulder Ball Joint */}
          <mesh material={mats.titanium}>
            <sphereGeometry args={[0.09, 16, 16]} />
          </mesh>

          {/* Upper Arm Bone Strut */}
          <mesh material={mats.shell} position={[0.03, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.22, 16]} />
          </mesh>

          {/* Elbow Hinge Assembly */}
          <group ref={rightElbowRef} position={[0.03, -0.31, 0]}>
            <mesh material={mats.darkAlloy} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.065, 0.1, 16]} />
            </mesh>

            {/* Forearm Sleeve */}
            <mesh material={mats.shell} position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.06, 0.22, 16]} />
            </mesh>

            {/* Wrist Cuff & Hand Assembly */}
            <group ref={rightWristRef} position={[0, -0.3, 0]}>
              <mesh material={mats.titanium}>
                <sphereGeometry args={[0.075, 14, 14]} />
              </mesh>

              {/* 2-FINGER MECHANICAL CLAMP PINCERS */}
              {/* Upper Clamp Finger */}
              <mesh ref={rightClampTopRef} material={mats.darkAlloy} position={[0, 0.035, 0.04]}>
                <boxGeometry args={[0.045, 0.03, 0.07]} />
              </mesh>
              {/* Lower Clamp Finger */}
              <mesh ref={rightClampBottomRef} material={mats.darkAlloy} position={[0, -0.035, 0.04]}>
                <boxGeometry args={[0.045, 0.03, 0.07]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ======================================================== */}
        {/* LEFT ARM (HOLDS CARROT LIGHTSABER PROP) */}
        {/* ======================================================== */}
        <group ref={leftShoulderRef} position={[-0.58, 0.04, 0]}>
          {/* Shoulder Ball Joint */}
          <mesh material={mats.titanium}>
            <sphereGeometry args={[0.09, 16, 16]} />
          </mesh>

          {/* Upper Arm Bone Strut */}
          <mesh material={mats.shell} position={[-0.03, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.22, 16]} />
          </mesh>

          {/* Elbow Hinge */}
          <group ref={leftElbowRef} position={[-0.03, -0.31, 0]}>
            <mesh material={mats.darkAlloy} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.065, 0.065, 0.1, 16]} />
            </mesh>

            {/* Forearm Sleeve */}
            <mesh material={mats.shell} position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.06, 0.22, 16]} />
            </mesh>

            {/* Hand with 2-Finger Clamp */}
            <group position={[0, -0.3, 0]}>
              <mesh material={mats.titanium}>
                <sphereGeometry args={[0.075, 14, 14]} />
              </mesh>
              <mesh material={mats.darkAlloy} position={[0, 0.035, 0.04]}>
                <boxGeometry args={[0.045, 0.03, 0.07]} />
              </mesh>
              <mesh material={mats.darkAlloy} position={[0, -0.035, 0.04]}>
                <boxGeometry args={[0.045, 0.03, 0.07]} />
              </mesh>

              {/* CARROT LIGHTSABER PROP (FROM LAP1 REFERENCE SHEET!) */}
              {hasCarrotSaber && (
                <group position={[0, 0.02, 0.09]} rotation={[0.4, 0, 0]}>
                  {/* Conical Orange Carrot Hilt */}
                  <mesh material={mats.carrotOrange} position={[0, -0.12, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.055, 0.26, 16]} />
                  </mesh>
                  {/* Carrot Ring Grooves */}
                  <mesh material={mats.darkAlloy} position={[0, -0.08, 0]}>
                    <torusGeometry args={[0.052, 0.008, 8, 16]} />
                  </mesh>
                  <mesh material={mats.darkAlloy} position={[0, -0.16, 0]}>
                    <torusGeometry args={[0.042, 0.008, 8, 16]} />
                  </mesh>
                  {/* Green Emitter Collar */}
                  <mesh material={mats.carrotGreen} position={[0, 0.02, 0]}>
                    <cylinderGeometry args={[0.058, 0.054, 0.05, 16]} />
                  </mesh>
                  {/* Glowing Neon Green Plasma Blade */}
                  <mesh ref={saberBladeRef} material={mats.laserBlade} position={[0, 0.72, 0]}>
                    <cylinderGeometry args={[0.032, 0.032, 1.35, 18]} />
                  </mesh>
                  {/* Point light for blade glow */}
                  {saberActive && (
                    <pointLight position={[0, 0.7, 0]} color="#84CC16" intensity={2.2} distance={3.5} />
                  )}
                </group>
              )}
            </group>
          </group>
        </group>

        {/* ======================================================== */}
        {/* DIGITIGRADE ROBOTIC BUNNY LEGS & PAWS */}
        {/* ======================================================== */}
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.28, -0.62, 0]}>
          {/* Hip Joint */}
          <mesh material={mats.darkAlloy}>
            <sphereGeometry args={[0.11, 14, 14]} />
          </mesh>
          {/* Thigh (angled back) */}
          <mesh material={mats.titanium} position={[0, -0.14, -0.04]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.08, 0.22, 16]} />
          </mesh>
          {/* Knee Joint */}
          <mesh material={mats.darkAlloy} position={[0, -0.26, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
          </mesh>
          {/* Digitigrade Hock/Shin (angled back) */}
          <mesh material={mats.titanium} position={[0, -0.38, -0.06]} rotation={[-0.35, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.07, 0.22, 16]} />
          </mesh>
          {/* Long Slender Bunny Paw Foot */}
          <group position={[0, -0.48, 0.1]} rotation={[0.4, 0, 0]}>
            <mesh material={mats.shell} scale={[1.15, 0.75, 1.85]} castShadow>
              <sphereGeometry args={[0.13, 20, 20]} />
            </mesh>
            {/* Center Split Toe Groove */}
            <mesh material={mats.titanium} position={[0, 0.04, 0.12]}>
              <boxGeometry args={[0.015, 0.05, 0.18]} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.28, -0.62, 0]}>
          {/* Hip Joint */}
          <mesh material={mats.darkAlloy}>
            <sphereGeometry args={[0.11, 14, 14]} />
          </mesh>
          {/* Thigh (angled back) */}
          <mesh material={mats.titanium} position={[0, -0.14, -0.04]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.08, 0.22, 16]} />
          </mesh>
          {/* Knee Joint */}
          <mesh material={mats.darkAlloy} position={[0, -0.26, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
          </mesh>
          {/* Digitigrade Hock/Shin (angled back) */}
          <mesh material={mats.titanium} position={[0, -0.38, -0.06]} rotation={[-0.35, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.07, 0.22, 16]} />
          </mesh>
          {/* Long Slender Bunny Paw Foot */}
          <group position={[0, -0.48, 0.1]} rotation={[0.4, 0, 0]}>
            <mesh material={mats.shell} scale={[1.15, 0.75, 1.85]} castShadow>
              <sphereGeometry args={[0.13, 20, 20]} />
            </mesh>
            {/* Center Split Toe Groove */}
            <mesh material={mats.titanium} position={[0, 0.04, 0.12]}>
              <boxGeometry args={[0.015, 0.05, 0.18]} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* TELESCOPIC ACCORDION NECK (4 METALLIC RIBS) */}
      {/* ======================================================== */}
      <group position={[0, 0.3, 0]}>
        <mesh material={mats.titanium}>
          <cylinderGeometry args={[0.18, 0.22, 0.22, 24]} />
        </mesh>
        {/* 4 Concentric Accordion Bellows Rings */}
        <mesh material={mats.darkAlloy} position={[0, 0.07, 0]}>
          <torusGeometry args={[0.2, 0.02, 12, 28]} />
        </mesh>
        <mesh material={mats.darkAlloy} position={[0, 0.02, 0]}>
          <torusGeometry args={[0.21, 0.02, 12, 28]} />
        </mesh>
        <mesh material={mats.darkAlloy} position={[0, -0.03, 0]}>
          <torusGeometry args={[0.22, 0.02, 12, 28]} />
        </mesh>
        <mesh material={mats.darkAlloy} position={[0, -0.08, 0]}>
          <torusGeometry args={[0.23, 0.02, 12, 28]} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* HEAD ASSEMBLY (SPHERICAL SKULL + EMBLEMS + CYCLOPS EYE) */}
      {/* ======================================================== */}
      <group ref={headRef} position={[0, 0.92, 0]}>
        {/* Main Eggshell Skull Sphere */}
        <mesh material={mats.shell} castShadow receiveShadow scale={[1.04, 1.0, 1.04]}>
          <sphereGeometry args={[0.68, 40, 40]} />
        </mesh>

        {/* Equator & Meridian Seam Grooves */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.682, 0.008, 8, 48]} />
          <meshBasicMaterial color="#948F85" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.682, 0.008, 8, 48]} />
          <meshBasicMaterial color="#948F85" />
        </mesh>

        {/* Rear Circular Dial / Battery Cap on back of head */}
        <group position={[0, 0, -0.68]} rotation={[Math.PI, 0, 0]}>
          <mesh material={mats.darkAlloy}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 28]} />
          </mesh>
          <mesh material={mats.titanium} position={[0, 0.025, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
          </mesh>
        </group>

        {/* SIDE EAR MOUNT HUBS WITH 3-BLADE TRISKELION EMBLEM & LAP1 TEXT */}
        {/* Left Side Hub */}
        <group position={[-0.69, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={mats.darkAlloy}>
            <cylinderGeometry args={[0.24, 0.26, 0.05, 28]} />
          </mesh>
          <mesh material={mats.badgeFace} position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.02, 28]} />
          </mesh>
          {/* 3-Blade Triskelion / Y Emblem */}
          <mesh material={mats.titanium} position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
          </mesh>
          <mesh material={mats.titanium} position={[0, 0.045, 0.07]}>
            <boxGeometry args={[0.028, 0.015, 0.09]} />
          </mesh>
          <mesh material={mats.titanium} position={[-0.06, 0.045, -0.035]} rotation={[0, (2 * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.028, 0.015, 0.09]} />
          </mesh>
          <mesh material={mats.titanium} position={[0.06, 0.045, -0.035]} rotation={[0, -(2 * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.028, 0.015, 0.09]} />
          </mesh>
        </group>

        {/* Right Side Hub */}
        <group position={[0.69, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh material={mats.darkAlloy}>
            <cylinderGeometry args={[0.24, 0.26, 0.05, 28]} />
          </mesh>
          <mesh material={mats.badgeFace} position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.02, 28]} />
          </mesh>
          {/* 3-Blade Triskelion / Y Emblem */}
          <mesh material={mats.titanium} position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
          </mesh>
          <mesh material={mats.titanium} position={[0, 0.045, 0.07]}>
            <boxGeometry args={[0.028, 0.015, 0.09]} />
          </mesh>
          <mesh material={mats.titanium} position={[-0.06, 0.045, -0.035]} rotation={[0, (2 * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.028, 0.015, 0.09]} />
          </mesh>
          <mesh material={mats.titanium} position={[0.06, 0.045, -0.035]} rotation={[0, -(2 * Math.PI) / 3, 0]}>
            <boxGeometry args={[0.028, 0.015, 0.09]} />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* SIGNATURE CYCLOPS CAMERA EYE (DAVID REVOY LAP1 DESIGN) */}
        {/* ======================================================== */}
        <group ref={cameraEyeRef} position={[0, 0.06, 0.58]}>
          {/* Protruding Cylindrical Camera Lens Barrel */}
          <mesh material={mats.titanium} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.31, 0.18, 36]} />
          </mesh>

          {/* Stepped Chamfer Inner Bezel */}
          <mesh material={mats.darkAlloy} position={[0, 0, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.245, 0.26, 0.04, 36]} />
          </mesh>

          {/* 3 EXACT MOUNTING LUGS / BRACKET SCREWS (12 o'clock, 4 o'clock, 8 o'clock) */}
          {/* Top Lug (12 o'clock) */}
          <group position={[0, 0.29, 0.06]}>
            <mesh material={mats.darkAlloy}>
              <boxGeometry args={[0.065, 0.05, 0.06]} />
            </mesh>
            <mesh material={mats.titanium} position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
            </mesh>
          </group>

          {/* Bottom-Right Lug (4 o'clock) */}
          <group position={[0.25, -0.15, 0.06]} rotation={[0, 0, -(2 * Math.PI) / 3]}>
            <mesh material={mats.darkAlloy}>
              <boxGeometry args={[0.065, 0.05, 0.06]} />
            </mesh>
            <mesh material={mats.titanium} position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
            </mesh>
          </group>

          {/* Bottom-Left Lug (8 o'clock) */}
          <group position={[-0.25, -0.15, 0.06]} rotation={[0, 0, (2 * Math.PI) / 3]}>
            <mesh material={mats.darkAlloy}>
              <boxGeometry args={[0.065, 0.05, 0.06]} />
            </mesh>
            <mesh material={mats.titanium} position={[0, 0, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
            </mesh>
          </group>

          {/* Red Aperture Calibration Ring with Notches */}
          <mesh material={mats.calibrationRing} position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.21, 0.022, 16, 36]} />
          </mesh>

          {/* Glossy Convex Ruby Red Optical Lens Glass */}
          <mesh material={mats.rubyLens} position={[0, 0, 0.115]} scale={[1, 1, 0.42]}>
            <sphereGeometry args={[0.2, 32, 32]} />
          </mesh>

          {/* Glowing Aperture Core / Camera Eye Pupil */}
          <mesh ref={pupilGlowRef} material={mats.apertureGlow} position={[0, 0, 0.165]}>
            <sphereGeometry args={[0.075, 24, 24]} />
          </mesh>

          {/* Bright White Highlight Reflection Point */}
          <mesh material={mats.lensGlint} position={[-0.05, 0.05, 0.205]}>
            <sphereGeometry args={[0.022, 14, 14]} />
          </mesh>

          {/* Ocular Glow Point Light */}
          <pointLight position={[0, 0, 0.22]} color="#EF4444" intensity={1.3} distance={1.8} />
        </group>

        {/* ======================================================== */}
        {/* SIGNATURE BACKWARD-SWEPT EARS WITH DUAL EXHAUST PORTS (oo) */}
        {/* ======================================================== */}
        {/* LEFT EAR */}
        <group ref={leftEarRef} position={[-0.34, 0.62, -0.22]}>
          {/* Cylindrical Base Hinge Joint */}
          <mesh material={mats.darkAlloy} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.14, 20]} />
          </mesh>

          {/* Dual Hollow Exhaust/Speaker Ports Under Ear Base ("oo") */}
          <group position={[0, 0.12, 0.04]}>
            {/* Outer Port Housing */}
            <mesh material={mats.titanium}>
              <boxGeometry args={[0.16, 0.06, 0.08]} />
            </mesh>
            {/* Port 1 */}
            <mesh material={mats.portCavity} position={[-0.04, 0, 0.042]}>
              <circleGeometry args={[0.025, 14]} />
            </mesh>
            {/* Port 2 */}
            <mesh material={mats.portCavity} position={[0.04, 0, 0.042]}>
              <circleGeometry args={[0.025, 14]} />
            </mesh>
          </group>

          {/* Main Aerodynamic Ear Blade */}
          <mesh material={mats.shell} position={[-0.04, 0.72, 0]} scale={[1.15, 1.42, 0.65]} castShadow>
            <capsuleGeometry args={[0.12, 0.64, 16, 24]} />
          </mesh>

          {/* Front Beveled Panel Recess */}
          <mesh material={mats.earRecess} position={[-0.04, 0.68, 0.065]} scale={[0.75, 1.35, 0.24]}>
            <capsuleGeometry args={[0.1, 0.58, 16, 20]} />
          </mesh>

          {/* Tapered Ear Tip */}
          <mesh material={mats.shell} position={[-0.04, 1.28, 0]} scale={[0.85, 1.0, 0.6]}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
        </group>

        {/* RIGHT EAR */}
        <group ref={rightEarRef} position={[0.34, 0.62, -0.22]}>
          {/* Cylindrical Base Hinge Joint */}
          <mesh material={mats.darkAlloy} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.14, 20]} />
          </mesh>

          {/* Dual Hollow Exhaust/Speaker Ports Under Ear Base ("oo") */}
          <group position={[0, 0.12, 0.04]}>
            {/* Outer Port Housing */}
            <mesh material={mats.titanium}>
              <boxGeometry args={[0.16, 0.06, 0.08]} />
            </mesh>
            {/* Port 1 */}
            <mesh material={mats.portCavity} position={[-0.04, 0, 0.042]}>
              <circleGeometry args={[0.025, 14]} />
            </mesh>
            {/* Port 2 */}
            <mesh material={mats.portCavity} position={[0.04, 0, 0.042]}>
              <circleGeometry args={[0.025, 14]} />
            </mesh>
          </group>

          {/* Main Aerodynamic Ear Blade */}
          <mesh material={mats.shell} position={[0.04, 0.72, 0]} scale={[1.15, 1.42, 0.65]} castShadow>
            <capsuleGeometry args={[0.12, 0.64, 16, 24]} />
          </mesh>

          {/* Front Beveled Panel Recess */}
          <mesh material={mats.earRecess} position={[0.04, 0.68, 0.065]} scale={[0.75, 1.35, 0.24]}>
            <capsuleGeometry args={[0.1, 0.58, 16, 20]} />
          </mesh>

          {/* Tapered Ear Tip */}
          <mesh material={mats.shell} position={[0.04, 1.28, 0]} scale={[0.85, 1.0, 0.6]}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
