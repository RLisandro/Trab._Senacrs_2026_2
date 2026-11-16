import os
import re
import secrets
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from io import BytesIO
from datetime import timedelta
from xml.sax.saxutils import escape

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, request, send_file, send_from_directory, abort, session
from flask_login import LoginManager, UserMixin, current_user, login_required, login_user, logout_user
from flask_sqlalchemy import SQLAlchemy
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
IMAGE_DIR = os.path.join(BASE_DIR, 'imagem')
TEACHER_IMAGE_DIR = os.path.join(BASE_DIR, 'img_prof')

load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('COOKIE_SECURE') == '1'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True

db = SQLAlchemy(app)
login_manager = LoginManager(app)

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
MIN_PASSWORD = 8
MIN_NAME = 2
PAGE_FILES = {'script.js', 'auth.js', 'vlibras-init.js', 'styles.css'}
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'}
VLIBRAS_SCRIPT_TAG = '<script src="/vlibras-init.js" defer></script>'
VLIBRAS_BODY_RE = re.compile(r'</body\s*>', re.IGNORECASE)
AREAS_ATUACAO_DOCENTES = [
    'Ensino Fundamental II',
    'Ensino Médio',
    'Educação de Jovens e Adultos (EJA)',
    'Aulas particulares — Ensino Fundamental II',
    'Aulas particulares — Ensino Médio',
    'Aulas particulares — EJA'
]
NOMES_DOCENTES = [
    ('professor', 'André Luiz Ferreira'),
    ('professora', 'Ana Beatriz Monteiro'),
    ('professor', 'Bruno Henrique Carvalho'),
    ('professora', 'Bruna Carolina Tavares'),
    ('professor', 'Caio Augusto Mendes'),
    ('professora', 'Camila Rocha Esteves'),
    ('professor', 'Daniel Costa Ribeiro'),
    ('professora', 'Daniela Paiva Fernandes'),
    ('professor', 'Eduardo Matheus Barros'),
    ('professora', 'Elisa Moreira Campos'),
    ('professor', 'Felipe Azevedo Nunes'),
    ('professora', 'Fernanda Alves Nogueira'),
    ('professor', 'Gabriel Santos Freire'),
    ('professora', 'Gabriela Oliveira Reis'),
    ('professor', 'Hugo Martins Teixeira'),
    ('professora', 'Isabela Martins Soares'),
    ('professor', 'Igor Almeida Campos'),
    ('professora', 'Júlia Cardoso Lima'),
    ('professor', 'João Pedro Batista'),
    ('professora', 'Larissa Barros Freitas'),
    ('professor', 'Lucas Moreira Farias'),
    ('professora', 'Mariana Costa Leal'),
    ('professor', 'Marcelo Gonçalves Prado'),
    ('professora', 'Natália Ferreira Pires'),
    ('professor', 'Nicolas Rocha Vieira'),
    ('professora', 'Patrícia Souza Teixeira'),
    ('professor', 'Paulo César Andrade'),
    ('professora', 'Renata Ribeiro Lopes'),
    ('professor', 'Vinícius Melo Duarte'),
    ('professora', 'Sofia Almeida Duarte')
]
DISCIPLINAS_DOCENTES = ['História', 'Filosofia', 'Sociologia', 'Geografia Humana']
UNIVERSIDADES_FICTICIAS = [
    'Universidade Fictícia Educacional',
    'Faculdade Fictícia Caminhos do Saber',
    'Instituto Superior Fictício de Estudos Sociais',
    'Universidade Demonstrativa do Saber',
    'Centro Acadêmico Fictício Educacional'
]
FORMACOES_COMPLEMENTARES_DOCENTES = [
    'História do Brasil e cultura afro-brasileira',
    'História antiga e medieval',
    'Educação inclusiva e metodologias ativas',
    'Filosofia política e cidadania',
    'Ética e pensamento contemporâneo',
    'Sociologia da educação',
    'Sociologia e movimentos sociais',
    'Geografia humana e cartografia escolar',
    'Geopolítica e relações internacionais',
    'Educação de jovens e adultos (EJA)'
]
CURSOS_COMPLEMENTARES_DOCENTES = [
    'Metodologias ativas de aprendizagem',
    'Avaliação formativa e planejamento pedagógico',
    'Tecnologias digitais aplicadas à educação',
    'Educação inclusiva e acessibilidade',
    'Educação para as relações étnico-raciais',
    'Mediação de leitura e produção textual',
    'Aprendizagem baseada em projetos',
    'Práticas de ensino para EJA',
    'Direitos humanos e cidadania na escola',
    'Planejamento curricular interdisciplinar'
]
PERIODOS_CONTRATACAO = {
    'hora': ('Por hora (1 hora)', 1),
    'dia': ('Por dia (4 horas)', 4),
    'semana': ('Por semana (20 horas)', 20),
    'mes': ('Por mês (80 horas)', 80),
    'ano': ('Por ano (960 horas)', 960)
}
IMAGENS_DOCENTES_POR_GENERO = {
    'professor': [
        '/img_prof/images (3).jpg',
        '/img_prof/images (4).jpg',
        '/img_prof/images (16).jpg',
        '/img_prof/images (17).jpg',
        '/img_prof/images.jpg',
        '/img_prof/img (15).jpg',
        '/imagem/depoimentos/depoimento-01.jpg',
        '/imagem/depoimentos/depoimento-03.jpg',
        '/imagem/depoimentos/depoimento-05.jpg',
        '/imagem/depoimentos/depoimento-09.jpg',
        '/imagem/depoimentos/depoimento-10.jpg',
        '/img_prof/avatar-professor-01.png',
        '/img_prof/avatar-professor-02.png',
        '/img_prof/avatar-professor-03.png',
        '/img_prof/avatar-professor-04.png'
    ],
    'professora': [
        '/img_prof/images (10).jpg',
        '/img_prof/images (13).jpg',
        '/img_prof/images (14).jpg',
        '/img_prof/images (5).jpg',
        '/img_prof/images (6).jpg',
        '/img_prof/images (7).jpg',
        '/img_prof/images (9).jpg',
        '/img_prof/img (6).jpg',
        '/imagem/depoimentos/depoimento-02.jpg',
        '/imagem/depoimentos/depoimento-04.jpg',
        '/imagem/depoimentos/depoimento-06.jpg',
        '/imagem/depoimentos/depoimento-07.jpg',
        '/imagem/depoimentos/depoimento-08.jpg',
        '/img_prof/avatar-professora-01.png',
        '/img_prof/avatar-professora-02.png'
    ]
}
quantidade_docentes_por_genero = {
    genero: sum(1 for genero_docente, _ in NOMES_DOCENTES if genero_docente == genero)
    for genero in IMAGENS_DOCENTES_POR_GENERO
}
if any(
    len(IMAGENS_DOCENTES_POR_GENERO[genero]) != quantidade
    for genero, quantidade in quantidade_docentes_por_genero.items()
):
    raise ValueError('Cada perfil docente precisa ter um retrato correspondente ao gênero.')
imagens_docentes = [
    imagem
    for imagens in IMAGENS_DOCENTES_POR_GENERO.values()
    for imagem in imagens
]
if len(imagens_docentes) != len(set(imagens_docentes)):
    raise ValueError('Os retratos do catálogo docente não podem ser repetidos.')
imagens_docentes_ausentes = [
    imagem for imagem in imagens_docentes
    if not os.path.isfile(os.path.join(BASE_DIR, *imagem.lstrip('/').split('/')))
]
if imagens_docentes_ausentes:
    raise FileNotFoundError(
        'Retratos docentes ausentes: ' + ', '.join(imagens_docentes_ausentes)
    )
PROFESSORES_DEMONSTRATIVOS = []
indice_imagem_por_genero = {genero: 0 for genero in IMAGENS_DOCENTES_POR_GENERO}
for indice, (genero, nome) in enumerate(NOMES_DOCENTES):
    partes_nome = nome.split()
    numero = indice + 1
    imagem = IMAGENS_DOCENTES_POR_GENERO[genero][indice_imagem_por_genero[genero]]
    indice_imagem_por_genero[genero] += 1
    disciplina = DISCIPLINAS_DOCENTES[indice % len(DISCIPLINAS_DOCENTES)]
    valor_online = 40 + (indice % 6) * 5
    valor_presencial = valor_online + 20
    PROFESSORES_DEMONSTRATIVOS.append({
        'id': f'docente-{numero:02d}',
        'nome': nome,
        'genero': genero,
        'iniciais': f'{partes_nome[0][0]}{partes_nome[-1][0]}',
        'disciplina': disciplina,
        'graduacao': f'Licenciatura em {disciplina}',
        'especializacao': f'Especialização em {FORMACOES_COMPLEMENTARES_DOCENTES[indice % len(FORMACOES_COMPLEMENTARES_DOCENTES)]}',
        'formacao_complementar': CURSOS_COMPLEMENTARES_DOCENTES[indice % len(CURSOS_COMPLEMENTARES_DOCENTES)],
        'universidade': UNIVERSIDADES_FICTICIAS[indice % len(UNIVERSIDADES_FICTICIAS)],
        'area_atuacao': AREAS_ATUACAO_DOCENTES[indice % len(AREAS_ATUACAO_DOCENTES)],
        'imagem': imagem,
        'telefone': f'+55 (00) 3000-{numero:04d}',
        'email': f'docente{numero:02d}@example.test',
        'whatsapp': f'+55 (00) 90000-{numero:04d}',
        'pix': f'pix.docente{numero:02d}@example.test',
        'valor_online': valor_online,
        'valor_presencial': valor_presencial,
        'precos': {
            periodo: {
                'rotulo': rotulo,
                'horas': horas,
                'online': valor_online * horas,
                'presencial': valor_presencial * horas
            }
            for periodo, (rotulo, horas) in PERIODOS_CONTRATACAO.items()
        }
    })
MATERIAIS_PDF = {
    'roteiro-fontes': {
        'titulo': 'Roteiro de análise de fontes históricas',
        'disciplina': 'História',
        'questoes': [
            'Identifique quem produziu a fonte, quando e em qual contexto.',
            'Que informações e pontos de vista aparecem? O que pode ter ficado de fora?',
            'Compare a fonte com outro registro sobre o mesmo tema.'
        ],
        'respostas': [
            'Observe autoria, data, local e finalidade; esses elementos ajudam a situar o documento.',
            'Diferencie informação explícita de interpretação e considere os limites da fonte.',
            'Compare semelhanças e diferenças, registrando como cada fonte representa o contexto.'
        ]
    },
    'brasil-republica': {
        'titulo': 'Brasil República: conceitos e processos',
        'disciplina': 'História',
        'questoes': ['Cite dois fatores que contribuíram para a crise da Monarquia no Brasil.'],
        'respostas': [],
        'apenas_amostra': True
    },
    'iluminismo': {
        'titulo': 'Iluminismo e Filosofia Política',
        'disciplina': 'Filosofia',
        'questoes': ['Explique como o uso da razão foi valorizado por pensadores iluministas.'],
        'respostas': [],
        'apenas_amostra': True
    }
}


def _deve_injetar_vlibras(response):
    if response.status_code != 200:
        return False
    if request.method != 'GET':
        return False
    tipo = (response.mimetype or '').split(';')[0].strip().lower()
    if tipo != 'text/html':
        return False
    return True


def _injetar_vlibras_no_html(html):
    if 'vlibras-init.js' in html or 'vlibras-plugin.js' in html:
        return html
    if not VLIBRAS_BODY_RE.search(html):
        return html + '\n' + VLIBRAS_SCRIPT_TAG + '\n'
    return VLIBRAS_BODY_RE.sub(VLIBRAS_SCRIPT_TAG + '\n</body>', html, count=1)


@app.after_request
def apply_security_headers(response):
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'SAMEORIGIN')
    response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
    if request.path in {
        '/', '/index.html', '/index_alunos.html', '/index_professor.html',
        '/login.html', '/login_aluno.html', '/login_professor.html', '/registro.html',
        '/login', '/register', '/logout', '/check-auth', '/api/usuario-atual',
        '/api/professores',
        '/script.js', '/auth.js', '/vlibras-init.js', '/styles.css'
    }:
        response.headers['Cache-Control'] = 'no-store'
    return response


@app.after_request
def inject_vlibras_widget(response):
    """Garante o VLibras em qualquer página HTML servida pelo Flask."""
    if not _deve_injetar_vlibras(response):
        return response
    try:
        html = response.get_data(as_text=True)
    except (UnicodeDecodeError, RuntimeError):
        return response
    novo_html = _injetar_vlibras_no_html(html)
    if novo_html is html:
        return response
    response.set_data(novo_html)
    response.headers['Content-Length'] = str(len(response.get_data()))
    return response


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='aluno', server_default='aluno')
    gender = db.Column(db.String(20), nullable=False, default='neutro', server_default='neutro')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    if request.path in ('/logout',):
        return jsonify({'error': 'Não autenticado'}), 401
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Não autenticado'}), 401
    if request.path == '/index_professor.html':
        return redirect('/login_professor.html')
    return redirect('/login_aluno.html')


def json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


class EmailNaoConfigurado(Exception):
    pass


def enviar_email_teste(assunto, corpo, email_resposta):
    host = os.environ.get('MAILTRAP_HOST', 'sandbox.smtp.mailtrap.io').strip()
    porta = os.environ.get('MAILTRAP_PORT', '2525').strip()
    usuario = os.environ.get('MAILTRAP_USERNAME', '').strip()
    senha = os.environ.get('MAILTRAP_PASSWORD', '')
    remetente = os.environ.get('MAILTRAP_FROM_EMAIL', '').strip()
    destinatario = os.environ.get('MAILTRAP_TO_EMAIL', '').strip()
    nome_remetente = os.environ.get('MAILTRAP_FROM_NAME', 'Horizonte Educacional').strip()

    if not all((host, usuario, senha, remetente, destinatario)):
        raise EmailNaoConfigurado
    try:
        porta = int(porta)
    except ValueError as erro:
        raise EmailNaoConfigurado from erro

    mensagem = EmailMessage()
    mensagem['Subject'] = assunto
    mensagem['From'] = formataddr((nome_remetente, remetente))
    mensagem['To'] = destinatario
    mensagem['Reply-To'] = email_resposta
    mensagem.set_content(corpo)

    contexto_tls = ssl.create_default_context()
    with smtplib.SMTP(host, porta, timeout=10) as servidor:
        servidor.ehlo()
        servidor.starttls(context=contexto_tls)
        servidor.ehlo()
        servidor.login(usuario, senha)
        recusados = servidor.send_message(mensagem)
        if recusados:
            raise smtplib.SMTPRecipientsRefused(recusados)


def resposta_email_enviado(assunto, corpo, email_resposta):
    try:
        enviar_email_teste(assunto, corpo, email_resposta)
    except EmailNaoConfigurado:
        return jsonify({
            'error': 'E-mail de teste não configurado. Preencha as variáveis MAILTRAP_* no arquivo .env.'
        }), 503
    except (OSError, smtplib.SMTPException):
        app.logger.exception('Falha ao enviar mensagem para o Mailtrap Sandbox')
        return jsonify({'error': 'Não foi possível enviar a mensagem de teste. Verifique a configuração do Mailtrap.'}), 502
    return jsonify({'message': 'Mensagem enviada para a caixa de testes do Mailtrap.'}), 200


def caminho_index(perfil):
    return '/index_professor.html' if perfil == 'professor' else '/index_alunos.html'


def caminho_login(perfil):
    return '/login_professor.html' if perfil == 'professor' else '/login_aluno.html'


@app.route('/')
def home():
    if current_user.is_authenticated:
        return redirect(caminho_index(current_user.role))
    return redirect('/login_aluno.html')

@app.route('/index.html')
@login_required
def index_page():
    return redirect(caminho_index(current_user.role))


@app.route('/index_alunos.html')
@login_required
def index_alunos_page():
    if current_user.role != 'aluno':
        return redirect('/index_professor.html')
    return send_from_directory(BASE_DIR, 'index_alunos.html')


@app.route('/index_professor.html')
@login_required
def index_professor_page():
    if current_user.role != 'professor':
        return redirect('/index_alunos.html')
    return send_from_directory(BASE_DIR, 'index_professor.html')

@app.route('/login.html')
def login_page():
    if current_user.is_authenticated:
        return redirect(caminho_index(current_user.role))
    return redirect('/login_aluno.html')


@app.route('/login_aluno.html')
def login_aluno_page():
    if current_user.is_authenticated:
        return redirect(caminho_index(current_user.role))
    return send_from_directory(BASE_DIR, 'login_aluno.html')


@app.route('/login_professor.html')
def login_professor_page():
    if current_user.is_authenticated:
        return redirect(caminho_index(current_user.role))
    return send_from_directory(BASE_DIR, 'login_professor.html')

@app.route('/registro.html')
def register_page():
    if current_user.is_authenticated:
        return redirect(caminho_index(current_user.role))
    return send_from_directory(BASE_DIR, 'registro.html')


@app.route('/imagem/<path:filename>')
def image_file(filename):
    if os.path.splitext(filename)[1].lower() not in IMAGE_EXTENSIONS:
        abort(404)
    return send_from_directory(IMAGE_DIR, filename)


@app.route('/img_prof/<path:filename>')
def teacher_image_file(filename):
    if os.path.splitext(filename)[1].lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        abort(404)
    return send_from_directory(TEACHER_IMAGE_DIR, filename)


@app.route('/materiais/<string:chave>.pdf')
def baixar_material_pdf(chave):
    material = MATERIAIS_PDF.get(chave)
    if material is None:
        abort(404)

    buffer = BytesIO()
    estilos = getSampleStyleSheet()
    estilos.add(ParagraphStyle(
        name='PortalTitulo',
        parent=estilos['Title'],
        textColor=colors.HexColor('#1e5d63'),
        alignment=0,
        spaceAfter=12
    ))
    estilos.add(ParagraphStyle(
        name='PortalSecao',
        parent=estilos['Heading2'],
        textColor=colors.HexColor('#1e5d63'),
        spaceBefore=12,
        spaceAfter=6
    ))

    documento = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title=material['titulo'],
        author='Horizonte Educacional'
    )
    aviso = (
        'Amostra demonstrativa. O material completo e o gabarito comentado não estão disponíveis nesta demonstração.'
        if material.get('apenas_amostra')
        else 'Material demonstrativo do Horizonte Educacional.'
    )
    conteudo = [
        Paragraph(f"Horizonte Educacional · {escape(material['disciplina'])}", estilos['Normal']),
        Spacer(1, 8 * mm),
        Paragraph(escape(material['titulo']), estilos['PortalTitulo']),
        Paragraph(escape(aviso), estilos['BodyText']),
        Paragraph('Questões', estilos['PortalSecao']),
        ListFlowable(
            [ListItem(Paragraph(escape(item), estilos['BodyText'])) for item in material['questoes']],
            bulletType='1',
            leftIndent=18
        )
    ]
    if material['respostas']:
        conteudo.extend([
            Paragraph('Gabarito comentado', estilos['PortalSecao']),
            ListFlowable(
                [ListItem(Paragraph(escape(item), estilos['BodyText'])) for item in material['respostas']],
                bulletType='1',
                leftIndent=18
            )
        ])

    documento.build(conteudo)
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'{chave}-horizonte-educacional.pdf'
    )


@app.route('/<path:path>')
def root_asset(path):
    if path not in PAGE_FILES:
        abort(404)
    return send_from_directory(BASE_DIR, path)


@app.route('/register', methods=['POST'])
def register():
    data = json_body()
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    confirm_password = str(data.get('confirmPassword', ''))
    role = str(data.get('role', 'aluno')).strip().lower()
    gender = str(data.get('gender') or 'neutro').strip().lower()
    if not name or not email or not password:
        return jsonify({'error': 'Preencha nome, e-mail e senha'}), 400
    if len(name) < MIN_NAME:
        return jsonify({'error': 'Informe seu nome completo'}), 400
    if len(name) > 100 or len(email) > 120:
        return jsonify({'error': 'Nome ou e-mail muito longo'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'error': 'E-mail inválido'}), 400
    if len(password) < MIN_PASSWORD:
        return jsonify({'error': f'A senha precisa ter ao menos {MIN_PASSWORD} caracteres'}), 400
    if password != confirm_password:
        return jsonify({'error': 'As senhas não coincidem'}), 400
    if role not in {'aluno', 'professor'}:
        return jsonify({'error': 'Selecione um perfil válido'}), 400
    if gender not in {'feminino', 'masculino', 'neutro'}:
        return jsonify({'error': 'Selecione uma forma de tratamento válida'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'E-mail já cadastrado'}), 400
    user = User(name=name, email=email, role=role, gender=gender)
    user.set_password(password)
    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'E-mail já cadastrado'}), 400
    except Exception:
        db.session.rollback()
        app.logger.exception('Falha ao cadastrar usuário no SQLite')
        return jsonify({'error': 'Não foi possível salvar o cadastro no SQLite. Verifique se o servidor tem permissão para criar ou alterar users.db.'}), 500
    session.clear()
    session.permanent = True
    login_user(user, remember=False, fresh=True)
    session['mostrar_boas_vindas'] = True
    session['tipo_boas_vindas'] = 'cadastro'
    return jsonify({
        'message': 'Cadastro realizado com sucesso',
        'role': user.role,
        'redirect': caminho_index(user.role)
    }), 201


def texto_email(data, campo, limite, obrigatorio=True):
    valor = data.get(campo, '')
    if not isinstance(valor, str):
        return None
    valor = valor.strip()
    if len(valor) > limite or (obrigatorio and not valor):
        return None
    return valor


@app.route('/api/emails/proposta', methods=['POST'])
@login_required
def enviar_proposta_email():
    data = json_body()
    instituicao = texto_email(data, 'instituicao', 120)
    responsavel = texto_email(data, 'responsavel', 100)
    email = texto_email(data, 'email', 120)
    publico = texto_email(data, 'publico', 100)
    periodo = texto_email(data, 'periodo', 80)
    observacoes = texto_email(data, 'observacoes', 1500, obrigatorio=False)
    quantidade = data.get('estudantes')

    if any(valor is None for valor in (
        instituicao, responsavel, email, publico, periodo, observacoes
    )):
        return jsonify({'error': 'Confira os campos da solicitação e tente novamente.'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Informe um e-mail de contato válido.'}), 400
    if isinstance(quantidade, bool) or not isinstance(quantidade, (str, int)):
        return jsonify({'error': 'Informe uma quantidade válida de estudantes.'}), 400
    quantidade = str(quantidade).strip()
    if not quantidade.isdecimal() or not 1 <= int(quantidade) <= 100000:
        return jsonify({'error': 'Informe uma quantidade entre 1 e 100000 estudantes.'}), 400

    corpo = '\n'.join([
        'Solicitação de proposta educacional',
        '',
        f'Escola, instituição ou estudante: {instituicao}',
        f'Responsável: {responsavel}',
        f'E-mail para contato: {email}',
        f'Público atendido ou modalidade: {publico}',
        f'Número aproximado de estudantes: {quantidade}',
        f'Período solicitado: {periodo}',
        f'Observações: {observacoes or "Não informado"}'
    ])
    return resposta_email_enviado(
        'Solicitação de proposta — Horizonte Educacional',
        corpo,
        email
    )


@app.route('/api/emails/sugestoes', methods=['POST'])
@login_required
def enviar_sugestao_email():
    data = json_body()
    nome = texto_email(data, 'name', 100)
    email = texto_email(data, 'email', 120)
    sugestao = texto_email(data, 'message', 2000)

    if any(valor is None for valor in (nome, email, sugestao)):
        return jsonify({'error': 'Preencha seu nome, e-mail e sugestão (até 2000 caracteres).'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Informe um e-mail de contato válido.'}), 400

    corpo = '\n'.join([
        'Sugestão enviada pelo Horizonte Educacional',
        '',
        f'Nome: {nome}',
        f'E-mail para contato: {email}',
        '',
        'Sugestão:',
        sugestao
    ])
    return resposta_email_enviado(
        'Sugestão — Horizonte Educacional',
        corpo,
        email
    )


@app.route('/api/professores')
@login_required
def listar_professores_demonstrativos():
    if current_user.role != 'aluno':
        return jsonify({'error': 'O catálogo de contratação está disponível na área do aluno.'}), 403
    return jsonify({'professores': PROFESSORES_DEMONSTRATIVOS})


@app.route('/api/emails/contrato-docente', methods=['POST'])
@login_required
def enviar_solicitacao_contratacao_docente():
    if current_user.role != 'aluno':
        return jsonify({'error': 'Somente alunos podem solicitar aulas pelo catálogo.'}), 403

    data = json_body()
    professor_id = texto_email(data, 'professor_id', 20)
    modalidade = texto_email(data, 'modalidade', 20)
    periodo = texto_email(data, 'periodo', 20)
    if (
        not professor_id
        or modalidade not in {'online', 'presencial'}
        or periodo not in PERIODOS_CONTRATACAO
    ):
        return jsonify({'error': 'Selecione um professor, uma modalidade e um período válidos.'}), 400

    professor = next(
        (item for item in PROFESSORES_DEMONSTRATIVOS if item['id'] == professor_id),
        None
    )
    if professor is None:
        return jsonify({'error': 'O perfil docente selecionado não foi encontrado.'}), 404

    valor = professor['precos'][periodo][modalidade]
    rotulo_periodo, horas = PERIODOS_CONTRATACAO[periodo]
    valor_formatado = f'R$ {valor:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    corpo = '\n'.join([
        'Solicitação demonstrativa de contratação de docente',
        '',
        f'Aluno: {current_user.name}',
        f'E-mail do aluno: {current_user.email}',
        f'Docente: {professor["nome"]}',
        f'Disciplina: {professor["disciplina"]}',
        f'Área de atuação: {professor["area_atuacao"]}',
        f'Modalidade: {modalidade}',
        f'Período: {rotulo_periodo}',
        f'Carga horária estimada: {horas} hora(s)',
        f'Valor demonstrativo: {valor_formatado}',
        '',
        'Esta solicitação é apenas uma demonstração. Não constitui contrato nem gera cobrança.'
    ])
    return resposta_email_enviado(
        'Solicitação de aula — Horizonte Educacional',
        corpo,
        current_user.email
    )


@app.route('/login', methods=['POST'])
def login():
    data = json_body()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    role = str(data.get('role', 'aluno')).strip().lower()
    if role not in {'aluno', 'professor'}:
        return jsonify({'error': 'Selecione um perfil válido'}), 400
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        if user.role != role:
            if user.role == 'aluno':
                return jsonify({
                    'error': "Esta conta está registrada como Aluno. Entre pela página de acesso do Aluno."
                }), 403
            return jsonify({
                'error': "Esta conta pertence a um Professor. Entre pela página de acesso do Professor."
            }), 403
        session.clear()
        session.permanent = True
        login_user(user, remember=False, fresh=True)
        session['mostrar_boas_vindas'] = True
        session['tipo_boas_vindas'] = 'login'
        return jsonify({
            'message': 'Login realizado com sucesso',
            'role': user.role,
            'redirect': caminho_index(user.role)
        })
    return jsonify({'error': 'E-mail ou senha incorretos'}), 401


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    perfil = current_user.role
    logout_user()
    session.clear()
    return jsonify({
        'message': 'Logout realizado com sucesso',
        'redirect': caminho_login(perfil)
    })


@app.route('/check-auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({'authenticated': True, 'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'role': current_user.role
        }})
    return jsonify({'authenticated': False})


@app.route('/api/usuario-atual')
@login_required
def usuario_atual():
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'role': current_user.role,
        'gender': current_user.gender,
        'mostrarBoasVindas': session.pop('mostrar_boas_vindas', False),
        'tipoBoasVindas': session.pop('tipo_boas_vindas', None)
    })


with app.app_context():
    db.create_all()
    colunas_usuario = {coluna['name'] for coluna in inspect(db.engine).get_columns('user')}
    if 'role' not in colunas_usuario:
        db.session.execute(text("ALTER TABLE user ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'aluno'"))
        db.session.commit()
    if 'gender' not in colunas_usuario:
        db.session.execute(text("ALTER TABLE user ADD COLUMN gender VARCHAR(20) NOT NULL DEFAULT 'neutro'"))
        db.session.commit()
    if db.session.query(User.id).first() is None:
        professor = User(name='Professor de Exemplo', email='prof@horizonteeducacional.edu.br', role='professor')
        professor.set_password('Prof@1234')
        db.session.add(professor)
        db.session.commit()


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=os.environ.get('FLASK_DEBUG') == '1')
