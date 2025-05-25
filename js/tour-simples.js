// Dados dos ambientes
const ambientes = {
  sala: {
    imagem: 'assets/automação.png',
    pontos: [
      {
        x: 30,
        y: 40,
        icone: 'lightbulb',
        titulo: 'Iluminação Inteligente',
        descricao: 'Controle as luzes via app ou voz. Crie cenas personalizadas e automatize horários.'
      },
      {
        x: 60,
        y: 50,
        icone: 'tv',
        titulo: 'Home Theater',
        descricao: 'Sistema de áudio e vídeo integrado com controle por voz e app.'
      },
      {
        x: 80,
        y: 30,
        icone: 'blinds',
        titulo: 'Cortinas Automatizadas',
        descricao: 'Cortinas motorizadas com controle remoto e integração com sensores de luz.'
      }
    ]
  },
  quarto: {
    imagem: 'assets/casa-minas.jpg',
    pontos: [
      {
        x: 40,
        y: 45,
        icone: 'temperature-high',
        titulo: 'Climatização Smart',
        descricao: 'Ar condicionado inteligente que aprende suas preferências de temperatura.'
      },
      {
        x: 70,
        y: 35,
        icone: 'lightbulb',
        titulo: 'Iluminação Adaptativa',
        descricao: 'Luzes que se ajustam automaticamente ao longo do dia.'
      },
      {
        x: 25,
        y: 60,
        icone: 'music',
        titulo: 'Áudio Ambiente',
        descricao: 'Sistema de som integrado com controle por voz.'
      }
    ]
  },
  cozinha: {
    imagem: 'assets/robo.jpg',
    pontos: [
      {
        x: 45,
        y: 55,
        icone: 'blender',
        titulo: 'Eletrodomésticos Smart',
        descricao: 'Geladeira, forno e outros aparelhos conectados ao seu smartphone.'
      },
      {
        x: 75,
        y: 40,
        icone: 'microphone',
        titulo: 'Assistente Virtual',
        descricao: 'Controle por voz para receitas, timers e listas de compras.'
      },
      {
        x: 20,
        y: 45,
        icone: 'shield-alt',
        titulo: 'Sensores de Segurança',
        descricao: 'Detectores de fumaça e gás com alertas no celular.'
      }
    ]
  }
};

// Estado dos controles
const estado = {
  luzes: false,
  temperatura: 23,
  cortinas: false,
  tv: false
};

// Elementos do DOM
const ambienteImagem = document.getElementById('ambiente-imagem');
const pontosContainer = document.getElementById('pontos-container');
const infoCard = document.getElementById('info-card');
const botoesAmbiente = document.querySelectorAll('.ambiente-btn');
const botoesControle = document.querySelectorAll('.controle-btn');
const ambiente = document.querySelector('.ambiente-simulado');
const tempValor = document.querySelector('.temp-valor');
const sensorTemp = document.querySelector('.sensor-temperatura .temperatura');
const botoesTempControle = document.querySelectorAll('.temp-btn');

// Função para mudar de ambiente
function mudarAmbiente(nomeAmbiente) {
  const ambiente = ambientes[nomeAmbiente];
  
  // Atualizar imagem
  ambienteImagem.src = ambiente.imagem;
  ambienteImagem.alt = `Ambiente ${nomeAmbiente}`;
  
  // Atualizar botões
  botoesAmbiente.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ambiente === nomeAmbiente);
  });
  
  // Limpar e adicionar pontos interativos
  pontosContainer.innerHTML = '';
  ambiente.pontos.forEach(ponto => {
    const elemento = criarPontoInterativo(ponto);
    pontosContainer.appendChild(elemento);
  });
  
  // Resetar card de informações
  atualizarInfoCard('Bem-vindo ao Tour Virtual', 'Selecione um ambiente e explore as funcionalidades da casa inteligente.');
}

// Função para criar ponto interativo
function criarPontoInterativo(ponto) {
  const elemento = document.createElement('div');
  elemento.className = 'ponto';
  elemento.style.left = `${ponto.x}%`;
  elemento.style.top = `${ponto.y}%`;
  
  const icone = document.createElement('i');
  icone.className = `fas fa-${ponto.icone}`;
  elemento.appendChild(icone);
  
  // Eventos do mouse
  elemento.addEventListener('mouseenter', () => {
    atualizarInfoCard(ponto.titulo, ponto.descricao);
  });
  
  elemento.addEventListener('mouseleave', () => {
    atualizarInfoCard('Bem-vindo ao Tour Virtual', 'Selecione um ambiente e explore as funcionalidades da casa inteligente.');
  });
  
  return elemento;
}

// Função para atualizar o card de informações
function atualizarInfoCard(titulo, descricao) {
  infoCard.innerHTML = `
    <h3>${titulo}</h3>
    <p>${descricao}</p>
  `;
}

// Função para controlar as luzes
function controlarLuzes() {
  estado.luzes = !estado.luzes;
  ambiente.classList.toggle('luzes-acesas', estado.luzes);
  
  const mensagem = estado.luzes ? 
    'Luzes acesas! O ambiente está bem iluminado.' :
    'Luzes apagadas. Ambiente com iluminação natural.';
  
  atualizarInfoCard('Controle de Iluminação', mensagem);
  atualizarBotaoControle('luzes', estado.luzes);
}

// Função para controlar a temperatura
function controlarTemperatura(acao) {
  if (acao === 'aumentar' && estado.temperatura < 30) {
    estado.temperatura++;
  } else if (acao === 'diminuir' && estado.temperatura > 16) {
    estado.temperatura--;
  }
  
  tempValor.textContent = `${estado.temperatura}°C`;
  sensorTemp.textContent = `${estado.temperatura}°C`;
  
  atualizarInfoCard(
    'Controle de Temperatura',
    `Temperatura ajustada para ${estado.temperatura}°C`
  );
}

// Função para controlar as cortinas
function controlarCortinas() {
  estado.cortinas = !estado.cortinas;
  ambiente.classList.toggle('cortinas-fechadas', estado.cortinas);
  
  const mensagem = estado.cortinas ?
    'Cortinas fechadas. Privacidade ativada.' :
    'Cortinas abertas. Aproveitando a luz natural.';
  
  atualizarInfoCard('Controle das Cortinas', mensagem);
  atualizarBotaoControle('cortinas', estado.cortinas);
}

// Função para controlar a TV
function controlarTV() {
  estado.tv = !estado.tv;
  const tv = document.querySelector('.tv');
  tv.classList.toggle('tv-ligada', estado.tv);
  
  const mensagem = estado.tv ?
    'TV ligada! Aproveite seu entretenimento.' :
    'TV desligada.';
  
  atualizarInfoCard('Controle da TV', mensagem);
  atualizarBotaoControle('tv', estado.tv);
}

// Função para atualizar o visual dos botões de controle
function atualizarBotaoControle(controle, ativo) {
  const botao = document.querySelector(`[data-controle="${controle}"]`);
  botao.classList.toggle('ativo', ativo);
}

// Event Listeners
botoesAmbiente.forEach(botao => {
  botao.addEventListener('click', () => {
    const ambiente = botao.dataset.ambiente;
    mudarAmbiente(ambiente);
  });
});

botoesControle.forEach(botao => {
  botao.addEventListener('click', () => {
    const controle = botao.dataset.controle;
    
    switch(controle) {
      case 'luzes':
        controlarLuzes();
        break;
      case 'cortinas':
        controlarCortinas();
        break;
      case 'tv':
        controlarTV();
        break;
    }
  });
});

// Event Listeners para controle de temperatura
botoesTempControle.forEach(botao => {
  botao.addEventListener('click', () => {
    controlarTemperatura(botao.dataset.temp);
  });
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Atualizar valores iniciais
  tempValor.textContent = `${estado.temperatura}°C`;
  sensorTemp.textContent = `${estado.temperatura}°C`;
  
  // Mensagem inicial
  atualizarInfoCard(
    'Bem-vindo à Sala Inteligente',
    'Use os controles abaixo para interagir com o ambiente e ver como a automação funciona na prática.'
  );
});

// Inicializar com o primeiro ambiente
mudarAmbiente('sala'); 