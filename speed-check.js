(function () {
  "use strict";
  var API_KEY = ""; // اختياري: مفتاح PageSpeed Insights مجاني من Google
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  var lang = "ar", theme = "dark", strategy = "mobile", busy = false;
  try {
    var sl = localStorage.getItem("lang"), st = localStorage.getItem("theme2");
    if (sl === "ar" || sl === "en") lang = sl;
    if (st === "dark" || st === "light") theme = st;
  } catch (e) {}

  var T = {
    ar: {
      doc: "افحص سرعة موقعك مجاناً | حازم مصطفى", back: "← العودة للموقع", title: "افحص سرعة موقعك",
      sub: "اكتب رابط أي موقع، وهنعرض لك درجة الأداء وأهم المشاكل اللي بتبطّئه.",
      ph: "https://example.com", go: "افحص", mob: "موبايل", desk: "كمبيوتر",
      loading: "جاري الفحص... ممكن ياخد لحد دقيقة.",
      invalid: "اكتب رابط صحيح، زي example.com",
      quota: "الخدمة مزدحمة دلوقتي. جرّب بعد دقيقة، أو افحص الموقع من pagespeed.web.dev.",
      bad: "مقدرناش نفحص الموقع ده. اتأكد إنه شغال ومفتوح للعامة.",
      fail: "حصل خطأ في الاتصال. جرّب تاني.", timeout: "الفحص أخد وقت طويل. جرّب تاني.",
      mt: "المقاييس", it: "أهم المشاكل", none: "مفيش مشاكل كبيرة ظاهرة. ممتاز!",
      cta: "عايز تحسّن سرعة موقعك؟ ابعتلي وأقولك نبدأ منين.", wab: "كلّمني على واتساب",
      full: "التقرير الكامل من Google",
      wa: "السلام عليكم، فحصت موقع {u} بأداة السرعة وطلعت درجة الأداء {s}. ممكن تساعدني أحسّنه؟",
      note: "الفحص بيتم عن طريق Google PageSpeed Insights والنتايج تقريبية وبتتغيّر من مرة للتانية. الرابط اللي بتكتبه بيتبعت لـ Google ومش بنحفظه.",
      sp: "الأداء", sa: "إمكانية الوصول", sb: "أفضل الممارسات", ss: "السيو"
    },
    en: {
      doc: "Free website speed check | Hazem Mostafa", back: "← Back to site", title: "Check your website speed",
      sub: "Enter any website URL and get its performance score and the top issues slowing it down.",
      ph: "https://example.com", go: "Check", mob: "Mobile", desk: "Desktop",
      loading: "Checking... this can take up to a minute.",
      invalid: "Enter a valid URL, like example.com",
      quota: "The service is busy right now. Try again in a minute, or use pagespeed.web.dev.",
      bad: "We could not check this site. Make sure it is online and public.",
      fail: "Connection error. Please try again.", timeout: "The check took too long. Please try again.",
      mt: "Metrics", it: "Top issues", none: "No major issues found. Great!",
      cta: "Want a faster website? Message me and I will tell you where to start.", wab: "Message me on WhatsApp",
      full: "Full report from Google",
      wa: "Hello, I checked {u} with your speed tool and got a performance score of {s}. Can you help me improve it?",
      note: "The check runs through Google PageSpeed Insights. Results are approximate and vary between runs. The URL you enter is sent to Google and is not stored by us.",
      sp: "Performance", sa: "Accessibility", sb: "Best practices", ss: "SEO"
    }
  };
  function t(k) { return T[lang][k]; }

  function applyLang() {
    var d = T[lang];
    root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = d.doc;
    $("back").textContent = d.back; $("h1").textContent = d.title; $("sub").textContent = d.sub;
    $("u").placeholder = d.ph; $("go").textContent = d.go; $("sm").textContent = d.mob; $("sd").textContent = d.desk;
    $("note").textContent = d.note; $("lng").textContent = lang === "ar" ? "EN" : "AR";
    $("mt").textContent = d.mt; $("it").textContent = d.it; $("ctat").textContent = d.cta;
    $("wa").textContent = d.wab; $("full").textContent = d.full;
  }

  function say(text, bad, spin) {
    var m = $("msg");
    m.textContent = text;
    m.className = (bad ? "bad " : "") + (spin ? "spin" : "");
  }

  function normalize(raw) {
    var u = String(raw || "").trim();
    if (!u || u.length > 300) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      var x = new URL(u);
      if (x.protocol !== "https:" && x.protocol !== "http:") return "";
      if (x.hostname.indexOf(".") === -1) return "";
      return x.href;
    } catch (e) { return ""; }
  }

  function run(url) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 70000);
    var q = "url=" + encodeURIComponent(url) + "&strategy=" + strategy + "&locale=" + lang +
      "&category=performance&category=accessibility&category=best-practices&category=seo";
    if (API_KEY) q += "&key=" + encodeURIComponent(API_KEY);
    return fetch("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?" + q,
      { signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer" })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) { var e = new Error("http"); e.status = r.status; throw e; }
        return r.json();
      }, function (e) { clearTimeout(timer); throw e; });
  }

  function errText(err) {
    if (err && err.name === "AbortError") return t("timeout");
    var s = err && err.status;
    if (s === 429) return t("quota");
    if (s === 400) return t("bad");
    if (s >= 500) return t("quota");
    return t("fail");
  }

  function level(n) { return n >= 90 ? "good" : n >= 50 ? "mid" : "bad"; }
  var COLOR = { good: "var(--g)", mid: "var(--o)", bad: "var(--r)" };

  function waLink(url, perf) {
    var base = (typeof CONFIG !== "undefined" && CONFIG.links && CONFIG.links.whatsapp) || "";
    if (!/^https:\/\/wa\.me\/\d{6,15}$/.test(base)) return "";
    var txt = t("wa").replace("{u}", function () { return url; }).replace("{s}", function () { return perf === null ? "-" : String(perf); });
    return base + "?text=" + encodeURIComponent(txt);
  }

  function render(url, data) {
    var lh = data && data.lighthouseResult;
    if (!lh || !lh.categories || !lh.audits) { var er = new Error("bad"); er.status = 400; throw er; }
    var sc = $("scores"); sc.textContent = "";
    var perf = null;
    [["performance", "sp"], ["accessibility", "sa"], ["best-practices", "sb"], ["seo", "ss"]].forEach(function (c) {
      var cat = lh.categories[c[0]];
      var n = cat && typeof cat.score === "number" ? Math.round(cat.score * 100) : null;
      if (c[0] === "performance") perf = n;
      var box = document.createElement("div"); box.className = "sc";
      var ring = document.createElement("div"); ring.className = "ring";
      var b = document.createElement("b"); b.textContent = n === null ? "-" : String(n);
      ring.appendChild(b);
      ring.style.setProperty("--p", n === null ? 0 : n);
      ring.style.setProperty("--c", n === null ? "var(--b)" : COLOR[level(n)]);
      var lab = document.createElement("span"); lab.textContent = t(c[1]);
      box.appendChild(ring); box.appendChild(lab); sc.appendChild(box);
    });

    var ml = $("metrics"); ml.textContent = "";
    ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"].forEach(function (id) {
      var a = lh.audits[id]; if (!a) return;
      var li = document.createElement("li");
      if (typeof a.score === "number") li.setAttribute("data-l", level(a.score * 100));
      var nm = document.createElement("span"); nm.textContent = a.title || id;
      var v = document.createElement("strong"); v.textContent = a.displayValue || "-"; v.dir = "ltr";
      li.appendChild(nm); li.appendChild(v); ml.appendChild(li);
    });

    var refs = (lh.categories.performance && lh.categories.performance.auditRefs) || [];
    var list = [];
    refs.forEach(function (r) {
      var a = lh.audits[r.id];
      if (!a || r.group === "metrics" || typeof a.score !== "number" || a.score >= 0.9) return;
      var save = a.details && typeof a.details.overallSavingsMs === "number" ? a.details.overallSavingsMs : 0;
      list.push({ a: a, s: save });
    });
    list.sort(function (x, y) { return (y.s - x.s) || (x.a.score - y.a.score); });
    var il = $("issues"); il.textContent = "";
    list.slice(0, 3).forEach(function (o) {
      var li = document.createElement("li");
      var h = document.createElement("strong"); h.textContent = o.a.title || ""; li.appendChild(h);
      if (o.a.displayValue) { var dv = document.createElement("em"); dv.textContent = o.a.displayValue; li.appendChild(dv); }
      var p = document.createElement("p");
      p.textContent = String(o.a.description || "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").slice(0, 180);
      li.appendChild(p); il.appendChild(li);
    });
    if (!list.length) { var l0 = document.createElement("li"); l0.textContent = t("none"); il.appendChild(l0); }

    var wa = $("wa"), href = waLink(url, perf);
    if (href) { wa.href = href; wa.hidden = false; } else { wa.hidden = true; }
    $("full").href = "https://pagespeed.web.dev/analysis?url=" + encodeURIComponent(url) + "&form_factor=" + strategy;
    $("res").hidden = false;
    $("res").scrollIntoView({ block: "start" });
  }

  $("lng").addEventListener("click", function () {
    lang = lang === "ar" ? "en" : "ar";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    $("res").hidden = true; say("", false);
    applyLang();
  });
  $("thm").addEventListener("click", function () {
    theme = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme2", theme); } catch (e) {}
    root.setAttribute("data-theme", theme);
  });
  $("seg").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-s]");
    if (!b) return;
    strategy = b.getAttribute("data-s");
    Array.prototype.forEach.call($("seg").children, function (x) { x.classList.toggle("on", x === b); });
  });
  $("f").addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var url = normalize($("u").value);
    if (!url) { say(t("invalid"), true); return; }
    busy = true; $("go").disabled = true; $("res").hidden = true;
    say(t("loading"), false, true);
    run(url).then(function (data) { render(url, data); say("", false); })
      .catch(function (err) { say(errText(err), true); })
      .then(function () { setTimeout(function () { busy = false; $("go").disabled = false; }, 4000); });
  });

  root.setAttribute("data-theme", theme);
  applyLang();
})();
