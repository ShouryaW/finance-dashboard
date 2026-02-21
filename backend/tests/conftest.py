import sys
import os
import pytest

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from models import db as _db


@pytest.fixture(scope="function")
def app():
    """Create application for testing."""
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope="function")
def auth_header(client):
    """Create a user and return auth header with token."""
    resp = client.post("/api/signup", json={"username": "testuser", "password": "testpass123"})
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def second_auth_header(client):
    """Create a second user and return auth header with token."""
    resp = client.post("/api/signup", json={"username": "testuser2", "password": "testpass456"})
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}
