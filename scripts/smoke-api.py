#!/usr/bin/env python3
"""Exercise a running API with new test accounts; remove tasks before returning."""

import json
import secrets
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def request(base_url, method, path, expected, body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = None if body is None else json.dumps(body).encode()
    req = Request(base_url + path, data=data, headers=headers, method=method)
    try:
        response = urlopen(req, timeout=15)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read()
        assert response.status == expected, f"{method} {path}: expected {expected}, got {response.status}"
        return json.loads(raw) if raw else None


def account(base_url):
    credentials = {
        "email": f"smoke-{secrets.token_hex(8)}@example.com",
        "password": secrets.token_urlsafe(24),
    }
    request(base_url, "POST", "/api/auth/register", 201, credentials)
    return request(base_url, "POST", "/api/auth/login", 200, credentials)["accessToken"]


def main():
    base_url = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")
    assert request(base_url, "GET", "/actuator/health/readiness", 200)["status"] == "UP"
    request(base_url, "GET", "/api/tasks", 401)
    alice = account(base_url)
    bob = account(base_url)
    task = request(base_url, "POST", "/api/tasks", 201, {"title": "Smoke test", "status": "TODO"}, alice)
    path = f"/api/tasks/{task['id']}"
    try:
        page = request(base_url, "GET", "/api/tasks?status=TODO&q=smoke", 200, token=alice)
        assert page["totalElements"] == 1
        assert request(base_url, "GET", "/api/tasks", 200, token=bob)["totalElements"] == 0
        update = {"title": "Verified task", "description": None, "status": "DONE", "version": task["version"]}
        request(base_url, "PUT", path, 404, update, bob)
        request(base_url, "DELETE", path, 404, token=bob)
        changed = request(base_url, "PUT", path, 200, update, alice)
        assert changed["version"] > task["version"]
        request(base_url, "PUT", path, 409, update, alice)
    finally:
        request(base_url, "DELETE", path, 204, token=alice)
    request(base_url, "DELETE", path, 404, token=alice)
    print("Smoke checks passed: health, authentication, CRUD, filtering, ownership and stale updates")


if __name__ == "__main__":
    main()
