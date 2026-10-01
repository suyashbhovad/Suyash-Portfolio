import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  Suspense,
  useCallback,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SectionId } from '../../types';

/* ---------------------------------------------------------------------------
 * poly_robot.glb — what is actually inside the file
 * ---------------------------------------------------------------------------
 * Hierarchy (relevant nodes):
 *   Robot Origin              rotation -90deg on X, scale 100
 *     Robot                   (3 meshes: White_Glossy / Blue_Light / Black_Matt)
 *     Mouth                   -> Mouth_Blue_Light_0
 *     Wave, Wave.001..003     hover / thruster rings (NOT the arms)
 *     Ears                    -> Ears_Black_Matt_0
 *     Empty                   -> Eyes -> Eyes_Blue_Light_0   (flat face panel)
 *     Hand origin             -> right arm pivot  (world +X)
 *     Hand origin.002         -> left arm pivot   (world -X)
 *
 * One clip: "Scene", 10s, LINEAR. It animates:
 *   Mouth.scale, Eyes.scale + Eyes.rotation, Empty.rotation, Ears.rotation,
 *   Hand origin.rotation, Hand origin.002.rotation, Robot Origin.translation,
 *   Wave*.translation + scale
 *
 * Two consequences the old file got wrong:
 *
 * 1) The mixer writes ABSOLUTE values to those nodes every frame, so any
 *    `node.rotation.x = ...` / `node.scale.y = ...` written in useFrame was
 *    silently erased. Fix: every node we drive gets a control wrapper group
 *    ("<name>__ctrl") inserted above it. The mixer never touches the wrapper,
 *    so our motion multiplies with the baked animation instead of fighting it.
 *
 * 2) "Robot Origin" is rotated -90deg about X (FBX Z-up import). Inside it:
 *        local +X = world right
 *        local +Y = world BACK      (not up)
 *        local +Z = world UP        (this is the important one)
 *    So eye squint / mouth open is `scale.z`, ear tilt and arm swing are
 *    `rotation.y`, and gaze yaw is `rotation.z`. The old code used .y/.x,
 *    which is why nothing visibly moved.
 *
 * The clip contains no wave, so the wave below is procedural on the arm pivots.
 * ------------------------------------------------------------------------- */

const DEFAULT_ROBOT_MODEL_URL = '/models/poly_robot.glb';

/* ------------------------------ tunables --------------------------------- */

const BOT_NAME = 'Bunny';
const GREETING_TEXT = `Hi! I'm ${BOT_NAME}!`;

type VoiceMode = 'chirp' | 'speech' | 'both';
type WaveArm = 'right' | 'left';

/**
 * voiceMode: 'chirp' = pure Eilik beeps, 'speech' = words only,
 *            'both'  = beeps then the spoken name (default).
 * waveArm:   which arm waves, as seen on screen.
 */
const TUNING: { voiceMode: VoiceMode; waveArm: WaveArm } = {
  voiceMode: 'chirp',
  waveArm: 'left',
};
const SPEECH_VOLUME = 0.55;
const CHIRP_VOLUME = 0.5;

/** Neon blue for the eye panel and the mouth bar. */
const NEON_COLOR = '#19E3FF';
const NEON_EMISSIVE = '#00C2FF';
const NEON_INTENSITY = 6.5;
/** Also tint the body light strips + hover rings so nothing looks mismatched. */
const TINT_BODY_ACCENTS = true;
const HOVER_PADDING = 0.82;
/** Soft neon spill light in front of the face. Set to 0 to disable. */
const FACE_GLOW_INTENSITY = 1.1;

/** How far the body turns toward the cursor (radians). */
const HEAD_YAW_LIMIT = 0.42;
const HEAD_PITCH_LIMIT = 0.2;
/** How far the face panel slides toward the cursor (model-local units). */
const EYE_SHIFT_X = 0.085;
const EYE_SHIFT_Y = 0.03;
/** Eye-pivot rotation added on top of the panel slide (radians). */
const GAZE_PIVOT_YAW = 0.09;
const GAZE_PIVOT_PITCH = 0.05;

const WAVE_DURATION = 2.4; // seconds
const WAVE_LIFT = 2.0; // radians: arm hangs at 0, is horizontal at ~1.57, up beside the head at ~2.1
const WAVE_SWING = 0.38; // radians of back-and-forth on top of the lift
const WAVE_SPEED = 9.5; // swings per second * 2pi-ish
/** Flip this if the arm swings into the body instead of out to the side. */
const WAVE_DIRECTION = 1;

const IDLE_WAVE_EVERY = 22; // seconds; set to 0 to never wave on its own

/* ------------------------------ responsiveness ----------------------------
 * Two independent axes of "mobile":
 *   - screen width -> how big/where the robot sits (getViewportTier + the
 *     per-tier positions in getSectionTarget, further down).
 *   - input type   -> touch has no hover, so the click/wave detection below
 *     can't rely on "was the cursor already over him last frame", and the
 *     Canvas itself trims GPU cost on coarse-pointer (touch) devices.
 * ------------------------------------------------------------------------- */

type ViewportTier = 'phone-sm' | 'phone' | 'desktop';

/** phone-sm: iPhone SE-class widths, where the default 'phone' sizing can
 * crowd the edges or sit under a bottom nav bar / home indicator. */
const getViewportTier = (): ViewportTier => {
  if (typeof window === 'undefined') return 'desktop';

  const w = window.innerWidth;

  if (w < 380) return 'phone-sm';
  if (w < 768) return 'phone';
  return 'desktop';
};

/** True on touch-primary devices (phones/tablets), false for mouse/trackpad,
 * regardless of window width — a touch-capable laptop stays false here. */
const useIsCoarsePointer = () => {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarse(mq.matches);

    update();
    mq.addEventListener('change', update);

    return () => mq.removeEventListener('change', update);
  }, []);

  return coarse;
};


/* --------------------------- pointer tracking ----------------------------- */

const pointerState = {
  ndcX: 0,
  ndcY: 0,
  clientX: -9999,
  clientY: -9999,
  lastMove: 0,
  speed: 0,
  hasMoved: false,
};

let pointerListenerCount = 0;

const handlePointerMove = (event: PointerEvent | MouseEvent) => {
  const now = performance.now();
  const dt = Math.max(16, now - pointerState.lastMove);

  const dx = event.clientX - pointerState.clientX;
  const dy = event.clientY - pointerState.clientY;

  if (pointerState.hasMoved) {
    const instant = (Math.hypot(dx, dy) / dt) * 16;
    pointerState.speed = pointerState.speed * 0.8 + instant * 0.2;
  }

  pointerState.clientX = event.clientX;
  pointerState.clientY = event.clientY;
  pointerState.ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  pointerState.ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
  pointerState.lastMove = now;
  pointerState.hasMoved = true;
};

const usePointerTracking = () => {
  useEffect(() => {
    pointerListenerCount += 1;

    if (pointerListenerCount === 1) {
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
      window.addEventListener('pointerdown', handlePointerMove, {
        passive: true,
      });
    }

    return () => {
      pointerListenerCount -= 1;

      if (pointerListenerCount === 0) {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerdown', handlePointerMove);
      }
    };
  }, []);
};

/* ------------------------------- voice ------------------------------------ */
/**
 * Eilik does not use a TTS voice — it chirps short pitched syllables with a
 * heavy vibrato. That is what `chirpPhrase` below does. Real words are an
 * optional layer on top so the robot still literally says its name.
 *
 * The AudioContext is created once and kept alive. The old version closed it
 * after every greeting, which made the second click silent in Chrome.
 */

type Viseme = { start: number; end: number; open: number };

let sharedCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;

  const AudioCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtor) return null;

  if (!sharedCtx) {
    try {
      sharedCtx = new AudioCtor();
    } catch {
      return null;
    }
  }

  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }

  return sharedCtx;
};

let cachedVoices: SpeechSynthesisVoice[] = [];

const primeVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const load = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };

  load();
  window.speechSynthesis.addEventListener('voiceschanged', load);
};

const pickCuteVoice = () => {
  const voices = cachedVoices.length
    ? cachedVoices
    : window.speechSynthesis.getVoices();

  return (
    voices.find((v) =>
      /samantha|zira|karen|aria|jenny|tessa|moira|google uk english female/i.test(
        v.name
      )
    ) ??
    voices.find((v) => /female/i.test(v.name)) ??
    voices.find((v) => /^en-US$/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    null
  );
};

/** One pitched robot syllable: triangle + square, vibrato, low-passed. */
const chirpSyllable = (
  ctx: AudioContext,
  at: number,
  dur: number,
  freqs: number[],
  volume: number
) => {
  const carrier = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const gain = ctx.createGain();
  const subGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();

  carrier.type = 'triangle';
  sub.type = 'square';

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2800, at);
  filter.Q.setValueAtTime(1.1, at);

  const applyRamps = (param: AudioParam) => {
    param.setValueAtTime(freqs[0], at);

    freqs.slice(1).forEach((f, i) => {
      param.exponentialRampToValueAtTime(
        f,
        at + (dur * (i + 1)) / (freqs.length - 1)
      );
    });
  };

  applyRamps(carrier.frequency);
  applyRamps(sub.frequency);

  // Vibrato is what makes it read as "cute robot" instead of "beep".
  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(15, at);
  vibratoGain.gain.setValueAtTime(freqs[0] * 0.035, at);
  vibrato.connect(vibratoGain);
  vibratoGain.connect(carrier.frequency);

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(volume * 0.75, at + dur * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  subGain.gain.setValueAtTime(0.22, at);

  carrier.connect(filter);
  sub.connect(subGain);
  subGain.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  carrier.start(at);
  sub.start(at);
  vibrato.start(at);

  const stopAt = at + dur + 0.03;
  carrier.stop(stopAt);
  sub.stop(stopAt);
  vibrato.stop(stopAt);
};

/**
 * "Hi! I'm Bun-ny!" as pitched chirps, plus the matching mouth timeline so the
 * mouth bar opens exactly on each syllable instead of flapping randomly.
 */
const chirpPhrase = (ctx: AudioContext, startAt: number, volume: number) => {
  const syllables: Array<{ dur: number; freqs: number[]; open: number }> = [
    { dur: 0.07, freqs: [360, 720], open: 0.35 }, // wake-up blip
    { dur: 0.17, freqs: [540, 900, 840], open: 1 }, // "Hi"
    { dur: 0.12, freqs: [720, 660], open: 0.7 }, // "I'm"
    { dur: 0.14, freqs: [840, 1060], open: 0.95 }, // "Bun"
    { dur: 0.22, freqs: [1060, 1260, 1180], open: 0.8 }, // "ny"
  ];

  const gapAfterBlip = 0.09;
  const gap = 0.045;

  let cursor = startAt;
  const visemes: Viseme[] = [];
  const ctxOriginMs = performance.now() - ctx.currentTime * 1000;

  syllables.forEach((s, i) => {
    chirpSyllable(ctx, cursor, s.dur, s.freqs, volume * (i === 0 ? 0.55 : 1));

    visemes.push({
      start: ctxOriginMs + cursor * 1000,
      end: ctxOriginMs + (cursor + s.dur) * 1000,
      open: s.open,
    });

    cursor += s.dur + (i === 0 ? gapAfterBlip : gap);
  });

  return { visemes, endsAt: cursor };
};

type GreetingHandlers = {
  onSpeakStart: () => void;
  onSpeakEnd: () => void;
  onVisemes: (visemes: Viseme[]) => void;
};

const playGreeting = ({
  onSpeakStart,
  onSpeakEnd,
  onVisemes,
}: GreetingHandlers) => {
  if (typeof window === 'undefined') return;

  const ctx = getAudioContext();

  if (!ctx) {
    onSpeakStart();
    window.setTimeout(onSpeakEnd, 700);
    return;
  }

  const { visemes, endsAt } = chirpPhrase(
    ctx,
    ctx.currentTime + 0.02,
    CHIRP_VOLUME
  );

  onVisemes(visemes);
  onSpeakStart();

  window.setTimeout(
    onSpeakEnd,
    Math.max(600, (endsAt - ctx.currentTime) * 1000)
  );
};

/* --------------------------- model preparation ---------------------------- */

type ControlRig = {
  root: THREE.Group;
  eyesCtrl: THREE.Group | null;
  eyesNode: THREE.Object3D | null;
  gazeCtrl: THREE.Group | null;
  mouthCtrl: THREE.Group | null;
  mouthNode: THREE.Object3D | null;
  earsCtrl: THREE.Group | null;
  waveCtrl: THREE.Group | null;
  otherHandCtrl: THREE.Group | null;
  facePosition: THREE.Vector3;
  boundingRadius: number;
  boundingCenter: THREE.Vector3;
  disposables: THREE.Material[];
};

/**
 * three's GLTFLoader sanitises node names: "Hand origin" is loaded as
 * "Hand_origin" and "Hand origin.002" as "Hand_origin002". The old file looked
 * up the raw glTF names, got null every time, and silently never moved an arm.
 * This lookup accepts either spelling.
 */
const flatten = (name: string) => name.toLowerCase().replace(/[\s._-]/g, '');

const findNode = (
  root: THREE.Object3D,
  ...candidates: string[]
): THREE.Object3D | null => {
  for (const candidate of candidates) {
    const direct = root.getObjectByName(candidate);
    if (direct) return direct;
  }

  const wanted = candidates.map(flatten);
  let found: THREE.Object3D | null = null;

  root.traverse((child) => {
    if (!found && wanted.includes(flatten(child.name))) found = child;
  });

  return found;
};

/**
 * Insert an untouched control group above `node`, taking over the node's
 * translation so the wrapper rotates around the node's own pivot.
 * Safe because the clip animates rotation/scale on these nodes, never position.
 */
const insertControl = (node: THREE.Object3D | null): THREE.Group | null => {
  if (!node || !node.parent) return null;

  const parent = node.parent;
  const ctrl = new THREE.Group();

  ctrl.name = `${node.name}__ctrl`;
  ctrl.position.copy(node.position);

  node.position.set(0, 0, 0);

  parent.add(ctrl);
  ctrl.add(node);

  return ctrl;
};

const applyNeon = (material: THREE.Material, disposables: THREE.Material[]) => {
  const clone = material.clone() as THREE.MeshStandardMaterial;

  clone.color = new THREE.Color(NEON_COLOR);
  clone.emissive = new THREE.Color(NEON_EMISSIVE);
  clone.emissiveIntensity = NEON_INTENSITY;
  clone.roughness = 0.35;
  clone.metalness = 0;
  clone.toneMapped = false; // keeps the neon from being crushed to pale blue
  clone.needsUpdate = true;

  disposables.push(clone);

  return clone;
};

const useRobotRig = (scene: THREE.Group): ControlRig =>
  useMemo(() => {
    const root = scene.clone(true) as THREE.Group;
    const disposables: THREE.Material[] = [];

    root.updateMatrixWorld(true);

    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      const name = mesh.name;
      const isFace = /^(Eyes|Mouth)_/.test(name);
      const isAccent = /_Blue_Light_0$/.test(name);

      if (!isFace && !(TINT_BODY_ACCENTS && isAccent)) return;

      const material = mesh.material as THREE.Material | THREE.Material[];

      mesh.material = Array.isArray(material)
        ? material.map((m) => applyNeon(m, disposables))
        : applyNeon(material, disposables);
    });

    const eyesNode = findNode(root, 'Eyes');
    const mouthNode = findNode(root, 'Mouth');

    const rig: ControlRig = {
      root,
      eyesCtrl: insertControl(eyesNode),
      eyesNode,
      gazeCtrl: insertControl(findNode(root, 'Empty')),
      mouthCtrl: insertControl(mouthNode),
      mouthNode,
      earsCtrl: insertControl(findNode(root, 'Ears')),
      waveCtrl: null,
      otherHandCtrl: null,
      facePosition: new THREE.Vector3(),
      boundingRadius: 1.2,
      boundingCenter: new THREE.Vector3(),
      disposables,
    };

    // "Hand origin" is the arm pivot at world +X, "Hand origin.002" at -X.
    const plusX = insertControl(findNode(root, 'Hand_origin', 'Hand origin'));
    const minusX = insertControl(
      findNode(root, 'Hand_origin002', 'Hand origin.002')
    );

    rig.waveCtrl = TUNING.waveArm === 'right' ? plusX : minusX;
    rig.otherHandCtrl = TUNING.waveArm === 'right' ? minusX : plusX;

    // Normalise height, then ground the model at y = 0 of its own group.
    root.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 2.1;
    const height = size.y > 0.001 ? size.y : Math.max(size.x, size.z);

    if (height > 0.001) {
      root.scale.setScalar(targetHeight / height);
    }

    root.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(root);
    const center = scaledBox.getCenter(new THREE.Vector3());

    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= scaledBox.min.y + 0.02;

    root.position.y -= 0.7;

    root.updateMatrixWorld(true);

    const finalBox = new THREE.Box3().setFromObject(root);
    const sphere = finalBox.getBoundingSphere(new THREE.Sphere());

    rig.boundingCenter.copy(sphere.center);
    rig.boundingRadius = sphere.radius;

    // Face position in the group's own space, for the neon spill light.
    const eyes = findNode(root, 'Eyes');

    if (eyes) {
      eyes.getWorldPosition(rig.facePosition);
      root.parent?.worldToLocal(rig.facePosition);
    } else {
      rig.facePosition.set(0, 1.75, 0.45);
    }

    return rig;
  }, [scene]);


const ROBOT_BUBBLE_STYLE_ID = 'robot-bubble-keyframes';

const ensureRobotBubbleStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ROBOT_BUBBLE_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = ROBOT_BUBBLE_STYLE_ID;
  style.textContent = `
    @keyframes robotBubbleIn {
      from {
        opacity: 0;
        transform: translateY(4px) scale(0.92);
      }
      to {
        opacity: 1;
        transform: translateY(-4px) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
};

/* ------------------------------ the robot --------------------------------- */

const CustomGLBModel: React.FC<{
  url: string;
  isWalking: boolean;
  isWaving: boolean;
  isHappy: boolean;
  onInteract?: () => void;
}> = ({ url, isWalking, isWaving, isHappy, onInteract }) => {
  const { scene, animations } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, modelRef);
  const { camera, size } = useThree();

  const rig = useRobotRig(scene as THREE.Group);

  usePointerTracking();

  useEffect(() => {
    ensureRobotBubbleStyles();
  }, []);

  const speakingRef = useRef(false);
  const visemesRef = useRef<Viseme[]>([]);
  const [showBubble, setShowBubble] = useState(false);
  const waveStartRef = useRef(-1);
  const greetingUntilRef = useRef(0);
  const hoveredRef = useRef(false);
  const lastExternalWave = useRef(false);
  const nextIdleWave = useRef(
    performance.now() + (IDLE_WAVE_EVERY || 9999) * 1000
  );

  const gaze = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, excite: 0 });
  const screenPos = useRef(new THREE.Vector3());
  const worldCenterRef = useRef(new THREE.Vector3());
  const worldScale = useRef(new THREE.Vector3());

  /* ---- where the robot's hit-sphere projects to on screen, right now ----
   * Shared by useFrame (continuous hover) and the tap handler below (a
   * one-off check at the moment of touch/click). Pulling this out of
   * useFrame is what makes taps work on mobile: see isPointOverRobot.    */
  const projectRobot = useCallback(
    (model: THREE.Object3D) => {
      model.updateWorldMatrix(true, false);
      model.getWorldScale(worldScale.current);

      const worldCenter = worldCenterRef.current
        .copy(rig.boundingCenter)
        .applyMatrix4(model.matrixWorld);

      const distance = camera.position.distanceTo(worldCenter);

      screenPos.current.copy(worldCenter).project(camera);

      const perspective = camera as THREE.PerspectiveCamera;
      const visibleHeight =
        2 *
        Math.tan(THREE.MathUtils.degToRad(perspective.fov ?? 40) / 2) *
        Math.max(0.001, distance);

      const radiusWorld =
        rig.boundingRadius * worldScale.current.x * HOVER_PADDING;
      const radiusNdcY = (radiusWorld / Math.max(0.001, visibleHeight)) * 2;
      const radiusNdcX = radiusNdcY / (size.width / size.height);

      return {
        ndcX: screenPos.current.x,
        ndcY: screenPos.current.y,
        radiusNdcX,
        radiusNdcY,
      };
    },
    [camera, rig, size]
  );

  /** Point-in-ellipse test against wherever the robot is on screen right now. */
  const isPointOverRobot = useCallback(
    (ndcX: number, ndcY: number) => {
      const model = modelRef.current;
      if (!model) return false;

      const geo = projectRobot(model);
      const dxNdc = ndcX - geo.ndcX;
      const dyNdc = ndcY - geo.ndcY;

      return (
        (dxNdc * dxNdc) / (geo.radiusNdcX * geo.radiusNdcX) +
          (dyNdc * dyNdc) / (geo.radiusNdcY * geo.radiusNdcY) <
        1
      );
    },
    [projectRobot]
  );

  /* ---- the baked idle clip just loops forever; we layer on top of it ---- */
  useEffect(() => {
    const action = actions['Scene'] ?? (names[0] ? actions[names[0]] : null);
    if (!action) return;

    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.fadeIn(0.3).play();

    return () => {
      action.fadeOut(0.2);
      action.stop();
    };
  }, [actions, names]);

  useEffect(() => {
    primeVoices();
  }, []);

  useEffect(
    () => () => {
      rig.disposables.forEach((m) => m.dispose());

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    },
    [rig]
  );

  const startWave = useCallback((withVoice: boolean) => {
    const now = performance.now();

    if (waveStartRef.current >= 0 && now - waveStartRef.current < 600) return;

    waveStartRef.current = now;
    greetingUntilRef.current = now + WAVE_DURATION * 1000;
    nextIdleWave.current = now + (IDLE_WAVE_EVERY || 9999) * 1000;

    if (!withVoice) return;

    setShowBubble(true);
    window.setTimeout(() => setShowBubble(false), WAVE_DURATION * 1000);

    playGreeting({
      onSpeakStart: () => {
        speakingRef.current = true;
      },
      onSpeakEnd: () => {
        speakingRef.current = false;
      },
      onVisemes: (v) => {
        visemesRef.current = v;
      },
    });
  }, []);

  const greet = useCallback(() => {
    startWave(true);
    onInteract?.();
  }, [onInteract, startWave]);

  /* ---- clicking/tapping the robot, without eating the rest of the page ----
   * The old version fired on pointerdown if `hoveredRef.current` was true —
   * but that ref is only updated once a frame inside useFrame, one tick
   * behind the DOM event. On desktop a mouse has usually hovered the robot
   * for several frames before it clicks, so the ref is already correct by
   * the time of the click and this was never noticed. On mobile there is no
   * hover: the pointerdown from a tap IS the first time that position is
   * known, so the stale ref read as "not over him" on essentially every tap.
   *
   * Fixed by hit-testing synchronously at pointerdown (isPointOverRobot,
   * above) instead of waiting on a frame. A pointerup/movement check is
   * added alongside it so a scroll or swipe that happens to start over the
   * robot doesn't also trigger a greeting — this listener can't call
   * preventDefault (the canvas stays pointerEvents:none so scrolling isn't
   * blocked), so without this a page swipe starting on him would wave too. */
  useEffect(() => {
    const TAP_MOVE_TOLERANCE = 10; // px of finger/mouse drift still counted as a tap
    const TAP_MAX_DURATION = 500; // ms; longer holds are treated as a drag, not a tap

    const tap = { down: false, x: 0, y: 0, time: 0, overRobot: false };

    const toNdc = (event: PointerEvent) => ({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    });

    const onPointerDown = (event: PointerEvent) => {
      const { x, y } = toNdc(event);

      tap.down = true;
      tap.x = event.clientX;
      tap.y = event.clientY;
      tap.time = performance.now();
      tap.overRobot = isPointOverRobot(x, y);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!tap.down) return;
      tap.down = false;

      if (!tap.overRobot) return;

      const moved = Math.hypot(event.clientX - tap.x, event.clientY - tap.y);
      const elapsed = performance.now() - tap.time;

      if (moved <= TAP_MOVE_TOLERANCE && elapsed <= TAP_MAX_DURATION) {
        greet();
      }
    };

    const onPointerCancel = () => {
      tap.down = false;
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, {
      passive: true,
    });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.body.style.cursor = '';
    };
  }, [greet, isPointOverRobot]);

  /* ---- portfolio can still request a wave through the prop ---- */
  useEffect(() => {
    if (isWaving && !lastExternalWave.current) {
      lastExternalWave.current = true;
      startWave(false);
    }

    if (!isWaving) {
      lastExternalWave.current = false;
    }
  }, [isWaving, startWave]);

  useFrame((state, delta) => {
    const model = modelRef.current;
    if (!model) return;

    const time = state.clock.getElapsedTime();
    const now = performance.now();
    const step = Math.min(1, delta * 6);

    /* ---------- 1. where is the robot on screen, and is the cursor on it?
     * rig.boundingCenter was measured in the model group's own space; the
     * shared projectRobot() takes it to NDC screen space via one matrix.   */
    const geo = projectRobot(model);

    const dxNdc = pointerState.ndcX - geo.ndcX;
    const dyNdc = pointerState.ndcY - geo.ndcY;

    const overSphere =
      pointerState.hasMoved &&
      (dxNdc * dxNdc) / (geo.radiusNdcX * geo.radiusNdcX) +
        (dyNdc * dyNdc) / (geo.radiusNdcY * geo.radiusNdcY) <
        1;

    if (overSphere !== hoveredRef.current) {
      hoveredRef.current = overSphere;
      document.body.style.cursor = overSphere ? 'pointer' : '';
    }

    /* ---------- 2. gaze target, measured from the robot, not from centre */
    const idle = now - pointerState.lastMove > 2600;

    gaze.current.targetX = idle
      ? Math.sin(time * 0.45) * 0.25
      : THREE.MathUtils.clamp(dxNdc * 1.35, -1, 1);

    gaze.current.targetY = idle
      ? Math.sin(time * 0.31) * 0.12
      : THREE.MathUtils.clamp(dyNdc * 1.35, -1, 1);

    gaze.current.x = THREE.MathUtils.lerp(
      gaze.current.x,
      gaze.current.targetX,
      Math.min(1, delta * 5)
    );

    gaze.current.y = THREE.MathUtils.lerp(
      gaze.current.y,
      gaze.current.targetY,
      Math.min(1, delta * 5)
    );

    // Eilik-ish "ooh, something moved" reaction.
    const excited = !idle && pointerState.speed > 26;
    gaze.current.excite = THREE.MathUtils.lerp(
      gaze.current.excite,
      excited ? 1 : 0,
      Math.min(1, delta * 4)
    );

    pointerState.speed *= 0.92;

    /* ---------- 3. mood */
    const waving =
      waveStartRef.current >= 0 &&
      now - waveStartRef.current < WAVE_DURATION * 1000;

    const greetingActive = now < greetingUntilRef.current;
    const happy = isHappy || greetingActive || waving || hoveredRef.current;
    const happyPulse = happy ? 0.5 + Math.abs(Math.sin(time * 5.5)) * 0.5 : 0;

    /* ---------- 4. head / body follows the cursor (wrapper, never the clip) */
    model.rotation.y = THREE.MathUtils.lerp(
      model.rotation.y,
      gaze.current.x * HEAD_YAW_LIMIT,
      step
    );

    model.rotation.x = THREE.MathUtils.lerp(
      model.rotation.x,
      -gaze.current.y * HEAD_PITCH_LIMIT,
      step
    );

    const breathing = Math.sin(time * 2.15) * 0.012;
    const bounce = happy ? Math.abs(Math.sin(time * 7)) * 0.02 : 0;

    model.position.y = breathing + bounce;

    model.rotation.z = THREE.MathUtils.lerp(
      model.rotation.z,
      (happy ? Math.sin(time * 3.2) * 0.014 : Math.sin(time * 1.6) * 0.006) +
        (waving ? 0.05 * (TUNING.waveArm === 'right' ? -1 : 1) : 0),
      step
    );

    /* ---------- 5. face panel slides toward the cursor
     * Local axes inside "Robot Origin": X = right, Y = back, Z = UP.       */
    if (rig.eyesCtrl) {
      const base = rig.eyesCtrl.userData.base as THREE.Vector3 | undefined;

      if (!base) {
        rig.eyesCtrl.userData.base = rig.eyesCtrl.position.clone();
      }

      const origin = rig.eyesCtrl.userData.base as THREE.Vector3;

      rig.eyesCtrl.position.x = THREE.MathUtils.lerp(
        rig.eyesCtrl.position.x,
        origin.x + gaze.current.x * EYE_SHIFT_X,
        step
      );

      rig.eyesCtrl.position.z = THREE.MathUtils.lerp(
        rig.eyesCtrl.position.z,
        origin.z + gaze.current.y * EYE_SHIFT_Y,
        step
      );

      // Squint when happy, widen when surprised. Multiplies the baked blink.
      const squint = happy ? 0.74 + happyPulse * 0.06 : 1;
      const widen = 1 + gaze.current.excite * 0.14;

      rig.eyesCtrl.scale.z = THREE.MathUtils.lerp(
        rig.eyesCtrl.scale.z,
        squint * widen,
        Math.min(1, delta * 7)
      );

      rig.eyesCtrl.scale.x = THREE.MathUtils.lerp(
        rig.eyesCtrl.scale.x,
        happy ? 1.05 : 1,
        step
      );
    }

    if (rig.gazeCtrl) {
      rig.gazeCtrl.rotation.z = THREE.MathUtils.lerp(
        rig.gazeCtrl.rotation.z,
        gaze.current.x * GAZE_PIVOT_YAW,
        step
      );

      rig.gazeCtrl.rotation.x = THREE.MathUtils.lerp(
        rig.gazeCtrl.rotation.x,
        -gaze.current.y * GAZE_PIVOT_PITCH,
        step
      );
    }

    /* ---------- 6. mouth: syllable-accurate while talking, baked otherwise */
    if (rig.mouthCtrl && rig.mouthNode) {
      let target = 1;

      const viseme = visemesRef.current.find(
        (v) => now >= v.start && now <= v.end
      );

      if (viseme) {
        const p = (now - viseme.start) / Math.max(1, viseme.end - viseme.start);
        const envelope = Math.sin(p * Math.PI);
        target = 1 + viseme.open * envelope * 2.4;
      } else if (speakingRef.current) {
        // speechSynthesis gives no timings, so approximate a talking rhythm
        target =
          1 + (0.45 + Math.abs(Math.sin(time * 13)) * 0.9) * 1.4;
      } else if (happy) {
        target = 1.45 + happyPulse * 0.2;
      }

      if (visemesRef.current.length && now > visemesRef.current[visemesRef.current.length - 1].end + 400) {
        visemesRef.current = [];
      }

      // Divide out the baked scale so the mouth opening is absolute, not doubled.
      const baked = Math.max(0.001, rig.mouthNode.scale.z);

      rig.mouthCtrl.scale.z = THREE.MathUtils.lerp(
        rig.mouthCtrl.scale.z,
        target / baked,
        Math.min(1, delta * 18)
      );

      rig.mouthCtrl.scale.x = THREE.MathUtils.lerp(
        rig.mouthCtrl.scale.x,
        happy ? 1.3 : 1,
        step
      );
    }

    /* ---------- 7. ears react (rotation.y = tilt, because Z is up) */
    if (rig.earsCtrl) {
      const tilt = happy
        ? Math.sin(time * 6) * 0.07
        : Math.sin(time * 1.4) * 0.015;

      rig.earsCtrl.rotation.y = THREE.MathUtils.lerp(
        rig.earsCtrl.rotation.y,
        tilt + gaze.current.excite * 0.05,
        step
      );
    }

    /* ---------- 8. the wave itself (not in the GLB, so we drive it)
     * The wrapper lives in "Robot Origin" space, where local Y = world -Z.
     * Rotating the +X arm by -angle swings it outward and up.             */
    if (rig.waveCtrl) {
      const sign =
        (TUNING.waveArm === 'right' ? -1 : 1) * (WAVE_DIRECTION >= 0 ? 1 : -1);

      let angle = 0;

      if (waving) {
        const elapsed = (now - waveStartRef.current) / 1000;
        const p = elapsed / WAVE_DURATION;
        const envelope = Math.sin(Math.min(1, p) * Math.PI) ** 0.55;

        angle =
          sign *
          envelope *
          (WAVE_LIFT + Math.sin(elapsed * WAVE_SPEED) * WAVE_SWING);
      } else if (waveStartRef.current >= 0) {
        waveStartRef.current = -1;
      }

      rig.waveCtrl.rotation.y = THREE.MathUtils.lerp(
        rig.waveCtrl.rotation.y,
        angle,
        Math.min(1, delta * 12)
      );
    }

    if (rig.otherHandCtrl) {
      rig.otherHandCtrl.rotation.y = THREE.MathUtils.lerp(
        rig.otherHandCtrl.rotation.y,
        waving ? (TUNING.waveArm === 'right' ? -0.12 : 0.12) : 0,
        step
      );
    }

    /* ---------- 9. occasional unprompted wave so he feels alive */
    if (IDLE_WAVE_EVERY > 0 && now > nextIdleWave.current && !waving) {
      nextIdleWave.current = now + IDLE_WAVE_EVERY * 1000;
      startWave(false);
    }

    void isWalking;
  });

  return (
    <group ref={modelRef}>
      <primitive object={rig.root} />

      {showBubble && (
  <Html
    position={[0, 1.65, 0]}
    center
    distanceFactor={4}
    style={{
      pointerEvents: 'none',
      userSelect: 'none',
      whiteSpace: 'nowrap',
    }}
  >
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 'clamp(140px, 18vw, 170px)',
        padding: 'clamp(9px, 1.5vw, 12px) clamp(12px, 2vw, 18px)',
        borderRadius: 22,
        background: 'rgba(255,255,255,0.96)',
        border: '2px solid rgba(25,227,255,0.7)',
        boxShadow:
          '0 8px 24px rgba(25,227,255,0.18), 0 2px 8px rgba(0,0,0,0.12)',
        color: '#172033',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 'clamp(13px, 2vw, 16px)',
        fontWeight: 700,
        lineHeight: 1.2,
        transform: 'translateY(-4px)',
        animation: 'robotBubbleIn 220ms ease-out',
      }}
    >
      <span>{GREETING_TEXT}</span>

      <span
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -10,
          width: 18,
          height: 18,
          background: 'rgba(255,255,255,0.96)',
          borderRight: '2px solid rgba(25,227,255,0.7)',
          borderBottom: '2px solid rgba(25,227,255,0.7)',
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      />
    </div>
  </Html>
)}

      {FACE_GLOW_INTENSITY > 0 && (
        <pointLight
          position={[
            rig.facePosition.x,
            rig.facePosition.y,
            rig.facePosition.z + 0.12,
          ]}
          color={NEON_COLOR}
          intensity={FACE_GLOW_INTENSITY}
          distance={1.4}
          decay={2}
        />
      )}
    </group>
  );
};

/* -------------------------- scene / layout logic --------------------------- */

interface RobotCanvasProps {
  currentSection: SectionId;
  isWaving: boolean;
  isHappy: boolean;
  onInteract: () => void;
  scrollDirection: 'up' | 'down' | 'idle';
  customModelUrl?: string | null;
  floatingMode?: boolean;
}

class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`${BOT_NAME} GLB failed to load:`, error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const SceneController: React.FC<RobotCanvasProps> = ({
  currentSection,
  isWaving,
  isHappy,
  onInteract,
  customModelUrl,
  floatingMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const walkingRef = useRef(false);

  const modelUrl = customModelUrl || DEFAULT_ROBOT_MODEL_URL;

  const getSectionTarget = (section: SectionId, tier: ViewportTier) => {
    if (tier !== 'desktop') {
      // iPhone SE-class widths: scale down a bit further and sit a touch
      // higher so he doesn't crowd a bottom nav bar or the home indicator.
      const small = tier === 'phone-sm';
      const scale = small ? 0.85 : 1;
      const heroY = small ? -0.10 : -0.10;

      switch (section) {
    case 'hero':
  return {
    pos: [0.35, -0.85, 0.85],
    scale: 0.35 * scale,
    rotY: -0.15,
  };
        case 'about':
            return {
    pos: [0.35, -0.85, 0.85],
    scale: 0.32 * scale,
    rotY: -0.15,
  };
        case 'contact':
        case 'footer':
          return { pos: [0, heroY, 0.85], scale: 0.33 * scale, rotY: 0.15 };
        default:
          // Same idea as the desktop branch below: floatingMode pulls him
          // in closer to center instead of parking him near the edge.
          return floatingMode
            ? {
                pos: [small ? 0.55 : 0.62, small ? -0.68 : -0.78, 0.85],
                scale: 0.2 * scale,
                rotY: -0.16,
              }
            : {
                pos: [small ? 0.72 : 0.85, small ? -0.68 : -0.78, 0.85],
                scale: 0.2 * scale,
                rotY: -0.2,
              };
      }
    }

    switch (section) {
      case 'hero':
        return { pos: [1.85, 0.05, 0.85], scale: 0.5, rotY: -0.28 };
      case 'about':
        return { pos: [-1.85, 0.05, 0.85], scale: 0.45, rotY: 0.3 };
      case 'contact':
        return { pos: [-1.8, 0.05, 0.85], scale: 0.44, rotY: 0.26 };
      case 'footer':
        return { pos: [1.75, 0.05, 0.85], scale: 0.45, rotY: -0.25 };
      default:
        return floatingMode
          ? { pos: [2.25, -0.8, 0.85], scale: 0.25, rotY: -0.32 }
          : { pos: [3.6, -0.8, 0.85], scale: 0.25, rotY: -0.4 };
    }
  };

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const tier = getViewportTier();
    const target = getSectionTarget(currentSection, tier);

    const floatY = Math.sin(state.clock.elapsedTime * 2.2) * 0.035;
    const floatRoll = Math.sin(state.clock.elapsedTime * 1.6) * 0.02;

    const dx = target.pos[0] - group.position.x;
    const dy = target.pos[1] - group.position.y;

    walkingRef.current = Math.hypot(dx, dy) > 0.35;

    const lerpSpeed = Math.min(1, delta * 3.2);

    const nextScale = THREE.MathUtils.lerp(
      group.scale.x,
      target.scale,
      lerpSpeed
    );

    group.scale.setScalar(nextScale);

    const minGroupY = -1.35 + nextScale * 1.2;

    const rawY = THREE.MathUtils.lerp(
      group.position.y,
      target.pos[1] + floatY,
      lerpSpeed
    );

    group.position.x = THREE.MathUtils.lerp(
      group.position.x,
      target.pos[0],
      lerpSpeed
    );

    group.position.y = Math.max(minGroupY, rawY);

    group.position.z = THREE.MathUtils.lerp(
      group.position.z,
      target.pos[2],
      lerpSpeed
    );

    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      target.rotY,
      lerpSpeed
    );

    group.rotation.z = THREE.MathUtils.lerp(
      group.rotation.z,
      floatRoll,
      lerpSpeed
    );

    if (spotlightRef.current) {
      spotlightRef.current.position.x = group.position.x;
      spotlightRef.current.position.z = group.position.z + 2.2;
      spotlightRef.current.target = group;
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} color="#E2E8F0" />

      <spotLight
        ref={spotlightRef}
        position={[2, 5.5, 3]}
        angle={0.65}
        penumbra={0.7}
        intensity={2.6}
        color="#FFFFFF"
      />

      <directionalLight position={[4, 3, 2]} intensity={0.9} color="#EDE9FE" />
      <directionalLight position={[-4, 2, 2]} intensity={0.6} color="#DBEAFE" />

      <group ref={groupRef} position={[1.85, 0.05, 0.85]}>
        <GLBErrorBoundary>
          <Suspense fallback={null}>
            <CustomGLBModel
              url={modelUrl}
              isWalking={walkingRef.current}
              isWaving={isWaving}
              isHappy={isHappy}
              onInteract={onInteract}
            />
          </Suspense>
        </GLBErrorBoundary>
      </group>
    </>
  );
};

export const RobotCanvas: React.FC<RobotCanvasProps> = (props) => {
  // Phones render this at native device pixel ratio (often 3x) on a GPU far
  // weaker than a laptop's; dpr=2 + MSAA there is what actually costs frame
  // rate, not the polycount. Capping both on touch devices keeps the wave/
  // gaze animation smooth instead of dropping frames.
  const isCoarsePointer = useIsCoarsePointer();

  return (
    <div
      className="fixed inset-0 z-20 overflow-hidden"
      // The canvas no longer swallows clicks. Hover + click on the robot are
      // handled with a window listener and a manual hit test, so the rest of
      // the portfolio stays fully clickable at any z-index.
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{
          antialias: !isCoarsePointer,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={isCoarsePointer ? [1, 1.5] : [1, 2]}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <SceneController {...props} />
      </Canvas>
    </div>
  );
};

useGLTF.preload(DEFAULT_ROBOT_MODEL_URL);