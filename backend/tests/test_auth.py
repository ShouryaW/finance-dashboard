import pytest


class TestSignup:
    def test_signup_success(self, client):
        resp = client.post("/api/signup", json={"username": "newuser", "password": "password123"})
        assert resp.status_code == 201
        data = resp.get_json()
        assert "token" in data
        assert data["user"]["username"] == "newuser"

    def test_signup_duplicate_username(self, client):
        client.post("/api/signup", json={"username": "newuser", "password": "password123"})
        resp = client.post("/api/signup", json={"username": "newuser", "password": "password456"})
        assert resp.status_code == 409
        assert "already exists" in resp.get_json()["error"]

    def test_signup_missing_fields(self, client):
        resp = client.post("/api/signup", json={"username": "newuser"})
        assert resp.status_code == 400

    def test_signup_short_username(self, client):
        resp = client.post("/api/signup", json={"username": "ab", "password": "password123"})
        assert resp.status_code == 400
        assert "at least 3" in resp.get_json()["error"]

    def test_signup_short_password(self, client):
        resp = client.post("/api/signup", json={"username": "newuser", "password": "12345"})
        assert resp.status_code == 400
        assert "at least 6" in resp.get_json()["error"]


class TestLogin:
    def test_login_success(self, client):
        client.post("/api/signup", json={"username": "loginuser", "password": "password123"})
        resp = client.post("/api/login", json={"username": "loginuser", "password": "password123"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "token" in data
        assert data["user"]["username"] == "loginuser"

    def test_login_invalid_credentials(self, client):
        client.post("/api/signup", json={"username": "loginuser", "password": "password123"})
        resp = client.post("/api/login", json={"username": "loginuser", "password": "wrongpass"})
        assert resp.status_code == 401
        assert "Invalid credentials" in resp.get_json()["error"]

    def test_login_nonexistent_user(self, client):
        resp = client.post("/api/login", json={"username": "ghost", "password": "password123"})
        assert resp.status_code == 401


class TestMe:
    def test_get_me_success(self, client, auth_header):
        resp = client.get("/api/me", headers=auth_header)
        assert resp.status_code == 200
        assert resp.get_json()["user"]["username"] == "testuser"

    def test_get_me_no_token(self, client):
        resp = client.get("/api/me")
        assert resp.status_code == 401
        assert "Token is missing" in resp.get_json()["error"]
