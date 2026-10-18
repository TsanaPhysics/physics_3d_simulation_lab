/**
 * scene.js
 * Three.js Scene, Camera, Renderer, Lab Lighting & 3D Instrument Primitives
 * RBRU Next Gen Lab 2026
 */

const container = document.getElementById('canvas-container');
const labelsContainer = document.getElementById('labels-container');

// Main WebGL Scene & Fog
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1120);
scene.fog = new THREE.FogExp2(0x0b1120, 0.016);

// Perspective Camera
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.3, 8.2, 10.6);

// Antialiased WebGL Renderer with Soft Shadow Mapping
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Smooth Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0.3, 0.9, 0.3);
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 3.2;
controls.maxDistance = 24;

// Studio & Lab Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.05);
dirLight.position.set(7, 16, 11);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
const d = 11;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.38);
fillLight.position.set(-8, 9, -6);
scene.add(fillLight);

// Shared Lab Bench Table with Surface Grid
const tableGroup = new THREE.Group();
scene.add(tableGroup);

const tableGeo = new THREE.BoxGeometry(19, 0.5, 13);
const tableMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.42,
  metalness: 0.12,
  transparent: true,
  opacity: 1.0
});
const tableMesh = new THREE.Mesh(tableGeo, tableMat);
tableMesh.position.y = -0.25;
tableMesh.receiveShadow = true;
tableGroup.add(tableMesh);

const gridHelper = new THREE.GridHelper(19, 38, 0x334155, 0x1e293b);
gridHelper.position.y = 0.01;
tableGroup.add(gridHelper);

// =========================================================================
// Reusable 3D Physical Instrument Helpers
// =========================================================================

/**
 * Creates a realistic 3D Banana Plug at a given terminal location
 */
function createBananaPlug3D(pos, colorHex, rotX = 0, rotZ = 0) {
  const plugGroup = new THREE.Group();
  plugGroup.position.copy(pos);
  plugGroup.rotation.set(rotX, 0, rotZ);

  const shroud = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.095, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.1 })
  );
  shroud.position.y = 0.14;
  plugGroup.add(shroud);

  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.25 })
  );
  ring.position.y = 0.05;
  plugGroup.add(ring);

  const strainBoot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.08, 0.18, 14),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45 })
  );
  strainBoot.position.y = 0.34;
  plugGroup.add(strainBoot);

  return plugGroup;
}

/**
 * Creates an axial through-hole resistor model with authentic ceramic contours & color bands
 */
function createPrecisionResistor3D(p1, p2, bandColors, bodyColorHex = 0xe7d3b0, bodyRadius = 0.19) {
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();

  const resGroup = new THREE.Group();
  resGroup.position.copy(mid);
  resGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

  // Tinned copper wire leads
  const leadMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.038, len, 16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.14 })
  );
  resGroup.add(leadMesh);

  // Ceramic Dumbbell-shaped Resistor Body
  const bodyLen = len * 0.46;
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColorHex,
    roughness: 0.32,
    metalness: 0.08
  });
  const bodyMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyRadius * 0.92, bodyRadius * 0.92, bodyLen, 28),
    bodyMat
  );
  bodyMesh.castShadow = true;
  resGroup.add(bodyMesh);

  // Rounded ceramic end caps + metallic end ferrules
  [-1, 1].forEach((side) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(bodyRadius * 1.04, 24, 16),
      bodyMat
    );
    cap.scale.set(1, 0.68, 1);
    cap.position.y = side * (bodyLen * 0.47);
    cap.castShadow = true;
    resGroup.add(cap);

    const ferrule = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyRadius * 0.48, bodyRadius * 0.48, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.2 })
    );
    ferrule.position.y = side * (bodyLen * 0.62);
    resGroup.add(ferrule);
  });

  // Color Bands (including metallic gold tolerance band)
  const bandMeshes = [];
  bandColors.forEach((col, bIdx) => {
    const isTolerance = (bIdx === bandColors.length - 1);
    const bandRadius = (bIdx === 0 || isTolerance) ? bodyRadius * 0.98 : bodyRadius * 0.945;
    const bandMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(bandRadius, bandRadius, bodyLen * 0.095, 28),
      new THREE.MeshStandardMaterial({
        color: col,
        roughness: isTolerance ? 0.18 : 0.32,
        metalness: isTolerance ? 0.85 : 0.08
      })
    );
    const offsetFrac = (bIdx - (bandColors.length - 1) / 2) * 0.21;
    bandMesh.position.y = offsetFrac * bodyLen;
    bandMeshes.push(bandMesh);
    resGroup.add(bandMesh);
  });
  resGroup.userData.bandMeshes = bandMeshes;

  return resGroup;
}

/**
 * Creates flexible 3D silicone insulated test leads using Catmull-Rom spline tubes
 */
function createInsulatedLead(points, colorHex, radius = 0.048) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 44, radius, 14, false);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.26,
    metalness: 0.08
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Creates detailed 3D Alligator Clip Probes
 */
function createAlligatorClipProbe3D(bootColorHex) {
  const probeGroup = new THREE.Group();

  const tailBoot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.115, 0.36, 18),
    new THREE.MeshStandardMaterial({ color: bootColorHex, roughness: 0.42 })
  );
  tailBoot.position.y = 0.45;
  probeGroup.add(tailBoot);

  const gripBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.14, 0.34, 20),
    new THREE.MeshStandardMaterial({ color: bootColorHex, roughness: 0.32 })
  );
  gripBody.position.y = 0.22;
  probeGroup.add(gripBody);

  const jawMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.16 });
  [-0.048, 0.048].forEach((jx, idx) => {
    const jaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.28, 0.12),
      jawMat
    );
    jaw.position.set(jx, 0.0, 0);
    jaw.rotation.z = idx === 0 ? 0.08 : -0.08;
    probeGroup.add(jaw);
  });

  return probeGroup;
}
