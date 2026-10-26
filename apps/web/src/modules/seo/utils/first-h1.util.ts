import type { PublicBlock } from '@portfolio/contracts';

export function firstH1(blocks: PublicBlock[]): { title?: string; intro?: string } {
  for (const block of blocks) {
    const title = readTitle(block.props);
    if (title) {
      return { title, intro: readIntro(block.props) };
    }
  }
  return {};
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readTitle(props: Record<string, unknown>): string | undefined {
  const heading = asRecord(props.heading);
  return asString(props.title) ?? (heading ? asString(heading.title) : undefined);
}

function readIntro(props: Record<string, unknown>): string | undefined {
  const heading = asRecord(props.heading);
  return asString(props.intro) ?? (heading ? asString(heading.intro) : undefined);
}
