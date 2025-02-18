import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

// Création de la scène
const scene = new THREE.Scene();

// Chargement de la texture de fond (cube map)
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

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Création du renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ajout des contrôles de la caméra
const controls = new OrbitControls(camera, renderer.domElement);

// Ajout des statistiques de performance
const stats = new Stats();
document.body.appendChild(stats.dom);

// Création et configuration de la lumière directionnelle
const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(50, 50, 10);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048; // faut mieux mettre des puissance de 2
light.shadow.camera.near = 20;
light.shadow.camera.far = 150;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
scene.add(light);

// Ajout d'un helper pour visualiser la lumière directionnelle
const lightHelper = new THREE.DirectionalLightHelper(light);
scene.add(lightHelper);

// Ajout d'un helper pour visualiser la caméra de l'ombre
const shadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(shadowCameraHelper);

// Création d'un plan pour représenter le sol
const geometry = new THREE.PlaneGeometry(60, 60);
const material = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Chargement du modèle 3D
const loader = new GLTFLoader();
camera.position.z = 50;

let rocket;
let rocketClicked = false;
let tl;

// Fonction d'animation
function animate() {
    requestAnimationFrame(animate);
    if (rocket && rocketClicked && !tl) {
        tl = gsap.timeline({ yoyo: true, repeat: 1 });
        tl.to(rocket.position, { y: 50, duration: 5 });
        tl.eventCallback("onComplete", () => {
            rocketClicked = false;
            tl = null;
        });
    }
    controls.update();
    stats.update();
    renderer.render(scene, camera);
}

// Chargement du modèle GLTF
loader.load('./assets/modelglb/rocket.glb', function (gltf) {
    rocket = gltf.scene;
    rocket.userData.direction = 1;
    scene.add(gltf.scene);
    rocket.traverse(function (node) {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = false; // Pour éviter de surcharger le rendu
        }
    });
}, undefined, function (error) {
    console.error(error);
});

// Détection du clic sur la fusée
window.addEventListener('click', function (event) {
    if (rocket) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Calculer la position de la souris en coordonnées normalisées
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(rocket, true);

        if (intersects.length > 0) {
            console.log('Fusée cliquée');
            rocketClicked = true;
        }
    }
});

animate();