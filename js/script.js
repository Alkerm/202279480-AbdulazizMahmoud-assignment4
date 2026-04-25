/**
 * script.js — Portfolio interactive logic
 *
 * Sections (in order):
 *  1. Theme toggle      — dark/light mode with localStorage persistence
 *  2. Fade-in           — scroll-triggered animations via IntersectionObserver
 *  3. Project filters   — combined category + difficulty filter with sort
 *  4. Contact form      — multi-field inline validation including cross-field check
 *  5. UCL widget        — ESPN API fetch for upcoming Champions League fixtures
 *  6. GitHub widget     — GitHub API fetch for public repositories
 *  7. Countdown         — live timer to end-of-semester (18 May 2026 21:00 KSA)
 *  8. Auth              — visitor sign-in / sign-out with localStorage
 *  9. Section toggles   — collapsible sections with localStorage persistence
 */

// Cached reference to <html> element used for data-theme switching
const root = document.documentElement;

/* ─────────────────────────────────────────
 * 1. THEME TOGGLE
 * Reads saved preference from localStorage on load.
 * Toggles data-theme on <html> and persists the choice.
 * ───────────────────────────────────────── */
function initThemeToggle() {
  const toggleButton = document.getElementById("theme-toggle");
  if (!toggleButton) {
    return;
  }

  const updateToggleText = (theme) => {
    toggleButton.textContent = theme === "light" ? "Dark mode" : "Light mode";
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateToggleText(theme);
  };

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  toggleButton.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

/* ─────────────────────────────────────────
 * 2. SCROLL FADE-IN
 * Adds/removes .visible on elements with .fade-in
 * as they enter/leave the viewport.
 * Threshold 0.2 = element must be 20% visible to trigger.
 * ───────────────────────────────────────── */
function initFadeIn() {
  const fadeElements = document.querySelectorAll(".fade-in");
  if (!fadeElements.length || typeof IntersectionObserver === "undefined") {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("visible", entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );

  fadeElements.forEach((element) => observer.observe(element));
}

/* ─────────────────────────────────────────
 * 3. PROJECT FILTERS
 * Maintains two independent state variables:
 *   activeCat  — selected category  (data-filter buttons)
 *   activeDiff — selected difficulty (data-diff buttons)
 * applyFilters() combines both and re-appends
 * visible cards with a staggered animation.
 * ───────────────────────────────────────── */
function initProjectFilters() {
  const grid = document.getElementById("project-grid");
  const emptyState = document.getElementById("no-projects");
  if (!grid || !emptyState) return;

  let activeCat  = "all";
  let activeDiff = "all";
  let activeSort = "date-desc"; // default: newest first

  function applyFiltersAndSort() {
    const cards = Array.from(grid.querySelectorAll(".card"));

    // 1. Filter
    const visible = cards.filter((card) => {
      const catMatch  = activeCat  === "all" || card.dataset.category   === activeCat;
      const diffMatch = activeDiff === "all" || card.dataset.difficulty  === activeDiff;
      card.style.display = catMatch && diffMatch ? "" : "none";
      return catMatch && diffMatch;
    });

    // 2. Sort
    visible.sort((a, b) => {
      switch (activeSort) {
        case "date-asc":
          return (a.dataset.date || "").localeCompare(b.dataset.date || "");
        case "date-desc":
          return (b.dataset.date || "").localeCompare(a.dataset.date || "");
        case "name-asc":
          return (a.dataset.name || "").localeCompare(b.dataset.name || "");
        case "name-desc":
          return (b.dataset.name || "").localeCompare(a.dataset.name || "");
        default:
          return 0;
      }
    });

    // 3. Re-append in sorted order with staggered animation
    // Temporarily remove .fade-in to avoid opacity:0 fighting the inline animation
    visible.forEach((card, i) => {
      card.classList.remove("fade-in");
      card.style.opacity = "1";
      card.style.animation = "none";
      void card.offsetWidth; // force reflow so animation restarts
      card.style.animation = `fadeUp 0.35s ease ${i * 0.08}s both`;
      grid.appendChild(card);
    });

    emptyState.style.display = visible.length === 0 ? "block" : "none";
  }

  // Category filter buttons
  document.querySelectorAll(".filter-btn[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn[data-filter]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCat = btn.dataset.filter;
      applyFiltersAndSort();
    });
  });

  // Difficulty filter buttons
  document.querySelectorAll(".filter-btn[data-diff]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn[data-diff]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeDiff = btn.dataset.diff;
      applyFiltersAndSort(); // ← was missing before
    });
  });

  // Sort select
  const sortSelect = document.getElementById("project-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      activeSort = sortSelect.value;
      applyFiltersAndSort();
    });
  }

  // Run once on load so the default "Newest first" order is applied immediately
  applyFiltersAndSort();
}


/* ─────────────────────────────────────────
 * 4. CONTACT FORM VALIDATION
 * Validates 5 fields inline (no page reload, no alert()).
 * confirm-email is cross-validated against email's live value.
 * Success banner auto-hides after 5 seconds.
 * ───────────────────────────────────────── */
function initContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const subjectInput  = form.querySelector('select[name="subject"]');
  const nameInput     = form.querySelector('input[name="name"]');
  const emailInput    = form.querySelector('input[name="email"]');
  const confirmInput  = form.querySelector('input[name="confirm-email"]');
  const messageInput  = form.querySelector('textarea[name="message"]');

  if (!subjectInput || !nameInput || !emailInput || !confirmInput || !messageInput) return;

  // Simple RFC-style email pattern — rejects obvious typos without being too strict
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fieldMap = [
    { input: subjectInput,  validate: (v) => v ? "" : "Please select a subject." },
    { input: nameInput,     validate: (v) => v.trim() ? "" : "Name is required." },
    { input: emailInput,    validate: (v) => emailPattern.test(v.trim()) ? "" : "Please enter a valid email address." },
    { input: confirmInput,  validate: (v) => v.trim() === emailInput.value.trim() ? "" : "Emails do not match." },
    { input: messageInput,  validate: (v) => v.trim().length >= 10 ? "" : "Message must be at least 10 characters." },
  ];

  let successBox = form.querySelector(".form-success");
  if (!successBox) {
    successBox = document.createElement("div");
    successBox.className = "form-success";
    successBox.hidden = true;
    successBox.textContent = "Message sent successfully.";
    form.prepend(successBox);
  }

  const ensureFieldError = (input) => {
    const parent = input.closest("label");
    if (!parent) return null;
    let err = parent.querySelector(".field-error");
    if (!err) {
      err = document.createElement("span");
      err.className = "field-error";
      err.setAttribute("aria-live", "polite");
      parent.appendChild(err);
    }
    return err;
  };

  const setFieldState = (input, message) => {
    const err = ensureFieldError(input);
    input.classList.toggle("invalid", Boolean(message));
    if (err) err.textContent = message;
  };

  fieldMap.forEach(({ input, validate }) => {
    ensureFieldError(input);
    input.addEventListener("input", () => setFieldState(input, validate(input.value)));
    input.addEventListener("change", () => setFieldState(input, validate(input.value)));
  });

  // Re-validate confirm email whenever the email field changes
  emailInput.addEventListener("input", () => {
    if (confirmInput.value) {
      setFieldState(confirmInput, confirmInput.value.trim() === emailInput.value.trim() ? "" : "Emails do not match.");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;
    fieldMap.forEach(({ input, validate }) => {
      const msg = validate(input.value);
      setFieldState(input, msg);
      if (msg) isValid = false;
    });
    if (!isValid) { successBox.hidden = true; return; }
    successBox.hidden = false;
    form.reset();
    fieldMap.forEach(({ input }) => setFieldState(input, ""));
    window.setTimeout(() => { successBox.hidden = true; }, 5000);
  });
}

/* ─────────────────────────────────────────
 * 5. UEFA CHAMPIONS LEAGUE WIDGET
 * Fetches upcoming fixtures from the ESPN public API.
 * No API key required. Uses AbortController for an 8 s timeout.
 * Filters to future events only, sorted by date ascending.
 * ───────────────────────────────────────── */

// Format a UTC date string to a readable day/date in KSA timezone
function formatMatchDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Riyadh",
  });
}

function formatMatchTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  }) + " KSA";
}

// Build the ESPN API date range for the current UCL season (e.g. "20240901-20250630")
function getChampionsLeagueSeasonRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const seasonStartYear = month >= 7 ? year : year - 1;
  const seasonEndYear = seasonStartYear + 1;

  return `${seasonStartYear}0901-${seasonEndYear}0630`;
}

// Extract home/away team data + logos from an ESPN event object.
// Returns null if any required field is missing (skips incomplete fixtures).
function getAssignedTeams(event) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const home = competitors.find((team) => team.homeAway === "home");
  const away = competitors.find((team) => team.homeAway === "away");
  const homeLogo = home?.team?.logos?.[0]?.href || home?.team?.logo || "";
  const awayLogo = away?.team?.logos?.[0]?.href || away?.team?.logo || "";

  if (!home?.team?.displayName || !away?.team?.displayName || !homeLogo || !awayLogo) {
    return null;
  }

  return { competition, home, away, homeLogo, awayLogo };
}

function renderChampionsLeagueMatches(container, events) {
  if (!events.length) {
    container.innerHTML = '<p style="color:var(--muted)">No fixtures available right now.</p>';
    return;
  }

  container.innerHTML = events
    .map((event, index) => {
      const teams = getAssignedTeams(event);
      if (!teams) {
        return "";
      }

      const { competition, home, away, homeLogo, awayLogo } = teams;
      const status = event.status?.type?.name || "";
      const matchDate = formatMatchDate(event.date);
      const matchTime = formatMatchTime(event.date);
      const venue = competition?.venue?.fullName || competition?.venue?.address?.city || "Venue to be confirmed";

      const homeName = home?.team?.shortDisplayName || home?.team?.displayName || "TBD";
      const awayName = away?.team?.shortDisplayName || away?.team?.displayName || "TBD";
      const homeTeamHtml = `
        <span class="cl-team">
          ${homeLogo ? `<img class="cl-team-logo" src="${homeLogo}" alt="${homeName} logo" loading="lazy" />` : ""}
          <span>${homeName}</span>
        </span>
      `;
      const awayTeamHtml = `
        <span class="cl-team cl-team--away">
          ${awayLogo ? `<img class="cl-team-logo" src="${awayLogo}" alt="${awayName} logo" loading="lazy" />` : ""}
          <span>${awayName}</span>
        </span>
      `;

      let scoreHtml = "";
      if (status === "STATUS_FINAL" || status === "STATUS_IN_PROGRESS" || status === "STATUS_HALFTIME") {
        const homeScore = home?.score ?? "-";
        const awayScore = away?.score ?? "-";
        scoreHtml = `<div class="cl-score">${homeScore} - ${awayScore}</div>`;
      }

      return `
        <div class="cl-match-card" style="animation-delay:${index * 60}ms">
          <div class="cl-teams">
            ${homeTeamHtml}
            <span class="cl-vs">vs</span>
            ${awayTeamHtml}
          </div>
          ${scoreHtml}
          <div class="cl-meta-row">
            <span class="cl-date">${matchDate}</span>
            <span class="cl-time">${matchTime}</span>
          </div>
          <span class="cl-venue">${venue}</span>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");
}

async function initChampionsLeagueWidget() {
  const loadingNode = document.getElementById("cl-loading");
  const matchesNode = document.getElementById("cl-matches");
  const errorNode = document.getElementById("cl-error");

  if (!loadingNode || !matchesNode || !errorNode) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const seasonRange = getChampionsLeagueSeasonRange();
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=${seasonRange}&limit=200&lang=en&region=gb&league=uefa.champions`,
      { signal: controller.signal }
    );

    window.clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ESPN API error ${response.status}`);
    }

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];
    const now = Date.now();
    const upcomingEvents = events
      .filter((event) => {
        const eventTime = Date.parse(event.date);
        return Number.isFinite(eventTime) && eventTime >= now && Boolean(getAssignedTeams(event));
      })
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    loadingNode.hidden = true;
    loadingNode.style.display = "none";
    errorNode.hidden = true;
    renderChampionsLeagueMatches(matchesNode, upcomingEvents);
  } catch (error) {
    window.clearTimeout(timeoutId);
    console.error("Champions League widget failed:", error);
    loadingNode.hidden = true;
    loadingNode.style.display = "none";
    errorNode.hidden = false;
  }
}

/* ─────────────────────────────────────────
 * 6. GITHUB REPOSITORIES WIDGET
 * Fetches public repos for user "Alkerm" via the GitHub REST API.
 * Filters out forks. Renders cards with language dot, stars, forks.
 * Uses AbortController for an 8 s timeout.
 * ───────────────────────────────────────── */

// Maps GitHub language names to their official brand colours
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C#": "#178600",
  Java: "#b07219",
  Shell: "#89e051",
};

async function initGitHubRepos() {
  const loadingNode = document.getElementById("gh-loading");
  const gridNode = document.getElementById("gh-grid");
  const errorNode = document.getElementById("gh-error");

  if (!loadingNode || !gridNode || !errorNode) return;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      "https://api.github.com/users/Alkerm/repos?sort=updated&per_page=12",
      {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    window.clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GitHub API error ${response.status}`);
    }

    const repos = await response.json();
    const filtered = repos.filter((r) => !r.fork);

    loadingNode.hidden = true;
    loadingNode.style.display = "none";

    if (!filtered.length) {
      gridNode.innerHTML = '<p style="color:var(--muted)">No public repositories found.</p>';
      return;
    }

    gridNode.innerHTML = filtered
      .map((repo, index) => {
        const langColor = LANG_COLORS[repo.language] || "var(--muted)";
        const stars = repo.stargazers_count;
        const forks = repo.forks_count;
        const lang = repo.language || "";

        return `
          <article class="gh-card" style="animation-delay:${index * 60}ms">
            <div class="gh-card-header">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
              </svg>
              <a class="gh-card-name" href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a>
            </div>
            <div class="gh-card-footer">
              ${lang ? `<span class="gh-meta-item"><span class="gh-lang-dot" style="background:${langColor}"></span>${lang}</span>` : ""}
              ${stars > 0 ? `<span class="gh-meta-item">⭐ ${stars}</span>` : ""}
              ${forks > 0 ? `<span class="gh-meta-item">🍴 ${forks}</span>` : ""}
            </div>
          </article>
        `;
      })
      .join("");

  } catch (error) {
    window.clearTimeout(timeoutId);
    console.error("GitHub widget failed:", error);
    loadingNode.hidden = true;
    loadingNode.style.display = "none";
    errorNode.hidden = false;
  }
}

/* ─────────────────────────────────────────
 * 7. SEMESTER COUNTDOWN
 * Counts down to 18 May 2026 at 21:00 KSA (UTC+3).
 * Updates every second via setInterval.
 * Displays zero-padded DD / HH / MM / SS values.
 * ───────────────────────────────────────── */
function initCountdown() {
  const target = new Date("2026-05-18T21:00:00+03:00");
  const daysEl    = document.getElementById("cd-days");
  const hoursEl   = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = "00";
      return;
    }
    // Zero-pad single digits so the display is always 2 characters wide
    const pad = (n) => String(Math.floor(n)).padStart(2, "0");
    daysEl.textContent    = pad(diff / 86400000);
    hoursEl.textContent   = pad((diff % 86400000) / 3600000);
    minutesEl.textContent = pad((diff % 3600000) / 60000);
    secondsEl.textContent = pad((diff % 60000) / 1000);
  }

  tick();
  setInterval(tick, 1000);
}

/* ── State: Login / Logout / Visitor Name ── */
function initAuth() {
  const widget      = document.getElementById("auth-widget");
  const guestEl     = document.getElementById("auth-guest");
  const userEl      = document.getElementById("auth-user");
  const greetingEl  = document.getElementById("auth-greeting");
  const signinBtn   = document.getElementById("auth-signin-btn");
  const logoutBtn   = document.getElementById("auth-logout-btn");
  const popover     = document.getElementById("auth-popover");
  const nameInput   = document.getElementById("auth-name-input");
  const submitBtn   = document.getElementById("auth-submit-btn");

  if (!widget || !guestEl || !userEl) return;

  function showUser(name) {
    greetingEl.textContent = `👋 Hi, ${name}!`;
    guestEl.hidden = true;
    userEl.hidden  = false;
    if (popover) popover.hidden = true;
  }

  function clearUser() {
    localStorage.removeItem("visitorName");
    guestEl.hidden = false;
    userEl.hidden  = true;
  }

  // Restore from localStorage
  const stored = localStorage.getItem("visitorName");
  if (stored) showUser(stored);

  signinBtn.addEventListener("click", () => {
    popover.hidden = !popover.hidden;
    if (!popover.hidden) nameInput.focus();
  });

  submitBtn.addEventListener("click", () => {
    const name = nameInput.value.trim() || "Visitor";
    localStorage.setItem("visitorName", name);
    showUser(name);
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitBtn.click();
  });

  logoutBtn.addEventListener("click", clearUser);

  // Close popover when clicking outside the widget
  document.addEventListener("click", (e) => {
    if (!widget.contains(e.target)) popover.hidden = true;
  });
}

/* ── State: Show / Hide Sections ── */
/* ─────────────────────────────────────────
 * 9. SECTION TOGGLES
 * Dynamically injects a collapse button into each section heading.
 * Wraps all non-header content in a .section-body div.
 * Collapsed state is persisted in localStorage("sectionState").
 * ───────────────────────────────────────── */
function initSectionToggles() {
  const sectionIds = ["projects", "skills", "timeline", "github", "cl-widget", "contact"];
  const savedState = JSON.parse(localStorage.getItem("sectionState") || "{}");

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;

    const header = section.querySelector(".section-header");
    if (!header) return;

    const h2 = header.querySelector("h2");
    if (!h2) return;

    // Wrap h2 in a flex row with the toggle button
    const row = document.createElement("div");
    row.className = "section-title-row";
    h2.parentNode.insertBefore(row, h2);
    row.appendChild(h2);

    const btn = document.createElement("button");
    btn.className = "section-toggle-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Toggle section visibility");
    btn.innerHTML = '<span class="toggle-chevron" aria-hidden="true">▾</span>';
    row.appendChild(btn);

    const chevron = btn.querySelector(".toggle-chevron");

    // Wrap all content after header in a section-body div
    const container = header.closest(".container");
    if (!container) return;

    const body = document.createElement("div");
    body.className = "section-body";

    const siblings = [];
    let node = header.nextElementSibling;
    while (node) { siblings.push(node); node = node.nextElementSibling; }
    siblings.forEach((el) => body.appendChild(el));
    container.appendChild(body);

    // Apply saved collapsed state
    if (savedState[id] === true) {
      body.classList.add("hidden");
      chevron.classList.add("collapsed");
    }

    btn.addEventListener("click", () => {
      const isHidden = body.classList.toggle("hidden");
      chevron.classList.toggle("collapsed", isHidden);
      savedState[id] = isHidden;
      localStorage.setItem("sectionState", JSON.stringify(savedState));
    });
  });
}

/* ─────────────────────────────────────────
 * 10. SHRINKING HEADER
 * Adds .header--compact when the user scrolls DOWN past 80px.
 * Removes it when the user scrolls UP (any amount).
 * Uses requestAnimationFrame so the scroll handler never blocks the thread.
 * passive:true tells the browser no preventDefault will be called → smoother.
 * ───────────────────────────────────────── */
function initShrinkingHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 80 && y > lastY) {
          header.classList.add("header--compact");
        } else if (y < lastY) {
          header.classList.remove("header--compact");
        }
        lastY = y;
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* ─────────────────────────────────────────
 * INITIALISATION
 * Each function is self-contained and guards against missing DOM nodes.
 * Order matters: theme and fade-in run before API calls so the page
 * is interactive immediately while network requests complete in the background.
 * ───────────────────────────────────────── */
initThemeToggle();          // Apply saved theme before first paint
initFadeIn();               // Register scroll-animation observer
initProjectFilters();       // Attach filter/sort event listeners
initContactForm();          // Attach form validation
initCountdown();            // Start semester countdown ticker
initAuth();                 // Restore visitor login state
initSectionToggles();       // Inject section collapse buttons
initShrinkingHeader();      // Compact header on scroll-down
initGitHubRepos();          // Fetch GitHub repos (async)
initChampionsLeagueWidget(); // Fetch UCL fixtures (async)
