// Função para mostrar notificações
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Função para verificar se as senhas coincidem
function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword.value) {
        showNotification('As senhas não coincidem', 'error');
        return false;
    }
    return true;
}

// Manipulador do formulário de registro
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validatePasswords()) {
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message);
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                showNotification(data.error, 'error');
            }
        } catch (error) {
            showNotification('Erro ao conectar com o servidor', 'error');
        }
    });
}

// Manipulador do formulário de login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message);
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                showNotification(data.error, 'error');
            }
        } catch (error) {
            showNotification('Erro ao conectar com o servidor', 'error');
        }
    });
}

// Verificar autenticação ao carregar a página
async function checkAuth() {
    try {
        const response = await fetch('/check-auth');
        const data = await response.json();

        if (!data.authenticated && !window.location.pathname.includes('/login.html') && 
            !window.location.pathname.includes('/registro.html')) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', checkAuth);
