// Autenticação demonstrativa para GitHub Pages.
// A versão Flask continua usando o backend quando executada localmente.
const CHAVE_USUARIOS = 'horizonte_usuarios';
const CHAVE_SESSAO = 'horizonte_sessao';

function urlRelativa(caminho) {
    return new URL(caminho, document.baseURI).href;
}

function exibirNotificacao(mensagem, tipo = 'sucesso') {
    const area = document.getElementById('areaNotificacao') || document.getElementById('notification');
    if (!area) { window.alert(mensagem); return; }
    area.textContent = mensagem;
    area.className = `notificacao ${tipo}`;
    area.style.display = 'block';
    clearTimeout(exibirNotificacao.timer);
    exibirNotificacao.timer = setTimeout(() => { area.style.display = 'none'; }, 3000);
}

function lerUsuarios() {
    try { return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]'); }
    catch (_) { return []; }
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function obterPerfil() {
    return document.getElementById('perfilUsuario')?.value ||
        (document.body.dataset.perfil === 'professor' ? 'professor' : 'aluno');
}

function redirecionar(caminho) {
    window.location.href = urlRelativa(caminho);
}

// Botões de mostrar/ocultar senha e e-mail.
document.querySelectorAll('[data-toggle-visibility]').forEach((botao) => {
    const campo = document.getElementById(botao.dataset.toggleVisibility);
    if (!campo) return;
    botao.addEventListener('click', () => {
        const oculto = campo.type === botao.dataset.hiddenType;
        campo.type = oculto ? botao.dataset.visibleType : botao.dataset.hiddenType;
        const texto = botao.querySelector('span');
        if (texto) texto.textContent = oculto ? 'Ocultar' : 'Mostrar';
        botao.setAttribute('aria-label', `${oculto ? 'Ocultar' : 'Mostrar'} ${botao.dataset.fieldLabel || ''}`);
    });
});

// Abas de aluno/professor.
const campoPerfil = document.getElementById('perfilUsuario');
document.querySelectorAll('.aba-perfil').forEach((aba) => {
    aba.addEventListener('click', () => {
        if (campoPerfil) campoPerfil.value = aba.dataset.role || 'aluno';
        document.querySelectorAll('.aba-perfil').forEach((item) => {
            const ativa = item === aba;
            item.classList.toggle('ativa', ativa);
            item.setAttribute('aria-pressed', String(ativa));
        });
    });
});

const formularioRegistro = document.getElementById('formularioRegistro') || document.getElementById('registerForm');
if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const nome = (document.getElementById('nomeCompleto') || document.getElementById('name'))?.value.trim();
        const email = document.getElementById('email')?.value.trim().toLowerCase();
        const senha = (document.getElementById('senha') || document.getElementById('password'))?.value || '';
        const confirmacao = (document.getElementById('confirmacaoSenha') || document.getElementById('confirmPassword'))?.value || '';
        const role = obterPerfil();
        if (!nome || !email || senha.length < 8 || senha !== confirmacao) {
            exibirNotificacao(senha.length < 8 ? 'A senha precisa ter ao menos 8 caracteres.' : 'Confira os campos e confirme a senha.', 'erro');
            return;
        }
        const usuarios = lerUsuarios();
        if (usuarios.some((usuario) => usuario.email === email && usuario.role === role)) {
            exibirNotificacao('Este e-mail já está cadastrado para esse perfil.', 'erro');
            return;
        }
        usuarios.push({ nome, email, senha, role, gender: document.getElementById('tratamentoUsuario')?.value || 'neutro' });
        salvarUsuarios(usuarios);
        exibirNotificacao('Cadastro realizado! Agora faça login.');
        setTimeout(() => redirecionar(role === 'professor' ? 'login_professor.html' : 'login_aluno.html'), 700);
    });
}

const formularioLogin = document.getElementById('formularioLogin') || document.getElementById('loginForm');
if (formularioLogin) {
    formularioLogin.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const email = document.getElementById('email')?.value.trim().toLowerCase();
        const senha = (document.getElementById('senha') || document.getElementById('password'))?.value || '';
        const role = obterPerfil();
        const usuario = lerUsuarios().find((item) => item.email === email && item.senha === senha && item.role === role);
        if (!usuario) { exibirNotificacao('E-mail, senha ou perfil incorreto.', 'erro'); return; }
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ email: usuario.email, nome: usuario.nome, role: usuario.role, gender: usuario.gender }));
        exibirNotificacao('Login realizado com sucesso!');
        setTimeout(() => redirecionar(role === 'professor' ? 'index_professor.html' : 'index_alunos.html'), 500);
    });
}
