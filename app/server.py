"""
Compline Gothic Wind-Down Companion HTTP Server
Serves the Classical Gothic UI and provides local Gemma story generation endpoints.
100% Python Standard Library (no external pip dependencies required to launch).
"""

import os
import sys
import json
import gzip
import hashlib
import mimetypes
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse

from gemma_engine import generate_gothic_story, stream_gothic_story, check_ollama_status

PORT = 7777
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("audio/mpeg", ".mp3")


class GothicServerHandler(BaseHTTPRequestHandler):
    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError):
            pass

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self.serve_file(os.path.join(TEMPLATES_DIR, "index.html"), "text/html")
        elif path.startswith("/static/"):
            rel_path = path[len("/static/"):]
            file_path = os.path.join(STATIC_DIR, rel_path)
            self.serve_file(file_path)
        elif path == "/api/status":
            ollama_info = check_ollama_status()
            data = {
                "app": "Compline: Gothic Wind-Down Companion",
                "theme": "Classical Gothic / Slow and Steady (Hacktoberfest Week 3)",
                "ollama": ollama_info,
                "offline_ready": True
            }
            self.send_json(data)
        elif path == "/api/generate/stream":
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
            return
        else:
            self.send_error(404, "Page not found in this ancient crypt")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        if path == "/api/generate/stream":
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
            return

        elif path == "/api/generate":
            prompt = req_data.get("prompt", "sloth in cathedral")
            model = req_data.get("model", None)
            force_offline = req_data.get("force_offline", False)

            result = generate_gothic_story(prompt=prompt, preferred_model=model, force_offline=force_offline)
            self.send_json(result)

        else:
            self.send_error(404, "Endpoint not found")

    def serve_file(self, file_path, content_type=None):
        if not os.path.isfile(file_path):
            self.send_error(404, "File not found")
            return

        if not content_type:
            content_type, _ = mimetypes.guess_type(file_path)
            content_type = content_type or "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            etag = f'"{hashlib.sha1(content).hexdigest()}"'
            client_etag = self.headers.get("If-None-Match")
            if client_etag and client_etag == etag:
                self.send_response(304)
                self.send_cors_headers()
                self.send_header("ETag", etag)
                self.end_headers()
                return

            # Smart caching policy: HTML re-validates, static assets cached aggressively
            is_html = content_type.startswith("text/html")
            cache_control = "no-cache, must-revalidate" if is_html else "public, max-age=86400, stale-while-revalidate=604800"

            accept_encoding = self.headers.get("Accept-Encoding", "")
            can_gzip = "gzip" in accept_encoding and (
                content_type.startswith("text/")
                or content_type in ("application/javascript", "application/json", "image/svg+xml")
            )

            if can_gzip and len(content) > 256:
                compressed = gzip.compress(content, compresslevel=6)
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Content-Length", str(len(compressed)))
                self.send_header("Cache-Control", cache_control)
                self.send_header("ETag", etag)
                self.send_header("Vary", "Accept-Encoding")
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(compressed)
            else:
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", cache_control)
                self.send_header("ETag", etag)
                self.send_header("Vary", "Accept-Encoding")
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(content)
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        accept_encoding = self.headers.get("Accept-Encoding", "")
        if "gzip" in accept_encoding and len(body) > 256:
            compressed = gzip.compress(body, compresslevel=6)
            self.send_response(status)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Length", str(len(compressed)))
            self.send_header("Vary", "Accept-Encoding")
            self.end_headers()
            self.wfile.write(compressed)
        else:
            self.send_response(status)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Vary", "Accept-Encoding")
            self.end_headers()
            self.wfile.write(body)


def run_server(port=PORT):
    server_address = ("", port)
    httpd = ThreadingHTTPServer(server_address, GothicServerHandler)
    print(f"============================================================")
    print(f"   🦇 SLOTH LULLABY — CLASSICAL GOTHIC WIND-DOWN COMPANION   ")
    print(f"============================================================")
    print(f"  • Sacred Portal : http://localhost:{port}")
    print(f"  • Theme         : Classical Gothic & Slow/Steady Sloth Day")
    print(f"  • Status        : Running quietly in the abbey undercroft")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nExtinguishing the abbey candles. Goodnight.")
        httpd.server_close()


if __name__ == "__main__":
    p = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        p = int(sys.argv[1])
    run_server(p)
