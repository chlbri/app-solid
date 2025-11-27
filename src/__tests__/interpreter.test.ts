import { createInterpreter } from '../interpreter';
import { DELAY, fakeDB, machine22 } from './fixtures';
import { createTests } from './fixtures/interpreterTest';

vi.useFakeTimers();

describe('TESTS', () => {
  describe('#01 => machine22', async () => {
    const inter = createTests(
      vi,
      createInterpreter({
        machine: machine22,
        options: {
          pContext: { iterator: 0 },
          context: { iterator: 0, input: '', data: [] },
          exact: true,
        },
      }),
    );

    const INPUT = 'a';
    const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

    const wait = inter.createFakeWaiter.withDefaultDelay(DELAY);
    const iterator = inter.testBy(({ context }) =>
      context(s => s.iterator),
    );
    const iteratorNoChanges = inter.testBy(({ context }) =>
      context(
        s => s.iterator,
        () => true,
      ),
    );
    const testValue = inter.testBy(({ value }) => value());
    const testInput = inter.testBy(({ context }) => context(s => s.input));
    const testData = inter.testBy(({ context }) => context(c => c.data));

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
    it(...iterator('iterator', 50));
    it(...iteratorNoChanges('iteratorNoChanges', 0));
    it(...inter.send('NEXT'));

    it(
      ...testValue('After NEXT, value is inside "working"', {
        working: { fetch: 'idle', ui: 'idle' },
      }),
    );

    it.fails(
      ...testValue(
        'After NEXT, value is not exactly "working"',
        'working',
      ),
    );

    it(...inter.matches('working'));
    it.fails(...inter.matches('working', 'work'));
    it(...inter.contains('working', 'work'));
    it(...wait(30));
    it(...iterator('iterator', 110));
    it(...inter.pause);
    it(...wait(50));
    it(...inter.send('NEXT'));

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
    it(...inter.send('FETCH'));

    it(
      ...testValue('States remains the same', {
        working: { fetch: 'idle', ui: 'input' },
      }),
    );

    it(...testData('Data is full', FAKES));
    it(...inter.stop);
    it(...inter.dispose);
  });
});
