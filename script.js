// ======================================================================
// Horizonte Educacional — script compartilhado das páginas iniciais
//
// O login/cadastro é feito pelo Flask (auth.js nas telas de login e
// registro). Aqui só verificamos a sessão e cuidamos da interface.
// ======================================================================


// ── NOTIFICAÇÕES ─────────────────────────────────────────────────────
// Exibe uma mensagem; por padrão, ela fica no canto da tela por 3 segundos.
// tipo: 'sucesso' (verde) ou 'erro' (vermelho)
function exibirNotificacao(mensagem, tipo = 'sucesso', duracao = 3000, centralizada = false) {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}${centralizada ? ' notificacao-centralizada' : ''}`;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    setTimeout(() => notificacao.remove(), duracao);
}

function preencherSaudacaoUsuario(elemento, tratamento, nome) {
    elemento.textContent = '';

    const linhaSaudacao = document.createElement('span');
    linhaSaudacao.className = 'linha-saudacao-usuario';
    linhaSaudacao.textContent = tratamento ? `Olá, ${tratamento}` : 'Olá,';

    const linhaNome = document.createElement('span');
    linhaNome.className = 'nome-usuario-completo';
    linhaNome.textContent = nome;

    elemento.appendChild(linhaSaudacao);
    elemento.appendChild(linhaNome);
}


// ── SESSÃO: verifica autenticação e personaliza a página ─────────────
const elementoNomeUsuario = document.getElementById('nomeUsuario');
const botaoSair           = document.getElementById('botaoSair');
const areaProfessor       = document.getElementById('areaProfessor');
const linkAreaProfessor   = document.getElementById('linkAreaProfessor');
const perfilDaPagina      = document.body.dataset.perfil || 'aluno';
const parametrosDaPagina  = new URLSearchParams(window.location.search);

// Consulta o servidor para saber se o usuário está logado.
// Se não estiver, redireciona para a tela de login.
async function verificarAutenticacao() {
    try {
        const resposta = await fetch('/api/usuario-atual', { credentials: 'same-origin' });
        if (resposta.status === 401) {
            window.location.href = `/login_${perfilDaPagina}.html`;
            return;
        }
        const dados    = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || 'Não foi possível verificar a sessão.');
        }

        if (dados.role !== perfilDaPagina) {
            window.location.href = dados.role === 'professor'
                ? '/index_professor.html'
                : '/index_alunos.html';
            return;
        }

        const genero = ['feminino', 'masculino'].includes(dados.gender) ? dados.gender : 'neutro';
        const tratamento = genero === 'neutro'
            ? ''
            : dados.role === 'professor'
                ? (genero === 'feminino' ? 'Professora' : 'Professor')
                : (genero === 'feminino' ? 'Aluna' : 'Aluno');
        const saudacao = tratamento
            ? `Olá, ${tratamento} ${dados.name}`
            : `Olá, ${dados.name}`;

        if (dados.role === 'professor') {
            if (elementoNomeUsuario) {
                preencherSaudacaoUsuario(elementoNomeUsuario, tratamento, dados.name);
            }
            if (areaProfessor) areaProfessor.hidden = false;
            if (linkAreaProfessor) linkAreaProfessor.hidden = false;
        } else if (elementoNomeUsuario) {
            preencherSaudacaoUsuario(elementoNomeUsuario, tratamento, dados.name);
        }

        if (dados.mostrarBoasVindas || parametrosDaPagina.get('boasVindas') === '1') {
            parametrosDaPagina.delete('boasVindas');
            const consultaAtualizada = parametrosDaPagina.toString();
            const sufixoConsulta = consultaAtualizada ? `?${consultaAtualizada}` : '';
            const enderecoAtualizado = `${window.location.pathname}${sufixoConsulta}${window.location.hash}`;
            window.history.replaceState(null, '', enderecoAtualizado);

            const mensagemBoasVindas = dados.tipoBoasVindas === 'login'
                ? `${saudacao}! Login realizado com sucesso. Que bom ter você de volta ao Horizonte Educacional.`
                : `${saudacao}! ${genero === 'feminino'
                    ? 'Seja bem-vinda ao Horizonte Educacional.'
                    : genero === 'masculino'
                        ? 'Seja bem-vindo ao Horizonte Educacional.'
                        : 'Boas-vindas ao Horizonte Educacional.'}`;
            exibirNotificacao(
                mensagemBoasVindas,
                'sucesso',
                4000,
                true
            );
        }

    } catch (erro) {
        console.error('Erro ao verificar autenticação:', erro);
    }
}

// Ao clicar em "Sair", encerra a sessão no servidor e volta para o login
botaoSair?.addEventListener('click', async () => {
    let destino = `/login_${perfilDaPagina}.html`;
    try {
        const resposta = await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
        if (!resposta.ok) throw new Error('Não foi possível encerrar a sessão.');
        const dados = await resposta.json();
        destino = dados.redirect || destino;
    } catch (erro) {
        console.error('Erro ao sair:', erro);
    }
    window.location.href = destino;
});


// ── MENU MOBILE (hambúrguer) ──────────────────────────────────────────
const btnMenuMobile  = document.querySelector('.btn-menu-mobile');
const barraNavegacao = document.querySelector('.barra-navegacao');

// Fecha o menu e restaura o ícone hambúrguer
function fecharMenuMobile() {
    barraNavegacao?.classList.remove('ativa');
    btnMenuMobile?.classList.remove('aberto');
    btnMenuMobile?.setAttribute('aria-expanded', 'false');
}

if (btnMenuMobile && barraNavegacao) {
    // Alterna entre aberto e fechado ao clicar no hambúrguer
    btnMenuMobile.addEventListener('click', () => {
        const estaAberto = barraNavegacao.classList.toggle('ativa');
        btnMenuMobile.classList.toggle('aberto', estaAberto);
        btnMenuMobile.setAttribute('aria-expanded', String(estaAberto));
    });

    // Fecha o menu ao clicar em qualquer link de navegação
    document.querySelectorAll('.menu-links a').forEach(link =>
        link.addEventListener('click', fecharMenuMobile)
    );

    // Fecha o menu ao clicar fora dele
    document.addEventListener('click', (evento) => {
        if (!barraNavegacao.contains(evento.target) && !btnMenuMobile.contains(evento.target)) {
            fecharMenuMobile();
        }
    });
}

// ── CARROSSEIS DE IMAGENS DAS MATÉRIAS (página do aluno) ─────────────
const imagensPorMateria = {
    historia: [
        { src: 'imagem/historia.jpg', alt: 'Ilustração sobre diferentes períodos da História' },
        { src: 'imagem/historia-castelo.jpg', alt: 'Castelo de Segóvia, exemplo de arquitetura medieval' },
        { src: 'imagem/historia-renascimento.jpg', alt: 'Homem Vitruviano, estudo de Leonardo da Vinci no Renascimento' },
        { src: 'imagem/historia-revolucao-industrial.jpg', alt: 'Fábrica de tecelagem durante a Revolução Industrial' }
    ],
    filosofia: [
        { src: 'imagem/filosofia.jpg', alt: 'Ilustração sobre reflexão e pensamento filosófico' },
        { src: 'imagem/filosofia-socrates.jpg', alt: 'Busto de Sócrates, filósofo da Grécia Antiga' },
        { src: 'imagem/filosofia-platao.jpg', alt: 'Busto de Platão, filósofo da Grécia Antiga' },
        { src: 'imagem/filosofia-aristoteles.jpg', alt: 'Busto de Aristóteles, filósofo da Grécia Antiga' }
    ],
    sociologia: [
        { src: 'imagem/sociologia.jpg', alt: 'Ilustração sobre relações e grupos sociais' },
        { src: 'imagem/sociologia-movimentos-sociais.jpg', alt: 'Manifestação pública no Rio de Janeiro' },
        { src: 'imagem/sociologia-urbanizacao.jpg', alt: 'Vista urbana de Guangzhou e da Torre Canton' },
        { src: 'imagem/sociologia-cultura.jpg', alt: 'Pintura rupestre de bisão na caverna de Altamira' }
    ],
    geografia: [
        { src: 'imagem/geografia.jpg', alt: 'Ilustração de mapa-múndi e paisagens humanizadas' },
        { src: 'imagem/geografia-terra.jpg', alt: 'Imagem de satélite do planeta Terra' },
        { src: 'imagem/geografia-montanha.jpg', alt: 'Face norte do Monte Everest' },
        { src: 'imagem/geografia-rio.jpg', alt: 'Barco navegando pelo rio Mekong' }
    ]
};

const movimentoReduzido = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!movimentoReduzido) {
    document.querySelectorAll('[data-carrossel-materia]').forEach((carrossel) => {
        const imagens = imagensPorMateria[carrossel.dataset.carrosselMateria];
        const imagemAtual = carrossel.querySelector('img');
        if (!imagens || !imagemAtual || imagens.length < 2) return;

        imagens.slice(1).forEach((imagem) => {
            const imagemPrecarregada = new Image();
            imagemPrecarregada.src = imagem.src;
        });

        let indiceAtual = 0;
        window.setInterval(() => {
            indiceAtual = (indiceAtual + 1) % imagens.length;
            imagemAtual.src = imagens[indiceAtual].src;
            imagemAtual.alt = imagens[indiceAtual].alt;
            imagemAtual.classList.add('imagem-carrossel-trocando');
            window.setTimeout(() => imagemAtual.classList.remove('imagem-carrossel-trocando'), 400);
        }, 4000);
    });
}


// ── NAVEGAÇÃO SUAVE PARA ÂNCORAS INTERNAS (#secao) ───────────────────
// Delegado no document para funcionar também em links criados pelo JS (busca).
document.addEventListener('click', (evento) => {
    const ancora = evento.target.closest('a[href^="#"]');
    if (!ancora) return;

    const ancora_href = ancora.getAttribute('href');
    if (ancora_href.length < 2) return;

    let destino = null;
    try { destino = document.querySelector(ancora_href); } catch (_) { /* seletor inválido */ }
    if (!destino) return;

    evento.preventDefault();
    destino.scrollIntoView({ behavior: 'smooth' });
});


// ── LINHA DO TEMPO ────────────────────────────────────────────────────
// Dados históricos agrupados por era
const dadosLinhaDoTempo = {
    antiga: [
        { ano: '3000 AC', titulo: 'Surgimento da Escrita',  descricao: 'Início da História documentada' },
        { ano: '500 AC',  titulo: 'Grécia Antiga',          descricao: 'Período Clássico da civilização grega' }
    ],
    media: [
        { ano: '476',  titulo: 'Queda de Roma',          descricao: 'Início da Idade Média' },
        { ano: '1453', titulo: 'Queda de Constantinopla', descricao: 'Fim da Idade Média' }
    ],
    moderna: [
        { ano: '1492', titulo: 'Descoberta da América', descricao: 'Início das Grandes Navegações' },
        { ano: '1789', titulo: 'Revolução Francesa',    descricao: 'Marco do fim da Idade Moderna' }
    ],
    contemporanea: [
        { ano: '1914', titulo: 'Primeira Guerra Mundial',    descricao: 'Início dos conflitos globais' },
        { ano: '1989', titulo: 'Queda do Muro de Berlim', descricao: 'Fim da Guerra Fria' }
    ]
};

// Referências aos elementos da linha do tempo na página
const listaLinhaDoTempo = document.getElementById('listaLinhaDoTempo');
const seletorEra        = document.getElementById('seletorEra');
const btnEraAnterior    = document.getElementById('botaoEraAnterior');
const btnProximaEra     = document.getElementById('botaoProximaEra');

// Renderiza os eventos da era escolhida na lista da página
function atualizarLinhaDoTempo(era) {
    if (!listaLinhaDoTempo) return;

    const eventos = dadosLinhaDoTempo[era] || [];
    listaLinhaDoTempo.innerHTML = eventos.map(evento => `
        <div class="evento-linha-tempo">
            <div class="conteudo-evento">
                <h3>${evento.ano}</h3>
                <h4>${evento.titulo}</h4>
                <p>${evento.descricao}</p>
            </div>
        </div>
    `).join('');
}

// Avança ou recua entre as eras (passo: -1 ou +1)
function mudarEra(passo) {
    if (!seletorEra) return;
    const indiceNovo = seletorEra.selectedIndex + passo;
    if (indiceNovo >= 0 && indiceNovo < seletorEra.options.length) {
        seletorEra.selectedIndex = indiceNovo;
        atualizarLinhaDoTempo(seletorEra.value);
    }
}

seletorEra?.addEventListener('change', (e) => atualizarLinhaDoTempo(e.target.value));
btnEraAnterior?.addEventListener('click', () => mudarEra(-1));
btnProximaEra?.addEventListener('click',  () => mudarEra(1));


// ── LEITURAS AMPLIADAS ────────────────────────────────────────────────
// Conteúdo de cada tópico (chave = valor do atributo data-reading do botão)
const dadosLeitura = {
    'historia-antiga': { disciplina: 'História', titulo: 'História Antiga', paragrafos: [
        'A História Antiga estuda as sociedades que se desenvolveram desde o surgimento da escrita até a queda do Império Romano do Ocidente. Na Mesopotâmia e no Egito, a organização das cidades, a agricultura irrigada, os sistemas de escrita e a formação dos Estados transformaram a vida coletiva. Esses povos criaram leis, calendários, técnicas e formas de administração que influenciaram muitas sociedades posteriores.',
        'Na Grécia Antiga, diferentes cidades-Estado organizaram experiências políticas e culturais variadas. Atenas desenvolveu uma forma limitada de democracia, enquanto Esparta valorizava a formação militar. Roma construiu uma extensa experiência republicana e imperial, marcada por conflitos sociais, expansão territorial e diversidade cultural. Estudar esse período ajuda a compreender as origens de instituições, conceitos políticos, religiões e conhecimentos que ainda fazem parte do mundo contemporâneo.' ] },
    'historia-medieval': { disciplina: 'História', titulo: 'História Medieval', paragrafos: [
        'A Idade Média europeia começou após a fragmentação do Império Romano do Ocidente e foi marcada pela formação de novos reinos, pela ruralização e pelo fortalecimento das relações de dependência. O feudalismo combinou a posse da terra, o trabalho camponês e obrigações entre senhores e servos. A Igreja Católica exerceu grande influência cultural, política e econômica, preservando conhecimentos e organizando parte da vida social.',
        'O período também foi diverso e dinâmico. O Império Bizantino, as sociedades islâmicas e os reinos africanos desenvolveram comércio, ciência, literatura e arquitetura. A partir do crescimento das cidades, das feiras e das rotas comerciais, novas relações sociais surgiram. As crises do século XIV, as guerras e as transformações econômicas contribuíram para a formação das monarquias nacionais e para a transição à modernidade.' ] },
    'historia-moderna': { disciplina: 'História', titulo: 'História Moderna', paragrafos: [
        'A História Moderna abrange transformações iniciadas entre os séculos XV e XVI, como o Renascimento, as Grandes Navegações e a centralização do poder nas monarquias. A valorização da observação, da experiência e da cultura clássica estimulou novas formas de produzir conhecimento. Ao mesmo tempo, a expansão marítima europeia conectou continentes, criou redes comerciais e provocou violências, conquistas e resistências entre diferentes povos.',
        'A Reforma Protestante, a Contrarreforma e o absolutismo alteraram as relações entre religião e política. Mais tarde, o Iluminismo defendeu o uso da razão, os direitos e a crítica aos privilégios. A Revolução Industrial modificou o trabalho e as cidades, enquanto a Revolução Francesa questionou a sociedade de ordens. O período revela como mudanças econômicas, políticas e culturais se relacionam.' ] },
    'historia-contemporanea': { disciplina: 'História', titulo: 'História Contemporânea', paragrafos: [
        'A História Contemporânea é marcada pela industrialização, pelo imperialismo, pelas lutas sociais e pela consolidação dos Estados nacionais. As duas guerras mundiais produziram destruição em escala inédita e alteraram as relações de poder. A Revolução Russa, o fascismo, o nazismo e a crise de 1929 mostram como projetos políticos e econômicos disputaram os rumos das sociedades no século XX.',
        'Depois de 1945, a Guerra Fria dividiu o mundo em áreas de influência, enquanto processos de descolonização criaram novos países na África e na Ásia. No Brasil e em outros países latino-americanos, ditaduras, redemocratização e desigualdades fizeram parte da experiência recente. Hoje, globalização, tecnologias digitais, mudanças climáticas e disputas por direitos continuam transformando a vida social.' ] },
    'filosofia-antiga': { disciplina: 'Filosofia', titulo: 'Filosofia Antiga', paragrafos: [
        'A Filosofia Antiga surgiu quando pensadores passaram a buscar explicações racionais para a natureza, a vida humana e a organização da cidade. Os pré-socráticos investigaram a origem e os princípios do cosmos. Sócrates deslocou a reflexão para a vida ética e para o exame das próprias opiniões, utilizando o diálogo e a pergunta como instrumentos de conhecimento.',
        'Platão discutiu a relação entre aparência e verdade, a educação e a organização política da cidade. Aristóteles estudou lógica, ética, política, natureza e formas de conhecimento, defendendo a observação e a busca do equilíbrio. As escolas helenísticas, como estoicos e epicuristas, refletiram sobre a felicidade e a autonomia diante das dificuldades. Esse legado continua presente na ciência, na política e na educação.' ] },
    'etica-moral': { disciplina: 'Filosofia', titulo: 'Ética e Moral', paragrafos: [
        'Moral é o conjunto de valores, normas e costumes que orientam uma comunidade; ética é a reflexão crítica sobre esses valores e escolhas. A ética pergunta por que uma ação deve ser considerada justa, correta ou responsável. Por isso, não se limita a obedecer regras: ela analisa consequências, intenções, liberdade, responsabilidade e os conflitos entre diferentes princípios.',
        'As teorias éticas apresentam caminhos distintos. A ética das virtudes valoriza a formação do caráter; a ética do dever enfatiza princípios que devem ser respeitados; e as perspectivas consequencialistas avaliam os efeitos das ações. No cotidiano, esses debates aparecem no uso de dados, na inteligência artificial, no meio ambiente, nas relações de trabalho e no combate às discriminações.' ] },
    'filosofia-politica': { disciplina: 'Filosofia', titulo: 'Filosofia Política', paragrafos: [
        'A Filosofia Política investiga como as pessoas vivem juntas, como o poder é distribuído e quais instituições podem ser consideradas legítimas. Desde a cidade antiga, pensadores discutem cidadania, leis, justiça e participação. Na modernidade, autores como Hobbes, Locke e Rousseau analisaram o contrato social, os direitos e a relação entre indivíduo e Estado.',
        'As democracias contemporâneas dependem de participação, liberdade de expressão, igualdade perante a lei e proteção das minorias. Entretanto, desigualdade econômica, racismo, autoritarismo e desinformação dificultam a realização desses princípios. Estudar filosofia política permite reconhecer que a democracia não é apenas um sistema eleitoral, mas uma prática cotidiana de diálogo, responsabilidade e defesa dos direitos.' ] },
    'filosofia-contemporanea': { disciplina: 'Filosofia', titulo: 'Filosofia Contemporânea', paragrafos: [
        'A Filosofia Contemporânea reúne correntes que questionam certezas sobre razão, ciência, linguagem e progresso. O existencialismo refletiu sobre liberdade, angústia e responsabilidade; a fenomenologia investigou a experiência vivida; e a filosofia da linguagem mostrou como os significados dependem dos usos e contextos da comunicação.',
        'A teoria crítica analisou a cultura, o capitalismo e as formas de dominação presentes na sociedade. Outras correntes discutiram poder, gênero, colonialidade, tecnologia e identidade. Essas reflexões ajudam a interpretar problemas atuais, como a influência dos meios de comunicação, a vigilância digital e os impactos sociais das decisões automatizadas, sempre relacionando conceitos filosóficos com experiências concretas.' ] },
    'teoria-sociologica': { disciplina: 'Sociologia', titulo: 'Teoria Sociológica', paragrafos: [
        'A Sociologia nasceu no contexto das revoluções Industrial e Francesa, quando as cidades cresceram e antigas formas de organização foram transformadas. Émile Durkheim estudou os fatos sociais e a coesão; Karl Marx analisou o trabalho, as classes e os conflitos do capitalismo; Max Weber investigou a ação social, a burocracia e as formas de dominação.',
        'As teorias sociológicas não são apenas explicações abstratas. Elas oferecem instrumentos para observar a escola, a família, o trabalho, o Estado e as redes sociais. Comparar diferentes autores permite perceber que um mesmo fenômeno pode ser analisado por suas normas, por seus conflitos econômicos ou pelos sentidos atribuídos pelos indivíduos.' ] },
    'movimentos-sociais': { disciplina: 'Sociologia', titulo: 'Movimentos Sociais', paragrafos: [
        'Movimentos sociais são ações coletivas organizadas por pessoas que compartilham problemas, identidades ou projetos de mudança. Eles podem reivindicar direitos, denunciar injustiças e propor novas formas de participação. Trabalhadores, mulheres, movimentos negros, povos indígenas, estudantes e grupos ambientais construíram mobilizações que alteraram leis e práticas sociais.',
        'As estratégias variam entre manifestações, campanhas, ocupações, produção cultural, ações comunitárias e mobilização digital. Para compreender um movimento, é importante observar seu contexto, seus participantes, suas pautas e as relações de poder que enfrenta. A participação coletiva amplia a cidadania, mas também exige diálogo, organização e respeito à diversidade de posições.' ] },
    'cultura-sociedade': { disciplina: 'Sociologia', titulo: 'Cultura e Sociedade', paragrafos: [
        'Cultura é o conjunto de conhecimentos, valores, símbolos, linguagens e práticas aprendidos nas relações sociais. Ela não é fixa nem igual para todas as pessoas: transforma-se com as experiências, os conflitos, as migrações e os contatos entre grupos. A socialização ocorre na família, na escola, no trabalho, na comunidade e nos ambientes digitais.',
        'Observar a cultura sociologicamente significa evitar julgamentos baseados em uma única referência e reconhecer a diversidade dos modos de viver. Ao mesmo tempo, é necessário analisar quem controla os meios de produção cultural e como publicidade, entretenimento e plataformas digitais influenciam desejos e comportamentos. Cultura também é criação, resistência e disputa por representação.' ] },
    'desigualdade-social': { disciplina: 'Sociologia', titulo: 'Desigualdade Social', paragrafos: [
        'Desigualdade social ocorre quando recursos, oportunidades, direitos e reconhecimento são distribuídos de maneira injusta entre pessoas e grupos. Renda, escolaridade, moradia, saúde e acesso à tecnologia são dimensões relacionadas. A desigualdade não resulta apenas de escolhas individuais: ela também é produzida por estruturas econômicas, políticas e históricas.',
        'No Brasil, classe social, raça, gênero e território se combinam e geram experiências diferentes. Políticas públicas, educação, trabalho digno e participação social podem reduzir desigualdades, mas exigem enfrentar discriminações e privilégios. Estudar o tema ajuda a interpretar estatísticas e a perceber como decisões coletivas afetam a vida cotidiana.' ] },
    'geografia-populacao': { disciplina: 'Geografia', titulo: 'Geografia da População', paragrafos: [
        'A Geografia da População analisa como as pessoas se distribuem pelo espaço e como essa distribuição se relaciona a fatores naturais, econômicos, históricos e políticos. Densidade demográfica, crescimento, natalidade, mortalidade e expectativa de vida são indicadores que ajudam a comparar territórios e planejar políticas públicas.',
        'As migrações podem ocorrer por trabalho, estudo, conflitos, desastres ambientais ou busca por melhores condições de vida. Ao estudar fluxos populacionais, é importante considerar tanto as escolhas dos migrantes quanto as barreiras impostas por fronteiras e políticas. A população transforma o espaço, mas também é afetada por infraestrutura, emprego e acesso a serviços.' ] },
    'urbanizacao-cidades': { disciplina: 'Geografia', titulo: 'Urbanização e Cidades', paragrafos: [
        'Urbanização é o crescimento da população que vive em cidades e a expansão das atividades urbanas. As cidades concentram comércio, serviços, indústrias, universidades e redes de transporte, mas também enfrentam problemas de moradia, congestionamento, poluição e desigualdade. O espaço urbano é resultado de decisões públicas e de interesses econômicos que nem sempre atendem a todos.',
        'A segregação socioespacial aparece quando grupos vivem em áreas com diferentes condições de infraestrutura e acesso. Planejamento urbano, mobilidade sustentável, saneamento, áreas verdes e participação popular são caminhos para construir cidades mais justas. Ler a paisagem urbana permite perceber relações entre território, poder e qualidade de vida.' ] },
    'geopolitica-mundial': { disciplina: 'Geografia', titulo: 'Geopolítica Mundial', paragrafos: [
        'A Geopolítica estuda as relações de poder entre Estados, empresas, organizações e grupos sociais no espaço mundial. Fronteiras, recursos naturais, rotas comerciais, energia e tecnologia influenciam alianças e conflitos. O poder de um país não depende apenas de seu território: economia, população, conhecimento e capacidade diplomática também são importantes.',
        'A globalização aumentou a circulação de mercadorias, capitais, informações e pessoas, mas não eliminou desigualdades. Guerras, disputas territoriais, sanções e crises humanitárias revelam interesses diferentes. Analisar mapas e notícias com cuidado ajuda a evitar explicações simplistas e a compreender como decisões locais se relacionam com processos globais.' ] },
    'desenvolvimento-desigualdades': { disciplina: 'Geografia', titulo: 'Desenvolvimento e Desigualdades', paragrafos: [
        'Desenvolvimento não pode ser medido apenas pelo crescimento econômico. Saúde, educação, renda, moradia, segurança alimentar e preservação ambiental também indicam as condições de vida. O espaço mundial apresenta diferenças profundas entre países e dentro de cada país, resultado de histórias de exploração, decisões políticas, concentração de riqueza e acesso desigual a tecnologias.',
        'A sustentabilidade propõe atender às necessidades atuais sem destruir as possibilidades das próximas gerações. Isso envolve transição energética, consumo responsável, proteção de biomas e justiça ambiental. Comunidades mais vulneráveis costumam sofrer primeiro com poluição, falta de água e eventos extremos, por isso desenvolvimento precisa ser associado a direitos e participação social.' ] }
};

// Referências para os elementos da seção de leitura
const tituloDaLeitura = document.getElementById('tituloDaLeitura');
const paginaLeitura   = document.getElementById('paginaLeitura');
const botaoBaixar     = document.getElementById('botaoBaixar');
const botaoImprimir   = document.getElementById('botaoImprimir');

// Guarda o objeto da última leitura aberta (usado na exportação)
let leituraAtiva = null;

// Escapa caracteres especiais para uso seguro em HTML gerado dinamicamente
function escaparHtml(valor) {
    return valor.replace(/[&<>'\"]/g, caractere => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[caractere]));
}

// Abre o texto de leitura correspondente à chave (data-reading)
function abrirLeitura(chave) {
    const leitura = dadosLeitura[chave];
    if (!leitura || !paginaLeitura) return;

    leituraAtiva = leitura;

    // Atualiza o título acima da folha
    tituloDaLeitura.textContent = `${leitura.disciplina} — ${leitura.titulo}`;

    // Renderiza os parágrafos dentro da folha A4
    paginaLeitura.innerHTML = `<h3>${leitura.titulo}</h3>${leitura.paragrafos.map(p => `<p>${p}</p>`).join('')}`;

    // Habilita os botões de exportação
    botaoBaixar.disabled    = false;
    botaoImprimir.disabled  = false;

    // Rola suavemente até a seção de leitura
    document.getElementById('leitura')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Liga cada botão de tópico à função de abertura de leitura
document.querySelectorAll('.link-topico').forEach(botao => {
    botao.addEventListener('click', () => abrirLeitura(botao.dataset.reading));
});

// ── Baixar como arquivo HTML ──────────────────────────────────────────
botaoBaixar?.addEventListener('click', () => {
    if (!leituraAtiva) return;

    const paragrafos = leituraAtiva.paragrafos.map(p => `<p>${escaparHtml(p)}</p>`).join('');
    const htmlExportado = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${escaparHtml(leituraAtiva.titulo)}</title><style>@page{size:A4;margin:20mm}body{font-family:Georgia,serif;font-size:12pt;line-height:.5cm;max-width:170mm;margin:auto}h1{font-size:20pt;line-height:1.3;margin-bottom:1cm}p{margin:0 0 .5cm;text-align:justify}</style></head><body><h1>${escaparHtml(leituraAtiva.titulo)}</h1>${paragrafos}</body></html>`;

    const blob   = new Blob([htmlExportado], { type: 'text/html;charset=utf-8' });
    const url    = URL.createObjectURL(blob);
    const ancora = document.createElement('a');
    ancora.href  = url;
    ancora.download = `${leituraAtiva.titulo.toLowerCase().replace(/[^a-z0-9áéíóúãõç ]/gi, '').trim().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(ancora);
    ancora.click();
    ancora.remove();
    URL.revokeObjectURL(url);
});

// ── Imprimir / salvar em PDF ──────────────────────────────────────────
botaoImprimir?.addEventListener('click', () => {
    if (leituraAtiva) window.print();
});


// ── BUSCA ─────────────────────────────────────────────────────────────
// Procura em todo o conteúdo do portal: disciplinas, tópicos, recursos e
// eventos da linha do tempo. Ignora maiúsculas e acentos ("historia" acha
// "História") e aceita várias palavras ("revolução 1789").

const campoBusca        = document.getElementById('campoBusca');
const painelResultados  = document.getElementById('resultadosBusca');

// Remove acentos e converte para minúsculas para comparação normalizada
const normalizar = (texto) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Atrasa a execução da função para não disparar a cada tecla pressionada
function atrasar(funcao, espera) {
    let temporizador;
    return function (...args) {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcao.apply(this, args), espera);
    };
}

// Monta o índice lendo a própria página (qualquer conteúdo novo no HTML entra na busca)
function construirIndiceDeBusca() {
    const indice = [];

    // Adiciona um item ao índice
    const adicionar = (tipo, peso, titulo, contexto, destino) =>
        indice.push({ tipo, peso, titulo, contexto, destino,
            tituloNorm: normalizar(titulo), contextoNorm: normalizar(contexto) });

    const textoDoElemento = (el, seletor) => (el.querySelector(seletor)?.textContent || '').trim();

    // Indexa disciplinas e tópicos dos cartões
    document.querySelectorAll('.grade-cartoes .cartao').forEach(cartao => {
        const nomeDisciplina = textoDoElemento(cartao, 'h3');
        adicionar('Disciplina', 3, nomeDisciplina, textoDoElemento(cartao, '.cartao-corpo > p'), { el: cartao });
        cartao.querySelectorAll('li').forEach(item =>
            adicionar('Tópico', 1, item.textContent.trim(), nomeDisciplina, { el: cartao })
        );
    });

    // Indexa os recursos educacionais
    document.querySelectorAll('.item-recurso').forEach(item =>
        adicionar('Recurso', 2, textoDoElemento(item, 'h3'), textoDoElemento(item, 'p'), { el: item })
    );

    // Indexa os eventos da linha do tempo
    const nomeDaEra = (era) =>
        seletorEra?.querySelector(`option[value="${era}"]`)?.textContent || era;

    Object.entries(dadosLinhaDoTempo).forEach(([era, eventos]) =>
        eventos.forEach((ev, indiceEvento) =>
            adicionar('Linha do tempo', 2, ev.titulo,
                `${ev.ano} · ${nomeDaEra(era)} — ${ev.descricao}`,
                { era, indice: indiceEvento })
        )
    );

    return indice;
}

// Executa a busca: retorna os itens que contêm todos os termos digitados
function executarBusca(consultaBruta) {
    const termos = normalizar(consultaBruta).split(/\s+/).filter(Boolean);
    if (termos.length === 0 || (termos.length === 1 && termos[0].length < 2)) return [];

    const encontrados = [];

    indiceDeBusca.forEach((item, ordem) => {
        const haystack = item.tituloNorm + ' ' + item.contextoNorm;
        if (!termos.every(termo => haystack.includes(termo))) return;

        // Pontuação: favorece títulos que começam com o termo
        let pontuacao = item.peso;
        termos.forEach(termo => {
            if (item.tituloNorm.startsWith(termo))          pontuacao += 4;
            else if (item.tituloNorm.includes(' ' + termo)) pontuacao += 3;
            else if (item.tituloNorm.includes(termo))       pontuacao += 2;
            else                                             pontuacao += 1;
        });
        encontrados.push({ item, pontuacao, ordem });
    });

    encontrados.sort((a, b) => b.pontuacao - a.pontuacao || a.ordem - b.ordem);
    return encontrados.slice(0, 8).map(f => f.item);
}

// Escreve `texto` em `pai` destacando com <mark> os trechos que casam com a busca,
// mesmo quando a busca foi digitada sem acento.
function inserirComDestaque(pai, texto, termos) {
    let textoNorm = '';
    const mapa = [];   // posição no texto normalizado → posição no original

    for (let i = 0; i < texto.length; i++) {
        for (const ch of normalizar(texto[i])) { textoNorm += ch; mapa.push(i); }
    }

    const marcado = new Array(texto.length).fill(false);
    termos.forEach(termo => {
        for (let pos = textoNorm.indexOf(termo); pos !== -1; pos = textoNorm.indexOf(termo, pos + termo.length)) {
            for (let k = pos; k < pos + termo.length; k++) marcado[mapa[k]] = true;
        }
    });

    let i = 0;
    while (i < texto.length) {
        let j = i;
        while (j < texto.length && marcado[j] === marcado[i]) j++;
        const trecho = texto.slice(i, j);
        if (marcado[i]) {
            const mark = document.createElement('mark');
            mark.textContent = trecho;
            pai.appendChild(mark);
        } else {
            pai.appendChild(document.createTextNode(trecho));
        }
        i = j;
    }
}

// Estado da busca
let indiceDeBusca    = [];
let resultadosAtuais = [];
let indiceAtivo      = -1;
let temporizadorDestaque = null;

// Abre o painel de resultados (posiciona corretamente no mobile também)
function abrirPainelBusca() {
    const cabecalho = document.querySelector('header');
    if (cabecalho) {
        painelResultados.style.setProperty('--busca-topo', cabecalho.getBoundingClientRect().bottom + 'px');
    }
    painelResultados.style.display = 'block';
    campoBusca.setAttribute('aria-expanded', 'true');
}

// Fecha o painel de resultados
function fecharPainelBusca() {
    painelResultados.style.display = 'none';
    campoBusca.setAttribute('aria-expanded', 'false');
    campoBusca.removeAttribute('aria-activedescendant');
    indiceAtivo = -1;
}

// Destaca visualmente o item ativo na lista (navegação por teclado)
function definirItemAtivo(indice) {
    const opcoes = painelResultados.querySelectorAll('.item-resultado-busca');
    opcoes.forEach((opcao, i) => {
        const ativo = i === indice;
        opcao.classList.toggle('ativo', ativo);
        opcao.setAttribute('aria-selected', String(ativo));
    });
    indiceAtivo = indice;
    if (opcoes[indice]) {
        campoBusca.setAttribute('aria-activedescendant', opcoes[indice].id);
        opcoes[indice].scrollIntoView({ block: 'nearest' });
    } else {
        campoBusca.removeAttribute('aria-activedescendant');
    }
}

// Renderiza a lista de resultados no painel
function renderizarResultados(resultados, consultaBruta) {
    const termos = normalizar(consultaBruta).split(/\s+/).filter(Boolean);
    resultadosAtuais = resultados;
    painelResultados.innerHTML = '';

    if (resultados.length === 0) {
        const semResultado = document.createElement('div');
        semResultado.className = 'busca-sem-resultados';
        semResultado.textContent = `Nenhum resultado para "${consultaBruta.trim()}"`;
        painelResultados.appendChild(semResultado);
        indiceAtivo = -1;
        abrirPainelBusca();
        return;
    }

    resultados.forEach((resultado, i) => {
        const opcao   = document.createElement('button');
        opcao.type    = 'button';
        opcao.className = 'item-resultado-busca';
        opcao.id        = `resultado-busca-${i}`;
        opcao.setAttribute('role', 'option');

        // Linha superior: título + categoria
        const linhaTopo = document.createElement('span');
        linhaTopo.className = 'resultado-linha-topo';

        const titulo = document.createElement('span');
        titulo.className = 'resultado-titulo';
        inserirComDestaque(titulo, resultado.titulo, termos);

        const categoria = document.createElement('span');
        categoria.className = 'resultado-categoria';
        categoria.textContent = resultado.tipo;

        linhaTopo.append(titulo, categoria);

        // Linha de contexto
        const contexto = document.createElement('span');
        contexto.className = 'resultado-contexto';
        inserirComDestaque(contexto, resultado.contexto, termos);

        opcao.append(linhaTopo, contexto);
        opcao.addEventListener('click', () => irParaResultado(resultado));
        opcao.addEventListener('mousemove', () => { if (indiceAtivo !== i) definirItemAtivo(i); });
        painelResultados.appendChild(opcao);
    });

    definirItemAtivo(-1);
    abrirPainelBusca();
}

// Leva o usuário até o elemento encontrado e o destaca por alguns segundos
function irParaResultado(resultado) {
    fecharPainelBusca();
    let destino = resultado.destino.el;

    // Resultado da linha do tempo: troca a era antes de navegar
    if (resultado.destino.era) {
        seletorEra.value = resultado.destino.era;
        atualizarLinhaDoTempo(resultado.destino.era);
        destino = listaLinhaDoTempo.querySelectorAll('.evento-linha-tempo')[resultado.destino.indice];
    }
    if (!destino) return;

    destino.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Remove destaque anterior e aplica o novo
    document.querySelectorAll('.destaque-busca').forEach(el => el.classList.remove('destaque-busca'));
    destino.classList.add('destaque-busca');
    clearTimeout(temporizadorDestaque);
    temporizadorDestaque = setTimeout(() => destino.classList.remove('destaque-busca'), 2500);
}

// Atualiza os resultados com base no que está digitado no campo de busca
function atualizarBusca() {
    const consulta = campoBusca.value;
    if (consulta.trim().length < 2) { fecharPainelBusca(); return; }
    renderizarResultados(executarBusca(consulta), consulta);
}

// Inicializa o sistema de busca quando os elementos existem na página
if (campoBusca && painelResultados) {
    indiceDeBusca = construirIndiceDeBusca();

    // Atualiza com pequeno atraso para não buscar a cada tecla
    campoBusca.addEventListener('input', atrasar(atualizarBusca, 120));
    campoBusca.addEventListener('focus', () => {
        if (campoBusca.value.trim().length >= 2) atualizarBusca();
    });

    // Navegação por teclado dentro dos resultados
    campoBusca.addEventListener('keydown', (e) => {
        const painelAberto = painelResultados.style.display === 'block' && resultadosAtuais.length > 0;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!painelAberto) { atualizarBusca(); return; }
            const ultimo = resultadosAtuais.length - 1;
            const proximo = e.key === 'ArrowDown'
                ? (indiceAtivo >= ultimo ? 0 : indiceAtivo + 1)
                : (indiceAtivo <= 0 ? ultimo : indiceAtivo - 1);
            definirItemAtivo(proximo);

        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (!painelAberto) atualizarBusca();
            const escolhido = resultadosAtuais[indiceAtivo >= 0 ? indiceAtivo : 0];
            if (escolhido) irParaResultado(escolhido);

        } else if (e.key === 'Escape') {
            fecharPainelBusca();
        }
    });

    // Fecha o painel ao clicar fora da caixa de busca
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.caixa-busca')) fecharPainelBusca();
    });

    // Reposiciona o painel ao redimensionar a tela
    window.addEventListener('resize', () => {
        if (painelResultados.style.display === 'block') abrirPainelBusca();
    });
}


// ── SEÇÃO "SOBRE NÓS" ─────────────────────────────────────────────────
// Garante que o details fique expandido ao navegar via link âncora #sobre
const secaoSobreNos = document.getElementById('sobre');
document.querySelectorAll('a[href="#sobre"]').forEach((link) => {
    link.addEventListener('click', () => {
        if (secaoSobreNos) secaoSobreNos.open = true;
    });
});


function baixarMaterialPdf(chave) {
    const ancora = document.createElement('a');
    ancora.href = `/materiais/${encodeURIComponent(chave)}.pdf`;
    ancora.download = `${chave}-horizonte-educacional.pdf`;
    document.body.appendChild(ancora);
    ancora.click();
    ancora.remove();
}

document.querySelectorAll('.botao-baixar-lista').forEach(botao => {
    botao.addEventListener('click', () => baixarMaterialPdf(botao.dataset.lista));
});

document.querySelectorAll('.botao-comprar-lista').forEach(botao => {
    botao.addEventListener('click', () => {
        exibirNotificacao(`“${botao.dataset.produto}” é uma demonstração. Nenhuma compra ou cobrança foi realizada.`);
    });
});

document.querySelectorAll('.botao-plano-demonstracao').forEach(botao => {
    botao.addEventListener('click', () => {
        const modal = document.getElementById('modalAssinatura');
        if (modal && typeof modal.showModal === 'function') {
            modal.showModal();
        } else if (modal) {
            modal.setAttribute('open', '');
        }
    });
});

const modalPropostaEscola = document.getElementById('modalPropostaEscola');
const formPropostaEscola = document.getElementById('formPropostaEscola');
const botaoFecharModalPropostaEscola = document.getElementById('botaoFecharModalPropostaEscola');
const resultadoPropostaEscola = document.getElementById('resultadoPropostaEscola');

async function enviarFormularioEmail(formulario, rota, resultado) {
    const botao = formulario.querySelector('button[type="submit"]');
    const textoBotao = botao?.textContent;
    if (botao) {
        botao.disabled = true;
        botao.textContent = 'Enviando...';
    }
    resultado.textContent = 'Enviando para a caixa de testes do Mailtrap...';

    try {
        const resposta = await fetch(rota, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(Object.fromEntries(new FormData(formulario)))
        });
        const tipoConteudo = resposta.headers.get('content-type') || '';
        if (!tipoConteudo.includes('json')) {
            throw new Error(
                resposta.status === 404 || resposta.status === 405
                    ? 'O servidor ainda não carregou a rota de e-mail. Pare e reinicie o Flask e recarregue a página.'
                    : 'O servidor retornou uma resposta inesperada. Tente novamente ou reinicie o Flask.'
            );
        }
        const dados = await resposta.json();
        if (!resposta.ok) {
            throw new Error(dados.error || 'Não foi possível enviar a mensagem.');
        }
        formulario.reset();
        resultado.textContent = dados.message;
    } catch (erro) {
        console.error('Erro ao enviar e-mail de teste:', erro);
        resultado.textContent = erro instanceof Error
            ? erro.message
            : 'Não foi possível enviar a mensagem. Tente novamente.';
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = textoBotao;
        }
    }
}

document.querySelectorAll('.botao-proposta-escola').forEach(botao => {
    botao.addEventListener('click', () => {
        if (modalPropostaEscola && typeof modalPropostaEscola.showModal === 'function') {
            modalPropostaEscola.showModal();
        } else if (modalPropostaEscola) {
            modalPropostaEscola.setAttribute('open', '');
        }
    });
});

formPropostaEscola?.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (!formPropostaEscola.reportValidity()) return;
    if (!resultadoPropostaEscola) return;
    await enviarFormularioEmail(formPropostaEscola, '/api/emails/proposta', resultadoPropostaEscola);
});

botaoFecharModalPropostaEscola?.addEventListener('click', () => {
    if (typeof modalPropostaEscola?.close === 'function') {
        modalPropostaEscola.close();
    } else {
        modalPropostaEscola?.removeAttribute('open');
    }
});

modalPropostaEscola?.addEventListener('click', evento => {
    if (evento.target === modalPropostaEscola && typeof modalPropostaEscola.close === 'function') {
        modalPropostaEscola.close();
    }
});

const modalSugestoes = document.getElementById('modalSugestoes');
const formSugestoes = document.getElementById('formSugestoes');
const resultadoSugestoes = document.getElementById('resultadoSugestoes');

document.querySelectorAll('[data-abrir-sugestoes]').forEach(link => {
    link.addEventListener('click', evento => {
        evento.preventDefault();
        if (modalSugestoes && typeof modalSugestoes.showModal === 'function') {
            modalSugestoes.showModal();
        } else if (modalSugestoes) {
            modalSugestoes.setAttribute('open', '');
        }
    });
});

document.getElementById('botaoFecharModalSugestoes')?.addEventListener('click', () => {
    if (typeof modalSugestoes?.close === 'function') {
        modalSugestoes.close();
    } else {
        modalSugestoes?.removeAttribute('open');
    }
});

formSugestoes?.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (!formSugestoes.reportValidity() || !resultadoSugestoes) return;
    await enviarFormularioEmail(formSugestoes, '/api/emails/sugestoes', resultadoSugestoes);
});

modalSugestoes?.addEventListener('click', evento => {
    if (evento.target === modalSugestoes && typeof modalSugestoes.close === 'function') {
        modalSugestoes.close();
    }
});

const listaDocentes = document.getElementById('listaDocentes');
const estadoDocentes = document.getElementById('estadoDocentes');
const palcoCarrosselDocentes = document.getElementById('palcoCarrosselDocentes');
const miniaturasDocentes = document.getElementById('miniaturasDocentes');
const botaoDocenteAnterior = document.getElementById('botaoDocenteAnterior');
const botaoDocenteProximo = document.getElementById('botaoDocenteProximo');
const filtroAreaDocentes = document.getElementById('filtroAreaDocentes');
const buscaDocentes = document.getElementById('buscaDocentes');
const modalContratarDocente = document.getElementById('modalContratarDocente');
const formContratarDocente = document.getElementById('formContratarDocente');
const resultadoContratacaoDocente = document.getElementById('resultadoContratacaoDocente');
const modalidadeContratacaoDocente = document.getElementById('modalidadeContratacaoDocente');
const periodoContratacaoDocente = document.getElementById('periodoContratacaoDocente');
let docentesDemonstrativos = [];
let indiceDocenteAtivo = 0;

function formatarMoedaDocente(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function renderizarPrecosDocente(docente) {
    const corpoTabela = document.getElementById('precosDocenteModal');
    if (!corpoTabela) return;
    corpoTabela.textContent = '';

    ['hora', 'dia', 'semana', 'mes', 'ano'].forEach(periodo => {
        const preco = docente.precos[periodo];
        const linha = document.createElement('tr');
        [preco.rotulo, formatarMoedaDocente(preco.online), formatarMoedaDocente(preco.presencial)]
            .forEach((valor, indice) => {
                const celula = document.createElement(indice === 0 ? 'th' : 'td');
                if (indice === 0) celula.scope = 'row';
                celula.textContent = valor;
                linha.appendChild(celula);
            });
        corpoTabela.appendChild(linha);
    });
}

function atualizarValorSelecionadoDocente(docente) {
    const valorSelecionado = document.getElementById('valorSelecionadoDocente');
    const preco = docente.precos[periodoContratacaoDocente?.value];
    const modalidade = modalidadeContratacaoDocente?.value;
    if (valorSelecionado && preco && modalidade) {
        valorSelecionado.textContent =
            `Valor demonstrativo selecionado: ${formatarMoedaDocente(preco[modalidade])} (${preco.horas} hora(s))`;
    }
}

function textoNormalizadoDocente(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function abrirPerfilDocente(docente) {
    const campos = {
        nomeDocenteModal: docente.nome,
        disciplinaDocenteModal: docente.disciplina,
        graduacaoDocenteModal: docente.graduacao,
        especializacaoDocenteModal: docente.especializacao,
        formacaoComplementarDocenteModal: docente.formacao_complementar,
        universidadeDocenteModal: `${docente.universidade} (instituição fictícia)`,
        areaDocenteModal: docente.area_atuacao,
        telefoneDocenteModal: docente.telefone,
        emailDocenteModal: docente.email,
        whatsappDocenteModal: docente.whatsapp,
        pixDocenteModal: docente.pix
    };

    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    });

    const avatar = document.getElementById('avatarDocenteModal');
    const titulo = document.getElementById('tituloModalContratarDocente');
    const idDocente = document.getElementById('idDocenteContratacao');
    if (!avatar || !titulo || !idDocente || !formContratarDocente || !modalContratarDocente) return;

    avatar.src = docente.imagem;
    avatar.alt = `Foto ilustrativa de ${docente.nome}`;
    titulo.textContent = `Perfil de ${docente.nome}`;
    formContratarDocente.reset();
    idDocente.value = docente.id;
    if (resultadoContratacaoDocente) resultadoContratacaoDocente.textContent = '';
    renderizarPrecosDocente(docente);
    atualizarValorSelecionadoDocente(docente);

    if (typeof modalContratarDocente.showModal === 'function') {
        modalContratarDocente.showModal();
    } else {
        modalContratarDocente.setAttribute('open', '');
    }
}

function renderizarDocentes() {
    if (!listaDocentes || !estadoDocentes) return;
    listaDocentes.textContent = '';
    if (miniaturasDocentes) miniaturasDocentes.textContent = '';
    const area = filtroAreaDocentes?.value || '';
    const termo = textoNormalizadoDocente(buscaDocentes?.value.trim() || '');
    const filtrados = docentesDemonstrativos.filter(docente => {
        const correspondeArea = !area || docente.area_atuacao === area;
        const textoPerfil = textoNormalizadoDocente([
            docente.nome,
            docente.disciplina,
            docente.graduacao,
            docente.especializacao,
            docente.formacao_complementar,
            docente.universidade,
            docente.area_atuacao
        ].join(' '));
        return correspondeArea && textoPerfil.includes(termo);
    });

    const haResultados = filtrados.length > 0;
    if (palcoCarrosselDocentes) palcoCarrosselDocentes.hidden = !haResultados;
    if (miniaturasDocentes) miniaturasDocentes.hidden = !haResultados;
    if (botaoDocenteAnterior) botaoDocenteAnterior.disabled = filtrados.length < 2;
    if (botaoDocenteProximo) botaoDocenteProximo.disabled = filtrados.length < 2;

    if (!haResultados) {
        estadoDocentes.textContent = 'Nenhum profissional encontrado com esses filtros.';
        return;
    }

    indiceDocenteAtivo = ((indiceDocenteAtivo % filtrados.length) + filtrados.length) % filtrados.length;
    const docenteAtivo = filtrados[indiceDocenteAtivo];
    estadoDocentes.textContent = `Perfil ${indiceDocenteAtivo + 1} de ${filtrados.length} profissionais encontrados (${docentesDemonstrativos.length} no catálogo).`;

    const cartao = document.createElement('article');
    cartao.className = 'cartao-docente cartao-docente--destaque';
    const foto = document.createElement('img');
    foto.className = 'foto-docente-destaque';
    foto.src = docenteAtivo.imagem;
    foto.alt = `Foto ilustrativa de ${docenteAtivo.nome}`;
    foto.loading = 'eager';

    const conteudo = document.createElement('div');
    conteudo.className = 'conteudo-cartao-docente';
    const cabecalho = document.createElement('div');
    cabecalho.className = 'cabecalho-cartao-docente';
    const identificacao = document.createElement('div');
    const nome = document.createElement('h3');
    nome.textContent = docenteAtivo.nome;
    const disciplina = document.createElement('p');
    disciplina.className = 'cartao-docente-cargo';
    disciplina.textContent = docenteAtivo.disciplina;
    identificacao.append(nome, disciplina);
    cabecalho.appendChild(identificacao);

    const areaDocente = document.createElement('span');
    areaDocente.className = 'etiqueta-atuacao-docente';
    areaDocente.textContent = docenteAtivo.area_atuacao;
    const graduacao = document.createElement('p');
    graduacao.textContent = docenteAtivo.graduacao;
    const especializacao = document.createElement('p');
    especializacao.textContent = `Especialização: ${docenteAtivo.especializacao}`;
    const formacaoComplementar = document.createElement('p');
    formacaoComplementar.textContent = `Formação complementar: ${docenteAtivo.formacao_complementar}`;
    const valores = document.createElement('p');
    valores.className = 'precos-docente';
    valores.textContent = `On-line: ${formatarMoedaDocente(docenteAtivo.valor_online)}/h · Presencial: ${formatarMoedaDocente(docenteAtivo.valor_presencial)}/h`;

    const botao = document.createElement('button');
    botao.className = 'btn btn-dourado';
    botao.type = 'button';
    botao.textContent = 'Ver perfil e solicitar aula';
    botao.addEventListener('click', () => abrirPerfilDocente(docenteAtivo));

    conteudo.append(cabecalho, areaDocente, graduacao, especializacao, formacaoComplementar, valores, botao);
    cartao.append(foto, conteudo);
    listaDocentes.appendChild(cartao);

    filtrados.forEach((docente, indice) => {
        const miniatura = document.createElement('button');
        miniatura.className = 'miniatura-docente';
        miniatura.type = 'button';
        miniatura.setAttribute('aria-pressed', String(indice === indiceDocenteAtivo));
        miniatura.setAttribute('aria-label', `Ver perfil de ${docente.nome}, ${docente.disciplina}`);
        const fotoMiniatura = document.createElement('img');
        fotoMiniatura.src = docente.imagem;
        fotoMiniatura.alt = '';
        fotoMiniatura.loading = 'lazy';
        const nomeMiniatura = document.createElement('span');
        nomeMiniatura.textContent = docente.nome;
        const disciplinaMiniatura = document.createElement('small');
        disciplinaMiniatura.textContent = docente.disciplina;
        miniatura.append(fotoMiniatura, nomeMiniatura, disciplinaMiniatura);
        miniatura.addEventListener('click', () => {
            indiceDocenteAtivo = indice;
            renderizarDocentes();
            miniaturasDocentes?.querySelectorAll('button')[indice]?.focus();
        });
        miniaturasDocentes?.appendChild(miniatura);
    });
}

async function carregarDocentesDemonstrativos() {
    if (!listaDocentes || !estadoDocentes) return;
    try {
        const resposta = await fetch('/api/professores', { credentials: 'same-origin' });
        const tipoConteudo = resposta.headers.get('content-type') || '';
        if (!tipoConteudo.includes('json')) {
            throw new Error('O servidor retornou uma resposta inesperada ao carregar o catálogo.');
        }
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.error || 'Não foi possível carregar o catálogo.');
        if (!Array.isArray(dados.professores)) throw new Error('A lista de professores recebida é inválida.');
        docentesDemonstrativos = dados.professores;
        renderizarDocentes();
    } catch (erro) {
        console.error('Erro ao carregar professores demonstrativos:', erro);
        estadoDocentes.textContent = erro instanceof Error
            ? erro.message
            : 'Não foi possível carregar o catálogo. Tente novamente.';
    }
}

function atualizarFiltroDocentes() {
    indiceDocenteAtivo = 0;
    if (miniaturasDocentes) miniaturasDocentes.scrollLeft = 0;
    renderizarDocentes();
}

function rolarParaMiniaturaAtiva() {
    miniaturasDocentes?.querySelectorAll('button')[indiceDocenteAtivo]?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth'
    });
}

filtroAreaDocentes?.addEventListener('change', atualizarFiltroDocentes);
buscaDocentes?.addEventListener('input', atualizarFiltroDocentes);
carregarDocentesDemonstrativos();

botaoDocenteAnterior?.addEventListener('click', () => {
    indiceDocenteAtivo -= 1;
    renderizarDocentes();
    rolarParaMiniaturaAtiva();
});

botaoDocenteProximo?.addEventListener('click', () => {
    indiceDocenteAtivo += 1;
    renderizarDocentes();
    rolarParaMiniaturaAtiva();
});

modalidadeContratacaoDocente?.addEventListener('change', () => {
    const docente = docentesDemonstrativos.find(item =>
        item.id === document.getElementById('idDocenteContratacao')?.value
    );
    if (docente) atualizarValorSelecionadoDocente(docente);
});

periodoContratacaoDocente?.addEventListener('change', () => {
    const docente = docentesDemonstrativos.find(item =>
        item.id === document.getElementById('idDocenteContratacao')?.value
    );
    if (docente) atualizarValorSelecionadoDocente(docente);
});

document.getElementById('botaoFecharModalContratarDocente')?.addEventListener('click', () => {
    if (typeof modalContratarDocente?.close === 'function') {
        modalContratarDocente.close();
    } else {
        modalContratarDocente?.removeAttribute('open');
    }
});

modalContratarDocente?.addEventListener('click', evento => {
    if (evento.target === modalContratarDocente && typeof modalContratarDocente.close === 'function') {
        modalContratarDocente.close();
    }
});

formContratarDocente?.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (!formContratarDocente.reportValidity() || !resultadoContratacaoDocente) return;
    await enviarFormularioEmail(
        formContratarDocente,
        '/api/emails/contrato-docente',
        resultadoContratacaoDocente
    );
});

const modalAssinatura = document.getElementById('modalAssinatura');
const formAssinaturaTeste = document.getElementById('formAssinaturaTeste');
const botaoFecharModalAssinatura = document.getElementById('botaoFecharModalAssinatura');
const resultadoAssinaturaTeste = document.getElementById('resultadoAssinaturaTeste');

formAssinaturaTeste?.addEventListener('submit', evento => {
    evento.preventDefault();
    if (!formAssinaturaTeste.reportValidity()) return;

    const dados = new FormData(formAssinaturaTeste);
    const email = dados.get('email');
    const metodo = dados.get('metodoPagamento');
    if (typeof email !== 'string' || typeof metodo !== 'string' || !resultadoAssinaturaTeste) {
        console.error('Não foi possível concluir a simulação de contratação: dados inválidos.');
        return;
    }

    resultadoAssinaturaTeste.textContent = `Teste concluído para ${email} usando ${metodo}. Nenhuma cobrança foi realizada.`;
});

botaoFecharModalAssinatura?.addEventListener('click', () => {
    if (typeof modalAssinatura?.close === 'function') {
        modalAssinatura.close();
    } else {
        modalAssinatura?.removeAttribute('open');
    }
});

modalAssinatura?.addEventListener('click', evento => {
    if (evento.target === modalAssinatura && typeof modalAssinatura.close === 'function') {
        modalAssinatura.close();
    }
});

const cartoesDepoimento = [...document.querySelectorAll('[data-depoimento]')];
const indicadorDepoimento = document.getElementById('indicadorDepoimento');
let indiceDepoimentoAtual = 0;

function mostrarDepoimento(indice) {
    if (cartoesDepoimento.length === 0) return;
    indiceDepoimentoAtual = (indice + cartoesDepoimento.length) % cartoesDepoimento.length;
    cartoesDepoimento.forEach((cartao, posicao) => {
        cartao.hidden = posicao !== indiceDepoimentoAtual;
    });
    if (indicadorDepoimento) {
        indicadorDepoimento.textContent = `${indiceDepoimentoAtual + 1} de ${cartoesDepoimento.length}`;
    }
}

document.getElementById('botaoDepoimentoAnterior')?.addEventListener('click', () => {
    mostrarDepoimento(indiceDepoimentoAtual - 1);
});
document.getElementById('botaoProximoDepoimento')?.addEventListener('click', () => {
    mostrarDepoimento(indiceDepoimentoAtual + 1);
});

const instituicoesDemonstrativas = [...document.querySelectorAll('.instituicao-demonstrativa')];
const secaoInstituicoes = document.querySelector('.escolas-parceiras');
const indicadorInstituicoes = document.getElementById('indicadorInstituicoes');
const botaoInstituicaoAnterior = document.getElementById('botaoInstituicaoAnterior');
const botaoInstituicaoProxima = document.getElementById('botaoInstituicaoProxima');
const botaoPausarInstituicoes = document.getElementById('botaoPausarInstituicoes');
let inicioInstituicoes = 0;
let temporizadorInstituicoes = null;
let rotacaoPausada = Boolean(movimentoReduzido);

function instituicoesPorPagina() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 900) return 3;
    return 4;
}

function atualizarCarrosselInstituicoes() {
    if (!instituicoesDemonstrativas.length) return;

    const quantidadePorPagina = instituicoesPorPagina();
    const totalPaginas = Math.ceil(instituicoesDemonstrativas.length / quantidadePorPagina);
    const paginaAtual = Math.min(Math.floor(inicioInstituicoes / quantidadePorPagina), totalPaginas - 1);
    inicioInstituicoes = paginaAtual * quantidadePorPagina;
    const fim = Math.min(inicioInstituicoes + quantidadePorPagina, instituicoesDemonstrativas.length);

    instituicoesDemonstrativas.forEach((instituicao, indice) => {
        instituicao.hidden = indice < inicioInstituicoes || indice >= fim;
    });

    if (indicadorInstituicoes) {
        indicadorInstituicoes.textContent = `${inicioInstituicoes + 1}-${fim} de ${instituicoesDemonstrativas.length}`;
    }
}

function moverCarrosselInstituicoes(direcao) {
    const quantidadePorPagina = instituicoesPorPagina();
    const totalPaginas = Math.ceil(instituicoesDemonstrativas.length / quantidadePorPagina);
    if (totalPaginas <= 1) return;

    const paginaAtual = Math.floor(inicioInstituicoes / quantidadePorPagina);
    const proximaPagina = (paginaAtual + direcao + totalPaginas) % totalPaginas;
    inicioInstituicoes = proximaPagina * quantidadePorPagina;
    atualizarCarrosselInstituicoes();
}

function atualizarBotaoRotacaoInstituicoes() {
    if (!botaoPausarInstituicoes) return;
    botaoPausarInstituicoes.textContent = rotacaoPausada ? 'Retomar' : 'Pausar';
    botaoPausarInstituicoes.setAttribute('aria-pressed', String(rotacaoPausada));
    botaoPausarInstituicoes.setAttribute(
        'aria-label',
        rotacaoPausada ? 'Retomar avanço automático das instituições' : 'Pausar avanço automático das instituições'
    );
}

function sincronizarRotacaoInstituicoes() {
    if (rotacaoPausada || document.hidden || secaoInstituicoes?.matches(':hover')) {
        if (temporizadorInstituicoes !== null) {
            window.clearInterval(temporizadorInstituicoes);
            temporizadorInstituicoes = null;
        }
        return;
    }

    if (temporizadorInstituicoes === null && instituicoesDemonstrativas.length > instituicoesPorPagina()) {
        temporizadorInstituicoes = window.setInterval(() => moverCarrosselInstituicoes(1), 4000);
    }
}

if (instituicoesDemonstrativas.length) {
    atualizarCarrosselInstituicoes();
    atualizarBotaoRotacaoInstituicoes();
    sincronizarRotacaoInstituicoes();

    botaoInstituicaoAnterior?.addEventListener('click', () => {
        moverCarrosselInstituicoes(-1);
        sincronizarRotacaoInstituicoes();
    });
    botaoInstituicaoProxima?.addEventListener('click', () => {
        moverCarrosselInstituicoes(1);
        sincronizarRotacaoInstituicoes();
    });
    botaoPausarInstituicoes?.addEventListener('click', () => {
        rotacaoPausada = !rotacaoPausada;
        atualizarBotaoRotacaoInstituicoes();
        sincronizarRotacaoInstituicoes();
    });
    secaoInstituicoes?.addEventListener('mouseenter', sincronizarRotacaoInstituicoes);
    secaoInstituicoes?.addEventListener('mouseleave', sincronizarRotacaoInstituicoes);
    document.addEventListener('visibilitychange', sincronizarRotacaoInstituicoes);
    window.addEventListener('resize', atualizarCarrosselInstituicoes);
}

// ── BOTÃO "VOLTAR AO TOPO" ────────────────────────────────────────────
// Criado pelo JS e injetado na página
const btnVoltarAoTopo = document.createElement('button');
btnVoltarAoTopo.innerHTML = '↑';
btnVoltarAoTopo.className = 'btn-voltar-ao-topo';
btnVoltarAoTopo.setAttribute('aria-label', 'Voltar ao topo');
document.body.appendChild(btnVoltarAoTopo);

// Volta ao início da página com rolagem suave
btnVoltarAoTopo.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
);

// Exibe o botão apenas quando o usuário rolou mais de 300px
window.addEventListener('scroll', () => {
    btnVoltarAoTopo.style.display = window.scrollY > 300 ? 'block' : 'none';
});


// ── INICIALIZAÇÃO ─────────────────────────────────────────────────────
verificarAutenticacao();
atualizarLinhaDoTempo(seletorEra ? seletorEra.value : 'antiga');
