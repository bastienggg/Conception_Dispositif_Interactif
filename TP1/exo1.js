import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



// Scene
const scene = new THREE.Scene();
// la variable scene est un objet de la classe Scene qui contient tous les objets de la scène

// const loader = new THREE.TextureLoader();
// loader.load('./assets/map2.png', function (texture) {
//     scene.background = texture;
// });


// Sphere
// const geometry = new THREE.SphereGeometry(3, 50, 50);
const geometry = new THREE.TorusKnotGeometry(3, 1, 100, 16);
const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    // flatShading: true
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);


// Light
// const light = new THREE.PointLight(0xffffff, 1, 100);
// light.position.set(0, 10, 10);
// scene.add(light);


const aLight = new THREE.AmbientLight(0x151515);
scene.add(aLight);
// scene.add(new THREE.PointLightHelper(aLight));

//spot qui clignote
const spotLights = [];
const numLights = 15;
for (let i = 0; i < numLights; i++) {
    const light = new THREE.SpotLight(Math.random() * 0xffffff, 20, 200); // Increased intensity to 20 and distance to 200
    light.position.set(
        Math.random() * 100 - 50, // Increased range for x position
        Math.random() * 100 - 50, // Increased range for y position
        Math.random() * 100 - 50  // Increased range for z position
    );
    light.target = mesh; // Make the spotlight target the mesh
    const helper = new THREE.SpotLightHelper(light);
    scene.add(helper);

    scene.add(light);
    // scene.add(new THREE.SpotLightHelper(light));
    spotLights.push(light);
    setInterval(() => {
        light.visible = !light.visible;
    }, Math.random() * 100 + 10);
}



// Camera
const camera = new THREE.PerspectiveCamera(45, 800 / 600);
camera.position.z = 20;
scene.add(camera);



// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.render(scene, camera);

//Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
});


// Animation
const loop = () => {
    //rotation sphere
    mesh.rotation.y += 0.01;
    mesh.rotation.x += 0.01;


    //rotation lumière
    // light.position.x += 0.10;
    // light.position.x = 10 * Math.cos(Date.now() * 0.001);
    // light.position.z = 10 * Math.sin(Date.now() * 0.001);

    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
}
loop();

// Adding an additional ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

// OrbitControls pour controler la shperes
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
const loop2 = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
}
loop2();


// GSAP animation for mesh appearance
gsap.fromTo(mesh.scale,
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1, duration: 2, ease: "elastic.out(1, 0.3)" }
);

window.addEventListener("mousedown", (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    const color = new THREE.Color(x, y, 1 - x);
    gsap.to(mesh.material.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 1
    });
});

// scene.add(new THREE.AxesHelper(10));
// scene.add(new THREE.PointLightHelper(light));
// scene.add(new THREE.GridHelper(10, 15));