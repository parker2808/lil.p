export type MarkdownSection = {
  title: string;
  body: string;
};

const HEADING = /^###[ \t]+(.+)$/gm;

export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const source = markdown.trim();
  if (!source) {
    return [];
  }

  const matches = [...source.matchAll(HEADING)];
  if (matches.length < 1) {
    return [{ title: '', body: source }];
  }

  return matches.map((match, index) => {
    const start = match.index! + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1]!.index! : source.length;
    return {
      title: match[1]!.trim(),
      body: source.slice(start, end).trim(),
    };
  });
}
