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
light.shadow.camera.far = 200;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
scene.add(light);
scene.add(new THREE.DirectionalLightHelper(light));

const mainGroup = new THREE.Group();
scene.add(mainGroup);

const rodGeometry = new THREE.CylinderGeometry(0.5, 0.5, 100, 32);
const rodMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const rod = new THREE.Mesh(rodGeometry, rodMaterial);
rod.rotation.z = Math.PI / 2;
rod.castShadow = true;
rod.receiveShadow = true;
mainGroup.add(rod);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 32);

const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -25;
plane.receiveShadow = true;
scene.add(plane);

const subGroups = [];
const speeds = [];
const numPendulums = 10;

for (let i = 0; i < numPendulums; i++) {
    const subGroup = new THREE.Group();

    const sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({ color: 0x0000ff }));
    sphere.position.y = -5 - i * 2;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    subGroup.add(sphere);

    const cylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: 0x888888 }));
    cylinder.scale.y = (sphere.position.y) / 10;
    cylinder.position.y = sphere.position.y / 2;
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    subGroup.add(cylinder);

    subGroup.position.x = -45 + i * 10;
    mainGroup.add(subGroup);

    subGroups.push(subGroup);
    speeds.push(0.08 / (1 + i * 0.5));
}

camera.position.z = 100;

let go = false;
document.addEventListener('keydown', () => { go = true; });

function animate() {
    requestAnimationFrame(animate);

    if (go) {
        subGroups.forEach((subGroup, index) => {
            subGroup.rotation.x += speeds[index];
            if (Math.abs(subGroup.rotation.x) > Math.PI / 2) {
                speeds[index] *= -1;
            }
        });
    }

    controls.update();
    stats.update();
    renderer.render(scene, camera);
}

animate();