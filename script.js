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

// ── Leituras ampliadas e exportação ─────────────────────
const readingData = {
    'historia-antiga': { subject: 'História', title: 'História Antiga', paragraphs: [
        'A História Antiga estuda as sociedades que se desenvolveram desde o surgimento da escrita até a queda do Império Romano do Ocidente. Na Mesopotâmia e no Egito, a organização das cidades, a agricultura irrigada, os sistemas de escrita e a formação dos Estados transformaram a vida coletiva. Esses povos criaram leis, calendários, técnicas e formas de administração que influenciaram muitas sociedades posteriores.',
        'Na Grécia Antiga, diferentes cidades-Estado organizaram experiências políticas e culturais variadas. Atenas desenvolveu uma forma limitada de democracia, enquanto Esparta valorizava a formação militar. Roma construiu uma extensa experiência republicana e imperial, marcada por conflitos sociais, expansão territorial e diversidade cultural. Estudar esse período ajuda a compreender as origens de instituições, conceitos políticos, religiões e conhecimentos que ainda fazem parte do mundo contemporâneo.' ] },
    'historia-medieval': { subject: 'História', title: 'História Medieval', paragraphs: [
        'A Idade Média europeia começou após a fragmentação do Império Romano do Ocidente e foi marcada pela formação de novos reinos, pela ruralização e pelo fortalecimento das relações de dependência. O feudalismo combinou a posse da terra, o trabalho camponês e obrigações entre senhores e servos. A Igreja Católica exerceu grande influência cultural, política e econômica, preservando conhecimentos e organizando parte da vida social.',
        'O período também foi diverso e dinâmico. O Império Bizantino, as sociedades islâmicas e os reinos africanos desenvolveram comércio, ciência, literatura e arquitetura. A partir do crescimento das cidades, das feiras e das rotas comerciais, novas relações sociais surgiram. As crises do século XIV, as guerras e as transformações econômicas contribuíram para a formação das monarquias nacionais e para a transição à modernidade.' ] },
    'historia-moderna': { subject: 'História', title: 'História Moderna', paragraphs: [
        'A História Moderna abrange transformações iniciadas entre os séculos XV e XVI, como o Renascimento, as Grandes Navegações e a centralização do poder nas monarquias. A valorização da observação, da experiência e da cultura clássica estimulou novas formas de produzir conhecimento. Ao mesmo tempo, a expansão marítima europeia conectou continentes, criou redes comerciais e provocou violências, conquistas e resistências entre diferentes povos.',
        'A Reforma Protestante, a Contrarreforma e o absolutismo alteraram as relações entre religião e política. Mais tarde, o Iluminismo defendeu o uso da razão, os direitos e a crítica aos privilégios. A Revolução Industrial modificou o trabalho e as cidades, enquanto a Revolução Francesa questionou a sociedade de ordens. O período revela como mudanças econômicas, políticas e culturais se relacionam.' ] },
    'historia-contemporanea': { subject: 'História', title: 'História Contemporânea', paragraphs: [
        'A História Contemporânea é marcada pela industrialização, pelo imperialismo, pelas lutas sociais e pela consolidação dos Estados nacionais. As duas guerras mundiais produziram destruição em escala inédita e alteraram as relações de poder. A Revolução Russa, o fascismo, o nazismo e a crise de 1929 mostram como projetos políticos e econômicos disputaram os rumos das sociedades no século XX.',
        'Depois de 1945, a Guerra Fria dividiu o mundo em áreas de influência, enquanto processos de descolonização criaram novos países na África e na Ásia. No Brasil e em outros países latino-americanos, ditaduras, redemocratização e desigualdades fizeram parte da experiência recente. Hoje, globalização, tecnologias digitais, mudanças climáticas e disputas por direitos continuam transformando a vida social.' ] },
    'filosofia-antiga': { subject: 'Filosofia', title: 'Filosofia Antiga', paragraphs: [
        'A Filosofia Antiga surgiu quando pensadores passaram a buscar explicações racionais para a natureza, a vida humana e a organização da cidade. Os pré-socráticos investigaram a origem e os princípios do cosmos. Sócrates deslocou a reflexão para a vida ética e para o exame das próprias opiniões, utilizando o diálogo e a pergunta como instrumentos de conhecimento.',
        'Platão discutiu a relação entre aparência e verdade, a educação e a organização política da cidade. Aristóteles estudou lógica, ética, política, natureza e formas de conhecimento, defendendo a observação e a busca do equilíbrio. As escolas helenísticas, como estoicos e epicuristas, refletiram sobre a felicidade e a autonomia diante das dificuldades. Esse legado continua presente na ciência, na política e na educação.' ] },
    'etica-moral': { subject: 'Filosofia', title: 'Ética e Moral', paragraphs: [
        'Moral é o conjunto de valores, normas e costumes que orientam uma comunidade; ética é a reflexão crítica sobre esses valores e escolhas. A ética pergunta por que uma ação deve ser considerada justa, correta ou responsável. Por isso, não se limita a obedecer regras: ela analisa consequências, intenções, liberdade, responsabilidade e os conflitos entre diferentes princípios.',
        'As teorias éticas apresentam caminhos distintos. A ética das virtudes valoriza a formação do caráter; a ética do dever enfatiza princípios que devem ser respeitados; e as perspectivas consequencialistas avaliam os efeitos das ações. No cotidiano, esses debates aparecem no uso de dados, na inteligência artificial, no meio ambiente, nas relações de trabalho e no combate às discriminações.' ] },
    'filosofia-politica': { subject: 'Filosofia', title: 'Filosofia Política', paragraphs: [
        'A Filosofia Política investiga como as pessoas vivem juntas, como o poder é distribuído e quais instituições podem ser consideradas legítimas. Desde a cidade antiga, pensadores discutem cidadania, leis, justiça e participação. Na modernidade, autores como Hobbes, Locke e Rousseau analisaram o contrato social, os direitos e a relação entre indivíduo e Estado.',
        'As democracias contemporâneas dependem de participação, liberdade de expressão, igualdade perante a lei e proteção das minorias. Entretanto, desigualdade econômica, racismo, autoritarismo e desinformação dificultam a realização desses princípios. Estudar filosofia política permite reconhecer que a democracia não é apenas um sistema eleitoral, mas uma prática cotidiana de diálogo, responsabilidade e defesa dos direitos.' ] },
    'filosofia-contemporanea': { subject: 'Filosofia', title: 'Filosofia Contemporânea', paragraphs: [
        'A Filosofia Contemporânea reúne correntes que questionam certezas sobre razão, ciência, linguagem e progresso. O existencialismo refletiu sobre liberdade, angústia e responsabilidade; a fenomenologia investigou a experiência vivida; e a filosofia da linguagem mostrou como os significados dependem dos usos e contextos da comunicação.',
        'A teoria crítica analisou a cultura, o capitalismo e as formas de dominação presentes na sociedade. Outras correntes discutiram poder, gênero, colonialidade, tecnologia e identidade. Essas reflexões ajudam a interpretar problemas atuais, como a influência dos meios de comunicação, a vigilância digital e os impactos sociais das decisões automatizadas, sempre relacionando conceitos filosóficos com experiências concretas.' ] },
    'teoria-sociologica': { subject: 'Sociologia', title: 'Teoria Sociológica', paragraphs: [
        'A Sociologia nasceu no contexto das revoluções Industrial e Francesa, quando as cidades cresceram e antigas formas de organização foram transformadas. Émile Durkheim estudou os fatos sociais e a coesão; Karl Marx analisou o trabalho, as classes e os conflitos do capitalismo; Max Weber investigou a ação social, a burocracia e as formas de dominação.',
        'As teorias sociológicas não são apenas explicações abstratas. Elas oferecem instrumentos para observar a escola, a família, o trabalho, o Estado e as redes sociais. Comparar diferentes autores permite perceber que um mesmo fenômeno pode ser analisado por suas normas, por seus conflitos econômicos ou pelos sentidos atribuídos pelos indivíduos.' ] },
    'movimentos-sociais': { subject: 'Sociologia', title: 'Movimentos Sociais', paragraphs: [
        'Movimentos sociais são ações coletivas organizadas por pessoas que compartilham problemas, identidades ou projetos de mudança. Eles podem reivindicar direitos, denunciar injustiças e propor novas formas de participação. Trabalhadores, mulheres, movimentos negros, povos indígenas, estudantes e grupos ambientais construíram mobilizações que alteraram leis e práticas sociais.',
        'As estratégias variam entre manifestações, campanhas, ocupações, produção cultural, ações comunitárias e mobilização digital. Para compreender um movimento, é importante observar seu contexto, seus participantes, suas pautas e as relações de poder que enfrenta. A participação coletiva amplia a cidadania, mas também exige diálogo, organização e respeito à diversidade de posições.' ] },
    'cultura-sociedade': { subject: 'Sociologia', title: 'Cultura e Sociedade', paragraphs: [
        'Cultura é o conjunto de conhecimentos, valores, símbolos, linguagens e práticas aprendidos nas relações sociais. Ela não é fixa nem igual para todas as pessoas: transforma-se com as experiências, os conflitos, as migrações e os contatos entre grupos. A socialização ocorre na família, na escola, no trabalho, na comunidade e nos ambientes digitais.',
        'Observar a cultura sociologicamente significa evitar julgamentos baseados em uma única referência e reconhecer a diversidade dos modos de viver. Ao mesmo tempo, é necessário analisar quem controla os meios de produção cultural e como publicidade, entretenimento e plataformas digitais influenciam desejos e comportamentos. Cultura também é criação, resistência e disputa por representação.' ] },
    'desigualdade-social': { subject: 'Sociologia', title: 'Desigualdade Social', paragraphs: [
        'Desigualdade social ocorre quando recursos, oportunidades, direitos e reconhecimento são distribuídos de maneira injusta entre pessoas e grupos. Renda, escolaridade, moradia, saúde e acesso à tecnologia são dimensões relacionadas. A desigualdade não resulta apenas de escolhas individuais: ela também é produzida por estruturas econômicas, políticas e históricas.',
        'No Brasil, classe social, raça, gênero e território se combinam e geram experiências diferentes. Políticas públicas, educação, trabalho digno e participação social podem reduzir desigualdades, mas exigem enfrentar discriminações e privilégios. Estudar o tema ajuda a interpretar estatísticas e a perceber como decisões coletivas afetam a vida cotidiana.' ] },
    'geografia-populacao': { subject: 'Geografia', title: 'Geografia da População', paragraphs: [
        'A Geografia da População analisa como as pessoas se distribuem pelo espaço e como essa distribuição se relaciona a fatores naturais, econômicos, históricos e políticos. Densidade demográfica, crescimento, natalidade, mortalidade e expectativa de vida são indicadores que ajudam a comparar territórios e planejar políticas públicas.',
        'As migrações podem ocorrer por trabalho, estudo, conflitos, desastres ambientais ou busca por melhores condições de vida. Ao estudar fluxos populacionais, é importante considerar tanto as escolhas dos migrantes quanto as barreiras impostas por fronteiras e políticas. A população transforma o espaço, mas também é afetada por infraestrutura, emprego e acesso a serviços.' ] },
    'urbanizacao-cidades': { subject: 'Geografia', title: 'Urbanização e Cidades', paragraphs: [
        'Urbanização é o crescimento da população que vive em cidades e a expansão das atividades urbanas. As cidades concentram comércio, serviços, indústrias, universidades e redes de transporte, mas também enfrentam problemas de moradia, congestionamento, poluição e desigualdade. O espaço urbano é resultado de decisões públicas e de interesses econômicos que nem sempre atendem a todos.',
        'A segregação socioespacial aparece quando grupos vivem em áreas com diferentes condições de infraestrutura e acesso. Planejamento urbano, mobilidade sustentável, saneamento, áreas verdes e participação popular são caminhos para construir cidades mais justas. Ler a paisagem urbana permite perceber relações entre território, poder e qualidade de vida.' ] },
    'geopolitica-mundial': { subject: 'Geografia', title: 'Geopolítica Mundial', paragraphs: [
        'A Geopolítica estuda as relações de poder entre Estados, empresas, organizações e grupos sociais no espaço mundial. Fronteiras, recursos naturais, rotas comerciais, energia e tecnologia influenciam alianças e conflitos. O poder de um país não depende apenas de seu território: economia, população, conhecimento e capacidade diplomática também são importantes.',
        'A globalização aumentou a circulação de mercadorias, capitais, informações e pessoas, mas não eliminou desigualdades. Guerras, disputas territoriais, sanções e crises humanitárias revelam interesses diferentes. Analisar mapas e notícias com cuidado ajuda a evitar explicações simplistas e a compreender como decisões locais se relacionam com processos globais.' ] },
    'desenvolvimento-desigualdades': { subject: 'Geografia', title: 'Desenvolvimento e Desigualdades', paragraphs: [
        'Desenvolvimento não pode ser medido apenas pelo crescimento econômico. Saúde, educação, renda, moradia, segurança alimentar e preservação ambiental também indicam as condições de vida. O espaço mundial apresenta diferenças profundas entre países e dentro de cada país, resultado de histórias de exploração, decisões políticas, concentração de riqueza e acesso desigual a tecnologias.',
        'A sustentabilidade propõe atender às necessidades atuais sem destruir as possibilidades das próximas gerações. Isso envolve transição energética, consumo responsável, proteção de biomas e justiça ambiental. Comunidades mais vulneráveis costumam sofrer primeiro com poluição, falta de água e eventos extremos, por isso desenvolvimento precisa ser associado a direitos e participação social.' ] }
};

const readingTitle = document.getElementById('readingTitle');
const readingPage = document.getElementById('readingPage');
const downloadReading = document.getElementById('downloadReading');
const printReading = document.getElementById('printReading');
let selectedReading = null;

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'}[character]));
}

function openReading(key) {
    const reading = readingData[key];
    if (!reading || !readingPage) return;
    selectedReading = reading;
    readingTitle.textContent = `${reading.subject} — ${reading.title}`;
    readingPage.innerHTML = `<h3>${reading.title}</h3>${reading.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}`;
    downloadReading.disabled = false;
    printReading.disabled = false;
    document.getElementById('leitura')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.topic-link').forEach(link => {
    link.addEventListener('click', () => openReading(link.dataset.reading));
});

downloadReading?.addEventListener('click', () => {
    if (!selectedReading) return;
    const paragraphs = selectedReading.paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const exported = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${escapeHtml(selectedReading.title)}</title><style>@page{size:A4;margin:20mm}body{font-family:Georgia,serif;font-size:12pt;line-height:.5cm;max-width:170mm;margin:auto}h1{font-size:20pt;line-height:1.3;margin-bottom:1cm}p{margin:0 0 .5cm;text-align:justify}</style></head><body><h1>${escapeHtml(selectedReading.title)}</h1>${paragraphs}</body></html>`;
    const blob = new Blob([exported], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedReading.title.toLowerCase().replace(/[^a-z0-9áéíóúãõç ]/gi, '').trim().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
});

printReading?.addEventListener('click', () => {
    if (selectedReading) window.print();
});

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

// ── Seção "Sobre nós" ────────────────────────────────────
const aboutSection = document.getElementById('sobre');
document.querySelectorAll('a[href="#sobre"]').forEach((link) => {
    link.addEventListener('click', () => {
        if (aboutSection) aboutSection.open = true;
    });
});

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
