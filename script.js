/* ─── Nav: menu toggle ───────────────────────────────────────────── */
const menuBtn = document.getElementById("menuBtn");
const menu    = document.getElementById("menu");

menuBtn?.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

/* ─── Nav: shadow on scroll ─────────────────────────────────────── */
const nav = document.getElementById("nav");

function updateNavShadow() {
  nav?.classList.toggle("scrolled", window.scrollY > 8);
}

window.addEventListener("scroll", updateNavShadow, { passive: true });
updateNavShadow();

/* ─── Nav: active link highlight (IntersectionObserver) ─────────── */
const sections = document.querySelectorAll("main [id]");
const navLinks = menu?.querySelectorAll("a[href^='#']");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks?.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          link.ariaCurrent = active ? "true" : null;
        });
      }
    });
  },
  { rootMargin: "-50% 0px -50% 0px" }
);

sections.forEach((s) => sectionObserver.observe(s));

/* ─── Entrance animations (IntersectionObserver) ────────────────── */
const animatables = document.querySelectorAll(
  ".story-grid, .play-layout, .card, .tile, .vow blockquote, .join-panel, .hero-card"
);

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
);

animatables.forEach((el) => {
  el.classList.add("fade-in");
  fadeObserver.observe(el);
});

/* ─── Join form: validation + submission ─────────────────────────── */
const form     = document.getElementById("joinForm");
const statusEl = document.getElementById("formStatus");

function setFieldError(input, message) {
  const id = `err-${input.name}`;
  let errEl = document.getElementById(id);

  if (!errEl) {
    errEl = document.createElement("span");
    errEl.id = id;
    errEl.className = "field-error";
    errEl.setAttribute("role", "alert");
    input.parentElement.appendChild(errEl);
  }

  errEl.textContent = message;
  input.setAttribute("aria-describedby", id);
  input.classList.add("invalid");
}

function clearFieldError(input) {
  const id = `err-${input.name}`;
  const errEl = document.getElementById(id);
  if (errEl) errEl.textContent = "";
  input.removeAttribute("aria-describedby");
  input.classList.remove("invalid");
}

function validateForm(data) {
  let valid = true;

  const name    = form.elements["name"];
  const contact = form.elements["contact"];

  clearFieldError(name);
  clearFieldError(contact);

  if (!String(data.get("name") || "").trim()) {
    setFieldError(name, "Please tell us your name.");
    valid = false;
  }

  const contactVal = String(data.get("contact") || "").trim();
  if (!contactVal) {
    setFieldError(contact, "Drop a phone number or email so we can reach you.");
    valid = false;
  } else if (!/^[\w.+\-]+@[\w.\-]+\.[a-zA-Z]{2,}$/.test(contactVal) &&
             !/^[\d\s\+\-\(\)]{7,}$/.test(contactVal)) {
    setFieldError(contact, "Looks like that isn't a valid email or phone number.");
    valid = false;
  }

  return valid;
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  statusEl.hidden = true;
  statusEl.textContent = "";

  const data = new FormData(form);

  if (!validateForm(data)) {
    form.querySelector(".invalid")?.focus();
    return;
  }

  const name = String(data.get("name") || "").trim();

  // Simulate async send
  const submitBtn = form.querySelector("[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  setTimeout(() => {
    statusEl.hidden   = false;
    statusEl.textContent = `Thanks, ${name || "friend"}. The crew will reach out. Until then — keep a racket handy.`;
    form.reset();
    submitBtn.disabled    = false;
    submitBtn.textContent = "Send a hello";
  }, 800);
});

/* ─── Live clear validation errors as user types ─────────────────── */
form?.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => clearFieldError(input));
});
