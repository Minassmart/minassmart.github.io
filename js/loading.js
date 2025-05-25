// Loading System
const loader = {
    show() {
        if (!document.getElementById('loader-wrapper')) {
            const loaderHTML = `
                <div id="loader-wrapper">
                    <div class="loader-content">
                        <div class="spinner"></div>
                        <p>Carregando...</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHTML);
        }
        document.getElementById('loader-wrapper').style.display = 'flex';
    },
    
    hide() {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                loader.style.opacity = '1';
            }, 300);
        }
    }
};

// Lazy Loading para imagens
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
                
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});

// Preload de recursos críticos
const preloadResources = () => {
    const criticalResources = [
        '/css/styles.css',
        '/js/main.js',
        '/assets/logo.png'
    ];
    
    criticalResources.forEach(resource => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = resource;
        
        if (resource.endsWith('.css')) {
            preloadLink.as = 'style';
        } else if (resource.endsWith('.js')) {
            preloadLink.as = 'script';
        } else if (resource.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
            preloadLink.as = 'image';
        }
        
        document.head.appendChild(preloadLink);
    });
};

// Otimização de fonte
const optimizeFonts = () => {
    const fontUrls = [
        'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap'
    ];
    
    fontUrls.forEach(url => {
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = url;
        fontLink.as = 'style';
        fontLink.onload = () => fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    });
};

// Inicialização
window.addEventListener('load', () => {
    loader.hide();
    preloadResources();
    optimizeFonts();
}); 