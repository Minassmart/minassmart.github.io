// Sistema de Otimização de Imagens
class ImageOptimizer {
    constructor() {
        this.supportsWebP = this.checkWebPSupport();
        this.supportsAVIF = this.checkAVIFSupport();
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.viewportWidth = window.innerWidth;
    }

    async checkWebPSupport() {
        try {
            return document.createElement('canvas')
                .toDataURL('image/webp')
                .indexOf('data:image/webp') === 0;
        } catch (e) {
            return false;
        }
    }

    async checkAVIFSupport() {
        if (!createImageBitmap) return false;
        
        const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        try {
            return await createImageBitmap(await fetch(avifData).then(r => r.blob()))
                .then(() => true)
                .catch(() => false);
        } catch (e) {
            return false;
        }
    }

    optimizeImageSrc(originalSrc, width = null) {
        const url = new URL(originalSrc, window.location.href);
        const path = url.pathname;
        const extension = path.split('.').pop().toLowerCase();
        
        // Se já for um formato otimizado, retornar original
        if (['webp', 'avif'].includes(extension)) {
            return originalSrc;
        }

        // Determinar o melhor formato
        let format = 'jpg'; // fallback
        if (this.supportsAVIF) {
            format = 'avif';
        } else if (this.supportsWebP) {
            format = 'webp';
        }

        // Calcular largura ideal
        const targetWidth = width || this.calculateIdealWidth();
        
        // Construir URL otimizada
        const optimizedPath = path.replace(new RegExp(`\\.${extension}$`), '');
        return `/images/optimized${optimizedPath}-${targetWidth}w.${format}`;
    }

    calculateIdealWidth() {
        const breakpoints = [320, 480, 768, 1024, 1366, 1920];
        const targetWidth = this.viewportWidth * this.devicePixelRatio;
        
        return breakpoints.find(bp => bp >= targetWidth) || breakpoints[breakpoints.length - 1];
    }

    generateSrcSet(originalSrc) {
        const widths = [320, 480, 768, 1024, 1366, 1920];
        return widths
            .map(w => `${this.optimizeImageSrc(originalSrc, w)} ${w}w`)
            .join(', ');
    }

    optimizeImages() {
        document.querySelectorAll('img:not([data-no-optimize])').forEach(img => {
            const originalSrc = img.getAttribute('src') || img.getAttribute('data-src');
            if (!originalSrc) return;

            // Adicionar srcset para responsividade
            img.setAttribute('srcset', this.generateSrcSet(originalSrc));
            
            // Definir tamanhos para diferentes viewports
            img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
            
            // Definir src otimizado como fallback
            img.setAttribute('src', this.optimizeImageSrc(originalSrc));

            // Adicionar loading lazy
            img.setAttribute('loading', 'lazy');
            
            // Adicionar decoding async
            img.setAttribute('decoding', 'async');
        });

        // Otimizar imagens de fundo
        document.querySelectorAll('[data-bg-image]').forEach(el => {
            const originalSrc = el.getAttribute('data-bg-image');
            if (!originalSrc) return;

            const optimizedSrc = this.optimizeImageSrc(originalSrc);
            el.style.backgroundImage = `url('${optimizedSrc}')`;
        });
    }

    observeNewImages() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        const images = node.matches('img') ? [node] : node.querySelectorAll('img');
                        images.forEach(img => {
                            if (!img.hasAttribute('data-no-optimize')) {
                                this.optimizeImage(img);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    optimizeImage(img) {
        const originalSrc = img.getAttribute('src') || img.getAttribute('data-src');
        if (!originalSrc) return;

        img.setAttribute('srcset', this.generateSrcSet(originalSrc));
        img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
        img.setAttribute('src', this.optimizeImageSrc(originalSrc));
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const imageOptimizer = new ImageOptimizer();
    await Promise.all([
        imageOptimizer.checkWebPSupport(),
        imageOptimizer.checkAVIFSupport()
    ]);
    
    imageOptimizer.optimizeImages();
    imageOptimizer.observeNewImages();
    
    // Reotimizar imagens quando a janela for redimensionada
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            imageOptimizer.optimizeImages();
        }, 250);
    });
}); 