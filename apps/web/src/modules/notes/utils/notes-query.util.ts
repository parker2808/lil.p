export function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseNotesSearch(searchParams?: Record<string, string | string[] | undefined>): {
  q?: string;
  tag?: string;
  page: number;
} {
  const q = firstSearchParam(searchParams?.q);
  const tag = firstSearchParam(searchParams?.tag);
  const pageRaw = Number(firstSearchParam(searchParams?.page));
  return {
    q: q || undefined,
    tag: tag || undefined,
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export function notesHref(params: { q?: string; tag?: string; page?: number }): string {
  const search = new URLSearchParams();
  if (params.q) {
    search.set('q', params.q);
  }
  if (params.tag) {
    search.set('tag', params.tag);
  }
  if (params.page && params.page > 1) {
    search.set('page', String(params.page));
  }
  const encoded = search.toString();
  return encoded ? `/notes?${encoded}` : '/notes';
}

export function groupPostsByYear<T extends { publishedAt: string | null }>(
  posts: T[],
): { year: string; posts: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const post of posts) {
    const year = post.publishedAt ? String(new Date(post.publishedAt).getUTCFullYear()) : '';
    const list = groups.get(year) ?? [];
    list.push(post);
    groups.set(year, list);
  }
  return [...groups.entries()].map(([year, grouped]) => ({ year, posts: grouped }));
}
