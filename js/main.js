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

// Função para verificar se os cookies já foram aceitos
function checkCookieConsent() {
    return localStorage.getItem('cookieConsent');
}

// Função para mostrar o banner de cookies
function showCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!checkCookieConsent()) {
    banner.classList.add('show');
  }
}

// Função para salvar a escolha do usuário de forma segura
function saveCookieChoice(choice) {
    if (typeof choice !== 'string' || !['accept', 'reject'].includes(choice)) {
        console.error('Escolha de cookie inválida');
        return;
    }
    localStorage.setItem('cookieConsent', choice);
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.remove('show');
    }
}

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
});

// Menu mobile
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
  menuToggle.setAttribute('aria-expanded', !expanded);
  navMenu.classList.toggle('open');
});

// Animação de scroll reveal
const fadeSections = document.querySelectorAll('.fade-section');

const revealOnScroll = () => {
  const windowBottom = window.innerHeight + window.scrollY;
  fadeSections.forEach(section => {
    if (windowBottom > section.offsetTop + 100) {
      section.classList.add('visible');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

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