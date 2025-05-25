// Configuração inicial do Three.js
let scene, camera, renderer, controls, composer;
let currentRoom = 'sala';
let roomObjects = {};
let isListening = false;
let recognition;
let canvas, ctx;

const rooms = {
  sala: {
    camera: { x: 0, y: 1.6, z: 4 },
    lights: {
      ambient: { color: 0xffffff, intensity: 0.3 },
      main: { color: 0xffffff, intensity: 0.7, position: { x: 0, y: 3, z: 0 } },
      spots: [
        { color: 0xffd700, intensity: 0.5, position: { x: -2, y: 2.8, z: -1 } },
        { color: 0xffd700, intensity: 0.5, position: { x: 2, y: 2.8, z: -1 } }
      ],
      tv: { color: 0x6699ff, intensity: 0.3, position: { x: 0, y: 1.2, z: -2.8 } }
    },
    points: [
      {
        position: { x: -2, y: 1.5, z: -1 },
        title: 'Iluminação Inteligente',
        description: 'Controle as luzes via app ou voz, crie cenas e automatize horários.'
      },
      {
        position: { x: 2, y: 1.2, z: -2 },
        title: 'Home Theater',
        description: 'Sistema de áudio e vídeo integrado com controle total via app.'
      },
      {
        position: { x: 0, y: 2, z: -2.5 },
        title: 'Cortinas Automatizadas',
        description: 'Controle a entrada de luz natural de forma automática.'
      }
    ]
  },
  quarto: {
    camera: { x: 0, y: 1.6, z: 2 },
    points: [
      {
        position: { x: -1.5, y: 1.2, z: -1 },
        title: 'Climatização Smart',
        description: 'Temperatura ideal controlada automaticamente.'
      },
      {
        position: { x: 1.5, y: 1.5, z: -1.5 },
        title: 'Iluminação Noturna',
        description: 'Sensores de movimento ativam luz suave durante a noite.'
      }
    ]
  },
  cozinha: {
    camera: { x: 0, y: 1.6, z: 2.5 },
    points: [
      {
        position: { x: -1, y: 1.3, z: -1 },
        title: 'Eletrodomésticos Smart',
        description: 'Controle e monitore seus aparelhos remotamente.'
      },
      {
        position: { x: 1, y: 1.4, z: -2 },
        title: 'Economia de Energia',
        description: 'Monitoramento em tempo real do consumo de energia.'
      }
    ]
  }
};

let lights = {};
let roomState = {
  lights: true,
  tv: false,
  curtains: false
};

// Configuração inicial
const interactionPoints = document.getElementById('interactionPoints');
const infoCard = document.getElementById('infoCard');

// Estado do tour
let roomImages = {
    sala: null,
    quarto: null,
    cozinha: null
};

// Pontos interativos por ambiente
const interactivePoints = {
    sala: [
        {
            x: 30,
            y: 40,
            title: 'Iluminação Inteligente',
            description: 'Controle as luzes via app ou voz. Crie cenas personalizadas e automatize horários.',
            icon: 'lightbulb'
        },
        {
            x: 60,
            y: 50,
            title: 'Home Theater',
            description: 'Sistema de áudio e vídeo integrado com controle por voz e app.',
            icon: 'tv'
        },
        {
            x: 80,
            y: 30,
            title: 'Cortinas Automatizadas',
            description: 'Cortinas motorizadas com controle remoto e integração com sensores de luz.',
            icon: 'blinds'
        }
    ],
    quarto: [
        {
            x: 40,
            y: 45,
            title: 'Climatização Smart',
            description: 'Ar condicionado inteligente que aprende suas preferências de temperatura.',
            icon: 'temperature-high'
        },
        {
            x: 70,
            y: 35,
            title: 'Iluminação Adaptativa',
            description: 'Luzes que se ajustam automaticamente ao longo do dia.',
            icon: 'lightbulb'
        },
        {
            x: 25,
            y: 60,
            title: 'Áudio Ambiente',
            description: 'Sistema de som integrado com controle por voz.',
            icon: 'music'
        }
    ],
    cozinha: [
        {
            x: 45,
            y: 55,
            title: 'Eletrodomésticos Smart',
            description: 'Geladeira, forno e outros aparelhos conectados ao seu smartphone.',
            icon: 'blender'
        },
        {
            x: 75,
            y: 40,
            title: 'Assistente Virtual',
            description: 'Controle por voz para receitas, timers e listas de compras.',
            icon: 'microphone'
        },
        {
            x: 20,
            y: 45,
            title: 'Sensores de Segurança',
            description: 'Detectores de fumaça e gás com alertas no celular.',
            icon: 'shield-alt'
        }
    ]
};

// Função para verificar suporte WebGL
const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch(e) {
    return false;
  }
};

// Verificar se o Three.js está carregado
function waitForDependencies() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    function checkDeps() {
      attempts++;
      console.log('Verificando dependências... Tentativa', attempts);
      
      try {
        if (typeof THREE === 'undefined') {
          throw new Error('Three.js não está carregado');
        }
        if (typeof THREE.OrbitControls === 'undefined') {
          throw new Error('OrbitControls não está carregado');
        }
        if (typeof THREE.GLTFLoader === 'undefined') {
          throw new Error('GLTFLoader não está carregado');
        }
        if (typeof THREE.EffectComposer === 'undefined') {
          throw new Error('EffectComposer não está carregado');
        }
        
        console.log('Todas as dependências foram carregadas com sucesso');
        resolve();
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(new Error('Tempo limite excedido ao carregar dependências'));
        } else {
          setTimeout(checkDeps, 500); // Tentar novamente em 500ms
        }
      }
    }
    
    checkDeps();
  });
}

// Gerenciador de carregamento
class LoadingManager {
  constructor() {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.className = 'loading-screen';
    this.loadingScreen.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Carregando tour virtual...</p>
      </div>
    `;
    document.body.appendChild(this.loadingScreen);
  }

  hide() {
    this.loadingScreen.style.opacity = '0';
    setTimeout(() => {
      this.loadingScreen.remove();
    }, 500);
  }
}

// Classe principal do Tour
class VirtualTour {
  constructor() {
    this.container = document.getElementById('tour3D');
    this.loadingManager = new LoadingManager();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isTouching = false;
    
    this.init();
  }

  init() {
    if (!checkWebGLSupport()) {
      alert('Seu navegador não suporta WebGL. Por favor, use um navegador mais recente.');
      return;
    }

    // Configuração da cena
    this.scene = new THREE.Scene();
    
    // Configuração da câmera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 0.1);

    // Configuração do renderer com antialiasing para Safari
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Configuração dos controles
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = -0.5;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;

    // Eventos
    this.setupEventListeners();
    
    // Carregar a cena inicial
    this.loadRoom('sala');
    
    // Iniciar animação
    this.animate();
  }

  setupEventListeners() {
    // Redimensionamento
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    
    // Eventos de toque com opções passivas
    this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    
    // Eventos de mouse
    this.container.addEventListener('click', this.onClick.bind(this), { passive: true });
    
    // Orientação do dispositivo com permissão
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requer permissão
      document.getElementById('startTour').addEventListener('click', async () => {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this), true);
          }
        } catch (error) {
          console.warn('Permissão de orientação negada:', error);
        }
      });
    } else {
      // Outros dispositivos
      window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this), true);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.isTouching = true;
      
      // Armazenar posição inicial da câmera
      this.touchStartCameraRotation = {
        x: this.camera.rotation.x,
        y: this.camera.rotation.y
      };
    }
  }

  onTouchMove(event) {
    if (!this.isTouching || event.touches.length !== 1) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const deltaX = (touch.clientX - this.touchStartX) * 0.005;
    const deltaY = (touch.clientY - this.touchStartY) * 0.005;
    
    // Aplicar rotação suave
    this.camera.rotation.y = this.touchStartCameraRotation.y - deltaX;
    this.camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.touchStartCameraRotation.x - deltaY)
    );
  }

  onTouchEnd() {
    this.isTouching = false;
  }

  onClick(event) {
    event.preventDefault();
    
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData.type === 'hotspot') {
        this.handleHotspotClick(object);
      }
    }
  }

  onDeviceOrientation(event) {
    if (!event.alpha || !event.beta || !event.gamma) return;
    
    const x = THREE.MathUtils.degToRad(event.beta);
    const y = THREE.MathUtils.degToRad(event.gamma);
    const z = THREE.MathUtils.degToRad(event.alpha);
    
    this.camera.rotation.set(x, y, z);
  }

  loadRoom(roomName) {
    // Limpar cena atual
    while(this.scene.children.length > 0) { 
      this.scene.remove(this.scene.children[0]); 
    }

    // Carregar nova textura
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      `assets/rooms/${roomName}.jpg`,
      (texture) => {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);
        
        // Adicionar hotspots
        this.addHotspots(roomName);
        
        // Esconder tela de carregamento
        this.loadingManager.hide();
      },
      undefined,
      (error) => {
        console.error('Erro ao carregar textura:', error);
        alert('Erro ao carregar o ambiente. Por favor, tente novamente.');
      }
    );
  }

  addHotspots(roomName) {
    const hotspots = this.getHotspotsForRoom(roomName);
    hotspots.forEach(hotspot => {
      const sprite = this.createHotspotSprite();
      sprite.position.set(hotspot.position.x, hotspot.position.y, hotspot.position.z);
      sprite.userData = {
        type: 'hotspot',
        action: hotspot.action,
        target: hotspot.target
      };
      this.scene.add(sprite);
    });
  }

  createHotspotSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    context.beginPath();
    context.arc(32, 32, 30, 0, Math.PI * 2);
    context.fillStyle = '#ff5400';
    context.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    return new THREE.Sprite(material);
  }

  getHotspotsForRoom(roomName) {
    // Definir posições dos hotspots para cada ambiente
    const hotspotsByRoom = {
      sala: [
        {
          position: { x: 10, y: 0, z: 0 },
          action: 'changeRoom',
          target: 'cozinha'
        }
        // Adicionar mais hotspots conforme necessário
      ],
      cozinha: [
        {
          position: { x: -10, y: 0, z: 0 },
          action: 'changeRoom',
          target: 'sala'
        }
        // Adicionar mais hotspots conforme necessário
      ]
    };
    
    return hotspotsByRoom[roomName] || [];
  }

  handleHotspotClick(hotspot) {
    if (hotspot.userData.action === 'changeRoom') {
      this.loadRoom(hotspot.userData.target);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    if (this.controls) {
      this.controls.update();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Inicializar o tour quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  const tour = new VirtualTour();
  
  // Adicionar controles de interface
  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.innerHTML = `
    <button class="control-btn" id="btnLights">Luzes</button>
    <button class="control-btn" id="btnCurtains">Cortinas</button>
    <button class="control-btn" id="btnTV">TV</button>
  `;
  document.body.appendChild(controls);
  
  // Adicionar botão de voltar
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.textContent = 'Voltar ao Site';
  backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  document.body.appendChild(backButton);
});

function setupPostProcessing() {
  composer = new THREE.EffectComposer(renderer);
  
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass);
}

function setupVoiceRecognition() {
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    
    recognition.onresult = function(event) {
      const command = event.results[0][0].transcript.toLowerCase();
      processVoiceCommand(command);
    };
    
    recognition.onend = function() {
      isListening = false;
      updateVoiceButtonState();
    };
  }
}

function createVoiceButton() {
  const button = document.createElement('button');
  button.id = 'voiceControlBtn';
  button.className = 'voice-control-btn';
  button.innerHTML = '<i class="fas fa-microphone"></i>';
  
  button.addEventListener('click', toggleVoiceRecognition);
  
  document.querySelector('.tour-controls').appendChild(button);
}

function toggleVoiceRecognition() {
  if (!recognition) return;
  
  if (!isListening) {
    recognition.start();
    isListening = true;
  } else {
    recognition.stop();
    isListening = false;
  }
  updateVoiceButtonState();
}

function updateVoiceButtonState() {
  const button = document.getElementById('voiceControlBtn');
  if (isListening) {
    button.classList.add('listening');
  } else {
    button.classList.remove('listening');
  }
}

function setupDynamicLights() {
  // Luz ambiente base (sempre ligada)
  const ambientLight = new THREE.AmbientLight(0x333333, 0.3);
  scene.add(ambientLight);

  // Luzes dinâmicas por ambiente
  lights = {
    sala: {
      principal: createRoomLight(0, 1, -1, 0xffffff, 0.8),
      spots: [
        createSpotLight(-1.5, 2, -1, 0xffd700, 0.6),
        createSpotLight(1.5, 2, -1, 0xffd700, 0.6),
      ],
      tv: createTVLight(0, 0, -2.7, 0x6699ff, 0.4)
    },
    quarto: {
      principal: createRoomLight(0, 1, -1, 0xffffff, 0.8),
      abajur: createSpotLight(-1.5, 0, -1.5, 0xffaa44, 0.4)
    },
    cozinha: {
      principal: createRoomLight(0, 1, -1, 0xffffff, 0.8),
      spots: [
        createSpotLight(-1, 2, -1, 0xffffff, 0.5),
        createSpotLight(1, 2, -1, 0xffffff, 0.5),
      ],
      bancada: createSpotLight(0, 1.5, -2, 0xffffff, 0.6)
    }
  };
}

function createRoomLight(x, y, z, color, intensity) {
  const light = new THREE.PointLight(color, intensity, 10);
  light.position.set(x, y, z);
  light.castShadow = true;
  scene.add(light);
  return light;
}

function createSpotLight(x, y, z, color, intensity) {
  const light = new THREE.SpotLight(color, intensity, 8, Math.PI / 4, 0.5);
  light.position.set(x, y, z);
  light.castShadow = true;
  scene.add(light);
  return light;
}

function createTVLight(x, y, z, color, intensity) {
  const light = new THREE.RectAreaLight(color, intensity, 1.6, 0.9);
  light.position.set(x, y, z);
  light.lookAt(x, y, z + 1);
  scene.add(light);
  return light;
}

function processVoiceCommand(command) {
  if (command.includes('apagar') || command.includes('desligar')) {
    if (command.includes('tudo')) {
      roomState.lights = false;
      roomState.tv = false;
    } else if (command.includes('tv')) {
      roomState.tv = false;
    } else {
      roomState.lights = false;
    }
  } else if (command.includes('acender') || command.includes('ligar')) {
    if (command.includes('tudo')) {
      roomState.lights = true;
      roomState.tv = true;
    } else if (command.includes('tv')) {
      roomState.tv = true;
    } else {
      roomState.lights = true;
    }
  } else if (command.includes('cortina')) {
    if (command.includes('abrir')) {
      roomState.curtains = false;
    } else if (command.includes('fechar')) {
      roomState.curtains = true;
    }
  }
  
  drawRoom();
}

function turnOffAllLights(roomLights) {
  Object.values(roomLights).forEach(light => {
    if (Array.isArray(light)) {
      light.forEach(l => animateLight(l, false));
    } else {
      animateLight(light, false);
    }
  });
}

function turnOnAllLights(roomLights) {
  Object.values(roomLights).forEach(light => {
    if (Array.isArray(light)) {
      light.forEach(l => animateLight(l, true));
    } else {
      animateLight(light, true);
    }
  });
}

function animateLight(light, turnOn) {
  const targetIntensity = turnOn ? light.userData.originalIntensity || 1 : 0;
  const duration = 500; // meio segundo
  const startIntensity = light.intensity;
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    light.intensity = startIntensity + (targetIntensity - startIntensity) * progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  if (!light.userData.originalIntensity) {
    light.userData.originalIntensity = light.intensity;
  }

  animate();
}

// Criar ambiente básico
function createRoom(roomType) {
  console.log('Criando ambiente:', roomType);
  
  // Limpar cena existente
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
  console.log('Cena limpa');

  // Adicionar luzes básicas
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  console.log('Luzes básicas adicionadas');

  // Criar geometria básica do ambiente
  // Piso
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  console.log('Piso adicionado');

  // Paredes
  const wallsGeometry = new THREE.BoxGeometry(10, 4, 10);
  const wallsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.BackSide
  });
  const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
  walls.position.y = 2;
  walls.receiveShadow = true;
  scene.add(walls);
  console.log('Paredes adicionadas');

  // Adicionar móveis específicos do ambiente
  switch(roomType) {
    case 'sala':
      createLivingRoom();
      break;
    case 'quarto':
      createBedroom();
      break;
    case 'cozinha':
      createKitchen();
      break;
  }
  console.log('Móveis adicionados');

  // Atualizar controles para o ambiente atual
  const roomConfig = rooms[roomType];
  if (roomConfig && roomConfig.camera) {
    camera.position.set(
      roomConfig.camera.x,
      roomConfig.camera.y,
      roomConfig.camera.z
    );
    controls.target.set(0, 1, 0);
    controls.update();
  }
  console.log('Câmera posicionada para o ambiente:', roomType);
}

function createLivingRoom() {
  // Sofá
  const sofaGeometry = new THREE.BoxGeometry(3, 1, 1.5);
  const sofaMaterial = new THREE.MeshStandardMaterial({ color: 0xff5400 });
  const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
  sofa.position.set(-2, 0.5, -2);
  sofa.castShadow = true;
  scene.add(sofa);

  // Mesa de centro
  const tableGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.8);
  const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.set(-2, 0.25, -0.5);
  table.castShadow = true;
  scene.add(table);

  // TV
  const tvGeometry = new THREE.BoxGeometry(2, 1.2, 0.1);
  const tvMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const tv = new THREE.Mesh(tvGeometry, tvMaterial);
  tv.position.set(0, 1.5, -4.8);
  scene.add(tv);

  // Rack da TV
  const rackGeometry = new THREE.BoxGeometry(2.5, 0.4, 0.6);
  const rackMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const rack = new THREE.Mesh(rackGeometry, rackMaterial);
  rack.position.set(0, 0.2, -4.5);
  rack.castShadow = true;
  scene.add(rack);
}

function createBedroom() {
  // Cama
  const bed = createBed();
  bed.position.set(0, -1.2, -1.5);
  scene.add(bed);

  // Criado-mudo
  const nightstand = createNightstand();
  nightstand.position.set(-1.5, -1.2, -1.5);
  scene.add(nightstand);

  // Guarda-roupa
  const wardrobe = createWardrobe();
  wardrobe.position.set(2, -0.5, -2.5);
  scene.add(wardrobe);
}

function createKitchen() {
  // Armários
  const cabinets = createCabinets();
  cabinets.position.set(-2.5, -0.5, -2.5);
  scene.add(cabinets);

  // Ilha
  const island = createIsland();
  island.position.set(0, -1.2, -1);
  scene.add(island);

  // Geladeira
  const fridge = createFridge();
  fridge.position.set(2, -0.5, -2.5);
  scene.add(fridge);
}

// Funções auxiliares para criar móveis
function createSofa() {
  const sofaGroup = new THREE.Group();

  // Base do sofá
  const baseGeometry = new THREE.BoxGeometry(2, 0.4, 0.8);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  sofaGroup.add(base);

  // Assento
  const seatGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
  const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xff5400 });
  const seat = new THREE.Mesh(seatGeometry, seatMaterial);
  seat.position.y = 0.25;
  seat.position.z = -0.1;
  sofaGroup.add(seat);

  // Encosto
  const backGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
  const back = new THREE.Mesh(backGeometry, seatMaterial);
  back.position.y = 0.5;
  back.position.z = -0.4;
  sofaGroup.add(back);

  return sofaGroup;
}

function createCoffeeTable() {
  const tableGroup = new THREE.Group();

  // Tampo
  const topGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.5);
  const topMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  tableGroup.add(top);

  // Pernas
  const legGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.05);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  
  for(let x = -0.35; x <= 0.35; x += 0.7) {
    for(let z = -0.2; z <= 0.2; z += 0.4) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(x, -0.2, z);
      tableGroup.add(leg);
    }
  }

  return tableGroup;
}

function createTV() {
  const tvGroup = new THREE.Group();

  // Tela
  const screenGeometry = new THREE.BoxGeometry(1.6, 0.9, 0.05);
  const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  tvGroup.add(screen);

  return tvGroup;
}

function createTVStand() {
  const standGroup = new THREE.Group();

  // Base
  const baseGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.4);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  standGroup.add(base);

  return standGroup;
}

function createWindow() {
  const windowGroup = new THREE.Group();

  // Moldura
  const frameGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.1);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  windowGroup.add(frame);

  // Vidro
  const glassGeometry = new THREE.PlaneGeometry(1, 1.6);
  const glassMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff,
    transparent: true,
    opacity: 0.3
  });
  const glass = new THREE.Mesh(glassGeometry, glassMaterial);
  glass.position.z = 0.01;
  windowGroup.add(glass);

  // Posicionar a janela na parede direita
  windowGroup.position.set(3.9, 1.8, 0); // x: próximo à parede direita, y: altura, z: centro
  windowGroup.rotation.y = Math.PI / 2; // Rotacionar para ficar perpendicular à parede direita

  scene.add(windowGroup);
  return windowGroup;
}

function createBed() {
  const bedGroup = new THREE.Group();

  // Base da cama
  const baseGeometry = new THREE.BoxGeometry(1.8, 0.3, 2);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  bedGroup.add(base);

  // Colchão
  const mattressGeometry = new THREE.BoxGeometry(1.7, 0.2, 1.9);
  const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.y = 0.25;
  bedGroup.add(mattress);

  // Cabeceira
  const headboardGeometry = new THREE.BoxGeometry(1.8, 1, 0.1);
  const headboardMaterial = new THREE.MeshStandardMaterial({ color: 0xff5400 });
  const headboard = new THREE.Mesh(headboardGeometry, headboardMaterial);
  headboard.position.set(0, 0.5, -1);
  bedGroup.add(headboard);

  return bedGroup;
}

function createNightstand() {
  const standGroup = new THREE.Group();

  // Corpo
  const bodyGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.4);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  standGroup.add(body);

  // Gaveta
  const drawerGeometry = new THREE.BoxGeometry(0.45, 0.15, 0.35);
  const drawerMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
  drawer.position.y = 0.1;
  standGroup.add(drawer);

  // Puxador
  const handleGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.02);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const handle = new THREE.Mesh(handleGeometry, handleMaterial);
  handle.position.set(0, 0.1, 0.18);
  standGroup.add(handle);

  return standGroup;
}

function createWardrobe() {
  const wardrobeGroup = new THREE.Group();

  // Corpo principal
  const bodyGeometry = new THREE.BoxGeometry(1.5, 2.2, 0.6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  wardrobeGroup.add(body);

  // Portas
  const doorGeometry = new THREE.BoxGeometry(0.73, 2.15, 0.05);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  
  const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  leftDoor.position.set(-0.37, 0, 0.3);
  wardrobeGroup.add(leftDoor);
  
  const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
  rightDoor.position.set(0.37, 0, 0.3);
  wardrobeGroup.add(rightDoor);

  // Puxadores
  const handleGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.02);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  
  const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
  leftHandle.position.set(-0.02, 0, 0.33);
  wardrobeGroup.add(leftHandle);
  
  const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
  rightHandle.position.set(0.02, 0, 0.33);
  wardrobeGroup.add(rightHandle);

  return wardrobeGroup;
}

function createCabinets() {
  const cabinetGroup = new THREE.Group();

  // Armários superiores
  const upperCabinetGeometry = new THREE.BoxGeometry(2, 0.8, 0.4);
  const cabinetMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const upperCabinet = new THREE.Mesh(upperCabinetGeometry, cabinetMaterial);
  upperCabinet.position.y = 0.7;
  cabinetGroup.add(upperCabinet);

  // Armários inferiores
  const lowerCabinetGeometry = new THREE.BoxGeometry(2, 0.8, 0.6);
  const lowerCabinet = new THREE.Mesh(lowerCabinetGeometry, cabinetMaterial);
  lowerCabinet.position.y = -0.7;
  cabinetGroup.add(lowerCabinet);

  // Bancada
  const countertopGeometry = new THREE.BoxGeometry(2, 0.05, 0.6);
  const countertopMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const countertop = new THREE.Mesh(countertopGeometry, countertopMaterial);
  countertop.position.y = -0.3;
  cabinetGroup.add(countertop);

  // Pia
  const sinkGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.4);
  const sinkMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
  sink.position.set(0, -0.25, 0);
  cabinetGroup.add(sink);

  return cabinetGroup;
}

function createIsland() {
  const islandGroup = new THREE.Group();

  // Base
  const baseGeometry = new THREE.BoxGeometry(1.5, 0.9, 0.8);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  islandGroup.add(base);

  // Tampo
  const topGeometry = new THREE.BoxGeometry(1.6, 0.05, 0.9);
  const topMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 0.475;
  islandGroup.add(top);

  // Banquetas
  const stoolGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 8);
  const stoolMaterial = new THREE.MeshStandardMaterial({ color: 0xff5400 });
  
  for(let x = -0.5; x <= 0.5; x += 1) {
    const stool = new THREE.Mesh(stoolGeometry, stoolMaterial);
    stool.position.set(x, 0, 0.6);
    islandGroup.add(stool);
  }

  return islandGroup;
}

function createFridge() {
  const fridgeGroup = new THREE.Group();

  // Corpo principal
  const bodyGeometry = new THREE.BoxGeometry(0.8, 2, 0.7);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  fridgeGroup.add(body);

  // Porta superior (freezer)
  const freezerDoorGeometry = new THREE.BoxGeometry(0.78, 0.6, 0.05);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  const freezerDoor = new THREE.Mesh(freezerDoorGeometry, doorMaterial);
  freezerDoor.position.set(0, 0.7, 0.35);
  fridgeGroup.add(freezerDoor);

  // Porta inferior (refrigerador)
  const fridgeDoorGeometry = new THREE.BoxGeometry(0.78, 1.35, 0.05);
  const fridgeDoor = new THREE.Mesh(fridgeDoorGeometry, doorMaterial);
  fridgeDoor.position.set(0, -0.3, 0.35);
  fridgeGroup.add(fridgeDoor);

  // Puxadores
  const handleGeometry = new THREE.BoxGeometry(0.02, 0.3, 0.05);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  
  const upperHandle = new THREE.Mesh(handleGeometry, handleMaterial);
  upperHandle.position.set(0.35, 0.7, 0.38);
  fridgeGroup.add(upperHandle);
  
  const lowerHandle = new THREE.Mesh(handleGeometry, handleMaterial);
  lowerHandle.position.set(0.35, -0.3, 0.38);
  fridgeGroup.add(lowerHandle);

  return fridgeGroup;
}

// Adicionar pontos interativos
function addInteractivePoints() {
  // Limpar pontos existentes
  const existingPoints = document.querySelectorAll('.point-marker');
  existingPoints.forEach(point => point.remove());

  // Adicionar novos pontos
  rooms[currentRoom].points.forEach(point => {
    const marker = document.createElement('div');
    marker.className = 'point-marker';
    marker.addEventListener('click', () => showPointInfo(point));
    
    const vector = new THREE.Vector3(
      point.position.x,
      point.position.y,
      point.position.z
    );
    
    updatePointPosition(marker, vector);
    document.getElementById('tour3D').appendChild(marker);
  });
}

// Atualizar posição dos pontos
function updatePointPosition(marker, vector) {
  vector.project(camera);
  
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  
  marker.style.transform = `translate(${x}px, ${y}px)`;
  marker.style.display = vector.z > 1 ? 'none' : 'block';
}

// Mostrar informações do ponto
function showPointInfo(point) {
  const pointInfo = document.getElementById('pointInfo');
  pointInfo.innerHTML = `
    <h3>${point.title}</h3>
    <p>${point.description}</p>
  `;
}

// Trocar de ambiente
function changeRoom(roomName) {
  currentRoom = roomName;
  const room = rooms[roomName];
  
  // Atualizar câmera
  camera.position.set(room.camera.x, room.camera.y, room.camera.z);
  controls.target.set(0, 1, -1);
  
  // Recriar ambiente com novas luzes
  createRoom(roomName);
  setupDynamicLights();
  
  // Atualizar pontos interativos
  addInteractivePoints();
  
  // Atualizar botões
  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.room === roomName);
  });
}

function checkSceneReady() {
  if (!scene || !camera || !renderer) {
    console.error('Objetos básicos não foram inicializados:', {
      scene: !!scene,
      camera: !!camera,
      renderer: !!renderer
    });
    return false;
  }

  if (!scene.children.length) {
    console.error('A cena está vazia');
    return false;
  }

  return true;
}

// Animação
function animate() {
  requestAnimationFrame(animate);
  
  try {
    if (!checkSceneReady()) {
      console.error('Cena não está pronta para renderização');
      return;
    }

    // Atualizar controles
    if (controls) {
      controls.update();
    }
    
    // Atualizar posições dos pontos
    const markers = document.querySelectorAll('.point-marker');
    markers.forEach((marker, index) => {
      const point = rooms[currentRoom].points[index];
      if (point) {
        const vector = new THREE.Vector3(
          point.position.x,
          point.position.y,
          point.position.z
        );
        updatePointPosition(marker, vector);
      }
    });
    
    // Renderizar a cena
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  } catch (error) {
    console.error('Erro na animação:', error);
  }
}

function setupRoomInteractions() {
  canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verificar clique nas áreas interativas
    checkLightSwitch(x, y);
    checkTVArea(x, y);
    checkCurtainArea(x, y);
  });
}

function drawRoom() {
  console.log('Iniciando desenho da sala');
  
  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Definir fundo branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Definir centro da sala
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = Math.min(canvas.width, canvas.height) / 800;

  console.log('Dimensões calculadas:', {
    centerX,
    centerY,
    scale,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  });

  try {
    // Desenhar paredes
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.rect(centerX - 300 * scale, centerY - 200 * scale, 600 * scale, 400 * scale);
    ctx.stroke();

    // Desenhar sofá
    drawSofa(centerX - 200 * scale, centerY, 200 * scale, 100 * scale);

    // Desenhar TV
    drawTV(centerX + 250 * scale, centerY - 150 * scale, 100 * scale, 60 * scale);

    // Desenhar mesa de centro
    drawCoffeeTable(centerX, centerY, 120 * scale, 60 * scale);

    // Desenhar luzes
    drawLights(centerX, centerY, scale);

    // Desenhar ícones interativos
    drawInteractiveIcons(centerX, centerY, scale);

    console.log('Sala desenhada com sucesso');
  } catch (error) {
    console.error('Erro ao desenhar sala:', error);
  }
}

function drawSofa(x, y, width, height) {
  ctx.beginPath();
  ctx.fillStyle = '#ff5400';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  
  // Base do sofá
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  
  // Encosto
  ctx.fillRect(x, y - height/2, width, height/4);
  ctx.strokeRect(x, y - height/2, width, height/4);
}

function drawTV(x, y, width, height) {
  ctx.beginPath();
  ctx.fillStyle = roomState.tv ? '#666' : '#333';
  ctx.fillRect(x, y, width, height);
  
  // Tela da TV
  if (roomState.tv) {
    ctx.fillStyle = '#aaa';
    ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
  }
}

function drawCoffeeTable(x, y, width, height) {
  ctx.beginPath();
  ctx.fillStyle = '#333';
  ctx.fillRect(x - width/2, y - height/2, width, height);
}

function drawLights(centerX, centerY, scale) {
  // Luz principal
  if (roomState.lights) {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
    ctx.arc(centerX, centerY, 250 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spots
  const spotRadius = 30 * scale;
  const spots = [
    { x: centerX - 200 * scale, y: centerY - 150 * scale },
    { x: centerX + 200 * scale, y: centerY - 150 * scale }
  ];

  spots.forEach(spot => {
    ctx.beginPath();
    ctx.fillStyle = roomState.lights ? '#ffd700' : '#333';
    ctx.arc(spot.x, spot.y, spotRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawInteractiveIcons(centerX, centerY, scale) {
  // Ícone de interruptor
  ctx.fillStyle = '#333';
  ctx.font = `${20 * scale}px Arial`;
  ctx.fillText('💡', centerX - 290 * scale, centerY - 180 * scale);

  // Ícone de TV
  ctx.fillText('📺', centerX + 260 * scale, centerY - 180 * scale);

  // Ícone de cortina
  ctx.fillText('🪟', centerX + 200 * scale, centerY - 190 * scale);
}

function checkLightSwitch(x, y) {
  // Área do interruptor
  const switchArea = {
    x: canvas.width/2 - 290,
    y: canvas.height/2 - 200,
    width: 40,
    height: 40
  };

  if (isClickInArea(x, y, switchArea)) {
    roomState.lights = !roomState.lights;
    drawRoom();
  }
}

function checkTVArea(x, y) {
  // Área da TV
  const tvArea = {
    x: canvas.width/2 + 250,
    y: canvas.height/2 - 150,
    width: 100,
    height: 60
  };

  if (isClickInArea(x, y, tvArea)) {
    roomState.tv = !roomState.tv;
    drawRoom();
  }
}

function checkCurtainArea(x, y) {
  // Área da cortina
  const curtainArea = {
    x: canvas.width/2 + 200,
    y: canvas.height/2 - 200,
    width: 100,
    height: 100
  };

  if (isClickInArea(x, y, curtainArea)) {
    roomState.curtains = !roomState.curtains;
    drawRoom();
  }
}

function isClickInArea(x, y, area) {
  return x >= area.x && x <= area.x + area.width &&
         y >= area.y && y <= area.y + area.height;
}

// Atualizar a função de redimensionamento
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawRoom();
});

// Mostrar mensagem de erro para o usuário
function showErrorMessage(message) {
  const overlay = document.getElementById('tourOverlay');
  if (overlay) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tour-error';
    errorDiv.innerHTML = `
      <h2>Ops! Algo deu errado</h2>
      <p>${message}</p>
      <p>Por favor, tente recarregar a página ou use um navegador mais recente.</p>
    `;
    overlay.appendChild(errorDiv);
  }
}

// Configurar event listeners
function setupEventListeners() {
  window.addEventListener('resize', onWindowResize, false);
  
  // Botões de ambiente
  document.querySelectorAll('.room-btn').forEach(button => {
    button.addEventListener('click', () => {
      const room = button.dataset.room;
      if (room) {
        changeRoom(room);
      }
    });
  });

  // Botão de início
  const startButton = document.getElementById('startTour');
  const overlay = document.getElementById('tourOverlay');
  
  startButton.addEventListener('click', () => {
    overlay.classList.add('hidden');
    setTimeout(() => overlay.style.display = 'none', 500);
  });

  // Controles de funcionalidades
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const control = btn.dataset.control;
      showFeatureInfo(control);
    });
  });
}

// Redimensionamento da janela
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Carregar imagens dos ambientes
function loadRoomImages() {
    const rooms = ['sala', 'quarto', 'cozinha'];
    rooms.forEach(room => {
        const img = new Image();
        img.src = `assets/rooms/${room}.jpg`;
        img.onload = () => {
            roomImages[room] = img;
            if (room === currentRoom) {
                drawCurrentRoom();
            }
        };
    });
}

// Desenhar ambiente atual
function drawCurrentRoom() {
    if (!roomImages[currentRoom]) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem do ambiente
    const img = roomImages[currentRoom];
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    
    ctx.drawImage(img, x, y, width, height);

    // Atualizar pontos interativos
    updateInteractionPoints();
}

// Atualizar pontos interativos
function updateInteractionPoints() {
    interactionPoints.innerHTML = '';
    
    interactivePoints[currentRoom].forEach(point => {
        const pointElement = document.createElement('div');
        pointElement.className = 'interaction-point';
        pointElement.style.left = `${point.x}%`;
        pointElement.style.top = `${point.y}%`;
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${point.icon}`;
        pointElement.appendChild(icon);

        pointElement.addEventListener('click', () => showPointInfo(point));
        pointElement.addEventListener('mouseenter', () => showPointInfo(point));
        pointElement.addEventListener('mouseleave', hidePointInfo);

        interactionPoints.appendChild(pointElement);
    });
}

// Mostrar informações de funcionalidades
function showFeatureInfo(control) {
    const features = {
        lights: {
            title: 'Iluminação Inteligente',
            description: 'Controle completo da iluminação via app ou voz. Crie cenas e automatize horários.'
        },
        temperature: {
            title: 'Climatização Smart',
            description: 'Temperatura ideal em cada ambiente, com aprendizado das suas preferências.'
        },
        curtains: {
            title: 'Cortinas Automatizadas',
            description: 'Controle motorizado com integração solar e programação de horários.'
        },
        security: {
            title: 'Sistema de Segurança',
            description: 'Câmeras, sensores e alertas integrados para máxima proteção.'
        }
    };

    const feature = features[control];
    infoCard.innerHTML = `
        <h3>${feature.title}</h3>
        <p>${feature.description}</p>
    `;
}

// Ocultar informações
function hidePointInfo() {
    infoCard.style.opacity = '0.8';
    infoCard.innerHTML = `
        <h3>Explore o Ambiente</h3>
        <p>Passe o mouse sobre os pontos para descobrir as funcionalidades.</p>
    `;
} 