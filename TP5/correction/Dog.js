import * as THREE from 'three';

export default class Dog extends THREE.Group {
    constructor(params) {
        super();
        this.params = {
            x: 0,
            y: 1.3,
            z: 0,
            ry: 0,
            headRotation: 0,
            leftEyeScale: 0.8,
            walkRotation: 0,
            bodyRotation: 0,
        };
        this.position.x = this.params.x;
        this.position.y = this.params.y;
        this.position.z = this.params.z;
        this.headHue = random(0, 360);
        this.bodyHue = random(0, 360);
        this.headLightness = random(40, 65);
        this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` });
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` });
        this.legs = [];
        this.jumpingUp = true;
    }

    createBody() {
        this.body = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1, 2);
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
        bodyMain.castShadow = true;
        this.body.add(bodyMain);
        this.add(this.body);
    }

    createHead() {
        this.head = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.8, 1, 0.8);
        const headMain = new THREE.Mesh(geometry, this.headMaterial);
        headMain.castShadow = true;
        this.head.add(headMain);
        this.add(this.head);
        this.head.position.y = 1.05;
        this.head.position.z = 0.65;
        this.createEyesAndSnout();

        // Ears
        const earGeometry = new THREE.BoxGeometry(0.25, 0.35, 0.05); // Customize the size as needed
        const ear1 = new THREE.Mesh(earGeometry, this.bodyMaterial);
        const ear2 = new THREE.Mesh(earGeometry, this.bodyMaterial);

        // Position and rotate the antennas
        ear1.position.set(0.25, 0.7, 0.2); // Adjust the positions
        ear2.position.set(-0.25, 0.7, 0.2); // Adjust the positions

        // Add the antennas to the head
        this.head.add(ear1);
        this.head.add(ear2);
    }

    createEyesAndSnout() {
        const eyes = new THREE.Group();
        const geometryEye = new THREE.BoxGeometry(0.15, 0.15, 0.05);
        const materialDark = new THREE.MeshLambertMaterial({ color: 0x44445c });
        const materialClear = new THREE.MeshLambertMaterial({ color: 0xeeeeec });
        for (let i = 0; i < 2; i++) {
            // Dark part
            const eyeDark = new THREE.Mesh(geometryEye, materialDark);
            const m = i % 2 === 0 ? 1 : -1;
            eyes.add(eyeDark);
            eyeDark.position.x = 0.23 * m;
            eyeDark.scale.set(0.8, 0.8, 0.1);
            // Store leftEye for idle animation
            if ((m == 1) && (i == 0)) this.leftEye = eyeDark;
            // Clear part
            const eyeClear = new THREE.Mesh(geometryEye, materialClear);
            eyes.add(eyeClear);
            eyeClear.position.x = 0.23 * m;
            eyeClear.position.z = -0.05;
            eyeClear.scale.set(1.5, 1.5, 1);
        }
        this.head.add(eyes);
        eyes.position.y = 0.25;
        eyes.position.z = 0.5;

        // Snout
        const geometrySnout = new THREE.BoxGeometry(0.65, 0.2, 0.2);
        const snoutTop = new THREE.Mesh(geometrySnout, this.bodyMaterial);
        this.head.add(snoutTop);
        snoutTop.position.z = 0.5;
        snoutTop.position.y = -0.1;
        const snoutDown = new THREE.Mesh(geometrySnout, this.bodyMaterial);
        this.head.add(snoutDown);
        snoutDown.position.z = 0.5;
        snoutDown.position.y = -0.33;
        const truffle = new THREE.Mesh(geometrySnout, materialDark);
        this.head.add(truffle);
        truffle.scale.set(0.5, 0.5, 0.5);
        truffle.position.z = 0.6;
        truffle.position.y = -0.02;
    }

    createLegs() {
        const legsGroup = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
        for (let i = 0; i < 2; i++) {
            const legFront = new THREE.Mesh(geometry, this.headMaterial);
            const m = i % 2 === 0 ? 1 : -1;
            legsGroup.add(legFront);
            legFront.position.x = m * 0.25;
            legFront.position.z = 0.8;
            const legBack = new THREE.Mesh(geometry, this.headMaterial);
            legsGroup.add(legBack);
            legBack.position.x = m * 0.25;
            legBack.position.z = -0.8;
            if (i == 0) {
                this.legs.push(legFront);
                this.legs.push(legBack);
            }
            else {
                this.legs.push(legBack);
                this.legs.push(legFront);
            }
        }
        this.add(legsGroup);
        legsGroup.position.y = -0.95;
        this.body.add(legsGroup);
    }

    update() {

        // Rotations
        this.rotation.set(0, 0, 0);
        this.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -this.params.bodyRotation);
        this.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.params.ry);

        // Vertical position
        this.position.y = this.params.y;
        // Ground position
        this.position.x = this.params.x;
        this.position.z = this.params.z;

        // Idle animation
        this.leftEye.scale.x = this.leftEye.scale.y = this.params.leftEyeScale;
        this.head.rotation.z = this.params.headRotation;

        // Legs animation (walk)
        this.legs.forEach((leg, index) => {
            const m = index % 2 === 0 ? 1 : -1;
            leg.rotation.x = this.params.walkRotation * m;
        });


    }

    init() {
        this.createBody();
        this.createHead();
        this.createLegs();
    }
}