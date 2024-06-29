from app import db

class Task(db.Document):
    title = db.StringField(required=True, max_length=100)
    description = db.StringField()
    due_date = db.DateTimeField()
    priority = db.IntField(default=1)
    completed = db.BooleanField(default=False)

    def __repr__(self):
        return f'<Task {self.title}>'
