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

/* ─── Playo booking widget ───────────────────────────────────────── */
(async function loadPlayoSlots() {
  const container = document.getElementById("bookingSlots");
  if (!container) return;

  // Vijaya Bank Layout, Bangalore
  const LAT = 12.9020;
  const LNG = 77.5960;
  const VENUE_KEYWORD = "playfeathers";
  const TARGET_START_HOUR = 7;
  const TARGET_START_MIN  = 30;
  const TARGET_END_HOUR   = 8;
  const TARGET_END_MIN    = 30;
  const IST_OFFSET_MS     = 5.5 * 60 * 60 * 1000;

  function toIST(utcStr) {
    return new Date(new Date(utcStr).getTime() + IST_OFFSET_MS);
  }

  function fmtTime(d) {
    const h = d.getUTCHours(), m = d.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  function fmtDate(d) {
    return d.toLocaleDateString("en-IN", {
      weekday: "short", month: "short", day: "numeric",
      timeZone: "Asia/Kolkata"
    });
  }

  // Get next Saturday and Sunday dates
  function getNextWeekendDates() {
    const now = new Date();
    const istNow = new Date(now.getTime() + IST_OFFSET_MS);
    const dayOfWeek = istNow.getUTCDay(); // 0=Sun, 6=Sat
    const dates = [];

    // Days until next Saturday
    const daysToSat = (6 - dayOfWeek + 7) % 7 || 7;
    const daysToSun = (0 - dayOfWeek + 7) % 7 || 7;

    [daysToSat, daysToSun].forEach(offset => {
      const d = new Date(istNow);
      d.setUTCDate(d.getUTCDate() + offset);
      // Format as ISO date string in IST
      const yyyy = d.getUTCFullYear();
      const mm   = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd   = String(d.getUTCDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    });

    return dates;
  }

  function isTargetSlot(activity) {
    const start = toIST(activity.startTime);
    const end   = toIST(activity.endTime);
    const sh = start.getUTCHours(), sm = start.getUTCMinutes();
    const eh = end.getUTCHours(),   em = end.getUTCMinutes();
    const venueMatch = (activity.venueName || activity.location || "")
      .toLowerCase().includes(VENUE_KEYWORD);
    const timeMatch  =
      sh === TARGET_START_HOUR && sm === TARGET_START_MIN &&
      eh === TARGET_END_HOUR   && em === TARGET_END_MIN;
    return venueMatch && timeMatch;
  }

  async function fetchDay(dateStr) {
    const res = await fetch("https://api.playo.io/activity-public/list/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: LAT, lng: LNG, cityRadius: 8,
        gameTimeActivities: false, page: 0, lastId: "",
        sportId: ["SP5"], booking: false, date: [dateStr]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json?.data?.activities || [];
  }

  function renderSlots(slots) {
    if (!slots.length) {
      container.innerHTML = `<p class="booking-empty">No open slots found for this weekend — check back closer to the day.</p>`;
      return;
    }

    container.innerHTML = slots.map(s => {
      const start   = toIST(s.startTime);
      const isFull  = s.full || s.joineeCount >= s.maxPlayers;
      const spotsLeft = Math.max(0, (s.maxPlayers || 0) - (s.joineeCount || 0));
      const link    = `https://playo.co/match/${s.id}`;

      return `
        <div class="booking-slot">
          <div class="booking-slot-info">
            <p class="booking-slot-date">${fmtDate(start)} · ${fmtTime(toIST(s.startTime))}–${fmtTime(toIST(s.endTime))}</p>
            <p class="booking-slot-venue">${s.venueName || s.location}</p>
          </div>
          <div class="booking-slot-right">
            <span class="booking-badge ${isFull ? "full" : "open"}">${isFull ? "Full" : "Open"}</span>
            ${!isFull
              ? `<span class="booking-slots-count">${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left</span>
                 <a class="booking-join-btn" href="${link}" target="_blank" rel="noopener">Join →</a>`
              : `<a class="booking-join-btn" href="${link}" target="_blank" rel="noopener">View →</a>`
            }
          </div>
        </div>`;
    }).join("");
  }

  try {
    const dates     = getNextWeekendDates();
    const [sat, sun] = await Promise.all([fetchDay(dates[0]), fetchDay(dates[1])]);
    const all       = [...sat, ...sun].filter(isTargetSlot);
    renderSlots(all);
  } catch (err) {
    console.warn("Playo fetch failed:", err);
    container.innerHTML = `
      <p class="booking-error">Could not load live slots right now.</p>
      <p class="booking-empty">
        <a class="booking-join-btn" href="https://playo.co" target="_blank" rel="noopener">Browse on Playo →</a>
      </p>`;
  }
})();
