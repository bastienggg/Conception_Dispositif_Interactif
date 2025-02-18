// Importer Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

// Initialiser la scène, la caméra et le rendu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
    75, // Champ de vision
    window.innerWidth / window.innerHeight, // Ratio d'aspect
    0.1, // Distance proche
    1000 // Distance lointaine
);
camera.position.set(0, 8, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajouter des spotlights clignotants avec des helpers
const spotLights = [];
const spotLightPositions = [
    { x: 5, y: 10, z: -10 },
    { x: -5, y: 10, z: -10 },
    { x: 0, y: 10, z: -15 },
    { x: 0, y: 10, z: -5 }
];

spotLightPositions.forEach((pos, index) => {
    const spotLight = new THREE.SpotLight(0xffffff, 0.5); // Intensité augmentée
    spotLight.position.set(pos.x, pos.y, pos.z);
    spotLight.castShadow = true;
    scene.add(spotLight);
    spotLights.push({ light: spotLight, interval: 500 + index * 250 });

    // Ajouter un helper pour visualiser le spotlight
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);
});

// Charger un modèle GLTF (facultatif, exemple de complexité supplémentaire)
const loader = new GLTFLoader();
let mixer;
loader.load(
    './modele/modele1/scene.gltf',
    (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh) child.castShadow = true;
        });
        gltf.scene.scale.set(1.5, 1.5, 1.5);
        scene.add(gltf.scene);

        // Initialiser l'AnimationMixer et lire l'animation
        mixer = new THREE.AnimationMixer(gltf.scene);
        if (gltf.animations.length > 0) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }
    },
    (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
    (error) => console.error('An error happened:', error)
);

// Ajouter un sol
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Configurer les ombres
renderer.shadowMap.enabled = true;

// Ajouter des contrôles de caméra
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Fonction pour faire clignoter les spotlights
function blinkSpotLights() {
    spotLights.forEach((spot, index) => {
        setInterval(() => {
            spot.light.visible = !spot.light.visible;
        }, spot.interval);
    });
}

// Animation
const clock = new THREE.Clock();
function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Mise à jour des contrôles
    controls.update();

    // Mise à jour de l'AnimationMixer
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    // Rendu
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

// Gérer le redimensionnement
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Démarrer l'animation et le clignotement des lumières
animate();
blinkSpotLights();
