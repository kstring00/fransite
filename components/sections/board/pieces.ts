import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { PieceKind } from "@/lib/domains";

/**
 * Chess piece geometry. Turned pieces come from lathe profiles (radius, height),
 * the knight from an extruded silhouette, and crowns and crosses from small
 * primitives so the queen and king echo the brand queen.
 */

type Profile = Array<[number, number]>;

const BASE: Profile = [
  [0, 0],
  [0.2, 0],
  [0.2, 0.025],
  [0.185, 0.04],
  [0.165, 0.055],
  [0.17, 0.07],
  [0.14, 0.09],
];

const PROFILES: Record<Exclude<PieceKind, "knight">, Profile> = {
  pawn: [
    ...BASE,
    [0.11, 0.12],
    [0.085, 0.18],
    [0.07, 0.25],
    [0.065, 0.31],
    [0.1, 0.335],
    [0.1, 0.355],
    [0.07, 0.37],
    [0.085, 0.4],
    [0.1, 0.44],
    [0.09, 0.49],
    [0.055, 0.53],
    [0, 0.55],
  ],
  rook: [
    ...BASE,
    [0.12, 0.12],
    [0.105, 0.2],
    [0.1, 0.4],
    [0.11, 0.46],
    [0.14, 0.48],
    [0.145, 0.5],
    [0.145, 0.6],
    [0.1, 0.6],
    [0.1, 0.56],
    [0, 0.56],
  ],
  bishop: [
    ...BASE,
    [0.115, 0.12],
    [0.09, 0.2],
    [0.075, 0.3],
    [0.07, 0.4],
    [0.1, 0.43],
    [0.1, 0.45],
    [0.075, 0.47],
    [0.11, 0.52],
    [0.115, 0.58],
    [0.09, 0.66],
    [0.045, 0.72],
    [0.03, 0.74],
    [0.045, 0.76],
    [0.03, 0.79],
    [0, 0.8],
  ],
  queen: [
    ...BASE,
    [0.13, 0.12],
    [0.15, 0.2],
    [0.145, 0.27],
    [0.12, 0.33],
    [0.085, 0.4],
    [0.07, 0.48],
    [0.065, 0.56],
    [0.07, 0.63],
    [0.1, 0.66],
    [0.1, 0.68],
    [0.085, 0.7],
    [0.09, 0.72],
    [0.12, 0.76],
    [0.125, 0.82],
    [0.11, 0.84],
    [0.075, 0.85],
    [0.055, 0.85],
    [0, 0.85],
  ],
  king: [
    ...BASE,
    [0.13, 0.12],
    [0.14, 0.2],
    [0.125, 0.3],
    [0.09, 0.4],
    [0.075, 0.5],
    [0.07, 0.6],
    [0.1, 0.63],
    [0.1, 0.65],
    [0.08, 0.67],
    [0.1, 0.72],
    [0.115, 0.79],
    [0.1, 0.82],
    [0.06, 0.84],
    [0, 0.85],
  ],
};

export function latheGeometry(kind: Exclude<PieceKind, "knight">, segments = 48): THREE.LatheGeometry {
  const pts = PROFILES[kind].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

const KNIGHT_PATH =
  "M14 58c0-4 2-8 5-10 3.3-2.3 5.5-5.2 6.5-8.6-2.6 1.2-5.8 1.4-8.3.1-1.4-.7-2.4-1.9-3-3.3-.5-1.3-.3-2.9.6-4 2.8-3.6 6.6-6.2 10.3-8.9 1.2-2.3 1.3-5 2.5-7.3.6-1.2 1.9-1.6 3-1 1.4.9 1.5 2.5 2.5 3.6 1.2 1.3 3 1.7 4.4 2.7 2.7 1.9 4.8 4.6 5.9 7.7 1.4 4.2 1.5 8.8 1.7 13.2.2 5.3.4 10.6.4 15.8H14Z";

/** The knight head and neck, extruded from the brand icon silhouette. */
export function knightGeometry(): THREE.BufferGeometry {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64"><path d="${KNIGHT_PATH}"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const shapes = data.paths.flatMap((p) => p.toShapes(true));
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 10,
    bevelEnabled: true,
    bevelThickness: 1.4,
    bevelSize: 1.2,
    bevelSegments: 3,
    curveSegments: 10,
  });
  // SVG space: y down, 64 units tall. Scale to ~0.56 world units, flip y, center x and depth.
  const s = 0.56 / 64;
  geo.scale(s, -s, s);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y + 0.09, -(bb.min.z + bb.max.z) / 2);
  geo.computeVertexNormals();
  return geo;
}

export function knightBaseGeometry(): THREE.LatheGeometry {
  const pts: Profile = [...BASE, [0.12, 0.1], [0, 0.1]];
  return new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    48
  );
}

/** Heights used to place crowns and to project the pop-up card. */
export const PIECE_HEIGHT: Record<PieceKind, number> = {
  pawn: 0.55,
  rook: 0.62,
  knight: 0.66,
  bishop: 0.8,
  queen: 1.0,
  king: 0.98,
};
