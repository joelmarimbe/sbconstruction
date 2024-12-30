let scene, camera, renderer, controls;
let meshes = [], lights = [];
let clock = new THREE.Clock();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1445, 0.0009);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 30, 40);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('contact-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    createScene();
    createLighting();
    createEnvironment();

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function createScene() {
    // Create floating envelope
    const envelopeGroup = new THREE.Group();
    
    // Envelope body
    const envelopeGeometry = new THREE.BoxGeometry(10, 7, 1);
    const envelopeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.5,
        roughness: 0.2,
        transmission: 0.1,
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1
    });
    const envelope = new THREE.Mesh(envelopeGeometry, envelopeMaterial);
    envelopeGroup.add(envelope);

    // Envelope flap
    const flapGeometry = new THREE.ConeGeometry(5, 7, 4);
    const flap = new THREE.Mesh(flapGeometry, envelopeMaterial);
    flap.rotation.z = Math.PI;
    flap.position.y = 3.5;
    envelopeGroup.add(flap);

    // Add floating animation
    gsap.to(envelopeGroup.position, {
        y: '+=1',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
    });

    // Create floating phone
    const phoneGroup = new THREE.Group();
    
    // Phone body
    const phoneGeometry = new THREE.BoxGeometry(4, 8, 0.4);
    const phoneMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1
    });
    const phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
    phoneGroup.add(phone);

    // Phone screen
    const screenGeometry = new THREE.BoxGeometry(3.6, 7.2, 0.1);
    const screenMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 1,
        roughness: 0,
        transmission: 0.5,
        thickness: 0.5
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.2;
    phoneGroup.add(screen);

    // Position phone
    phoneGroup.position.set(-15, 0, 0);
    gsap.to(phoneGroup.position, {
        y: '+=1.2',
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 0.5
    });

    // Create location marker
    const markerGroup = new THREE.Group();
    
    // Marker pin
    const pinGeometry = new THREE.ConeGeometry(2, 4, 32);
    const pinMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff4444,
        metalness: 0.7,
        roughness: 0.2,
        clearcoat: 1
    });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.position.y = 2;
    markerGroup.add(pin);

    // Marker base
    const baseGeometry = new THREE.SphereGeometry(2, 32, 32, 0, Math.PI);
    const base = new THREE.Mesh(baseGeometry, pinMaterial);
    markerGroup.add(base);

    // Position marker
    markerGroup.position.set(15, 0, 0);
    gsap.to(markerGroup.position, {
        y: '+=1.5',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1
    });

    // Add all groups to scene
    scene.add(envelopeGroup);
    scene.add(phoneGroup);
    scene.add(markerGroup);
    
    meshes.push(envelopeGroup, phoneGroup, markerGroup);
}

function createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(50, 100, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    scene.add(mainLight);

    // Colored accent lights
    const colors = [
        { color: 0x4CAF50, pos: [30, 20, 30] },
        { color: 0x2196F3, pos: [-30, 20, 30] },
        { color: 0xFF4081, pos: [0, 20, -30] }
    ];

    colors.forEach(({ color, pos }) => {
        const light = new THREE.PointLight(color, 2, 50);
        light.position.set(...pos);
        scene.add(light);
        lights.push(light);
    });
}

function createEnvironment() {
    // Ground plane with reflection
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.4,
        clearcoat: 1,
        clearcoatRoughness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add subtle grid
    const grid = new THREE.GridHelper(200, 50, 0x000000, 0x000000);
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
    
    const time = clock.getElapsedTime();

    // Rotate meshes
    meshes.forEach((mesh, i) => {
        mesh.rotation.y = time * 0.2 + (i * Math.PI / 4);
    });

    // Animate lights
    lights.forEach((light, i) => {
        const angle = time * 0.5 + (i * Math.PI * 2 / lights.length);
        light.position.x = Math.cos(angle) * 30;
        light.position.z = Math.sin(angle) * 30;
    });

    controls.update();
    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', init); 