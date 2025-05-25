// Função para sanitizar strings e prevenir XSS
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Função para gerar token CSRF
function generateCSRFToken() {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('csrfToken', token);
    return token;
}

// Função para validar token CSRF
function validateCSRFToken(token) {
    return token === localStorage.getItem('csrfToken');
}

// Verificar suporte a recursos modernos
const supportsLocalStorage = (function() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch(e) {
    return false;
  }
})();

const supportsIntersectionObserver = 'IntersectionObserver' in window;
const supportsWebGL = (function() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch(e) {
    return false;
  }
})();

// Função para mostrar o banner de cookies
function showCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  if (!checkCookieConsent()) {
    banner.classList.add('show');
    setupCookieButtons();
  }
}

// Função para salvar a escolha do usuário de forma segura
function saveCookieChoice(choice) {
  if (supportsLocalStorage) {
    try {
      localStorage.setItem('cookieConsent', choice);
      return true;
    } catch (e) {
      console.error('Erro ao salvar preferência de cookies:', e);
      // Fallback para cookies
      document.cookie = `cookieConsent=${choice};max-age=31536000;path=/`;
      return true;
    }
  } else {
    // Fallback para cookies
    document.cookie = `cookieConsent=${choice};max-age=31536000;path=/`;
    return true;
  }
}

// Função para configurar os botões de cookies
function setupCookieButtons() {
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');
  const banner = document.getElementById('cookie-banner');

  if (!acceptBtn || !rejectBtn || !banner) return;

  const handleButtonClick = (choice) => {
    if (saveCookieChoice(choice)) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 500);
    }
  };

  // Usando addEventListener em vez de onclick para melhor compatibilidade
  acceptBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleButtonClick('accept');
  }, false);

  rejectBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleButtonClick('reject');
  }, false);

  // Adicionar eventos de toque para dispositivos móveis
  acceptBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleButtonClick('accept');
  }, false);

  rejectBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleButtonClick('reject');
  }, false);
}

// Inicializar o banner de cookies quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  showCookieBanner();
});

// Adicionar event listeners aos botões
document.addEventListener('DOMContentLoaded', function() {
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-cookies');

  if (acceptButton) {
    acceptButton.addEventListener('click', () => saveCookieChoice('accepted'));
  }

  if (rejectButton) {
    rejectButton.addEventListener('click', () => saveCookieChoice('rejected'));
  }

  // Mostrar o banner se necessário
  showCookieBanner();

  // Configurar CSRF token para formulários
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const csrfInput = form.querySelector('input[name="_csrf"]');
    if (csrfInput) {
      csrfInput.value = generateCSRFToken();
    }

    // Adicionar validação de formulário
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validar CSRF token
      const formToken = form.querySelector('input[name="_csrf"]').value;
      if (!validateCSRFToken(formToken)) {
        console.error('Token CSRF inválido');
        return;
      }

      // Validar honeypot
      const honeypot = form.querySelector('input[name="_honey"]');
      if (honeypot && honeypot.value) {
        console.error('Possível submissão automatizada detectada');
        return;
      }

      // Sanitizar inputs
      const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
      inputs.forEach(input => {
        input.value = sanitizeInput(input.value);
      });

      // Submeter formulário
      form.submit();
    });
  });

  // Configurar proteções para o Smart CTA
  const smartCta = document.getElementById('smart-cta');
  if (smartCta) {
    const closeBtn = smartCta.querySelector('.smart-cta-close');
    let hasShown = false;
    let lastScrollTop = 0;
    let dismissedTimestamp = localStorage.getItem('ctaDismissed');

    // Validar timestamp antes de usar
    if (dismissedTimestamp) {
      try {
        dismissedTimestamp = parseInt(dismissedTimestamp);
        if (isNaN(dismissedTimestamp)) {
          dismissedTimestamp = null;
        }
      } catch {
        dismissedTimestamp = null;
      }
    }

    function canShowAgain() {
      if (!dismissedTimestamp) return true;
      const hoursSinceDismissed = (Date.now() - dismissedTimestamp) / (1000 * 60 * 60);
      return hoursSinceDismissed >= 24;
    }

    function showCta() {
      if (!hasShown && canShowAgain()) {
        smartCta.classList.add('show');
        hasShown = true;
      }
    }

    function hideCta() {
      smartCta.classList.remove('show');
      localStorage.setItem('ctaDismissed', Date.now().toString());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', hideCta);
    }
  }

  // Inicializar funcionalidades
  initializeMenu();
  initializeSections();
  initializeContactForm();
  
  // Verificar se os elementos principais existem
  const mainContent = document.querySelector('main');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  if (!mainContent || !header || !footer) {
    console.error('Elementos principais não encontrados');
    showError('Erro ao carregar a página. Por favor, recarregue.');
    return;
  }

  // Verificar se as imagens foram carregadas
  const images = document.querySelectorAll('img');
  let loadedImages = 0;

  images.forEach(img => {
    if (img.complete) {
      loadedImages++;
    } else {
      img.addEventListener('load', () => {
        loadedImages++;
        if (loadedImages === images.length) {
          console.log('Todas as imagens carregadas');
        }
      });

      img.addEventListener('error', () => {
        console.error('Erro ao carregar imagem:', img.src);
        img.src = 'assets/placeholder.png';
      });
    }
  });
});

// Menu mobile
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('nav');

if (menuToggle && navMenu) {
  // Detectar tipo de dispositivo
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    // Configuração para dispositivos touch
    menuToggle.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    menuToggle.addEventListener('touchend', toggleMenu, { passive: false });
  } else {
    // Configuração para dispositivos não-touch
    menuToggle.addEventListener('click', toggleMenu);
  }
  
  // Fechar menu ao clicar fora (com suporte a touch)
  document.addEventListener(isTouchDevice ? 'touchend' : 'click', (e) => {
    if (navMenu.classList.contains('open') && 
        !navMenu.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  }, { passive: true });

  // Fechar menu ao redimensionar a tela
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// Animação de scroll reveal com fallback
const revealOnScroll = () => {
  if (supportsIntersectionObserver) {
    // Usar IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    document.querySelectorAll('.fade-section').forEach(section => {
      observer.observe(section);
    });
  } else {
    // Fallback para scroll event
    const checkScroll = () => {
      const windowBottom = window.innerHeight + window.scrollY;
      document.querySelectorAll('.fade-section:not(.visible)').forEach(section => {
        if (windowBottom > section.offsetTop + 100) {
          section.classList.add('visible');
        }
      });
    };
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    checkScroll();
  }
};

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
      // Fecha o menu mobile se estiver aberto
      if (navMenu.classList.contains('open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      }
    }
  });
});

// Animação de fade nas seções
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-section').forEach(section => {
  observer.observe(section);
});

// FAQ Functionality
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  const faqSearch = document.getElementById('faq-search');
  const showMoreBtn = document.getElementById('show-more-faq');
  let allFaqsVisible = false;

  // Toggle FAQ answers
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close all other items
      faqItems.forEach(otherItem => otherItem.classList.remove('active'));
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Search functionality
  faqSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    faqItems.forEach(item => {
      const question = item.querySelector('h3').textContent.toLowerCase();
      const answer = item.querySelector('p').textContent.toLowerCase();
      const keywords = item.getAttribute('data-question').toLowerCase();
      
      const matches = question.includes(searchTerm) || 
                     answer.includes(searchTerm) || 
                     keywords.includes(searchTerm);
      
      if (matches) {
        item.classList.remove('hidden');
        item.classList.add('visible');
      } else {
        item.classList.add('hidden');
        item.classList.remove('visible');
      }
    });

    // Hide "Show More" button if searching
    showMoreBtn.style.display = searchTerm ? 'none' : 'block';
  });

  // Show More functionality
  showMoreBtn.addEventListener('click', () => {
    allFaqsVisible = !allFaqsVisible;
    
    faqItems.forEach((item, index) => {
      if (index >= 3) {
        if (allFaqsVisible) {
          item.classList.remove('hidden');
          item.classList.add('visible');
        } else {
          item.classList.add('hidden');
          item.classList.remove('visible');
        }
      }
    });

    showMoreBtn.textContent = allFaqsVisible ? 'Ver Menos' : 'Ver Mais Perguntas';
  });

  // Initially hide FAQs after the first 3
  faqItems.forEach((item, index) => {
    if (index >= 3) {
      item.classList.add('hidden');
    }
  });
});

// Detector de erros de carregamento
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Erro detectado:', msg, 'em', url, 'linha:', lineNo);
    if (msg.includes('Failed to load resource') || msg.includes('timeout')) {
        window.location.href = '/error.html';
    }
    return false;
};

// Verificar se os recursos críticos foram carregados
window.addEventListener('load', function() {
    const fontAwesome = document.querySelector('link[href*="font-awesome"]');
    if (!fontAwesome || !fontAwesome.sheet) {
        handleFontAwesomeError();
    }
});

// Verificar se os cookies já foram aceitos
function checkCookieConsent() {
  if (supportsLocalStorage) {
    const stored = localStorage.getItem('cookieConsent');
    if (stored) return stored;
  }
  // Fallback para cookies
  const match = document.cookie.match(/cookieConsent=([^;]+)/);
  return match ? match[1] : null;
}

// Função para inicializar o menu
function initializeMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('nav');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => toggleMenu(menuToggle, navMenu));
    
    // Fechar menu ao clicar em links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

// Função para alternar o menu
function toggleMenu(menuToggle, navMenu) {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', !isExpanded);
  navMenu.classList.toggle('open');
  document.body.style.overflow = isExpanded ? '' : 'hidden';
}

// Função para inicializar as seções
function initializeSections() {
  // Configurar animações de fade
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-section').forEach(section => {
      observer.observe(section);
    });
  }
}

// Função para inicializar o formulário de contato
function initializeContactForm() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar CSRF token
    const formToken = form.querySelector('input[name="_csrf"]').value;
    if (!validateCSRFToken(formToken)) {
      console.error('Token CSRF inválido');
      return;
    }

    // Validar honeypot
    const honeypot = form.querySelector('input[name="_honey"]');
    if (honeypot && honeypot.value) {
      console.error('Possível submissão automatizada detectada');
      return;
    }

    // Sanitizar inputs
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    inputs.forEach(input => {
      input.value = sanitizeInput(input.value);
    });

    // Submeter formulário
    form.submit();
  });
} 