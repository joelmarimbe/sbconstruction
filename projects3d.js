let scene, camera, renderer, controls;
let buildings = [], lights = [];
let clock = new THREE.Clock();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1445, 0.001);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 30, 50);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('projects-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 20;
    controls.maxDistance = 100;

    createEnvironment();
    createBuildings();
    createLights();
    addAtmosphericEffects();

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

function createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI * 0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
}

function createBuildings() {
    // Burj Khalifa inspired tower
    const createMainTower = () => {
        const height = 40;
        const geometry = new THREE.CylinderGeometry(0.5, 2, height, 6);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9,
            envMapIntensity: 1
        });
        const tower = new THREE.Mesh(geometry, material);
        tower.position.set(0, height/2, 0);
        tower.castShadow = true;
        tower.receiveShadow = true;
        scene.add(tower);
        buildings.push(tower);

        // Add spire
        const spireGeometry = new THREE.CylinderGeometry(0.2, 0.5, 10, 6);
        const spire = new THREE.Mesh(spireGeometry, material);
        spire.position.y = height + 5;
        tower.add(spire);
    };

    // Modern twisted tower
    const createTwistedTower = (x, z) => {
        const height = 30;
        const segments = 30;
        const geometry = new THREE.CylinderGeometry(2, 2, height, 8, segments);
        const positions = geometry.attributes.position;

        // Apply twist
        for(let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const twist = (y + height/2) / height * Math.PI * 0.5;
            const x = positions.getX(i);
            const z = positions.getZ(i);
            positions.setXYZ(
                i,
                x * Math.cos(twist) - z * Math.sin(twist),
                y,
                x * Math.sin(twist) + z * Math.cos(twist)
            );
        }

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xccddff,
            metalness: 0.7,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const tower = new THREE.Mesh(geometry, material);
        tower.position.set(x, height/2, z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        scene.add(tower);
        buildings.push(tower);
    };

    // Create multiple buildings
    createMainTower();
    createTwistedTower(-15, 15);
    createTwistedTower(15, -15);
    createTwistedTower(-15, -15);
    createTwistedTower(15, 15);

    // Add smaller buildings
    for(let i = 0; i < 10; i++) {
        const height = Math.random() * 15 + 10;
        const geometry = new THREE.BoxGeometry(4, height, 4);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const building = new THREE.Mesh(geometry, material);
        const x = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 60;
        building.position.set(x, height/2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        buildings.push(building);
    }
}

function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Main directional light (sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(50, 50, 25);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    scene.add(mainLight);

    // Accent lights
    const colors = [0x4CAF50, 0x2196F3, 0xFF4081];
    colors.forEach((color, index) => {
        const light = new THREE.PointLight(color, 2, 50);
        const angle = (index / colors.length) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 30,
            15,
            Math.sin(angle) * 30
        );
        scene.add(light);
        lights.push(light);
    });
}

function addAtmosphericEffects() {
    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for(let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = Math.random() * 100 + 20;
        const z = (Math.random() - 0.5) * 200;
        starPositions.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Animate buildings
    buildings.forEach((building, index) => {
        building.rotation.y = Math.sin(time * 0.1 + index) * 0.02;
    });

    // Animate lights
    lights.forEach((light, index) => {
        const angle = time * 0.5 + (index * Math.PI * 2 / lights.length);
        light.position.x = Math.cos(angle) * 30;
        light.position.z = Math.sin(angle) * 30;
    });

    // Update controls
    controls.update();

    renderer.render(scene, camera);
}

// Initialize scene when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 