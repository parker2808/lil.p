# P5-5 T28 case study layout

- Keep the existing reading progress, prev/next links, and contact CTA.
- Show a summary box at the top with the nonempty Role, Timeline, Team, Stack, and Outcome fields; Outcome uses the short `result` line from P5-4.
- Section titles are visible `h2` headings and titled decisions are `h3`; the TOC lists both.
- Put the TOC in a sticky left column at desktop widths. Anchor targets clear the 64px site header with `scroll-margin-top`.
- On mobile, a Contents button opens the same links in a sheet that closes when a link is tapped, then scrolls to the heading.
- Cover the six public case study routes with Playwright, including desktop anchor position and mobile sheet behavior.
