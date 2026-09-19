#!/usr/bin/env python3

import sys
import urllib.error
import urllib.request


def read(base_url: str, path: str) -> tuple[int, str, str]:
    request = urllib.request.Request(f"{base_url.rstrip('/')}{path}")
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.status, response.headers.get_content_type(), response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.headers.get_content_type(), error.read().decode()


def main() -> int:
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"
    health_status, health_type, health_body = read(base_url, "/healthz")
    if (health_status, health_type, health_body) != (200, "text/plain", "ok\n"):
        raise RuntimeError("Web health endpoint returned an unexpected response")

    route_status, route_type, route_body = read(base_url, "/app/tasks")
    if route_status != 200 or route_type != "text/html" or '<div id="root"></div>' not in route_body:
        raise RuntimeError("SPA fallback did not return the application entry point")

    print("Web smoke checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
