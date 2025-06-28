import type { StateValue } from '@bemedev/app-ts/lib/states';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { renderHook } from '@solidjs/testing-library';
import { DELAY, machine1 } from './__tests__/data';
import { interpret } from './interpret';

const waiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

describe('#01 => machine1', () => {
  const {
    start,
    context,
    send,
    value: _value,
  } = interpret(machine1, {
    context: { iterator: 0 },
    pContext: {},
  });

  let iterator = 0;
  let value: StateValue = '';

  // #region Use FakeTimers
  beforeAll(() => vi.useFakeTimers());
  // #endregion

  beforeEach(() => {
    const { result } = renderHook(context(c => c.iterator));
    iterator = result;
  });

  beforeEach(() => {
    const { result } = renderHook(_value);
    value = result;
  });

  test('#00 => Start the machine', () => {
    start();
  });

  it('#01 => Just after start, "iterator" is "0"', () => {
    expect(iterator).toEqual(0);
  });

  it('#02 => Value is "idle"', () => {
    expect(value).toBe('idle');
  });

  it(...waiter(3, 10));

  it('#04 => "iteraror" is now "10"', () => {
    expect(iterator).toBe(10);
  });

  it('#05 => Value is still "idle"', () => {
    expect(value).toBe('idle');
  });

  it('#06 => send "NEXT"', () => send('NEXT'));

  it('#07 => value is now "final"', () => {
    expect(value).toBe('final');
  });

  it(...waiter(8, 10));

  it('#09 => "iteraror" is still "10"', () => {
    expect(iterator).toBe(10);
  });
});
