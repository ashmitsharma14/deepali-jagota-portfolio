# Going live — deepalijagota.com

| | |
|---|---|
| Domain | **deepalijagota.com** (registered at GoDaddy) |
| Primary address | **https://deepalijagota.com** — `www` redirects to it |
| Host | Netlify, project **deepalijagota** (`deepalijagota.netlify.app`) |
| Live now at | https://deepalijagota.netlify.app |

The site files already point at `https://deepalijagota.com` — canonical link,
Open Graph tags, `sitemap.xml` and `robots.txt`. Nothing left to edit in the code.

---

## Status

- [x] Site deployed to Netlify and publicly reachable
- [x] Both domains registered in Netlify, apex set as primary
- [ ] **Enable Netlify Forms + email notification** — do this first, it's the one
      that affects whether bookings actually reach her
- [ ] **Redeploy `_deploy`** so the form and the apex-domain meta tags go live
- [ ] **Turn off the "Powered by Netlify" badge** — 10 seconds
- [ ] **Add two DNS records at GoDaddy** — the last real step
- [ ] Certificate goes green on its own afterwards

---

## Step 1 — Enable Netlify Forms (the important one)

Without this, a booking only reaches her if the visitor opens their email app and
presses Send. On a desktop with no mail client configured, clicking that button
does nothing at all — and neither of you would ever know someone tried.

With it, Netlify records every submission server-side and emails her, regardless
of the visitor's setup.

1. **Project configuration → Forms → Enable form detection**
2. **Redeploy** — drag the `_deploy` folder on again. Netlify only detects forms
   when it parses a deploy, so the existing deploy won't have it.
3. **Forms → Form notifications → Add notification → Email notification**
   - Event: *New form submission*
   - Form: `booking`
   - Email to: `deepali22aug@gmail.com`

After that, a submission appears under **Forms → booking** in the dashboard and
lands in her inbox.

The free tier covers **100 submissions per month**, which is far beyond a few
consultation slots. A hidden honeypot field is already in the form, so bots that
blind-fill everything get discarded automatically.

### How to check it worked

Book a slot on the live site. The confirmation screen should say **"Request
sent"**. If it says **"One last step"** instead, the submission did not land —
form detection isn't enabled, or the deploy predates it. The page deliberately
never claims a request arrived when it didn't.

---

## Step 2 — Turn off the Netlify badge

There's a floating "Powered by Netlify" card on the live site. Netlify switched
this on by default for free-plan projects created on or after 19 August 2026.
Third-party branding doesn't belong on a personal portfolio, and **a custom
domain does not remove it** — it has to be turned off.

**Project configuration → General → Powered by Netlify badge** → off → save.

Takes effect on the next request. No redeploy needed.

---

## Step 3 — Add two DNS records at GoDaddy

Sign in to the GoDaddy account that owns the domain — whichever email that is.
It does not need to match the Netlify account; the two services never talk to
each other.

**My Products → deepalijagota.com → DNS → Manage Zones**

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `75.2.60.5` | 1 hour / default |
| CNAME | `www` | `deepalijagota.netlify.app` | 1 hour / default |

Both are needed. The `A` record serves the bare domain — GoDaddy doesn't support
ALIAS/ANAME records on a bare domain, so an `A` record pointing at Netlify's load
balancer is the only route. `75.2.60.5` is Netlify's published address for this.
The `CNAME` handles `www`, which redirects to the bare domain.

### The one trap

**GoDaddy ships parking-page records.** There will almost certainly already be
rows on `@` and often `www`. **Edit those existing rows** rather than adding
second ones. Two conflicting records on the same name make the site load
intermittently — miserable to diagnose, especially while you're also wondering
whether it's just propagation.

### Don't do these

- **Don't change the nameservers** to Netlify's. That hands DNS for the whole
  domain to Netlify for the sake of one site. Two records is enough.
- **Don't use GoDaddy's "Forwarding"** feature, however much it looks like the
  easy option. It breaks HTTPS and search indexing.

---

## Step 4 — Wait, then verify

Propagation is usually minutes; GoDaddy quotes up to 48 hours worst case.

In Netlify's **Domain management**, both rows flip from "Pending DNS
verification" to verified on their own, and the **SSL/TLS certificate** section
moves off "Waiting on DNS propagation". Netlify provisions a free Let's Encrypt
certificate automatically — you don't buy or install anything.

Then check, in this order:

- [ ] `https://deepalijagota.com` loads with a padlock
- [ ] `https://www.deepalijagota.com` redirects to the bare domain
- [ ] `http://` versions redirect to `https://`
- [ ] The portrait and all five badges appear
- [ ] Book a session end to end: pick a session → pick a slot → fill the form →
      the email draft opens addressed to `deepali22aug@gmail.com`, and
      "Add to my calendar" downloads a working `.ics`
- [ ] Paste the URL into a WhatsApp chat with yourself — the preview card should
      show her name, photo and description

That last one is the only thing that can look broken while everything else is
fine, because link previews cache hard. If it shows nothing, force a refresh with
[LinkedIn's Post Inspector](https://www.linkedin.com/post-inspector/).

---

## Step 5 — Put it to work

- **LinkedIn profile:** Edit intro → **Website** → `https://deepalijagota.com`,
  labelled "Portfolio".
- **LinkedIn Featured:** add it there too — it renders as a preview card, which is
  why the check above matters.
- **Résumé:** `deepalijagota.com` in the header, next to her email.
- **Email signature:** same.

---

## Making changes later

1. Edit `content.js`
2. Run `./make-deploy.sh`
3. Drag the **`_deploy`** folder onto Netlify

Always deploy `_deploy`, never the project folder — `_deploy` excludes these
notes, the original photos and the processing scripts, which would otherwise be
published at `deepalijagota.com/DEPLOY.md` and similar.

If dragging folders gets tiresome, connect this folder to a GitHub repo and point
Netlify at it; every commit then deploys itself. Unnecessary for a site that
changes a few times a year.

---

## A note on primary domain choice

Netlify's own guidance is to prefer `www` as primary when using external DNS,
because a bare domain can only be reached through that single `A` record IP and
can't use Netlify's DNS-level CDN routing. `www` goes through a CNAME and gets
the full global routing.

We went with the bare domain as primary anyway — it's the nicer address to print
on a résumé, and the routing difference is marginal for a low-traffic personal
site. If you ever want to switch: set `www` as primary in Netlify, then change
`canonical` and the two `og:` tags in `index.html`, plus `site.url` in
`content.js`, `sitemap.xml` and `robots.txt`. **Netlify's primary domain and the
site's canonical tag must always agree** — pointing the canonical at a URL that
redirects elsewhere sends search engines contradictory signals.

---

## Renewal

The domain renews through GoDaddy on that account's billing. Worth confirming the
renewal date and that auto-renew is on — a lapsed domain takes the site down and
the address can then be bought by anyone. Netlify's free tier has no expiry and
no card on file.
