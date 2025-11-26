import { createInterpreter } from '../interpreter';
import { DELAY, machine2 } from './fixtures';
import { createTests } from './fixtures/interpreterTest';

vi.useFakeTimers();

describe('TESTS', () => {
  describe('#01 => Machine 2', async () => {
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

    const wait = inter.createFakeWaiter.withDefaultDelay(DELAY);
    const iterator = inter.testBy(({ context }) =>
      context(s => s.iterator),
    );

    it(...inter.start);
    it(...iterator('Initial context', 0));
    it(...wait(10));
    it(...iterator('After start wait', 10));
    it(...wait(10));
    it(...iterator('After start wait', 20));
    it(...wait(30));
    it(...iterator('After start wait', 50));
  });
});
