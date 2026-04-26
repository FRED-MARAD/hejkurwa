// assets/app/manifest.js - Globalne funkcje nawigacyjne

let webManifest = {
    "name": "mObywatel",
    "short_name": "mObywatel",
    "theme_color": "#101317",
    "background_color": "#101317",
    "display": "standalone",
    "icons": [
        {
            "src": "images/logo.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/logo.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
};

let manifestElem = document.createElement('link');
manifestElem.setAttribute('rel', 'manifest');
manifestElem.setAttribute('href', 'data:application/manifest+json;base64,' + btoa(JSON.stringify(webManifest)));
document.head.prepend(manifestElem);

// Globalna funkcja nawigacji
window.sendTo = function(page, top = null) {
    console.log('Navigating to:', page);
    
    if (top) {
        localStorage.setItem('top', top);
    }
    
    const pages = {
        'documents': 'documents.html',
        'services': 'services.html',
        'qr': 'qr.html',
        'more': 'more.html',
        'card': 'card.html',
        'id': 'id.html',
        'pesel': 'pesel.html',
        'document': 'document.html',
        'shortcuts': 'shortcuts.html',
        'scan': 'scan.html',
        'show': 'show.html'
    };
    
    const targetPage = pages[page];
    if (targetPage) {
        window.location.href = targetPage;
    } else {
        console.error('Unknown page:', page);
        // Fallback - spróbuj bezpośrednio
        window.location.href = page + '.html';
    }
};

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('mObywatel app initialized');
});