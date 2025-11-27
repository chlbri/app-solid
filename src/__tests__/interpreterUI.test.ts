import { createInterpreter } from '../interpreter';
import { DELAY, machine1 } from './fixtures';
import { createTests } from './fixtures/interpreterTest';

vi.useFakeTimers();

const log = vi.spyOn(console, 'log');

beforeAll(() => {
  log.mockImplementation(() => {});
});

afterAll(() => {
  log.mockRestore();
});

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
  const counter = inter.testBy(({ state }) =>
    state(s => s.uiThread?.counter),
  );

  const testValue = inter.testBy(({ value }) => value());

  it(...inter.start);
  it(...testValue('Initial value', 'idle'));
  it('#01.b => is not a UI service', () => {
    expect(_inter.__isUsedUi).toBe(true);
  });
  it(...counter('UI counter starts at "10"', 10));
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

  it(
    ...inter.sendUI({
      type: 'counter',
      payload: 42,
    }),
  );

  it(...counter('UI counter is now at "42"', 42));
  it(...wait(1000));

  it(
    ...inter.sendUI({
      type: 'counter',
      payload: 57,
    }),
  );

  it(...counter('UI counter is now at "57"', 57));
  it(...inter.stop);
  describe('#20 => Cannot send UI EVENTS', () => {
    it(
      ...inter.sendUI({
        type: 'counter',
        payload: 72,
      }),
    );
    it(...counter('UI counter remains the same', 57));
  });
});
