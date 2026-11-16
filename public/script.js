// Portal Humanidades — versão estática para GitHub Pages.
// O conteúdo só é liberado depois de um cadastro e login demonstrativos.

const CHAVE_SESSAO = 'horizonte-sessao-v1';

function lerSessao() {
    try {
        const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
        return sessao && sessao.email ? sessao : null;
    } catch (_) {
        return null;
    }
}

function urlRelativa(pagina) {
    return new URL(pagina, document.baseURI).href;
}

// Bloqueia o conteúdo antes de iniciar qualquer interação da página.
const sessaoInicial = lerSessao();
if (!sessaoInicial) {
    window.location.replace(urlRelativa('login.html'));
} else {
    document.documentElement.classList.add('sessao-autorizada');
    document.body.classList.add('sessao-autorizada');
}

// ── Sessão ────────────────────────────────────────────────
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

if (sessaoInicial && userNameEl) userNameEl.textContent = sessaoInicial.name;

logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem(CHAVE_SESSAO);
    window.location.replace(urlRelativa('login.html'));
});

// ── Menu mobile ────────────────────────────────────────────
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navbar = document.querySelector('.navbar');

function closeMobileMenu() {
    navbar?.classList.remove('active');
    mobileBtn?.classList.remove('open');
    mobileBtn?.setAttribute('aria-expanded', 'false');
}

if (mobileBtn && navbar) {
    mobileBtn.addEventListener('click', () => {
        const open = navbar.classList.toggle('active');
        mobileBtn.classList.toggle('open', open);
        mobileBtn.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', closeMobileMenu));
    document.addEventListener('click', (event) => {
        if (!navbar.contains(event.target) && !mobileBtn.contains(event.target)) closeMobileMenu();
    });
}

// ── Navegação suave ────────────────────────────────────────
document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (!hash || hash.length < 2) return;
    let target = null;
    try { target = document.querySelector(hash); } catch (_) { return; }
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
});

// ── Linha do tempo ─────────────────────────────────────────
const timelineData = {
    antiga: [
        { year: '3000 a.C.', title: 'Surgimento da escrita', description: 'Início da História documentada' },
        { year: '500 a.C.', title: 'Grécia Antiga', description: 'Período clássico da civilização grega' }
    ],
    media: [
        { year: '476', title: 'Queda de Roma', description: 'Início da Idade Média' },
        { year: '1453', title: 'Queda de Constantinopla', description: 'Fim da Idade Média' }
    ],
    moderna: [
        { year: '1492', title: 'Chegada dos europeus à América', description: 'Marco da expansão marítima europeia' },
        { year: '1789', title: 'Revolução Francesa', description: 'Marco do fim da Idade Moderna' }
    ],
    contemporanea: [
        { year: '1914', title: 'Primeira Guerra Mundial', description: 'Início de um conflito global' },
        { year: '1989', title: 'Queda do Muro de Berlim', description: 'Marco do fim da Guerra Fria' }
    ]
};

const timelineList = document.getElementById('timelineList');
const eraSelector = document.getElementById('eraSelector');
const prevEraBtn = document.getElementById('prevEra');
const nextEraBtn = document.getElementById('nextEra');

function updateTimeline(era) {
    if (!timelineList) return;
    timelineList.innerHTML = (timelineData[era] || []).map((event) => `
        <div class="timeline-item">
            <div class="timeline-content">
                <h3>${event.year}</h3>
                <h4>${event.title}</h4>
                <p>${event.description}</p>
            </div>
        </div>
    `).join('');
}

function moveEra(step) {
    if (!eraSelector) return;
    const next = eraSelector.selectedIndex + step;
    if (next >= 0 && next < eraSelector.options.length) {
        eraSelector.selectedIndex = next;
        updateTimeline(eraSelector.value);
    }
}

eraSelector?.addEventListener('change', (event) => updateTimeline(event.target.value));
prevEraBtn?.addEventListener('click', () => moveEra(-1));
nextEraBtn?.addEventListener('click', () => moveEra(1));

// ── Busca ──────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function buildSearchIndex() {
    const index = [];
    const text = (element, selector) => (element.querySelector(selector)?.textContent || '').trim();
    const add = (type, weight, title, context, target) => index.push({
        type, weight, title, context, target,
        normTitle: normalize(title), normContext: normalize(context)
    });

    document.querySelectorAll('.cards-container .card').forEach((card) => {
        const name = text(card, 'h3');
        add('Disciplina', 3, name, text(card, '.card-body > p'), { el: card });
        card.querySelectorAll('li').forEach((li) => add('Tópico', 1, li.textContent.trim(), name, { el: card }));
    });
    document.querySelectorAll('.resource-item').forEach((item) => add('Recurso', 2, text(item, 'h3'), text(item, 'p'), { el: item }));
    Object.entries(timelineData).forEach(([era, events]) => events.forEach((event, index) =>
        add('Linha do tempo', 2, event.title, `${event.year} — ${event.description}`, { era, index })));
    return index;
}

let searchIndex = [];
let currentResults = [];
let activeIndex = -1;
let highlightTimer = null;

function runSearch(rawQuery) {
    const terms = normalize(rawQuery).split(/\s+/).filter(Boolean);
    if (!terms.length || (terms.length === 1 && terms[0].length < 2)) return [];
    return searchIndex.map((item, order) => {
        const haystack = `${item.normTitle} ${item.normContext}`;
        if (!terms.every((term) => haystack.includes(term))) return null;
        let score = item.weight;
        terms.forEach((term) => { score += item.normTitle.includes(term) ? 3 : 1; });
        return { item, score, order };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.order - b.order).slice(0, 8).map(({ item }) => item);
}

function openSearch() {
    if (searchResults) searchResults.style.display = 'block';
    searchInput?.setAttribute('aria-expanded', 'true');
}
function closeSearch() {
    if (searchResults) searchResults.style.display = 'none';
    searchInput?.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
}
function renderResults(results, rawQuery) {
    if (!searchResults) return;
    currentResults = results;
    searchResults.innerHTML = '';
    if (!results.length) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = `Nenhum resultado para “${rawQuery.trim()}”`;
        searchResults.appendChild(empty);
        openSearch();
        return;
    }
    results.forEach((result, index) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'search-result-item';
        option.textContent = `${result.title} — ${result.context}`;
        option.addEventListener('click', () => goToResult(result));
        searchResults.appendChild(option);
        if (index === 0) option.setAttribute('aria-selected', 'true');
    });
    openSearch();
}
function goToResult(result) {
    closeSearch();
    let target = result.target.el;
    if (result.target.era) {
        eraSelector.value = result.target.era;
        updateTimeline(result.target.era);
        target = timelineList.querySelectorAll('.timeline-item')[result.target.index];
    }
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('search-highlight');
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => target.classList.remove('search-highlight'), 2500);
}

if (searchInput && searchResults) {
    searchIndex = buildSearchIndex();
    searchInput.addEventListener('input', debounce(() => {
        if (searchInput.value.trim().length < 2) return closeSearch();
        renderResults(runSearch(searchInput.value), searchInput.value);
    }, 120));
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-container')) closeSearch();
    });
}

// ── Inicialização ──────────────────────────────────────────
updateTimeline(eraSelector ? eraSelector.value : 'antiga');
