// ======================================================================
// Portal Humanidades — login e cadastro (login.html e registro.html)
// Quem protege as páginas é o servidor (app.py); aqui só enviamos os
// formulários para as rotas /login e /register do Flask.
// ======================================================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    clearTimeout(showNotification.timer);
    showNotification.timer = setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Envia JSON ao servidor e devolve { ok, data } mesmo se a resposta não for JSON
async function postJSON(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    let data = {};
    try { data = await response.json(); } catch (_) { /* resposta sem JSON */ }
    return { ok: response.ok, data };
}

function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword');

    if (confirmPassword && password !== confirmPassword.value) {
        showNotification('As senhas não coincidem', 'error');
        return false;
    }
    return true;
}

// ── Cadastro ─────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validatePasswords()) return;

        try {
            const { ok, data } = await postJSON('/register', {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            });

            if (ok) {
                showNotification(data.message || 'Cadastro realizado!');
                setTimeout(() => { window.location.href = '/login.html'; }, 1500);
            } else {
                showNotification(data.error || 'Não foi possível cadastrar', 'error');
            }
        } catch (error) {
            showNotification('Erro ao conectar com o servidor', 'error');
        }
    });
}

// ── Login ────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const { ok, data } = await postJSON('/login', {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            });

            if (ok) {
                showNotification(data.message || 'Login realizado!');
                setTimeout(() => { window.location.href = '/index.html'; }, 800);
            } else {
                showNotification(data.error || 'E-mail ou senha incorretos', 'error');
            }
        } catch (error) {
            showNotification('Erro ao conectar com o servidor', 'error');
        }
    });
}
