'use client';

import { RadioGroup, RadioGroupItem } from '@portfolio/ui/components/ui/radio-group';
import { useEffect, useRef, useState } from 'react';

const names = {
  beforeEmpty: 'Before empty',
  beforeSelected: 'Before selected',
  one: 'One',
  two: 'Two',
};

export function RadioKeyboardFixture() {
  const [empty, setEmpty] = useState('');
  const [selected, setSelected] = useState('two');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.setAttribute('data-hydrated', 'true');
  }, []);

  return (
    <main ref={mainRef} data-hydrated="false">
      <button type="button">{names.beforeEmpty}</button>
      <RadioGroup aria-label="Empty choice" value={empty} onValueChange={setEmpty}>
        <RadioGroupItem value="one">{names.one}</RadioGroupItem>
        <RadioGroupItem value="two">{names.two}</RadioGroupItem>
      </RadioGroup>
      <output data-testid="empty-value">{empty}</output>
      <button type="button">{names.beforeSelected}</button>
      <RadioGroup aria-label="Selected choice" value={selected} onValueChange={setSelected}>
        <RadioGroupItem value="one">{names.one}</RadioGroupItem>
        <RadioGroupItem value="two">{names.two}</RadioGroupItem>
      </RadioGroup>
      <output data-testid="selected-value">{selected}</output>
    </main>
  );
}
