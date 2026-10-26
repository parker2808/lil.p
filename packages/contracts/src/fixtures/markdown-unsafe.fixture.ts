export const markdownUnsafe = `
# Top heading

<script>alert(1)</script>

<iframe src="https://evil.example"></iframe>

<img src="https://evil.example/x.png" onerror="alert(1)" alt="x" />

[Bad](javascript:alert(1))

![Remote](https://evil.example/x.png)
`.trim();
