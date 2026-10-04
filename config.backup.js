/* ==========================================================
   config.js — ملف التحكم الوحيد في الموقع
   كل حاجة بتتغير من هنا بس. باقي الملفات بتقرا منه.
   كل نص ليه نسختين: ar (عربي) و en (إنجليزي)
   ========================================================== */

const CONFIG = {

  /* ---------- 1) إعدادات عامة و SEO ---------- */
  site: {
    domain: "",                 // مثال: "https://hazem.dev" (مهم للـ SEO)
    defaultLang: "ar",          // "ar" أو "en"
    defaultTheme: "dark",       // "dark" أو "light"
    title: {
      ar: "حازم مصطفى | مهندس برمجيات",
      en: "Hazem Mostafa | Software Engineer",
    },
    description: {
      ar: "",                   // وصف الموقع في جوجل (حوالي 150 حرف)
      en: "",
    },
  },

  /* ---------- 2) بياناتك ---------- */
  profile: {
    name:  { ar: "حازم مصطفى", en: "Hazem Mostafa" },
    title: { ar: "مهندس برمجيات متكامل", en: "Full-Stack Software Engineer" },
    bio:   { ar: "", en: "" },  // نبذة من سطرين تلاتة
    photo: "",                  // مثال: "images/me.jpg" — لو فاضي بيظهر حرفين من اسمك
  },

  /* ---------- 3) روابط التواصل (أنت اللي بتحطها) ----------
     واتساب: "https://wa.me/20XXXXXXXXXX"
     إيميل:  "mailto:you@example.com"
     أي رابط فاضي ("") زراره بيختفي من الموقع تلقائي.        */
  links: {
    whatsapp: "",
    email:    "",
    github:   "",
    linkedin: "",
  },

  /* ---------- 4) حالتك الحالية ----------
     state: "available" = متاح للتطوير
            "busy"      = غير متاح
     availableAgainAt: لو busy وحطيت تاريخ، بيظهر عداد "هكون متاح بعد…"
     صيغة التاريخ: "2026-11-01T00:00:00+02:00" (توقيت مصر)       */
  status: {
    state: "available",
    availableAgainAt: "",
    text: {
      available: { ar: "متاح للتطوير الآن", en: "Available for development" },
      busy:      { ar: "غير متاح حالياً",   en: "Currently unavailable" },
    },
    countdownLabel: { ar: "هكون متاح بعد", en: "Available again in" },

    // التواصل والاستفسارات شغال دايماً، من غير عداد
    contactText: { ar: "متاح للتواصل والاستفسارات", en: "Open for contact & inquiries" },
  },

  /* ---------- 5) المهارات ----------
     icon: رابط لوجو أو مسار ملف عندك زي "images/skills/python.svg"
     darkInvert: true لو اللوجو أسود ومش بيبان في الوضع المظلم  */
  skills: [
    { name: "HTML",       icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",          desc: { ar: "هيكلة الصفحات",           en: "Page structure" } },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", desc: { ar: "برمجة الواجهات",          en: "Interactive front-end" } },
    { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", desc: { ar: "أمان الأنواع",            en: "Type safety" } },
    { name: "Next.js",    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",         desc: { ar: "تطبيقات ويب حديثة",       en: "Modern web apps" }, darkInvert: true },
    { name: "Python",     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",         desc: { ar: "الخلفية والمنطق البرمجي", en: "Backend & core logic" } },
  ],

  /* ---------- 6) المشاريع (أنت اللي بتضيفها) ----------
     انسخ القالب ده وحطه جوه [ ] تحت:
     {
       title:       { ar: "", en: "" },
       description: { ar: "", en: "" },
       image:       "images/projects/project1.jpg",
       tech:        ["Python", "Next.js"],
       status:      "done",          // "done" أو "in-progress"
       finishAt:    "",              // لو in-progress: "2026-12-15T00:00:00+02:00" بيظهر عداد
       links:       { live: "", repo: "" },
     },
  */
  projects: [
  ],

  countdownProjectLabel: { ar: "ينتهي بعد", en: "Finishes in" },

  /* ---------- 7) فورم التواصل ----------
     لسه مختارناش الطريقة. فاضي = يستخدم رابط الإيميل (mailto).
     provider: "" | "emailjs" | "formspree"                      */
  contactForm: {
    provider: "",
    endpoint: "",
  },
};