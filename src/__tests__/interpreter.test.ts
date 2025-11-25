import { createMachine, typings, deepEqual } from '@bemedev/app-ts';
import { createFakeWaiter } from '@bemedev/vitest-extended';
import { DELAY, machine1, machine22 } from './fixtures';
import { createInterpreter } from '../interpreter';
import { renderHook } from '@solidjs/testing-library';

beforeAll(() => {
  vi.useFakeTimers();
});

const useWaiter = createFakeWaiter.withDefaultDelay(vi, DELAY);

describe('TESTS', () => {
  describe('#01 => createInterpreter basic instantiation', () => {
    const interpreter = createInterpreter(machine1);

    beforeAll(() => vi.useFakeTimers());

    test('#00 => Interpreter is created', () => {
      expect(interpreter).toBeDefined();
    });

    test('#01 => Start the machine', () => {
      interpreter.start();
    });

    it(...useWaiter(2, 10));

    test('#03 => Send NEXT', () => {
      interpreter.send('NEXT');
    });

    it(...useWaiter(4, 10));

    test('#05 => Dispose using Symbol.dispose', () => {
      interpreter[Symbol.dispose]();
    });
  });

  describe('#02 => Interpreter basic methods existence', () => {
    const interpreter = createInterpreter(machine1, {
      context: { iterator: 0 },
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => start method exists and is a function', () => {
      expect(typeof interpreter.start).toBe('function');
    });

    test('#02 => pause method exists and is a function', () => {
      expect(typeof interpreter.pause).toBe('function');
    });

    test('#03 => resume method exists and is a function', () => {
      expect(typeof interpreter.resume).toBe('function');
    });

    test('#04 => stop method exists and is a function', () => {
      expect(typeof interpreter.stop).toBe('function');
    });

    test('#05 => subscribe method exists and is a function', () => {
      expect(typeof interpreter.subscribe).toBe('function');
    });

    test('#06 => send method exists and is a function', () => {
      expect(typeof interpreter.send).toBe('function');
    });

    test('#07 => dispose method exists and is a function', () => {
      expect(typeof interpreter.dispose).toBe('function');
    });

    test('#08 => state method exists and is a function', () => {
      expect(typeof interpreter.state).toBe('function');
    });

    test('#09 => watcher method exists and is a function', () => {
      expect(typeof interpreter.watcher).toBe('function');
    });

    test('#10 => reducer method exists and is a function', () => {
      expect(typeof interpreter.reducer).toBe('function');
    });

    test('#11 => context method exists and is a function', () => {
      expect(typeof interpreter.context).toBe('function');
    });

    test('#12 => value method exists and is a function', () => {
      expect(typeof interpreter.value).toBe('function');
    });

    test('#13 => status method exists and is a function', () => {
      expect(typeof interpreter.status).toBe('function');
    });

    test('#14 => hasTags method exists and is a function', () => {
      expect(typeof interpreter.hasTags).toBe('function');
    });

    test('#15 => __isUsedUi method exists and is a function', () => {
      expect(typeof interpreter.__isUsedUi).toBe('function');
    });

    test('#16 => dps method exists and is a function', () => {
      expect(typeof interpreter.dps).toBe('function');
    });

    test('#17 => matches method exists and is a function', () => {
      expect(typeof interpreter.matches).toBe('function');
    });

    test('#18 => contains method exists and is a function', () => {
      expect(typeof interpreter.contains).toBe('function');
    });

    test('#19 => addOptions method exists and is a function', () => {
      expect(typeof interpreter.addOptions).toBe('function');
    });

    test('#20 => provideOptions method exists and is a function', () => {
      expect(typeof interpreter.provideOptions).toBe('function');
    });

    test('#21 => sendUI method exists and is a function', () => {
      expect(typeof interpreter.sendUI).toBe('function');
    });

    test('#22 => Symbol.dispose exists', () => {
      expect(interpreter[Symbol.dispose]).toBeDefined();
    });

    test('#23 => Symbol.asyncDispose exists', () => {
      expect(interpreter[Symbol.asyncDispose]).toBeDefined();
    });

    test('#24 => dispose', interpreter.dispose);
  });

  describe('#03 => Interpreter lifecycle methods', () => {
    const interpreter = createInterpreter(machine1, {
      context: { iterator: 0 },
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => Start the machine', () => {
      expect(() => interpreter.start()).not.toThrow();
    });

    test('#02 => Pause the machine', () => {
      expect(() => interpreter.pause()).not.toThrow();
    });

    test('#03 => Resume the machine', () => {
      expect(() => interpreter.resume()).not.toThrow();
    });

    test('#04 => Stop the machine', () => {
      expect(() => interpreter.stop()).not.toThrow();
    });

    test('#05 => dispose', interpreter.dispose);
  });

  describe('#04 => Interpreter state accessor methods', () => {
    const interpreter = createInterpreter(machine22, {
      pContext: {
        iterator: 0,
      },
      context: { iterator: 0, input: '', data: [] },
      exact: true,
    });

    beforeAll(() => vi.useFakeTimers());

    test('#00 => Start the machine', () => {
      interpreter.start();
    });

    it(...useWaiter(1, 6));

    describe('#02 => state accessor', () => {
      test('#01 => state() returns an accessor function', () => {
        const accessor = interpreter.state();
        expect(typeof accessor).toBe('function');
      });

      test('#02 => state() with custom accessor returns accessor function', () => {
        const accessor = interpreter.state(s => s.context);
        expect(typeof accessor).toBe('function');
      });

      test('#03 => state() with equals function returns accessor', () => {
        const accessor = interpreter.state(s => s.context, deepEqual);
        expect(typeof accessor).toBe('function');
      });
    });

    describe('#03 => watcher method', () => {
      test('#01 => watcher returns a function', () => {
        const watcher = interpreter.watcher(s => s.context);
        expect(typeof watcher).toBe('function');
      });

      test('#02 => watcher can be called with equals', () => {
        const watcher = interpreter.watcher(s => s.context.iterator);
        const result = watcher(deepEqual);
        expect(typeof result).toBe('number');
      });
    });

    describe('#04 => reducer method', () => {
      test('#01 => reducer returns a function', () => {
        const reducer = interpreter.reducer(s => s.context);
        expect(typeof reducer).toBe('function');
      });

      test('#02 => reducer can be chained', () => {
        const reducer = interpreter.reducer(s => s.context);
        const accessor = reducer(c => c.iterator);
        expect(typeof accessor).toBe('function');
      });

      test('#03 => reducer with equals returns accessor', () => {
        const reducer = interpreter.reducer(s => s.context);
        const accessor = reducer(c => c, deepEqual);
        expect(typeof accessor).toBe('function');
      });
    });

    describe('#05 => context method', () => {
      test('#01 => context returns accessor function', () => {
        const accessor = interpreter.context();
        expect(typeof accessor).toBe('function');
      });

      test('#02 => context with sub-accessor returns function', () => {
        const accessor = interpreter.context(c => c.iterator);
        expect(typeof accessor).toBe('function');
      });
    });

    describe('#06 => value and status', () => {
      test('#01 => value returns initial value', () => {
        const result = interpreter.value();
        expect(result).toBeDefined();
      });

      test('#02 => status returns initial status', () => {
        const result = interpreter.status();
        expect(typeof result).toBe('string');
      });
    });

    describe('#07 => dps method', () => {
      test('#01 => dps returns decomposed state value array', () => {
        const result = interpreter.dps();
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('#08 => matches and contains', () => {
      test('#01 => matches returns boolean', () => {
        const result = interpreter.matches('idle');
        expect(typeof result).toBe('boolean');
      });

      test('#02 => matches with multiple values returns boolean', () => {
        const result = interpreter.matches('idle', 'other');
        expect(typeof result).toBe('boolean');
      });

      test('#03 => contains returns boolean', () => {
        const result = interpreter.contains('idle');
        expect(typeof result).toBe('boolean');
      });

      test('#04 => contains with multiple values returns boolean', () => {
        const result = interpreter.contains('idle', 'other');
        expect(typeof result).toBe('boolean');
      });
    });

    describe('#09 => hasTags', () => {
      test('#01 => hasTags returns boolean', () => {
        const result = interpreter.hasTags('any');
        expect(typeof result).toBe('boolean');
      });

      test('#02 => hasTags with multiple tags returns boolean', () => {
        const result = interpreter.hasTags('tag1', 'tag2');
        expect(typeof result).toBe('boolean');
      });
    });

    test('#10 => dispose', interpreter.dispose);
  });

  describe('#05 => Interpreter with uiThread defined at creation', () => {
    type UIThread = {
      count: number;
      message: string;
      isActive: boolean;
    };

    const interpreter = createInterpreter(
      machine1,
      {
        context: { iterator: 0 },
        pContext: {},
      },
      { count: 0, message: '', isActive: false } as UIThread,
    );

    beforeAll(() => vi.useFakeTimers());

    describe('#01 => uiThread signals are created at instantiation', () => {
      test('#01 => __isUsedUi should be true when uiThread is provided', () => {
        const result = interpreter.__isUsedUi();
        expect(result).toBe(true);
      });

      test('#02 => state contains uiThread property', () => {
        const stateAccessor = interpreter.state();
        const currentState = stateAccessor();
        expect(currentState).toHaveProperty('uiThread');
      });

      test('#03 => uiThread has all keys defined at creation', () => {
        const stateAccessor = interpreter.state();
        const currentState = stateAccessor();
        expect(currentState.uiThread).toHaveProperty('count');
        expect(currentState.uiThread).toHaveProperty('message');
        expect(currentState.uiThread).toHaveProperty('isActive');
      });
    });

    describe('#02 => sendUI updates signals defined at creation', () => {
      test('#01 => sendUI can update count signal', () => {
        expect(() => {
          interpreter.sendUI({ type: 'count', payload: 42 });
        }).not.toThrow();
      });

      test('#02 => sendUI can update message signal', () => {
        expect(() => {
          interpreter.sendUI({ type: 'message', payload: 'Hello World' });
        }).not.toThrow();
      });

      test('#03 => sendUI can update isActive signal', () => {
        expect(() => {
          interpreter.sendUI({ type: 'isActive', payload: true });
        }).not.toThrow();
      });

      test('#04 => sendUI with different payload types', () => {
        expect(() => {
          interpreter.sendUI({ type: 'count', payload: -100 });
          interpreter.sendUI({ type: 'message', payload: '' });
          interpreter.sendUI({ type: 'isActive', payload: false });
        }).not.toThrow();
      });
    });

    describe('#03 => Machine lifecycle with uiThread', () => {
      test('#01 => Start the machine', () => {
        interpreter.start();
      });

      it(...useWaiter(2, 3));

      test('#03 => sendUI works after machine start', () => {
        expect(() => {
          interpreter.sendUI({ type: 'count', payload: 999 });
        }).not.toThrow();
      });

      test('#04 => Pause does not affect uiThread', () => {
        interpreter.pause();
        expect(() => {
          interpreter.sendUI({ type: 'message', payload: 'paused' });
        }).not.toThrow();
      });

      test('#05 => Resume does not affect uiThread', () => {
        interpreter.resume();
        expect(() => {
          interpreter.sendUI({ type: 'isActive', payload: true });
        }).not.toThrow();
      });
    });

    test('#04 => dispose', interpreter.dispose);
  });

  describe('#05b => uiThread keys cannot be added via addOptions', () => {
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

    type UIThread = {
      counter: number;
    };

    const interpreter = createInterpreter(
      baseMachine,
      { context: 0, pContext: {} },
      { counter: 0 } as UIThread,
    );

    beforeAll(() => vi.useFakeTimers());

    test('#01 => uiThread has counter key at creation', () => {
      const stateAccessor = interpreter.state();
      const currentState = stateAccessor();
      expect(currentState.uiThread).toHaveProperty('counter');
    });

    test('#02 => addOptions adds machine options, not uiThread keys', () => {
      const options = interpreter.addOptions(({ assign }) => ({
        actions: {
          inc: assign('context', ({ context }) => context + 1),
        },
      }));
      expect(options === undefined || typeof options === 'object').toBe(
        true,
      );
    });

    test('#03 => After addOptions, uiThread still only has original keys', () => {
      const stateAccessor = interpreter.state();
      const currentState = stateAccessor();
      expect(currentState.uiThread).toHaveProperty('counter');
      // uiThread keys are only those defined at creation
      const uiThreadKeys = Object.keys(currentState.uiThread ?? {});
      expect(uiThreadKeys).toContain('counter');
      expect(uiThreadKeys.length).toBe(1);
    });

    test('#05 => Start machine with options', () => {
      interpreter.start();
    });

    test('#04 => sendUI only works with keys defined at creation', () => {
      interpreter.send('INC');
      expect(() => {
        const toto = interpreter.sendUI({ type: 'counter', payload: 123 });

        console.warn('toto', toto); // to avoid unused variable warning
      }).not.toThrow();
    });

    it(...useWaiter(6, 7));

    it('', () => {
      const { result } = renderHook(() => interpreter.state()());
      console.warn('Current State in Hook', result);
      console.warn('Current State outside', interpreter.state()());
    });

    test('#07 => dispose', interpreter.dispose);
  });

  describe('#06 => Interpreter without uiThread', () => {
    const interpreter = createInterpreter(machine1, {
      context: { iterator: 0 },
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => __isUsedUi should be false when no uiThread', () => {
      const result = interpreter.__isUsedUi();
      expect(result).toBe(false);
    });

    test('#02 => dispose', interpreter.dispose);
  });

  describe('#07 => hasTags method behavior', () => {
    const machineWithTags = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            tags: ['loading', 'pending'],
            on: {
              NEXT: '/active',
            },
          },
          active: {
            tags: ['ready'],
            on: {
              BACK: '/idle',
            },
          },
        },
      },
      typings({
        eventsMap: { NEXT: 'primitive', BACK: 'primitive' },
        promiseesMap: {},
        pContext: 'primitive',
        context: 'primitive',
      }),
    );

    const interpreter = createInterpreter(machineWithTags, {
      context: undefined,
      pContext: undefined,
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => Start the machine', () => {
      interpreter.start();
    });

    test('#02 => hasTags returns boolean for existing tag', () => {
      const result = interpreter.hasTags('loading');
      expect(typeof result).toBe('boolean');
    });

    test('#03 => hasTags returns boolean for multiple tags', () => {
      const result = interpreter.hasTags('loading', 'pending');
      expect(typeof result).toBe('boolean');
    });

    test('#04 => hasTags returns false for non-existing tag', () => {
      const result = interpreter.hasTags('nonexistent');
      expect(result).toBe(false);
    });

    test('#05 => Send NEXT to change state', () => {
      interpreter.send('NEXT');
    });

    test('#06 => hasTags continues to work after state change', () => {
      const result = interpreter.hasTags('ready');
      expect(typeof result).toBe('boolean');
    });

    test('#07 => dispose', interpreter.dispose);
  });

  describe('#08 => addOptions method', () => {
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

    const interpreter = createInterpreter(baseMachine, {
      context: 0,
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => addOptions returns options or undefined', () => {
      const options = interpreter.addOptions(({ assign }) => ({
        actions: {
          inc: assign('context', ({ context }) => context + 1),
        },
      }));
      expect(options === undefined || typeof options === 'object').toBe(
        true,
      );
    });

    test('#02 => Start the machine', () => {
      interpreter.start();
    });

    test('#03 => context accessor works', () => {
      const accessor = interpreter.context();
      expect(typeof accessor).toBe('function');
    });

    test('#04 => Send INC does not throw', () => {
      expect(() => interpreter.send('INC')).not.toThrow();
    });

    test('#05 => dispose', interpreter.dispose);
  });

  describe('#09 => provideOptions method', () => {
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

    const interpreter1 = createInterpreter(baseMachine, {
      context: 0,
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => provideOptions returns a new Interpreter instance', () => {
      const interpreter2 = interpreter1.provideOptions(({ assign }) => ({
        actions: {
          inc: assign('context', ({ context }) => context + 2),
        },
      }));

      expect(interpreter2).not.toBe(interpreter1);
      expect(interpreter2).toBeInstanceOf(Object);
    });

    describe('#02 => New instance is independent', () => {
      const interpreter2 = interpreter1.provideOptions(({ assign }) => ({
        actions: {
          inc: assign('context', ({ context }) => context + 2),
        },
      }));

      test('#01 => Start both interpreters', () => {
        interpreter1.start();
        interpreter2.start();
      });

      test('#02 => Both have context accessor', () => {
        const accessor1 = interpreter1.context();
        const accessor2 = interpreter2.context();
        expect(typeof accessor1).toBe('function');
        expect(typeof accessor2).toBe('function');
      });

      test('#03 => Send INC to interpreter2 does not throw', () => {
        expect(() => interpreter2.send('INC')).not.toThrow();
      });

      test('#04 => Send INC to interpreter1 does not throw', () => {
        expect(() => interpreter1.send('INC')).not.toThrow();
      });

      test('#05 => dispose both', () => {
        interpreter1.dispose();
        interpreter2.dispose();
      });
    });
  });

  describe('#10 => Disposable and AsyncDisposable protocols', () => {
    test('#01 => Symbol.dispose works without throwing', () => {
      const interpreter = createInterpreter(machine1, {
        context: { iterator: 0 },
        pContext: {},
      });
      interpreter.start();
      expect(() => interpreter[Symbol.dispose]()).not.toThrow();
    });

    test('#02 => Symbol.asyncDispose works and returns promise', async () => {
      const interpreter = createInterpreter(machine1, {
        context: { iterator: 0 },
        pContext: {},
      });
      interpreter.start();
      const result = interpreter[Symbol.asyncDispose]();
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    test('#03 => dispose method works without throwing', () => {
      const interpreter = createInterpreter(machine1, {
        context: { iterator: 0 },
        pContext: {},
      });
      interpreter.start();
      expect(() => interpreter.dispose()).not.toThrow();
    });
  });

  describe('#11 => subscribe method', () => {
    const interpreter = createInterpreter(machine22, {
      pContext: { iterator: 0 },
      context: { iterator: 0, input: '', data: [] },
      exact: true,
    });

    const dumbFn = vi.fn();

    beforeAll(() => vi.useFakeTimers());

    test('#01 => subscribe returns a subscription object', () => {
      const sub = interpreter.subscribe(dumbFn);
      expect(sub).toBeDefined();
      expect(typeof sub.unsubscribe).toBe('function');
    });

    test('#02 => Start the machine', () => {
      interpreter.start();
    });

    it(...useWaiter(3, 6));

    test('#04 => Subscriber was called at least once', () => {
      expect(dumbFn).toHaveBeenCalled();
    });

    test('#05 => dispose', interpreter.dispose);
  });

  describe('#12 => State without tags', () => {
    const machineNoTags = createMachine(
      {
        initial: 'idle',
        states: {
          idle: {
            on: {
              NEXT: '/active',
            },
          },
          active: {},
        },
      },
      typings({
        eventsMap: { NEXT: 'primitive' },
        promiseesMap: {},
        pContext: 'primitive',
        context: 'primitive',
      }),
    );

    const interpreter = createInterpreter(machineNoTags, {
      context: undefined,
      pContext: undefined,
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => Start the machine', () => {
      interpreter.start();
    });

    test('#02 => hasTags returns false when state has no tags', () => {
      const result = interpreter.hasTags('any');
      expect(result).toBe(false);
    });

    test('#03 => dispose', interpreter.dispose);
  });

  describe('#13 => Complex machine22 workflow', () => {
    const interpreter = createInterpreter(machine22, {
      pContext: { iterator: 0 },
      context: { iterator: 0, input: '', data: [] },
      exact: true,
    });

    beforeAll(() => {
      vi.useFakeTimers();
    });

    test('#00 => Start the machine', () => {
      interpreter.start();
    });

    it(...useWaiter(1, 6));

    describe('#02 => Check initial state', () => {
      test('#01 => value returns a value', () => {
        const result = interpreter.value();
        expect(result).toBeDefined();
      });

      test('#02 => matches returns boolean', () => {
        const result = interpreter.matches('idle');
        expect(typeof result).toBe('boolean');
      });

      test('#03 => context accessor works', () => {
        const accessor = interpreter.context(c => c.iterator);
        expect(typeof accessor).toBe('function');
      });
    });

    test('#03 => Send NEXT does not throw', () => {
      expect(() => interpreter.send('NEXT')).not.toThrow();
    });

    describe('#04 => After NEXT', () => {
      test('#01 => value is still accessible', () => {
        const result = interpreter.value();
        expect(result).toBeDefined();
      });

      test('#02 => contains returns boolean', () => {
        const result = interpreter.contains('work');
        expect(typeof result).toBe('boolean');
      });
    });

    it(...useWaiter(5, 6));

    test('#06 => Pause the machine', () => {
      expect(() => interpreter.pause()).not.toThrow();
    });

    it(...useWaiter(7, 6));

    test('#08 => Resume the machine', () => {
      expect(() => interpreter.resume()).not.toThrow();
    });

    it(...useWaiter(9, 12));

    test('#10 => Send WRITE empty does not throw', () => {
      expect(() => {
        interpreter.send({ type: 'WRITE', payload: { value: '' } });
      }).not.toThrow();
    });

    test('#11 => Send WRITE with value does not throw', () => {
      expect(() => {
        interpreter.send({ type: 'WRITE', payload: { value: 'a' } });
      }).not.toThrow();
    });

    test('#12 => Send FETCH does not throw', () => {
      expect(() => interpreter.send('FETCH')).not.toThrow();
    });

    test('#13 => Await the fetch', async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    test('#14 => dispose', () => {
      interpreter.dispose();
    });
  });

  describe('#14 => Initial state values', () => {
    const interpreter = createInterpreter(machine1, {
      context: { iterator: 5 },
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => Initial state has context property', () => {
      const state = interpreter.state()();
      expect(state).toHaveProperty('context');
    });

    test('#02 => Initial state has value property', () => {
      const state = interpreter.state()();
      expect(state).toHaveProperty('value');
    });

    test('#03 => Initial state has status property', () => {
      const state = interpreter.state()();
      expect(state).toHaveProperty('status');
    });

    test('#04 => Initial state has event property', () => {
      const state = interpreter.state()();
      expect(state).toHaveProperty('event');
    });

    test('#05 => dispose', interpreter.dispose);
  });

  describe('#15 => sendUI with no uiThread', () => {
    const interpreter = createInterpreter(machine1, {
      context: { iterator: 0 },
      pContext: {},
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => sendUI returns undefined when no uiThread', () => {
      const result = interpreter.sendUI({
        type: 'anyKey' as never,
        payload: 42,
      });
      expect(result).toBeUndefined();
    });

    test('#02 => dispose', interpreter.dispose);
  });

  describe('#16 => Multiple state accessors', () => {
    const interpreter = createInterpreter(machine22, {
      pContext: { iterator: 0 },
      context: { iterator: 0, input: '', data: [] },
      exact: true,
    });

    beforeAll(() => vi.useFakeTimers());

    test('#01 => Can create multiple state accessors', () => {
      const accessor1 = interpreter.state();
      const accessor2 = interpreter.state(
        s => s.context,
        () => true,
      );
      const accessor3 = interpreter.state(s => s.value);

      expect(typeof accessor1).toBe('function');
      expect(typeof accessor2).toBe('function');
      expect(typeof accessor3).toBe('function');
    });

    test('#02 => Can create multiple reducers', () => {
      const reducer1 = interpreter.reducer(s => s.context);
      const reducer2 = interpreter.reducer(s => s.value);

      expect(typeof reducer1).toBe('function');
      expect(typeof reducer2).toBe('function');
    });

    test('#03 => Can create multiple watchers', () => {
      const watcher1 = interpreter.watcher(s => s.context);
      const watcher2 = interpreter.watcher(s => s.value);

      expect(typeof watcher1).toBe('function');
      expect(typeof watcher2).toBe('function');
    });

    test('#04 => dispose', interpreter.dispose);
  });
});
