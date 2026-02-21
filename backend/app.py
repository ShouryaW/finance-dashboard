import os
import sys
import csv
import io
from datetime import datetime, date, timedelta
from collections import defaultdict

from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from models import db, User, Transaction, Budget, Goal
from database import init_db
from auth import hash_password, check_password, create_token, token_required


def create_app(config=None):
    app = Flask(__name__)
    CORS(app)

    if config:
        app.config.update(config)

    init_db(app)

    # ── Auth Routes ──────────────────────────────────────────────────────

    @app.route("/api/signup", methods=["POST"])
    def signup():
        data = request.get_json()
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username and password are required"}), 400
        username = data["username"].strip()
        password = data["password"]
        if len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters"}), 400
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        existing = User.query.filter_by(username=username).first()
        if existing:
            return jsonify({"error": "Username already exists"}), 409
        user = User(username=username, password_hash=hash_password(password))
        db.session.add(user)
        db.session.commit()
        token = create_token(user.id, user.username)
        return jsonify({"token": token, "user": user.to_dict()}), 201

    @app.route("/api/login", methods=["POST"])
    def login():
        data = request.get_json()
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Username and password are required"}), 400
        user = User.query.filter_by(username=data["username"]).first()
        if not user or not check_password(data["password"], user.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401
        token = create_token(user.id, user.username)
        return jsonify({"token": token, "user": user.to_dict()}), 200

    @app.route("/api/me", methods=["GET"])
    @token_required
    def get_me():
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user.to_dict()}), 200

    # ── Transaction Routes ───────────────────────────────────────────────

    @app.route("/api/transactions", methods=["GET"])
    @token_required
    def get_transactions():
        query = Transaction.query.filter_by(user_id=request.user_id)

        # Filtering
        category = request.args.get("category")
        if category:
            query = query.filter_by(category=category)
        txn_type = request.args.get("type")
        if txn_type:
            query = query.filter_by(type=txn_type)
        start_date = request.args.get("start_date")
        if start_date:
            query = query.filter(Transaction.date >= date.fromisoformat(start_date))
        end_date = request.args.get("end_date")
        if end_date:
            query = query.filter(Transaction.date <= date.fromisoformat(end_date))

        # Sorting
        sort_by = request.args.get("sort_by", "date")
        sort_order = request.args.get("sort_order", "desc")
        if sort_by == "amount":
            sort_col = Transaction.amount
        elif sort_by == "category":
            sort_col = Transaction.category
        else:
            sort_col = Transaction.date
        if sort_order == "asc":
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())

        # Pagination
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        per_page = min(per_page, 100)
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "transactions": [t.to_dict() for t in paginated.items],
            "total": paginated.total,
            "page": paginated.page,
            "per_page": paginated.per_page,
            "pages": paginated.pages,
        }), 200

    @app.route("/api/transactions", methods=["POST"])
    @token_required
    def create_transaction():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        required = ["amount", "category", "date", "type"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
        if data["type"] not in ("income", "expense"):
            return jsonify({"error": "Type must be income or expense"}), 400
        try:
            amount = float(data["amount"])
            if amount <= 0:
                return jsonify({"error": "Amount must be positive"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid amount"}), 400
        try:
            txn_date = date.fromisoformat(data["date"])
        except ValueError:
            return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400
        txn = Transaction(
            user_id=request.user_id,
            amount=amount,
            category=data["category"],
            description=data.get("description", ""),
            date=txn_date,
            type=data["type"],
        )
        db.session.add(txn)
        db.session.commit()
        return jsonify({"transaction": txn.to_dict()}), 201

    @app.route("/api/transactions/<int:txn_id>", methods=["DELETE"])
    @token_required
    def delete_transaction(txn_id):
        txn = Transaction.query.get(txn_id)
        if not txn:
            return jsonify({"error": "Transaction not found"}), 404
        if txn.user_id != request.user_id:
            return jsonify({"error": "Unauthorized"}), 403
        db.session.delete(txn)
        db.session.commit()
        return jsonify({"message": "Transaction deleted"}), 200

    # ── Dashboard Route ──────────────────────────────────────────────────

    @app.route("/api/dashboard", methods=["GET"])
    @token_required
    def get_dashboard():
        transactions = Transaction.query.filter_by(user_id=request.user_id).all()

        total_income = sum(t.amount for t in transactions if t.type == "income")
        total_expenses = sum(t.amount for t in transactions if t.type == "expense")
        balance = total_income - total_expenses

        # Category spending (expenses only)
        category_spending = defaultdict(float)
        for t in transactions:
            if t.type == "expense":
                category_spending[t.category] += t.amount
        category_spending = dict(category_spending)

        # Recent transactions (last 5)
        recent = sorted(transactions, key=lambda t: t.date, reverse=True)[:5]

        # Monthly data (last 6 months)
        today = date.today()
        monthly_data = []
        for i in range(5, -1, -1):
            m_date = today.replace(day=1) - timedelta(days=i * 30)
            month_str = m_date.strftime("%Y-%m")
            m_income = sum(t.amount for t in transactions if t.type == "income" and t.date.strftime("%Y-%m") == month_str)
            m_expense = sum(t.amount for t in transactions if t.type == "expense" and t.date.strftime("%Y-%m") == month_str)
            monthly_data.append({"month": month_str, "income": m_income, "expenses": m_expense})

        # Simple forecast: average monthly expense
        if monthly_data:
            avg_expense = sum(m["expenses"] for m in monthly_data) / len(monthly_data)
            avg_income = sum(m["income"] for m in monthly_data) / len(monthly_data)
        else:
            avg_expense = 0
            avg_income = 0
        forecast = {"avg_monthly_income": round(avg_income, 2), "avg_monthly_expenses": round(avg_expense, 2), "projected_savings": round(avg_income - avg_expense, 2)}

        return jsonify({
            "balance": round(balance, 2),
            "income": round(total_income, 2),
            "expenses": round(total_expenses, 2),
            "category_spending": {k: round(v, 2) for k, v in category_spending.items()},
            "recent_transactions": [t.to_dict() for t in recent],
            "monthly_data": monthly_data,
            "forecast": forecast,
        }), 200

    # ── Budget Routes ────────────────────────────────────────────────────

    @app.route("/api/budgets", methods=["GET"])
    @token_required
    def get_budgets():
        budgets = Budget.query.filter_by(user_id=request.user_id).all()
        result = []
        for b in budgets:
            spent = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0)).filter(
                Transaction.user_id == request.user_id,
                Transaction.category == b.category,
                Transaction.type == "expense",
                db.func.strftime("%Y-%m", Transaction.date) == b.month,
            ).scalar()
            budget_dict = b.to_dict()
            budget_dict["spent"] = round(float(spent), 2)
            if b.limit_amount > 0:
                budget_dict["percentage"] = round((float(spent) / b.limit_amount) * 100, 1)
            else:
                budget_dict["percentage"] = 0
            if budget_dict["percentage"] >= 100:
                budget_dict["status"] = "exceeded"
            elif budget_dict["percentage"] >= 80:
                budget_dict["status"] = "warning"
            else:
                budget_dict["status"] = "ok"
            result.append(budget_dict)
        return jsonify({"budgets": result}), 200

    @app.route("/api/budgets", methods=["POST"])
    @token_required
    def create_budget():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        required = ["category", "limit_amount", "month"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
        try:
            limit_amount = float(data["limit_amount"])
            if limit_amount <= 0:
                return jsonify({"error": "Limit amount must be positive"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid limit_amount"}), 400
        existing = Budget.query.filter_by(
            user_id=request.user_id, category=data["category"], month=data["month"]
        ).first()
        if existing:
            return jsonify({"error": "Budget already exists for this category and month"}), 409
        budget = Budget(
            user_id=request.user_id,
            category=data["category"],
            limit_amount=limit_amount,
            month=data["month"],
        )
        db.session.add(budget)
        db.session.commit()
        return jsonify({"budget": budget.to_dict()}), 201

    @app.route("/api/budgets/<int:budget_id>", methods=["PUT"])
    @token_required
    def update_budget(budget_id):
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"error": "Budget not found"}), 404
        if budget.user_id != request.user_id:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        if "limit_amount" in data:
            try:
                limit_amount = float(data["limit_amount"])
                if limit_amount <= 0:
                    return jsonify({"error": "Limit amount must be positive"}), 400
                budget.limit_amount = limit_amount
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid limit_amount"}), 400
        if "category" in data:
            budget.category = data["category"]
        if "month" in data:
            budget.month = data["month"]
        db.session.commit()
        return jsonify({"budget": budget.to_dict()}), 200

    @app.route("/api/budgets/<int:budget_id>", methods=["DELETE"])
    @token_required
    def delete_budget(budget_id):
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"error": "Budget not found"}), 404
        if budget.user_id != request.user_id:
            return jsonify({"error": "Unauthorized"}), 403
        db.session.delete(budget)
        db.session.commit()
        return jsonify({"message": "Budget deleted"}), 200

    # ── CSV Export ───────────────────────────────────────────────────────

    @app.route("/api/transactions/export", methods=["GET"])
    @token_required
    def export_transactions():
        transactions = Transaction.query.filter_by(user_id=request.user_id).order_by(Transaction.date.desc()).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Date", "Type", "Category", "Amount", "Description"])
        for t in transactions:
            writer.writerow([t.id, t.date.isoformat(), t.type, t.category, t.amount, t.description])
        csv_content = output.getvalue()
        output.close()
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=transactions.csv"},
        )

    # ── Goals ──────────────────────────────────────────
    @app.route("/api/goals", methods=["GET"])
    @token_required
    def get_goals():
        goals = Goal.query.filter_by(user_id=request.user_id).order_by(Goal.created_at.desc()).all()
        return jsonify({"goals": [g.to_dict() for g in goals]})

    @app.route("/api/goals", methods=["POST"])
    @token_required
    def create_goal():
        data = request.get_json()
        if not data or not data.get("name") or not data.get("target_amount"):
            return jsonify({"error": "Name and target amount are required"}), 400
        goal = Goal(
            user_id=request.user_id,
            name=data["name"],
            target_amount=float(data["target_amount"]),
            current_amount=float(data.get("current_amount", 0)),
            deadline=data.get("deadline"),
            icon=data.get("icon", "⭐"),
        )
        db.session.add(goal)
        db.session.commit()
        return jsonify(goal.to_dict()), 201

    @app.route("/api/goals/<int:goal_id>", methods=["PUT"])
    @token_required
    def update_goal(goal_id):
        goal = Goal.query.get(goal_id)
        if not goal or goal.user_id != request.user_id:
            return jsonify({"error": "Goal not found"}), 404
        data = request.get_json()
        if data.get("name"):
            goal.name = data["name"]
        if data.get("target_amount") is not None:
            goal.target_amount = float(data["target_amount"])
        if data.get("current_amount") is not None:
            goal.current_amount = float(data["current_amount"])
        if "deadline" in data:
            goal.deadline = data["deadline"]
        if data.get("icon"):
            goal.icon = data["icon"]
        db.session.commit()
        return jsonify(goal.to_dict())

    @app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
    @token_required
    def delete_goal(goal_id):
        goal = Goal.query.get(goal_id)
        if not goal or goal.user_id != request.user_id:
            return jsonify({"error": "Goal not found"}), 404
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"message": "Goal deleted"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
