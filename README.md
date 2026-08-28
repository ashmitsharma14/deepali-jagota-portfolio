# Portfolio website

A single-page portfolio and consultation-booking site. No build step, no framework,
no dependencies — plain HTML, CSS and JavaScript. Open `index.html` in a browser and
it works.

**This folder is the project.** Everything lives here, and anything new you want
added — a photo, a badge, a document — can just be dropped in this folder.

```
index.html                    page structure
content.js                    ← THE ONLY FILE YOU NORMALLY EDIT
assets/css/styles.css         colours, type, layout
assets/js/main.js             renders the page + runs the booking flow
assets/img/                   the portrait, favicon
assets/img/badges/            the five achievement badges
_source-photos/               untouched originals + the two processing scripts
serve.js                      tiny local preview server (optional, needs Node)
```

Page order: **About → How I help → Achievements → Book a consultation + Connect**
(booking and the socials/newsletter deliberately sit in the same section).

---

## 1. Status

The site files are finished. Content, portrait, badges, availability, domain and
meta tags are all in, and the draft banner is off.

What's left is all in the Netlify and GoDaddy dashboards, not in the code —
see **DEPLOY.md** for the click-by-click:

| | |
|---|---|
| Enable **Netlify Forms** + email notification | otherwise bookings only arrive if the visitor sends the email themselves |
| Turn off the **Powered by Netlify** badge | third-party branding on her portfolio |
| Add **two DNS records** at GoDaddy | the last step before the domain works |

Optional, whenever she wants it: a real newsletter endpoint (§5).

---

## 2. The portrait

**Done — the red-blazer photo is the one in use**, at `assets/img/deepali-red.webp`.

Both candidates arrived as JPGs on a white studio background, which would have shown
as a white box on the cream page, so both were processed:

- the white background was cut out to real transparency, with the pale rim around
  the hair eroded away so there's no halo (it's checked against the dark theme too,
  which is where a bad cut-out shows immediately);
- the bottom edge — where the original was cropped mid-torso — now fades out, so she
  dissolves into the page instead of ending in a hard horizontal line;
- converted to WebP: **139 KB and 162 KB, down from ~1.9 MB** as equivalent PNGs.
  Same visual quality, and the page still loads instantly. WebP with transparency
  works in every browser from 2020 onwards.

The untouched originals are in `_source-photos/`, along with `make-cutout.py` — the
script that did the work. Any future photo can be run through the same treatment:

```bash
python3 _source-photos/make-cutout.py _source-photos/newphoto.jpg assets/img/name.webp
```

The site uses a **cut-out** treatment (`person.photoStyle: "cutout"`) — she floats on
a soft warm halo rather than sitting in a cropped card. Nothing gets cropped, so the
wide arms-crossed pose works as well as the tight head-and-shoulders one.

### The navy version

`assets/img/deepali-navy.webp` is still in the folder, processed and ready, just not
referenced by the page. It's the more conventional corporate headshot and suits
LinkedIn's circular crop well. To bring it back onto the site — or to compare the two
again — add this line to `person.photoOptions` in `content.js`:

```js
{ label: "Navy blazer", src: "assets/img/deepali-navy.webp", style: "cutout" }
```

With two or more options, a **Compare photo** switcher reappears under the portrait
(while `site.draftMode` is true) so you can flip between them on the live page.

If you ever use a normal rectangular photo (with a real background) instead, set
`person.photoStyle: "framed"` and it goes back to a cropped rounded card.

### Preview it locally

```bash
node serve.js
```

Then open <http://localhost:4321>. (Double-clicking `index.html` also works for a
quick look.)

---

## 3. How the booking flow works

Four steps: **choose a session → pick a date and time → your details → confirmed.**

The time slots are generated from `booking.availability` in `content.js`:

```js
availability: {
  tue: ["19:00-21:00"],
  thu: ["19:00-21:00"],
  sat: ["10:00-13:00"],
  …
}
```

Times are 24-hour, in **her** timezone (`booking.timezoneLabel` /
`utcOffsetMinutes`). The site slices each range into slots the length of the chosen
session, skips anything inside `leadTimeHours`, skips `blockedDates`, and shows the
next `horizonDays` worth. A visitor in another timezone sees her hours labelled
"IST", plus their own local equivalent on the confirmation screen.

### How the booking actually reaches her

On submit, the form is POSTed to **Netlify Forms**, which records the submission and
emails her. This does not depend on the visitor having a working mail app — which
matters, because a `mailto:` link silently does nothing for anyone browsing on a
desktop with no mail client configured, and that is a lot of people.

The confirmation screen then offers **Add to my calendar** (a `.ics` file marked
*tentative*) and, as a secondary option, an email with the same details pre-filled.

If the POST fails — offline, or form detection not enabled — the screen changes from
"Request sent" to "One last step" and promotes the email button instead. It never
tells someone their request is with her when it isn't.

**One thing it still can't do:** see her real calendar. That's why the last step is a
*request she confirms* rather than a done deal — honest, and it prevents
double-booking. She replies with the Google Meet link and it's booked.

### If you'd rather have real live availability

Put a Calendly (or Cal.com) link in `booking.schedulingUrl` and the site
automatically swaps its own picker for the real calendar — free tier is enough, and
it checks her actual Google/Outlook calendar so double-booking becomes impossible.
Everything else on the page stays exactly the same.

```js
schedulingUrl: "https://calendly.com/her-name",
schedulingEmbed: true,   // true = calendar inline on the page, false = a button
```

---

## 4. The achievement badges

**Done — all five are in** at `assets/img/badges/`.

They were supplied on solid white backgrounds, which would have shown as white
squares on the cards (and badly on the dark theme), so each was run through
`_source-photos/make-badge.py`:

- the white background flood-filled to transparency **from the border inward**,
  which matters because these badges have white *inside* them — the Cornerstone
  wordmark, the "CORE SYSTEM" panel, the white diamond field. A plain
  "make white transparent" pass would have punched holes through the artwork;
- resized to 260 px and converted to WebP — **17–25 KB each**, down from
  60–290 KB.

To add another badge later:

```bash
python3 _source-photos/make-badge.py <source> assets/img/badges/<name>.webp
```

…then add an entry to `credentials.items` in `content.js` with `image:` pointing
at it. A missing file is never fatal — the card falls back to a drawn icon.

The Credly links are in place and verified:

| Achievement | Link |
|---|---|
| Top 100 CS Strategist 2024 | her personal badge (`9f9efefa…`) |
| Top 100 CS Strategist 2023 | SuccessCOACHING org badge page |
| Top 100 CS Strategist 2022 | SuccessCOACHING org badge page |
| Cornerstone Learning Management Expert | her personal badge (`bf15ee32…`) |
| Cornerstone Core System Specialist | her personal badge (`235f6432…`) |

The 2022 and 2023 links point at SuccessCOACHING's generic badge pages rather than
her own earned badge — if she can find her personal Credly links for those two
years, swap them in and all five will verify to her name.

---

## 5. Newsletter

Set `newsletter.action` to the form endpoint from whichever provider she uses:

| Provider | `action` |
|---|---|
| Substack | `https://HERNAME.substack.com/api/v1/free` |
| Buttondown | `https://buttondown.email/api/emails/embed-subscribe/HERNAME` |
| Mailchimp | the `action` URL from its embedded-form code |
| Formspree | `https://formspree.io/f/XXXXXXX` |

Leave it empty and the subscribe box falls back to opening an email — still
functional, just manual.

---

## 6. Putting it online

Static files, so almost any host works and the free tiers are genuinely enough.

### Netlify — easiest, no command line

1. Sign up at [netlify.com](https://www.netlify.com).
2. **Sites** → drag this whole folder onto the drop zone. Live in seconds on a
   `something.netlify.app` address.
3. **Domain management → Add a domain** → enter the domain you bought, then add the
   two DNS records it shows you at your registrar.
4. HTTPS switches on automatically.

To update later, drag the folder on again.

Cloudflare Pages and Vercel work the same way (build command: none, output
directory: `/`). GitHub Pages needs the files in a repo.

### Before going live — swap in the real domain

Link previews (WhatsApp, LinkedIn, Slack) don't run JavaScript, so they can't read
`content.js`. The **OG TAGS** block near the top of `index.html` already has her
name and description — you just need to replace `⟨herdomain⟩` in `og:image` and
`og:url` with the real domain. Do the same for `site.url` in `content.js`.

---

## 7. Adding it to LinkedIn and a résumé

- **LinkedIn profile:** Edit intro → **Website** → paste the URL, label it "Portfolio".
- **LinkedIn Featured section:** add it there too — it renders as a preview card,
  which is why the OG tags above matter.
- **Résumé:** the bare domain under her name in the header, next to her email.

---

## 8. Things worth knowing

- **Dark mode** follows the visitor's system setting; the sun/moon button overrides
  it and the choice is remembered.
- **Nothing is tracked.** No analytics, no cookies, no third-party fonts or scripts.
  The only external requests are ones you add (Calendly, a newsletter provider).
- **Accessibility:** keyboard-navigable, visible focus rings, labelled fields,
  respects "reduce motion".
- **No data is stored anywhere.** Form entries only ever become an email draft or a
  calendar file on the visitor's own machine. There is no server and no database —
  which is exactly why there's nothing to secure or maintain.
- **Removing a section:** `services.show: false` or `newsletter.show: false`. Empty
  arrays (`stats`, `credentials.items`, `socials`) hide their sections too.
