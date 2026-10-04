/* app.js — المنطق: اللغة، الوضع، العدادات، رسم المهارات والمشاريع، الفورم */
(function () {
	"use strict";

	if (typeof CONFIG === "undefined") {
		document.body.insertAdjacentHTML("afterbegin",
			'<p style="padding:20px;color:#f87171">config.js مش متحمّل. اتأكد إنه في نفس الفولدر.</p>');
		return;
	}
	var C = CONFIG;
	var root = document.documentElement;

	/* ---------- نصوص الواجهة ---------- */
	var T = {
		ar: {
			skip: "تخطّي إلى المحتوى", nav_home: "الرئيسية", nav_skills: "المهارات", nav_projects: "المشاريع", nav_contact: "تواصل معي",
			cta_contact: "تواصل معي مباشرة", cta_projects: "استعراض المشاريع",
			skills_title: "المهارات والتقنيات", skills_sub: "الأدوات واللغات اللي بشتغل بيها.",
			projects_title: "المشاريع والأعمال", projects_sub: "نماذج من اللي اشتغلت عليه.", projects_empty: "المشاريع هتتضاف قريباً.",
			contact_title: "تواصل معي", f_name: "الاسم", f_email: "البريد الإلكتروني", f_message: "الرسالة", f_send: "إرسال", back_top: "للأعلى ↑",
			done: "منتهي", progress: "قيد التنفيذ", live: "المعاينة", repo: "الكود", unit: "ي",
			sending: "جاري الإرسال...", sent: "تم الإرسال، شكراً ليك!", err: "حصل خطأ، جرّب تاني.",
			invalid: "من فضلك املأ كل الحقول بشكل صحيح.", noContact: "بيانات التواصل لسه متحطتش.",
			whatsapp: "واتساب", email: "البريد الإلكتروني"
		},
		en: {
			skip: "Skip to content", nav_home: "Home", nav_skills: "Skills", nav_projects: "Projects", nav_contact: "Contact",
			cta_contact: "Contact me directly", cta_projects: "View projects",
			skills_title: "Skills & Technologies", skills_sub: "The tools and languages I work with.",
			projects_title: "Projects & Work", projects_sub: "Selected things I've built.", projects_empty: "Projects coming soon.",
			contact_title: "Contact me", f_name: "Name", f_email: "Email", f_message: "Message", f_send: "Send", back_top: "Back to top ↑",
			done: "Completed", progress: "In progress", live: "Live demo", repo: "Source", unit: "d",
			sending: "Sending...", sent: "Sent, thank you!", err: "Something went wrong, try again.",
			invalid: "Please fill in all fields correctly.", noContact: "Contact details are not set yet.",
			whatsapp: "WhatsApp", email: "Email"
		}
	};

	var lang = "ar", theme = "dark";
	try { lang = localStorage.getItem("lang") || C.site.defaultLang || "ar"; theme = localStorage.getItem("theme2") || C.site.defaultTheme || "dark"; } catch (e) {}

	function t(k) { return T[lang][k] || k; }
	function L(o) { return o ? (o[lang] || o.ar || o.en || "") : ""; }
	function $(id) { return document.getElementById(id); }
	function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

	/* ---------- العدادات ---------- */
	var timers = [];
	function pad(n) { return (n < 10 ? "0" : "") + n; }
	function fmt(ms) {
		var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
		return d + t("unit") + " " + pad(h) + ":" + pad(m) + ":" + pad(s % 60);
	}
	function addTimer(node, iso) { timers.push({ node: node, end: Date.parse(iso) }); }
	function tick() {
		var now = Date.now();
		timers.forEach(function (x) {
			var left = x.end - now;
			if (left <= 0) { x.node.parentElement.hidden = true; } else { x.node.textContent = fmt(left); }
		});
	}
	function futureDate(iso) { var d = Date.parse(iso || ""); return !isNaN(d) && d > Date.now(); }

	/* ---------- الحالة ---------- */
	function renderStatus() {
		var s = C.status, busy = s.state === "busy", key = busy ? "busy" : "available";
		$("status").dataset.state = key;
		$("brandDot").dataset.state = key;
		$("statusText").textContent = L(s.text[key]);
		var box = $("statusCountdown");
		if (busy && futureDate(s.availableAgainAt)) {
			box.hidden = false;
			$("statusCountdownLabel").textContent = L(s.countdownLabel);
			addTimer($("statusCountdownTime"), s.availableAgainAt);
		} else { box.hidden = true; }
		$("contactStatusText").textContent = L(s.contactText);
	}

	/* ---------- الصورة ---------- */
	function renderPhoto() {
		var box = $("photo"); box.textContent = "";
		if (C.profile.photo) {
			var img = el("img"); img.src = C.profile.photo; img.alt = L(C.profile.name); img.width = 320; img.height = 320;
			img.onerror = function () { box.textContent = ""; box.appendChild(initials()); };
			box.appendChild(img);
		} else { box.appendChild(initials()); }
	}
	function initials() {
		var w = (C.profile.name.en || "").trim().split(/\s+/).slice(0, 2);
		return el("span", "photo__initials", w.map(function (x) { return x.charAt(0).toUpperCase(); }).join("") || "•");
	}

	/* ---------- المهارات ---------- */
	function renderSkills() {
		var g = $("skillsGrid"); g.textContent = "";
		C.skills.forEach(function (s) {
			var card = el("article", "skill-card"), ic = el("div", "skill-card__icon"), img = el("img", s.darkInvert ? "invert-dark" : "");
			iconFallback(img);
			img.src = s.icon; img.alt = s.name; img.loading = "lazy"; img.width = 40; img.height = 40;
			ic.appendChild(img);
			card.appendChild(ic); card.appendChild(el("h3", "skill-card__name", s.name)); card.appendChild(el("p", "skill-card__desc", L(s.desc)));
			g.appendChild(card);
		});
	}

	/* ---------- المشاريع ---------- */
	function link(href, text) { var a = el("a", "", text); a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer"; return a; }
	function renderProjects() {
		var g = $("projectsGrid"); g.textContent = "";
		$("projectsEmpty").hidden = C.projects.length > 0;
		C.projects.forEach(function (p) {
			var card = el("article", "project-card");
			if (p.image) { var img = el("img", "project-card__img"); img.src = p.image; img.alt = L(p.title); img.loading = "lazy"; img.onerror = function () { img.remove(); }; card.appendChild(img); }
			var body = el("div", "project-card__body"), top = el("div", "project-card__top");
			var prog = p.status === "in-progress", badge = el("span", "project-card__status", prog ? t("progress") : t("done"));
			badge.dataset.state = prog ? "in-progress" : "done";
			top.appendChild(el("h3", "project-card__title", L(p.title))); top.appendChild(badge);
			body.appendChild(top); body.appendChild(el("p", "project-card__desc", L(p.description)));
			if (p.tech && p.tech.length) { var tech = el("div", "project-card__tech"); p.tech.forEach(function (x) { tech.appendChild(el("span", "chip", x)); }); body.appendChild(tech); }
			if (prog && futureDate(p.finishAt)) {
				var cd = el("div", "project-countdown"), tm = el("span", "project-countdown__time"); tm.dir = "ltr";
				cd.appendChild(el("span", "", L(C.countdownProjectLabel))); cd.appendChild(tm); body.appendChild(cd); addTimer(tm, p.finishAt);
			}
			var ls = el("div", "project-card__links");
			if (p.links && p.links.live) ls.appendChild(link(p.links.live, t("live")));
			if (p.links && p.links.repo) ls.appendChild(link(p.links.repo, t("repo")));
			if (ls.children.length) body.appendChild(ls);
			card.appendChild(body); g.appendChild(card);
		});
	}

	/* ---------- روابط التواصل ---------- */
	var ICONS = {
		whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',
		email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
		github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4 1.3-4-2-6-2.5m12 5v-3.5c0-1 .1-1.400-.5-2 2.800-.3 5.500-1.400 5.500-6a4.600 4.600 0 0 0-1.300-3.200 4.200 4.200 0 0 0-.1-3.200s-1.100-.3-3.500 1.300a12 12 0 0 0-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 0 0-.1 3.200A4.600 4.600 0 0 0 4 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21"/></svg>',
		linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>'
	};
	function shown(key, url) {
		if (key === "whatsapp") { var d = url.replace(/\D/g, ""); return d ? "+" + d : url; }
		if (key === "email") return url.replace(/^mailto:/i, "").split("?")[0];
		return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
	}
	function renderContactLinks() {
		var box = $("contactLinks"); box.textContent = "";
		["whatsapp", "email", "github", "linkedin"].forEach(function (k) {
			var url = C.links[k]; if (!url) return;
			var a = el("a", "contact-link"); a.href = url;
			if (k !== "email") { a.target = "_blank"; a.rel = "noopener noreferrer"; }
			var ic = el("span", "contact-link__icon"); ic.innerHTML = ICONS[k];
			var tx = el("span"); tx.appendChild(el("span", "contact-link__label", k === "github" ? "GitHub" : k === "linkedin" ? "LinkedIn" : t(k)));
			tx.appendChild(el("span", "contact-link__value", shown(k, url)));
			a.appendChild(ic); a.appendChild(tx); box.appendChild(a);
		});
		box.hidden = !box.children.length;
	}

	/* ---------- SEO ---------- */
	function meta(sel, attr, val) { var n = document.querySelector(sel); if (n) n.setAttribute(attr, val); }
	function renderSEO() {
		var title = L(C.site.title), desc = L(C.site.description) || L(C.profile.bio), dom = (C.site.domain || "").replace(/\/$/, "");
		document.title = title;
		meta('meta[name="description"]', "content", desc);
		meta('meta[property="og:title"]', "content", title);
		meta('meta[property="og:description"]', "content", desc);
		if (dom) {
			meta('link[rel="canonical"]', "href", dom + "/");
			meta('meta[property="og:url"]', "content", dom + "/");
			if (C.profile.photo) meta('meta[property="og:image"]', "content", dom + "/" + C.profile.photo.replace(/^\//, ""));
		}
		var same = [C.links.github, C.links.linkedin].filter(Boolean);
		$("jsonld").textContent = JSON.stringify({
			"@context": "https://schema.org", "@type": "Person",
			name: L(C.profile.name), jobTitle: L(C.profile.title), url: dom || undefined,
			image: dom && C.profile.photo ? dom + "/" + C.profile.photo.replace(/^\//, "") : undefined, sameAs: same
		});
	}

	/* ---------- تطبيق اللغة والوضع ---------- */
	function applyLang() {
		root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
		$("langBtn").textContent = lang === "ar" ? "EN" : "AR";
		document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
		document.querySelectorAll("[data-bind]").forEach(function (n) { n.textContent = L(C.profile[n.getAttribute("data-bind")]); });
		timers = [];
		renderStatus(); renderPhoto(); renderSkills(); renderProjects(); renderContactLinks(); renderSEO(); tick(); setupReveal(); renderFab();
	}
	function applyTheme() { root.setAttribute("data-theme", theme); }

	$("langBtn").addEventListener("click", function () {
		lang = lang === "ar" ? "en" : "ar";
		try { localStorage.setItem("lang", lang); } catch (e) {}
		applyLang();
	});
	$("themeBtn").addEventListener("click", function () {
		theme = theme === "dark" ? "light" : "dark";
		try { localStorage.setItem("theme2", theme); } catch (e) {}
		applyTheme();
	});

	/* ---------- قائمة الموبايل ---------- */
	var menuBtn = $("menuBtn"), nav = $("nav");
	function setMenu(open) {
		nav.classList.toggle("is-open", open);
		menuBtn.classList.toggle("is-active", open);
		menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
	}
	menuBtn.addEventListener("click", function (e) { e.stopPropagation(); setMenu(!nav.classList.contains("is-open")); });
	nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
	document.addEventListener("click", function (e) { if (!nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false); });
	document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
	window.addEventListener("resize", function () { if (window.innerWidth > 760) setMenu(false); });

	/* ---------- فورم التواصل ---------- */
	var form = $("contactForm"), msg = $("formMsg");
	function say(text, cls) { msg.textContent = text; msg.className = "form__msg" + (cls ? " " + cls : ""); }
	form.addEventListener("submit", function (e) {
		e.preventDefault();
		var d = { name: form.name.value.trim(), email: form.email.value.trim(), message: form.message.value.trim() };
		if (!d.name || !d.message || !/^\S+@\S+\.\S+$/.test(d.email)) { say(t("invalid"), "is-error"); return; }

		// فورمسبري: لو حطيت الرابط في config.js
		if (C.contactForm.provider === "formspree" && C.contactForm.endpoint) {
			say(t("sending"));
			fetch(C.contactForm.endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
				.then(function (r) { if (!r.ok) throw 0; form.reset(); say(t("sent"), "is-ok"); })
				.catch(function () { say(t("err"), "is-error"); });
			return;
		}
		// الافتراضي: يفتح تطبيق الإيميل على رابط الإيميل اللي في config.js (EmailJS هنضيفه لما نقرر)
		var to = (C.links.email || "").replace(/^mailto:/i, "").split("?")[0];
		if (!to) { say(t("noContact"), "is-error"); return; }
		var body = d.message + "\n\n— " + d.name + " (" + d.email + ")";
		window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Portfolio: " + d.name) + "&body=" + encodeURIComponent(body);
		say(t("sent"), "is-ok");
	});

	/* ---------- حركات الظهور عند النزول ---------- */
	var io = null;
	function setupReveal() {
		if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (!io) {
			io = new IntersectionObserver(function (entries) {
				entries.forEach(function (en) {
					if (!en.isIntersecting) return;
					var n = en.target; io.unobserve(n);
					n.classList.add("is-visible");
					setTimeout(function () { n.classList.remove("reveal", "is-visible"); n.style.removeProperty("--d"); }, 1600);
				});
			}, { threshold: 0.12 });
		}
		document.querySelectorAll(".section__head, .skill-card, .project-card, .contact-link, .form, .empty").forEach(function (n) {
			if (n.dataset.seen) return;
			n.dataset.seen = "1";
			var i = Array.prototype.indexOf.call(n.parentNode.children, n);
			n.style.setProperty("--d", Math.min(i * 0.08, 0.4) + "s");
			n.classList.add("reveal");
			io.observe(n);
		});
	}
	/* ---------- زرار واتساب العائم (بيظهر بس لو حطيت رقم في اللوحة) ---------- */
	var fab = null;
	function renderFab() {
		var url = C.links.whatsapp;
		if (!url) { if (fab) { fab.remove(); fab = null; } return; }
		if (!fab) {
			fab = el("a", "wa-fab");
			fab.target = "_blank"; fab.rel = "noopener noreferrer";
			fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z"/><g transform="translate(7.2 6.7) scale(.4)"><path stroke-width="3.6" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></g></svg>';
			document.body.appendChild(fab);
		}
		fab.href = url;
		fab.setAttribute("aria-label", t("whatsapp"));
	}

	/* ---------- تلوين رابط القسم الحالي في القائمة ---------- */
	function setupSpy() {
		if (!("IntersectionObserver" in window)) return;
		var links = {};
		nav.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
				var a = links[en.target.id];
				if (a) a.setAttribute("aria-current", "true");
			});
		}, { rootMargin: "-45% 0px -50% 0px" });
		["home", "skills", "projects", "contact"].forEach(function (id) { var s = $(id); if (s) spy.observe(s); });
	}
	/* ---------- ظل الشريط العلوي عند النزول ---------- */
	function setupHeaderShadow() {
		var h = document.querySelector(".header"), busy = false;
		if (!h) return;
		function upd() { h.classList.toggle("is-scrolled", window.scrollY > 8); busy = false; }
		window.addEventListener("scroll", function () { if (!busy) { busy = true; requestAnimationFrame(upd); } }, { passive: true });
		upd();
	}

	/* ---------- أشكال هندسية عائمة في الرئيسية ---------- */
	function setupShapes() {
		var hero = document.querySelector(".hero");
		if (!hero || hero.querySelector(".shapes")) return;
		var wrap = el("div", "shapes");
		wrap.setAttribute("aria-hidden", "true");
		for (var i = 1; i <= 3; i++) wrap.appendChild(el("span", "shape shape--" + i));
		hero.appendChild(wrap);
	}

	/* ---------- نور الكروت + ميلة المشاريع (للماوس بس) ---------- */
	function setupPointerFx() {
		if (!window.matchMedia("(hover: hover)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		var raf = 0, ev = null;
		document.addEventListener("pointermove", function (e) {
			ev = e;
			if (raf) return;
			raf = requestAnimationFrame(function () {
				raf = 0;
				if (!ev.target || !ev.target.closest) return;
				var card = ev.target.closest(".skill-card, .project-card, .contact-link");
				if (!card) return;
				var r = card.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
				card.style.setProperty("--mx", x + "px");
				card.style.setProperty("--my", y + "px");
				if (card.classList.contains("project-card")) {
					card.style.setProperty("--rx", ((0.5 - y / r.height) * 6).toFixed(2) + "deg");
					card.style.setProperty("--ry", ((x / r.width - 0.5) * 6).toFixed(2) + "deg");
				}
			});
		}, { passive: true });
		document.addEventListener("pointerout", function (e) {
			var c = e.target && e.target.closest ? e.target.closest(".project-card") : null;
			if (c && !c.contains(e.relatedTarget)) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
		});
	}

	/* ---------- حركة تبديل الوضع ---------- */
	$("themeBtn").addEventListener("click", function () {
		var b = this;
		root.classList.add("theme-fade");
		b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
		setTimeout(function () { root.classList.remove("theme-fade"); b.classList.remove("spin"); }, 450);
	});
	/* ---------- لو اللوجو مش اتحمّل: جرّب النسخة التانية، وإلا اخفيه ---------- */
	function iconFallback(img) {
		img.onerror = function () {
			img.onerror = null;
			var s = img.src, alt = s.indexOf("-original.svg") > -1 ? s.replace("-original.svg", "-plain.svg")
						  : s.indexOf("-plain.svg") > -1 ? s.replace("-plain.svg", "-original.svg") : "";
			if (alt) { img.onerror = function () { img.style.visibility = "hidden"; }; img.src = alt; }
			else img.style.visibility = "hidden";
		};
	}

	/* ---------- شريط المهارات المتحرك ---------- */
	function setupMarquee() {
		var hero = document.querySelector(".hero");
		if (!hero || document.querySelector(".marquee") || !C.skills.length) return;
		var wrap = el("div", "marquee"), track = el("div", "marquee__track");
		wrap.setAttribute("aria-hidden", "true");
		for (var r = 0; r < 4; r++) {
			C.skills.forEach(function (s) {
				var it = el("span", "marquee__item");
				if (s.icon) {
					var im = el("img", s.darkInvert ? "invert-dark" : "");
					iconFallback(im);
					im.src = s.icon; im.alt = ""; im.loading = "lazy"; im.width = 26; im.height = 26;
					it.appendChild(im);
				}
				it.appendChild(document.createTextNode(s.name));
				track.appendChild(it);
			});
		}
		wrap.appendChild(track);
		hero.insertAdjacentElement("afterend", wrap);
	}

	/* ---------- تشغيل ---------- */
	$("year").textContent = new Date().getFullYear();
	applyTheme(); applyLang(); setupSpy(); setupHeaderShadow(); setupShapes(); setupPointerFx(); setupMarquee();
	setInterval(tick, 1000);
})();
