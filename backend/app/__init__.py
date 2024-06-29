from flask import Flask
from flask_mongoengine import MongoEngine
from flask_socketio import SocketIO

app = Flask(__name__,static_folder='../frontend/build', static_url_path='')
app.config['MONGODB_SETTINGS'] = {
    'db': 'todo',
    'host': 'mongodb://localhost/todo'
}
db = MongoEngine(app)
socketio = SocketIO(app)

# Register blueprints
from app.routes import task_bp
app.register_blueprint(task_bp)
