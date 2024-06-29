from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from pymongo import MongoClient

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"

# Initialize MongoDB Client
client = MongoClient('mongodb://localhost:27017/')
db = client.feedback_db

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Example: 16 MB


@app.route('/')
def home():
    return "Customer Feedback Portal API"

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    feedback = request.json
    db.feedback.insert_one(feedback)
    print("Sent Bro")
    return jsonify({"message": "Feedback submitted successfully!"}), 201

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    feedback_list = list(db.feedback.find())
    for feedback in feedback_list:
        feedback['_id'] = str(feedback['_id'])
        print("Added Bro!!")
    return jsonify(feedback_list), 200

if __name__ == '__main__':
    app.run(debug=True)