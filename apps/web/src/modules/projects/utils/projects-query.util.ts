export function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseProjectsSearch(searchParams?: Record<string, string | string[] | undefined>): {
  domain?: string;
  skill?: string;
  page: number;
} {
  const domain = firstSearchParam(searchParams?.domain);
  const skill = firstSearchParam(searchParams?.skill);
  const pageRaw = Number(firstSearchParam(searchParams?.page));
  return {
    domain: domain || undefined,
    skill: skill || undefined,
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export function projectsHref(params: { domain?: string; skill?: string; page?: number }): string {
  const search = new URLSearchParams();
  if (params.domain) {
    search.set('domain', params.domain);
  }
  if (params.skill) {
    search.set('skill', params.skill);
  }
  if (params.page && params.page > 1) {
    search.set('page', String(params.page));
  }
  const encoded = search.toString();
  return encoded ? `/projects?${encoded}` : '/projects';
}
