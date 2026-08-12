import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_register_and_login():
    email = "testuser@example.com"
    password = "securepassword123"

    # Ensure registration works
    resp = client.post("/api/auth/register", json={"email": email, "password": password, "full_name": "Test User"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == email

    # Duplicate register should fail
    resp2 = client.post("/api/auth/register", json={"email": email, "password": password})
    assert resp2.status_code == 400

    # Login works
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    token_data = login.json()
    assert "access_token" in token_data


def test_invalid_login():
    resp = client.post("/api/auth/login", json={"email": "noone@example.com", "password": "x"})
    assert resp.status_code == 401
