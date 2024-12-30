let scene, camera, renderer, controls;
let meshes = [], lights = [];
let clock = new THREE.Clock();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1445, 0.001);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 30, 40);
    camera.lookAt(0, 0, 0);

    // Renderer setup with improved settings
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('services-canvas'),
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Controls with improved settings
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 20;
    controls.maxDistance = 100;

    createEnvironment();
    createServiceIcons();
    createAdvancedLighting();
    addAtmosphericEffects();

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function createEnvironment() {
    // Ground with realistic materials
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.1,
        clearcoat: 0.1,
        clearcoatRoughness: 0.2,
        reflectivity: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Enhanced grid with fade effect
    const gridHelper = new THREE.GridHelper(200, 40, 0x4CAF50, 0x4CAF50);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

function createServiceIcons() {
    // Commercial Building with enhanced details
    const createCommercialBuilding = () => {
        const group = new THREE.Group();
        
        // Glass material with realistic properties
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
            envMapIntensity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.1
        });

        // Base structure
        const baseGeometry = new THREE.BoxGeometry(8, 20, 8);
        const base = new THREE.Mesh(baseGeometry, glassMaterial);
        base.position.y = 10;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        // Add detailed windows
        for(let y = 0; y < 10; y++) {
            for(let x = -2; x <= 2; x++) {
                const windowGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
                const windowMaterial = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    metalness: 1,
                    roughness: 0,
                    transmission: 0.9,
                    thickness: 0.1
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(x * 1.5, y * 2 + 2, 4.1);
                group.add(window);
            }
        }

        return group;
    };

    // Residential House with enhanced details
    const createHouse = () => {
        const group = new THREE.Group();

        // Main structure with realistic materials
        const bodyGeometry = new THREE.BoxGeometry(10, 6, 8);
        const brickMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xcc8866,
            roughness: 0.9,
            metalness: 0.1,
            clearcoat: 0.1,
            clearcoatRoughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, brickMaterial);
        body.position.y = 3;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Detailed roof
        const roofGeometry = new THREE.ConeGeometry(7, 5, 4);
        const roofMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x885533,
            roughness: 0.7,
            metalness: 0.2,
            clearcoat: 0.3
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 8.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        // Add windows and door
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.1
        });

        // Windows
        for(let x = -1; x <= 1; x += 2) {
            const windowGeometry = new THREE.BoxGeometry(1.5, 2, 0.1);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(x * 3, 3, 4.1);
            group.add(window);
        }

        return group;
    };

    // Position and add the buildings
    const commercial = createCommercialBuilding();
    commercial.position.set(-20, 0, 0);
    scene.add(commercial);
    meshes.push(commercial);

    const residential = createHouse();
    residential.position.set(20, 0, 0);
    scene.add(residential);
    meshes.push(residential);
}

function createAdvancedLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Main sun light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Accent lights with different colors
    const colors = [
        { color: 0x4CAF50, intensity: 2, distance: 30 },
        { color: 0x2196F3, intensity: 2, distance: 30 },
        { color: 0xFF4081, intensity: 2, distance: 30 }
    ];

    colors.forEach((config, index) => {
        const light = new THREE.PointLight(config.color, config.intensity, config.distance);
        const angle = (index / colors.length) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 30,
            15,
            Math.sin(angle) * 30
        );
        scene.add(light);
        lights.push(light);

        // Add light helper sphere
        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: config.color })
        );
        lightSphere.position.copy(light.position);
        scene.add(lightSphere);
    });
}

function addAtmosphericEffects() {
    // Enhanced particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 2000;
    const posArray = new Float32Array(particlesCnt * 3);
    const colors = new Float32Array(particlesCnt * 3);

    for(let i = 0; i < particlesCnt * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
        colors[i] = Math.random() * 0.5 + 0.5; // Brighter colors
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Smooth rotation for buildings
    meshes.forEach((mesh, index) => {
        mesh.rotation.y = Math.sin(time * 0.2 + index) * 0.1;
    });

    // Dynamic light movement
    lights.forEach((light, index) => {
        const angle = time * 0.5 + (index * Math.PI * 2 / lights.length);
        light.position.x = Math.cos(angle) * 30;
        light.position.z = Math.sin(angle) * 30;
        // Update light helper positions
        light.parent.children[index + 1].position.copy(light.position);
    });

    controls.update();
    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', init); 