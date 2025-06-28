import type { StateValue } from '@bemedev/app-ts/lib/states';
import { deepEqual, nothing } from '@bemedev/app-ts/lib/utils';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { renderHook } from '@solidjs/testing-library';
import { DELAY, fakeDB, machine1 } from './fixtures';
import { machine22 } from './fixtures/machine22';
import { interpret } from './interpret';
import { tuple } from './interpret.fixtures';

beforeAll(() => {
  vi.useFakeTimers();
});

const TEXT = 'Activities Integration Test';

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

describe('#02 => machine21', () => {
  const {
    subscribeMap,
    subscribe,
    select,
    context,
    tags,
    dispose,
    value,
    start,
    send,
    matches,
    contains,
    pause,
    resume,
  } = interpret(machine22, {
    pContext: {
      iterator: 0,
    },
    context: { iterator: 0, input: '', data: [] },
    exact: true,
  });

  const subscriber = subscribeMap(
    {
      WRITE: ({
        event: {
          payload: { value },
        },
      }) => console.log('WRITE with', ':', `"${value}"`),
      NEXT: () => console.log('NEXT time, you will see!!'),
      else: nothing,
    },
    {
      equals: (a, b) => deepEqual(a.value, b.value),
    },
  );

  const dumbFn = vi.fn();
  const sub = subscribe(dumbFn);

  const log = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeAll(() => {
    console.time(TEXT);
  });

  type SE = Parameters<typeof send>[0];

  const INPUT = 'a';

  const FAKES = fakeDB.filter(({ name }) => name.includes(INPUT));

  const strings: (string | string[])[] = [];

  // #region Hooks

  const useSend = (event: SE, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;

    return tuple(invite, () => send(event));
  };

  const useWrite = (value: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Write "${value}"`;

    return tuple(invite, () =>
      send({ type: 'WRITE', payload: { value } }),
    );
  };

  const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

  const useState = (state: StateValue, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Current state is "${state}"`;
    return tuple(invite, () => {
      const { result } = renderHook(value);
      expect(result).toStrictEqual(state);
    });
  };

  const useIterator = (num: number, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => iterator is "${num}"`;
    return tuple(invite, () => {
      const { result } = renderHook(select('iterator'));

      expect(result).toBe(num);
    });
  };

  const useMatches = (value: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => value matches "${value}"`;
    return tuple(invite, () => {
      const { result } = renderHook(matches(value));

      expect(result).toBe(true);
    });
  };

  const useContains = (value: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => value contains "${value}"`;
    return tuple(invite, () => {
      const { result } = renderHook(contains(value));

      expect(result).toBe(true);
    });
  };

  const useInput = (input: string, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => input is "${input}"`;
    return tuple(invite, async () => {
      const { result } = renderHook(context(c => c.input));
      expect(result).toBe(input);
    });
  };

  const useData = (index: number, ...datas: any[]) => {
    const inviteStrict = `#02 => Check strict data`;

    const strict = () => {
      const { result } = renderHook(context(c => c.data));
      expect(result).toStrictEqual(datas);
    };

    const inviteLength = `#01 => Length of data is ${datas.length}`;

    const length = () => {
      const { result } = renderHook(context(c => c.data.length));
      expect(result).toBe(datas.length);
    };

    const invite = `#${index < 10 ? '0' + index : index} => Check data`;
    const func = () => {
      test(inviteLength, length);
      test(inviteStrict, strict);
    };

    return tuple(invite, func);
  };

  const useConsole = (
    index: number,
    ..._strings: (string | string[])[]
  ) => {
    const inviteStrict = `#02 => Check strict string`;

    const strict = () => {
      const calls = strings.map(data => [data].flat());
      expect(log.mock.calls).toStrictEqual(calls);
    };

    const inviteLength = `#01 => Length of calls is : ${_strings.length}`;

    const length = () => {
      strings.push(..._strings);
      expect(log.mock.calls.length).toBe(strings.length);
    };

    const invite = `#${index < 10 ? '0' + index : index} => Check the console`;
    const func = () => {
      test(inviteLength, length);
      test(inviteStrict, strict);
    };

    return tuple(invite, func);
  };
  // #endregion

  test('#00 => Start the machine', start);
  test(...useWaiter(1, 6));

  describe('#02 => Check the service', () => {
    test(...useState('idle', 1));
    test(...useIterator(6, 2));
    test(...useMatches('idle', 3));
    describe(...useConsole(4));
  });

  test(...useSend('NEXT', 3));

  describe('#04 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useContains('work', 2));

    const array = useMatches('works', 3);
    const failure = [
      array[0].replace('=>', '=> Fails :'),
      array[1],
    ] as const;
    test.fails(...failure);

    test(...useIterator(6, 4));
    describe(...useConsole(5, 'NEXT time, you will see!!'));
  });

  test(...useWaiter(5, 6));

  describe('#06 => Check the service', () => {
    test(...useIterator(18, 1));
    describe(...useConsole(3, ...Array(6).fill('sendPanelToUser')));
  });

  test('#07 => pause', pause);

  describe('#08 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(18, 2));
    describe(...useConsole(4));
  });

  test(...useWaiter(9, 6));

  describe('#10 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(18, 2));
    describe(...useConsole(4));
  });

  test('#11 => resume', resume);
  test(...useWaiter(12, 12));

  describe('#13 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(42, 2));
    describe(...useConsole(4, ...Array(12).fill('sendPanelToUser')));
  });

  test(...useWrite('', 14));

  describe('#15 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(42, 2));
    test(...useInput('', 4));
    describe(...useConsole(5, ['WRITE with', ':', '""']));
  });

  test(...useWaiter(16, 12));

  describe('#17 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(66, 2));
    test(...useInput('', 4));

    describe(
      ...useConsole(
        5,
        ...Array(24)
          .fill(0)
          .map((_, index) => {
            const isEven = index % 2 === 0;
            return isEven ? 'sendPanelToUser' : 'Input, please !!';
          }),
      ),
    );
  });

  test(...useWrite(INPUT, 18));

  describe('#19 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(66, 2));
    test(...useInput('', 4));
    describe(...useConsole(5, ['WRITE with', ':', `"${INPUT}"`]));
  });

  test(...useWaiter(20, 12));

  describe('#21 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'idle',
          },
        },
        1,
      ),
    );

    test(...useIterator(90, 2));
    test(...useInput('', 4));
    describe(...useConsole(5, ...Array(12).fill('sendPanelToUser')));
  });

  test('#22 => Close the subscriber', subscriber.close.bind(subscriber));
  test(...useWrite(INPUT, 23));

  describe('#24 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(90, 2));
    test(...useInput(INPUT, 4));
    describe(...useConsole(5));
  });

  test(...useWaiter(25, 6));

  describe('#26 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(102, 2));
    test(...useInput(INPUT, 4));
    describe(...useData(5));
    describe(...useConsole(6, ...Array(6).fill('sendPanelToUser')));
  });

  test(...useSend('FETCH', 27));

  describe('#28 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(102, 2));
    test(...useInput(INPUT, 4));
    describe(...useData(5, ...FAKES));
    describe(...useConsole(6));
  });

  test('#29 => Await the fetch', () => vi.advanceTimersByTimeAsync(0));

  describe('#30 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(102, 2));
    test(...useInput(INPUT, 4));
    describe(...useData(5, ...FAKES));
    describe(...useConsole(6));
    test('#07 =< not tags', () => {
      const { result } = renderHook(tags);
      expect(result).toBeUndefined();
    });
  });

  test(...useWaiter(31, 6));

  describe('#32 => Check the service', () => {
    test(
      ...useState(
        {
          working: {
            fetch: 'idle',
            ui: 'input',
          },
        },
        1,
      ),
    );

    test(...useIterator(114, 2));
    test(...useInput(INPUT, 4));
    describe(...useData(5, ...FAKES));
    describe(...useConsole(6, ...Array(6).fill('sendPanelToUser')));
  });

  describe('#33 => Close the service', async () => {
    test('#01 => Pause the service', pause);

    describe('#02 => Calls of log', () => {
      test('#01 => Length of calls of log is the same of length of strings', () => {
        expect(log).toBeCalledTimes(strings.length);
      });

      test('#02 => Log is called "69" times', () => {
        expect(log).toBeCalledTimes(69);
      });
    });

    test('#03 => Length of calls of warn is "215"', () => {
      expect(dumbFn).toBeCalledTimes(215);
      sub.unsubscribe();
    });

    test('#04 => Log the time of all tests', () => {
      console.timeEnd(TEXT);
    });

    test('#05 => dispose', dispose);
  });
});
