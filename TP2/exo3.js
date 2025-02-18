import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader()
    .setPath('./assets/background/')
    .load([
        'dark-s_px.jpg',
        'dark-s_nx.jpg',
        'dark-s_py.jpg',
        'dark-s_ny.jpg',
        'dark-s_pz.jpg',
        'dark-s_nz.jpg'
    ]);

// an array of objects whose rotation to update
const objects = [];

const solarSystem = new THREE.Object3D();
scene.add(solarSystem);
objects.push(solarSystem);

// use just one sphere for everything
const radius = 1;
const widthSegments = 30;
const heightSegments = 30;
const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments);

const sunMaterial = new THREE.MeshPhongMaterial({
    emissive: 0xffff00,
    emissiveMap: new THREE.TextureLoader().load('./assets/sun/sun.jpg'),
    emissiveIntensity: 1
});

const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);  // make the sun large
solarSystem.add(sunMesh);
objects.push(sunMesh);

const earthOrbit = new THREE.Object3D();
earthOrbit.position.x = 10;
solarSystem.add(earthOrbit);
objects.push(earthOrbit);

const earthColor = "./assets/earth/earthmap1k.jpg";
const earthBump = "./assets/earth/earthbump1k.jpg";
const earthSpec = "./assets/earth/earthspec1k.jpg";
const textureLoader = new THREE.TextureLoader();
const earthMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load(earthColor),
    bumpMap: textureLoader.load(earthBump),
    specularMap: textureLoader.load(earthSpec),
    bumpScale: 0.25,
    shininess: 1
});


const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthOrbit.add(earthMesh);
objects.push(earthMesh);


const jupiterOrbit = new THREE.Object3D();
jupiterOrbit.position.x = 17;
solarSystem.add(jupiterOrbit);
objects.push(jupiterOrbit);

const jupiterMaterial = new THREE.MeshPhongMaterial({
    emissive: 0x222222,
    emissiveMap: new THREE.TextureLoader().load('./assets/jupiter/jupiter.jpg'),
    specular: 0x555555, // ajuster la couleur spéculaire
    shininess: 0, // ajuster la brillance
});



const jupiterMesh = new THREE.Mesh(sphereGeometry, jupiterMaterial);
jupiterMesh.scale.set(2, 2, 2);
jupiterOrbit.add(jupiterMesh);
objects.push(earthMesh);


const moonOrbit = new THREE.Object3D();
moonOrbit.position.x = 2;
earthOrbit.add(moonOrbit);

const moonMaterial = new THREE.MeshPhongMaterial({
    emissive: 0x222222,
    emissiveMap: new THREE.TextureLoader().load('./assets/moon/moon.jpg'),
});
const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
moonMesh.scale.set(.5, .5, .5);
moonOrbit.add(moonMesh);
objects.push(moonMesh);

const camera = new THREE.PerspectiveCamera(45, 800 / 600);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

// Pour la mise à jour
const stats = new Stats();
document.body.appendChild(stats.dom);
stats.update();

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

//Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const gridHelper = new THREE.GridHelper(25, 25);
scene.add(gridHelper);

const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
sunMesh.add(pointLight);
const gui = new GUI({ autoPlace: false });
document.getElementById('vitesse').appendChild(gui.domElement);

const rotationSpeed = {
    sun: 0.01,
    earth: 0.01,
    moon: 0.01
};

const visibility = {
    sun: true,
    earth: true,
    moon: true,
    gridHelper: true,
    helpers: false
};

gui.add(rotationSpeed, 'sun', 0, 0.4, 0.01).name('Sun Rotation Speed');
gui.add(rotationSpeed, 'earth', 0, 0.4, 0.01).name('Earth Rotation Speed');
gui.add(rotationSpeed, 'moon', 0, 0.4, 0.01).name('Moon Rotation Speed');

gui.add(visibility, 'sun').name('Sun Visible').onChange(value => sunMesh.visible = value);
gui.add(visibility, 'earth').name('Earth Visible').onChange(value => earthMesh.visible = value);
gui.add(visibility, 'moon').name('Moon Visible').onChange(value => moonMesh.visible = value);
gui.add(visibility, 'gridHelper').name('Grid Helper Visible').onChange(value => gridHelper.visible = value);

const helpers = {
    sun: new THREE.AxesHelper(3),
    earth: new THREE.AxesHelper(2),
    moon: new THREE.AxesHelper(1),
    scene: new THREE.AxesHelper(5),
    polarGrid: new THREE.PolarGridHelper(10, 16)
};

sunMesh.add(helpers.sun);
earthMesh.add(helpers.earth);
moonMesh.add(helpers.moon);
scene.add(helpers.scene);

Object.values(helpers).forEach(helper => helper.visible = visibility.helpers);
gui.add(visibility, 'helpers').name('Helpers Visible').onChange(value => {
    Object.values(helpers).forEach(helper => helper.visible = value);
});

function animate() {
    requestAnimationFrame(animate);
    solarSystem.rotation.y += rotationSpeed.sun;
    earthOrbit.rotation.y += rotationSpeed.earth;
    moonOrbit.rotation.y += rotationSpeed.moon;
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}

animate();
