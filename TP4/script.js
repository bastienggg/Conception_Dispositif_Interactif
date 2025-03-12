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
// Change background color to gray
scene.background = new THREE.Color(0x808080);

// Add ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate the ground to be horizontal
ground.position.y = -2.7; // Adjust position to be below the figure
ground.receiveShadow = true; // Enable shadows for the ground
scene.add(ground);

// Add fog to the scene
// scene.fog = new THREE.Fog(0x808080, 10, 50);

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
        this.group.position.y = this.params.y;
        this.group.position.z = this.params.z;

        // Material with fixed colors
        this.headMaterial = new THREE.MeshLambertMaterial({ color: 0xf1e4b1 });
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4d82ec });
        this.arms = [];
    }

    createBody() {
        this.body = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
        bodyMain.castShadow = true; // Enable shadows for the body

        this.body.add(bodyMain);
        this.group.add(this.body);

        this.createLegs();
    }

    createHead() {
        // Create a new group for the head
        this.head = new THREE.Group();

        // Create the main cube of the head and add to the group

        // const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);

        const geometry = new THREE.SphereGeometry(0.8, 32, 32);
        const headMain = new THREE.Mesh(geometry, this.headMaterial);
        headMain.castShadow = true; // Enable shadows for the head
        this.head.add(headMain);

        // Add the head group to the figure
        this.group.add(this.head);

        // Position the head group
        this.head.position.y = 1.65;

        // Add the eyes
        this.createEyes();
    }

    createAntennas() {
        const antennaHeight = 1.5; // Increase the height of the antennas
        const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, antennaHeight, 32);
        const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x44445c });

        for (let i = 0; i < 2; i++) {
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antenna.castShadow = true; // Enable shadows for the antennas
            const m = i % 2 === 0 ? 1 : -1;

            // Position the antenna relative to the head
            antenna.position.x = 0.3 * m;
            antenna.position.y = 0.5;

            // Rotate the antenna to be oriented slightly outward
            antenna.rotation.z = degreesToRadians(-15 * m);

            // Add the antenna to the head
            this.head.add(antenna);
        }
    }

    createArms() {
        const height = 0.85;

        for (let i = 0; i < 2; i++) {
            const armGroup = new THREE.Group();
            const geometry = new THREE.BoxGeometry(0.25, height, 0.25);
            const arm = new THREE.Mesh(geometry, this.headMaterial);
            arm.castShadow = true; // Enable shadows for the arms
            const m = i % 2 === 0 ? 1 : -1;

            // Add arm to group
            armGroup.add(arm);

            // Add group to figure
            this.body.add(armGroup);

            // Translate the arm by half the height
            arm.position.y = height * -0.5;

            // Position the arm relative to the figure
            armGroup.position.x = m * 0.8;
            armGroup.position.y = 0.6;

            // Rotate the arm
            armGroup.rotation.z = degreesToRadians(30 * m);

            // Push to the array
            this.arms.push(armGroup);
        }
    }

    createEyes() {
        const eyes = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.15, 12, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

        for (let i = 0; i < 2; i++) {
            const eye = new THREE.Mesh(geometry, material);
            const m = i % 2 === 0 ? 1 : -1;

            eyes.add(eye);
            eye.position.x = 0.36 * m;
        }

        this.head.add(eyes);

        eyes.position.y = -0.1;
        eyes.position.z = 0.7;
    }

    createButtons() {
        const buttons = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color: 0x4d82ec });

        for (let i = 0; i < 2; i++) {
            const button = new THREE.Mesh(geometry, material);
            button.castShadow = true; // Enable shadows for the buttons
            buttons.add(button);
            button.position.x = -0.25 + i * 0.5; // Increase the horizontal spacing between the buttons
        }

        this.body.add(buttons);
        buttons.position.y = 0.42; // Adjust the vertical position of the buttons
        buttons.position.z = 0.55; // Position the buttons in front of the body
    }


    createButtons2() {
        const buttons = new THREE.Group();
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color: 0x4d82ec });

        for (let i = 0; i < 2; i++) {
            const button = new THREE.Mesh(geometry, material);
            button.castShadow = true; // Enable shadows for the buttons
            buttons.add(button);
            button.position.x = -0.25 + i * 0.5; // Increase the horizontal spacing between the buttons
        }

        this.body.add(buttons);
        buttons.position.y = -0.42; // Adjust the vertical position of the buttons
        buttons.position.z = -0.5; // Position the buttons in front of the body
    }

    createLegs() {
        const legs = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25);

        for (let i = 0; i < 2; i++) {
            const leg = new THREE.Mesh(geometry, this.headMaterial);
            leg.castShadow = true; // Enable shadows for the legs
            const m = i % 2 === 0 ? 1 : -1;

            legs.add(leg);
            leg.position.x = m * 0.22;
        }

        this.group.add(legs);
        legs.position.y = -1.15;

        this.body.add(legs);
    }

    update() {
        this.group.rotation.y = this.params.ry;
        this.group.position.y = this.params.y;
        this.arms.forEach((arm, index) => {
            const m = index % 2 === 0 ? 1 : -1;
            arm.rotation.z = this.params.armRotation * m;
        });
    }

    init() {
        this.createBody();
        this.createHead();
        this.createAntennas(); // Add antennas to the figure
        this.createArms();
        // this.createButtons()
        // this.createButtons2()
    }
}

const figure = new Figure();
figure.init();

// Create a GSAP timeline for the jump animation
const jumpTimeline = gsap.timeline({ paused: true });

jumpTimeline.to(figure.params, {
    y: 0,
    armRotation: degreesToRadians(90),
    duration: 0.25,
    ease: CustomEase.create("custom", "M0,0 C0.177,-0.888 0.335,0.455 0.46,0.632 0.609,0.843 0.818,1.001 1,1 "),
    yoyo: true,
    repeat: 1,
    onComplete: () => {
        figure.params.armRotation = 0; // Reset arm rotation after jump
    }
});


// Update figure position based on walk speed and direction
gsap.ticker.add(() => {
    if (figure.params.walking) {
        figure.params.x += figure.params.walkSpeed * Math.sin(figure.params.ry);
        figure.params.z += figure.params.walkSpeed * Math.cos(figure.params.ry);
    }
});

// Add event listener for the space key
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !jumpTimeline.isActive()) {
        jumpTimeline.restart();
    }
});

const keys = {};

window.addEventListener('keydown', (event) => {
    keys[event.code] = true;

    if (keys['ArrowLeft']) {
        gsap.to(figure.params, {
            ry: figure.params.ry + degreesToRadians(65),
            duration: 0.5,
            ease: "power1.out"
        });
    }
    if (keys['ArrowRight']) {
        gsap.to(figure.params, {
            ry: figure.params.ry - degreesToRadians(65),
            duration: 0.5,
            ease: "power1.out"
        });
    }
    if (keys['ArrowUp'] && !figure.params.walking) {
        figure.params.walking = true;
        walkTimeline.play();
    }
    if (event.code === 'Space' && !jumpTimeline.isActive()) {
        jumpTimeline.restart();
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.code] = false;

    if (event.code === 'ArrowUp' && figure.params.walking) {
        figure.params.walking = false;
        walkTimeline.pause();
    }
});

gsap.set(figure.params, {
    y: -1.5
});

// Add walk speed to figure parameters
figure.params.walkSpeed = 0.05;
figure.params.walking = false;
figure.params.armRotation = 0;

// Create a GSAP timeline for the walk animation
const walkTimeline = gsap.timeline({ paused: true, repeat: -1 });

walkTimeline.to(figure.params, {
    armRotation: degreesToRadians(45),
    duration: 0.25,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
}, 0);

// Update figure position based on walk speed and direction
gsap.ticker.add(() => {
    if (figure.params.walking) {
        figure.group.position.x += figure.params.walkSpeed * Math.sin(figure.params.ry);
        figure.group.position.z += figure.params.walkSpeed * Math.cos(figure.params.ry);
    }
});


// Create a GSAP timeline for the idle animation
const idleTimeline = gsap.timeline({ repeat: -1, yoyo: true });

idleTimeline.to(figure.head.children[1].children[0].scale, {
    y: 0.2,
    duration: 1,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1,
}, 0);

// Rotate the head slightly on the z-axis in the idle animation
idleTimeline.to(figure.head.rotation, {
    z: degreesToRadians(5),
    duration: 0.5,
    ease: "power1.inOut"
}, 0).to(figure.head.rotation, {
    z: degreesToRadians(-5),
    duration: 0.5,
    ease: "power1.inOut"
}, 0.5);

// Add event listener for shooting projectile
window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyF') {
        shootProjectile();
    }
});

const shootProjectile = () => {
    const projectileGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const projectileMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    projectile.castShadow = true;

    // Position the projectile at the right arm
    const rightArm = figure.arms[1];
    projectile.position.set(
        rightArm.position.x + figure.group.position.x,
        rightArm.position.y + figure.group.position.y,
        rightArm.position.z + figure.group.position.z
    );

    scene.add(projectile);

    // Animate the projectile
    gsap.to(projectile.position, {
        x: projectile.position.x + 40 * Math.sin(figure.params.ry),
        z: projectile.position.z + 40 * Math.cos(figure.params.ry),
        duration: 1,
        ease: "power1.inOut",
        onComplete: () => {
            scene.remove(projectile); // Remove the projectile after animation
        }
    });
};

// Pause idle animation when jumping
jumpTimeline.eventCallback("onStart", () => {
    idleTimeline.pause();
});

jumpTimeline.eventCallback("onComplete", () => {
    idleTimeline.resume();
});

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
