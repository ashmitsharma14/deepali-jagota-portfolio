# KNOWLEDGE.md — how this project works, and how to rebuild it

Everything needed to reconstruct this site from an empty folder: the decisions and
why they were made, the algorithms, the CSS system, the image pipeline, the deploy
chain, and the bugs that cost real time to find.

Written to be read in order the first time, and grepped afterwards.

---

## Contents

1. [What this is](#1-what-this-is)
2. [The decisions, and why](#2-the-decisions-and-why)
3. [Architecture and data flow](#3-architecture-and-data-flow)
4. [`content.js` — the schema](#4-contentjs--the-schema)
5. [`main.js` — the rendering engine](#5-mainjs--the-rendering-engine)
6. [The booking engine](#6-the-booking-engine)
7. [`styles.css` — the design system](#7-stylescss--the-design-system)
8. [The image pipeline](#8-the-image-pipeline)
9. [Build and deploy](#9-build-and-deploy)
10. [Hosting, domain and DNS](#10-hosting-domain-and-dns)
11. [Bugs found, and what they teach](#11-bugs-found-and-what-they-teach)
12. [How to verify a change](#12-how-to-verify-a-change)
13. [Known limitations](#13-known-limitations)
14. [Rebuilding from scratch](#14-rebuilding-from-scratch)

---

## 1. What this is

A single-page portfolio and consultation-booking site for **Deepali Jagota**,
Customer Success Manager at Cornerstone OnDemand.

| | |
|---|---|
| Live | https://deepalijagota.com (apex primary, `www` redirects to it) |
| Host | Netlify, project `deepalijagota` |
| Repo | `ashmitsharma14/deepali-jagota-portfolio` (private) |
| Registrar | GoDaddy |
| Stack | Plain HTML + CSS + JavaScript. **No framework, no build step, no dependencies.** |

Page order: **About → How I help → Achievements → Book a consultation + Connect.**

Line counts, as a sense of scale:

```
index.html                360    structure only, no content
content.js                315    ALL content — the single source of truth
assets/js/main.js         913    rendering + booking engine
assets/css/styles.css     663    design system
make-deploy.sh             37    builds the publishable subset
serve.js                   60    local preview server
_source-photos/make-cutout.py  86
_source-photos/make-badge.py   74
```

---

## 2. The decisions, and why

The *why* matters more than the code. Each of these was a fork in the road.

### No framework, no build step

The person maintaining this long-term is not a developer. React would mean Node, a
package.json, a lockfile, a build, and dependency rot — a site that stops building
in eighteen months because of a transitive dependency. Plain files still open in a
browser in ten years.

**Consequence:** everything is done with the DOM API directly. No JSX, no reactivity.
`main.js` reads `content.js` on load and writes HTML strings into containers.

### One content file

`content.js` holds every piece of text, price, link and setting. `index.html` has
almost no copy in it. This was deliberate: the maintainer edits **one file**, and
cannot break layout by editing content.

The cost: content is injected by JavaScript, so it isn't in the initial HTML. That's
fine for search engines (Google runs JS) but **not** for link-preview crawlers —
see [Open Graph](#open-graph-is-hand-written) below.

### `window.SITE` global, not ES modules

ES modules (`import`/`export`) fail under `file://`. Using a plain global means
double-clicking `index.html` works with no server at all. Small thing, real benefit
when someone wants a quick look.

### Slot booking built in-house rather than Calendly

Calendly would give real, live availability and make double-booking impossible. It
was rejected as the *default* because it puts a third-party brand and a cookie
banner in the middle of a personal portfolio, and because the volume (a few free
sessions a month) doesn't justify it.

**The escape hatch is built in.** Set `booking.schedulingUrl` in `content.js` and the
site swaps its own picker for a Calendly/Cal.com embed automatically. Nothing else
changes. See `renderScheduler()`.

### The site cannot see her calendar — so it never says "confirmed"

There is no backend. The slot grid is generated from *declared* availability, not
from a real calendar. So the final step says **"Request sent"**, not "Confirmed",
and the `.ics` file is `STATUS:TENTATIVE`.

This is a correctness constraint, not a wording preference. **Never** relabel step 4
"Confirmed" — she still has to accept. See [bug #6](#11-bugs-found-and-what-they-teach).

### Netlify Forms for delivery, `mailto:` as fallback

Originally the booking ended in a `mailto:` link. That was wrong: `mailto:` opens a
draft in the *visitor's* mail app, and does **nothing at all** on a desktop with no
mail client configured — which is a large fraction of people who live in webmail. A
booking would silently evaporate with neither party knowing.

Now the form POSTs to Netlify Forms (server-side, emails her), and `mailto:` is
demoted to an optional extra. If the POST fails the page **stops claiming success**
and promotes the email button again.

### Cut-out portraits over cropped cards

Both supplied photos were subjects isolated on white. A cropped rounded card would
have (a) shown a white box on the cream page and (b) sliced through the crossed arms
in the chosen photo. The cut-out treatment — transparent PNG floating on a soft warm
halo — crops nothing, so any framing works.

### WebP everywhere

The portrait as a transparent PNG was **1.9 MB**. As WebP: **139 KB**. Same visual
result, ~10× smaller, and transparency support is universal since 2020. There is no
PNG fallback and none is needed.

### Open Graph is hand-written

Link previews (WhatsApp, LinkedIn, Slack) **do not run JavaScript**, so they cannot
read `content.js`. The `og:` tags in `index.html` are therefore hand-maintained. This
is the one place where content lives outside `content.js`, and it is commented as
such in the file. If her name, photo, description or domain changes, change it there
too.

---

## 3. Architecture and data flow

```
                    ┌───────────────┐
                    │  content.js   │   window.SITE = { … }
                    └───────┬───────┘
                            │ read once on load
                    ┌───────▼───────┐
   index.html ─────►│   main.js     │────► writes innerHTML into containers
   (empty shells)   │  9 sections   │      binds events, runs booking flow
                    └───────┬───────┘
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
     Netlify Forms (POST /)        .ics data: URI (client-side)
     → email to Deepali            → visitor's calendar, TENTATIVE
```

**Load order in `index.html`** (bottom of `<body>`, no `defer` needed):

```html
<script src="content.js"></script>
<script src="assets/js/main.js"></script>
```

`content.js` must come first — `main.js` reads `window.SITE` immediately and bails
with a console error if it's absent.

### File map

```
index.html               structural shells with ids; almost no copy
content.js               ← the only file normally edited
assets/css/styles.css    13 numbered sections
assets/js/main.js        9 numbered sections
assets/img/              deepali-red.webp (in use), deepali-navy.webp (spare),
                         favicon.svg, portrait-placeholder.svg (fallback)
assets/img/badges/       5 credential badges, transparent WebP
_source-photos/          untouched originals + the two Python processors
_deploy/                 generated publishable subset — this is what ships
make-deploy.sh           builds _deploy
serve.js                 local preview server (Node, no deps)
DEPLOY.md                click-by-click go-live runbook
README.md                maintainer guide
KNOWLEDGE.md             this file
```

---

## 4. `content.js` — the schema

One global object. Every key documented inline in the file itself; this is the map.

```js
window.SITE = {
  person: {
    name, title, company, location,
    tagline,                 // one line, ~12–18 words
    bio: [ "para", … ],      // rendered as <p> each
    photo,                   // path to the live portrait
    photoAlt,
    photoStyle,              // "cutout" | "framed"
    photoOptions: [ {label, src, style} ]   // ≥2 → "Compare photo" switcher
  },

  stats: [ {value, label} ],          // [] hides the strip

  services: { show, heading, intro,
              items: [ {icon, title, body} ] },   // icon = key in main.js ICONS

  credentials: {
    heading, intro,
    items: [ { kind: "award"|"cert",   // award → Recognition col, cert → Certifications
               title, issuer, year, note,
               image,                  // badge art; falls back to drawn icon
               url } ]                 // "" = card doesn't link out
  },

  booking: {
    heading, intro,
    schedulingUrl,        // "" = use built-in picker; set = Calendly takes over
    schedulingEmbed,      // true = inline iframe, false = button
    enquiryEmail,         // mailto target + Netlify notification recipient
    timezoneLabel,        // display only, e.g. "IST (GMT+5:30)"
    utcOffsetMinutes,     // 330 for IST — used in the maths, must be right
    availability: { mon:[], tue:["19:00-21:00"], … },   // 24h, HER wall clock
    leadTimeHours,        // no bookings sooner than this
    horizonDays,          // how far ahead to show
    slotGapMinutes,       // breathing room between sessions
    blockedDates: [],     // ["2026-09-14", …]
    sessions: [ {id, name, duration /*minutes*/, summary,
                 includes:[], featured, badge} ],
    policy,
    responseTime          // "usually within two working days"
  },

  newsletter: { show, heading, intro, action, method, fieldName,
                buttonLabel, smallPrint },

  socials: [ {network, label, url} ],   // network = key in ICONS; "" url = hidden

  site: { metaTitle, metaDescription, url, footerNote, draftMode }
};
```

**`site.draftMode: true`** shows an orange banner and enables the photo switcher.
Set `false` for production. It is currently `false`.

---

## 5. `main.js` — the rendering engine

An IIFE in strict mode. Nine numbered sections, in execution order:

| § | Does |
|---|---|
| 1 | **Theme** — `data-theme` on `<html>`, persisted in `localStorage`, falls back to OS preference |
| 2 | **Simple bindings** — `[data-bind="path.to.value"]` → `textContent`; `[data-show]` hides on empty; sets `document.title` and meta description |
| 3 | **Hero** — bio paragraphs, portrait, cut-out class, photo switcher, stats strip |
| 4 | **How I help** — service cards; removes its own nav link if `services.show` is false |
| 5 | **Achievements** — splits `credentials.items` by `kind` into two columns; badge images with icon fallback on `error` |
| 6 | **Booking** — the bulk of the file, ~550 lines. See [§6](#6-the-booking-engine) |
| 7 | **Newsletter** — POSTs via a hidden form (avoids CORS); falls back to `mailto:` if no endpoint |
| 8 | **Socials** — cards; skips entries with empty `url` |
| 9 | **Header & motion** — sticky header, mobile menu, scroll-spy, reveal-on-scroll |

### Helpers worth knowing

- **`esc(str)`** — HTML-escapes. **Every** interpolated value from `content.js` goes
  through it. Content is trusted here, but the habit is what stops an apostrophe in
  a bio breaking an attribute.
- **`svg(name)`** — inline SVG from the `ICONS` map. No icon font, no sprite file, no
  network request.
- **`get("a.b.c")`** — safe deep read from `SITE`, returns `null` rather than throwing.

### Scroll-spy is offset-based, not IntersectionObserver

`#connect` is nested **inside** `#booking`. Two observers would both fire and fight
over which nav link is active. Instead `onScroll()` walks the targets and picks the
last one whose top is above 35% of the viewport. Deterministic.

---

## 6. The booking engine

Four steps, driven by `goto(step)`:

```
1 Choose a session → 2 Pick a time → 3 Your details → 4 Request sent
```

State lives in a single object, mirrored to `sessionStorage` under `booking-state`
so a reload mid-flow doesn't lose the visitor's place:

```js
state = { sessionId, slotKey, name, email, company, topic }
```

### 6.1 Slot generation — `buildDays(sess)`

**This is the subtle part.** Times in `content.js` are wall-clock in *her* timezone,
but the visitor's browser is in *theirs*. Constructing `new Date(y, m, d, h, m)`
would silently interpret those hours in the visitor's timezone — so a 7pm IST slot
would show as 7pm to someone in London, which is wrong by 5½ hours.

The fix: **do all arithmetic on UTC parts, and convert to a real instant only at the
end.**

```js
// Her "today", expressed as UTC parts of a shifted timestamp
var nowThere = new Date(Date.now() + OFFSET * 60000);
var y  = nowThere.getUTCFullYear(),
    mo = nowThere.getUTCMonth(),
    da = nowThere.getUTCDate();

for (var i = 0; i <= horizon; i++) {
  var dayUTC = new Date(Date.UTC(y, mo, da + i));   // rolls months/years correctly
  // weekday lookup uses getUTCDay() — never getDay()
  var ranges = B.availability[DAY_KEYS[dayUTC.getUTCDay()]];

  for (var mins = from; mins + sess.duration <= until; mins += step) {
    var utcMs = Date.UTC(…, Math.floor(mins/60), mins%60) - OFFSET * 60000;
    if (utcMs < earliestMs) continue;    // lead time
    …
  }
}
```

Rules that fall out of this:

- **Every** date read uses `getUTC*`. A single `getDay()` reintroduces the bug.
- `Date.UTC(y, mo, da + i)` handles month and year rollover for free — no manual
  day-count arithmetic.
- `step = session.duration + slotGapMinutes`, so a 45-min session with a 15-min gap
  yields hourly starts.
- The loop condition is `mins + duration <= until` — a session must *finish* inside
  the window, not merely start in it.
- `utcMs` is the canonical value. It sorts slots, drives the `.ics`, and powers the
  visitor's local-time note.

`OFFSET` is a **fixed** number from `booking.utcOffsetMinutes` (330 for IST). India
has no DST, so this is safe. **If she ever moves to a DST-observing timezone, this
is the first thing that breaks** — it would need a real timezone library or
`Intl.DateTimeFormat` with a zone name.

### 6.2 Display

- `longDate(day)` builds "Tuesday, 25 August 2026" from hand-rolled `DAY_LONG` /
  `MONTH_LONG` arrays and the day's UTC parts. Deliberately **not**
  `toLocaleDateString()`, which would re-apply the visitor's timezone and could show
  the wrong date.
- `visitorNote(utcMs)` compares the visitor's real offset to `OFFSET` and, only when
  they differ, appends "(Tue, 2:30 pm your time)". Here `toLocaleString()` **is**
  correct, because we genuinely want their local rendering.

### 6.3 Submission — `postToNetlify(form)`

```js
POST "/"  Content-Type: application/x-www-form-urlencoded
body: URLSearchParams(new FormData(form))
```

- Netlify injects `<input name="form-name" value="booking">` into static HTML **at
  deploy time**. It won't exist locally, so the code adds it if missing.
- An `AbortController` plus `Promise.race` enforces **`POST_TIMEOUT_MS = 8000`**.
  Without it a hanging POST leaves the visitor on a disabled "Sending…" button
  forever. This happened on the live site — see [bug #7](#11-bugs-found-and-what-they-teach).
- Resolves `true`/`false`, **never throws**. Failure downgrades to the email path.

`submitState` is `"sent"` | `"failed"` | `"unknown"` and drives the wording on step 4:

| State | Heading | Primary button |
|---|---|---|
| sent | "Request sent" | Add to my calendar |
| failed | "One last step" | Send the request (`mailto:`) |

**The invariant: the page never tells someone their request arrived when it didn't.**

### 6.4 Netlify Forms wiring

In `index.html`:

```html
<form id="details-form" name="booking" method="POST"
      data-netlify="true" data-netlify-honeypot="bot-field" novalidate>
  <p class="sr-only"><label>Leave this field empty
    <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
  <input type="hidden" name="session" value="">
  <input type="hidden" name="requested-time" value="">
  <input type="hidden" name="requested-time-utc" value="">
```

- The form must be **real HTML in the deployed file**. Netlify parses static HTML at
  deploy time; a JS-generated form is never detected.
- Hidden fields are populated in the submit handler so the recorded submission says
  *what* was booked, not just who booked.
- `bot-field` is a honeypot: hidden from people, filled by naive bots, and Netlify
  silently discards those submissions.

**Netlify side, in order:** enable form detection → **redeploy** (detection only
happens when a deploy is parsed) → add an email notification for form `booking`.
Doing this out of order is the usual reason people think Netlify Forms is broken.

### 6.5 The calendar file — `buildIcs()`

A `data:text/calendar` URI on a `download` link. No server, no library.

- **CRLF line endings** (`\r\n`) — required by RFC 5545.
- `DTSTART` / `DTEND` in UTC `Z` form, derived from `slot.utcMs`.
- **`STATUS:TENTATIVE`** — shows as unconfirmed in Google Calendar and Outlook. This
  is the honest signal, and it matters: someone who reads nothing on the page still
  sees "not confirmed" in their own diary.
- Description ends "This slot is held pending confirmation by email."

Worked example, verified live: a 7:00 pm IST slot on 25 Aug 2026 for a 45-minute
session produces `DTSTART:20260825T133000Z` / `DTEND:20260825T141500Z`.
13:30 UTC = 19:00 IST. ✓

---

## 7. `styles.css` — the design system

Warm editorial: cream ground, ink text, terracotta accent, serif headings.
13 numbered sections. Everything is driven by custom properties in `:root`, so a
rebrand is a handful of edits at the top.

### Token groups

`--bg --bg-tint --surface --surface-2` · `--ink --ink-soft --ink-faint` ·
`--line --line-strong` · `--accent --accent-deep --accent-tint --gold` ·
`--ok --err` · **`--on-accent`** · `--serif --sans` · radii · shadows · layout.

### `--on-accent` — the token that fixes dark mode

In light mode the accent is a deep terracotta and text on it is white. In dark mode
the accent becomes a **light peach** — white text on it gives roughly 2.3:1
contrast, which is unreadable.

So `--on-accent` is defined per theme (`#FFFFFF` light, `#1B1310` dark) and used
everywhere anything sits on an accent fill: primary buttons, the step dots, the
"Most booked" badge, the draft banner.

**Rule: never hard-code `#fff` on an accent background. Use `var(--on-accent)`.**

### Dark theme is declared twice, on purpose

```css
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }
:root[data-theme="dark"] { … }
```

The first handles "OS says dark and the visitor hasn't overridden". The second
handles "visitor pressed the toggle". Both are needed; the `:not()` stops the OS
preference overriding an explicit choice of light.

### Three layout rules that are load-bearing

```css
[hidden] { display: none !important; }
```
Any class setting `display:flex/grid` beats the browser's default `[hidden]` rule.
JavaScript uses `hidden` extensively. Without this, hidden things show.

```css
.panel > * { min-width: 0; }
```
Grid items default to `min-width: auto`, so the date strip and slot grid can push
the panel wider than the screen. This pins them back.

```css
.social__label, .cred__title, .cred__meta { display: block; }
```
These are `<span>`s inside generated markup. Inline by default, so the label and the
URL ran together on one line.

### The cut-out portrait

```css
.portrait--cutout { background: none; isolation: isolate; }
.portrait--cutout::before { /* soft warm blob, z-index 0 */ }
.portrait--cutout img { position: relative; z-index: 1;
                        object-fit: contain; border-radius: 0;
                        filter: drop-shadow(…); }
```

`isolation: isolate` creates a stacking context so the `::before` halo doesn't fall
behind the section background. `object-fit: contain` means **nothing is cropped** —
any photo framing works.

---

## 8. The image pipeline

Two standalone Python scripts in `_source-photos/`, using Pillow + NumPy. They are
not part of the site; they are how the assets were made, kept so future images get
identical treatment.

### `make-cutout.py` — portraits

```bash
python3 _source-photos/make-cutout.py <source.jpg> assets/img/<name>.webp
```

1. **Alpha from distance-to-white.** `dist = (255 - rgb).max(axis=2)`, ramped between
   `LO=20` and `HI=52`.
2. **Flood fill inward from the border** to mark true background. Critical: it
   protects white *inside* her — teeth, catchlights.
3. **Erode by ~2px** (`MinFilter(5)`) then **re-feather** (`GaussianBlur(0.9)`). The
   supplied JPGs had a pale rim left from an earlier cut-out; without the erode it
   reads as a halo, and it is glaring on the dark theme.
4. **Crop to the alpha bounding box**, resize to 1200px tall.
5. **Fade the bottom** — `FADE_FRACTION = 0.085`, curve `2.4`. The sources are cropped
   mid-torso and would otherwise end in a hard horizontal line.
6. Save WebP quality 86.

### `make-badge.py` — credential badges

```bash
python3 _source-photos/make-badge.py <source> assets/img/badges/<name>.webp
```

Same border-flood idea, tuned for flat art: `NEAR_WHITE = 232` (the supplied JPGs sat
on `#F7F7F7`, not pure white, with JPEG ringing), binary mask, light feather, crop,
resize to 260px, WebP quality 90.

**The flood fill is the whole point.** These badges have white *inside* them — the
Cornerstone wordmark, the "CORE SYSTEM" panel, the white diamond field. A global
"make white transparent" pass punches holes straight through the artwork.

Result: 17–25 KB each, from 60–290 KB.

### The dark-theme test

**Always check a new cut-out against the dark theme.** A white fringe is nearly
invisible on cream and obvious on charcoal. It is the only reliable check.

---

## 9. Build and deploy

### `make-deploy.sh`

Netlify's manual deploy publishes **every** file you hand it. Dragging the project
root would put `DEPLOY.md`, `README.md`, this file, the original photos and the
processing scripts on the public internet at `deepalijagota.com/DEPLOY.md`.

So `_deploy/` is the publishable subset — 16 files, ~540 KB:

```bash
rsync -a --delete --delete-excluded \
  --exclude '.git' --exclude '.gitignore' \
  --exclude '_deploy' --exclude '_source-photos' --exclude '.claude' \
  --exclude '.DS_Store' --exclude 'README.md' --exclude 'README.txt' \
  --exclude 'DEPLOY.md' --exclude 'KNOWLEDGE.md' \
  --exclude 'serve.js' --exclude 'make-deploy.sh' \
  ./ _deploy/
```

**`--exclude '.git'` is not cosmetic.** Without it rsync copies the entire
repository — full history, every past revision — into `_deploy`, and a manual
Netlify deploy serves it at `deepalijagota.com/.git/`, where anyone can clone it.
This appeared the moment the project was put under version control: `_deploy` went
from 16 files to 85. **Watch the file count that `make-deploy.sh` prints — it should
be 16. Any other number means something is being published that shouldn't be.**

**`--delete-excluded` is essential.** Plain `--exclude` also *protects* matching
files from `--delete`, so anything excluded later lingers in `_deploy` forever. This
bit once: `serve.js` survived its own exclusion.

### `serve.js`

60 lines, Node, no dependencies. Serves `_deploy` or the project root on :4321.

**It returns 405 for any non-GET.** That is not pedantry — see
[bug #5](#11-bugs-found-and-what-they-teach). A static server answering 200 to a POST
made the booking form report success locally when nothing had been recorded.

### Workflow

```bash
# edit content.js
./make-deploy.sh
# drag _deploy onto Netlify  — or, once the repo is linked:
git add -A && git commit -m "…" && git push
```

`_deploy/` **is committed** to git. Committing build output is normally poor practice;
here it means Netlify can publish `_deploy` directly with **no build command** to
configure or break. The reasoning is written into `.gitignore`.

### Git

- Remote is **SSH**: `git@github.com:ashmitsharma14/deepali-jagota-portfolio.git`.
  HTTPS push fails with `HTTP 403` on this machine — Zscaler blocks it.
- Repo-local `user.email` is the GitHub noreply address, deliberately not the global
  work address.

---

## 10. Hosting, domain and DNS

| | |
|---|---|
| Primary | `deepalijagota.com` (apex) |
| Redirects to primary | `www.deepalijagota.com` |
| Netlify project | `deepalijagota` → `deepalijagota.netlify.app` |

### DNS at GoDaddy

| Type | Name | Value |
|---|---|---|
| A | `@` | `75.2.60.5` |
| CNAME | `www` | `deepalijagota.netlify.app` |

Both required. GoDaddy does not support ALIAS/ANAME on an apex, so an `A` record at
Netlify's load balancer is the only route for the bare domain.

- **Edit GoDaddy's existing parking rows**, don't add duplicates — two conflicting
  records on one name make the site load intermittently.
- Don't move nameservers to Netlify. Don't use GoDaddy "Forwarding" (breaks HTTPS
  and indexing).

### The canonical rule

**Netlify's primary domain and the site's `<link rel="canonical">` must agree.**
Pointing the canonical at a URL that redirects elsewhere sends contradictory signals
to search engines. Apex is primary, so canonical, `og:url`, `sitemap.xml` and
`robots.txt` all say `https://deepalijagota.com`.

Netlify recommends `www` as primary with external DNS (the apex can't use DNS-level
CDN routing). Apex was chosen anyway — nicer on a résumé, marginal difference at this
traffic. To switch, change the primary **and** all six references together.

### Two Netlify defaults that will confuse you

- **Private by default** (teams created after 28 Jul 2026). New projects sit behind a
  team login wall; you get an `app.netlify.com/edge-access` page, not your site.
  Fix: *Project configuration → General → Visitor access → Project visibility → Public.*
- **"Powered by Netlify" badge** (free-plan projects created on/after 19 Aug 2026).
  A custom domain does **not** remove it.
  Fix: *Project configuration → General → Powered by Netlify badge → off.*

---

## 11. Bugs found, and what they teach

The most valuable section. Each cost real time.

**1. `[hidden]` overridden by class `display`.** The photo switcher's label showed
even with `hidden` set, because `.photoswitch { display: flex }` outranks the UA
rule. → global `[hidden] { display: none !important; }`.

**2. Grid items overflowing the viewport.** On mobile the booking panel ran off-screen
because grid items default to `min-width: auto` and the date strip forced the track
wider. → `.panel > * { min-width: 0; }`.

**3. Inline spans running together.** "LinkedIn" and its URL rendered on one line;
same for credential title/issuer/note. Generated `<span>`s are inline. → `display: block`.

**4. `rsync --exclude` also protects from `--delete`.** An excluded file already in the
destination is never removed. → `--delete-excluded`.

**5. A test harness that lied.** `serve.js` returned 200 to POST, so the booking form
reported "Request sent" locally when nothing had been recorded — the worst kind of
bug, because it reassures a visitor while dropping their booking. → 405 on non-GET.
**Lesson: a harness that can't fail can't verify anything.**

**6. "Confirmed" overpromised.** Step 4 was labelled *Confirmed* when nothing was.
→ renamed *Request sent*, plus an explicit reply-window promise.

**7. No timeout on the POST.** A hanging submission left the visitor on a disabled
"Sending…" button indefinitely — observed live, ~60 seconds. → `POST_TIMEOUT_MS`
8000 with `AbortController` + `Promise.race`. Verified: hangs release at 8,094 ms,
fast failures still return in 55 ms.

**8. Variable shadowing corrupted the summary.** A new `var when` for the reply
window shadowed the existing `var when` holding the appointment time, so the summary
showed **"When: (usually within two working days)"**. → renamed `replyWindow`.
**Lesson: this passed every programmatic assertion — `done-line` and the heading were
both correct. Only the rendered screenshot exposed it. Look at the page, don't just
query it.**

**9. Netlify HTTPS push blocked.** `gh repo create --push` failed `HTTP 403` (Zscaler).
→ SSH remote.

---

## 12. How to verify a change

```bash
node serve.js          # http://localhost:4321
```

Then, in order of how often each catches something:

1. **Look at it.** Screenshot desktop *and* mobile. Bug #8 was invisible to assertions.
2. **Dark mode.** Toggle it. Contrast and cut-out fringes only show here.
3. **Console.** Zero errors.
4. **The full booking flow** — session → slot → details → confirmation.
5. **Check the `.ics`** — decode the `data:` URI and confirm `DTSTART` in UTC matches
   the displayed local time.
6. **Mobile at 375px** — confirm `document.documentElement.scrollWidth === innerWidth`
   (no horizontal overflow).
7. **After deploying**, re-check on the live URL. Paths are case-sensitive on Netlify
   and case-insensitive on macOS: `Assets/img` works locally and 404s in production.

---

## 13. Known limitations

- **No real calendar integration.** Slots come from declared availability. Two people
  can request the same slot. Mitigated by wording, not prevented. Fix: `schedulingUrl`.
- **No acknowledgement email to the visitor.** They get the on-screen message and the
  `.ics`; the real confirmation is Deepali's reply. A static site has nothing to send
  mail with. Fix: a Netlify Function + Resend/SendGrid.
- **Fixed UTC offset.** Fine for IST (no DST). Breaks if she moves to a DST timezone.
- **Content is JS-rendered.** Google executes JS so search is fine; link previews are
  handled by the hand-written `og:` tags.
- **Netlify Forms free tier: 100 submissions/month.**
- **The 2022 and 2023 Credly links** point at SuccessCOACHING's generic org badge
  pages, not her personal earned badges. The 2024 and both Cornerstone links are
  personal and verify to her.

---

## 14. Rebuilding from scratch

Order that avoids rework:

1. **`content.js` first.** Define the shape before writing any rendering. The schema
   is the design.
2. **`styles.css` tokens.** `:root`, both dark blocks, `--on-accent`. Get theming
   right before any component.
3. **`index.html` shells.** Ids and `data-bind` hooks, no copy.
4. **`main.js` §1–5.** Theme, bindings, hero, services, achievements. Now you have a
   working portfolio.
5. **`main.js` §6 booking.** Slot engine first (`buildDays`) — it's the hard part and
   everything else depends on its data shape. Then the step machine, then `.ics`,
   then the Netlify POST.
6. **`main.js` §7–9.** Newsletter, socials, header/motion.
7. **Image pipeline.** Process portraits and badges; check against dark mode.
8. **`serve.js` + `make-deploy.sh`.** Make the server 405 on POST from the start.
9. **Deploy**, then wire Netlify Forms (enable → redeploy → notification), then DNS.

### The five things to get right

1. Slot maths on **UTC parts only** — one `getDay()` reintroduces the timezone bug.
2. **`--on-accent`**, never hard-coded white on accent.
3. **`[hidden] { display: none !important; }`** and **`min-width: 0`** on grid children.
4. The booking flow must **never claim success it can't verify**, and must always
   release the visitor (timeout).
5. Deploy `_deploy`, never the project root.
