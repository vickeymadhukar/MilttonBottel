import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  smooth: true,
  smoothTouch: false,
});

lenis.on("scroll", () => {
  ScrollTrigger.update();
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const modelSection = document.querySelector("#model-section");
modelSection.appendChild(renderer.domElement);

// Lights
const spotlight = new THREE.DirectionalLight(0xffffff, 3);
spotlight.position.set(10, 10, 10);
scene.add(spotlight);
scene.add(new THREE.AmbientLight(0xffffff, 1));

// Buy Section Scene Setup
const buyScene = new THREE.Scene();
const buyCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
buyCamera.position.z = 20;

const buyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
buyRenderer.setPixelRatio(window.devicePixelRatio);
buyRenderer.setSize(window.innerWidth, window.innerHeight); 
document.querySelector("#buy-model-container").appendChild(buyRenderer.domElement);

const buySpotlight = new THREE.DirectionalLight(0xffffff, 3);
buySpotlight.position.set(10, 10, 10);
buyScene.add(buySpotlight);
buyScene.add(new THREE.AmbientLight(0xffffff, 1));

let buyModelRef = null;

// Loader

let tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#model-section",
    start: "top top",
    end: "+=3000", // Same distance as model rotation
    scrub: 1,
    pin: true, // This keeps the section on screen
    markers: false,
  },
});

const loader = new GLTFLoader();
loader.load(
  "./model/shaker.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(3, 3, 3);

    model.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.metalness = 0.05;
        node.material.roughness = 0.9;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    const modelWrapper = new THREE.Group();
    modelWrapper.add(model);
    scene.add(modelWrapper);

    modelWrapper.rotation.z = THREE.MathUtils.degToRad(-15);

    // Clone model for the buy section
    buyModelRef = model.clone();
    const buyModelWrapper = new THREE.Group();
    buyModelWrapper.add(buyModelRef);
    buyScene.add(buyModelWrapper);
    
    // Move model to the right half of the screen
    buyModelWrapper.position.x = 6;
    buyModelWrapper.position.y = -2;
    buyModelWrapper.rotation.z = THREE.MathUtils.degToRad(10);
    
    gsap.fromTo(buyModelRef.rotation, 
      { y: -Math.PI }, 
      {
        y: Math.PI,
        ease: "none",
        scrollTrigger: {
          trigger: "#buy-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      }
    );
    gsap.fromTo(buyModelWrapper.position, 
      { y: -5 }, 
      {
        y: 2,
        ease: "none",
        scrollTrigger: {
          trigger: "#buy-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      }
    );

    // Animation 1: Rotate model on scroll
    gsap.to(model.rotation, {
      y: Math.PI * 4,
      ease: "none",
      scrollTrigger: {
        trigger: "#model-section",
        start: "top top",
        end: "+=3000", // Distance to stay pinned
        scrub: 1,
      },
    });

    console.log("Model loaded!");
  },
  undefined,
  (error) => console.error("Error:", error),
);

const title = document.querySelector("#scrolling-text");
if (title) {
  tl.to(title, {
    x: "-100%", // Move text to the left
    ease: "none",
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (buyModelRef) {
    buyRenderer.render(buyScene, buyCamera);
  }
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  buyCamera.aspect = window.innerWidth / window.innerHeight;
  buyCamera.updateProjectionMatrix();
  const buyEl = document.querySelector("#buy-section");
  buyRenderer.setSize(window.innerWidth, buyEl ? buyEl.offsetHeight : window.innerHeight);
});

animate();

gsap.from(
  ".upper-box",
  {
    y: -100,
    opacity: 0,
    ease: "slow(0.7,0.7,false)",
    scrollTrigger: {
      trigger: "#model-section",
      start: "top top",
      end: "55% top",
      scrub: 1,
    },
  },
  "a",
);

gsap.from(
  ".lower-box",
  {
    y: 100,
    opacity: 0,
    ease: "slow(0.7,0.7,false)",
    scrollTrigger: {
      trigger: "#model-section",
      start: "top top",
      end: "55% top",
      scrub: 1,
    },
  },
  "a",
);

tl.to(
  "#circle-mask",
  {
    clipPath: "circle(150% at 50% 50%)",
    ease: "none",
    duration: 1,
  },
  "b",
);

tl.to(
  "#circle-mask h1",
  {
    x: "-100%",
    ease: "none",
    duration: 1,
  },
  "b",
);

tl.from(
  ".whitebox h2",
  {
    y: 20,
    opacity: 0,
    ease: "none",
  },
  "c",
);
tl.from(
  ".whitebox p",
  {
    y: -50,
    opacity: 0,
    ease: "none",
  },
  "c",
);

tl.from(
  ".lineseg",
  {
    x: 500,
  },
  "e",
);

tl.from(
  ".leftbox h2",
  {
    y: 20,
    opacity: 0,
    ease: "none",
  },
  "c",
);
tl.from(
  ".leftbox p",
  {
    y: -50,
    opacity: 0,
    ease: "none",
  },
  "c",
);
tl.from(
  ".leftlineseg",
  {
    x: -500,
  },
  "e",
);

gsap.to(".upper-shutter", {
  y: -500,
  duration: 10,
});
gsap.to(".lower-shutter", {
  y: 500,
  duration: 10,
});

const mytext = new SplitType("#my-text");

gsap.to(".char", {
  y: 0,
  duration: 0.1,
  stagger: 0.05,
  delay: 2,
});

gsap.to(".shutter-back", {
  delay: 5,
  opacity: 0,
  onComplete: () => {
    document.querySelector(".shutter-back").style.display = "none";
  },
});

const splitTypes = document.querySelectorAll(".scroll-highlight");
splitTypes.forEach((char) => {
  const text = new SplitType(char, { types: "chars, words" });

  gsap.from(text.chars, {
    scrollTrigger: {
      trigger: char,
      start: "top 60%",
      end: "top 0%",
      scrub: true,
      markers: false,
    },
    opacity: 0.2,
    stagger: 0.05,
  });
});

// Pinned feature section animations
const featureSteps = gsap.utils.toArray(".feature-step");

gsap.to("#pinned-img", {
  scrollTrigger: {
    trigger: "#feature-pinned",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
  rotation: 15,
  scale: 1.1,
  ease: "none"
});

featureSteps.forEach((step, i) => {
  gsap.from(step.querySelectorAll(".step-num, .step-title, .step-desc"), {
    scrollTrigger: {
      trigger: step,
      start: "top 70%",
      end: "top 30%",
      scrub: true,
    },
    y: 50,
    opacity: 0.1, // fade in from slightly visible
    stagger: 0.1
  });
  
  // fade out
  gsap.to(step.querySelectorAll(".step-num, .step-title, .step-desc"), {
    scrollTrigger: {
      trigger: step,
      start: "bottom 60%",
      end: "bottom 20%",
      scrub: true,
    },
    y: -50,
    opacity: 0,
    stagger: 0.1
  });
});

gsap.from(".specs-title", {
  scrollTrigger: {
    trigger: ".specs-section",
    start: "top 75%",
  },
  y: 50,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".specs-list li", {
  scrollTrigger: {
    trigger: ".specs-section",
    start: "top 60%",
  },
  y: 50,
  opacity: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: "back.out(1.5)"
});

gsap.from(".buy-content", {
  scrollTrigger: {
    trigger: ".buy-section",
    start: "top 75%",
  },
  scale: 0.9,
  opacity: 0,
  duration: 1,
  ease: "back.out(1.5)"
});
