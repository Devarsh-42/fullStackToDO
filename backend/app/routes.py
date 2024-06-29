import os

from flask import Blueprint, jsonify, request, send_from_directory
from app.models import Task

task_bp = Blueprint('task', __name__)

@task_bp.route('/')
@task_bp.route('/<path:path>')
def serve_frontend(path=None):
    if path and os.path.exists(f'../frontend/build/{path}'):
        return send_from_directory('../frontend/build', path)
    return send_from_directory('../frontend/build', 'index.html')

@task_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    task = Task(**data).save()
    return jsonify(task), 201

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.objects().all()
    return jsonify(tasks), 200

@task_bp.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.objects(id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task), 200

@task_bp.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    task = Task.objects(id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    task.update(**data)
    updated_task = Task.objects(id=task_id).first()
    return jsonify(updated_task), 200

@task_bp.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.objects(id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    task.delete()
    return jsonify({'message': 'Task deleted successfully'}), 200
