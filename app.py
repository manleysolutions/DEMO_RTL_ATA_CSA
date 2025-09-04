import os, json, io, csv
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv
from flask import (
    Flask, jsonify, request, render_template, redirect,
    url_for, session, send_file, abort
)

# --- App setup ---
load_dotenv()
APP = Flask(__name__, static_folder="static", template_folder="templates")
APP.secret_key = os.getenv("FLASK_SECRET", "dev-secret")

ADMIN_USER = os.getenv("ADMIN_USER", "ADMIN")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin123")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SITES_JSON = os.path.join(DATA_DIR, "sites.json")
LOGS_JSON = os.path.join(DATA_DIR, "logs.json")

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(SITES_JSON):
    with open(SITES_JSON, "w") as f:
        json.dump([], f)

if not os.path.exists(LOGS_JSON):
    with open(LOGS_JSON, "w") as f:
        json.dump([], f)


# --- Auth helper ---
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("login"))
        return fn(*args, **kwargs)
    return wrapper


# --- Routes: Auth / UI ---
@APP.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = request.form.get("username", "").strip()
        p = request.form.get("password", "").strip()
        if u == ADMIN_USER and p == ADMIN_PASS:
            session["user"] = u
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


# --- Helper loaders ---
def _load_sites():
    try:
        with open(SITES_JSON, "r") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def _save_log(entry):
    try:
        with open(LOGS_JSON, "r") as f:
            logs = json.load(f)
            if not isinstance(logs, list):
                logs = []
    except Exception:
        logs = []
    logs.append(entry)
    with open(LOGS_JSON, "w") as f:
        json.dump(logs, f, indent=2)


# --- API: Auth state ---
@APP.route("/api/me")
def api_me():
    if "user" not in session:
        return jsonify({"authenticated": False}), 401
    return jsonify({"authenticated": True, "user": session["user"], "tenant": "USPS"})


# --- API: Sites ---
@APP.route("/api/sites")
@login_required
def api_sites():
    # In the future, hydrate with Telnyx + Inseego. For now, static JSON.
    return jsonify(_load_sites())


@APP.route("/api/map/sites")
@login_required
def api_map_sites():
    items = _load_sites()
    out = []
    for s in items:
        out.append({
            "id": s.get("id"),
            "name": s.get("name", s.get("id")),
            "status": s.get("status"),
            "lat": s.get("lat"),
            "lng": s.get("lng"),
        })
    return jsonify(out)


# --- API: Site lines / logs / reports ---
@APP.route("/api/lines/<site_id>")
@login_required
def api_lines(site_id):
    site = next((s for s in _load_sites() if s.get("id") == site_id), None)
    if not site:
        return jsonify({"error": "Site not found"}), 404
    # Normalize lines to objects
    lines = site.get("fxsLines") or []
    out = []
    for idx, ln in enumerate(lines, start=1):
        out.append({
            "port": idx,
            "label": f"FXS {idx}",
            "number": ln,
            "provider": "Telnyx",
            "status": "registered" if site.get("status") == "online" else "unregistered"
        })
    return jsonify(out)


@APP.route("/api/logs/<site_id>")
@login_required
def api_logs(site_id):
    # Return latest 50 log rows for site (demo: synthesize from lastSync)
    site = next((s for s in _load_sites() if s.get("id") == site_id), None)
    if not site:
        return jsonify([])
    last_sync = site.get("lastSync") or datetime.utcnow().isoformat()
    logs = [
        {"ts": last_sync, "level": "info", "msg": f"{site_id} heartbeat ok"},
        {"ts": last_sync, "level": "info", "msg": f"{site_id} SIP check ok"},
    ]
    return jsonify(logs)


@APP.route("/api/report/<site_id>")
@login_required
def api_report(site_id):
    site = next((s for s in _load_sites() if s.get("id") == site_id), None)
    if not site:
        return jsonify({"error": "Site not found"}), 404

    # Build a tiny CSV report in-memory
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Field", "Value"])
    for k in ["id", "name", "e911Location", "status", "device", "lastSync", "savingsMonthly", "savingsAnnual"]:
        w.writerow([k, site.get(k, "")])
    w.writerow([])
    w.writerow(["Lines"])
    for i, ln in enumerate(site.get("fxsLines", []), start=1):
        w.writerow([f"FXS{i}", ln])

    buf.seek(0)
    return send_file(
        io.BytesIO(buf.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"{site_id}_report.csv",
    )


@APP.route("/api/export/sites")
@login_required
def api_export_sites():
    items = _load_sites()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id","name","status","e911Location","device","fxsCount","lastSync","savingsMonthly","savingsAnnual","lat","lng"])
    for s in items:
        w.writerow([
            s.get("id"), s.get("name"), s.get("status"),
            s.get("e911Location"), s.get("device"),
            len(s.get("fxsLines", [])),
            s.get("lastSync"), s.get("savingsMonthly"), s.get("savingsAnnual"),
            s.get("lat"), s.get("lng")
        ])
    buf.seek(0)
    return send_file(
        io.BytesIO(buf.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name="sites_export.csv",
    )


# --- API: Actions (Ping / Reboot) ---
@APP.route("/api/ping/<site_id>", methods=["POST"])
@login_required
def api_ping(site_id):
    _save_log({"ts": datetime.utcnow().isoformat(), "site": site_id, "action": "ping"})
    return jsonify({"ok": True, "site_id": site_id, "result": "pinged"})


@APP.route("/api/reboot/<site_id>", methods=["POST"])
@login_required
def api_reboot(site_id):
    _save_log({"ts": datetime.utcnow().isoformat(), "site": site_id, "action": "reboot"})
    return jsonify({"ok": True, "site_id": site_id, "result": "reboot_queued"})


@APP.route("/healthz")
def healthz():
    return "ok", 200


if __name__ == "__main__":
    APP.run(host="0.0.0.0", port=8000, debug=False)
