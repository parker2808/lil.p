# P6-5 T35 Email-style inbox

Plan:

1. Add an `ARCHIVED` contact message status (additive enum migration, contracts, API default list hides `SPAM` and `ARCHIVED`).
2. Add `app/admin/(cms)/inbox/layout.tsx`: the message list stays mounted as the left pane; `/admin/inbox` renders a "Select a message" pane and `/admin/inbox/[id]` the message.
3. Below `lg` only one pane shows: the list on `/admin/inbox`, the message on `/admin/inbox/[id]` (the mobile detail route, with the existing back link).
4. Replace the inbox `AdminTable` with an email-style `InboxList` (sender, topic, snippet, date, unread mark, selected row `aria-current`).
5. The message view marks a `NEW` message read on open, offers "Reply via email" (`mailto:`), Archive with the T7a `toastUndo` preset (Undo restores the previous status), Mark replied and Mark spam.
6. E2E `admin-inbox.spec.ts`: read 5 messages in a row on desktop without a document load, archive then Undo, mobile Back returns to the list. Unit tests for `InboxList`, the detail view and the API default filter.

Decisions:

- The selected message lives in the path (`/admin/inbox/:id`) and the list filters in the query string, which row links keep.
- The list fetches on the client: a layout cannot read `searchParams`, and a page-level prefetch would hydrate after the layout's list had already created the query.
- Archive returns to the list (`router.replace`, so Back does not reopen an archived message). The list update is optimistic: rows whose new status the current filter hides are removed at once.
- The migration must be applied to TiDB at merge (`prisma migrate deploy`).
