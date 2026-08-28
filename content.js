/* ============================================================================
   content.js — THE ONLY FILE YOU NEED TO EDIT
   ----------------------------------------------------------------------------
   Everything on the website reads from this one file: the name, the photo, the
   bio, the achievements, the consultation slots, the links. Change a value
   here, refresh the page, and the site updates.

   Everything is filled in and the site is live-ready. The only optional
   extras left:
     • newsletter.action — a real signup endpoint (see section 5 below).
       Until then the subscribe box falls back to opening an email.
     • the navy-blazer portrait, if she ever prefers it (see THE PHOTO below).

   If you add placeholder text while editing, set site.draftMode back to true
   and the orange "draft" banner returns as a reminder.
   ========================================================================== */

window.SITE = {

  /* ==========================================================================
     1. THE BASICS
     ======================================================================== */
  person: {
    name: "Deepali Jagota",

    title: "Customer Success Manager",
    company: "Cornerstone OnDemand",

    location: "Delhi NCR, India",

    // The hook at the very top of the page.
    tagline: "I help enterprise customers turn technology into real, measurable impact.",

    // The "Who am I?" paragraphs, in her voice.
    bio: [
      "I'm a Customer Success Manager at Cornerstone OnDemand, where I focus on delivering exceptional customer experiences and enhancing workforce agility in the enterprise sector. My background spans software project management and customer success, and my education includes an MCM and an MBA in Marketing.",
      "My role goes far beyond onboarding or issue resolution. I partner closely with customers after the sale — understanding their goals, guiding them through change, and helping them adopt solutions meaningfully. I work at the intersection of customers, outcomes, and long-term success, so that customers don't just use a product, but truly experience its value.",
      "Alongside my accounts, I'm the India lead for the Women at Cornerstone CRG, where our mission is to engage, inspire and amplify the community of women Cornerstars, and Chapter Lead for CS Ladies Delhi, a non-profit community building a safe space for women to discuss and grow together. I mentor young professionals — particularly women — as they navigate their careers, and I returned to this work after an eleven-year career break."
    ],

    /* ------------------------------------------------------------------------
       THE PHOTO
       ----------------------------------------------------------------------
       CHOSEN: the red-blazer portrait.

       It arrived as a JPG on a white studio background. That background has
       been cut out to real transparency, the pale rim around the hair eroded
       away, the cropped bottom edge faded out, and the file converted to WebP
       (139 KB — the same photo as a PNG was 1.9 MB).

       The untouched original is in _source-photos/, along with the
       make-cutout.py script that processed it, so any future photo can be run
       through exactly the same treatment. The navy-blazer version is still in
       assets/img/deepali-navy.webp if it's ever wanted — add it back to
       photoOptions below and the "Compare photo" switcher returns.
       ---------------------------------------------------------------------- */
    photo: "assets/img/deepali-red.webp",
    photoAlt: "Deepali Jagota",

    // "cutout" = transparent portrait floating on a soft glow (what's in use).
    // "framed" = cropped inside a rounded card (for a photo with a real background).
    photoStyle: "cutout",

    photoOptions: [
      { label: "Red blazer", src: "assets/img/deepali-red.webp", style: "cutout" }
    ]
  },

  /* --------------------------------------------------------------------------
     Proof-points shown under the intro. Set to [] to hide the strip.
     ------------------------------------------------------------------------ */
  stats: [
    { value: "3×",     label: "Top 100 Customer Success Strategist, 2022–2024" },
    { value: "2",      label: "Cornerstone product certifications" },
    { value: "2",      label: "women's communities led" },
    { value: "11 yrs", label: "career break — and a return to the top of the field" }
  ],

  /* ==========================================================================
     2. HOW I HELP
     Set  services.show: false  to remove this section completely.
     ======================================================================== */
  services: {
    show: true,
    heading: "How I help",
    intro: "Three things people most often come to me for.",
    items: [
      {
        icon: "compass",
        title: "Adoption that sticks",
        body: "Aligning the solution to the business goal, not just the requirement list — so teams adopt it meaningfully and the value shows up where leadership can see it."
      },
      {
        icon: "shield",
        title: "Guiding customers through change",
        body: "Rolling out enterprise technology is a change-management problem before it's a technical one. I help customers navigate that change with listening, empathy and proactive partnership at every stage."
      },
      {
        icon: "people",
        title: "Mentoring the next generation",
        body: "Career guidance for people moving into or up in customer success — with particular focus on women, and on anyone restarting a career after a long break."
      }
    ]
  },

  /* ==========================================================================
     3. ACHIEVEMENTS  (awards, recognition, certifications)
     ------------------------------------------------------------------------
     kind:  "award" → shown in the Recognition column
            "cert"  → shown in the Certifications column
     image: badge artwork in assets/img/badges/. All five are in place, cut
            out to transparency and sized for the web. If a file is ever
            missing the card quietly falls back to a drawn icon, so nothing
            looks broken.
     ======================================================================== */
  credentials: {
    heading: "Achievements",
    intro: "Recognition from the customer success community, and certifications on the platform I work with every day.",
    items: [
      {
        kind: "award",
        title: "Top 100 Customer Success Strategist",
        issuer: "SuccessCOACHING",
        year: "2024",
        note: "Global recognition for impactful work in customer success.",
        image: "assets/img/badges/top-100-cs-strategist-2024.webp",
        url: "https://www.credly.com/badges/9f9efefa-2a78-4ad5-b321-52bcbd2ce665/public_url"
      },
      {
        kind: "award",
        title: "Top 100 Customer Success Strategist",
        issuer: "SuccessCOACHING",
        year: "2023",
        note: "Second consecutive year on the global list.",
        image: "assets/img/badges/top-100-cs-strategist-2023.webp",
        url: "https://www.credly.com/org/successcoaching/badge/2023-top-100-customer-success-strategist"
      },
      {
        kind: "award",
        title: "Top 100 Customer Success Strategist",
        issuer: "SuccessCOACHING",
        year: "2022",
        note: "First of three consecutive years.",
        image: "assets/img/badges/top-100-cs-strategist-2022.webp",
        url: "https://www.credly.com/org/successcoaching/badge/2022-top-100-customer-success-strategist"
      },
      {
        kind: "cert",
        title: "Cornerstone Learning Management Expert",
        issuer: "Cornerstone OnDemand",
        year: "",
        note: "Expert-level certification in Cornerstone Learning Management.",
        image: "assets/img/badges/cornerstone-learning-management-expert.webp",
        url: "https://www.credly.com/badges/bf15ee32-e843-4839-93a2-ec525a071417/public_url"
      },
      {
        kind: "cert",
        title: "Cornerstone Core System Specialist",
        issuer: "Cornerstone OnDemand",
        year: "",
        note: "Specialist certification in Cornerstone core system administration.",
        image: "assets/img/badges/cornerstone-core-system-specialist.webp",
        url: "https://www.credly.com/badges/235f6432-52da-40be-b139-1d48080b2f15/public_url"
      }
    ]
  },

  /* ==========================================================================
     4. BOOK A CONSULTATION — slot booking
     ------------------------------------------------------------------------
     HOW IT WORKS:
       1. Visitor picks a session type.
       2. Visitor picks a date, then an open time slot.
       3. Visitor fills in their details.
       4. They get a confirmation screen with an "Add to calendar" file, and a
          pre-filled booking request lands in her inbox for her to accept.

     The slot grid below is generated from `availability`. The site cannot see
     her real calendar, so the final step is worded as a *request* she confirms
     — honest, and it avoids double-booking.

     The submission itself is captured by Netlify Forms and emailed to her, so a
     booking does not depend on the visitor having a working mail app. If that
     POST ever fails, the confirmation screen stops claiming the request was
     sent and makes the email button the action that completes the booking.

     WANT REAL, LIVE AVAILABILITY INSTEAD? Put a Calendly (or Cal.com) link in
     `schedulingUrl` below and the site automatically swaps its own slot picker
     for the real calendar. See README §2.
     ======================================================================== */
  booking: {
    heading: "Book a consultation",
    intro: "A few slots open each month, mostly evenings and Saturday mornings. Pick a session, choose a time that works, and I'll confirm by email.",

    // Leave "" to use the built-in slot picker.
    // Set it (e.g. "https://calendly.com/her-name") to use Calendly instead.
    schedulingUrl: "",
    schedulingEmbed: true,

    enquiryEmail: "deepali22aug@gmail.com",

    // Timezone the hours below are written in.
    timezoneLabel: "IST (GMT+5:30)",
    utcOffsetMinutes: 330,          // IST = 330. Change if she moves timezone.

    // Confirmed with her. 24-hour clock, in her timezone (see above).
    // Format: 24-hour "HH:MM-HH:MM". An empty array means "not available".
    availability: {
      mon: [],
      tue: ["19:00-21:00"],
      wed: [],
      thu: ["19:00-21:00"],
      fri: [],
      sat: ["10:00-13:00"],
      sun: []
    },

    leadTimeHours: 24,              // no bookings sooner than this
    horizonDays: 28,                // how far ahead the picker shows
    slotGapMinutes: 15,             // breathing room between sessions
    blockedDates: [],               // e.g. ["2026-09-14", "2026-09-15"]

    sessions: [
      {
        id: "cs-clinic",
        name: "Customer success clinic",
        duration: 30,
        summary: "One live problem from your book of business — an at-risk account, a stalled rollout, a QBR that isn't landing.",
        includes: [
          "30 minutes, one to one",
          "A short written recap afterwards"
        ],
        featured: false
      },
      {
        id: "career-mentoring",
        name: "Career mentoring",
        duration: 45,
        summary: "For people moving into customer success, or CSMs going after their first lead role.",
        includes: [
          "45 minutes, one to one",
          "CV and LinkedIn review if you send them ahead",
          "A development plan you leave with"
        ],
        featured: true,
        badge: "Most booked"
      },
      {
        id: "career-restart",
        name: "Restarting after a break",
        duration: 45,
        summary: "For anyone returning to work after a long career break. I took eleven years out — this is the conversation I wish I'd had.",
        includes: [
          "45 minutes, one to one",
          "How to talk about the gap, in writing and in interviews",
          "A realistic first-90-days plan"
        ],
        featured: false
      }
    ],

    policy: "Sessions run over Google Meet and are free of charge. Reschedule or cancel any time — just reply to the confirmation email.",

    /* Sets the visitor's expectation on the final screen. The site cannot send
       them an automatic acknowledgement — there is no mail server behind it —
       so her reply IS the confirmation. Saying roughly when it will arrive is
       what stops someone wondering whether the form worked at all.
       Keep this promise realistic; it is the one commitment the page makes. */
    responseTime: "usually within two working days"
  },

  /* ==========================================================================
     5. NEWSLETTER
     Point `action` at the form endpoint from Substack / Beehiiv / Mailchimp /
     Buttondown / Formspree. Leave it "" and the form falls back to email, so
     it still works on day one.
     ======================================================================== */
  newsletter: {
    show: true,
    heading: "Join the newsletter",
    intro: "A short note each month on customer success, careers, and building communities where women thrive.",
    action: "",
    method: "POST",
    fieldName: "email",
    buttonLabel: "Subscribe",
    smallPrint: "No spam. Unsubscribe in one click."
  },

  /* ==========================================================================
     6. SOCIALS & CONTACT — shown right beside the booking flow.
     Delete any line that isn't used. LinkedIn is the important one.
     ======================================================================== */
  socials: [
    { network: "linkedin", label: "LinkedIn",       url: "https://www.linkedin.com/in/deepalijagota/" },
    { network: "email",    label: "Email",          url: "mailto:deepali22aug@gmail.com" },
    { network: "seal",     label: "Credly profile", url: "" },
    { network: "medium",   label: "Medium",         url: "" }
  ],

  /* ==========================================================================
     7. SITE SETTINGS
     ======================================================================== */
  site: {
    metaTitle: "Deepali Jagota — Customer Success Manager",
    metaDescription: "Customer Success Manager at Cornerstone OnDemand. Three-time Top 100 Customer Success Strategist. Consultations on customer success, careers in CS, and restarting after a career break.",

    url: "https://deepalijagota.com",
    footerNote: "Built with care.",

    // true shows an orange "draft" banner across the top of the page. Off now
    // that the real content is in — set it back to true while editing if you
    // want the reminder.
    draftMode: false
  }
};
