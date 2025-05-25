// Sistema de Notificações Push
class NotificationSystem {
    constructor() {
        this.permission = Notification.permission;
        this.supported = 'Notification' in window;
    }

    async init() {
        if (!this.supported) {
            console.log('Notificações não são suportadas neste navegador');
            return;
        }

        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }

        if (this.permission === 'granted') {
            this.setupServiceWorker();
        }
    }

    async setupServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('SEU_VAPID_PUBLIC_KEY')
            });

            // Enviar subscription para o servidor
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription)
            });
        } catch (error) {
            console.error('Erro ao configurar notificações:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async showNotification(title, options = {}) {
        if (this.permission !== 'granted') return;

        const defaultOptions = {
            icon: '/assets/icon.png',
            badge: '/assets/badge.png',
            vibrate: [200, 100, 200],
            tag: 'minas-smart-notification',
            renotify: true,
            requireInteraction: true,
            actions: [
                { action: 'open', title: 'Abrir' },
                { action: 'close', title: 'Fechar' }
            ]
        };

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, { ...defaultOptions, ...options });
        } catch (error) {
            console.error('Erro ao mostrar notificação:', error);
        }
    }
}

// Inicialização
const notifications = new NotificationSystem();
notifications.init();

// Exemplo de uso
document.addEventListener('DOMContentLoaded', () => {
    const notifyButton = document.createElement('button');
    notifyButton.textContent = 'Ativar Notificações';
    notifyButton.classList.add('btn');
    notifyButton.addEventListener('click', () => notifications.init());
    
    // Adicionar botão em algum lugar apropriado da página
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(notifyButton);
    }
}); 