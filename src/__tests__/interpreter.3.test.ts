import { createInterpreter } from '../interpreter';
import { machine3 } from './fixtures';
import { createTests } from './fixtures/interpreterTest';

vi.useFakeTimers();

describe('machine3', async () => {
  const _inter = createInterpreter({
    machine: machine3,
    options: {
      pContext: { data: '' },
      context: { age: 0 },
      exact: true,
    },
  });

  const inter = createTests(vi, _inter);
  const testValue = inter.testBy(({ value }) => value());
  const testAge = inter.testBy(({ context }) => context(s => s.age));

  it(...inter.start);
  it(
    ...testValue('Initial value', {
      state1: { state11: 'state111' },
    }),
  );
  it(...testAge('Initial age', 0));
  it(...inter.stop);
  it('#18 => async dispose symbol', _inter[Symbol.asyncDispose]);
  it('#coveage => typings', () => {
    expect(_inter.__stateSignal).toBeUndefined();
  });
});
