import * as THREE from "three";

/**
 * Jigsaw outlines for the 3x3 board. Each internal edge gets a tab on one
 * side and a matching blank on the other, so the nine tiles interlock the
 * way the footage's board does. Outer edges stay straight.
 */

export type EdgeSign = -1 | 0 | 1;

// Seeded so the board is the same on every visit.
// vertical[row][k]: edge between col k and k+1 in that row (sign for the LEFT tile)
// horizontal[k][col]: edge between row k and k+1 in that col (sign for the TOP tile)
const VERTICAL: EdgeSign[][] = [
  [1, -1],
  [-1, 1],
  [1, 1],
];
const HORIZONTAL: EdgeSign[][] = [
  [-1, 1, -1],
  [1, -1, 1],
];

/** Tab profile along a unit edge, (u along, v outward). */
function tabPath(shape: THREE.Shape, p0: THREE.Vector2, p1: THREE.Vector2, normal: THREE.Vector2, sign: EdgeSign, inset: number) {
  const dir = p1.clone().sub(p0);
  const at = (u: number, v: number) => p0.clone().add(dir.clone().multiplyScalar(u)).add(normal.clone().multiplyScalar(v));
  if (sign === 0) {
    shape.lineTo(p1.x, p1.y);
    return;
  }
  const k = sign * 0.82;
  // Neck and head, slightly asymmetric so it reads hand-cut rather than stamped.
  const pts: Array<[number, number, number, number, number, number]> = [
    // c1u c1v c2u c2v  u v
    [0.455, 0.0, 0.405, 0.095, 0.405, 0.135],
    [0.405, 0.225, 0.345, 0.3, 0.5, 0.31],
    [0.655, 0.3, 0.595, 0.225, 0.595, 0.135],
    [0.595, 0.095, 0.545, 0.0, 0.64, 0.0],
  ];
  const l0 = at(0.36, 0);
  shape.lineTo(l0.x, l0.y);
  for (const [c1u, c1v, c2u, c2v, u, v] of pts) {
    const c1 = at(c1u, c1v * k - (sign > 0 ? inset * 0 : 0));
    const c2 = at(c2u, c2v * k);
    const p = at(u, v * k);
    shape.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p.x, p.y);
  }
  shape.lineTo(p1.x, p1.y);
}

/**
 * Builds the tile outline in shape space. Shape (x, y) maps to world (x, -z)
 * after the mesh is rotated -90 degrees around X.
 * row 0 is the far rank (world -z), col 0 is the left file (world -x).
 */
export function tileShape(row: number, col: number, size = 1, seam = 0.018): THREE.Shape {
  const h = size / 2 - seam / 2;
  // corners in shape space (y up = world -z, so far rank has larger y)
  const tl = new THREE.Vector2(-h, h);
  const tr = new THREE.Vector2(h, h);
  const br = new THREE.Vector2(h, -h);
  const bl = new THREE.Vector2(-h, -h);

  const top: EdgeSign = row === 0 ? 0 : (-HORIZONTAL[row - 1][col] as EdgeSign);
  const bottom: EdgeSign = row === 2 ? 0 : HORIZONTAL[row][col];
  const left: EdgeSign = col === 0 ? 0 : (-VERTICAL[row][col - 1] as EdgeSign);
  const right: EdgeSign = col === 2 ? 0 : VERTICAL[row][col];

  const shape = new THREE.Shape();
  shape.moveTo(tl.x, tl.y);
  tabPath(shape, tl, tr, new THREE.Vector2(0, 1), top, seam);
  tabPath(shape, tr, br, new THREE.Vector2(1, 0), right, seam);
  tabPath(shape, br, bl, new THREE.Vector2(0, -1), bottom, seam);
  tabPath(shape, bl, tl, new THREE.Vector2(-1, 0), left, seam);
  shape.closePath();
  return shape;
}

export function tileGeometry(row: number, col: number, depth = 0.09): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(tileShape(row, col), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelOffset: 0,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}
