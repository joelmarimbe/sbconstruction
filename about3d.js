let scene, camera, renderer, controls;
let city = new THREE.Group();
let clock = new THREE.Clock();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1445, 0.0009);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 30, 50);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('city-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    createCity();
    createLighting();
    createEnvironment();

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function createBuilding(width, height, depth, x, z) {
    const building = new THREE.Group();

    // Main structure with improved materials
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xcccccc,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    building.add(mesh);

    // Enhanced windows with better glass effect
    const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 1,
        roughness: 0,
        transparent: true,
        opacity: 0.9,
        transmission: 0.9,
        thickness: 0.5,
        envMapIntensity: 2,
        clearcoat: 1
    });

    // Add random window lights
    const windowLightMaterial = new THREE.MeshBasicMaterial({
        color: 0xfff7e6,
        transparent: true,
        opacity: 0.9
    });

    for (let y = 2; y < height - 2; y += 3) {
        for (let x = -width / 2 + 1; x < width / 2; x += 2) {
            for (let z = -depth / 2 + 1; z < depth / 2; z += 2) {
                const windowGeom = new THREE.BoxGeometry(0.8, 1.5, 0.1);
                const windowMesh = new THREE.Mesh(
                    windowGeom,
                    Math.random() > 0.3 ? windowMaterial : windowLightMaterial
                );
                windowMesh.position.set(x, y, depth / 2);
                building.add(windowMesh);

                if (z === -depth / 2 + 1) {
                    const backWindow = windowMesh.clone();
                    backWindow.position.z = -depth / 2;
                    backWindow.rotation.y = Math.PI;
                    building.add(backWindow);
                }
            }
        }
    }

    building.position.set(x, 0, z);
    return building;
}

function createCity() {
    // Clear existing city
    while(city.children.length > 0) {
        city.remove(city.children[0]);
    }

    // Create buildings with varying heights and positions
    for (let x = -50; x <= 50; x += 15) {
        for (let z = -50; z <= 50; z += 15) {
            const height = Math.random() * 30 + 10;
            const width = Math.random() * 5 + 5;
            const depth = Math.random() * 5 + 5;
            const building = createBuilding(width, height, depth, x, z);
            city.add(building);
        }
    }

    scene.add(city);
}

function createLighting() {
    // Ambient light with warmer tone
    const ambientLight = new THREE.AmbientLight(0x404458, 0.4);
    scene.add(ambientLight);

    // Main sun light with shadows
    const sunLight = new THREE.DirectionalLight(0xfff0dd, 1.5);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Evening sky light (blue tone)
    const skyLight = new THREE.DirectionalLight(0x4477ff, 0.5);
    skyLight.position.set(-50, 100, -50);
    scene.add(skyLight);

    // Ground reflection light
    const groundLight = new THREE.DirectionalLight(0xffffff, 0.2);
    groundLight.position.set(0, -10, 0);
    scene.add(groundLight);

    // Accent lights for buildings
    const accentColors = [
        { color: 0x4CAF50, intensity: 3, distance: 50, height: 15 },
        { color: 0x2196F3, intensity: 3, distance: 50, height: 25 },
        { color: 0xFFC107, intensity: 3, distance: 50, height: 20 },
        { color: 0xFF4081, intensity: 3, distance: 50, height: 30 }
    ];

    accentColors.forEach((config, i) => {
        const light = new THREE.PointLight(
            config.color,
            config.intensity,
            config.distance,
            2 // Light decay
        );
        const angle = (i / accentColors.length) * Math.PI * 2;
        light.position.set(
            Math.cos(angle) * 40,
            config.height,
            Math.sin(angle) * 40
        );
        
        // Add light helper sphere
        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: config.color })
        );
        lightSphere.position.copy(light.position);
        
        scene.add(light);
        scene.add(lightSphere);
    });

    // Add volumetric light effect
    const fogColor = 0x0c1445;
    scene.fog = new THREE.FogExp2(fogColor, 0.0009);

    // Add hemisphere light for sky-ground color variation
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.5);
    scene.add(hemiLight);
}

function createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grid helper
    const grid = new THREE.GridHelper(500, 100, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Subtle building movement
    city.children.forEach((building, i) => {
        building.position.y = Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.1;
    });

    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', init); 