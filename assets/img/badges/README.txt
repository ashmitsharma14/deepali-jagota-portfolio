Badge artwork for the Achievements section. All five are in place:

  top-100-cs-strategist-2024.webp
  top-100-cs-strategist-2023.webp
  top-100-cs-strategist-2022.webp
  cornerstone-learning-management-expert.webp
  cornerstone-core-system-specialist.webp

Each was supplied on a solid white background and processed by
../../../_source-photos/make-badge.py — the white was cut to transparency so the
badges sit correctly on both the cream and the dark theme, and each was resized
and converted to WebP (17-25 KB each, down from 60-290 KB).

TO ADD ANOTHER BADGE:
  1. python3 _source-photos/make-badge.py <source> assets/img/badges/<name>.webp
  2. add an entry to credentials.items in content.js, with image: pointing at it

A missing image file is not fatal — the card falls back to a drawn icon.
