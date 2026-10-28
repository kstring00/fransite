"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively by design */
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DOMAINS, type Domain, type PieceFinish } from "@/lib/domains";
import { tileGeometry } from "./puzzle";
import { knightBaseGeometry, knightGeometry, latheGeometry, PIECE_HEIGHT } from "./pieces";

export type BoardSceneProps = {
  /** Render loop on while the board is on screen. */
  active: boolean;
  selected: string | null;
  reduceMotion: boolean;
  onHover: (letter: string | null) => void;
  onTap: (letter: string) => void;
  onMiss: () => void;
  /** Screen position (0 to 1 of the canvas) of the selected piece's shoulder, every frame. */
  onProject: (letter: string, x: number, y: number) => void;
  onReady: () => void;
};

const TILE_TOP = 0.104;
const GOLD = new THREE.Color("#C9A24B");
const GOLD_2 = new THREE.Color("#E6C77A");

/* ------------------------------------------------------------------ */
/* Materials                                                            */
/* ------------------------------------------------------------------ */

function useMaterials() {
  const veins = useLoader(THREE.TextureLoader, "/textures/marble-veins.webp");
  const leopard = useLoader(THREE.TextureLoader, "/textures/leopard.webp");

  return useMemo(() => {
    veins.wrapS = veins.wrapT = THREE.RepeatWrapping;
    veins.colorSpace = THREE.SRGBColorSpace;
    veins.anisotropy = 4;
    leopard.wrapS = leopard.wrapT = THREE.RepeatWrapping;
    leopard.colorSpace = THREE.SRGBColorSpace;
    leopard.anisotropy = 4;
    leopard.repeat.set(3, 2);

    const marbleTile = new THREE.MeshPhysicalMaterial({
      map: veins,
      color: new THREE.Color(0.2, 0.19, 0.17),
      emissive: new THREE.Color("#0f0c0b"),
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 0.7,
      clearcoatRoughness: 0.14,
      envMapIntensity: 0.6,
    });
    const oxbloodTile = marbleTile.clone();
    oxbloodTile.emissive = new THREE.Color("#2a0608");
    oxbloodTile.color = new THREE.Color(0.22, 0.12, 0.11);

    const goldTile = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#cfa64c"),
      metalness: 1,
      roughness: 0.2,
      envMapIntensity: 1.4,
    });

    const goldPiece = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8b058"),
      metalness: 1,
      roughness: 0.27,
      envMapIntensity: 1.5,
    });
    const marblePiece = new THREE.MeshPhysicalMaterial({
      map: veins,
      color: new THREE.Color(0.24, 0.22, 0.2),
      emissive: new THREE.Color("#110d0c"),
      roughness: 0.2,
      metalness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1,
    });
    const plainMarble = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1b1513"),
      roughness: 0.26,
      metalness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1,
    });
    const leopardPiece = new THREE.MeshPhysicalMaterial({
      map: leopard,
      color: new THREE.Color(0.85, 0.8, 0.72),
      roughness: 0.3,
      metalness: 0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.9,
    });
    return { marbleTile, oxbloodTile, goldTile, goldPiece, marblePiece, plainMarble, leopardPiece };
  }, [veins, leopard]);
}

/* ------------------------------------------------------------------ */
/* Tiles                                                                */
/* ------------------------------------------------------------------ */

function Tiles({ mats }: { mats: ReturnType<typeof useMaterials> }) {
  const geos = useMemo(() => {
    const out: Array<{ key: string; geo: THREE.ExtrudeGeometry; x: number; z: number; kind: "gold" | "marble" | "oxblood" }> = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const gold = (row + col) % 2 === 0;
        const oxblood = !gold && (row === 0 && col === 1 ? true : row === 2 && col === 1);
        out.push({ key: `${row}${col}`, geo: tileGeometry(row, col), x: col - 1, z: row - 1, kind: gold ? "gold" : oxblood ? "oxblood" : "marble" });
      }
    }
    return out;
  }, []);
  useEffect(() => () => geos.forEach((g) => g.geo.dispose()), [geos]);

  return (
    <group>
      {geos.map((t) => (
        <mesh
          key={t.key}
          geometry={t.geo}
          position={[t.x, 0, t.z]}
          material={t.kind === "gold" ? mats.goldTile : t.kind === "oxblood" ? mats.oxbloodTile : mats.marbleTile}
          receiveShadow
          castShadow
        />
      ))}
      {/* Seam underlay so the gaps read as dark marble, not emptiness. */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.08, 3.08]} />
        <meshStandardMaterial color="#070606" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

type PieceProps = {
  domain: Domain;
  mats: ReturnType<typeof useMaterials>;
  selected: boolean;
};

function pieceMaterial(finish: PieceFinish, mats: ReturnType<typeof useMaterials>) {
  return finish === "gold" ? mats.goldPiece : finish === "leopard" ? mats.leopardPiece : mats.marblePiece;
}

function Piece({ domain, mats, selected }: PieceProps) {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const geo = useMemo(() => {
    if (domain.piece === "knight") return { main: knightGeometry(), base: knightBaseGeometry() };
    return { main: latheGeometry(domain.piece), base: null as THREE.BufferGeometry | null };
  }, [domain.piece]);
  useEffect(
    () => () => {
      geo.main.dispose();
      geo.base?.dispose();
    },
    [geo]
  );

  // Own material instance so the rim glow is per piece.
  const mat = useMemo(() => {
    const m = (domain.piece === "knight" && domain.finish === "marble" ? mats.plainMarble : pieceMaterial(domain.finish, mats)).clone();
    m.emissive = new THREE.Color("#000000");
    return m;
  }, [domain.finish, domain.piece, mats]);
  useEffect(() => () => mat.dispose(), [mat]);

  const accent = domain.finish === "marble" ? mats.marblePiece : mats.goldPiece;
  const x = domain.col - 1;
  const z = domain.row - 1;
  const lift = useRef(0);
  const glow = useRef(0);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0001, dt); // frame-rate independent lerp (~0.12 at 60fps)
    const targetLift = selected ? 0.14 : 0;
    lift.current += (targetLift - lift.current) * k;
    glow.current += ((selected ? 1 : 0) - glow.current) * k;
    if (group.current) group.current.position.y = TILE_TOP + lift.current;
    if (light.current) light.current.intensity = glow.current * 2.6;
    const e = glow.current * 0.22;
    (mat.emissive as THREE.Color).setRGB(GOLD.r * e, GOLD.g * e, GOLD.b * e);
  });

  const h = PIECE_HEIGHT[domain.piece];
  return (
    <>
    <group ref={group} position={[x, TILE_TOP, z]}>
      {domain.piece === "knight" ? (
        <group rotation={[0, -0.55, 0]}>
          <mesh geometry={geo.base!} material={mat} castShadow receiveShadow raycast={() => null} />
          <mesh geometry={geo.main} material={mat} castShadow receiveShadow raycast={() => null} />
        </group>
      ) : (
        <mesh geometry={geo.main} material={mat} castShadow receiveShadow raycast={() => null} />
      )}
      {domain.piece === "queen" ? (
        <group>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.118, 0.86, Math.sin(a) * 0.118]} material={accent === mats.marblePiece ? mats.goldPiece : accent} castShadow>
                <sphereGeometry args={[0.02, 14, 10]} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.9, 0]} material={mats.goldPiece} castShadow>
            <cylinderGeometry args={[0.018, 0.03, 0.06, 16]} />
          </mesh>
          <mesh position={[0, 0.955, 0]} material={mats.goldPiece} castShadow>
            <sphereGeometry args={[0.038, 18, 14]} />
          </mesh>
        </group>
      ) : null}
      {domain.piece === "king" ? (
        <group position={[0, 0.85, 0]}>
          <mesh position={[0, 0.07, 0]} material={accent} castShadow>
            <boxGeometry args={[0.028, 0.15, 0.028]} />
          </mesh>
          <mesh position={[0, 0.095, 0]} material={accent} castShadow>
            <boxGeometry args={[0.1, 0.028, 0.028]} />
          </mesh>
        </group>
      ) : null}
      {domain.piece === "rook" ? (
        <group position={[0, 0.6, 0]}>
          {Array.from({ length: 4 }, (_, i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.1, 0.035, Math.sin(a) * 0.1]} rotation={[0, -a, 0]} material={mat} castShadow>
                <boxGeometry args={[0.06, 0.07, 0.075]} />
              </mesh>
            );
          })}
        </group>
      ) : null}
      <pointLight ref={light} position={[0.25, h + 0.35, 0.35]} color={GOLD_2} intensity={0} distance={1.6} decay={2} />
    </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig: slight orbit with pointer parallax, settles on its own   */
/* ------------------------------------------------------------------ */

function Rig({ reduceMotion }: { reduceMotion: boolean }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const portrait = size.width / size.height < 1;
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 42 : 30;
    cam.position.set(0, portrait ? 3.9 : 3.55, portrait ? 4.5 : 4.7);
    cam.lookAt(0, 0.12, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  void reduceMotion;
  return null;
}

/* ------------------------------------------------------------------ */
/* Hover plane: the whole board is one continuous hit surface. Squares  */
/* are decided in board space with a dead band at the borders, so the   */
/* threshold is identical on every square and edges never flicker.      */
/* ------------------------------------------------------------------ */

const BORDER_DEADBAND = 0.07;

function HoverPlane({ boardRef, onHover, onTap }: { boardRef: React.RefObject<THREE.Group | null>; onHover: (letter: string | null) => void; onTap: (letter: string) => void }) {
  const local = useMemo(() => new THREE.Vector3(), []);
  const current = useRef<string | null>(null);

  const cellAt = (e: ThreeEvent<PointerEvent | MouseEvent>, strict: boolean): string | null => {
    const root = boardRef.current;
    if (!root) return null;
    local.copy(e.point);
    root.worldToLocal(local);
    const col = Math.round(local.x);
    const row = Math.round(local.z);
    if (col < -1 || col > 1 || row < -1 || row > 1) return null;
    if (strict) {
      // Inside the dead band next to a border? Keep whatever is selected.
      const dx = Math.abs(local.x - col);
      const dz = Math.abs(local.z - row);
      if ((dx > 0.5 - BORDER_DEADBAND || dz > 0.5 - BORDER_DEADBAND) && current.current) return current.current;
    }
    return DOMAINS.find((d) => d.col - 1 === col && d.row - 1 === row)?.letter ?? null;
  };

  const move = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === "touch") return;
    const next = cellAt(e, true);
    if (next === current.current) return;
    current.current = next;
    document.body.style.cursor = next ? "pointer" : "";
    onHover(next);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    const letter = cellAt(e, false);
    if (letter) onTap(letter);
  };

  return (
    <mesh position={[0, TILE_TOP + 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false} onPointerMove={move} onClick={click}>
      <planeGeometry args={[3.3, 3.3]} />
      <meshBasicMaterial />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Projection of the selected piece to screen space                     */
/* ------------------------------------------------------------------ */

function Projector({ selected, onProject, onReady }: Pick<BoardSceneProps, "selected" | "onProject" | "onReady">) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const readyFired = useRef(false);
  useFrame(() => {
    if (!readyFired.current) {
      readyFired.current = true;
      onReady();
    }
    if (!selected) return;
    const d = DOMAINS.find((x) => x.letter === selected);
    if (!d) return;
    v.set(d.col - 1, TILE_TOP + 0.14 + PIECE_HEIGHT[d.piece] * 0.62, d.row - 1);
    v.project(camera);
    onProject(selected, (v.x + 1) / 2, (1 - v.y) / 2);
  });
  void size;
  return null;
}

/* ------------------------------------------------------------------ */
/* Scene                                                                */
/* ------------------------------------------------------------------ */

function SceneContent(props: BoardSceneProps & { pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }>; boardRef: React.RefObject<THREE.Group | null> }) {
  const mats = useMaterials();
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = 1.05;
  }, [gl]);

  return (
    <>
      {/* Warm studio: brass reflects candle-warm panels, with one oxblood lick from below. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#100d0b"]} />
        {/* Warm ceiling so the flat brass tiles catch light; kept uneven so reflections keep their shape. */}
        <Lightformer form="rect" intensity={1.5} color="#ffd9a3" position={[1, 8, -6]} scale={[9, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#f2e8d5" position={[-2, 7, 5]} scale={[7, 2.5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={7} color="#ffe2b4" position={[3.5, 4.5, 2.5]} scale={[3.6, 2.6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3} color="#e6c77a" position={[-4, 2.5, 1]} scale={[3, 2, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={3} color="#fff4df" position={[0, 6, -1]} scale={[3, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#7a1419" position={[0, -1.5, 5]} scale={[5, 1.4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} color="#f2e8d5" position={[0, 1.2, -6]} scale={[6, 1.8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#ffd9a3" position={[5, 1, -2]} scale={[2, 3, 1]} target={[0, 0, 0]} />
      </Environment>
      <directionalLight
        position={[3.6, 6, 2.8]}
        intensity={3.2}
        color="#ffe3b8"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
        shadow-camera-near={1}
        shadow-camera-far={14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} color="#c9a24b" />
      <ambientLight intensity={0.12} color="#f2e8d5" />
      <group rotation={[0, 0, 0]}>
        <Rig reduceMotion={props.reduceMotion} />
        <Tiles mats={mats} />
        {DOMAINS.map((d) => (
          <Piece key={d.letter} domain={d} mats={mats} selected={props.selected === d.letter} />
        ))}
        <HoverPlane boardRef={props.boardRef} onHover={props.onHover} onTap={props.onTap} />
      </group>
      <ContactShadows position={[0, -0.035, 0]} opacity={0.55} scale={7} blur={2.4} far={1.6} color="#000000" frames={1} />
      <Projector selected={props.selected} onProject={props.onProject} onReady={props.onReady} />
    </>
  );
}

/** Rotates the whole board with the rig's rotation (the rig is a sibling, so mirror its values). */
function BoardRoot(props: BoardSceneProps & { pointer: React.MutableRefObject<{ x: number; y: number; active: boolean }> }) {
  const root = useRef<THREE.Group>(null);
  const rot = useRef({ x: 0, y: 0 });
  const t = useRef(0);
  const swayHeld = useRef(0);
  useFrame((_, dt) => {
    if (!root.current) return;
    if (!props.selected) t.current += dt;
    const sway = props.reduceMotion ? 0 : Math.sin(t.current * 0.35) * 0.9;
    swayHeld.current = sway;
    const px = props.pointer.current.active ? props.pointer.current.x : 0;
    const py = props.pointer.current.active ? props.pointer.current.y : 0;
    // Gentle parallax with a slow follow, so square edges never race the cursor.
    const targetY = THREE.MathUtils.degToRad(-px * 3 - sway);
    const targetX = THREE.MathUtils.degToRad(py * 1.8);
    const k = 1 - Math.pow(0.2, dt);
    rot.current.y += (targetY - rot.current.y) * k;
    rot.current.x += (targetX - rot.current.x) * k;
    root.current.rotation.set(rot.current.x, rot.current.y, 0);
  });
  return (
    <group ref={root}>
      <SceneContent {...props} boardRef={root} />
    </group>
  );
}

export function BoardScene(props: BoardSceneProps) {
  const pointer = useRef({ x: 0, y: 0, active: false });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    pointer.current.active = true;
  };
  const onLeave = () => {
    pointer.current.active = false;
  };

  return (
    <div className="board-scene" onPointerMove={onMove} onPointerLeave={onLeave}>
      <Canvas
        dpr={[1, 1.5]}
        shadows
        frameloop={props.active ? "always" : "never"}
        camera={{ fov: 30, near: 0.1, far: 40, position: [0, 3.55, 4.7] }}
        onCreated={(state) => state.setEvents({ filter: (hits) => hits.slice(0, 1) })}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        onPointerMissed={props.onMiss}
        style={{ background: "transparent" }}
      >
        <BoardRoot {...props} pointer={pointer} />
      </Canvas>
    </div>
  );
}
