import os
from datetime import date
from urllib.parse import urlparse

from flask import Flask, flash, redirect, render_template, request, url_for
from flask_login import LoginManager, UserMixin, current_user, login_required, login_user, logout_user
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'CAMBIAR-ESTA-CLAVE-ANTES-DE-USAR-EN-INTERNET')
database_url = os.environ.get('DATABASE_URL', 'sqlite:///mi_salud_integral.db')
if database_url.startswith('mysql://'):
    database_url = database_url.replace('mysql://', 'mysql+pymysql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('COOKIE_SECURE', '0') == '1'

# En producción, usar HTTPS y COOKIE_SECURE=1.
db = SQLAlchemy(app)
csrf = CSRFProtect(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Iniciá sesión para continuar.'
login_manager.login_message_category = 'info'



class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    profile = db.relationship(
        'HealthProfile',
        backref='user',
        uselist=False,
        cascade='all, delete-orphan'
    )

    daily_logs = db.relationship(
        'DailyLog',
        backref='user',
        cascade='all, delete-orphan'
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(
            self.password_hash, password
        )


class FoodItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    daily_log_id = db.Column(
        db.Integer,
        db.ForeignKey('daily_log.id'),
        nullable=False,
        index=True
    )

    meal_type = db.Column(db.String(20), nullable=False)
    food_name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(30), nullable=False)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )


class HealthProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False, index=True)
    birth_date = db.Column(db.Date, nullable=True)
    health_goals = db.Column(db.Text, nullable=True)
    diagnosed_conditions = db.Column(db.Text, nullable=True)
    symptoms = db.Column(db.Text, nullable=True)
    medications = db.Column(db.Text, nullable=True)
    allergies = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())


class DailyLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    log_date = db.Column(db.Date, nullable=False, default=date.today)
    meals = db.Column(db.Text, nullable=True)
    breakfast = db.Column(db.Text, nullable=True)
    lunch = db.Column(db.Text, nullable=True)
    snack = db.Column(db.Text, nullable=True)
    dinner = db.Column(db.Text, nullable=True)
    snacks = db.Column(db.Text, nullable=True)
    water_liters = db.Column(db.Numeric(4, 2), nullable=True)
    activity = db.Column(db.Text, nullable=True)
    sleep_hours = db.Column(db.Numeric(4, 2), nullable=True)
    mood = db.Column(db.String(40), nullable=True)
    symptoms = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/registro', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        if not name or not email or len(password) < 10:
            flash('Completá todos los campos. La contraseña debe tener al menos 10 caracteres.', 'error')
        elif User.query.filter_by(email=email).first():
            flash('Ese correo ya tiene una cuenta. Iniciá sesión.', 'error')
        else:
            user = User(name=name, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.flush()
            db.session.add(HealthProfile(user_id=user.id))
            db.session.commit()
            login_user(user)
            flash('Tu cuenta fue creada. Completá tu perfil de salud.', 'success')
            return redirect(url_for('profile'))
    return render_template('register.html')


@app.route('/ingresar', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Correo o contraseña incorrectos.', 'error')
    return render_template('login.html')


@app.route('/salir', methods=['POST'])
@login_required
def logout():
    logout_user()
    flash('Cerraste la sesión.', 'success')
    return redirect(url_for('login'))


@app.route('/inicio')
@login_required
def dashboard():
    recent_logs = (
        DailyLog.query
        .filter_by(user_id=current_user.id)
        .order_by(
            DailyLog.log_date.desc(),
            DailyLog.id.desc()
        )
        .limit(7)
        .all()
    )

    for registro in recent_logs:
        registro.alimentos = FoodItem.query.filter_by(
            daily_log_id=registro.id
        ).order_by(FoodItem.id).all()
        print("VERIFICACION DASHBOARD", [(r.id, len(r.alimentos)) for r in recent_logs], flush=True)
    return render_template(
        'dashboard.html',
        recent_logs=recent_logs
    )

@app.route('/mi-perfil', methods=['GET', 'POST'])
@login_required
def profile():
    profile = HealthProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        profile = HealthProfile(user_id=current_user.id)
        db.session.add(profile)
    if request.method == 'POST':
        birth_date = request.form.get('birth_date', '').strip()
        try:
            profile.birth_date = date.fromisoformat(birth_date) if birth_date else None
        except ValueError:
            flash('La fecha ingresada no es válida.', 'error')
            return render_template('profile.html', profile=profile)
        profile.health_goals = request.form.get('health_goals', '').strip()
        profile.diagnosed_conditions = request.form.get('diagnosed_conditions', '').strip()
        profile.symptoms = request.form.get('symptoms', '').strip()
        profile.medications = request.form.get('medications', '').strip()
        profile.allergies = request.form.get('allergies', '').strip()
        db.session.commit()
        flash('Perfil de salud actualizado.', 'success')
        return redirect(url_for('dashboard'))
    return render_template('profile.html', profile=profile)



@app.route('/registro-diario', methods=['GET', 'POST'])
@login_required
def daily_log():

    if request.method == 'POST':

        try:
            log_date = date.fromisoformat(
                request.form.get('log_date', '')
            )

            water = request.form.get('water_liters', '').strip()
            sleep = request.form.get('sleep_hours', '').strip()

            water_value = float(water) if water else None
            sleep_value = float(sleep) if sleep else None

            if water_value is not None and not 0 <= water_value <= 20:
                raise ValueError

            if sleep_value is not None and not 0 <= sleep_value <= 24:
                raise ValueError

            # Recopilar y validar los alimentos
            comidas = [
                'breakfast',
                'lunch',
                'snack',
                'dinner',
                'snacks'
            ]

            alimentos = []

            for comida in comidas:

                nombres = request.form.getlist(
                    f'food_name_{comida}[]'
                )

                cantidades = request.form.getlist(
                    f'quantity_{comida}[]'
                )

                unidades = request.form.getlist(
                    f'unit_{comida}[]'
                )

                if not (
                    len(nombres) == len(cantidades) == len(unidades)
                ):
                    raise ValueError

                unidades_permitidas = {
                    'g', 'ml', 'unidad',
                    'cucharada', 'cucharadita', 'taza'
                }

                for nombre, cantidad, unidad in zip(
                    nombres, cantidades, unidades
                ):

                    nombre = nombre.strip()
                    unidad = unidad.strip()
                    cantidad_valor = float(cantidad)

                    if not nombre or len(nombre) > 150:
                        raise ValueError

                    if unidad not in unidades_permitidas:
                        raise ValueError

                    if not 0 < cantidad_valor <= 100000:
                        raise ValueError

                    alimentos.append({
                        'meal_type': comida,
                        'food_name': nombre,
                        'quantity': cantidad_valor,
                        'unit': unidad
                    })

        except (ValueError, TypeError, OverflowError):
            flash(
                'Revisá la fecha, las cantidades, '
                'las unidades, el agua y el sueño.',
                'error'
            )

            return render_template(
                'daily_log.html',
                today=date.today().isoformat()
            )

        try:
            # Crear el registro diario
            entry = DailyLog(
                user_id=current_user.id,
                log_date=log_date,
                water_liters=water_value,
                activity=request.form.get(
                    'activity', ''
                ).strip(),
                sleep_hours=sleep_value,
                mood=request.form.get(
                    'mood', ''
                ).strip(),
                symptoms=request.form.get(
                    'symptoms', ''
                ).strip()
            )

            db.session.add(entry)

            # Obtener el ID del registro sin confirmar
            # todavía la transacción
            db.session.flush()

            # Guardar cada alimento individual
            for alimento in alimentos:

                item = FoodItem(
                    daily_log_id=entry.id,
                    meal_type=alimento['meal_type'],
                    food_name=alimento['food_name'],
                    quantity=alimento['quantity'],
                    unit=alimento['unit']
                )

                db.session.add(item)

            # Confirmar todos los datos juntos
            db.session.commit()

        except Exception:
            db.session.rollback()
            app.logger.exception(
                'Error al guardar el registro diario'
            )

            flash(
                'No se pudo guardar el registro. '
                'Intentá nuevamente.',
                'error'
            )

            return render_template(
                'daily_log.html',
                today=date.today().isoformat()
            )

        flash(
            'Registro diario y alimentos guardados correctamente.',
            'success'
        )

        return redirect(url_for('dashboard'))

    return render_template(
        'daily_log.html',
        today=date.today().isoformat()
    )

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG', '0') == '1')
