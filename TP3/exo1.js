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



const geometry = new THREE.PlaneGeometry(500, 500);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 10, 0);
box.castShadow = true;
scene.add(box);

camera.position.z = 50;

function animate() {
    requestAnimationFrame(animate);
    box.rotation.y += 0.01;
    controls.update();
    stats.update();
    renderer.render(scene, camera);
}

animate();