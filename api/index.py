"""
Vercel Serverless Function Handler for Compline API
Endpoints:
  - GET/POST /api/status
  - GET/POST /api/generate
  - GET/POST /api/generate/stream
"""

import json
import urllib.parse
from http.server import BaseHTTPRequestHandler
import sys
import os

# Add local directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from gemma_engine import generate_gothic_story, stream_gothic_story, check_ollama_status
except ImportError:
    from api.gemma_engine import generate_gothic_story, stream_gothic_story, check_ollama_status


class handler(BaseHTTPRequestHandler):
    def handle(self):
        """
        Handle a single request and terminate immediately.
        Serverless functions execute one request per container invocation;
        terminating handle() prevents the runtime from hanging on empty socket reads.
        """
        self.close_connection = True
        self.handle_one_request()

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Connection", "close")
        self.end_headers()
        self.close_connection = True

    def _resolve_route(self):
        """
        Determines the requested route based on query parameter (?endpoint=...),
        Vercel forwarding headers, and self.path.
        Returns: ('status' | 'stream' | 'generate' | 'unknown', parsed, query)
        """
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        endpoint_param = query.get("endpoint", [""])[0].strip("/")

        candidates = [
            endpoint_param,
            self.headers.get("x-matched-path", ""),
            self.headers.get("x-forwarded-uri", ""),
            parsed.path
        ]

        for c in candidates:
            if not c:
                continue
            c_clean = c.split("?")[0].strip("/")
            if (
                c_clean.endswith("generate/stream")
                or c_clean == "generate/stream"
                or c_clean.endswith("/stream")
                or c_clean == "stream"
            ):
                return "stream", parsed, query
            if c_clean.endswith("generate") or c_clean == "generate":
                return "generate", parsed, query
            if c_clean.endswith("status") or c_clean == "status":
                return "status", parsed, query

        # Fallback: Default to status for root, /api, or /api/index.py
        norm = parsed.path.rstrip("/")
        if norm in ("/api/index.py", "/index.py", "/api", "", "/"):
            return "status", parsed, query

        return "unknown", parsed, query

    def do_GET(self):
        route, parsed, query = self._resolve_route()

        if route == "status":
            ollama_info = check_ollama_status()
            data = {
                "app": "Compline: Gothic Wind-Down Companion",
                "theme": "Classical Gothic / Slow and Steady (Hacktoberfest Week 3)",
                "ollama": ollama_info,
                "offline_ready": True,
                "deployed_on": "Vercel Serverless"
            }
            self.send_json(data)

        elif route == "stream":
            prompt = query.get("prompt", ["sloth in cathedral"])[0]
            model = query.get("model", [None])[0]
            force_offline = query.get("force_offline", ["false"])[0].lower() == "true"

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("Connection", "close")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            try:
                for event in stream_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline):
                    msg = f"data: {json.dumps(event)}\n\n"
                    self.wfile.write(msg.encode("utf-8"))
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass
            finally:
                self.close_connection = True

        elif route == "generate":
            prompt = query.get("prompt", ["sloth in cathedral"])[0]
            model = query.get("model", [None])[0]
            force_offline = query.get("force_offline", ["false"])[0].lower() == "true"

            result = generate_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline)
            self.send_json(result)

        else:
            self.send_json({"error": "Unknown API endpoint", "path": parsed.path}, status_code=404)

    def do_POST(self):
        route, parsed, _ = self._resolve_route()

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        if route == "stream":
            prompt = req_data.get("prompt", "sloth in cathedral")
            model = req_data.get("model", None)
            force_offline = req_data.get("force_offline", False)

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("Connection", "close")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            try:
                for event in stream_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline):
                    msg = f"data: {json.dumps(event)}\n\n"
                    self.wfile.write(msg.encode("utf-8"))
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass
            finally:
                self.close_connection = True

        elif route == "generate":
            prompt = req_data.get("prompt", "sloth in cathedral")
            model = req_data.get("model", None)
            force_offline = req_data.get("force_offline", False)

            result = generate_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline)
            self.send_json(result)

        elif route == "status":
            ollama_info = check_ollama_status()
            data = {
                "app": "Compline: Gothic Wind-Down Companion",
                "theme": "Classical Gothic / Slow and Steady (Hacktoberfest Week 3)",
                "ollama": ollama_info,
                "offline_ready": True,
                "deployed_on": "Vercel Serverless"
            }
            self.send_json(data)

        else:
            self.send_json({"error": "Unknown API endpoint", "path": parsed.path}, status_code=404)

    def send_json(self, data, status_code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")
        self.end_headers()
        try:
            self.wfile.write(body)
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            self.close_connection = True
