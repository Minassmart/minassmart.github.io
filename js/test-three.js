// Variáveis globais
let scene, camera, renderer;

// Função de inicialização
function init() {
    // Criar cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Criar câmera
    const container = document.getElementById('tour-container');
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Criar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Criar um cubo de teste
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff5400 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animação
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Redimensionamento
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init); 