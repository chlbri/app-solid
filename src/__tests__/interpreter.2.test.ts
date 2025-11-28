import { createInterpreter } from '../interpreter';
import { createTests, DELAY, fakeDB, machine2, muteLog } from './fixtures';

vi.useFakeTimers();
muteLog();

describe('machine2', async () => {
  const inter = createTests(
    vi,
    createInterpreter({
      machine: machine2,
      options: {
        pContext: { iterator: 0 },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      },
    }),
  );

  const INPUT = 'a';
  const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

  // #region test hooks
  const wait = inter.createFakeWaiter.withDefaultDelay(DELAY);
  const testValue = inter.testBy(({ value }) => value());
  const iterator = inter.testBy(({ context }) =>
    context(({ iterator }) => iterator),
  );

  const iteratorNoChanges = inter.testBy(({ context }) =>
    context(
      s => s.iterator,
      () => true,
    ),
  );

  const testInput = inter.testBy(({ context }) =>
    context(({ input }) => input),
  );

  const testData = inter.testBy(({ context }) =>
    context(({ data }) => data),
  );
  // #endregion

  it(...inter.start);
  it(...testValue('Initial value', 'idle'));
  it(...iterator('iterator', 0));
  it.fails(...inter.matches('working'));
  it(...iteratorNoChanges('iteratorNoChanges', 0));
  it(...wait(10));
  it(...iterator('iterator', 10));
  it(...iteratorNoChanges('iteratorNoChanges', 0));
  it(...wait(10));
  it(...iterator('iterator', 20));
  it(...iteratorNoChanges('iteratorNoChanges', 0));
  it(...wait(30));
  it(...inter.hasTags('single'));
  it(...iterator('iterator', 50));
  it(...iteratorNoChanges('iteratorNoChanges', 0));
  it(...inter.send('NEXT'));
  it(...inter.hasTags('double'));
  it(...inter.hasTags('parallel'));

  it(
    ...testValue('After NEXT, value is inside "working"', {
      working: { fetch: 'idle', ui: 'idle' },
    }),
  );

  it(...inter.matches('working'));
  it.fails(...inter.matches('working', 'work'));
  it(...inter.contains('working', 'work'));
  it(...wait(30));
  it(...iterator('iterator', 110));
  it(...inter.pause);
  it(...wait(50));

  it(
    ...testValue('State remains the same', {
      working: { fetch: 'idle', ui: 'idle' },
    }),
  );

  it(...iterator('iterator', 110));
  it(...inter.resume);
  it(...wait(20));
  it(...iterator('iterator', 150));

  it(
    ...testValue('State remains the same', {
      working: { fetch: 'idle', ui: 'idle' },
    }),
  );

  it(
    ...inter.send({
      type: 'WRITE',
      payload: { value: '' },
    }),
  );

  it(...testInput('Empty', ''));

  it(
    ...testValue('Check state, ui in "input"', {
      working: { fetch: 'idle', ui: 'input' },
    }),
  );

  it(...inter.hasTags('parallel', 'double'));
  it.fails(...inter.hasTags('single'));
  it(...wait(100));
  it(...iterator('iterator', 350));

  it(
    ...testValue('State remains the same', {
      working: { fetch: 'idle', ui: 'input' },
    }),
  );

  it(
    ...inter.send({
      type: 'WRITE',
      payload: { value: INPUT },
    }),
  );

  it(
    ...testValue('Ui is now at state "idle"', {
      working: { fetch: 'idle', ui: 'idle' },
    }),
  );

  it(...testInput('Empty', ''));

  it(...wait(10));
  it(...iterator('iterator', 370));

  it(
    ...inter.send({
      type: 'WRITE',
      payload: { value: INPUT },
    }),
  );

  it(
    ...testValue('Ui is now at state "input"', {
      working: { fetch: 'idle', ui: 'input' },
    }),
  );

  it(...testData('data is empty', []));
  it(...testInput('Empty', INPUT));
  it(...wait(60));
  it(...iterator('iterator', 490));
  it(...wait(6));
  it(...iterator('iterator', 502));
  it(...inter.send('FETCH'));
  it(...iteratorNoChanges('iteratorNoChanges', 0));

  it(
    ...testValue('States remains the same', {
      working: { fetch: 'idle', ui: 'input' },
    }),
  );

  it(...testData('Data is full', FAKES));

  it(...wait(4));
  it(...iterator('iterator', 510));
  it(...wait());
  it(...iterator('iterator', 510));
  it(...wait());
  it(...iterator('iterator', 514));
  it(...wait(8));
  it(...iterator('iterator', 530));
  it(...inter.send('NEXT'));
  it(...testValue('Value returns to "idle"', 'idle'));

  it(
    ...inter.addOptions(({ assign }) => ({
      actions: {
        inc2: assign(
          'context.iterator',
          ({ context: { iterator } }) => iterator + 10,
        ),
      },
    })),
  );

  it(...inter.send('NEXT'));

  it(
    ...testValue('After NEXT, value is inside "working"', {
      working: { fetch: 'idle', ui: 'idle' },
    }),
  );

  it(...wait(14));
  it(...iterator('iterator', 600));
  it(...inter.stop);
  it(...inter.dispose);
});
