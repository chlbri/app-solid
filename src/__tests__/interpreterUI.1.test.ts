import { createInterpreter } from '../interpreter';
import { DELAY, machine1 } from './fixtures';
import { createTests } from './fixtures/interpreterTest';

vi.useFakeTimers();

describe('machine1', async () => {
  const _inter = createInterpreter({
    machine: machine1,
    options: {
      pContext: { iterator: 0 },
      context: { iterator: 0 },
      exact: true,
    },
    uiThread: {
      counter: 10,
    },
  });
  const inter = createTests(vi, _inter);

  const wait = inter.createFakeWaiter.withDefaultDelay(DELAY);
  const iterator = inter.testBy(({ context }) => context(s => s.iterator));

  const testValue = inter.testBy(({ value }) => value());

  it(...inter.start);
  it(...testValue('Initial value', 'idle'));
  it('#01.b => is not a UI service', () => {
    expect(_inter.__isUsedUi).toBe(true);
  });
  it(...iterator('iterator', 0));
  it(...wait(1));
  it(...iterator('iterator', 1));
  it(...wait(1));
  it(...iterator('iterator', 2));
  it(...wait(1));
  it(...iterator('iterator', 3));
  it(...wait(10));
  it(...iterator('iterator', 13));
  it(...inter.send('NEXT'));
  it(...testValue('Value is now at "final"', 'final'));
  it(...iterator('iterator', 13));
  it(...wait(1000));
  it(...iterator('iterator', 13));
  it(...inter.stop);
  it('#17 => dispose symbol', _inter[Symbol.dispose]);
});
