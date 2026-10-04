(function () {
  "use strict";
  if (!matchMedia("(hover: hover)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hero = document.querySelector(".hero");
  if (!hero) return;
  function el(t, c) { var n = document.createElement(t); if (c) n.className = c; return n; }
  var i, j;

  if (!document.querySelector(".bg-dots")) {
    var wrap = el("div", "bg-dots");
    wrap.setAttribute("aria-hidden", "true");
    for (i = 0; i < 14; i++) {
      var d = el("i");
      d.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "%");
      d.style.setProperty("--s", (3 + Math.random() * 4).toFixed(1) + "px");
      d.style.setProperty("--t", (18 + Math.random() * 18).toFixed(1) + "s");
      d.style.setProperty("--dl", (-Math.random() * 30).toFixed(1) + "s");
      d.style.setProperty("--dx", ((Math.random() - 0.5) * 120).toFixed(0) + "px");
      wrap.appendChild(d);
    }
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  if (!hero.querySelector(".cube")) {
    for (i = 1; i <= 2; i++) {
      var c = el("div", "cube cube--" + i), inn = el("div", "cube__in");
      c.setAttribute("aria-hidden", "true");
      for (j = 0; j < 6; j++) inn.appendChild(el("span", "cube__f"));
      c.appendChild(inn);
      hero.appendChild(c);
    }
  }

  var side = document.querySelector(".hero__side"), photo = document.getElementById("photo");
  if (side && photo) {
    side.addEventListener("pointermove", function (e) {
      var r = photo.getBoundingClientRect();
      var x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      var y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      photo.style.setProperty("--ax", (-y).toFixed(2));
      photo.style.setProperty("--ay", x.toFixed(2));
      photo.style.setProperty("--ang", (Math.hypot(x, y) * 9).toFixed(1) + "deg");
    }, { passive: true });
    side.addEventListener("pointerleave", function () { photo.style.setProperty("--ang", "0deg"); });
  }

  if (!hero.querySelector(".net")) {
    var cv = el("canvas", "net"), ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(cv, hero.firstChild);
    var N = 36, pts = [], w = 0, h = 0, cx = 0, cy = 0, tx = 0, ty = 0, mx = -999, my = -999, run = false, vis = true, last = 0, rt = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var init = function () {
      w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = tx = w / 2; cy = ty = h / 2; pts = [];
      for (var k = 0; k < N; k++) pts.push({ x: Math.random() * w, y: Math.random() * h, z: 0.35 + Math.random() * 0.65, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, px: 0, py: 0 });
    };
    var frame = function (t) {
      if (!vis || document.hidden) { run = false; return; }
      requestAnimationFrame(frame);
      if (t - last < 33) return;
      last = t;
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      var ox = (cx - w / 2) * 0.1, oy = (cy - h / 2) * 0.1, p, q, dd;
      ctx.clearRect(0, 0, w, h);
      for (i = 0; i < N; i++) {
        p = pts[i]; p.x += p.vx * p.z; p.y += p.vy * p.z;
        if (p.x < 0 || p.x > w) p.vx = -p.vx;
        if (p.y < 0 || p.y > h) p.vy = -p.vy;
        p.px = p.x + ox * p.z; p.py = p.y + oy * p.z;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < N; i++) {
        p = pts[i];
        for (j = i + 1; j < N; j++) {
          q = pts[j]; dd = Math.hypot(p.px - q.px, p.py - q.py);
          if (dd < 140) {
            ctx.strokeStyle = "rgba(16,185,129," + ((1 - dd / 140) * 0.3 * Math.min(p.z, q.z)).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(q.px, q.py); ctx.stroke();
          }
        }
        dd = Math.hypot(p.px - mx, p.py - my);
        if (dd < 170) {
          ctx.strokeStyle = "rgba(16,185,129," + ((1 - dd / 170) * 0.45).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(mx, my); ctx.stroke();
        }
        ctx.fillStyle = "rgba(16,185,129," + (0.25 + p.z * 0.45).toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(p.px, p.py, 1.2 + p.z * 2, 0, 6.283); ctx.fill();
      }
    };
    var start = function () { if (run || !vis || document.hidden) return; run = true; requestAnimationFrame(frame); };
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(); mx = tx = e.clientX - r.left; my = ty = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { mx = my = -999; tx = w / 2; ty = h / 2; });
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(init, 200); });
    document.addEventListener("visibilitychange", start);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) start(); }).observe(hero);
    init(); start();
  }
})();
