# 📚 Portal Humanidades

> Portal educacional focado em **Ciências Humanas**, oferecendo conteúdo em História, Filosofia, Sociologia e Geografia.

---

## 📋 Sobre o Projeto

O **Portal Humanidades** é um site educacional desenvolvido para auxiliar estudantes nos estudos de Ciências Humanas. A plataforma conta com sistema de autenticação de usuários, materiais didáticos, linha do tempo histórica, quiz interativo e muito mais.

---

## ✨ Funcionalidades

- 🔐 **Cadastro e Login** de usuários
- 📖 **Conteúdos** de História, Filosofia, Sociologia e Geografia Humana
- 🕐 **Linha do Tempo Histórica** interativa (Antiga, Medieval, Moderna, Contemporânea)
- 🎯 **Quiz** de Humanidades
- 📥 **Materiais para Download** (PDFs, vídeos, apresentações)
- 🔍 **Busca** de conteúdo no portal
- 📱 **Layout responsivo** (funciona em celular e computador)

---

## 🗂️ Estrutura de Arquivos

```
Site_Escolar/
│
├── images/              # Imagens do site (logotipo, etc.)
├── app.py               # Aplicação principal Flask (rotas e autenticação)
├── server.py            # Servidor HTTP simples para desenvolvimento
├── auth.js              # Lógica de autenticação no navegador
├── index.html           # Página principal do portal
├── login.html           # Página de login
├── registro.html        # Página de cadastro de novos usuários
├── script.js            # Scripts de interatividade (quiz, timeline, busca)
├── styles.css           # Estilização visual do site
└── requirements.txt     # Dependências Python do projeto
```

---

## 🛠️ Tecnologias Utilizadas

**Frontend (Interface):**
- HTML5
- CSS3
- JavaScript

**Backend (Servidor):**
- Python 3
- Flask
- Flask-SQLAlchemy
- Flask-Login
- Werkzeug

**Banco de Dados:**
- SQLite (arquivo `users.db` gerado automaticamente)

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Python 3](https://www.python.org/downloads/) instalado na sua máquina

### Passo a passo

**1. Clone ou baixe o projeto**
```bash
git clone <url-do-repositorio>
cd Site_Escolar
```

**2. Crie um ambiente virtual (recomendado)**
```bash
python -m venv venv
```

Ative o ambiente virtual:
- **Windows:** `venv\Scripts\activate`
- **Linux/Mac:** `source venv/bin/activate`

**3. Instale as dependências**
```bash
pip install -r requirements.txt
```

**4. Inicie o servidor**
```bash
python app.py
```

**5. Acesse no navegador**
```
http://localhost:5000
```

> O banco de dados (`users.db`) será criado automaticamente na primeira execução.

---

## ⚙️ Configuração

Antes de colocar o site em produção, altere a `SECRET_KEY` no arquivo [`app.py`](app.py):

```python
# Linha 8 do app.py - Substitua por uma chave segura e aleatória
app.config['SECRET_KEY'] = 'sua_chave_secreta_aqui'
```

---

## 📡 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Página de login |
| `POST` | `/register` | Cadastrar novo usuário |
| `POST` | `/login` | Realizar login |
| `GET` | `/logout` | Realizar logout |
| `GET` | `/check-auth` | Verificar se está autenticado |

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

---

*© 2024 Portal Humanidades. Todos os direitos reservados.*

