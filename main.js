// Three.js Scene Setup
let scene, camera, renderer, clock;
let buildings = [], particles;

function init() {
    try {
        // Scene setup
        clock = new THREE.Clock();
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Enhanced renderer settings
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        
        // Camera position
        camera.position.set(0, 15, 30);
        camera.lookAt(0, 0, 0);

        // Add fog for depth
        scene.fog = new THREE.FogExp2(0x0c1445, 0.01);
        
        createLights();
        createCity();
        createParticles();
        createGrid();

        // Start animation
        animate();

    } catch (error) {
        console.error('Error initializing Three.js scene:', error);
    }
}

function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0x7c7c7c, 2);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Colored point lights for futuristic effect
    const colors = [0x4CAF50, 0x2196F3, 0xFF4081];
    colors.forEach((color, index) => {
        const light = new THREE.PointLight(color, 2, 20);
        light.position.set(
            Math.sin(index * Math.PI * 2 / 3) * 10,
            5,
            Math.cos(index * Math.PI * 2 / 3) * 10
        );
        scene.add(light);
    });
}

function createCity() {
    const buildingCount = 50;
    const cityRadius = 20;

    for (let i = 0; i < buildingCount; i++) {
        // Random building dimensions
        const height = Math.random() * 10 + 5;
        const width = Math.random() * 2 + 1;
        const depth = Math.random() * 2 + 1;

        // Create building geometry
        const geometry = new THREE.BoxGeometry(width, height, depth);
        
        // Create materials for building
        const materials = [
            new THREE.MeshPhongMaterial({
                color: 0x2A3B4C,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            }),
            new THREE.MeshPhongMaterial({
                color: 0x4CAF50,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            })
        ];

        // Create building mesh with both materials
        const building = new THREE.Mesh(geometry, materials[0]);
        const wireframe = new THREE.Mesh(geometry, materials[1]);
        
        // Position buildings in a circular pattern
        const angle = (i / buildingCount) * Math.PI * 2;
        const radius = Math.random() * cityRadius;
        building.position.x = Math.sin(angle) * radius;
        building.position.z = Math.cos(angle) * radius;
        building.position.y = height / 2;
        
        // Copy position for wireframe
        wireframe.position.copy(building.position);

        scene.add(building);
        scene.add(wireframe);
        buildings.push({ solid: building, wire: wireframe });
    }
}

function createParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = Math.random() * 30;
        positions[i + 2] = (Math.random() - 0.5) * 50;

        // Color
        colors[i] = Math.random();
        colors[i + 1] = Math.random();
        colors[i + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createGrid() {
    const size = 50;
    const divisions = 50;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x4CAF50, 0x2A3B4C);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Rotate camera around scene
    camera.position.x = Math.sin(time * 0.1) * 35;
    camera.position.z = Math.cos(time * 0.1) * 35;
    camera.lookAt(0, 0, 0);

    // Animate buildings
    buildings.forEach((building, index) => {
        building.solid.position.y = Math.sin(time + index) * 0.3 + building.solid.geometry.parameters.height / 2;
        building.wire.position.y = building.solid.position.y;
        
        building.wire.rotation.y = time * 0.2;
        building.solid.rotation.y = time * 0.2;
    });

    // Animate particles
    if (particles) {
        particles.rotation.y = time * 0.1;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);