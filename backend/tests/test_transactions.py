import pytest


def _create_transaction(client, auth_header, **overrides):
    data = {
        "amount": 50.00,
        "category": "Food",
        "description": "Lunch",
        "date": "2025-01-15",
        "type": "expense",
    }
    data.update(overrides)
    return client.post("/api/transactions", json=data, headers=auth_header)


class TestCreateTransaction:
    def test_create_transaction_success(self, client, auth_header):
        resp = _create_transaction(client, auth_header)
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["transaction"]["amount"] == 50.00
        assert data["transaction"]["category"] == "Food"
        assert data["transaction"]["type"] == "expense"

    def test_create_transaction_missing_fields(self, client, auth_header):
        resp = client.post("/api/transactions", json={"amount": 50}, headers=auth_header)
        assert resp.status_code == 400

    def test_create_transaction_invalid_type(self, client, auth_header):
        resp = _create_transaction(client, auth_header, type="invalid")
        assert resp.status_code == 400
        assert "Type must be" in resp.get_json()["error"]

    def test_create_transaction_negative_amount(self, client, auth_header):
        resp = _create_transaction(client, auth_header, amount=-10)
        assert resp.status_code == 400
        assert "positive" in resp.get_json()["error"]

    def test_create_transaction_no_auth(self, client):
        resp = client.post("/api/transactions", json={"amount": 50, "category": "Food", "date": "2025-01-15", "type": "expense"})
        assert resp.status_code == 401


class TestGetTransactions:
    def test_get_transactions_empty(self, client, auth_header):
        resp = client.get("/api/transactions", headers=auth_header)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["transactions"] == []
        assert data["total"] == 0

    def test_get_transactions_with_data(self, client, auth_header):
        _create_transaction(client, auth_header)
        _create_transaction(client, auth_header, amount=100, category="Transport")
        resp = client.get("/api/transactions", headers=auth_header)
        assert resp.status_code == 200
        assert resp.get_json()["total"] == 2

    def test_get_transactions_filter_by_category(self, client, auth_header):
        _create_transaction(client, auth_header, category="Food")
        _create_transaction(client, auth_header, category="Transport")
        resp = client.get("/api/transactions?category=Food", headers=auth_header)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["total"] == 1
        assert data["transactions"][0]["category"] == "Food"

    def test_get_transactions_filter_by_type(self, client, auth_header):
        _create_transaction(client, auth_header, type="expense")
        _create_transaction(client, auth_header, type="income", category="Salary", amount=3000)
        resp = client.get("/api/transactions?type=income", headers=auth_header)
        assert resp.status_code == 200
        assert resp.get_json()["total"] == 1


class TestDeleteTransaction:
    def test_delete_transaction_success(self, client, auth_header):
        resp = _create_transaction(client, auth_header)
        txn_id = resp.get_json()["transaction"]["id"]
        resp = client.delete(f"/api/transactions/{txn_id}", headers=auth_header)
        assert resp.status_code == 200
        assert "deleted" in resp.get_json()["message"]

    def test_delete_transaction_not_found(self, client, auth_header):
        resp = client.delete("/api/transactions/9999", headers=auth_header)
        assert resp.status_code == 404

    def test_delete_transaction_unauthorized(self, client, auth_header, second_auth_header):
        resp = _create_transaction(client, auth_header)
        txn_id = resp.get_json()["transaction"]["id"]
        resp = client.delete(f"/api/transactions/{txn_id}", headers=second_auth_header)
        assert resp.status_code == 403


class TestExportTransactions:
    def test_export_csv(self, client, auth_header):
        _create_transaction(client, auth_header)
        resp = client.get("/api/transactions/export", headers=auth_header)
        assert resp.status_code == 200
        assert resp.content_type == "text/csv; charset=utf-8"
        csv_text = resp.data.decode("utf-8")
        assert "ID" in csv_text
        assert "Food" in csv_text
