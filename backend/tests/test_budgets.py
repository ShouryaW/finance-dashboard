import pytest


def _create_budget(client, auth_header, **overrides):
    data = {
        "category": "Food",
        "limit_amount": 500.00,
        "month": "2025-01",
    }
    data.update(overrides)
    return client.post("/api/budgets", json=data, headers=auth_header)


class TestCreateBudget:
    def test_create_budget_success(self, client, auth_header):
        resp = _create_budget(client, auth_header)
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["budget"]["category"] == "Food"
        assert data["budget"]["limit_amount"] == 500.00

    def test_create_budget_duplicate(self, client, auth_header):
        _create_budget(client, auth_header)
        resp = _create_budget(client, auth_header)
        assert resp.status_code == 409
        assert "already exists" in resp.get_json()["error"]

    def test_create_budget_missing_fields(self, client, auth_header):
        resp = client.post("/api/budgets", json={"category": "Food"}, headers=auth_header)
        assert resp.status_code == 400

    def test_create_budget_invalid_amount(self, client, auth_header):
        resp = _create_budget(client, auth_header, limit_amount=-100)
        assert resp.status_code == 400


class TestGetBudgets:
    def test_get_budgets_empty(self, client, auth_header):
        resp = client.get("/api/budgets", headers=auth_header)
        assert resp.status_code == 200
        assert resp.get_json()["budgets"] == []

    def test_get_budgets_with_spent(self, client, auth_header):
        _create_budget(client, auth_header, category="Food", month="2025-01", limit_amount=500)
        # Add an expense transaction in same category and month
        client.post("/api/transactions", json={
            "amount": 100,
            "category": "Food",
            "date": "2025-01-15",
            "type": "expense",
            "description": "Groceries",
        }, headers=auth_header)
        resp = client.get("/api/budgets", headers=auth_header)
        assert resp.status_code == 200
        budgets = resp.get_json()["budgets"]
        assert len(budgets) == 1
        assert budgets[0]["spent"] == 100.0
        assert budgets[0]["status"] == "ok"


class TestUpdateBudget:
    def test_update_budget_success(self, client, auth_header):
        resp = _create_budget(client, auth_header)
        budget_id = resp.get_json()["budget"]["id"]
        resp = client.put(f"/api/budgets/{budget_id}", json={"limit_amount": 750}, headers=auth_header)
        assert resp.status_code == 200
        assert resp.get_json()["budget"]["limit_amount"] == 750.00

    def test_update_budget_not_found(self, client, auth_header):
        resp = client.put("/api/budgets/9999", json={"limit_amount": 750}, headers=auth_header)
        assert resp.status_code == 404


class TestDeleteBudget:
    def test_delete_budget_success(self, client, auth_header):
        resp = _create_budget(client, auth_header)
        budget_id = resp.get_json()["budget"]["id"]
        resp = client.delete(f"/api/budgets/{budget_id}", headers=auth_header)
        assert resp.status_code == 200
        assert "deleted" in resp.get_json()["message"]

    def test_delete_budget_unauthorized(self, client, auth_header, second_auth_header):
        resp = _create_budget(client, auth_header)
        budget_id = resp.get_json()["budget"]["id"]
        resp = client.delete(f"/api/budgets/{budget_id}", headers=second_auth_header)
        assert resp.status_code == 403
