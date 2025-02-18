import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
    .setPath('./assets/background/')
    .load([
        'posx.jpg',
        'negx.jpg',
        'posy.jpg',
        'negy.jpg',
        'posz.jpg',
        'negz.jpg'
    ]);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const stats = new Stats();
document.body.appendChild(stats.dom);

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(50, 100, 10);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 50;
light.shadow.camera.far = 150;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
scene.add(light);
scene.add(new THREE.DirectionalLightHelper(light));

// Création d'un plan pour représenter le sol
const geometry = new THREE.PlaneGeometry(60, 60);
const material = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);
// Création de la "forêt" de blocs alignés
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

const rows = 100;
const cols = 100;
const spacing = 2;
const boxes = [];

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.scale.y = Math.random() * 3 + 2; // Hauteur aléatoire entre 1 et 6
        box.position.set(
            i - (rows / 2), // Position x alignée sans espace
            box.scale.y / 2, // Position y pour que le bas soit à la même altitude
            j - (cols / 2)  // Position z alignée sans espace
        );
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
        boxes.push(box);
    }
}

camera.position.z = 50;
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    stats.update();

    // Animation de la hauteur des boîtes en fonction de la hauteur des boîtes voisines
    boxes.forEach((box, index) => {
        const i = Math.floor(index / cols);
        const j = index % cols;

        let neighborHeightSum = 0;
        let neighborCount = 0;

        // Vérifier les voisins
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue; // Ignorer la boîte elle-même
                const ni = i + di;
                const nj = j + dj;
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    const neighborIndex = ni * cols + nj;
                    neighborHeightSum += boxes[neighborIndex].scale.y;
                    neighborCount++;
                }
            }
        }

        const averageNeighborHeight = neighborHeightSum / neighborCount;
        const heightChange = (Math.random() - 0.5) * 0.5; // Réduire l'amplitude du changement de hauteur

        if (box.scale.y < averageNeighborHeight) {
            box.scale.y += Math.abs(heightChange);
        } else {
            box.scale.y -= Math.abs(heightChange);
        }

        // Ajouter une variation aléatoire pour maintenir les variations
        box.scale.y += (Math.random() - 0.5) * 0.1;

        box.position.y = box.scale.y / 2;
    });

    renderer.render(scene, camera);
}

animate();
