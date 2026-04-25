# AI Usage Report — Assignment 2

**Student:** Abdulaziz Ayman Elkarm (202279480)  
---

## Tools Used

### Claude & CODEX 

**How it was used:**
- Helped plan and break down the assignment 3 requirements into actionable tasks
- Help in updating `index.html` structure including:
  - GitHub Repositories section with loading spinner and error state
  - Semester countdown widget (Days / Hours / Minutes / Seconds)
  - Combined filter bar for projects: category row, difficulty row, and sort dropdown
  - Difficulty badges (`data-difficulty`) on each project card
  - Auth widget in the header (Sign in / greeting / Sign out + popover)
  - Enhanced contact form with Subject dropdown and Confirm Email field
- Rewrote and extended `css/styles.css` to add:
  - GitHub repo card styles (`.gh-card`, language dot, meta row)
  - Countdown unit styles (`.countdown-section`, `.countdown-val`)
  - Filter bar layout (`.filter-bar`, `.filter-row`, `.filter-row-label`)
  - Difficulty badge variants (`.diff-badge--beginner/intermediate/advanced`)
  - Auth widget and popover styles
  - Section toggle button and chevron animation
  - Performance hints (`will-change`, `content-visibility`, `contain`)
- Help in `js/script.js` to add:
  - `initGitHubRepos()` — fetches GitHub API, renders repo cards with language/stars/forks, with 8 s abort timeout and friendly error fallback
  - `initCountdown()` — live `setInterval` countdown to 18 May 2026 21:00 KSA
  - Refactored `initProjectFilters()` — combined category + difficulty filter state with sort (name A→Z, name Z→A, difficulty ↑↓) using an `applyFiltersAndSort()` function
  - Updated `initContactForm()` — added subject and confirm-email validation, cross-field match check, and `change` event listeners
  - `initAuth()` — login/logout state stored in `localStorage("visitorName")`, popover with name input, greeting restored on reload
  - `initSectionToggles()` — dynamically injects collapse buttons into every section heading; collapsed state persisted in `localStorage("sectionState")`
- Applied HTML performance optimizations:
  - `defer` on the script tag to eliminate render-blocking JS
  - `<link rel="preload">` for the hero profile image (LCP improvement)
  - `<link rel="dns-prefetch/preconnect">` for GitHub and ESPN APIs
  - `loading="lazy"` and `decoding="async"` on all below-fold images
  - Explicit `width`/`height` on all images to prevent layout shift (CLS)
- Helped update all documentation files


## Responsible use & modifications

All AI-generated code in this project was treated as a starting point, not a final product. Specifically:

- Every generated code block was **read and understood** before being accepted into the project
- The AI was given clear, specific instructions for each feature rather than open-ended requests
- Generated code was **manually reviewed** for correctness, accessibility, and alignment with the assignment requirements
- Where the AI's output did not match the intended design or behavior, it was **edited or rejected**
- No AI-generated text was submitted as personal reflection or academic writing without disclosure

---

## Learning outcomes

Through building this assignment with AI assistance, the following concepts were actively learned and applied:

- **GitHub REST API** — how to fetch public user data without authentication, read JSON fields like `stargazers_count`, `language`, and `html_url`, and filter out forked repos before rendering
- **`AbortController` and fetch timeouts** — how to cancel a `fetch()` request after a set delay using `AbortController.signal`, preventing the UI from hanging indefinitely on slow networks
- **`localStorage` for state persistence** — how to save and restore application state (theme, visitor name, collapsed sections) across page reloads using `JSON.stringify` / `JSON.parse`
- **Multi-condition filtering and sorting** — how to combine independent filter states (category AND difficulty) and apply a dynamic sort on the resulting visible subset, re-appending DOM nodes in the correct order
- **Cross-field form validation** — how to validate one field against the live value of another (confirm email matching email) and re-trigger validation when the source field changes
- **`setInterval` countdown logic** — how to compute the difference between `Date.now()` and a fixed target timestamp and break it into days, hours, minutes, and seconds with `padStart` formatting
- **Browser performance APIs** — how `loading="lazy"`, `decoding="async"`, `fetchpriority`, `<link rel="preload">`, and `defer` each target a different bottleneck in the page load pipeline
- **CSS `content-visibility` and `contain`** — how the browser can skip layout and paint for off-screen sections entirely, and how `contain: layout style` isolates a section's reflow from the rest of the document
- **Dynamic DOM construction** — how to build and inject elements entirely in JavaScript (`createElement`, `insertBefore`, `appendChild`) to add UI features without modifying the base HTML

---

## Benefits & challenges

### Benefits
- **Speed** — AI significantly reduced the time needed to scaffold boilerplate code like form structure, CSS resets, and API fetch wrappers
- **Code quality** — suggestions followed modern best practices 
- **Accessibility** — AI proactively added `aria-live`, `role`, and `for`/`id` attribute pairs that may have been overlooked otherwise
- **Documentation** — AI helped structure technical documentation clearly and consistently

### Challenges
- **Trust and verification** — AI-generated code can look correct but contain subtle bugs; every feature required manual testing
- **Context limitations** — the AI did not always remember earlier decisions, requiring reminders about the existing file structure
- **Over-generation** — sometimes suggestions included more complexity than needed for the assignment scope, requiring trimming
- **CORS and API constraints** — the free tier of `football-data.org` has rate limits and some endpoints behave differently than documented; this required reading the API docs independently to select the right parameters

---