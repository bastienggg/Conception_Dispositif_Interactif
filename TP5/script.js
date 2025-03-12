import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

gsap.registerPlugin(CustomEase)

const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Helpers
const center = (group) => {
    new THREE.Box3().setFromObject(group).getCenter(group.position).multiplyScalar(-1);
    scene.add(group);
};

const random = (min, max, float = false) => {
    const val = Math.random() * (max - min) + min;

    if (float) {
        return val;
    }

    return Math.floor(val);
};

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: set shadow map type

const render = () => {
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera);
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
});
scene.background = new THREE.Color(0x808080);

// Add ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate the ground to be horizontal
ground.position.y = -1.5; // Adjust position to be below the figure
ground.receiveShadow = true; // Enable shadows for the ground
scene.add(ground);

// Material
const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

// Lighting
const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.5);
scene.add(lightAmbient);

const lightDirectional = new THREE.DirectionalLight(0xffffff, 0.8);
lightDirectional.castShadow = true; // Enable shadows for the light
scene.add(lightDirectional);

// Move the light source towards us
lightDirectional.position.set(5, 5, 5);

// Configure shadow properties for the directional light
lightDirectional.shadow.mapSize.width = 1024;
lightDirectional.shadow.mapSize.height = 1024;
lightDirectional.shadow.camera.near = 0.5;
lightDirectional.shadow.camera.far = 50;

// Figure
class Figure {
    constructor(params) {
        this.params = {
            x: 0,
            y: 0,
            z: 0,
            ry: 0,
            ...params
        };

        // Create group and add to scene
        this.group = new THREE.Group();
        scene.add(this.group);

        // Position according to params
        this.group.position.x = this.params.x;
        this.group.position.set(this.params.x, this.params.y, this.params.z);
        this.group.position.z = this.params.z;

        // Material with fixed colors
        this.headMaterial = new THREE.MeshLambertMaterial({ color: 0xf1e4b1 });
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4d82ec });
        this.legs = [];
    }

    createBody() {
        this.body = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1.5, 3);
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
        bodyMain.castShadow = true; // Enable shadows for the body

        // Position the body relative to the figure
        bodyMain.position.z = -1;

        this.body.add(bodyMain);
        this.group.add(this.body);

        this.createLegs();
    }

    createHead() {
        // Create a new group for the head
        this.head = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.75, 1, 1);
        const headMain = new THREE.Mesh(geometry, this.headMaterial);
        headMain.castShadow = true; // Enable shadows for the head

        // Position the head relative to the body
        headMain.position.y = 1.25;

        this.head.add(headMain);
        this.body.add(this.head);

    }

    createEyes() {
        const eyes = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

        for (let i = 0; i < 2; i++) {
            const eye = new THREE.Mesh(geometry, material);
            eye.castShadow = true; // Enable shadows for the eyes
            eyes.add(eye);
            eye.position.x = -0.15 + i * 0.3;
        }

        this.head.add(eyes);

        eyes.position.y = 1.25; // Adjust the vertical position of the eyes
        eyes.position.z = 0.4; // Position the eyes in front of the head
    }

    createEyes2() {
        const eyes = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.2);
        const material = new THREE.MeshLambertMaterial({ color: 0x000000 });

        for (let i = 0; i < 2; i++) {
            const eye = new THREE.Mesh(geometry, material);
            eye.castShadow = true; // Enable shadows for the eyes
            eyes.add(eye);
            eye.position.x = -0.1 + i * 0.2;
        }

        this.head.add(eyes);

        eyes.position.y = 1.2; // Adjust the vertical position of the eyes
        eyes.position.z = 0.45; // Position the eyes in front of the head
        eyes.position.x = 0; // Position the eyes in front of the head
    }

    createMouth() {
        const mouthGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.1);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.castShadow = true; // Enable shadows for the mouth

        // Position the mouth relative to the head
        mouth.position.y = 0.9;
        mouth.position.z = 0.5;

        this.head.add(mouth);
    }

    createEars() {
        const ears = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.2, 0.4, 0.1);
        const material = new THREE.MeshLambertMaterial({ color: 0x4d82ec });

        for (let i = 0; i < 2; i++) {
            const ear = new THREE.Mesh(geometry, material);
            ear.castShadow = true; // Enable shadows for the ears
            ears.add(ear);
            ear.position.x = -0.35 + i * 0.7;
        }

        this.head.add(ears);

        ears.position.y = 1.8; // Adjust the vertical position of the ears
        ears.position.z = 0.2; // Position the ears in front of the head    
    }

    createLegs() {
        const legs = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.25, 0.8, 0.25); // Increase the height of the legs

        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(geometry, this.headMaterial);
            leg.castShadow = true; // Enable shadows for the legs
            const m = i % 2 === 0 ? 1 : -1;

            legs.add(leg);
            leg.position.x = m * 0.3; // Increase the distance between the legs
            leg.position.z = i < 2 ? -1 : 1; // Position front and back legs
            this.legs.push(leg);
        }

        this.group.add(legs);
        legs.position.y = -1.1; // Adjust the vertical position of the legs
        legs.position.z = -1; // Position the legs relative to the body

        this.body.add(legs);
    }

    update() {
        this.group.rotation.y = this.params.ry;
        this.group.position.y = this.params.y;
        this.group.position.z = this.params.z; // Update x position
        this.legs.forEach((leg, index) => {
            const m = index % 2 === 0 ? 1 : -1;
            leg.rotation.x = Math.sin(Date.now() * 0.005 + index) * 0.5 * m;
        });
    }


    init() {
        this.createBody();
        this.createHead();
        this.createEyes();
        this.createEyes2();
        this.createMouth();
        this.createEars();
    }
}

const figure = new Figure();
figure.init();

figure.params.walkSpeed = 0.05;
figure.params.walking = true; // Set walking to true by default
figure.params.armRotation = 0;
figure.params.rotationSpeed = 0.01; // Add rotation speed parameter

figure.walk = function () {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    this.legs.forEach((leg, index) => {
        const m = index % 2 === 0 ? 1 : -1;
        tl.to(leg.rotation, {
            x: degreesToRadians(45 * m),
            duration: 0.25,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true
        }, 0); // Start all animations at the same time
    });

    const move = () => {
        const targetX = random(-25, 25, true);
        const targetZ = random(-25, 25, true);
        const distance = Math.sqrt(Math.pow(targetX - this.group.position.x, 2) + Math.pow(targetZ - this.group.position.z, 2));
        const duration = distance / 4; // Increase speed by reducing duration

        gsap.to(this.group.position, {
            x: targetX,
            z: targetZ,
            duration: duration,
            ease: "power1.inOut",
            onUpdate: () => {
                const dx = targetX - this.group.position.x;
                const dz = targetZ - this.group.position.z;
                this.group.rotation.y = Math.atan2(dx, dz);
            },
            onComplete: () => {
                // Add a slight rotation before moving again
                gsap.to(this.group.rotation, {
                    y: "+=0.5",
                    duration: 0.5,
                    ease: "power1.inOut",
                    onComplete: move
                });
            }
        });
    };

    move();
};

figure.walk();

gsap.ticker.add(() => {
    figure.update();
    controls.update(); // Update controls
    render();
});


// Stats
const stats = Stats();
document.body.appendChild(stats.dom);

const animate = () => {
    stats.begin();
    // monitored code goes here
    stats.end();
    requestAnimationFrame(animate);
};

animate();
