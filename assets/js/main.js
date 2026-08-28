/* ============================================================================
   main.js — renders the site from content.js and runs the slot-booking flow.
   You should not need to edit this file to change any text, session or link.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE;
  if (!S) { console.error("content.js did not load — the site has nothing to render."); return; }

  /* ---------------------------------------------------------------- utils */
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function get(path) {
    return path.split(".").reduce(function (o, k) {
      return (o && o[k] !== undefined && o[k] !== null) ? o[k] : null;
    }, S);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------------------------------------------------------------- icons */
  var ICONS = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.2 5.2-5.2 2.2 2.2-5.2z"/>',
    shield:  '<path d="M12 3l7 3v5.5c0 4.3-2.9 8.2-7 9.5-4.1-1.3-7-5.2-7-9.5V6z"/><path d="M9.2 12.2l2 2 3.6-4"/>',
    spark:   '<path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7z"/><path d="M18 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    growth:  '<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>',
    heart:   '<path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20z"/>',
    people:  '<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.6 5.6 0 0 1 11 0"/><path d="M16 6.5a3 3 0 0 1 0 5.8"/><path d="M17.5 15c2 .7 3.2 2.2 3.2 4"/>',
    medal:   '<circle cx="12" cy="14.5" r="5"/><path d="M12 12.6l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/><path d="M8.5 9.6L6 3h12l-2.5 6.6"/>',
    seal:    '<path d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.8-2.7.2-.9-2.6L4 15.2l1-2.5-1-2.5 2.2-1.6.9-2.6 2.7.2z"/><path d="M9.4 12.2l1.9 1.9 3.4-3.8"/>',
    check:   '<path d="M4.5 12.5l5 5 10-11"/>',
    arrow:   '<path d="M5 12h13M13 6l6 6-6 6"/>',
    linkedin:'<path d="M4.5 9h3.2v10.5H4.5zM6.1 4.2a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8z" fill="currentColor" stroke="none"/><path d="M10.2 9h3v1.5a3.4 3.4 0 0 1 3-1.6c2.5 0 3.6 1.6 3.6 4.3v6.3h-3.2v-5.7c0-1.4-.5-2.3-1.7-2.3-1 0-1.6.7-1.8 1.4-.1.3-.1.6-.1 1v5.6h-3.2z" fill="currentColor" stroke="none"/>',
    email:   '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.8 7.2l7.1 5.3c.7.5 1.6.5 2.2 0l7.1-5.3"/>',
    x:       '<path d="M4 4l16 16M20 4L4 20"/>',
    medium:  '<circle cx="7" cy="12" r="4.2"/><ellipse cx="15.4" cy="12" rx="2.1" ry="4.2"/><ellipse cx="20.3" cy="12" rx=".9" ry="4.2"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.6 9.6l4.4 2.4-4.4 2.4z"/>',
    globe:   '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.2v3.4M16 3.2v3.4"/>'
  };

  function svg(name, cls) {
    var body = ICONS[name] || ICONS.globe;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" ' +
           'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
           body + '</svg>';
  }

  /* =========================================================== 1. THEME */
  var root = document.documentElement;
  var themeBtn = $("#theme-toggle");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentTheme() {
    return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
  }
  function applyTheme(mode) {
    if (mode) root.setAttribute("data-theme", mode);
    if (themeBtn) {
      var next = currentTheme() === "dark" ? "light" : "dark";
      themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
      themeBtn.setAttribute("title", "Switch to " + next + " theme");
    }
  }
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) { /* private browsing — fall back to the OS setting */ }
  applyTheme();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ==================================================== 2. SIMPLE BINDINGS */
  $$("[data-bind]").forEach(function (el) {
    var path = el.getAttribute("data-bind");
    var raw = path.indexOf(".") === -1
      ? (S.person[path] !== undefined ? S.person[path] : get(path))
      : get(path);
    el.textContent = (raw === null || raw === undefined) ? "" : raw;
  });

  $$("[data-show]").forEach(function (el) {
    var p = el.getAttribute("data-show");
    var v = p.indexOf(".") === -1 ? S.person[p] : get(p);
    if (!v) el.hidden = true;
  });

  document.title = S.site.metaTitle || document.title;
  var metaDesc = $('meta[name="description"]');
  if (metaDesc && S.site.metaDescription) metaDesc.setAttribute("content", S.site.metaDescription);

  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var banner = $("#draft-banner");
  if (banner) {
    if (S.site.draftMode) banner.hidden = false;
    $(".draft-banner__close", banner).addEventListener("click", function () { banner.hidden = true; });
  }

  /* ============================================================== 3. HERO */
  var bioEl = $("#hero-bio");
  if (bioEl) {
    bioEl.innerHTML = (S.person.bio || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  }

  var portraitFig = $("#portrait");
  var portrait = $("#portrait-img");

  function showPhoto(src, style) {
    portrait.src = src || "assets/img/portrait-placeholder.svg";
    portraitFig.classList.toggle("portrait--cutout", (style || S.person.photoStyle) === "cutout");
  }

  if (portrait) {
    portrait.alt = S.person.photoAlt || (S.person.name + " — portrait");
    showPhoto(S.person.photo, S.person.photoStyle);

    // A missing file shouldn't leave a broken-image icon on the page. The
    // placeholder is a framed 4:5 graphic, so drop the cut-out treatment too.
    portrait.addEventListener("error", function () {
      if (portrait.getAttribute("src") === "assets/img/portrait-placeholder.svg") return;
      portrait.src = "assets/img/portrait-placeholder.svg";
      portraitFig.classList.remove("portrait--cutout");
    });
  }

  // Photo switcher — only while the site is still a draft.
  var photoOptions = S.person.photoOptions || [];
  var switcher = $("#photoswitch");
  if (switcher && S.site.draftMode && photoOptions.length > 1) {
    $("#photoswitch-btns").innerHTML = photoOptions.map(function (o, i) {
      var on = o.src === S.person.photo || (i === 0 && !S.person.photo);
      return '<button type="button" class="photoswitch__btn' + (on ? " is-on" : "") +
        '" data-photo="' + esc(o.src) + '" data-style="' + esc(o.style || "cutout") +
        '" aria-pressed="' + on + '">' + esc(o.label) + "</button>";
    }).join("");

    switcher.hidden = false;
    switcher.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-photo]");
      if (!btn) return;
      showPhoto(btn.getAttribute("data-photo"), btn.getAttribute("data-style"));
      $$(".photoswitch__btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
    });
  }

  var statsEl = $("#stats");
  if (statsEl && S.stats && S.stats.length) {
    statsEl.innerHTML = S.stats.map(function (s) {
      return "<li><b>" + esc(s.value) + "</b><span>" + esc(s.label) + "</span></li>";
    }).join("");
    statsEl.hidden = false;
  }

  /* ====================================================== 4. HOW I HELP */
  var svcSection = $("#services");
  if (svcSection && S.services && S.services.show && (S.services.items || []).length) {
    $("#services-list").innerHTML = S.services.items.map(function (it) {
      return '<li class="card" data-reveal>' +
               '<div class="card__icon">' + svg(it.icon) + "</div>" +
               "<h3>" + esc(it.title) + "</h3>" +
               "<p>" + esc(it.body) + "</p>" +
             "</li>";
    }).join("");
    svcSection.hidden = false;
  } else if (svcSection) {
    var svcNav = $('[data-nav="services"]');
    if (svcNav) svcNav.remove();
  }

  /* ==================================================== 5. ACHIEVEMENTS */
  function credMarkup(c) {
    var isCert = c.kind === "cert";
    var tag = c.url ? "a" : "div";
    var href = c.url ? ' href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer"' : "";

    // Real badge artwork if it's been added; a drawn icon until then.
    var mark = c.image
      ? '<span class="cred__medal cred__medal--img"><img src="' + esc(c.image) +
        '" alt="" loading="lazy" decoding="async" data-fallback="' + (isCert ? "seal" : "medal") + '"></span>'
      : '<span class="cred__medal">' + svg(isCert ? "seal" : "medal") + "</span>";

    return "<li>" +
      "<" + tag + ' class="cred ' + (isCert ? "cred--cert" : "cred--award") + '"' + href + " data-reveal>" +
        mark +
        "<span>" +
          '<span class="cred__title">' + esc(c.title) +
            (c.year ? '<span class="cred__year">' + esc(c.year) + "</span>" : "") +
          "</span>" +
          (c.issuer ? '<span class="cred__meta">' + esc(c.issuer) + "</span>" : "") +
          (c.note ? '<span class="cred__note">' + esc(c.note) + "</span>" : "") +
          (c.url ? '<span class="cred__out">Verify on Credly →</span>' : "") +
        "</span>" +
      "</" + tag + ">" +
    "</li>";
  }

  var creds = (S.credentials && S.credentials.items) || [];
  var awards = creds.filter(function (c) { return c.kind !== "cert"; });
  var certs  = creds.filter(function (c) { return c.kind === "cert"; });

  if (awards.length) $("#awards-list").innerHTML = awards.map(credMarkup).join("");
  else $("#awards-col").hidden = true;

  if (certs.length) $("#certs-list").innerHTML = certs.map(credMarkup).join("");
  else $("#certs-col").hidden = true;

  // If a badge image file isn't there yet, swap in the drawn icon silently.
  $$(".cred__medal--img img").forEach(function (img) {
    img.addEventListener("error", function () {
      var holder = img.parentNode;
      holder.classList.remove("cred__medal--img");
      holder.innerHTML = svg(img.getAttribute("data-fallback"));
    });
  });

  /* ======================================================== 6. BOOKING */
  var B = S.booking || {};
  var sessions = B.sessions || [];
  var STORE_KEY = "booking-state";

  var DAY_KEYS   = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var DAY_SHORT  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_LONG   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTH_SHORT= ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"];

  var OFFSET = Number(B.utcOffsetMinutes) || 0;   // her timezone, minutes east of UTC

  var state = { sessionId: null, slotKey: null, name: "", email: "", company: "", topic: "" };
  var days = [];          // [{ key, y, m, d, weekday, slots: [{key, minutes, utcMs}] }]
  var activeDayKey = null;

  function saveState() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) {}
  }
  function session() {
    return sessions.filter(function (s) { return s.id === state.sessionId; })[0] || null;
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function toMinutes(hhmm) {
    var bits = String(hhmm).split(":");
    return Number(bits[0]) * 60 + Number(bits[1] || 0);
  }
  function timeLabel(minutes) {
    var h = Math.floor(minutes / 60), m = minutes % 60;
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + pad(m) + " " + suffix;
  }

  /* ----- slot generation -------------------------------------------------
     Times in content.js are wall-clock in HER timezone. To keep them correct
     for a visitor anywhere in the world, every calculation runs on UTC parts
     and only converts to a real instant at the end.
     -------------------------------------------------------------------- */
  function buildDays(sess) {
    var out = [];
    if (!sess) return out;

    var nowThere = new Date(Date.now() + OFFSET * 60000);   // her wall clock, as UTC parts
    var y = nowThere.getUTCFullYear(), mo = nowThere.getUTCMonth(), da = nowThere.getUTCDate();
    var earliestMs = Date.now() + (Number(B.leadTimeHours) || 0) * 3600000;
    var horizon = Number(B.horizonDays) || 28;
    var step = sess.duration + (Number(B.slotGapMinutes) || 0);
    var blocked = B.blockedDates || [];

    for (var i = 0; i <= horizon; i++) {
      var dayUTC = new Date(Date.UTC(y, mo, da + i));
      var key = dayUTC.getUTCFullYear() + "-" + pad(dayUTC.getUTCMonth() + 1) + "-" + pad(dayUTC.getUTCDate());
      if (blocked.indexOf(key) !== -1) continue;

      var ranges = (B.availability && B.availability[DAY_KEYS[dayUTC.getUTCDay()]]) || [];
      if (!ranges.length) continue;

      var slots = [];
      ranges.forEach(function (range) {
        var bits = String(range).split("-");
        var from = toMinutes(bits[0]), until = toMinutes(bits[1]);
        for (var mins = from; mins + sess.duration <= until; mins += step) {
          var utcMs = Date.UTC(
            dayUTC.getUTCFullYear(), dayUTC.getUTCMonth(), dayUTC.getUTCDate(),
            Math.floor(mins / 60), mins % 60
          ) - OFFSET * 60000;
          if (utcMs < earliestMs) continue;
          slots.push({ key: key + "T" + pad(Math.floor(mins / 60)) + ":" + pad(mins % 60), minutes: mins, utcMs: utcMs });
        }
      });

      if (slots.length) {
        slots.sort(function (a, b) { return a.utcMs - b.utcMs; });
        out.push({
          key: key,
          y: dayUTC.getUTCFullYear(), m: dayUTC.getUTCMonth(), d: dayUTC.getUTCDate(),
          weekday: dayUTC.getUTCDay(),
          slots: slots
        });
      }
    }
    return out;
  }

  function findSlot(slotKey) {
    for (var i = 0; i < days.length; i++) {
      for (var j = 0; j < days[i].slots.length; j++) {
        if (days[i].slots[j].key === slotKey) return { day: days[i], slot: days[i].slots[j] };
      }
    }
    return null;
  }

  function longDate(day) {
    return DAY_LONG[day.weekday] + ", " + day.d + " " + MONTH_LONG[day.m] + " " + day.y;
  }

  // If the visitor isn't in her timezone, tell them what it means for them.
  function visitorNote(utcMs) {
    var localOffset = -new Date(utcMs).getTimezoneOffset();
    if (localOffset === OFFSET) return "";
    var local = new Date(utcMs);
    try {
      return " (" + local.toLocaleString(undefined, {
        weekday: "short", hour: "numeric", minute: "2-digit"
      }) + " your time)";
    } catch (e) { return ""; }
  }

  /* ----- Step 1: session cards ----- */
  $("#packages").innerHTML = sessions.map(function (p) {
    return '<li class="pkg' + (p.featured ? " pkg--featured" : "") + '" data-reveal>' +
      (p.badge ? '<span class="pkg__badge">' + esc(p.badge) + "</span>" : "") +
      '<h3 class="pkg__name">' + esc(p.name) + "</h3>" +
      '<p class="pkg__dur">' + esc(p.duration) + " minutes</p>" +
      '<p class="pkg__summary">' + esc(p.summary) + "</p>" +
      '<ul class="pkg__list">' + (p.includes || []).map(function (i) {
        return "<li>" + svg("check") + "<span>" + esc(i) + "</span></li>";
      }).join("") + "</ul>" +
      '<button type="button" class="btn ' + (p.featured ? "btn--primary" : "btn--ghost") +
        '" data-pick="' + esc(p.id) + '">Choose this session</button>' +
    "</li>";
  }).join("");

  /* ----- step navigation ----- */
  function goto(step, opts) {
    $$(".step-panel").forEach(function (p) {
      var on = Number(p.getAttribute("data-panel")) === step;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
    });
    $$(".steps__item").forEach(function (li) {
      var n = Number(li.getAttribute("data-step"));
      li.classList.toggle("is-current", n === step);
      li.classList.toggle("is-done", n < step);
    });

    if (step === 2) renderPicker();
    if (step === 3) renderDetails();
    if (step === 4) renderConfirmation();

    if (!opts || !opts.silent) {
      var y = $("#booking").getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      var focusable = $('.step-panel.is-active input:not([type="hidden"]), .step-panel.is-active textarea') ||
                      $(".step-panel.is-active .datestrip button, .step-panel.is-active a[href]");
      if (focusable && step > 1) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 380);
    }
  }

  document.addEventListener("click", function (e) {
    var pick = e.target.closest("[data-pick]");
    if (pick) {
      state.sessionId = pick.getAttribute("data-pick");
      state.slotKey = null;
      activeDayKey = null;
      saveState();
      goto(2);
      return;
    }
    var jump = e.target.closest("[data-goto]");
    if (jump) goto(Number(jump.getAttribute("data-goto")));
  });

  /* ----- Step 2: date + slot picker ----- */
  function renderPicker() {
    var sess = session();
    if (!sess) { goto(1, { silent: true }); return; }

    $("#pick-name").textContent = sess.name;
    $("#pick-meta").textContent = sess.duration + " minutes · over Google Meet";

    // A real scheduling link, when configured, replaces the built-in picker.
    if (B.schedulingUrl) {
      $("#slotpicker").hidden = true;
      $("#slot-continue").hidden = true;
      renderScheduler(sess);
      return;
    }

    days = buildDays(sess);

    if (!days.length) {
      $("#datestrip").innerHTML = "";
      $("#slots").innerHTML = "";
      $("#slots-empty").hidden = false;
      $("#slots-empty").textContent =
        "No open times in the next few weeks. Email " + (B.enquiryEmail || "") + " and we'll find one.";
      setContinue(false);
      return;
    }

    if (!activeDayKey || !days.some(function (d) { return d.key === activeDayKey; })) {
      activeDayKey = days[0].key;
    }

    $("#datestrip").innerHTML = days.map(function (d) {
      return '<button type="button" class="datechip' + (d.key === activeDayKey ? " is-on" : "") +
        '" data-day="' + d.key + '" aria-pressed="' + (d.key === activeDayKey) + '">' +
        '<span class="datechip__dow">' + DAY_SHORT[d.weekday] + "</span>" +
        '<span class="datechip__num">' + d.d + "</span>" +
        '<span class="datechip__mon">' + MONTH_SHORT[d.m] + "</span>" +
      "</button>";
    }).join("");

    renderSlots();
  }

  function renderSlots() {
    var day = days.filter(function (d) { return d.key === activeDayKey; })[0];
    if (!day) return;

    $("#date-label").textContent = "Choose a date";
    $("#slots-empty").hidden = day.slots.length > 0;

    $("#slots").innerHTML = day.slots.map(function (s) {
      return '<button type="button" class="slot' + (s.key === state.slotKey ? " is-on" : "") +
        '" data-slot="' + s.key + '" aria-pressed="' + (s.key === state.slotKey) + '">' +
        timeLabel(s.minutes) + "</button>";
    }).join("");

    setContinue(!!state.slotKey && !!findSlot(state.slotKey));
  }

  function setContinue(enabled) {
    var btn = $("#slot-continue");
    btn.setAttribute("aria-disabled", String(!enabled));
  }

  $("#datestrip").addEventListener("click", function (e) {
    var chip = e.target.closest("[data-day]");
    if (!chip) return;
    activeDayKey = chip.getAttribute("data-day");
    state.slotKey = null;
    saveState();
    $$(".datechip").forEach(function (c) {
      var on = c === chip;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", String(on));
    });
    renderSlots();
  });

  $("#slots").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-slot]");
    if (!btn) return;
    state.slotKey = btn.getAttribute("data-slot");
    saveState();
    $$(".slot").forEach(function (s) {
      var on = s === btn;
      s.classList.toggle("is-on", on);
      s.setAttribute("aria-pressed", String(on));
    });
    setContinue(true);
  });

  $("#slot-continue").addEventListener("click", function () {
    if (this.getAttribute("aria-disabled") === "true") return;
    goto(3);
  });

  /* ----- Calendly / Cal.com, when configured ----- */
  function renderScheduler(sess) {
    var host = $("#scheduler");
    host.hidden = false;

    var url = B.schedulingUrl +
      (B.schedulingUrl.indexOf("?") === -1 ? "?" : "&") +
      "name=" + encodeURIComponent(state.name || "") +
      "&email=" + encodeURIComponent(state.email || "") +
      "&hide_gdpr_banner=1";

    if (B.schedulingEmbed) {
      host.innerHTML = '<iframe class="sched-embed" src="' + esc(url) +
        '" title="Choose a time for your ' + esc(sess.name) + '" loading="lazy"></iframe>' +
        '<p class="checkout__note">Trouble loading? <a href="' + esc(url) +
        '" target="_blank" rel="noopener noreferrer">Open the calendar in a new tab</a>.</p>';
    } else {
      host.innerHTML = '<a class="btn btn--primary btn--wide" href="' + esc(url) +
        '" target="_blank" rel="noopener noreferrer">' + svg("calendar") + " Choose a time</a>";
    }
  }

  /* ----- Step 3: details ----- */
  function renderDetails() {
    var sess = session();
    var found = findSlot(state.slotKey);
    if (!sess) { goto(1, { silent: true }); return; }
    if (!found) { goto(2, { silent: true }); return; }

    $("#pick-name-2").textContent = sess.name;
    $("#pick-when").textContent =
      longDate(found.day) + " at " + timeLabel(found.slot.minutes) + " " + (B.timezoneLabel || "");

    $("#f-name").value    = state.name || "";
    $("#f-email").value   = state.email || "";
    $("#f-company").value = state.company || "";
    $("#f-topic").value   = state.topic || "";
  }

  function setError(id, message) {
    var input = document.getElementById(id);
    var field = input.closest(".field");
    var msg = $('[data-error-for="' + id + '"]');
    if (message) {
      field.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
      if (msg) msg.textContent = message;
    } else {
      field.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
      if (msg) msg.textContent = "";
    }
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }

  // Whether the server-side submission landed: "sent" | "failed" | "unknown".
  // Drives the wording on the confirmation step — we should never tell someone
  // their request is with her if it isn't.
  var submitState = "unknown";

  /* Hand the booking to Netlify Forms.
     Netlify records the submission and emails Deepali, which is the whole point:
     a booking must not depend on the visitor having a working mail app. It POSTs
     url-encoded data to "/" — see docs.netlify.com/manage/forms/setup.
     Resolves true on success, false on any failure, and never throws, so a
     network problem downgrades to the email fallback instead of losing the
     booking. */
  // Hard ceiling on how long a visitor waits before we move them on regardless.
  // Without this the flow dead-ends: a POST that hangs leaves them staring at a
  // disabled "Sending…" button with no way forward. Observed in the wild on the
  // live site, where a submission took the best part of a minute to settle.
  var POST_TIMEOUT_MS = 8000;

  function postToNetlify(form) {
    if (!window.fetch) return Promise.resolve(false);

    var data = new FormData(form);
    // Netlify injects form-name into static HTML at deploy time. It won't exist
    // when running from a local server, so add it if it's missing.
    if (!data.get("form-name")) data.set("form-name", form.getAttribute("name") || "booking");

    var controller = window.AbortController ? new AbortController() : null;
    var timer;

    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () {
        if (controller) controller.abort();
        resolve(false);   // treat as not-sent: the email fallback takes over
      }, POST_TIMEOUT_MS);
    });

    var request = fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) { return res.ok; })
      .catch(function () { return false; });

    return Promise.race([request, timeout]).then(function (result) {
      clearTimeout(timer);
      return result;
    });
  }

  $("#details-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;

    var name = $("#f-name").value.trim();
    if (name.length < 2) { setError("f-name", "Please tell me your name."); ok = false; } else setError("f-name", "");

    var email = $("#f-email").value.trim();
    if (!validEmail(email)) { setError("f-email", "That email doesn't look right."); ok = false; } else setError("f-email", "");

    var topic = $("#f-topic").value.trim();
    if (topic.length < 10) { setError("f-topic", "A sentence or two, so I can prepare."); ok = false; } else setError("f-topic", "");

    if (!$("#f-consent").checked) { setError("f-consent", "Please tick this so I can reply to you."); ok = false; }
    else setError("f-consent", "");

    if (!ok) {
      var firstBad = $(".field.has-error input, .field.has-error textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    state.name = name;
    state.email = email;
    state.company = $("#f-company").value.trim();
    state.topic = topic;
    saveState();

    // Record what was actually booked, so the emailed submission is self-contained.
    var sess = session();
    var found = findSlot(state.slotKey);
    var form = this;
    if (sess && found) {
      form.querySelector('[name="session"]').value = sess.name + " (" + sess.duration + " min)";
      form.querySelector('[name="requested-time"]').value =
        longDate(found.day) + " at " + timeLabel(found.slot.minutes) + " " + (B.timezoneLabel || "");
      form.querySelector('[name="requested-time-utc"]').value = new Date(found.slot.utcMs).toISOString();
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute("aria-disabled", "true");
    submitBtn.textContent = "Sending…";

    postToNetlify(form).then(function (sent) {
      submitState = sent ? "sent" : "failed";
      submitBtn.removeAttribute("aria-disabled");
      submitBtn.textContent = "Request this slot";
      goto(4);
    });
  });

  ["f-name", "f-email", "f-topic", "f-consent"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () { setError(id, ""); });
    if (el.type === "checkbox") el.addEventListener("change", function () { setError(id, ""); });
  });

  /* ----- Step 4: confirmation, calendar file, request email ----- */
  function row(label, value, cls) {
    return '<dl class="summary__row' + (cls ? " " + cls : "") + '">' +
             "<dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></dl>";
  }

  function icsStamp(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
           pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
  }

  function buildIcs(sess, found) {
    var start = found.slot.utcMs;
    var end = start + sess.duration * 60000;
    var who = S.person.name;
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//" + who + "//Consultation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + found.slot.key + "-" + (state.email || "guest").replace(/[^a-z0-9]/gi, "") + "@booking",
      "DTSTAMP:" + icsStamp(Date.now()),
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + sess.name + " with " + who,
      "DESCRIPTION:" + String(state.topic).replace(/\r?\n/g, "\\n") +
        "\\n\\nThis slot is held pending confirmation by email.",
      "STATUS:TENTATIVE",
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    // RFC 5545 wants CRLF line endings.
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
  }

  function renderConfirmation() {
    var sess = session();
    var found = findSlot(state.slotKey);
    if (!sess || !found) { goto(1, { silent: true }); return; }

    var when = longDate(found.day) + " at " + timeLabel(found.slot.minutes) +
               " " + (B.timezoneLabel || "") + visitorNote(found.slot.utcMs);

    var who = S.person.name || "she";
    var head = $("#done-head");
    var sendBtn = $("#send-btn");
    var icsBtn = $("#ics-btn");

    // Deliberately NOT called `when` — that name is already the appointment time
    // above, and shadowing it silently replaced the booked slot in the summary
    // table with this phrase.
    var replyWindow = B.responseTime ? " (" + B.responseTime + ")" : "";

    if (submitState === "sent") {
      head.textContent = "Request sent";
      $("#done-line").textContent =
        who + " has your request. She'll reply to " + state.email + replyWindow +
        " to confirm the time and send the Google Meet link. Nothing is charged — " +
        "these sessions are free.";
      icsBtn.className = "btn btn--primary btn--wide";
      sendBtn.className = "btn btn--ghost btn--wide";
      sendBtn.textContent = "Email the details as well";
    } else {
      // Either the POST failed or forms aren't wired up yet. Don't claim it
      // arrived — make the email the action that actually completes the booking.
      head.textContent = "One last step";
      $("#done-line").textContent =
        "Send the details below and " + who + " will reply" + replyWindow +
        " to confirm the time and send the Google Meet link. " +
        "Nothing is charged — these sessions are free.";
      sendBtn.className = "btn btn--primary btn--wide";
      icsBtn.className = "btn btn--ghost btn--wide";
      sendBtn.textContent = "Send the request";
    }

    $("#summary").innerHTML =
      row("Session", sess.name) +
      row("When", when) +
      row("Length", sess.duration + " minutes") +
      row("Where", "Google Meet — link arrives with the confirmation") +
      row("Name", state.name) +
      row("Email", state.email) +
      (state.company ? row("Company", state.company) : "");

    var subject = "Consultation request — " + sess.name + " — " + longDate(found.day) +
                  " at " + timeLabel(found.slot.minutes);
    var body =
      "Hello,\n\nI'd like to book the following session:\n\n" +
      "Session: " + sess.name + " (" + sess.duration + " minutes)\n" +
      "Requested time: " + longDate(found.day) + " at " + timeLabel(found.slot.minutes) +
        " " + (B.timezoneLabel || "") + "\n\n" +
      "Name: " + state.name + "\n" +
      "Email: " + state.email + "\n" +
      (state.company ? "Company: " + state.company + "\n" : "") +
      "\nWhat I'd like to cover:\n" + state.topic + "\n\nThank you.";

    $("#send-btn").href = "mailto:" + (B.enquiryEmail || "").replace(/^mailto:/, "") +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    var ics = $("#ics-btn");
    ics.href = buildIcs(sess, found);
    ics.setAttribute("download", sess.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".ics");

    $("#confirm-note").textContent = submitState === "sent"
      ? "“Add to my calendar” holds the time in your own diary while you wait for confirmation. " +
        "The email button is optional — your request is already with her."
      : "“Send the request” opens your email app with everything filled in — press send and you're done. " +
        "The calendar file holds the time in your own diary while you wait for confirmation.";
  }

  /* ==================================================== 7. NEWSLETTER */
  var news = S.newsletter || {};
  var newsBlock = $("#newsletter-block");
  if (!news.show) {
    if (newsBlock) newsBlock.hidden = true;
  } else {
    if (news.buttonLabel) $("#sub-btn").textContent = news.buttonLabel;

    $("#subscribe-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#f-sub");
      var err = $('[data-error-for="f-sub"]');
      var value = input.value.trim();

      if (!validEmail(value)) {
        err.textContent = "That email doesn't look right.";
        err.classList.add("is-shown");
        input.focus();
        return;
      }
      err.classList.remove("is-shown");

      if (!news.action) {
        // No provider wired up yet — hand it to email so nobody hits a dead end.
        window.location.href = "mailto:" + (B.enquiryEmail || "").replace(/^mailto:/, "") +
          "?subject=" + encodeURIComponent("Newsletter signup") +
          "&body=" + encodeURIComponent("Please add me to your newsletter: " + value);
        return;
      }

      // A real endpoint: post via a hidden form so it works cross-origin
      // without the provider needing to send CORS headers.
      var f = document.createElement("form");
      f.action = news.action;
      f.method = news.method || "POST";
      f.target = "_blank";
      f.style.display = "none";
      var i = document.createElement("input");
      i.type = "hidden";
      i.name = news.fieldName || "email";
      i.value = value;
      f.appendChild(i);
      document.body.appendChild(f);
      f.submit();
      document.body.removeChild(f);

      input.value = "";
      $("#sub-ok").hidden = false;
    });
  }

  /* ======================================================= 8. SOCIALS */
  var socials = (S.socials || []).filter(function (s) { return s.url; });
  $("#socials").innerHTML = socials.map(function (s) {
    var display = s.url.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    var external = s.url.indexOf("mailto:") !== 0;
    return '<li><a class="social" href="' + esc(s.url) + '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" +
      '<span class="social__ico">' + svg(s.network) + "</span>" +
      '<span><span class="social__label">' + esc(s.label) + "</span>" +
      '<span class="social__url">' + esc(display) + "</span></span>" +
      '<span class="social__arrow">' + svg("arrow") + "</span>" +
    "</a></li>";
  }).join("");

  /* ================================================ 9. HEADER & MOTION */
  var header = $("#site-header");
  var nav = $("#nav");
  var menuBtn = $("#menu-toggle");

  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A" && nav.classList.contains("is-open")) menuBtn.click();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) menuBtn.click();
  });

  // Scroll-spy. Done by offset rather than IntersectionObserver because
  // #connect is nested inside #booking, and observers would fight over it.
  var navLinks = $$(".nav a");
  var spyTargets = navLinks.map(function (a) {
    return { link: a, el: document.getElementById(a.getAttribute("href").slice(1)) };
  }).filter(function (t) { return t.el; });

  var ticking = false;
  function onScroll() {
    header.classList.toggle("is-stuck", window.pageYOffset > 8);

    var line = window.pageYOffset + window.innerHeight * 0.35;
    var active = null;
    spyTargets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top + window.pageYOffset <= line) active = t;
    });
    spyTargets.forEach(function (t) { t.link.classList.toggle("is-active", t === active); });
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        obs.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    $$("[data-reveal]").forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i, 4) * 60) + "ms";
      reveal.observe(el);
    });
  } else {
    $$("[data-reveal]").forEach(function (el) { el.classList.add("is-in"); });
  }

  loadState();
})();
