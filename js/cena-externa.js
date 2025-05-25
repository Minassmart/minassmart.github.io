// Configuração da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1a2a); // Cor azul escuro para céu noturno

// Configuração da câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

// Configuração do renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('scene-container').appendChild(renderer.domElement);

// Controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2;

// Iluminação ambiente noturna
const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
scene.add(ambientLight);

// Luz da lua
const moonLight = new THREE.DirectionalLight(0x555577, 0.3);
moonLight.position.set(5, 10, -5);
moonLight.castShadow = true;
scene.add(moonLight);

// Luzes da varanda (inicialmente desligadas)
const varandaLights = [];
const createVerandaLight = (x, z) => {
    const light = new THREE.PointLight(0xffaa44, 0, 3); // Intensidade 0 = desligada
    light.position.set(x, 2.2, z);
    light.castShadow = true;
    scene.add(light);
    
    // Criar uma pequena esfera para representar a luminária
    const bulbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const bulbMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffaa44,
        emissive: 0x000000 // Inicialmente sem emissão
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.copy(light.position);
    scene.add(bulb);

    return { light, bulb };
};

// Criar luzes da varanda
varandaLights.push(createVerandaLight(-2, -2));
varandaLights.push(createVerandaLight(0, -2));
varandaLights.push(createVerandaLight(2, -2));

// Criar a casa
function createHouse() {
    const house = new THREE.Group();

    // Paredes principais
    const wallsGeometry = new THREE.BoxGeometry(6, 3, 4);
    const wallsMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
    walls.position.y = 1.5;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Telhado
    const roofGeometry = new THREE.ConeGeometry(4.5, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x885533 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Varanda
    const verandaGeometry = new THREE.BoxGeometry(8, 0.2, 2);
    const verandaMaterial = new THREE.MeshStandardMaterial({ color: 0x996633 });
    const veranda = new THREE.Mesh(verandaGeometry, verandaMaterial);
    veranda.position.set(0, 0.1, -2);
    veranda.receiveShadow = true;
    house.add(veranda);

    // Pilares da varanda
    const createPillar = (x) => {
        const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, 1.1, -2);
        pillar.castShadow = true;
        house.add(pillar);
    };

    createPillar(-3.5);
    createPillar(-1.75);
    createPillar(0);
    createPillar(1.75);
    createPillar(3.5);

    return house;
}

// Adicionar a casa à cena
const house = createHouse();
scene.add(house);

// Criar o chão
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x225522 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Criar o relógio digital
function createDigitalClock() {
    const clockDiv = document.createElement('div');
    clockDiv.id = 'digital-clock';
    clockDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: 'Digital-7', monospace;
        font-size: 24px;
        z-index: 1000;
        text-shadow: 0 0 10px #00ff00;
        border: 1px solid #00ff00;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
    `;
    document.body.appendChild(clockDiv);
    return clockDiv;
}

const clockDisplay = createDigitalClock();

// Função para ligar as luzes da varanda
function turnOnVerandaLights() {
    varandaLights.forEach(({ light, bulb }) => {
        light.intensity = 1;
        bulb.material.emissive.setHex(0xffaa44);
        bulb.material.emissiveIntensity = 0.5;
    });
}

// Função para atualizar o relógio
let startTime = new Date();
startTime.setHours(17, 59, 30); // Começar em 17:59:30

function updateClock() {
    const now = new Date(startTime.getTime());
    now.setSeconds(now.getSeconds() + 1);
    startTime = now;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    // Verificar se chegou às 18:00:00
    if (hours === '18' && minutes === '00' && seconds === '00') {
        turnOnVerandaLights();
    }
}

// Animação
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Iniciar animação e relógio
animate();
setInterval(updateClock, 1000);

// Responsividade
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 