// ======================================================================
// Portal Humanidades — script da página principal (index.html)
// O login/cadastro é feito pelo Flask (auth.js nas telas de login e
// registro). Aqui só verificamos a sessão e cuidamos da interface.
// ======================================================================

// ── Notificações ─────────────────────────────────────────
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ── Sessão: confere no servidor e mostra o usuário ───────
const userNameEl = document.getElementById('userName');
const logoutBtn  = document.getElementById('logoutBtn');

async function checkAuth() {
    try {
        const response = await fetch('/check-auth');
        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/login.html';
            return;
        }
        if (userNameEl) userNameEl.textContent = data.user.name;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

logoutBtn?.addEventListener('click', async () => {
    try {
        await fetch('/logout', { method: 'POST' });
    } catch (error) {
        console.error('Erro ao sair:', error);
    }
    window.location.href = '/login.html';
});

// ── Menu mobile ──────────────────────────────────────────
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navbar    = document.querySelector('.navbar');

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
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMobileMenu));
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && !mobileBtn.contains(e.target)) closeMobileMenu();
    });
}

// ── Navegação suave para links internos (#...) ───────────
// Delegado no document: vale também para links criados depois (busca).
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (hash.length < 2) return;
    let target = null;
    try { target = document.querySelector(hash); } catch (_) { /* seletor inválido */ }
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
});

// ── Linha do tempo ───────────────────────────────────────
const timelineData = {
    antiga: [
        { year: '3000 AC', title: 'Surgimento da Escrita', description: 'Início da História documentada' },
        { year: '500 AC', title: 'Grécia Antiga', description: 'Período Clássico da civilização grega' }
    ],
    media: [
        { year: '476', title: 'Queda de Roma', description: 'Início da Idade Média' },
        { year: '1453', title: 'Queda de Constantinopla', description: 'Fim da Idade Média' }
    ],
    moderna: [
        { year: '1492', title: 'Descoberta da América', description: 'Início das Grandes Navegações' },
        { year: '1789', title: 'Revolução Francesa', description: 'Marco do fim da Idade Moderna' }
    ],
    contemporanea: [
        { year: '1914', title: 'Primeira Guerra Mundial', description: 'Início dos conflitos globais' },
        { year: '1989', title: 'Queda do Muro de Berlim', description: 'Fim da Guerra Fria' }
    ]
};

const timelineList = document.getElementById('timelineList');
const eraSelector  = document.getElementById('eraSelector');
const prevEraBtn   = document.getElementById('prevEra');
const nextEraBtn   = document.getElementById('nextEra');

function updateTimeline(era) {
    if (!timelineList) return;
    const events = timelineData[era] || [];
    timelineList.innerHTML = events.map(event => `
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

eraSelector?.addEventListener('change', (e) => updateTimeline(e.target.value));
prevEraBtn?.addEventListener('click', () => moveEra(-1));
nextEraBtn?.addEventListener('click', () => moveEra(1));

// ── Busca ────────────────────────────────────────────────
// Procura em todo o conteúdo do portal: disciplinas, tópicos, recursos e
// eventos da linha do tempo. Ignora maiúsculas e acentos ("historia" acha
// "História") e aceita várias palavras ("revolução 1789").
const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Monta o índice lendo a própria página (o que for adicionado ao HTML entra na busca)
function buildSearchIndex() {
    const index = [];
    const add = (type, weight, title, context, target) => index.push({
        type, weight, title, context, target,
        normTitle: normalize(title), normContext: normalize(context)
    });
    const text = (el, sel) => (el.querySelector(sel)?.textContent || '').trim();

    document.querySelectorAll('.cards-container .card').forEach(card => {
        const name = text(card, 'h3');
        add('Disciplina', 3, name, text(card, '.card-body > p'), { el: card });
        card.querySelectorAll('li').forEach(li => add('Tópico', 1, li.textContent.trim(), name, { el: card }));
    });

    document.querySelectorAll('.resource-item').forEach(item =>
        add('Recurso', 2, text(item, 'h3'), text(item, 'p'), { el: item }));

    const eraLabel = (era) => eraSelector?.querySelector(`option[value="${era}"]`)?.textContent || era;
    Object.entries(timelineData).forEach(([era, events]) =>
        events.forEach((ev, i) =>
            add('Linha do tempo', 2, ev.title, `${ev.year} · ${eraLabel(era)} — ${ev.description}`, { era, index: i })));

    return index;
}

function runSearch(rawQuery) {
    const terms = normalize(rawQuery).split(/\s+/).filter(Boolean);
    if (terms.length === 0 || (terms.length === 1 && terms[0].length < 2)) return [];

    const found = [];
    searchIndex.forEach((item, order) => {
        const haystack = item.normTitle + ' ' + item.normContext;
        if (!terms.every(term => haystack.includes(term))) return;
        let score = item.weight;
        terms.forEach(term => {
            if (item.normTitle.startsWith(term))        score += 4;
            else if (item.normTitle.includes(' ' + term)) score += 3;
            else if (item.normTitle.includes(term))      score += 2;
            else                                         score += 1;
        });
        found.push({ item, score, order });
    });
    found.sort((a, b) => b.score - a.score || a.order - b.order);
    return found.slice(0, 8).map(f => f.item);
}

// Escreve `text` em `parent` destacando (<mark>) os trechos que casam com a busca,
// mesmo quando a busca foi digitada sem acento.
function appendHighlighted(parent, text, terms) {
    let norm = '';
    const map = [];                       // posição no texto normalizado -> posição no original
    for (let i = 0; i < text.length; i++) {
        for (const ch of normalize(text[i])) { norm += ch; map.push(i); }
    }
    const marked = new Array(text.length).fill(false);
    terms.forEach(term => {
        for (let at = norm.indexOf(term); at !== -1; at = norm.indexOf(term, at + term.length)) {
            for (let k = at; k < at + term.length; k++) marked[map[k]] = true;
        }
    });
    let i = 0;
    while (i < text.length) {
        let j = i;
        while (j < text.length && marked[j] === marked[i]) j++;
        const piece = text.slice(i, j);
        if (marked[i]) { const m = document.createElement('mark'); m.textContent = piece; parent.appendChild(m); }
        else parent.appendChild(document.createTextNode(piece));
        i = j;
    }
}

let searchIndex = [];
let currentResults = [];
let activeIndex = -1;
let highlightTimer = null;

function openSearch() {
    // No celular a lista ocupa a largura da tela, logo abaixo do cabeçalho
    const header = document.querySelector('header');
    if (header) searchResults.style.setProperty('--search-top', header.getBoundingClientRect().bottom + 'px');
    searchResults.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');
}

function closeSearch() {
    searchResults.style.display = 'none';
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    activeIndex = -1;
}

function setActive(index) {
    const options = searchResults.querySelectorAll('.search-result-item');
    options.forEach((opt, i) => {
        const on = i === index;
        opt.classList.toggle('active', on);
        opt.setAttribute('aria-selected', String(on));
    });
    activeIndex = index;
    if (options[index]) {
        searchInput.setAttribute('aria-activedescendant', options[index].id);
        options[index].scrollIntoView({ block: 'nearest' });
    } else {
        searchInput.removeAttribute('aria-activedescendant');
    }
}

function renderResults(results, rawQuery) {
    const terms = normalize(rawQuery).split(/\s+/).filter(Boolean);
    currentResults = results;
    searchResults.innerHTML = '';

    if (results.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = `Nenhum resultado para “${rawQuery.trim()}”`;
        searchResults.appendChild(empty);
        activeIndex = -1;
        openSearch();
        return;
    }

    results.forEach((result, i) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'search-result-item';
        option.id = `search-option-${i}`;
        option.setAttribute('role', 'option');

        const top = document.createElement('span');
        top.className = 'search-result-top';
        const title = document.createElement('span');
        title.className = 'search-result-title';
        appendHighlighted(title, result.title, terms);
        const type = document.createElement('span');
        type.className = 'search-result-type';
        type.textContent = result.type;
        top.append(title, type);

        const context = document.createElement('span');
        context.className = 'search-result-context';
        appendHighlighted(context, result.context, terms);

        option.append(top, context);
        option.addEventListener('click', () => goToResult(result));
        option.addEventListener('mousemove', () => { if (activeIndex !== i) setActive(i); });
        searchResults.appendChild(option);
    });

    setActive(-1);
    openSearch();
}

// Leva o usuário até o item encontrado e o destaca por alguns segundos
function goToResult(result) {
    closeSearch();
    let target = result.target.el;

    if (result.target.era) {                       // evento da linha do tempo: troca a era antes
        eraSelector.value = result.target.era;
        updateTimeline(result.target.era);
        target = timelineList.querySelectorAll('.timeline-item')[result.target.index];
    }
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
    target.classList.add('search-highlight');
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => target.classList.remove('search-highlight'), 2500);
}

function updateSearch() {
    const query = searchInput.value;
    if (query.trim().length < 2) { closeSearch(); return; }
    renderResults(runSearch(query), query);
}

if (searchInput && searchResults) {
    searchIndex = buildSearchIndex();

    searchInput.addEventListener('input', debounce(updateSearch, 120));
    searchInput.addEventListener('focus', () => { if (searchInput.value.trim().length >= 2) updateSearch(); });

    searchInput.addEventListener('keydown', (e) => {
        const open = searchResults.style.display === 'block' && currentResults.length > 0;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) { updateSearch(); return; }
            const last = currentResults.length - 1;
            const next = e.key === 'ArrowDown'
                ? (activeIndex >= last ? 0 : activeIndex + 1)
                : (activeIndex <= 0 ? last : activeIndex - 1);
            setActive(next);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (!open) updateSearch();
            const pick = currentResults[activeIndex >= 0 ? activeIndex : 0];
            if (pick) goToResult(pick);
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) closeSearch();
    });
    window.addEventListener('resize', () => { if (searchResults.style.display === 'block') openSearch(); });
}

// ── Botão "voltar ao topo" ───────────────────────────────
const scrollToTop = document.createElement('button');
scrollToTop.innerHTML = '↑';
scrollToTop.className = 'scroll-to-top';
scrollToTop.setAttribute('aria-label', 'Voltar ao topo');
document.body.appendChild(scrollToTop);

scrollToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => {
    scrollToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});

// ── Inicialização ────────────────────────────────────────
checkAuth();
updateTimeline(eraSelector ? eraSelector.value : 'antiga');
