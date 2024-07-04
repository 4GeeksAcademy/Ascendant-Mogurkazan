import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
import openai

from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.openai_routes import api as openai_api
from api.admin import setup_admin
from api.commands import setup_commands

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Configuración CORS

# Configurar la clave de API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Definir el directorio de archivos estáticos
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

# Configuración de la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Añadir el administrador
setup_admin(app)

# Añadir los comandos
setup_commands(app)

# Añadir todos los endpoints de la API con un prefijo "api"
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(openai_api, url_prefix='/api')

# Manejar/serializar errores como un objeto JSON
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Generar el sitemap con todos tus endpoints
@app.route('/')
def sitemap():
    return generate_sitemap(app)

# Cualquier otro endpoint intentará servirlo como un archivo estático
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # evitar la memoria caché
    return response

# Esto solo se ejecuta si se ejecuta `$ python src/main.py`
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
