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
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api"):
            path = path[len("/api"):]

        if path == "/status" or path == "":
            ollama_info = check_ollama_status()
            data = {
                "app": "Compline: Gothic Wind-Down Companion",
                "theme": "Classical Gothic / Slow and Steady (Hacktoberfest Week 3)",
                "ollama": ollama_info,
                "offline_ready": True,
                "deployed_on": "Vercel Serverless"
            }
            self.send_json(data)

        elif path == "/generate/stream":
            query = urllib.parse.parse_qs(parsed.query)
            prompt = query.get("prompt", ["sloth in cathedral"])[0]
            model = query.get("model", [None])[0]
            force_offline = query.get("force_offline", ["false"])[0].lower() == "true"

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            try:
                for event in stream_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline):
                    msg = f"data: {json.dumps(event)}\n\n"
                    self.wfile.write(msg.encode("utf-8"))
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass

        elif path == "/generate":
            query = urllib.parse.parse_qs(parsed.query)
            prompt = query.get("prompt", ["sloth in cathedral"])[0]
            model = query.get("model", [None])[0]
            force_offline = query.get("force_offline", ["false"])[0].lower() == "true"

            result = generate_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline)
            self.send_json(result)

        else:
            self.send_json({"error": "Unknown API endpoint", "path": parsed.path}, status_code=404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api"):
            path = path[len("/api"):]

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        if path == "/generate/stream":
            prompt = req_data.get("prompt", "sloth in cathedral")
            model = req_data.get("model", None)
            force_offline = req_data.get("force_offline", False)

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            try:
                for event in stream_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline):
                    msg = f"data: {json.dumps(event)}\n\n"
                    self.wfile.write(msg.encode("utf-8"))
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                pass

        elif path == "/generate":
            prompt = req_data.get("prompt", "sloth in cathedral")
            model = req_data.get("model", None)
            force_offline = req_data.get("force_offline", False)

            result = generate_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline)
            self.send_json(result)

        elif path == "/status":
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
        self.end_headers()
        self.wfile.write(body)
