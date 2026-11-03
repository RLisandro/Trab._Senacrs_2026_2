from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'sua_chave_secreta_aqui'  # Altere para uma chave segura em produção
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Rotas para servir arquivos estáticos
@app.route('/')
def serve_login():
    return send_from_directory('.', 'login.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

# Rotas de autenticação
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400

    user = User(
        name=data['name'],
        email=data['email']
    )
    user.set_password(data['password'])

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Usuário registrado com sucesso'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro ao registrar usuário'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'message': 'Login realizado com sucesso'})
    
    return jsonify({'error': 'Email ou senha incorretos'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout realizado com sucesso'})

@app.route('/check-auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'name': current_user.name,
                'email': current_user.email
            }
        })
    return jsonify({'authenticated': False})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
