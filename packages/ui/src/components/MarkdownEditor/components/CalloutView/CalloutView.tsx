'use client';

import { Callout } from '@portfolio/ui/components/Callout/Callout';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

export function CalloutView({ node, extension }: ReactNodeViewProps) {
  const kind = node.attrs.kind === 'WARNING' ? 'WARNING' : 'NOTE';
  const title = kind === 'WARNING' ? extension.options.warning : extension.options.note;

  return (
    <NodeViewWrapper>
      <Callout kind={kind} title={title}>
        <NodeViewContent />
      </Callout>
    </NodeViewWrapper>
  );
}
