// Sistema de Analytics Personalizado
class Analytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
    }

    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    trackPageView() {
        const data = {
            type: 'pageview',
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            deviceType: this.getDeviceType(),
            performance: this.getPerformanceMetrics()
        };

        this.sendToServer(data);
    }

    trackEvent(category, action, label = null, value = null) {
        const data = {
            type: 'event',
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            url: window.location.href
        };

        this.sendToServer(data);
    }

    trackUserEngagement() {
        let scrollDepth = 0;
        let timeOnPage = 0;

        // Monitorar profundidade do scroll
        window.addEventListener('scroll', () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPosition = window.scrollY;
            const newScrollDepth = Math.round((scrollPosition / docHeight) * 100);
            
            if (newScrollDepth > scrollDepth) {
                scrollDepth = newScrollDepth;
                this.trackEvent('engagement', 'scroll_depth', `${scrollDepth}%`);
            }
        });

        // Monitorar tempo na página
        setInterval(() => {
            timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
            this.trackEvent('engagement', 'time_on_page', null, timeOnPage);
        }, 30000);
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    getPerformanceMetrics() {
        if (!window.performance) return null;

        const timing = window.performance.timing;
        const navigation = window.performance.navigation;

        return {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
            readyStart: timing.fetchStart - timing.navigationStart,
            redirectTime: timing.redirectEnd - timing.redirectStart,
            appcacheTime: timing.domainLookupStart - timing.fetchStart,
            unloadEventTime: timing.unloadEventEnd - timing.unloadEventStart,
            lookupDomainTime: timing.domainLookupEnd - timing.domainLookupStart,
            connectTime: timing.connectEnd - timing.connectStart,
            requestTime: timing.responseEnd - timing.requestStart,
            initDomTreeTime: timing.domInteractive - timing.responseEnd,
            loadEventTime: timing.loadEventEnd - timing.loadEventStart,
            navigationType: navigation.type
        };
    }

    async sendToServer(data) {
        try {
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar dados de analytics');
            }
        } catch (error) {
            console.error('Erro ao enviar analytics:', error);
            // Armazenar localmente para tentar enviar depois
            this.events.push(data);
        }
    }

    retryFailedEvents() {
        setInterval(() => {
            if (this.events.length > 0) {
                const failedEvents = [...this.events];
                this.events = [];
                
                failedEvents.forEach(event => {
                    this.sendToServer(event);
                });
            }
        }, 60000); // Tentar reenviar a cada minuto
    }
}

// Inicialização
const analytics = new Analytics();

document.addEventListener('DOMContentLoaded', () => {
    analytics.trackPageView();
    analytics.trackUserEngagement();
    analytics.retryFailedEvents();

    // Rastrear cliques em elementos importantes
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .btn');
        if (target) {
            analytics.trackEvent(
                'interaction',
                'click',
                target.textContent.trim() || target.getAttribute('aria-label') || 'unknown'
            );
        }
    });

    // Rastrear envios de formulário
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => {
            analytics.trackEvent('form', 'submit', form.getAttribute('id') || 'unknown');
        });
    });
}); 