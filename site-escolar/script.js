// ── Menu Mobile ──────────────────────────────────────────
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navbar    = document.querySelector('.navbar');

if (mobileBtn && navbar) {
    mobileBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
        // Anima as barras do hambúrguer
        mobileBtn.classList.toggle('open');
    });
    // Fecha ao clicar em um link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            mobileBtn.classList.remove('open');
        });
    });
}

// ── Navegação suave para links internos ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ── QUIZ ─────────────────────────────────────────────────
const startQuiz = document.getElementById('startQuiz');
if (startQuiz) {

    // Banco de perguntas por disciplina
    const quizQuestions = [
        // HISTÓRIA
        {
            discipline: 'História',
            icon: 'fas fa-landmark',
            question: 'Em que ano ocorreu a Proclamação da República no Brasil?',
            options: ['1888', '1889', '1891', '1822'],
            correct: 1,
            explanation: 'A Proclamação da República ocorreu em 15 de novembro de 1889, liderada pelo Marechal Deodoro da Fonseca.'
        },
        {
            discipline: 'História',
            icon: 'fas fa-landmark',
            question: 'Qual evento marcou o início da Primeira Guerra Mundial?',
            options: [
                'Invasão da Polônia pela Alemanha',
                'Bombardeio de Pearl Harbor',
                'Assassinato do Arquiduque Franz Ferdinand',
                'Revolução Russa'
            ],
            correct: 2,
            explanation: 'O assassinato do Arquiduque Franz Ferdinand da Áustria, em 28 de junho de 1914, em Sarajevo, foi o estopim da Primeira Guerra Mundial.'
        },
        {
            discipline: 'História',
            icon: 'fas fa-landmark',
            question: 'A Queda do Muro de Berlim ocorreu em:',
            options: ['1985', '1987', '1989', '1991'],
            correct: 2,
            explanation: 'O Muro de Berlim caiu em 9 de novembro de 1989, simbolizando o fim da Guerra Fria e a reunificação alemã.'
        },
        // FILOSOFIA
        {
            discipline: 'Filosofia',
            icon: 'fas fa-brain',
            question: 'Quem proferiu a famosa frase "Penso, logo existo"?',
            options: ['Aristóteles', 'Platão', 'René Descartes', 'Immanuel Kant'],
            correct: 2,
            explanation: 'René Descartes escreveu "Cogito, ergo sum" (Penso, logo existo) em sua obra "Discurso do Método" (1637).'
        },
        {
            discipline: 'Filosofia',
            icon: 'fas fa-brain',
            question: 'A alegoria da Caverna é uma obra de qual filósofo?',
            options: ['Sócrates', 'Platão', 'Aristóteles', 'Epicuro'],
            correct: 1,
            explanation: 'A Alegoria da Caverna foi escrita por Platão em sua obra "A República", para ilustrar a diferença entre o mundo sensível e o mundo das ideias.'
        },
        {
            discipline: 'Filosofia',
            icon: 'fas fa-brain',
            question: 'O que é o "imperativo categórico" na filosofia de Kant?',
            options: [
                'Uma lei moral universal que deve guiar nossas ações',
                'A busca pelo prazer como princípio máximo',
                'A ideia de que só existe o que podemos perceber',
                'O contrato social entre cidadãos e Estado'
            ],
            correct: 0,
            explanation: 'O imperativo categórico de Kant é um princípio moral: "Aja apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne lei universal."'
        },
        // SOCIOLOGIA
        {
            discipline: 'Sociologia',
            icon: 'fas fa-users',
            question: 'Quem é considerado o "pai da Sociologia"?',
            options: ['Karl Marx', 'Max Weber', 'Auguste Comte', 'Émile Durkheim'],
            correct: 2,
            explanation: 'Auguste Comte (1798-1857) é considerado o pai da Sociologia, tendo criado o termo e defendido o positivismo como método científico para estudar a sociedade.'
        },
        {
            discipline: 'Sociologia',
            icon: 'fas fa-users',
            question: 'O conceito de "anomia" foi desenvolvido por qual sociólogo?',
            options: ['Karl Marx', 'Émile Durkheim', 'Max Weber', 'Antonio Gramsci'],
            correct: 1,
            explanation: 'Émile Durkheim desenvolveu o conceito de anomia para descrever situações de desintegração social, onde as normas coletivas perdem sua força reguladora.'
        },
        {
            discipline: 'Sociologia',
            icon: 'fas fa-users',
            question: 'O que Karl Marx entendia por "mais-valia"?',
            options: [
                'O lucro obtido pelo trabalhador ao vender sua força de trabalho',
                'A diferença entre o valor produzido pelo trabalhador e o salário pago',
                'O imposto cobrado pelo Estado sobre a produção',
                'O excedente de produtos agrícolas em uma economia'
            ],
            correct: 1,
            explanation: 'Para Marx, a mais-valia é a diferença entre o valor total produzido pelo trabalhador e o salário que ele recebe — é a base da exploração capitalista.'
        },
        // GEOGRAFIA HUMANA
        {
            discipline: 'Geografia Humana',
            icon: 'fas fa-globe-americas',
            question: 'O que é êxodo rural?',
            options: [
                'O crescimento de cidades no interior',
                'A migração da população do campo para a cidade',
                'O retorno de imigrantes ao país de origem',
                'O deslocamento de populações por guerras'
            ],
            correct: 1,
            explanation: 'O êxodo rural é o movimento migratório da zona rural para as zonas urbanas, muito intenso no Brasil durante o século XX com a industrialização.'
        },
        {
            discipline: 'Geografia Humana',
            icon: 'fas fa-globe-americas',
            question: 'Qual é o país mais populoso do mundo atualmente?',
            options: ['Estados Unidos', 'China', 'Índia', 'Brasil'],
            correct: 2,
            explanation: 'A Índia ultrapassou a China em 2023 e se tornou o país mais populoso do mundo, com mais de 1,4 bilhão de habitantes.'
        },
        {
            discipline: 'Geografia Humana',
            icon: 'fas fa-globe-americas',
            question: 'O que o IDH (Índice de Desenvolvimento Humano) mede?',
            options: [
                'Apenas o PIB per capita de um país',
                'Somente a taxa de alfabetização',
                'Longevidade, educação e renda de uma população',
                'O crescimento industrial de uma nação'
            ],
            correct: 2,
            explanation: 'O IDH é um índice composto que mede três dimensões: expectativa de vida (longevidade), acesso à educação e renda per capita.'
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let shuffledQuestions = [];

    function shuffleArray(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }

    function getQuizContainer() {
        return document.querySelector('.quiz-inner') || document.querySelector('.quiz-container');
    }

    function showQuestion() {
        const container = getQuizContainer();
        const q = shuffledQuestions[currentQuestion];
        const progress = Math.round(((currentQuestion) / shuffledQuestions.length) * 100);

        container.innerHTML = `
            <div class="quiz-progress-wrap">
                <span class="quiz-disc-tag"><i class="${q.icon}"></i> ${q.discipline}</span>
                <span class="quiz-counter">${currentQuestion + 1} / ${shuffledQuestions.length}</span>
            </div>
            <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
            <h3 class="quiz-question">${q.question}</h3>
            <div class="quiz-options">
                ${q.options.map((opt, i) => `
                    <button class="option-btn" data-index="${i}">${opt}</button>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', checkAnswer);
        });
    }

    function checkAnswer(e) {
        const selected = parseInt(e.target.dataset.index);
        const q = shuffledQuestions[currentQuestion];
        const btns = document.querySelectorAll('.option-btn');

        btns.forEach(btn => btn.disabled = true);

        if (selected === q.correct) {
            score++;
            e.target.classList.add('correct');
        } else {
            e.target.classList.add('wrong');
            btns[q.correct].classList.add('correct');
        }

        // Mostra explicação
        const container = getQuizContainer();
        const explanation = document.createElement('p');
        explanation.className = 'quiz-explanation';
        explanation.innerHTML = `<i class="fas fa-lightbulb"></i> ${q.explanation}`;
        container.appendChild(explanation);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-quiz quiz-next-btn';
        nextBtn.innerHTML = currentQuestion + 1 < shuffledQuestions.length
            ? '<i class="fas fa-arrow-right"></i> Próxima'
            : '<i class="fas fa-flag-checkered"></i> Ver Resultado';
        nextBtn.addEventListener('click', () => {
            currentQuestion++;
            if (currentQuestion < shuffledQuestions.length) {
                showQuestion();
            } else {
                showResults();
            }
        });
        container.appendChild(nextBtn);
    }

    function showResults() {
        const container = getQuizContainer();
        const pct = Math.round((score / shuffledQuestions.length) * 100);
        const medal = pct === 100 ? '🏆' : pct >= 70 ? '🥈' : pct >= 40 ? '🥉' : '📚';
        const msg   = pct === 100 ? 'Perfeito! Você gabaritou!' :
                      pct >= 70  ? 'Muito bem! Continue estudando!' :
                      pct >= 40  ? 'Bom esforço! Revise os conteúdos.' :
                                   'Continue estudando! Você vai melhorar.';

        container.innerHTML = `
            <div class="quiz-result">
                <div class="quiz-medal">${medal}</div>
                <h3>Resultado Final</h3>
                <div class="quiz-score-circle">
                    <span class="quiz-score-num">${score}<small>/${shuffledQuestions.length}</small></span>
                    <span class="quiz-score-pct">${pct}%</span>
                </div>
                <p class="quiz-result-msg">${msg}</p>
                <div class="quiz-result-btns">
                    <button class="btn btn-quiz" id="retryQuiz">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                    <a href="#categorias" class="btn btn-outline-hero">
                        <i class="fas fa-book"></i> Estudar Mais
                    </a>
                </div>
            </div>
        `;

        document.getElementById('retryQuiz')?.addEventListener('click', () => {
            currentQuestion = 0;
            score = 0;
            shuffledQuestions = shuffleArray(quizQuestions);
            showQuestion();
        });
    }

    startQuiz.addEventListener('click', function () {
        currentQuestion = 0;
        score = 0;
        shuffledQuestions = shuffleArray(quizQuestions);
        showQuestion();
    });
}

// ── MATERIAIS ─────────────────────────────────────────────
const materialsData = [
    // HISTÓRIA
    {
        id: 1, title: 'Guia Completo de História Antiga',
        type: 'pdf', subject: 'historia', icon: 'fas fa-file-pdf',
        color: '#e74c3c', size: '2.5 MB', downloads: 342,
        desc: 'Mesopotâmia, Egito, Grécia e Roma Antigas.'
    },
    {
        id: 2, title: 'Resumo: Idade Média e Feudalismo',
        type: 'pdf', subject: 'historia', icon: 'fas fa-file-pdf',
        color: '#e74c3c', size: '1.8 MB', downloads: 210,
        desc: 'Feudalismo, Cruzadas e vida medieval.'
    },
    {
        id: 3, title: 'Videoaula: Revolução Industrial',
        type: 'video', subject: 'historia', icon: 'fas fa-play-circle',
        color: '#9b59b6', size: '320 MB', downloads: 189,
        desc: 'Causas, consequências e impactos sociais.'
    },
    {
        id: 4, title: 'Slides: História Contemporânea',
        type: 'apresentacao', subject: 'historia', icon: 'fas fa-file-powerpoint',
        color: '#e67e22', size: '8.2 MB', downloads: 95,
        desc: 'Guerras Mundiais, Guerra Fria e globalização.'
    },
    // FILOSOFIA
    {
        id: 5, title: 'Introdução à Filosofia Clássica',
        type: 'pdf', subject: 'filosofia', icon: 'fas fa-file-pdf',
        color: '#e74c3c', size: '3.1 MB', downloads: 278,
        desc: 'Sócrates, Platão, Aristóteles e pré-socráticos.'
    },
    {
        id: 6, title: 'Videoaula: Ética e Moral',
        type: 'video', subject: 'filosofia', icon: 'fas fa-play-circle',
        color: '#9b59b6', size: '280 MB', downloads: 156,
        desc: 'Teorias éticas e dilemas morais.'
    },
    {
        id: 7, title: 'Slides: Filosofia Política',
        type: 'apresentacao', subject: 'filosofia', icon: 'fas fa-file-powerpoint',
        color: '#e67e22', size: '5.4 MB', downloads: 132,
        desc: 'Hobbes, Locke, Rousseau e o contrato social.'
    },
    // SOCIOLOGIA
    {
        id: 8, title: 'Resumo: Teoria Sociológica Clássica',
        type: 'pdf', subject: 'sociologia', icon: 'fas fa-file-pdf',
        color: '#e74c3c', size: '2.2 MB', downloads: 198,
        desc: 'Marx, Durkheim e Weber — conceitos fundamentais.'
    },
    {
        id: 9, title: 'Videoaula: Movimentos Sociais no Brasil',
        type: 'video', subject: 'sociologia', icon: 'fas fa-play-circle',
        color: '#9b59b6', size: '210 MB', downloads: 143,
        desc: 'MST, feminismo, LGBTs e outros movimentos.'
    },
    {
        id: 10, title: 'Slides: Cultura e Sociedade',
        type: 'apresentacao', subject: 'sociologia', icon: 'fas fa-file-powerpoint',
        color: '#e67e22', size: '6.0 MB', downloads: 87,
        desc: 'Indústria cultural, diversidade e identidade.'
    },
    // GEOGRAFIA
    {
        id: 11, title: 'Guia de Geografia da População',
        type: 'pdf', subject: 'geografia', icon: 'fas fa-file-pdf',
        color: '#e74c3c', size: '2.9 MB', downloads: 220,
        desc: 'Crescimento demográfico, migrações e urbanização.'
    },
    {
        id: 12, title: 'Videoaula: Geopolítica Mundial',
        type: 'video', subject: 'geografia', icon: 'fas fa-play-circle',
        color: '#9b59b6', size: '295 MB', downloads: 174,
        desc: 'Conflitos, blocos econômicos e relações de poder.'
    },
    {
        id: 13, title: 'Slides: Desenvolvimento e Desigualdade',
        type: 'apresentacao', subject: 'geografia', icon: 'fas fa-file-powerpoint',
        color: '#e67e22', size: '7.3 MB', downloads: 109,
        desc: 'IDH, Norte-Sul global e indicadores socioeconômicos.'
    }
];

const materialType    = document.getElementById('materialType');
const materialSubject = document.getElementById('materialSubject');
const materialsGrid   = document.querySelector('.materials-grid');

const typeIcons = {
    pdf:          { icon: 'fas fa-file-pdf',        color: '#e74c3c', label: 'PDF'           },
    video:        { icon: 'fas fa-play-circle',     color: '#9b59b6', label: 'Vídeo'         },
    apresentacao: { icon: 'fas fa-file-powerpoint', color: '#e67e22', label: 'Apresentação'  }
};

const subjectLabels = {
    historia:   'História',
    filosofia:  'Filosofia',
    sociologia: 'Sociologia',
    geografia:  'Geografia Humana'
};

function updateMaterials() {
    const typeFilter    = materialType?.value    || 'todos';
    const subjectFilter = materialSubject?.value || 'todos';

    const filtered = materialsData.filter(m => {
        const okType    = typeFilter    === 'todos' || m.type    === typeFilter;
        const okSubject = subjectFilter === 'todos' || m.subject === subjectFilter;
        return okType && okSubject;
    });

    if (!materialsGrid) return;

    if (filtered.length === 0) {
        materialsGrid.innerHTML = `
            <div class="materials-empty">
                <i class="fas fa-search"></i>
                <p>Nenhum material encontrado para esse filtro.</p>
            </div>`;
        return;
    }

    materialsGrid.innerHTML = filtered.map(m => {
        const t = typeIcons[m.type];
        return `
        <div class="material-card">
            <div class="material-card-top" style="background:${t.color}18; border-bottom:3px solid ${t.color}">
                <i class="${t.icon}" style="color:${t.color}; font-size:2rem;"></i>
                <span class="material-type-badge" style="background:${t.color}">${t.label}</span>
            </div>
            <div class="material-card-body">
                <span class="material-subject-tag">${subjectLabels[m.subject]}</span>
                <h3 class="material-title">${m.title}</h3>
                <p class="material-info">${m.desc}</p>
                <div class="material-meta">
                    <span><i class="fas fa-hdd"></i> ${m.size}</span>
                    <span><i class="fas fa-download"></i> ${m.downloads}</span>
                </div>
                <button class="download-btn" data-id="${m.id}">
                    <i class="fas fa-download"></i> Baixar Material
                </button>
            </div>
        </div>`;
    }).join('');

    materialsGrid.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            if (currentUser) {
                showNotification('⬇️ Download iniciado!');
            } else {
                showNotification('Faça login para baixar materiais!', 'error');
                openModal(loginModal);
            }
        });
    });
}

materialType?.addEventListener('change', updateMaterials);
materialSubject?.addEventListener('change', updateMaterials);
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const registerLink = document.getElementById('registerLink');
const closeBtns = document.querySelectorAll('.close');

// Dados mockados para demonstração
const users = [
    { email: 'teste@teste.com', password: '123456', name: 'Usuário Teste' }
];

let currentUser = null;

// Funções de Modal
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Event Listeners para Modais
loginBtn.addEventListener('click', () => openModal(loginModal));
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(registerModal);
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(registerModal);
    });
});

// Login e Registro
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        updateUIForLoggedUser();
        closeModal(loginModal);
        showNotification('Login realizado com sucesso!');
    } else {
        showNotification('Email ou senha incorretos!', 'error');
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (users.some(u => u.email === email)) {
        showNotification('Email já cadastrado!', 'error');
        return;
    }

    users.push({ email, password, name });
    closeModal(registerModal);
    showNotification('Registro realizado com sucesso! Faça login para continuar.');
});

function updateUIForLoggedUser() {
    loginBtn.textContent = currentUser.name;
    // Adicionar lógica para mostrar/esconder elementos baseado no login
}

// Sistema de Notificações
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Linha do Tempo
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

const timelineContent = document.querySelector('.timeline-content');
const eraSelector = document.getElementById('eraSelector');
const prevEraBtn = document.getElementById('prevEra');
const nextEraBtn = document.getElementById('nextEra');

function updateTimeline(era) {
    const events = timelineData[era];
    timelineContent.innerHTML = events.map(event => `
        <div class="timeline-item">
            <div class="timeline-content">
                <h3>${event.year}</h3>
                <h4>${event.title}</h4>
                <p>${event.description}</p>
            </div>
        </div>
    `).join('');
}

eraSelector.addEventListener('change', (e) => updateTimeline(e.target.value));
prevEraBtn.addEventListener('click', () => {
    const currentIndex = Array.from(eraSelector.options).findIndex(opt => opt.selected);
    if (currentIndex > 0) {
        eraSelector.selectedIndex = currentIndex - 1;
        updateTimeline(eraSelector.value);
    }
});

nextEraBtn.addEventListener('click', () => {
    const currentIndex = Array.from(eraSelector.options).findIndex(opt => opt.selected);
    if (currentIndex < eraSelector.options.length - 1) {
        eraSelector.selectedIndex = currentIndex + 1;
        updateTimeline(eraSelector.value);
    }
});

// Sistema de Materiais
const materialsData = [
    {
        id: 1,
        title: 'Guia de História Antiga',
        type: 'pdf',
        subject: 'historia',
        size: '2.5MB',
        downloads: 150
    },
    {
        id: 2,
        title: 'Vídeo-aula: Filosofia Grega',
        type: 'video',
        subject: 'filosofia',
        size: '150MB',
        downloads: 75
    },
    {
        id: 3,
        title: 'Apresentação: Sociologia Moderna',
        type: 'apresentacao',
        subject: 'sociologia',
        size: '5MB',
        downloads: 120
    }
];

const materialType = document.getElementById('materialType');
const materialSubject = document.getElementById('materialSubject');
const materialsGrid = document.querySelector('.materials-grid');

function updateMaterials() {
    const typeFilter = materialType.value;
    const subjectFilter = materialSubject.value;

    const filteredMaterials = materialsData.filter(material => {
        const matchesType = typeFilter === 'todos' || material.type === typeFilter;
        const matchesSubject = subjectFilter === 'todos' || material.subject === subjectFilter;
        return matchesType && matchesSubject;
    });

    materialsGrid.innerHTML = filteredMaterials.map(material => `
        <div class="material-card">
            <div class="material-icon">📄</div>
            <h3 class="material-title">${material.title}</h3>
            <p class="material-info">
                Tamanho: ${material.size}<br>
                Downloads: ${material.downloads}
            </p>
            <a href="#" class="download-btn" data-id="${material.id}">
                Download
            </a>
        </div>
    `).join('');

    // Adicionar event listeners para os botões de download
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                showNotification('Iniciando download...');
            } else {
                showNotification('Faça login para baixar materiais!', 'error');
                openModal(loginModal);
            }
        });
    });
}

materialType.addEventListener('change', updateMaterials);
materialSubject.addEventListener('change', updateMaterials);

// Menu Mobile
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navbar = document.querySelector('.navbar');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navbar.querySelector('.nav-links').classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', 
            mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });
}

// Fechar menu mobile ao clicar fora
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navbar.querySelector('.nav-links').classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
});

// Sistema de Busca
const searchInput = document.getElementById('searchInput');
const searchResults = document.querySelector('.search-results');

if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        try {
            // Simular busca (em produção, isso seria uma chamada à API)
            const results = await mockSearch(query);
            displaySearchResults(results);
        } catch (error) {
            console.error('Erro na busca:', error);
            showNotification('Erro ao realizar a busca', 'error');
        }
    }, 300));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function mockSearch(query) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Dados mockados para demonstração
    const content = [
        { title: 'História Antiga', url: '#historia' },
        { title: 'Filosofia Grega', url: '#filosofia' },
        { title: 'Sociologia Moderna', url: '#sociologia' }
    ];
    
    return content.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );
}

function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    searchResults.innerHTML = results.map(result => `
        <div class="search-result-item">
            <a href="${result.url}">${result.title}</a>
        </div>
    `).join('');
    
    searchResults.style.display = 'block';
}

// Animação de scroll para o topo
const scrollToTop = document.createElement('button');
scrollToTop.innerHTML = '↑';
scrollToTop.className = 'scroll-to-top';
document.body.appendChild(scrollToTop);

scrollToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Mostrar/ocultar botão de scroll baseado na posição da página
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        scrollToTop.style.display = 'block';
    } else {
        scrollToTop.style.display = 'none';
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // mobileMenu();
    implementSearch();
    updateTimeline('antiga');
    updateMaterials();
});
