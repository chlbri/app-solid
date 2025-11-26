import {
  createMachine,
  typings,
  deepEqual,
  type WorkingStatus,
} from '@bemedev/app-ts';
import type { StateValue } from '@bemedev/app-ts/lib/states';
import { nothing } from '@bemedev/app-ts/lib/utils';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { renderHook } from '@solidjs/testing-library';
import { DELAY, fakeDB, machine1, machine22 } from './fixtures';
import { interpret } from '../interpret';
import { tuple } from './interpret.fixtures';

beforeAll(() => {
  vi.useFakeTimers();
});

const TEXT = 'Activities Integration Test';

const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

describe('TESTS', () => {
  describe('#01 => machine1', () => {
    const {
      start,
      context,
      send,
      value: _value,
      status: _status,
      dispose,
      state,
    } = interpret(machine1);

    let iterator = 0;
    let value: StateValue = '';
    let status: WorkingStatus = 'idle';

    // #region Use FakeTimers
    beforeAll(() => vi.useFakeTimers());
    // #endregion

    afterEach(() => {
      const { result } = renderHook(state(c => c.context));
      console.warn('>>> TEST: iterator', result);
    });

    beforeEach(() => {
      const { result } = renderHook(context(c => c.iterator));
      iterator = result ?? iterator;
    });

    beforeEach(() => {
      const { result } = renderHook(_value);
      value = result;
    });

    beforeEach(() => {
      const { result } = renderHook(_status);
      status = result;
    });

    test('#00 => Start the machine', () => {
      start();
    });

    it('#01 => Just after start, "status" is "started"', () => {
      expect(status).toBe('working');
    });

    it('#02 => Just after start, "iterator" is "0"', () => {
      expect(iterator).toEqual(0);
    });

    it('#03 => Value is "idle"', () => {
      expect(value).toBe('idle');
    });

    it(...useWaiter(4, 10));

    it('#05 => "iterator" is now "10"', () => {
      expect(iterator).toBe(10);
    });

    it('#06 => Value is still "idle"', () => {
      expect(value).toBe('idle');
    });

    it('#07 => send "NEXT"', () => send('NEXT'));

    it('#08 => value is now "final"', () => {
      expect(value).toBe('final');
    });

    it(...useWaiter(9, 10));

    it('#10 => "iterator" is still "10"', () => {
      expect(iterator).toBe(10);
    });

    it('#11 => Dispose', dispose);

    it('#12 => "status" is now "idle"', () => {
      expect(status).toBe('busy');
    });

    it(...useWaiter(13, 10));

    it('#14 => "iterator" is still "10"', () => {
      expect(iterator).toBe(10);
    });

    it('#15 => Value is still "final"', () => {
      expect(value).toBe('final');
    });
    //FIXME: Change status more efficiently in @bemedev/app-ts
  });

  describe('#02 => machine22', () => {
    const {
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

    const subscriber = subscribe(
      {
        WRITE: ({ payload: { value } }) =>
          console.log('WRITE with', ':', `"${value}"`),
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
        const { result } = renderHook(select('context.iterator'));

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
        const { result } = renderHook(context(c => c.input, deepEqual));
        expect(result).toBe(input);
      });
    };

    const useData = (index: number, ...datas: any[]) => {
      const inviteStrict = `#02 => Check strict data`;

      const strict = () => {
        const { result } = renderHook(context(c => c.data, deepEqual));
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

      // Updated expectation from 107 to 141 due to @bemedev/app-ts v1.4.3 changes
      // The new version triggers additional subscriber notifications during state updates
      test('#03 => Length of calls of warn is "107"', () => {
        expect(dumbFn).toBeCalledTimes(141);
        sub.unsubscribe();
      });

      test('#04 => Log the time of all tests', () => {
        console.timeEnd(TEXT);
      });

      test('#05 => dispose', dispose);
    });
  });

  describe('#03 -> machine has a primitive context', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              INC: { actions: 'inc' },
            },
          },
        },
      },
      typings({
        context: 'number',
        eventsMap: {
          INC: 'primitive',
        },
      }),
    ).provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => context + 1),
      },
    }));

    let iterator = 0;
    let value: StateValue;

    const {
      start,
      context,
      send,
      value: _value,
      select,
      dispose,
    } = interpret(machine, {
      context: 0,
      pContext: {},
    });

    // #region Use FakeTimers
    beforeAll(() => vi.useFakeTimers());
    // #endregion

    beforeEach(() => {
      const { result } = renderHook(context());
      iterator = result;
    });

    beforeEach(() => {
      const { result } = renderHook(_value);
      value = result;
    });

    test('#00 => select is undefined', () => {
      expect(select).toBeUndefined();
    });

    test('#01 => Start the machine', () => {
      start();
    });

    it('#02 => Just after start, "iterator" is "0"', () => {
      expect(iterator).toEqual(0);
    });

    it('#03 => Value is "idle"', () => {
      expect(value).toBe('idle');
    });

    it('#04 => send "INC"', () => {
      send('INC');
    });

    it('#05 => "iterator" is now "1"', () => {
      expect(iterator).toBe(1);
    });

    it('#06 => Value is still "idle"', () => {
      expect(value).toBe('idle');
    });

    it('#07 => send "INC"', () => {
      send('INC');
    });

    it('#08 => "iterator" is now "2"', () => {
      expect(iterator).toBe(2);
    });

    it('#09 => dispose', dispose);
  });

  describe('#04 -> provideOptions returns new service instance', () => {
    const baseMachine = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              INC: { actions: 'inc' },
            },
          },
        },
      },
      typings({
        context: 'number',
        eventsMap: {
          INC: 'primitive',
        },
      }),
    );

    const service1 = interpret(baseMachine, {
      context: 0,
      pContext: {},
    });

    const service2 = service1.provideOptions(({ assign }) => ({
      actions: {
        inc: assign('context', ({ context }) => context + 2),
      },
    }));

    let context1 = 0;
    let context2 = 0;

    beforeAll(() => vi.useFakeTimers());

    beforeEach(() => {
      const { result } = renderHook(service1.context());
      context1 = result;
    });

    beforeEach(() => {
      const { result } = renderHook(service2.context());
      context2 = result;
    });

    test('#01 => service1 and service2 are different instances', () => {
      expect(service1).not.toBe(service2);
    });

    test('#02 => Start both services', () => {
      service1.start();
      service2.start();
    });

    it('#03 => Both contexts start at "0"', () => {
      expect(context1).toBe(0);
      expect(context2).toBe(0);
    });

    it('#04 => Send INC to service1', () => {
      service1.send('INC');
    });

    it('#05 => service1 context is not defined (no actions)', () => {
      expect(context1).toBe(0);
    });

    it('#06 => service2 context is still "0"', () => {
      expect(context2).toBe(0);
    });

    it('#07 => Send INC to service2', () => {
      service2.send('INC');
    });

    it('#08 => service2 context is now "2" (using provided action)', () => {
      expect(context2).toBe(2);
    });

    it('#09 => service1 context is still "0"', () => {
      expect(context1).toBe(0);
    });

    it('#10 => Send INC to service2 again', () => {
      service2.send('INC');
    });

    it('#11 => service2 context is now "4"', () => {
      expect(context2).toBe(4);
    });

    it('#12 => Dispose both services', async () => {
      await service1.dispose();
      await service2.dispose();
    });
  });
});
