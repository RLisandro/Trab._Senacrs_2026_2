# 📚 Portal Humanidades

> Portal educacional focado em **Ciências Humanas**, com conteúdo de História, Filosofia, Sociologia e Geografia Humana.

---

## 📋 Sobre o Projeto

O **Portal Humanidades** é um site educacional para auxiliar nos estudos de Ciências Humanas. Tem cadastro e login de usuários, linha do tempo histórica e busca de conteúdo.

O acesso ao portal exige login: quem não estiver autenticado é redirecionado para a tela de login.

---

## ✨ Funcionalidades

- 🔐 **Cadastro e Login** (Flask + SQLite, senhas com hash)
- 📖 **Conteúdos** de História, Filosofia, Sociologia e Geografia Humana
- 🕐 **Linha do Tempo** (Antiga, Medieval, Moderna, Contemporânea)
- 🔍 **Busca** em todo o conteúdo (disciplinas, tópicos, recursos e linha do tempo), com destaque, teclado (↑ ↓ Enter Esc) e busca sem acento
- 📱 **Layout responsivo**

---

## 🗂️ Estrutura de Arquivos

```
site-escolar/
│
├── app.py               # Aplicação Flask (páginas, rotas e autenticação)
├── requirements.txt     # Dependências Python
├── .env.example         # Modelo das variáveis de ambiente (copie para .env)
├── .gitignore
├── users.db             # Banco SQLite (criado automaticamente, fora do Git)
│
└── public/              # ÚNICA pasta que o navegador pode acessar
    ├── index.html       # Página principal (exige login)
    ├── login.html       # Tela de login
    ├── registro.html    # Tela de cadastro
    ├── script.js        # Interface da página principal (menu, timeline, busca...)
    ├── auth.js          # Envio dos formulários de login/cadastro ao Flask
    ├── styles.css
    └── images/
```

> O `app.py` e o `users.db` ficam **fora** de `public/` de propósito: assim não podem ser baixados pelo navegador.

---

## 🚀 Como Rodar

```bash
git clone <url-do-repositorio>
cd site-escolar

python -m venv venv
# Windows:    venv\Scripts\activate
# Linux/Mac:  source venv/bin/activate

pip install -r requirements.txt

# copie o modelo de configuração e edite a SECRET_KEY
# Windows:    copy .env.example .env
# Linux/Mac:  cp .env.example .env

python app.py
```

Acesse **http://localhost:5000** (o banco `users.db` é criado na primeira execução).

---

## 🗄️ Banco de dados (SQLite)

Cadastro e login funcionam **100% local**: os usuários ficam no arquivo `users.db` (SQLite), criado sozinho na primeira execução, ao lado do `app.py`. Nenhum serviço externo é necessário.

| Coluna | Conteúdo |
|--------|----------|
| `id` | Número do usuário |
| `name` | Nome |
| `email` | E-mail (único, guardado em minúsculas) |
| `password_hash` | Senha **criptografada** (hash do Werkzeug). A senha real nunca é gravada. |

Para ver os usuários cadastrados (com o ambiente virtual ativo):

```bash
python -c "import sqlite3; [print(r) for r in sqlite3.connect('users.db').execute('select id, name, email from user')]"
```

Também dá para abrir o `users.db` no [DB Browser for SQLite](https://sqlitebrowser.org/). Para zerar os usuários, pare o servidor e apague o `users.db`.

---

## ⚙️ Configuração (`.env`)

| Variável | Para que serve |
|----------|----------------|
| `SECRET_KEY` | Chave que assina a sessão de login. Use um valor longo e aleatório. |
| `FLASK_DEBUG` | `1` liga o modo desenvolvimento; deixe `0` (ou vazio) em produção. |

Gerar uma chave: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## 📡 Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Redireciona para `/index.html` (logado) ou `/login.html` |
| `GET` | `/index.html` | Portal (exige login) |
| `GET` | `/login.html`, `/registro.html` | Telas de acesso |
| `POST` | `/register` | Cadastra usuário (JSON: `name`, `email`, `password`) |
| `POST` | `/login` | Faz login (JSON: `email`, `password`) |
| `POST` | `/logout` | Encerra a sessão |
| `GET` | `/check-auth` | Informa se há sessão ativa e quem é o usuário |

Arquivos `.css`, `.js` e imagens são entregues somente a partir de `public/`.

---

## 📄 Licença

Projeto desenvolvido para fins educacionais.

*© 2026 Portal Humanidades.*
