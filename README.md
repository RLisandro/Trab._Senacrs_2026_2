# 📚 Portal Humanidades

> Portal educacional focado em **Ciências Humanas**, com conteúdo de História, Filosofia, Sociologia e Geografia Humana.

---

## 📋 Sobre o Projeto

O **Portal Humanidades** é um site educacional para auxiliar nos estudos de Ciências Humanas. Tem cadastro e login de usuários, linha do tempo histórica e busca de conteúdo.

O acesso ao portal exige login: quem não estiver autenticado é redirecionado para a tela de login.

---

## ✨ Funcionalidades

- 🔐 **Cadastro e Login** (Flask + SQLite, campos obrigatórios e senhas protegidas com hash)
- 📖 **Conteúdos de leitura** específicos de História, Filosofia, Sociologia e Geografia Humana, organizados por temas
- 🕐 **Linha do Tempo** (Antiga, Medieval, Moderna, Contemporânea)
- 🔍 **Busca** em todo o conteúdo (disciplinas, tópicos, recursos e linha do tempo), com destaque, teclado (↑ ↓ Enter Esc) e busca sem acento
- 📱 **Layout responsivo**
- 📄 **Leituras ampliadas**: cada tópico abre um texto em formato A4, com fonte 12 e espaçamento entre linhas de 0,5 cm
- ⬇️ **Exportação offline**: baixe cada leitura em HTML ou use a impressão do navegador para salvar em PDF
- 🌐 **Redes sociais**: links funcionais de teste para Instagram, WhatsApp e Facebook no rodapé, abertos em nova aba com proteção `noopener noreferrer`
- ✉️ **Satisfação e sugestões**: link de e-mail para enviar opiniões e sugestões sobre o site
- ℹ️ **Sobre nós**: seção recolhida que exibe a proposta educacional do Portal Humanidades ao clicar no link

Os links sociais estão configurados para teste: Instagram e Facebook abrem suas páginas oficiais; WhatsApp abre o WhatsApp Web com a mensagem “Olá do Portal Humanidades!” pré-preenchida. Como ainda não foi informado um perfil ou número próprio, substitua os endereços em `index.html` pelos contatos oficiais do portal quando estiverem definidos. O e-mail usa `portalhumanidades@example.com` como endereço de teste.

---

## 🧰 Linguagens e tecnologias utilizadas

**Linguagens do frontend:** HTML5, CSS3 e JavaScript.  
**Linguagem do backend:** Python 3.

### Frontend — parte visual e interação com o usuário

| Tecnologia | Uso no projeto |
|------------|----------------|
| **HTML5** (linguagem de marcação) | Estrutura das páginas, formulários de login e cadastro, áreas de estudo, textos de leitura e botões de exportação. |
| **CSS3** (linguagem de estilos) | Estilos, cores, responsividade, organização visual e formatação dos textos em tamanho de página A4. |
| **JavaScript** (linguagem de programação) | Interações da página, busca de conteúdos, linha do tempo, abertura das leituras, download dos textos e comunicação com o backend. |

### Backend — processamento e segurança

| Tecnologia | Uso no projeto |
|------------|----------------|
| **Python 3** (linguagem de programação) | Linguagem principal do servidor e da lógica da aplicação. |
| **Flask** | Framework Python usado para criar as rotas, servir as páginas e controlar as requisições. |
| **Flask-Login** | Controle das sessões, login, logout e proteção da página principal. |
| **Werkzeug** | Geração e verificação segura do hash das senhas. |
| **SQLAlchemy** | Comunicação entre o Python e o banco de dados. |
| **SQLite** | Banco de dados local que armazena os usuários cadastrados. |

### Tecnologias que não foram utilizadas

Este projeto não utiliza PHP, React ou Node.js. A interface foi construída com HTML, CSS e JavaScript puro, enquanto o servidor foi desenvolvido em Python com Flask. Essa escolha mantém o projeto simples para executar localmente e facilita sua apresentação e manutenção.

## 🗣️ Como explicar o projeto ao professor

> “O frontend do site foi desenvolvido com HTML5, CSS3 e JavaScript. O HTML organiza as páginas e os formulários, o CSS define o visual responsivo e o JavaScript controla as interações, como busca, leituras e exportação dos textos. O backend foi desenvolvido em Python usando o framework Flask. Ele controla as rotas, o cadastro, o login, o logout e a proteção das páginas. Os usuários são armazenados localmente em um banco SQLite. As senhas não são salvas em texto puro: ficam protegidas por hash, aumentando a segurança do sistema.”

## 📝 Atualizações realizadas com Manus

Sempre que este projeto for atualizado com auxílio do Manus, esta seção de tecnologias, a estrutura de arquivos e as instruções de execução devem ser revisadas junto com o código. Assim, o README permanece compatível com a versão entregue e pode ser usado para explicar o projeto ao professor.

---

## 🗂️ Estrutura de Arquivos

```
Site-Escola/
├── app.py               # Aplicação Flask (páginas, rotas e autenticação)
├── requirements.txt     # Dependências Python
├── .env.example         # Modelo das variáveis de ambiente
├── .gitignore
├── users.db             # Banco SQLite (criado automaticamente)
├── index.html           # Página principal (exige login)
├── login.html           # Tela de login
├── registro.html        # Tela de cadastro
├── script.js            # Interface da página principal
├── auth.js              # Formulários de login/cadastro
├── styles.css           # Estilos do portal
└── imagem/              # Imagens utilizadas pelo site
```

> A pasta `public/` foi removida. O Flask entrega somente as páginas e os arquivos estáticos permitidos, enquanto `app.py` e `users.db` continuam protegidos fora da área pública.

---

## 🚀 Como Rodar

No PowerShell, abra o terminal na pasta raiz `Site-Escola` e execute os comandos
abaixo. Todos os comandos deste README devem ser executados a partir dessa pasta:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
.\.venv\Scripts\python.exe .\app.py
```

Na próxima vez, com o terminal ainda na raiz `Site-Escola`, inicie o app com:

```powershell
.\.venv\Scripts\python.exe .\app.py
```

Acesse **http://127.0.0.1:5000** (o banco `users.db` é criado na primeira execução).

> **Importante:** não abra `login.html` ou `registro.html` com duplo clique no explorador de arquivos (`file://`). O cadastro e o login dependem das rotas Flask e do SQLite. Inicie o servidor pelos comandos acima e acesse `http://127.0.0.1:5000`.

---

## 🗄️ Banco de dados (SQLite)

Cadastro e login funcionam **100% local**: os usuários ficam no arquivo `users.db` (SQLite), criado sozinho na primeira execução, ao lado do `app.py`. Nenhum serviço externo é necessário.

| Coluna | Conteúdo |
|--------|----------|
| `id` | Número do usuário |
| `name` | Nome |
| `email` | E-mail (único, guardado em minúsculas) |
| `password_hash` | Senha protegida por hash do Werkzeug. A senha real nunca é gravada. |

Para ver os usuários cadastrados (executando a partir da raiz `Site-Escola`):

```powershell
.\.venv\Scripts\python.exe -c "import sqlite3; [print(r) for r in sqlite3.connect('users.db').execute('select id, name, email from user')]"
```

Também dá para abrir o `users.db` no [DB Browser for SQLite](https://sqlitebrowser.org/). Para zerar os usuários, pare o servidor e apague o `users.db`.

---

## ⚙️ Configuração (`.env`)

| Variável | Para que serve |
|----------|----------------|
| `SECRET_KEY` | Chave que assina a sessão de login. Use um valor longo e aleatório. |
| `FLASK_DEBUG` | `1` liga o modo desenvolvimento; deixe `0` (ou vazio) em produção. |
| `COOKIE_SECURE` | Use `1` somente quando o site estiver em HTTPS; para uso local, deixe `0` ou vazio. |

Gerar uma chave (a partir da raiz `Site-Escola`): `.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"`

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

As páginas HTML, os arquivos `.css` e `.js` ficam na raiz do projeto. As imagens são entregues exclusivamente pela rota `/imagem/<arquivo>`; arquivos Python, banco e configurações não são expostos.

---

## 📄 Licença

Projeto desenvolvido para fins educacionais.

*© 2026 Portal Humanidades.*
