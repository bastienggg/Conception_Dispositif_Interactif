import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import Dog from './Dog.js';

const NUM_DOGS = 10;
let dogs = [];
let jumpTLs = [];
let walkTLs = [];
let rySpeeds = [];

gsap.registerPlugin(CustomEase);

const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);
const gridHelper = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Fog
scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

// Plane
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100, 10, 10),
	new THREE.MeshPhongMaterial({
		color: 0xFFFFFF,
	}));
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = false;
scene.add(plane);

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

const degreesToRadians = (degrees) => {
	return degrees * (Math.PI / 180)
}

// Helpers
const center = (group) => {
	new THREE.Box3().setFromObject(group).getCenter(group.position).multiplyScalar(-1)
	scene.add(group)
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;

const render = () => {
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	renderer.render(scene, camera)
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 8;
camera.position.y = 3;
scene.add(camera)

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	// Update camera
	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()
})

// Material
const material = new THREE.MeshLambertMaterial({ color: 0xffffff })

// Lighting
const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.5)
scene.add(lightAmbient)

// const lightDirectional = new THREE.DirectionalLight(0xffffff, 0.8)
// scene.add(lightDirectional)
// // Move the light source towards us
// lightDirectional.position.set(5, 5, 5)

// Light
let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(25, 50, 5);
light.target.position.set(0, 0, 0);
scene.add(light);
const dlHelper = new THREE.DirectionalLightHelper(light);
scene.add(dlHelper);
light.castShadow = true;


light.shadow.bias = -0.00001;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 5;
light.shadow.camera.far = 150;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
const camHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(camHelper);

for (let i = 0; i < NUM_DOGS; i++) {
	const dog = new Dog();
	dog.params.x = (Math.random() - 0.5) * 80;
	dog.params.z = (Math.random() - 0.5) * 80;
	dog.params.ry = Math.random() * Math.PI * 2;
	dog.init();
	scene.add(dog);
	dogs.push(dog);
	rySpeeds.push(0);

	// // Timeline pour le saut
	let jumpTL = gsap.timeline();
	document.addEventListener('keydown', (event) => {
		if ((event.key == ' ') && (!jumpTL.isActive())) {
			idleTL.pause(0);
			walkTL.pause(0);
			jumpTL.to(dog.params, {
				y: 5,
				repeat: 1,
				yoyo: true,
				duration: 0.5,
				ease: CustomEase.create("custom", "M0,0 C0.017,-0.107 0.053,-0.044 0.099,0.163 0.161,0.446 0.483,0.989 1,1 "),
			});
			jumpTL.to(dog.params, {
				bodyRotation: 2 * Math.PI,
				duration: 1,
				ease: "circ"
			}, "<");
			jumpTL.to(dog.params, {
				bodyRotation: 0,
				duration: 0
			}, ">");
		}
	});

	
}




// Rotation Y
let rySpeed = 0;
document.addEventListener('keydown', (event) => {
	if (event.key == 'ArrowLeft') {
		rySpeed += 0.25;
		idleTL.pause(0);
	}
	else if (event.key == 'ArrowRight') {
		rySpeed -= 0.25;
		idleTL.pause(0);
	}
});

// Vitesse de déplacement
let walkSpeed = 0;

let walkTL = gsap.timeline();
walkTL.to(dog.params, {
	walkRotation: degreesToRadians(45),
	repeat: 1,
	yoyo: true,
	duration: 0.15
});
walkTL.to(dog.params, {
	walkRotation: degreesToRadians(-45),
	repeat: 1,
	yoyo: true,
	duration: 0.15
}, ">");
walkTL.pause();


document.addEventListener('keydown', (event) => {
	if (event.key == 'ArrowUp') {
		walkSpeed += 0.035;
	}
	if (event.key == 'ArrowDown') {
		walkSpeed -= 0.035;
	}
});

gsap.set(dog.params, {
	y: 1.5
})

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Stats
const container = document.getElementById('container');
const stats = new Stats();
container.appendChild(stats.dom);

// Boucle d'animation
gsap.ticker.add(() => {
	dog.params.ry += rySpeed;
	rySpeed *= 0.93;

	walkSpeed *= 0.97;
	dog.params.x += walkSpeed * Math.sin(dog.params.ry);
	dog.params.z += walkSpeed * Math.cos(dog.params.ry);

	if (!walkTL.isActive() && !jumpTL.isActive && (walkSpeed > 0.041)) {
		idleTL.pause();
		walkTL.restart();
	}

	// console.log(rySpeed);
	if (!jumpTL.isActive() && !idleTL.isActive()
		&& (rySpeed < 0.01)
		&& (walkSpeed < 0.01))
		idleTL.restart();

	controls.update();
	stats.update();
	dog.update();
	render();
});

