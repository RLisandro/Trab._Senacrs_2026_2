# 📚 Horizonte Educacional

> Portal educacional com conteúdo de História, Filosofia, Sociologia e Geografia Humana.

---

## 📋 Sobre o Projeto

O **Horizonte Educacional** é um site educacional para auxiliar estudantes do Ensino Fundamental II, Ensino Médio e EJA nos estudos de História, Filosofia, Sociologia e Geografia Humana, além de apoiar aulas particulares. Tem cadastro e login de usuários, linha do tempo histórica e busca de conteúdo.

O acesso ao portal exige login: quem não estiver autenticado é redirecionado para a tela de login.

---

## ✨ Funcionalidades

- 🔐 **Cadastro e Login** (Flask + SQLite, campos obrigatórios e senhas protegidas com hash)
- 👋 **Saudação personalizada** conforme perfil e forma de tratamento, exibida por 2 segundos em cada login, inclusive em acessos repetidos
- 🎓 **Vitrine docente demonstrativa** com perfis, formação, retratos ilustrativos e fichas de trajetória e premiações fictícias
- 🧑‍🏫 **Área do professor** com materiais, planos, comunidade e parcerias; o atalho para o painel aparece somente na página dos docentes
- 🧑‍🏫 **Catálogo de aulas particulares** em carrossel com miniaturas, com 30 perfis docentes fictícios, retratos únicos em `img_prof` associados ao gênero de cada nome, graduação, especialização, formação complementar, contatos, chave Pix e valores por hora, dia, semana, mês e ano; solicitações vão para o Mailtrap Sandbox
- 📖 **Conteúdos de leitura** específicos de História, Filosofia, Sociologia e Geografia Humana, organizados por temas
- 🕐 **Linha do Tempo** (Antiga, Medieval, Moderna, Contemporânea)
- 🔍 **Busca** em todo o conteúdo (disciplinas, tópicos, recursos e linha do tempo), com destaque, teclado (↑ ↓ Enter Esc) e busca sem acento
- 📱 **Layout responsivo**
- 📄 **Leituras ampliadas**: cada tópico abre um texto em formato A4, com fonte 12 e espaçamento entre linhas de 0,5 cm
- ⬇️ **Exportação offline**: baixe cada leitura em HTML ou use a impressão do navegador para salvar em PDF
- 🌐 **Redes sociais**: links funcionais de teste para Instagram, WhatsApp e Facebook no rodapé, abertos em nova aba com proteção `noopener noreferrer`
- ✉️ **Satisfação e sugestões**: formulário de sugestões enviado ao Mailtrap Sandbox para testes com dados fictícios
- ℹ️ **Sobre nós**: seção recolhida que exibe a proposta educacional do Horizonte Educacional ao clicar no link
- 🤟 **VLibras (Governo Federal)**: widget gratuito de tradução automática do português para a Libras em **todo o projeto**. O botão fica flutuante e discreto no canto inferior direito, sem interferir no layout; o Flask injeta `vlibras-init.js` em qualquer HTML servido

Os links sociais estão configurados para teste: Instagram e Facebook abrem suas páginas oficiais; WhatsApp abre o WhatsApp Web com a mensagem “Olá do Horizonte Educacional!” pré-preenchida. Como ainda não foi informado um perfil ou número próprio, substitua os endereços em `index_alunos.html` e `index_professor.html` pelos contatos oficiais do portal quando estiverem definidos. Os formulários de proposta e sugestões enviam mensagens para o Mailtrap Sandbox quando ele estiver configurado.

O catálogo de aulas particulares exibe 30 perfis, divididos igualmente entre professores e professoras, com um retrato distinto para cada perfil e associado ao gênero do nome. Nomes, universidades, telefones, e-mails, WhatsApp e chaves Pix são exemplos fictícios; os retratos são ilustrativos. Dez retratos também aparecem nos depoimentos e são servidos diretamente de `imagem/depoimentos`; seis ilustrações originais completam a seleção. Os créditos das fotos estão em `imagem/depoimentos/creditos.md`. As tarifas demonstrativas variam por perfil e modalidade. Os totais diário, semanal, mensal e anual consideram, respectivamente, 4, 20, 80 e 960 horas. A solicitação não constitui contrato nem processa pagamentos.

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
| **VLibras Widget** (Governo Federal) | Tradução automática de textos da página para a Libras, com avatar 3D, para apoiar pessoas surdas. |

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

## 🏷️ Convenção de nomenclatura (IDs e Classes)

Todos os IDs, classes e variáveis CSS do projeto são escritos em **português brasileiro**, de forma intuitiva. Exemplos:

| O que é | Nome usado |
|---|---|
| Cabeçalho fixo | `#cabecalho` |
| Campo de busca | `#campoBusca` |
| Painel de resultados | `.lista-resultados-busca` |
| Botão de sair | `#botaoSair` / `.btn-sair` |
| Cartão de disciplina | `.cartao`, `.cartao-corpo`, `.cartao-btn` |
| Linha do tempo | `#listaLinhaDoTempo`, `.evento-linha-tempo` |
| Folha de leitura A4 | `.pagina-leitura` |
| Variável de cor principal | `--cor-primaria` |
| Variável de sombra | `--sombra-media` |

O arquivo `mapa-de-nomes.md` (na pasta de anotações do agente) lista todos os IDs e classes com suas correspondências HTML ↔ CSS ↔ JS.

---



---

## 🗂️ Estrutura de Arquivos

```
Site-Escola/
├── app.py               # Aplicação Flask (páginas, rotas e autenticação)
├── requirements.txt     # Dependências Python
├── .env.example         # Modelo das variáveis de ambiente
├── .gitignore
├── users.db             # Banco SQLite (criado automaticamente)
├── index_alunos.html    # Entrada da página inicial do aluno
├── index_professor.html # Entrada da página inicial do professor
├── login_aluno.html     # Entrada da tela de login do aluno
├── login_professor.html # Entrada da tela de login do professor
├── registro.html        # Tela de cadastro
├── script.js            # Interações compartilhadas das páginas iniciais
├── auth.js              # Autenticação compartilhada
├── styles.css           # Estilos do portal
├── img_prof/            # Fotos ilustrativas dos perfis docentes
└── imagem/              # Imagens utilizadas pelo site
```

As páginas de login e início de cada perfil são arquivos HTML completos e independentes. CSS e JavaScript permanecem compartilhados. As rotas antigas `/login.html` e `/index.html` continuam como compatibilidade e encaminham para a página apropriada. Abra as páginas pelo Flask, não diretamente pelo explorador de arquivos.

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

Depois de alterar arquivos Python, pare o servidor anterior com `Ctrl+C` no terminal em que ele está rodando e inicie-o novamente para carregar as mudanças.

Acesse **http://127.0.0.1:5000** (o banco `users.db` é criado na primeira execução).

> **Importante:** não abra as páginas com duplo clique no explorador de arquivos (`file://`). O cadastro e o login dependem das rotas Flask e do SQLite. Inicie o servidor pelos comandos acima e acesse `http://127.0.0.1:5000`.

---

## 🗄️ Banco de dados (SQLite)

Cadastro e login funcionam **100% local**: os usuários ficam no arquivo `users.db` (SQLite), criado sozinho na primeira execução, ao lado do `app.py`. Nenhum serviço externo é necessário.

| Coluna | Conteúdo |
|--------|----------|
| `id` | Número do usuário |
| `name` | Nome |
| `email` | E-mail (único, guardado em minúsculas) |
| `password_hash` | Senha protegida por hash do Werkzeug. A senha real nunca é gravada. |
| `role` | Perfil de acesso: `aluno` ou `professor` (o padrão é `aluno`). |
| `gender` | Forma de tratamento: `feminino`, `masculino` ou `neutro` (padrão para contas existentes e novos cadastros). |

Ao iniciar pela primeira vez com o banco vazio, é criada uma conta docente demonstrativa: `prof@horizonteeducacional.edu.br` / `Prof@1234`. A migração de bancos existentes adiciona o perfil `aluno` e a forma neutra de tratamento sem remover os usuários cadastrados.

Para ver os usuários cadastrados (executando a partir da raiz `Site-Escola`):

```powershell
.\.venv\Scripts\python.exe -c "import sqlite3; [print(r) for r in sqlite3.connect('users.db').execute('select id, name, email from user')]"
```

Também dá para abrir o `users.db` no [DB Browser for SQLite](https://sqlitebrowser.org/).

### Zerar o banco de dados

Para apagar todos os usuários e recriar o banco do zero, pare o servidor Flask (`Ctrl+C` no terminal em que ele está rodando) e execute estes comandos no PowerShell, a partir da raiz `Site-Escola`:

```powershell
Copy-Item .\users.db ".\users-backup-$(Get-Date -Format yyyyMMdd-HHmmss).db"
Remove-Item .\users.db
```

Inicie o servidor novamente com `.\.venv\Scripts\python.exe .\app.py`. O arquivo e a tabela serão recriados automaticamente. Como o banco estará vazio, o sistema também criará a conta docente demonstrativa indicada acima.

---

## ⚙️ Configuração (`.env`)

| Variável | Para que serve |
|----------|----------------|
| `SECRET_KEY` | Chave que assina a sessão de login. Use um valor longo e aleatório. |
| `FLASK_DEBUG` | `1` liga o modo desenvolvimento; deixe `0` (ou vazio) em produção. |
| `COOKIE_SECURE` | Use `1` somente quando o site estiver em HTTPS; para uso local, deixe `0` ou vazio. |
| `MAILTRAP_HOST`, `MAILTRAP_PORT` | Host SMTP e porta da caixa Sandbox do Mailtrap (`sandbox.smtp.mailtrap.io` e `2525`). |
| `MAILTRAP_USERNAME`, `MAILTRAP_PASSWORD` | Credenciais SMTP da caixa Sandbox; não compartilhe nem publique esses valores. |
| `MAILTRAP_FROM_EMAIL`, `MAILTRAP_FROM_NAME` | Remetente fictício exibido nos e-mails de teste. |
| `MAILTRAP_TO_EMAIL` | Destinatário fictício usado pela Sandbox; as mensagens ficam na caixa de entrada de teste. |

Gerar uma chave (a partir da raiz `Site-Escola`): `.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"`

### Configurar e testar e-mails pelo Mailtrap

1. Crie uma conta no Mailtrap e abra **Email Testing > Inboxes**.
2. Selecione uma caixa e copie o host, a porta, o usuário e a senha exibidos em **SMTP Settings**.
3. Copie `.env.example` para `.env` e preencha `MAILTRAP_USERNAME` e `MAILTRAP_PASSWORD` com as credenciais dessa caixa. O `.env` é ignorado pelo Git; mantenha as credenciais somente nele.
4. Inicie o Flask e envie uma solicitação de proposta ou sugestão. Para testar, use nomes e endereços fictícios como `Ana Teste` e `ana.teste@example.com`.
5. Abra a caixa Sandbox no Mailtrap para conferir o conteúdo capturado. A Sandbox não entrega as mensagens aos destinatários fictícios.

Se as variáveis SMTP obrigatórias não estiverem preenchidas, o formulário informará que o envio não está configurado. As mensagens de proposta e sugestão usam o e-mail informado apenas como endereço de resposta; o destino é `MAILTRAP_TO_EMAIL`.

---

## 📡 Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Abre a página inicial ou o login do perfil correspondente |
| `GET` | `/index_alunos.html`, `/index_professor.html` | Páginas iniciais protegidas e separadas por perfil |
| `GET` | `/login_aluno.html`, `/login_professor.html` | Telas de login separadas por perfil |
| `GET` | `/index.html`, `/login.html` | Rotas de compatibilidade para os endereços separados por perfil |
| `GET` | `/registro.html` | Tela de cadastro com seleção de perfil |
| `POST` | `/register` | Cadastra aluno ou professor (JSON: `name`, `email`, `password`, `confirmPassword`, `role`, `gender`). A forma de tratamento pode ser `feminino`, `masculino` ou `neutro`. Não é exigido código institucional. O cadastro autentica a conta automaticamente. |
| `POST` | `/api/emails/proposta` | Envia os dados do formulário de proposta à caixa Sandbox do Mailtrap (JSON: `instituicao`, `responsavel`, `email`, `publico`, `estudantes`, `periodo`, `observacoes`). |
| `POST` | `/api/emails/sugestoes` | Envia uma sugestão à caixa Sandbox do Mailtrap (JSON: `name`, `email`, `message`). |
| `GET` | `/api/professores` | Lista os 30 perfis docentes demonstrativos para contas de aluno. |
| `POST` | `/api/emails/contrato-docente` | Envia uma solicitação demonstrativa de aula ao Mailtrap (JSON: `professor_id`, `modalidade`). |
| `POST` | `/login` | Faz login (JSON: `email`, `password`, `role`) com validação cruzada do perfil |
| `POST` | `/logout` | Encerra a sessão |
| `GET` | `/check-auth` | Informa se há sessão ativa e quem é o usuário |
| `GET` | `/api/usuario-atual` | Retorna os dados do usuário autenticado, incluindo perfil, forma de tratamento e o aviso de login/cadastro pendente uma única vez |

As páginas HTML, os arquivos `.css` e `.js` ficam na raiz do projeto. As imagens são entregues exclusivamente pela rota `/imagem/<arquivo>`; arquivos Python, banco e configurações não são expostos.

---

## 📄 Licença

Projeto desenvolvido para fins educacionais.

*© 2026 Horizonte Educacional.*
