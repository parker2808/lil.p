import type { Locale, PublicPostListPage } from '@portfolio/contracts';

export function NotesBrowserInitial({
  page,
  locale,
  empty,
}: {
  page: PublicPostListPage;
  locale: Locale;
  empty: string;
}) {
  return (
    <div className="col-span-full">
      {page.items.length ? (
        <ul>
          {page.items.map((post) => (
            <li key={post.id}>
              <a href={`/${locale}/notes/${post.slug}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </div>
  );
}
