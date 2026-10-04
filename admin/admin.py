import json, os, shutil, uuid
from flask import Flask, request, jsonify, send_file, send_from_directory

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(BASE)
DATA = os.path.join(BASE, "data.json")
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

def S(name, slug, ar, en, inv=False):
    s = {"name": name, "icon": f"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{slug}/{slug}-original.svg", "desc": {"ar": ar, "en": en}}
    if inv: s["darkInvert"] = True
    return s

DEFAULTS = {
    "site": {"domain": "", "defaultLang": "ar", "defaultTheme": "dark",
             "title": {"ar": "حازم مصطفى | مهندس برمجيات", "en": "Hazem Mostafa | Software Engineer"},
             "description": {"ar": "", "en": ""}},
    "profile": {"name": {"ar": "حازم مصطفى", "en": "Hazem Mostafa"},
                "title": {"ar": "مهندس برمجيات متكامل", "en": "Full-Stack Software Engineer"},
                "bio": {"ar": "", "en": ""}, "photo": ""},
    "links": {"whatsapp": "", "email": "", "github": "", "linkedin": ""},
    "status": {"state": "available", "availableAgainAt": "",
               "text": {"available": {"ar": "متاح للتطوير الآن", "en": "Available for development"},
                        "busy": {"ar": "غير متاح حالياً", "en": "Currently unavailable"}},
               "countdownLabel": {"ar": "هكون متاح بعد", "en": "Available again in"},
               "contactText": {"ar": "متاح للتواصل والاستفسارات", "en": "Open for contact & inquiries"}},
    "skills": [S("HTML", "html5", "هيكلة الصفحات", "Page structure"),
               S("JavaScript", "javascript", "برمجة الواجهات", "Interactive front-end"),
               S("TypeScript", "typescript", "أمان الأنواع", "Type safety"),
               S("Next.js", "nextjs", "تطبيقات ويب حديثة", "Modern web apps", True),
               S("Python", "python", "الخلفية والمنطق البرمجي", "Backend & core logic")],
    "projects": [],
    "countdownProjectLabel": {"ar": "ينتهي بعد", "en": "Finishes in"},
    "contactForm": {"provider": "", "endpoint": ""},
}

def load():
    if os.path.exists(DATA):
        with open(DATA, encoding="utf-8") as f:
            return json.load(f)
    return DEFAULTS

def write_config(d):
    path = os.path.join(SITE, "config.js")
    backup = os.path.join(SITE, "config.backup.js")
    if os.path.exists(path) and not os.path.exists(backup):
        shutil.copy(path, backup)
    with open(path, "w", encoding="utf-8") as f:
        f.write("/* ملف مُولَّد تلقائياً من لوحة التحكم (admin). عدّل من اللوحة مش من هنا. */\n")
        f.write("const CONFIG = " + json.dumps(d, ensure_ascii=False, indent=2) + ";\n")

@app.get("/")
def home():
    return send_file(os.path.join(BASE, "panel.html"))

@app.get("/images/<path:p>")
def images(p):
    return send_from_directory(os.path.join(SITE, "images"), p)

@app.get("/api/data")
def get_data():
    return jsonify(load())

@app.post("/api/save")
def save():
    d = request.get_json(force=True)
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    write_config(d)
    return jsonify(ok=True)

@app.post("/api/upload")
def upload():
    f = request.files.get("file")
    if not f:
        return jsonify(error="مفيش ملف"), 400
    ext = os.path.splitext(f.filename)[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        return jsonify(error="الصيغة مش مدعومة (png, jpg, webp, gif)"), 400
    sub = "projects" if request.args.get("kind") == "project" else ""
    folder = os.path.join(SITE, "images", sub)
    os.makedirs(folder, exist_ok=True)
    name = ("p-" if sub else "me-") + uuid.uuid4().hex[:8] + ext
    f.save(os.path.join(folder, name))
    return jsonify(path="images/" + (sub + "/" if sub else "") + name)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
