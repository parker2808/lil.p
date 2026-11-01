import { describe, expect, it, vi } from 'vitest';

import { createSequenceListener, type KeySequence } from './shortcut.util';

const SEQUENCES: { id: string; keys: KeySequence }[] = [
  { id: 'createProject', keys: ['c', 'p'] },
  { id: 'inbox', keys: ['g', 'i'] },
];

function press(
  listener: (event: KeyboardEvent) => void,
  key: string,
  {
    at = 0,
    target = document.body,
    ...init
  }: KeyboardEventInit & { at?: number; target?: Element } = {},
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
  Object.defineProperty(event, 'timeStamp', { value: at });
  Object.defineProperty(event, 'target', { value: target });
  listener(event);
  return event;
}

function setup() {
  const onMatch = vi.fn();
  return { onMatch, listener: createSequenceListener(() => SEQUENCES, onMatch) };
}

describe('createSequenceListener', () => {
  it('matches a two-key sequence and prevents the second key default', () => {
    const { onMatch, listener } = setup();
    press(listener, 'g', { at: 0 });
    const second = press(listener, 'i', { at: 200 });
    expect(onMatch).toHaveBeenCalledWith('inbox');
    expect(second.defaultPrevented).toBe(true);
  });

  it('ignores a second key after the timeout or a different first key', () => {
    const { onMatch, listener } = setup();
    press(listener, 'g', { at: 0 });
    press(listener, 'i', { at: 1500 });
    press(listener, 'x', { at: 2000 });
    press(listener, 'p', { at: 2100 });
    press(listener, 'c', { at: 3000 });
    press(listener, 'i', { at: 3100 });
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('ignores keys typed in fields, editors, dialogs and with modifiers', () => {
    const { onMatch, listener } = setup();
    const input = document.createElement('input');
    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    Object.defineProperty(editor, 'isContentEditable', { value: true });
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    const button = document.createElement('button');
    dialog.append(button);

    for (const target of [input, editor, button]) {
      press(listener, 'c', { target });
      press(listener, 'p', { target });
    }
    press(listener, 'c', { metaKey: true });
    press(listener, 'p', { metaKey: true });
    expect(onMatch).not.toHaveBeenCalled();
  });
});
