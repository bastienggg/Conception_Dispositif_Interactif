import * as THREE from 'three';

// Figure
export default class Figure extends THREE.Group {
    constructor(params) {
        super();
        this.params = {
            x: 0,
            y: 1.4,
            z: 0,
            ry: 0,
            armRotation: 0,
            headRotation: 0,
            leftEyeScale: 1,
            walkRotation: 0
        };

        // Position according to params
        this.position.x = this.params.x
        this.position.y = this.params.y
        this.position.z = this.params.z
        // this.group.rotation.y = this.params.ry
        // this.group.scale.set(5, 5, 5)

        // Material
        this.headHue = random(0, 360)
        this.bodyHue = random(0, 360)
        this.headLightness = random(40, 65)
        this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, ${this.headLightness}%)` })
        this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` })

        this.arms = [];
        this.legs = [];
    }

    createBody() {
        this.body = new THREE.Group()
        const geometry = new THREE.BoxGeometry(1, 1.5, 1)
        const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial);
        bodyMain.castShadow = true;

        this.body.add(bodyMain)
        this.add(this.body)

        this.createLegs()
    }

    createHead() {
        // Create a new group for the head
        this.head = new THREE.Group()

        // Create the main cube of the head and add to the group
        const geometry = new THREE.SphereGeometry(0.8, 32, 32);
        const headMain = new THREE.Mesh(geometry, this.headMaterial);
        headMain.castShadow = true;
        this.head.add(headMain)

        // Antennes
        const antenneGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
        const a1 = new THREE.Mesh(antenneGeom, this.headMaterial);
        a1.rotation.z = -Math.PI / 6;
        a1.position.set(0.55, 0.8, 0);
        this.head.add(a1);
        const a2 = new THREE.Mesh(antenneGeom, this.headMaterial);
        a2.rotation.z = Math.PI / 6;
        a2.position.set(-0.55, 0.8, 0);
        this.head.add(a2);

        // Add the head group to the figure
        this.add(this.head)

        // Position the head group
        this.head.position.y = 1.65

        // Add the eyes
        this.createEyes()
    }

    createArms() {
        const height = 0.85

        for (let i = 0; i < 2; i++) {
            const armGroup = new THREE.Group()
            const geometry = new THREE.BoxGeometry(0.25, height, 0.25)
            const arm = new THREE.Mesh(geometry, this.headMaterial);
            arm.castShadow = true;
            const m = i % 2 === 0 ? 1 : -1

            // Add arm to group
            armGroup.add(arm)

            // Add group to figure
            this.body.add(armGroup)

            // Translate the arm by half the height
            arm.position.y = height * -0.5

            // Position the arm relative to the figure
            armGroup.position.x = m * 0.8
            armGroup.position.y = 0.6

            // Rotate the arm
            armGroup.rotation.z = degreesToRadians(30 * m)

            // Push to the array
            this.arms.push(armGroup)
        }
    }

    createEyes() {
        const eyes = new THREE.Group()
        const geometry = new THREE.SphereGeometry(0.15, 12, 8)
        const material = new THREE.MeshLambertMaterial({ color: 0x44445c })

        for (let i = 0; i < 2; i++) {
            const eye = new THREE.Mesh(geometry, material)
            const m = i % 2 === 0 ? 1 : -1

            eyes.add(eye)
            eye.position.x = 0.36 * m
            if (m == 1) this.leftEye = eye;
        }

        this.head.add(eyes)

        eyes.position.y = -0.1
        eyes.position.z = 0.7
    }

    createLegs() {
        const legs = new THREE.Group()
        const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25)

        for (let i = 0; i < 2; i++) {
            const leg = new THREE.Mesh(geometry, this.headMaterial)
            const m = i % 2 === 0 ? 1 : -1
            leg.castShadow = true;
            legs.add(leg)
            leg.position.x = m * 0.22
            this.legs.push(leg);
        }

        this.add(legs)
        legs.position.y = -1.15

        this.body.add(legs)
    }

    update() {
        this.rotation.y = this.params.ry;
        this.position.y = this.params.y;
        this.position.x = this.params.x;
        this.position.z = this.params.z;

        this.arms.forEach((arm, index) => {
            const m = index % 2 === 0 ? 1 : -1
            arm.rotation.z = this.params.armRotation * m
            arm.rotation.x = this.params.walkRotation * m
        });
        this.legs.forEach((leg, index) => {
            const m = index % 2 === 0 ? 1 : -1;
            leg.rotation.x = this.params.walkRotation * -m
        });
        // Rotation tete
        this.head.rotation.z = this.params.headRotation;
        this.leftEye.scale.set(this.params.leftEyeScale, this.params.leftEyeScale, 
            this.params.leftEyeScale);
    }

    init() {
        this.createBody()
        this.createHead()
        this.createArms()
    }
}

const random = (min, max, float = false) => {
    const val = Math.random() * (max - min) + min

    if (float) {
        return val
    }

    return Math.floor(val)
}

const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180)
}