// Sistema de SEO Dinâmico
class SEOManager {
    constructor() {
        this.baseUrl = window.location.origin;
        this.defaultImage = `${this.baseUrl}/assets/og-image.jpg`;
        this.organizationData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Minas Smart",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/assets/logo.png`,
            "sameAs": [
                "https://facebook.com/minassmart",
                "https://instagram.com/minassmart",
                "https://linkedin.com/company/minassmart"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-XX-XXXX-XXXX",
                "contactType": "customer service",
                "areaServed": "BR",
                "availableLanguage": ["Portuguese"]
            }
        };
    }

    setMetaTags(data = {}) {
        const defaults = {
            title: "Minas Smart - Soluções em Automação Residencial",
            description: "Transforme sua casa em um ambiente inteligente com as soluções da Minas Smart. Automação residencial, segurança e conforto para sua família.",
            keywords: "automação residencial, casa inteligente, smart home, domótica, Minas Gerais",
            image: this.defaultImage,
            type: "website"
        };

        const meta = { ...defaults, ...data };

        // Atualizar título
        document.title = meta.title;

        // Meta tags básicas
        this.setOrCreateMeta("description", meta.description);
        this.setOrCreateMeta("keywords", meta.keywords);

        // Open Graph
        this.setOrCreateMeta("og:title", meta.title);
        this.setOrCreateMeta("og:description", meta.description);
        this.setOrCreateMeta("og:image", meta.image);
        this.setOrCreateMeta("og:url", window.location.href);
        this.setOrCreateMeta("og:type", meta.type);
        this.setOrCreateMeta("og:site_name", "Minas Smart");

        // Twitter Card
        this.setOrCreateMeta("twitter:card", "summary_large_image");
        this.setOrCreateMeta("twitter:title", meta.title);
        this.setOrCreateMeta("twitter:description", meta.description);
        this.setOrCreateMeta("twitter:image", meta.image);

        // Tags adicionais para SEO
        this.setOrCreateMeta("robots", "index, follow");
        this.setOrCreateMeta("author", "Minas Smart");
        this.setOrCreateMeta("language", "pt-BR");
    }

    setOrCreateMeta(name, content) {
        let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    injectStructuredData() {
        // Remover scripts antigos de dados estruturados
        document.querySelectorAll('script[type="application/ld+json"]')
            .forEach(script => script.remove());

        // Adicionar Organization Schema
        this.injectSchema(this.organizationData);

        // Adicionar BreadcrumbList Schema
        const breadcrumbData = this.generateBreadcrumbSchema();
        this.injectSchema(breadcrumbData);

        // Adicionar WebSite Schema
        const websiteData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": this.baseUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${this.baseUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };
        this.injectSchema(websiteData);
    }

    generateBreadcrumbSchema() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        const breadcrumbList = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": this.baseUrl
            }]
        };

        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            breadcrumbList.itemListElement.push({
                "@type": "ListItem",
                "position": index + 2,
                "name": this.formatBreadcrumbName(segment),
                "item": `${this.baseUrl}${currentPath}`
            });
        });

        return breadcrumbList;
    }

    formatBreadcrumbName(segment) {
        return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    injectSchema(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    }

    generateSitemap() {
        const pages = [
            '/',
            '/sobre',
            '/servicos',
            '/contato',
            '/blog'
        ];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map(page => `
    <url>
        <loc>${this.baseUrl}${page}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${page === '/' ? '1.0' : '0.8'}</priority>
    </url>`).join('')}
</urlset>`;

        return sitemap;
    }
}

// Inicialização
const seo = new SEOManager();

document.addEventListener('DOMContentLoaded', () => {
    // Configurar meta tags básicas
    seo.setMetaTags();
    
    // Injetar dados estruturados
    seo.injectStructuredData();
    
    // Atualizar meta tags em mudanças de rota (para SPAs)
    window.addEventListener('popstate', () => {
        seo.setMetaTags();
        seo.injectStructuredData();
    });
}); 