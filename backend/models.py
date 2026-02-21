from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    transactions = db.relationship("Transaction", backref="user", lazy=True)
    budgets = db.relationship("Budget", backref="user", lazy=True)

    def to_dict(self):
        return {"id": self.id, "username": self.username, "created_at": self.created_at.isoformat()}


class Transaction(db.Model):
    __tablename__ = "transactions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, default="")
    date = db.Column(db.Date, nullable=False)
    type = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "amount": self.amount, "category": self.category, "description": self.description, "date": self.date.isoformat(), "type": self.type}


class Budget(db.Model):
    __tablename__ = "budgets"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    limit_amount = db.Column(db.Float, nullable=False)
    month = db.Column(db.String(7), nullable=False)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "category": self.category, "limit_amount": self.limit_amount, "month": self.month}


class Goal(db.Model):
    __tablename__ = "goals"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0)
    deadline = db.Column(db.String(10), nullable=True)
    icon = db.Column(db.String(10), default="⭐")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "name": self.name, "target_amount": self.target_amount, "current_amount": self.current_amount, "deadline": self.deadline, "icon": self.icon, "created_at": self.created_at.isoformat()}
