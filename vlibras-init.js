// Horizonte Educacional — VLibras Widget (Suíte VLibras / Governo Federal)
// Documentação: https://vlibras.gov.br/doc/widget/installation/webpageintegration.html
(function iniciarVLibras() {
    if (window.__horizonteVLibrasIniciado) {
        return;
    }
    window.__horizonteVLibrasIniciado = true;

    function garantirEstruturaWidget() {
        if (document.querySelector('[vw]')) {
            return;
        }

        const raiz = document.createElement('div');
        raiz.setAttribute('vw', '');
        raiz.classList.add('enabled');
        raiz.innerHTML = [
            '<div vw-access-button class="active"></div>',
            '<div vw-plugin-wrapper>',
            '  <div class="vw-plugin-top-wrapper"></div>',
            '</div>'
        ].join('');
        document.body.appendChild(raiz);
    }

    function carregarPlugin() {
        garantirEstruturaWidget();

        const script = document.createElement('script');
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.onload = function () {
            if (!(window.VLibras && typeof window.VLibras.Widget === 'function')) {
                return;
            }

            new window.VLibras.Widget({
                rootPath: 'https://vlibras.gov.br/app',
                avatar: 'icaro',
                position: 'R'
            });
        };
        document.body.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', carregarPlugin);
    } else {
        carregarPlugin();
    }
})();
