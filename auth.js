// ======================================================================
// Horizonte Educacional — login por perfil e cadastro
//
// Quem protege as páginas é o servidor (app.py); aqui só enviamos os
// formulários para as rotas /login e /register do Flask.
// ======================================================================


// ── NOTIFICAÇÃO ───────────────────────────────────────────────────────
// Exibe uma mensagem (sucesso ou erro) na área de notificação da página.
// A área é o elemento com id="areaNotificacao".
function exibirNotificacao(mensagem, tipo = 'sucesso') {
    const areaNotificacao = document.getElementById('areaNotificacao');
    if (!areaNotificacao) return;

    areaNotificacao.textContent = mensagem;
    areaNotificacao.className = `notificacao ${tipo}`;
    areaNotificacao.style.display = 'block';

    // Esconde automaticamente depois de 3 segundos
    clearTimeout(exibirNotificacao.temporizador);
    exibirNotificacao.temporizador = setTimeout(() => {
        areaNotificacao.style.display = 'none';
    }, 3000);
}


// ── ALTERNAR VISIBILIDADE DO CAMPO (olho) ─────────────────────────────
// Inicializa todos os botões "Mostrar / Ocultar" da página.
// Cada botão usa data-toggle-visibility para saber qual input controlar.
document.querySelectorAll('[data-toggle-visibility]').forEach((botao) => {
    const campoAlvo = document.getElementById(botao.dataset.toggleVisibility);
    if (!campoAlvo) return;

    botao.addEventListener('click', () => {
        // Se o campo está oculto (tipo = hiddenType), torna visível, e vice-versa
        const estaOculto = campoAlvo.type === botao.dataset.hiddenType;
        campoAlvo.type = estaOculto ? botao.dataset.visibleType : botao.dataset.hiddenType;

        // Atualiza o texto e os atributos de acessibilidade do botão
        botao.querySelector('span').textContent = estaOculto ? 'Ocultar' : 'Mostrar';
        botao.setAttribute('aria-label', `${estaOculto ? 'Ocultar' : 'Mostrar'} ${botao.dataset.fieldLabel}`);
        botao.setAttribute('aria-pressed', String(estaOculto));
    });
});

// ── SELETOR DE PERFIL ─────────────────────────────────────────────────
// Mantém o perfil escolhido no campo oculto.
const campoPerfil = document.getElementById('perfilUsuario');

document.querySelectorAll('.aba-perfil').forEach((aba) => {
    aba.addEventListener('click', () => {
        const perfilSelecionado = aba.dataset.role;
        if (campoPerfil) campoPerfil.value = perfilSelecionado;

        document.querySelectorAll('.aba-perfil').forEach((outraAba) => {
            const estaAtiva = outraAba === aba;
            outraAba.classList.toggle('ativa', estaAtiva);
            outraAba.setAttribute('aria-pressed', String(estaAtiva));
        });

    });
});


// ── ENVIO JSON PARA O SERVIDOR ────────────────────────────────────────
// Envia um objeto como JSON e retorna { ok, dados }.
// Nunca lança exceção: se a resposta não for JSON, dados = {}.
async function enviarJSON(url, payload) {
    const resposta = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    });
    let dados = {};
    try { dados = await resposta.json(); } catch (_) { /* resposta sem JSON */ }
    return { ok: resposta.ok, dados };
}

// ── VALIDAÇÃO DE SENHAS ───────────────────────────────────────────────
// Verifica se a senha tem 8 caracteres e, quando há confirmação, se coincidem.
// Retorna true se tudo estiver certo, false caso contrário.
function validarSenhas() {
    const senha            = document.getElementById('senha').value;
    const campoCofirmacao  = document.getElementById('confirmacaoSenha');

    if (senha.length < 8) {
        exibirNotificacao('A senha precisa ter ao menos 8 caracteres', 'erro');
        return false;
    }
    if (campoCofirmacao && senha !== campoCofirmacao.value) {
        exibirNotificacao('As senhas não coincidem', 'erro');
        return false;
    }
    return true;
}


// ── FORMULÁRIO DE CADASTRO ────────────────────────────────────────────
const formularioRegistro = document.getElementById('formularioRegistro');
if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (!validarSenhas()) return;

        try {
            const { ok, dados } = await enviarJSON('/register', {
                name:            document.getElementById('nomeCompleto').value.trim(),
                email:           document.getElementById('email').value.trim(),
                gender:          document.getElementById('tratamentoUsuario').value,
                password:        document.getElementById('senha').value,
                confirmPassword: document.getElementById('confirmacaoSenha').value,
                role:            campoPerfil ? campoPerfil.value : 'aluno'
            });

            if (ok) {
                exibirNotificacao(dados.message || 'Cadastro realizado!');
                // Aguarda a notificação antes de abrir o portal autenticado.
                setTimeout(() => {
                    window.location.href = dados.redirect || '/index_alunos.html';
                }, 800);
            } else {
                exibirNotificacao(dados.error || 'Não foi possível cadastrar', 'erro');
            }

        } catch (erro) {
            exibirNotificacao(
                'Não foi possível cadastrar. Execute o projeto com "python app.py" e acesse http://localhost:5000.',
                'erro'
            );
            console.error('Erro no cadastro:', erro);
        }
    });
}


// ── FORMULÁRIO DE LOGIN ───────────────────────────────────────────────
const formularioLogin = document.getElementById('formularioLogin');
if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        try {
            const { ok, dados } = await enviarJSON('/login', {
                email:    document.getElementById('email').value.trim(),
                password: document.getElementById('senha').value,
                role:     campoPerfil ? campoPerfil.value : 'aluno'
            });

            if (ok) {
                exibirNotificacao(dados.message || 'Login realizado!');
                // Aguarda 0,8 s e abre a página inicial do perfil autenticado.
                setTimeout(() => {
                    window.location.href = dados.redirect || '/index_alunos.html';
                }, 800);
            } else {
                exibirNotificacao(dados.error || 'E-mail ou senha incorretos', 'erro');
            }

        } catch (erro) {
            exibirNotificacao(
                'Não foi possível entrar. Execute o projeto com "python app.py" e acesse http://localhost:5000.',
                'erro'
            );
            console.error('Erro no login:', erro);
        }
    });
}
