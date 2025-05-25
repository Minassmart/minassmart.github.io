// Configuração inicial
const container = document.getElementById('tour-container') || document.createElement('div');
if (!container.id) {
    container.id = 'tour-container';
    document.body.appendChild(container);
}

// Configuração da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Fundo mais escuro

// Configuração da câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 3);

// Configuração do renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// Ajustar estilo do container
container.style.cssText = `
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    transition: height 0.3s ease;
    background-color: #9099b7;
`;

// Função para ajustar o tamanho do renderizador
function updateRendererSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 768;
    const isLandscape = width > height;

    if (isMobile) {
        if (isLandscape) {
            // Modo paisagem em mobile
            container.style.height = '100vh';
            container.style.width = '60vw';
            container.style.float = 'left';
        } else {
            // Modo retrato em mobile
            container.style.height = '65vh';
            container.style.width = '100vw';
            container.style.float = 'none';
        }
    } else {
        // Desktop
        container.style.height = '100vh';
        container.style.width = '100vw';
        container.style.float = 'none';
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

// Configuração inicial do renderizador
updateRendererSize();
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 10;
controls.minDistance = 2;

// Configuração da iluminação base
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Reduzir intensidade da luz ambiente
scene.add(ambientLight);

// Luz direcional principal mais suave
const directionalLight = new THREE.DirectionalLight(0xffd7b3, 0.5); // Luz mais quente e menos intensa
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Criação do chão
const floorGeometry = new THREE.PlaneGeometry(8, 8);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x654321, // Cor marrom para o piso
    roughness: 0.8,
    metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Criação das paredes
function createWall(width, height, depth, position, rotation) {
    const wallGeometry = new THREE.BoxGeometry(width, height, depth);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9099b7, // Cor azul-acinzentada
        roughness: 0.9,
        metalness: 0.1
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.copy(position);
    wall.rotation.copy(rotation);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    return wall;
}

// Paredes da sala
createWall(8, 4, 0.2, new THREE.Vector3(0, 2, -4), new THREE.Euler(0, 0, 0)); // Parede fundos
createWall(8, 4, 0.2, new THREE.Vector3(-4, 2, 0), new THREE.Euler(0, Math.PI / 2, 0)); // Parede esquerda
createWall(8, 4, 0.2, new THREE.Vector3(4, 2, 0), new THREE.Euler(0, -Math.PI / 2, 0)); // Parede direita

// Criação do tapete
function createCarpet() {
    const carpetGeometry = new THREE.PlaneGeometry(4, 3);
    const carpetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcd5c5c, // Vermelho terroso
        roughness: 0.8,
        metalness: 0.1
    });
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.01, -1.5);
    carpet.receiveShadow = true;
    scene.add(carpet);
}

// Criação do sofá
function createSofa() {
    const sofaGroup = new THREE.Group();

    // Base do sofá
    const baseGeometry = new THREE.BoxGeometry(2.5, 0.5, 1);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }); // Cor bege claro
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    sofaGroup.add(base);

    // Encosto
    const backGeometry = new THREE.BoxGeometry(2.5, 0.8, 0.3);
    const backMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.4, -0.35);
    back.castShadow = true;
    sofaGroup.add(back);

    // Almofadas
    const cushionColors = [0xffa07a, 0xffdab9, 0xffe4b5]; // Cores variadas para as almofadas
    for (let i = 0; i < 3; i++) {
        const cushionGeometry = new THREE.BoxGeometry(0.7, 0.2, 0.7);
        const cushionMaterial = new THREE.MeshStandardMaterial({ color: cushionColors[i] });
        const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        cushion.position.set((i - 1) * 0.8, 0.35, 0);
        cushion.castShadow = true;
        sofaGroup.add(cushion);
    }

    sofaGroup.position.set(0, 0.25, -2.5);
    scene.add(sofaGroup);
}

// Criação da poltrona
function createArmchair() {
    const chairGroup = new THREE.Group();

    // Base da poltrona
    const baseGeometry = new THREE.BoxGeometry(1.2, 0.5, 1);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 }); // Mesma cor do sofá
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.castShadow = true;
    chairGroup.add(base);

    // Encosto
    const backGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.3);
    const back = new THREE.Mesh(backGeometry, baseMaterial);
    back.position.set(0, 0.4, -0.35);
    back.castShadow = true;
    chairGroup.add(back);

    // Almofada
    const cushionGeometry = new THREE.BoxGeometry(1, 0.2, 0.8);
    const cushionMaterial = new THREE.MeshStandardMaterial({ color: 0xffa07a }); // Cor salmão
    const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
    cushion.position.set(0, 0.35, 0);
    cushion.castShadow = true;
    chairGroup.add(cushion);

    chairGroup.position.set(-2, 0.25, -2);
    chairGroup.rotation.y = Math.PI / 6; // Rotação leve
    scene.add(chairGroup);
}

// Criação dos quadros
function createPaintings() {
    const createPainting = (posX, posZ, size) => {
        const frameGroup = new THREE.Group();

        // Moldura
        const frameGeometry = new THREE.BoxGeometry(size.width, size.height, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3c2a });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        frameGroup.add(frame);

        // Tela (imagem)
        const canvasGeometry = new THREE.PlaneGeometry(size.width - 0.1, size.height - 0.1);
        const canvasMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x90ee90, // Verde claro para simular paisagem
            roughness: 0.5
        });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvas.position.z = 0.06;
        frameGroup.add(canvas);

        frameGroup.position.set(posX, 2, posZ);
        scene.add(frameGroup);
    };

    // Criar dois quadros
    createPainting(-2, -3.89, { width: 1.5, height: 1 });
    createPainting(2, -3.89, { width: 1.5, height: 1 });
}

// Criação das plantas
function createPlants() {
    const createPlant = (posX, posZ) => {
        const plantGroup = new THREE.Group();

        // Vaso
        const potGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.4, 12);
        const potMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.castShadow = true;
        plantGroup.add(pot);

        // Planta
        const plantGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        plant.position.y = 0.3;
        plant.castShadow = true;
        plantGroup.add(plant);

        plantGroup.position.set(posX, 0, posZ);
        scene.add(plantGroup);
    };

    // Criar plantas nos cantos
    createPlant(-3.5, -3.5);
    createPlant(3.5, -3.5);
}

// Função para criar luzes de destaque
function createSpotlight(x, y, z, color, intensity) {
    const spotlight = new THREE.SpotLight(color, intensity);
    spotlight.position.set(x, y, z);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.3;
    spotlight.decay = 1.5;
    spotlight.distance = 8;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 512;
    spotlight.shadow.mapSize.height = 512;
    return spotlight;
}

// Função para criar a sala
function createLivingRoom() {
    console.log('Criando sala...');
    
    // Configurar fundo
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Criar elementos básicos
    const floorGeometry = new THREE.PlaneGeometry(8, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Criar paredes com material mais reflexivo
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x9099b7,
        roughness: 0.5,
        metalness: 0.3
    });

    // Adicionar luzes de destaque
    const tvLight = createSpotlight(0, 2.5, -3.5, 0xff8c66, 0.8); // Luz laranja suave para TV
    scene.add(tvLight);

    const cornerLight1 = createSpotlight(-3.5, 2.5, -3.5, 0xffd7b3, 0.4); // Luz quente no canto
    scene.add(cornerLight1);

    const cornerLight2 = createSpotlight(3.5, 2.5, -3.5, 0xffd7b3, 0.4); // Luz quente no outro canto
    scene.add(cornerLight2);

    // Criar o restante dos elementos da sala
    createCarpet();
    createSofa();
    createArmchair();
    createPaintings();
    createPlants();
    createChandelier();
    tvObject = createTV();
    
    // Adicionar luzes coloridas com intensidade reduzida
    colorLights = createColorLights();
    colorLights.forEach(light => {
        light.intensity = 0.3;
    });

    // Ajustar câmera
    camera.position.set(0, 2, 3);
    controls.target.set(0, 1, -2);
    controls.update();
}

// Função para criar o lustre com iluminação mais suave
function createChandelier() {
    const chandelierGroup = new THREE.Group();
    chandelierGroup.name = 'chandelier';

    // Base central com material mais reflexivo
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xb8860b,
        metalness: 0.8,
        roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    chandelierGroup.add(base);

    // Luzes do lustre mais suaves
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 0.5;
        const z = Math.sin(angle) * 0.5;

        // Braço do lustre
        const armGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const arm = new THREE.Mesh(armGeometry, baseMaterial);
        arm.position.set(x, -0.2, z);
        arm.rotation.x = Math.PI / 4;
        arm.rotation.z = angle;
        chandelierGroup.add(arm);

        // Lâmpada com brilho suave
        const lightGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xfffafa,
            emissive: 0xfffafa,
            emissiveIntensity: 0.3
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(x * 1.2, -0.4, z * 1.2);
        chandelierGroup.add(light);

        // Luz pontual suave
        const pointLight = new THREE.PointLight(0xfffafa, 0.2, 3);
        pointLight.position.copy(light.position);
        chandelierGroup.add(pointLight);
    }

    chandelierGroup.position.set(0, 3.5, -2);
    scene.add(chandelierGroup);
}

// Criação da TV
function createTV() {
    const tvGroup = new THREE.Group();

    // Tela da TV
    const screenGeometry = new THREE.BoxGeometry(2, 1.2, 0.1);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        metalness: 0.8,
        roughness: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.castShadow = true;
    tvGroup.add(screen);

    // Tela de conteúdo (para mostrar o logo)
    const contentGeometry = new THREE.PlaneGeometry(1.95, 1.15);
    const contentCanvas = document.createElement('canvas');
    contentCanvas.width = 512;
    contentCanvas.height = 312;
    const ctx = contentCanvas.getContext('2d');

    // Configurar o canvas para o estado desligado inicial
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, contentCanvas.width, contentCanvas.height);

    const contentTexture = new THREE.CanvasTexture(contentCanvas);
    const contentMaterial = new THREE.MeshBasicMaterial({
        map: contentTexture,
        transparent: true
    });
    const content = new THREE.Mesh(contentGeometry, contentMaterial);
    content.position.z = 0.051;
    tvGroup.add(content);

    // Suporte da TV
    const mountGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.1);
    const mountMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a4a4a,
        metalness: 0.8,
        roughness: 0.2
    });
    const mount = new THREE.Mesh(mountGeometry, mountMaterial);
    mount.position.y = -0.5;
    mount.castShadow = true;
    tvGroup.add(mount);

    tvGroup.position.set(0, 2, -3.8);
    scene.add(tvGroup);

    // Função para atualizar o conteúdo da TV
    tvGroup.updateContent = function(isOn) {
        const ctx = contentCanvas.getContext('2d');
        if (isOn) {
            // Fundo laranja da marca
            ctx.fillStyle = '#ff5400';
            ctx.fillRect(0, 0, contentCanvas.width, contentCanvas.height);

            // Texto "MINAS SMART"
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('MINAS SMART', contentCanvas.width/2, contentCanvas.height/2);
        } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, contentCanvas.width, contentCanvas.height);
        }
        contentTexture.needsUpdate = true;
    };

    return tvGroup;
}

// Variáveis globais para os objetos interativos
let tvObject;
let curtainObjects = [];
let soundSystem;
let presenceSensors = [];
let colorLights = [];
let scenePresets = {
    cinema: {
        curtains: 'closed',
        lights: 'dim',
        tv: 'on',
        sound: 'surround'
    },
    festa: {
        curtains: 'open',
        lights: 'colorful',
        sound: 'party'
    },
    leitura: {
        curtains: 'half',
        lights: 'warm',
        sound: 'off'
    }
};

// Sistema de som ambiente
function createSoundSystem() {
    const geometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const material = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
    
    // Criar caixas de som
    const speakers = [];
    const positions = [
        { x: -3.5, y: 1.2, z: -3.8 },
        { x: 3.5, y: 1.2, z: -3.8 },
        { x: -3.5, y: 1.2, z: 3.8 },
        { x: 3.5, y: 1.2, z: 3.8 }
    ];

    positions.forEach(pos => {
        const speaker = new THREE.Mesh(geometry, material);
        speaker.position.set(pos.x, pos.y, pos.z);
        scene.add(speaker);
        speakers.push(speaker);
    });

    return {
        speakers: speakers,
        isPlaying: false,
        visualizer: createAudioVisualizer()
    };
}

// Visualizador de áudio
function createAudioVisualizer() {
    const bars = [];
    const barCount = 20;
    const barGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.05);
    const barMaterial = new THREE.MeshPhongMaterial({ color: 0xff5400 });

    for (let i = 0; i < barCount; i++) {
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(-2 + (i * 0.2), 1.2, -3.7);
        scene.add(bar);
        bars.push(bar);
    }

    return bars;
}

// Sensores de presença
function createPresenceSensors() {
    const sensorGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const sensorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });

    const sensorPositions = [
        { x: -3.8, y: 2.5, z: -3.8 },
        { x: 3.8, y: 2.5, z: -3.8 },
        { x: -3.8, y: 2.5, z: 3.8 },
        { x: 3.8, y: 2.5, z: 3.8 }
    ];

    sensorPositions.forEach(pos => {
        const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        sensor.position.set(pos.x, pos.y, pos.z);
        scene.add(sensor);
        presenceSensors.push({
            mesh: sensor,
            active: false,
            detectionRadius: new THREE.Mesh(
                new THREE.SphereGeometry(1, 32, 32),
                new THREE.MeshPhongMaterial({
                    color: 0x00ff00,
                    transparent: true,
                    opacity: 0.1
                })
            )
        });
    });
}

// Luzes coloridas
function createColorLights() {
    // Limpar luzes existentes
    colorLights.forEach(light => {
        if (light.parent) {
            light.parent.remove(light);
        }
    });
    colorLights = [];

    // Posições das luzes
    const positions = [
        { x: -2, y: 2.8, z: 0 },
        { x: 2, y: 2.8, z: 0 },
        { x: 0, y: 2.8, z: -2 },
        { x: 0, y: 2.8, z: 2 }
    ];

    // Criar novas luzes
    positions.forEach(pos => {
        const light = new THREE.SpotLight(0xffffff, 0.5);
        light.position.set(pos.x, pos.y, pos.z);
        light.angle = Math.PI / 6;
        light.penumbra = 0.2;
        light.decay = 2;
        light.distance = 5;
        light.castShadow = true;

        // Adicionar alvo para a luz
        const target = new THREE.Object3D();
        target.position.set(pos.x, 0, pos.z);
        scene.add(target);
        light.target = target;

        // Adicionar helper visual (apenas em desenvolvimento)
        // const helper = new THREE.SpotLightHelper(light);
        // scene.add(helper);

        scene.add(light);
        colorLights.push(light);
    });

    return colorLights;
}

function updateColorLights(color) {
    colorLights.forEach(light => {
        light.color.set(color);
    });
}

let colorCycleInterval = null;

function startColorCycle() {
    if (colorCycleInterval) return;

    colorCycleInterval = setInterval(() => {
        const time = Date.now() * 0.001;
        colorLights.forEach((light, index) => {
            const hue = (time + index * 0.5) % 1;
            light.color.setHSL(hue, 1, 0.5);
        });
    }, 50);
}

function stopColorCycle() {
    if (colorCycleInterval) {
        clearInterval(colorCycleInterval);
        colorCycleInterval = null;
        updateColorLights(0xffffff);
    }
}

// Cortinas
function createCurtains() {
    const curtainGeometry = new THREE.PlaneGeometry(2, 3);
    const curtainMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        side: THREE.DoubleSide
    });

    const curtainPositions = [
        { x: -3.9, y: 1.5, z: -2, rotation: 0 },
        { x: -3.9, y: 1.5, z: 0, rotation: 0 },
        { x: -3.9, y: 1.5, z: 2, rotation: 0 }
    ];

    curtainPositions.forEach(pos => {
        const curtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
        curtain.position.set(pos.x, pos.y, pos.z);
        curtain.rotation.y = pos.rotation;
        scene.add(curtain);
        curtainObjects.push({
            mesh: curtain,
            state: 'open',
            targetRotation: 0
        });
    });
}

// Atualizar a função createObjects
function createObjects() {
    createCarpet();
    createSofa();
    createArmchair();
    createPaintings();
    createPlants();
    createChandelier();
    tvObject = createTV();
    soundSystem = createSoundSystem();
    createPresenceSensors();
    createColorLights();
    createCurtains();
}

// Criação dos objetos
createObjects();

// Pontos interativos
const interactivePoints = [
    {
        position: new THREE.Vector3(0, 1, -2.5),
        name: 'Sofá',
        description: 'Sofá confortável com controle por comando de voz'
    },
    {
        position: new THREE.Vector3(-2, 1, -2),
        name: 'Poltrona',
        description: 'Poltrona com controle de reclinação automático'
    },
    {
        position: new THREE.Vector3(0, 3.5, -2),
        name: 'Luminária',
        description: 'Luminária com controle de intensidade e cor'
    },
    {
        position: new THREE.Vector3(0, 2, -3.8),
        name: 'TV',
        description: 'Smart TV com integração total ao sistema'
    }
];

// Criação dos pontos interativos
interactivePoints.forEach(point => {
    const sprite = createInteractivePoint(point);
    scene.add(sprite);
});

function createInteractivePoint(point) {
    const spriteMap = new THREE.TextureLoader().load('assets/thumbnails/placeholder.svg');
    const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(point.position);
    sprite.scale.set(0.3, 0.3, 1);
    sprite.userData = { name: point.name, description: point.description };
    return sprite;
}

// Funções de controle para o painel
window.toggleLight = function(type, state) {
    console.log('Alterando iluminação:', type, state);
    const intensity = state === 'on' ? 1.0 : 0.2;
    
    if (type === 'main') {
        directionalLight.intensity = intensity;
        // Atualizar luzes do teto
        scene.traverse((object) => {
            if (object.name === 'chandelier') {
                object.children.forEach(light => {
                    if (light.isPointLight) {
                        light.intensity = intensity;
                    }
                });
            }
        });
    } else if (type === 'ambient') {
        ambientLight.intensity = intensity;
    }
    
    // Feedback visual
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'light-feedback';
    feedbackElement.textContent = `${state === 'on' ? '💡' : '🌙'} Luzes ${state === 'on' ? 'acesas' : 'apagadas'}`;
    feedbackElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 1000;
        animation: fadeOut 2s forwards;
    `;
    document.body.appendChild(feedbackElement);
    setTimeout(() => feedbackElement.remove(), 2000);
};

window.toggleTV = function(state) {
    console.log('Alterando estado da TV:', state);
    if (tvObject) {
        tvObject.updateContent(state === 'on');
        
        // Adicionar efeito de luz ambiente da TV
        scene.traverse((object) => {
            if (object.name === 'tv-light') {
                object.intensity = state === 'on' ? 0.5 : 0;
            }
        });
        
        // Feedback visual
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'tv-feedback';
        feedbackElement.textContent = `${state === 'on' ? '📺' : '⬛'} TV ${state === 'on' ? 'ligada' : 'desligada'}`;
        feedbackElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            animation: fadeOut 2s forwards;
        `;
        document.body.appendChild(feedbackElement);
        setTimeout(() => feedbackElement.remove(), 2000);
    }
};

window.adjustTemp = function(direction) {
    console.log('Ajustando temperatura:', direction);
    isACOn = true;
    
    // Ajustar velocidade e quantidade de partículas
    if (direction === 'up') {
        particleSpeed = 0.08;
        maxParticles = 150;
    } else {
        particleSpeed = 0.03;
        maxParticles = 50;
    }
    
    // Atualizar partículas existentes
    particles.forEach(particle => {
        particle.velocity.multiplyScalar(direction === 'up' ? 1.5 : 0.8);
    });
    
    // Feedback visual
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'temp-feedback';
    feedbackElement.textContent = direction === 'up' ? '🌡️ Temperatura aumentada' : '❄️ Temperatura diminuída';
    feedbackElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 1000;
        animation: fadeOut 2s forwards;
    `;
    document.body.appendChild(feedbackElement);
    setTimeout(() => feedbackElement.remove(), 2000);
};

window.activateScenePreset = function(preset) {
    console.log('Ativando preset:', preset);
    const config = scenePresets[preset];
    if (!config) return;

    // Aplicar configurações
    toggleCurtains(config.curtains);
    toggleLight('main', config.lights === 'dim' ? 'off' : 'on');
    toggleTV(config.tv);
    toggleSound(config.sound === 'off' ? 'off' : 'on');
    
    // Configurar luzes coloridas
    if (config.lights === 'colorful') {
        setLightColor(0xff0000);
        startColorCycle();
    } else {
        stopColorCycle();
        setLightColor(0xffffff);
    }
    
    // Feedback visual
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'preset-feedback';
    const presetIcons = {
        cinema: '🎬',
        festa: '🎉',
        leitura: '📚'
    };
    feedbackElement.textContent = `${presetIcons[preset] || '🏠'} Modo ${preset} ativado`;
    feedbackElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 1000;
        animation: fadeOut 2s forwards;
    `;
    document.body.appendChild(feedbackElement);
    setTimeout(() => feedbackElement.remove(), 2000);
};

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Sistema de partículas para o ar condicionado
let particleSystem;
let particles = [];
const MAX_PARTICLES = 100;
const PARTICLE_SPEED = 0.05;
let isACOn = false;

function createParticle() {
    const geometry = new THREE.SphereGeometry(0.02, 4, 4);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    const particle = new THREE.Mesh(geometry, material);
    
    // Posição inicial (saindo do ar condicionado)
    particle.position.set(
        -3 + Math.random() * 6, // Distribuição horizontal
        3, // Altura do ar condicionado
        -3.8 // Próximo à parede
    );
    
    // Velocidade e direção inicial
    particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        -0.02 - Math.random() * 0.02,
        0.02 + Math.random() * 0.02
    );
    
    particle.lifetime = 100 + Math.random() * 50;
    particle.age = 0;
    
    return particle;
}

function initParticleSystem() {
    particleSystem = new THREE.Group();
    scene.add(particleSystem);
}

function updateParticles() {
    if (!isACOn) return;

    // Atualizar partículas existentes
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        // Atualizar posição
        particle.position.add(particle.velocity);
        
        // Atualizar opacidade baseado na idade
        particle.age++;
        particle.material.opacity = 0.3 * (1 - particle.age / particle.lifetime);
        
        // Remover partículas antigas
        if (particle.age >= particle.lifetime) {
            particleSystem.remove(particle);
            particles.splice(i, 1);
        }
    }
    
    // Adicionar novas partículas
    if (particles.length < MAX_PARTICLES) {
        const particle = createParticle();
        particles.push(particle);
        particleSystem.add(particle);
    }
}

// Modificar a função de animação para incluir as partículas
function animate() {
    requestAnimationFrame(animate);

    // Animar cortinas
    curtainObjects.forEach(curtain => {
        if (curtain.mesh.rotation.y !== curtain.targetRotation) {
            const diff = curtain.targetRotation - curtain.mesh.rotation.y;
            curtain.mesh.rotation.y += diff * 0.05;
        }
    });

    // Animar sensores de presença
    presenceSensors.forEach(sensor => {
        if (sensor.active) {
            sensor.mesh.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
            sensor.detectionRadius.material.opacity = 0.1 + Math.sin(Date.now() * 0.005) * 0.05;
        }
    });

    // Animar visualizador de áudio
    if (soundSystem && soundSystem.isPlaying) {
        soundSystem.visualizer.forEach(bar => {
            const height = 0.1 + Math.random() * 0.5;
            bar.scale.y = height;
            bar.position.y = 1.2 + (height / 2);
        });
    }

    // Animar luzes coloridas
    if (colorLights.length > 0 && colorCycleInterval) {
        const time = Date.now() * 0.001;
        colorLights.forEach((light, index) => {
            const hue = (time + index * 0.5) % 1;
            light.color.setHSL(hue, 1, 0.5);
        });
    }

    // Animar partículas do ar condicionado
    if (isACOn) {
    updateParticles();
    }

    // Atualizar controles e renderizar
    controls.update();
    renderer.render(scene, camera);
}

// Inicializar o sistema de partículas
initParticleSystem();

// Criar painel de comandos
function createCommandPanel() {
    // Verificar se já existe um painel de comandos
    const existingPanel = document.querySelector('.command-panel');
    if (existingPanel) {
        console.log('Painel de comandos já existe, ignorando criação');
        return;
    }

    console.log('Criando painel de comandos...');
    const panel = document.createElement('div');
    panel.className = 'command-panel';
    
    // Resto do código do painel permanece o mesmo
    panel.innerHTML = `
        <div class="command-header">
            <h3>Comandos de Voz</h3>
            <div class="command-tabs">
                <button class="tab-btn active" data-tab="tv">TV</button>
                <button class="tab-btn" data-tab="luzes">Luzes</button>
                <button class="tab-btn" data-tab="ambiente">Ambiente</button>
                <button class="tab-btn" data-tab="geral">Geral</button>
            </div>
        </div>
        <div class="command-content">
            <div class="tab-content active" id="tv-commands">
                <div class="command-card">
                    <div class="command-icon">📺</div>
                    <div class="command-text">
                        <strong>"Ligar TV"</strong>
                        <span>Liga a televisão</span>
                    </div>
                </div>
                <div class="command-card">
                    <div class="command-icon">⭕</div>
                    <div class="command-text">
                        <strong>"Desligar TV"</strong>
                        <span>Desliga a televisão</span>
                    </div>
                </div>
            </div>
            <div class="tab-content" id="luzes-commands">
                <div class="command-card">
                    <div class="command-icon">💡</div>
                    <div class="command-text">
                        <strong>"Ligar luzes"</strong>
                        <span>Acende todas as luzes</span>
                    </div>
                </div>
                <div class="command-card">
                    <div class="command-icon">🌙</div>
                    <div class="command-text">
                        <strong>"Desligar luzes"</strong>
                        <span>Apaga todas as luzes</span>
                    </div>
                </div>
            </div>
            <div class="tab-content" id="ambiente-commands">
                <div class="command-card">
                    <div class="command-icon">🎬</div>
                    <div class="command-text">
                        <strong>"Modo cinema"</strong>
                        <span>Ativa o modo cinema (luzes baixas e TV ligada)</span>
                    </div>
                </div>
                <div class="command-card">
                    <div class="command-icon">🏠</div>
                    <div class="command-text">
                        <strong>"Modo normal"</strong>
                        <span>Retorna ao modo normal de iluminação</span>
                    </div>
                </div>
            </div>
            <div class="tab-content" id="geral-commands">
                <div class="command-card">
                    <div class="command-icon">❓</div>
                    <div class="command-text">
                        <strong>"Ajuda"</strong>
                        <span>Mostra esta lista de comandos</span>
                    </div>
                </div>
                <div class="command-card">
                    <div class="command-icon">📋</div>
                    <div class="command-text">
                        <strong>"Comandos"</strong>
                        <span>Lista todos os comandos disponíveis</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
    console.log('Painel de comandos criado');

    // Adicionar funcionalidade das tabs
    const tabs = panel.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const contentId = `${tab.dataset.tab}-commands`;
            panel.querySelector(`#${contentId}`).classList.add('active');
        });
    });
}

// Modificar a função de redimensionamento
function onWindowResize() {
    updateRendererSize();
}

// Inicializar o painel de comandos
createCommandPanel();

// Adicionar listener de redimensionamento
window.addEventListener('resize', onWindowResize, false);

// Chamar redimensionamento inicial
onWindowResize();

// Interatividade
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.name) {
            showPointInfo(object.userData);
        }
    }
}

function showPointInfo(data) {
    const infoElement = document.getElementById('point-info');
    if (infoElement) {
        infoElement.innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.description}</p>
        `;
        infoElement.style.display = 'block';
        setTimeout(() => {
            infoElement.style.display = 'none';
        }, 3000);
    }
}

renderer.domElement.addEventListener('click', onMouseClick, false);

// Iniciar animação
animate();

// Adicionar formulário de contato inicial
function createContactForm() {
    const overlay = document.createElement('div');
    overlay.className = 'contact-overlay';
    
    overlay.innerHTML = `
        <div class="contact-form">
            <div class="form-header">
                <img src="assets/minas-smart-color2-v2.png" alt="Minas Smart" class="form-logo">
                <h2>Bem-vindo à Casa Inteligente</h2>
                <p>Para começar o tour, precisamos de algumas informações:</p>
            </div>
            <form action="https://formsubmit.co/houseminassmart@gmail.com" method="POST">
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://minassmart.com.br/tour-virtual.html" />
                <input type="hidden" name="_subject" value="Novo acesso ao Tour Virtual - Minas Smart" />
                <input type="hidden" name="_template" value="box" />
                <div class="form-group">
                    <label for="userName">Nome completo</label>
                    <input type="text" id="userName" name="name" required 
                           placeholder="Digite seu nome completo">
                </div>
                <div class="form-group">
                    <label for="userEmail">E-mail</label>
                    <input type="email" id="userEmail" name="email" required 
                           placeholder="Digite seu melhor e-mail">
                </div>
                <div class="form-group">
                    <label for="userPhone">Telefone</label>
                    <input type="tel" id="userPhone" name="phone" required 
                           placeholder="(00) 00000-0000">
                </div>
                <div class="form-group checkbox">
                    <input type="checkbox" id="userConsent" name="consent" required>
                    <label for="userConsent">
                        Concordo em receber informações sobre automação residencial
                    </label>
                </div>
                <button type="submit" class="start-tour-btn">
                    Começar Tour Virtual
                </button>
            </form>
        </div>
    `;

    // Máscara para o telefone
    const phoneInput = overlay.querySelector('#userPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        }
    });

    document.body.appendChild(overlay);

    // Salvar dados do usuário quando o formulário for enviado
    const form = overlay.querySelector('form');
    form.addEventListener('submit', function(e) {
            const userData = {
                name: form.querySelector('#userName').value,
                email: form.querySelector('#userEmail').value,
                phone: form.querySelector('#userPhone').value,
                consent: form.querySelector('#userConsent').checked
            };
            localStorage.setItem('userTourData', JSON.stringify(userData));
    });
}

// Função para criar o painel de controle
function createControlPanel() {
    console.log('Criando painel de controle...');
    const panel = document.createElement('div');
    panel.id = 'control-panel';
    panel.className = 'control-panel';
    
    panel.innerHTML = `
        <div class="control-section">
            <h3>Controles</h3>
            <div class="control-buttons">
                <button onclick="toggleLight('main', 'on')">Ligar Luzes</button>
                <button onclick="toggleLight('main', 'off')">Desligar Luzes</button>
                <button onclick="toggleTV('on')">Ligar TV</button>
                <button onclick="toggleTV('off')">Desligar TV</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    console.log('Painel de controle criado');
}

// Função para verificar inicialização
function checkInitialization() {
    console.log('Verificando inicialização...');
    
    if (!THREE) {
        console.error('THREE.js não está carregado!');
        return false;
    }
    
    if (!scene) {
        console.error('Cena não está inicializada!');
        return false;
    }
    
    if (!renderer) {
        console.error('Renderer não está inicializado!');
        return false;
    }
    
    if (!camera) {
        console.error('Câmera não está inicializada!');
        return false;
    }
    
    console.log('Inicialização OK');
    return true;
}

// Modificar função init
function init() {
    console.log('Iniciando configuração...');
    
    // Configurar cena inicial
    createLivingRoom();
    
    // Criar painel de controle (apenas uma vez)
    createControlPanel();
    
    // Iniciar animação
    animate();
    
    console.log('Inicialização concluída');
}

// Função para garantir que o Three.js está carregado
function ensureThreeJsLoaded() {
    return new Promise((resolve, reject) => {
        if (window.THREE) {
            resolve();
        } else {
            // Tentar carregar o Three.js
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Falha ao carregar Three.js'));
            document.head.appendChild(script);
        }
    });
}

// Modificar a função initTour
function initTour() {
    console.log('Iniciando tour...');
    
    // Verificar se já temos os dados do usuário
    const userData = localStorage.getItem('userTourData');
    if (!userData) {
        console.log('Dados do usuário não encontrados, criando formulário...');
        createContactForm();
        return;
    }

    console.log('Dados do usuário encontrados, iniciando tour...');
    init();
    initVoiceCommands();
}

// Garantir que as funções estejam disponíveis globalmente
window.handleSceneChange = handleSceneChange;
window.init = init;
window.initTour = initTour;
window.createControlPanel = createControlPanel;

// Remover chamada duplicada de inicialização

// Funções de controle
window.adjustTemperature = function(direction) {
    // Implementar lógica de controle de temperatura
    console.log('Ajustando temperatura:', direction);
};

window.toggleSensors = function(state) {
    // Implementar lógica de controle dos sensores
    console.log('Alterando estado dos sensores:', state);
};

// Inicializar comandos de voz quando a página carregar
window.addEventListener('load', initVoiceCommands);

function initVoiceCommands() {
    // Verificar suporte ao reconhecimento de voz
    if (!('webkitSpeechRecognition' in window)) {
        console.warn('Reconhecimento de voz não suportado neste navegador');
        showVoiceError('Seu navegador não suporta reconhecimento de voz');
        return;
    }

    // Configurar reconhecimento de voz
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    // Criar elemento para feedback visual
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'voice-feedback';
    feedbackElement.style.display = 'none';
    document.body.appendChild(feedbackElement);

    // Eventos do reconhecimento de voz
    recognition.onstart = function() {
        showVoiceFeedback('Ouvindo...', 'listening');
        isListening = true;
        updateVoiceButtonState();
    };

    recognition.onend = function() {
        hideVoiceFeedback();
        isListening = false;
        updateVoiceButtonState();
    };

    recognition.onerror = function(event) {
        let mensagem = 'Erro no reconhecimento de voz';
        switch (event.error) {
            case 'network':
                mensagem = 'Erro de conexão';
                break;
            case 'not-allowed':
                mensagem = 'Microfone não permitido';
                break;
            case 'no-speech':
                mensagem = 'Nenhuma fala detectada';
                break;
            case 'aborted':
                mensagem = 'Reconhecimento cancelado';
                break;
        }
        showVoiceError(mensagem);
    };

    recognition.onresult = function(event) {
        const comando = event.results[0][0].transcript.toLowerCase();
        showVoiceFeedback(`Comando: "${comando}"`, 'processing');
        
        // Processar comando
        let comandoReconhecido = false;
        let feedback = '';

        // Comandos de TV
        if (comando.includes('ligar tv') || comando.includes('liga tv')) {
            toggleTV('on');
            feedback = 'TV ligada';
            comandoReconhecido = true;
        } else if (comando.includes('desligar tv') || comando.includes('desliga tv')) {
            toggleTV('off');
            feedback = 'TV desligada';
            comandoReconhecido = true;
        }

        // Comandos de luz
        if (comando.includes('ligar luz') || comando.includes('liga luz') || 
            comando.includes('ligar luzes') || comando.includes('liga luzes')) {
            toggleLight('main', 'on');
            feedback = 'Luzes acesas';
            comandoReconhecido = true;
        } else if (comando.includes('desligar luz') || comando.includes('desliga luz') ||
                   comando.includes('desligar luzes') || comando.includes('desliga luzes')) {
            toggleLight('main', 'off');
            feedback = 'Luzes apagadas';
            comandoReconhecido = true;
        }

        // Comandos de ambiente
        if (comando.includes('modo cinema') || comando.includes('modo filme')) {
            toggleLight('main', 'off');
            toggleTV('on');
            feedback = 'Modo cinema ativado';
            comandoReconhecido = true;
        } else if (comando.includes('modo normal') || comando.includes('modo padrão')) {
            toggleLight('main', 'on');
            feedback = 'Modo normal ativado';
            comandoReconhecido = true;
        }

        // Comando de ajuda
        if (comando.includes('ajuda') || comando.includes('comandos')) {
            showCommandPanel();
            feedback = 'Mostrando comandos disponíveis';
            comandoReconhecido = true;
        }

        // Feedback do comando
        if (comandoReconhecido) {
            showVoiceFeedback(feedback, 'success');
        } else {
            showVoiceError('Comando não reconhecido');
        }
    };

    // Adicionar estilos para o feedback visual
    const style = document.createElement('style');
    style.textContent = `
        .voice-feedback {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            backdrop-filter: blur(5px);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            pointer-events: none;
        }

        .voice-feedback.show {
            opacity: 1;
        }

        .voice-feedback.listening {
            background: rgba(255, 84, 0, 0.9);
            color: white;
        }

        .voice-feedback.processing {
            background: rgba(0, 0, 0, 0.8);
            color: white;
        }

        .voice-feedback.success {
            background: rgba(40, 167, 69, 0.9);
            color: white;
        }

        .voice-feedback.error {
            background: rgba(220, 53, 69, 0.9);
            color: white;
        }

        .voice-feedback::before {
            font-family: "Font Awesome 5 Free";
            font-weight: 900;
        }

        .voice-feedback.listening::before {
            content: "\\f130";
            animation: pulse 1s infinite;
        }

        .voice-feedback.processing::before {
            content: "\\f110";
            animation: spin 1s linear infinite;
        }

        .voice-feedback.success::before {
            content: "\\f00c";
        }

        .voice-feedback.error::before {
            content: "\\f071";
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
            .voice-feedback {
                width: 80%;
                font-size: 12px;
                text-align: center;
                padding: 10px 16px;
            }
        }
    `;
    document.head.appendChild(style);

    // Criar botão de voz se não existir
    if (!document.getElementById('voiceControlBtn')) {
        createVoiceButton();
    }
}

function showVoiceFeedback(message, type) {
    const feedback = document.querySelector('.voice-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = 'voice-feedback ' + type;
    feedback.classList.add('show');

    if (type === 'success' || type === 'error') {
        setTimeout(hideVoiceFeedback, 3000);
    }
}

function showVoiceError(message) {
    showVoiceFeedback(message, 'error');
}

function hideVoiceFeedback() {
    const feedback = document.querySelector('.voice-feedback');
    if (!feedback) return;
    feedback.classList.remove('show');
}

function showCommandPanel() {
    const panel = document.querySelector('.command-panel');
    if (panel) {
        panel.style.display = 'block';
        setTimeout(() => {
            panel.style.display = 'none';
        }, 5000);
    }
}

function createVoiceButton() {
    const btn = document.createElement('button');
    btn.id = 'voiceControlBtn';
    btn.className = 'voice-control-btn';
    btn.innerHTML = '<i class="fas fa-microphone"></i>';
    
    const style = document.createElement('style');
    style.textContent = `
        .voice-control-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border: none;
            border-radius: 50%;
            background: #ff5400;
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-tap-highlight-color: transparent;
        }

        .voice-control-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .voice-control-btn:active {
            transform: scale(0.95);
        }

        .voice-control-btn.listening {
            background: #ff0000;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 2px 10px rgba(255, 0, 0, 0.2);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 2px 10px rgba(255, 0, 0, 0.2);
            }
        }

        @media (max-width: 480px) {
            .voice-control-btn {
                bottom: calc(40vh + 20px);
                right: 10px;
                width: 48px;
                height: 48px;
                font-size: 20px;
            }
        }

        @media (max-height: 480px) and (orientation: landscape) {
            .voice-control-btn {
                bottom: 10px;
                right: calc(40vw + 10px);
            }
        }

        /* Suporte para notch e áreas seguras */
        @supports (padding: env(safe-area-inset-bottom)) {
            .voice-control-btn {
                bottom: calc(20px + env(safe-area-inset-bottom));
                right: calc(20px + env(safe-area-inset-right));
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    // Adicionar feedback tátil em dispositivos móveis
    btn.addEventListener('touchstart', () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    });
}

function updateVoiceButtonState() {
    const btn = document.getElementById('voiceControlBtn');
    if (!btn) return;

    if (isListening) {
        btn.classList.add('listening');
        btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    } else {
        btn.classList.remove('listening');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

// Gerenciamento de cenários
let currentScene = 'sala';

function initSceneSelector() {
    console.log('Inicializando seletor de cenas');
    const sceneOptions = document.querySelectorAll('.scene-option');
    
    sceneOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedScene = this.dataset.scene;
            console.log('Cena selecionada:', selectedScene);
            
            if (selectedScene === currentScene) {
                console.log('Mesma cena, ignorando');
                return;
            }

            // Atualiza a classe ativa
            const activeOption = document.querySelector('.scene-option.active');
            if (activeOption) {
                activeOption.classList.remove('active');
            }
            option.classList.add('active');

            // Salva o cenário atual
            currentScene = selectedScene;

            // Limpa a cena atual
            clearScene();

            console.log('Criando nova cena:', selectedScene);

            // Recria a cena com base no cenário selecionado
            switch(selectedScene) {
                case 'sala':
                    console.log('Criando sala...');
                    createLivingRoom();
                    break;
                case 'cozinha':
                    console.log('Criando cozinha...');
                    createKitchen();
                    break;
                case 'quarto':
                    console.log('Criando quarto...');
                    createBedroom();
                    break;
                case 'banheiro':
                    console.log('Criando banheiro...');
                    createBathroom();
                    break;
                case 'externo':
                    console.log('Criando área externa...');
                    createExternalArea();
                    break;
                default:
                    console.error('Cena não reconhecida:', selectedScene);
            }
        });
    });
}

// Função para limpar a cena
function clearScene() {
    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
    }
}

function createKitchen() {
    console.log('Criando cozinha...');
    
    // Limpar cena atual
    clearScene();
    
    // Configurar fundo e iluminação
    scene.background = new THREE.Color(0xf0f0f0);
    setupBasicLighting();

    // Criar o chão
    const floorGeometry = new THREE.PlaneGeometry(8, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd3d3d3,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Criar paredes
    const walls = new THREE.Group();

    // Parede do fundo
    const backWallGeometry = new THREE.BoxGeometry(8, 4, 0.2);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.9
    });
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 2, -4);
    backWall.receiveShadow = true;
    walls.add(backWall);

    // Parede lateral esquerda
    const leftWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    leftWall.position.set(-4, 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    walls.add(leftWall);

    scene.add(walls);

    // Criar bancada inferior
    const counterGeometry = new THREE.BoxGeometry(7, 0.1, 0.8);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x404040,
        roughness: 0.3,
        metalness: 0.7
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.9, -3.6);
    counter.castShadow = true;
    counter.receiveShadow = true;
    scene.add(counter);

    // Criar armários inferiores
    const cabinetGeometry = new THREE.BoxGeometry(1, 0.8, 0.7);
    const cabinetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.8
    });

    // Criar vários armários ao longo da bancada
    for (let x = -3; x <= 3; x += 1) {
        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
        cabinet.position.set(x, 0.4, -3.6);
        cabinet.castShadow = true;
        scene.add(cabinet);

        // Adicionar puxadores
        const handleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const handleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xc0c0c0,
            metalness: 0.8
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(x, 0.4, -3.2);
        handle.castShadow = true;
        scene.add(handle);
    }

    // Criar armários superiores
    const upperCabinetGeometry = new THREE.BoxGeometry(1, 1, 0.4);
    for (let x = -3; x <= 3; x += 1) {
        const upperCabinet = new THREE.Mesh(upperCabinetGeometry, cabinetMaterial);
        upperCabinet.position.set(x, 2.5, -3.8);
        upperCabinet.castShadow = true;
        scene.add(upperCabinet);

        // Adicionar puxadores
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(x, 2.5, -3.6);
        handle.castShadow = true;
        scene.add(handle);
    }

    // Criar pia
    const sinkGeometry = new THREE.BoxGeometry(1, 0.1, 0.6);
    const sinkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.8,
        roughness: 0.2
    });
    const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
    sink.position.set(0, 0.85, -3.6);
    scene.add(sink);

    // Criar torneira
    const faucetGroup = new THREE.Group();
    
    const faucetBaseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const faucetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1
    });
    const faucetBase = new THREE.Mesh(faucetBaseGeometry, faucetMaterial);
    faucetBase.rotation.x = Math.PI / 2;
    faucetBase.position.set(0, 0.2, 0);
    faucetGroup.add(faucetBase);

    const faucetTopGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
    const faucetTop = new THREE.Mesh(faucetTopGeometry, faucetMaterial);
    faucetTop.position.set(0, 0.2, -0.1);
    faucetGroup.add(faucetTop);

    faucetGroup.position.set(0, 1.1, -3.3);
    scene.add(faucetGroup);

    // Criar fogão
    const stoveGroup = new THREE.Group();

    // Base do fogão
    const stoveBaseGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.7);
    const stoveMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2f2f2f,
        metalness: 0.8,
        roughness: 0.2
    });
    const stoveBase = new THREE.Mesh(stoveBaseGeometry, stoveMaterial);
    stoveGroup.add(stoveBase);

    // Cooktop
    const cooktopGeometry = new THREE.BoxGeometry(1, 0.05, 0.6);
    const cooktopMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.1
    });
    const cooktop = new THREE.Mesh(cooktopGeometry, cooktopMaterial);
    cooktop.position.y = 0.4;
    stoveGroup.add(cooktop);

    // Bocas do fogão
    const burnerGeometry = new THREE.RingGeometry(0.08, 0.1, 16);
    const burnerMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const positions = [
        [-0.3, 0.2],
        [0.3, 0.2],
        [-0.3, -0.2],
        [0.3, -0.2]
    ];

    positions.forEach(([x, z]) => {
        const burner = new THREE.Mesh(burnerGeometry, burnerMaterial);
        burner.rotation.x = -Math.PI / 2;
        burner.position.set(x, 0.43, z);
        stoveGroup.add(burner);
    });

    stoveGroup.position.set(2, 0.4, -3.6);
    scene.add(stoveGroup);

    // Criar geladeira
    const fridgeGroup = new THREE.Group();

    // Corpo da geladeira
    const fridgeGeometry = new THREE.BoxGeometry(1, 3, 0.8);
    const fridgeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.8,
        roughness: 0.2
    });
    const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
    fridgeGroup.add(fridge);

    // Puxadores
    const fridgeHandleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    const fridgeHandle1 = new THREE.Mesh(fridgeHandleGeometry, handleMaterial);
    fridgeHandle1.position.set(0.45, 0.4, 0);
    fridgeGroup.add(fridgeHandle1);

    const fridgeHandle2 = new THREE.Mesh(fridgeHandleGeometry, handleMaterial);
    fridgeHandle2.position.set(0.45, -0.8, 0);
    fridgeGroup.add(fridgeHandle2);

    fridgeGroup.position.set(-3, 1.5, -3.6);
    scene.add(fridgeGroup);

    // Ajustar câmera para a cozinha
    camera.position.set(0, 2, 3);
    controls.target.set(0, 1, -2);
    controls.update();
}

// Remover chamada duplicada de inicialização

// Função para trocar de cena
function handleSceneChange(selectedScene) {
    console.log('=== Início da troca de cena ===');
    console.log('Cena selecionada:', selectedScene);
    console.log('Cena atual:', currentScene);
    
    // Verificar se a cena está desabilitada
    const sceneElement = document.querySelector(`[data-scene="${selectedScene}"]`);
    if (sceneElement && sceneElement.classList.contains('disabled')) {
        console.log('Cena desabilitada, ignorando troca');
        return;
    }

    if (selectedScene === currentScene) {
        console.log('Mesma cena, ignorando troca');
        return;
    }

    try {
        console.log('1. Atualizando classes dos botões...');
        // Atualiza a classe ativa
        const activeOption = document.querySelector('.scene-option.active');
        if (activeOption) {
            activeOption.classList.remove('active');
            console.log('- Classe active removida do botão anterior');
        }
        const newActiveOption = document.querySelector(`[data-scene="${selectedScene}"]`);
        if (newActiveOption) {
            newActiveOption.classList.add('active');
            console.log('- Classe active adicionada ao novo botão');
        } else {
            console.error('Botão da nova cena não encontrado:', selectedScene);
        }

        console.log('2. Atualizando variável de cena atual...');
        currentScene = selectedScene;

        console.log('3. Limpando cena atual...');
        clearScene();

        console.log('4. Criando nova cena:', selectedScene);
        switch(selectedScene) {
            case 'sala':
                console.log('Criando sala...');
                createLivingRoom();
                break;
            case 'cozinha':
                console.log('Criando cozinha...');
                createKitchen();
                break;
            case 'quarto':
                console.log('Criando quarto...');
                createBedroom();
                break;
            case 'banheiro':
                console.log('Criando banheiro...');
                createBathroom();
                break;
            case 'externo':
                console.log('Criando área externa...');
                createExternalArea();
                break;
            default:
                console.error('Cena não reconhecida:', selectedScene);
        }
        
        console.log('5. Cena trocada com sucesso');
        console.log('=== Fim da troca de cena ===');
    } catch (error) {
        console.error('Erro durante a troca de cena:', error);
        console.error('Stack trace:', error.stack);
    }
};

// Remover chamada duplicada de inicialização 