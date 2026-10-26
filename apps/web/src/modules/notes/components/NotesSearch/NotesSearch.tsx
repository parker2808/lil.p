'use client';

import { Input } from '@portfolio/ui/components/ui/input';
import { InputGroup, InputGroupAddon } from '@portfolio/ui/components/ui/input-group';
import { Kbd } from '@portfolio/ui/components/ui/kbd';
import { useRouter } from '@i18n/navigation';
import { useEffect, useState } from 'react';

import { notesHref } from '../../utils/notes-query.util';

const META = '⌘';
const KEY = 'K';

export function NotesSearch({
  q,
  tag,
  labels,
}: {
  q?: string;
  tag?: string;
  labels: { search: string; hint: string };
}) {
  const router = useRouter();
  const [value, setValue] = useState(q ?? '');

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = value.trim();
      if (next === (q ?? '')) {
        return;
      }
      router.replace(notesHref({ q: next || undefined, tag }));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [q, router, tag, value]);

  return (
    <form
      role="search"
      action="/notes"
      method="get"
      className="col-span-full"
      onSubmit={(event) => event.preventDefault()}
    >
      {tag ? <input type="hidden" name="tag" value={tag} /> : null}
      <InputGroup>
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={labels.search}
          aria-label={labels.search}
        />
        <InputGroupAddon>
          <Kbd>{META}</Kbd>
          <Kbd>{KEY}</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
