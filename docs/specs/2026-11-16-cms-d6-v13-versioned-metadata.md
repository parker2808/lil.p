# D6 V13 versioned preview metadata gate

Shared core and custom pages previously selected `?v=N` only when rendering the
draft tree; metadata still read the latest draft. Use the same positive safe
integer in both requests, exclusively in draft mode. Public routes must never
read historical page versions from query parameters.

The real-browser `metadata.spec.ts` journey publishes a legacy starter snapshot,
updates its EN/VI SEO while still in legacy mode, then activates and publishes a
tree version with a distinct visible H1. Tree drafts correctly reject legacy SEO
PATCH after activation; the test must not bypass this CAS boundary. It checks
that public `?v=1` still displays version 2 in both body and metadata, then
enables the authenticated draft and checks version 1 body/title/description.
The shared metadata helpers cover home, about, contact, projects and notes;
the custom catch-all forwards search parameters separately. These assertions
close only the historical-preview mismatch, **not** V13's full route/state
localization matrix, manual SEO audit or release acceptance.
