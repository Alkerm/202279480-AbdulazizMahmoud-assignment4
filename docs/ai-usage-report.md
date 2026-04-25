# AI Usage Report — Assignment 4

**Student:** Abdulaziz Ayman Elkarm (202279480)  
---

## Tools Used

### Claude Code

**How it was used:**
- Helped plan and break down the Assignment 4 requirements into actionable tasks covering professional polish, responsiveness, and creative innovation
- Help in updating `index.html` structure including:
  - Custom SVG favicon (`AE` monogram) linked via `<link rel="icon">`
  - Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`) for rich link previews on WhatsApp, LinkedIn, and Discord
  - Twitter/X Card meta tags (`twitter:card`, `twitter:title`, `twitter:image`) for social sharing
  - `theme-color` meta tags for browser chrome tinting on dark and light modes
  - Education & Experience vertical timeline section with three entries (KFUPM education, Media & Marketing Leader, Tech Committee Member)
  - Social icon boxes — Email (envelope SVG) and LinkedIn (filled logo SVG) side by side replacing old text buttons
  - Countdown label updated to "End of Junior Year — 18 May 2026"
- Rewrote and extended `css/styles.css` to add:
  - Timeline layout: vertical gradient line, animated dot (`::after` inner fill), gold dot variant for achievements
  - Timeline card styles: glassmorphism surface, hover lift, badge color variants (`--edu`, `--exp`, `--achievement`, `--project`)
  - Social icon box styles (`.social-icon-btn`): equal-height `flex: 1 1 0` sizing, LinkedIn brand-blue hover, accent-blue hover
  - Compact header styles (`.header--compact`): smooth `max-height` + `opacity` transition instead of instant `display:none`
  - Mobile responsive fixes: countdown squeeze at `max-width: 500px`, filter bar `flex-direction: row` with wrap, `#gh-grid` forced to single column with `overflow: hidden`
  - GPU compositing on `.site-header`: `transform: translateZ(0)`, `will-change: transform`, `-webkit-backdrop-filter`, `z-index: 1000`
- Help in `js/script.js` to add:
  - `initShrinkingHeader()` — scroll-direction detector using `requestAnimationFrame` and `passive: true`; adds `.header--compact` on scroll-down past 80 px, removes it on scroll-up

---

## Responsible use & modifications

All AI-generated code in this project was treated as a starting point, not a final product. Specifically:

- Every generated code block was **read and understood** before being accepted into the project
- The AI was given precise, feature-scoped instructions; broad open-ended requests were avoided
- Generated CSS was **reviewed against the existing design token system** (`var(--accent)`, `var(--surface)`, etc.) to ensure visual consistency
- Timeline content was written by me and verified against my LinkedIn profile — no fabricated data was accepted
- The compact header animation approach was discussed and I explicitly chose `max-height`/`opacity` over `display:none` after understanding why the latter cannot be animated
- No AI-generated text was submitted as personal reflection or academic writing without disclosure

---

## Learning outcomes

Through building this assignment with AI assistance, the following concepts were actively learned and applied:

- **Open Graph & Twitter Card meta tags** — how social platforms read `og:image`, `og:title`, and `twitter:card` to generate rich link previews, and why `og:image` must be an absolute URL to a publicly accessible asset
- **SVG favicons** — how to author an SVG with `viewBox`, `<rect>`, and `<text>` elements and reference it from `<link rel="icon" type="image/svg+xml">` for scalable, theme-aware browser tab icons
- **`theme-color` meta tag with `media` attribute** — how the browser reads a preferred color scheme and applies it to the address bar or status bar, and how to target dark vs. light variants separately
- **CSS `backdrop-filter` and GPU compositing** — why `backdrop-filter: blur()` can cause scroll lag, and how `transform: translateZ(0)` and `will-change: transform` promote an element to its own GPU compositing layer to prevent CPU repaints on scroll
- **Animating visibility without `display:none`** — why `display` cannot be transitioned and the correct pattern of using `max-height: 0` + `opacity: 0` with matching transitions to achieve smooth collapse/expand
- **Scroll-direction detection with `requestAnimationFrame`** — how to compare `window.scrollY` to a stored `lastY` value inside an rAF callback, and why using `passive: true` on the scroll listener matters for performance
- **CSS Flexbox equal sizing** — the difference between `flex: 1` and `flex: 1 1 0`; why setting `flex-basis: 0` is required when you want elements to share space equally regardless of their content size
- **Vertical timeline layout** — how to use `position: absolute` dots on a `::before` pseudo-element line, and the math behind `left` offsets when a parent has `padding-left` to ensure the dot centers precisely on the line
- **Z-index and stacking contexts** — how `will-change: transform` on child elements creates new stacking contexts that can overlap a sticky header, and why the header needs a high `z-index` to reliably stay on top

---

## Benefits & challenges

### Benefits
- **Speed** — AI significantly reduced boilerplate time for meta tag generation, SVG authoring, and CSS variable referencing across a large stylesheet
- **Code quality** — suggestions consistently used modern CSS (`clamp`, custom properties, logical properties) and accessible HTML patterns (`aria-label`, `aria-hidden`, semantic elements)
- **Design iteration** — being able to describe a visual goal ("compact header that shrinks on scroll-down") and receive a working implementation immediately accelerated the polish phase
- **Accuracy** — AI correctly identified that `backdrop-filter` lag is a GPU compositing issue and suggested the exact fix (`translateZ(0)`) without needing external research

### Challenges
- **Context drift** — across a long session the AI sometimes lost track of earlier decisions (e.g., which CSS variable names are in use), requiring explicit reminders about the design token system
- **Over-engineering tendencies** — initial suggestions sometimes added unnecessary complexity (tab switchers, extra JS logic) when a simpler CSS-only solution was sufficient; manual trimming was required
---