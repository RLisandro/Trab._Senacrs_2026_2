// Autenticação demonstrativa para GitHub Pages.
// A versão Flask continua usando o backend em app.py; esta versão estática
// usa localStorage apenas para permitir a demonstração do fluxo cadastro/login.

const CHAVE_USUARIOS = 'horizonte-usuarios-v1';
const CHAVE_SESSAO = 'horizonte-sessao-v1';

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    clearTimeout(showNotification.timer);
    showNotification.timer = setTimeout(() => {
        notification.style.display = 'none';
    }, 3200);
}

function lerUsuarios() {
    try {
        const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
        return Array.isArray(usuarios) ? usuarios : [];
    } catch (_) {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function irPara(pagina) {
    window.location.href = new URL(pagina, document.baseURI).href;
}

function validarSenha() {
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword');
    if (password.length < 6) {
        showNotification('A senha precisa ter pelo menos 6 caracteres.', 'error');
        return false;
    }
    if (confirmPassword && password !== confirmPassword.value) {
        showNotification('As senhas não coincidem.', 'error');
        return false;
    }
    return true;
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validarSenha()) return;

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        if (name.length < 2 || !email.includes('@')) {
            showNotification('Informe nome e e-mail válidos.', 'error');
            return;
        }

        const usuarios = lerUsuarios();
        if (usuarios.some((usuario) => usuario.email === email)) {
            showNotification('Este e-mail já está cadastrado. Faça login.', 'error');
            return;
        }

        usuarios.push({ name, email, password });
        salvarUsuarios(usuarios);
        localStorage.setItem('horizonte-email-pendente-v1', email);
        showNotification('Cadastro realizado com sucesso! Agora faça login.');
        setTimeout(() => irPara('login.html'), 900);
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const emailPendente = localStorage.getItem('horizonte-email-pendente-v1');
    if (emailPendente) {
        const campoEmail = document.getElementById('email');
        if (campoEmail) campoEmail.value = emailPendente;
        localStorage.removeItem('horizonte-email-pendente-v1');
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const usuario = lerUsuarios().find((item) => item.email === email && item.password === password);

        if (!usuario) {
            showNotification('E-mail ou senha incorretos.', 'error');
            return;
        }

        localStorage.setItem(CHAVE_SESSAO, JSON.stringify({
            name: usuario.name,
            email: usuario.email,
            loggedAt: new Date().toISOString()
        }));
        showNotification('Login realizado com sucesso!');
        setTimeout(() => irPara('index.html'), 650);
    });
}
