"""Create a fresh database with just the demo user — no mock data."""
from models import db, User
from auth import hash_password


def seed(app):
    with app.app_context():
        db.drop_all()
        db.create_all()
        user = User(username="demo", password_hash=hash_password("demo123"))
        db.session.add(user)
        db.session.commit()
        print("Fresh DB created with demo user (demo / demo123). No mock data.")


if __name__ == "__main__":
    from app import create_app
    app = create_app()
    seed(app)
