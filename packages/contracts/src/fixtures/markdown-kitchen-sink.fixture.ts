export const markdownKitchenSink = `
## Heading two

A paragraph with **bold**, *italic*, ~~strike~~, and \`inline code\`.

### Heading three

- Bullet one
- Bullet two

1. First
2. Second

[Safe link](/notes/sample)

> A plain quote.

> [!NOTE]
> A note callout.

> [!WARNING]
> A warning callout.

\`\`\`ts
export const answer = 42;
\`\`\`

---

![Cover](/api/public/media/cover.webp)

| Col | Value |
| --- | --- |
| A | 1 |

A hard  
break.
`.trim();
