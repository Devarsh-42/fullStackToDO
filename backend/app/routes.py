from flask import jsonify, request
from app import app
from app.models import Task

# Create Task
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    task = Task(**data).save()
    return jsonify(task), 201

# Get All Tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.objects().all()
    return jsonify(tasks), 200

# Get Task by ID
@app.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.objects(id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task), 200

# Update Task
@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    task = Task.objects(id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    task.update(**data)
    updated_task = Task.objects(id=task_id).first()
    return jsonify(updated_task), 200

# Delete Task
@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.objects(id=task_id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    task.delete()
    return jsonify({'message': 'Task deleted successfully'}), 200
