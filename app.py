import os
import re
import secrets
from functools import wraps

from dotenv import load_dotenv
from flask import (Flask, jsonify, redirect, request, send_from_directory,
                   abort)
from flask_login import (LoginManager, UserMixin, current_user, login_required,
                         login_user, logout_user)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')  # só o que está aqui é entregue ao navegador

load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)

# A chave vem do .env. Sem ela, usa uma chave aleatória (as sessões se perdem
# ao reiniciar o servidor, o que é seguro, só incômodo em desenvolvimento).
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
login_manager = LoginManager(app)

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
MIN_PASSWORD = 6
STATIC_EXTENSIONS = {'.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'}


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    # Chamadas da API recebem JSON; navegação normal vai para a tela de login.
    if request.path in ('/logout',):
        return jsonify({'error': 'Não autenticado'}), 401
    return redirect('/login.html')


def json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


# ── Páginas ──────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return redirect('/index.html' if current_user.is_authenticated else '/login.html')


@app.route('/index.html')
@login_required
def index_page():
    return send_from_directory(PUBLIC_DIR, 'index.html')


@app.route('/login.html')
def login_page():
    if current_user.is_authenticated:
        return redirect('/index.html')
    return send_from_directory(PUBLIC_DIR, 'login.html')


@app.route('/registro.html')
def register_page():
    if current_user.is_authenticated:
        return redirect('/index.html')
    return send_from_directory(PUBLIC_DIR, 'registro.html')


@app.route('/<path:path>')
def public_file(path):
    """Entrega apenas CSS, JS e imagens de dentro de public/."""
    if os.path.splitext(path)[1].lower() not in STATIC_EXTENSIONS:
        abort(404)
    return send_from_directory(PUBLIC_DIR, path)  # bloqueia ../ automaticamente


# ── API de autenticação ──────────────────────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    data = json_body()
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))

    if not name or not email or not password:
        return jsonify({'error': 'Preencha nome, e-mail e senha'}), 400
    if len(name) > 100 or len(email) > 120:
        return jsonify({'error': 'Nome ou e-mail muito longo'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'error': 'E-mail inválido'}), 400
    if len(password) < MIN_PASSWORD:
        return jsonify({'error': f'A senha precisa ter ao menos {MIN_PASSWORD} caracteres'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'E-mail já cadastrado'}), 400

    user = User(name=name, email=email)
    user.set_password(password)
    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'E-mail já cadastrado'}), 400
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Erro ao registrar usuário'}), 500
    return jsonify({'message': 'Usuário registrado com sucesso'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = json_body()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify({'message': 'Login realizado com sucesso'})
    return jsonify({'error': 'E-mail ou senha incorretos'}), 401


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout realizado com sucesso'})


@app.route('/check-auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {'name': current_user.name, 'email': current_user.email},
        })
    return jsonify({'authenticated': False})


with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG') == '1')
