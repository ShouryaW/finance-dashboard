import random
from datetime import date, timedelta
from models import db, User, Transaction, Budget
from auth import hash_password

CATEGORIES = {
    "income": ["Salary", "Freelance", "Investments", "Rental Income", "Side Hustle"],
    "expense": ["Food", "Transport", "Entertainment", "Utilities", "Healthcare", "Shopping", "Education", "Rent"],
}

INCOME_ENTRIES = [
    {"category": "Salary", "description": "Monthly salary", "amount_range": (4000, 6000)},
    {"category": "Freelance", "description": "Freelance project", "amount_range": (500, 2000)},
    {"category": "Investments", "description": "Dividend payment", "amount_range": (100, 500)},
    {"category": "Rental Income", "description": "Apartment rent", "amount_range": (800, 1500)},
    {"category": "Side Hustle", "description": "Online sales", "amount_range": (50, 300)},
]

EXPENSE_DESCRIPTIONS = {
    "Food": ["Groceries", "Restaurant dinner", "Coffee shop", "Lunch", "Food delivery"],
    "Transport": ["Gas", "Uber ride", "Bus pass", "Car maintenance", "Parking"],
    "Entertainment": ["Movie tickets", "Concert", "Streaming subscription", "Books", "Games"],
    "Utilities": ["Electric bill", "Water bill", "Internet", "Phone bill", "Gas bill"],
    "Healthcare": ["Doctor visit", "Pharmacy", "Gym membership", "Dental checkup"],
    "Shopping": ["Clothing", "Electronics", "Home decor", "Gifts", "Amazon order"],
    "Education": ["Online course", "Textbooks", "Workshop", "Certification"],
    "Rent": ["Monthly rent"],
}


def generate_transactions(user_id, months=6):
    transactions = []
    today = date.today()
    start_date = today.replace(day=1) - timedelta(days=months * 30)

    for i in range(months):
        month_start = start_date + timedelta(days=i * 30)

        # Add 1-2 income entries per month
        for _ in range(random.randint(1, 2)):
            entry = random.choice(INCOME_ENTRIES)
            amount = round(random.uniform(*entry["amount_range"]), 2)
            txn_date = month_start + timedelta(days=random.randint(0, 28))
            if txn_date > today:
                txn_date = today
            transactions.append(Transaction(
                user_id=user_id,
                amount=amount,
                category=entry["category"],
                description=entry["description"],
                date=txn_date,
                type="income",
            ))

        # Add 5-10 expense entries per month
        for _ in range(random.randint(5, 10)):
            category = random.choice(CATEGORIES["expense"])
            description = random.choice(EXPENSE_DESCRIPTIONS[category])
            amount = round(random.uniform(10, 500), 2)
            txn_date = month_start + timedelta(days=random.randint(0, 28))
            if txn_date > today:
                txn_date = today
            transactions.append(Transaction(
                user_id=user_id,
                amount=amount,
                category=category,
                description=description,
                date=txn_date,
                type="expense",
            ))

    return transactions


def seed(app):
    with app.app_context():
        if User.query.first():
            print("Database already seeded.")
            return

        # Create demo user
        user = User(username="demo", password_hash=hash_password("demo123"))
        db.session.add(user)
        db.session.commit()

        # Generate transactions
        transactions = generate_transactions(user.id, months=6)
        db.session.add_all(transactions)
        db.session.commit()

        # Create budgets for current month
        current_month = date.today().strftime("%Y-%m")
        budget_data = [
            ("Food", 600),
            ("Transport", 300),
            ("Entertainment", 200),
            ("Utilities", 250),
            ("Shopping", 400),
            ("Healthcare", 150),
        ]
        for category, limit_amount in budget_data:
            budget = Budget(user_id=user.id, category=category, limit_amount=limit_amount, month=current_month)
            db.session.add(budget)
        db.session.commit()

        print(f"Seeded {len(transactions)} transactions and {len(budget_data)} budgets for user: demo")


if __name__ == "__main__":
    from app import create_app
    app = create_app()
    seed(app)
