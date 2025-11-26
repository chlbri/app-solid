import { createInterpreter } from '../interpreter';
import { DELAY, machine22 } from './fixtures';
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

    it(
      ...testValue(
        'After WRITE with empty input, state is still the same',
        {
          working: { fetch: 'idle', ui: 'idle' },
        },
      ),
    );
  });
});
