#!/usr/bin/env python3
"""Validate R3 assertion-bound Desktop captures and consolidate overlapping manifests."""

import argparse
import json
import re
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path.home() / 'Desktop'
FOLDERS = ('lilp-design-demo-20261102', 'lilp-admin-demo-20261102')
EXPERIENCE_STATES = {
    'experience-new': {'normal', 'validation', 'save-error'},
    'experience-edit': {'saved', 'normal', 'loading', 'error', 'confirm-delete'},
}
REQUIRED_ROUTES = {
    'lilp-design-demo-20261102': {
        'home', 'about', 'projects', 'project-detail', 'notes', 'note-detail',
        'contact', 'craft', 'not-found', 'site-error', 'locale-error', 'studio-notes',
    },
    'lilp-admin-demo-20261102': {
        'login', 'dashboard', 'analytics', 'stats', 'audit', 'projects',
        'projects-new', 'projects-edit', 'posts', 'posts-new', 'posts-edit',
        'admin-pages', 'admin-pages-key', 'pages-custom', 'pages-empty',
        'experience', 'experience-new', 'experience-edit', 'education', 'skills',
        'tags', 'principles', 'process', 'users', 'inbox', 'inbox-detail',
        'domains', 'media', 'profile', 'site', 'not-found',
    },
}
PNG_MAGIC = b'\x89PNG\r\n\x1a\n'


def audit(folder: Path, since: float | None, finalize: bool) -> tuple[int, int]:
    records: dict[tuple, dict] = {}
    sources: dict[tuple, set[str]] = defaultdict(set)
    problems: list[str] = []
    for manifest in sorted(folder.glob('*manifest*.json')):
        if manifest.name == 'r3-12-final-manifest.json':
            continue
        data = json.loads(manifest.read_text())
        if not isinstance(data, list):
            continue  # Legacy summary, without assertion-bound tuples.
        for item in data:
            if not isinstance(item, dict) or not all(
                field in item for field in ('route', 'locale', 'state', 'theme', 'width', 'file')
            ):
                problems.append(f'{manifest.name}: incomplete tuple')
                continue
            route, locale, state, theme, width = (
                item[field] for field in ('route', 'locale', 'state', 'theme', 'width')
            )
            page_locale = item.get('pageLocale')
            key = (route, locale, page_locale, state, theme, width)
            expected = '-'.join(
                str(part)
                for part in (route, locale, f'page-{page_locale}' if page_locale else None,
                             state, theme, width)
                if part is not None
            ) + '.png'
            if item['file'] != expected or not re.fullmatch(r'[a-z0-9-]+\.png', expected):
                problems.append(f'{manifest.name}: invalid name {item["file"]}')
            if key in records and records[key]['file'] != item['file']:
                problems.append(f'{manifest.name}: conflicting tuple {key}')
            records[key] = item
            sources[key].add(manifest.name)

    for key, item in records.items():
        path = folder / item['file']
        if not path.is_file() or path.open('rb').read(8) != PNG_MAGIC:
            problems.append(f'missing/invalid PNG: {item["file"]}')
        elif since is not None and path.stat().st_mtime < since:
            problems.append(f'stale PNG: {item["file"]}')
    matrix: dict[tuple, set[tuple[str, int]]] = defaultdict(set)
    for route, locale, page_locale, state, theme, width in records:
        matrix[(route, locale, page_locale, state)].add((theme, width))
    expected_matrix = {(theme, width) for theme in ('light', 'dark') for width in (1440, 390)}
    for group, dimensions in matrix.items():
        if dimensions != expected_matrix:
            problems.append(f'incomplete theme/width matrix: {group}')
    covered_routes = {key[0] for key in records}
    for route in sorted(REQUIRED_ROUTES[folder.name] - covered_routes):
        problems.append(f'missing route: {route}')
    for route in sorted(REQUIRED_ROUTES[folder.name] & covered_routes):
        locales = {key[1] for key in records if key[0] == route}
        if locales != {'en', 'vi'}:
            problems.append(f'incomplete locale coverage: {route}')
    if folder.name.startswith('lilp-admin'):
        for route, states in EXPERIENCE_STATES.items():
            for locale in ('en', 'vi'):
                for state in states:
                    for theme in ('light', 'dark'):
                        for width in (1440, 390):
                            if (route, locale, None, state, theme, width) not in records:
                                problems.append(f'missing experience tuple: {route}/{locale}/{state}/{theme}/{width}')

    referenced = {item['file'] for item in records.values()}
    orphans = sorted(path for path in folder.glob('*.png') if path.name not in referenced)
    if finalize and not problems:
        archive = ROOT / 'lilp-r3-12-capture-archive' / folder.name
        archive.mkdir(parents=True, exist_ok=True)
        for path in orphans:
            shutil.move(str(path), str(archive / path.name))
        (folder / 'r3-12-final-manifest.json').write_text(
            json.dumps([records[key] for key in sorted(records)], ensure_ascii=False, indent=2) + '\n'
        )
    print(f'{folder.name}: {len(records)} unique tuples, {len(orphans)} orphan PNGs, '
          f'{len(problems)} errors; {sum(len(v) > 1 for v in sources.values())} historical overlaps')
    for problem in problems[:25]:
        print(f'  {problem}')
    if len(problems) > 25:
        print(f'  ... and {len(problems) - 25} more')
    return len(problems), len(orphans)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--since', type=float, help='minimum PNG modification time (Unix seconds)')
    parser.add_argument('--finalize', action='store_true', help='archive orphan PNGs and write final manifests')
    args = parser.parse_args()
    errors = 0
    for name in FOLDERS:
        count, _ = audit(ROOT / name, args.since, args.finalize)
        errors += count
    raise SystemExit(1 if errors else 0)


if __name__ == '__main__':
    main()
