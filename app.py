import os
import json
from datetime import datetime
from functools import wraps
from flask import Flask, jsonify, request, render_template, redirect, url_for, session

APP = Flask(__name__, static_folder="static", template_folder="templates")
APP.secret_key = os.getenv("FLASK_SECRET", "change-this-secret")

ADMIN_USER = os.getenv("ADMIN_USER", "ADMIN")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin123")

# Mock data file
SITES_JSON = os.path.join(os.path.dirname(__file__), "sites.json")


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get("user"):
            return f(*args, **kwargs)
        return redirect(url_for("login"))
    return wrap


@APP.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username == ADMIN_USER and password == ADMIN_PASS:
            session["user"] = username
            return redirect(url_for("dashboard"))
        return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")


@APP.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@APP.route("/")
@login_required
def dashboard():
    return render_template("dashboard.html")


@APP.route("/api/sites")
@login_required
def api_sites():
    if not os.path.exists(SITES_JSON):
        return jsonify([])
    with open(SITES_JSON, "r") as f:
        data = json.load(f)
    return jsonify(data)


@APP.route("/api/ping/<site_id>", methods=["POST"])
@login_required
def api_ping(site_id):
    return jsonify({"site_id": site_id, "result": "Pinged", "ts": datetime.utcnow().isoformat()})


@APP.route("/api/reboot/<site_id>", methods=["POST"])
@login_required
def api_reboot(site_id):
    return jsonify({"site_id": site_id, "result": "Rebooting", "ts": datetime.utcnow().isoformat()})


if __name__ == "__main__":
    APP.run(host="0.0.0.0", port=8000, debug=False)
