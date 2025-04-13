import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pane } from "tweakpane";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

const pane = new Pane();

// Scene
const scene = new THREE.Scene();

// Galaxy
const parameters = {
  count: 100_000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

pane
  .addBinding(parameters, "count", {
    min: 100,
    max: 1_000_000,
    step: 100,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane
  .addBinding(parameters, "size", {
    min: 0.001,
    max: 0.1,
    step: 0.001,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane
  .addBinding(parameters, "radius", {
    min: 0.01,
    max: 20,
    step: 0.01,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane
  .addBinding(parameters, "branches", {
    min: 2,
    max: 8,
    step: 1,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane
  .addBinding(parameters, "spin", {
    min: -5,
    max: 5,
    step: 0.01,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane
  .addBinding(parameters, "randomness", {
    min: 0,
    max: 2,
    step: 0.01,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane
  .addBinding(parameters, "randomnessPower", {
    min: 1,
    max: 10,
    step: 0.001,
  })
  .on("change", (e) => {
    if (e.last) {
      generateGalaxy();
    }
  });
pane.addBinding(parameters, "insideColor").on("change", (e) => {
  if (e.last) {
    generateGalaxy();
  }
});
pane.addBinding(parameters, "outsideColor").on("change", (e) => {
  if (e.last) {
    generateGalaxy();
  }
});

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  // Destroy
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  // Geometry
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Positions
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Colors
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Material
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

// Sizes
const screen = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;

  // Update camera
  camera.aspect = screen.width / screen.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(screen.width, screen.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  }
});

// Camera
const camera = new THREE.PerspectiveCamera(75, screen.width / screen.height);
camera.position.x = 5;
camera.position.y = 5;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(screen.width, screen.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

renderer.render(scene, camera);

const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
