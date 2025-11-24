import { createMachine, typings } from '@bemedev/app-ts';
import { renderHook } from '@solidjs/testing-library';
import { interpret } from '../interpret';

describe('#05 => UI Thread functionality', () => {
  const machine = createMachine(
    {
      initial: 'idle',
      states: {
        idle: {
          on: {
            NEXT: '/active',
          },
        },
        active: {
          on: {
            BACK: '/idle',
          },
        },
      },
    },
    typings({
      context: {
        count: 'number',
      },
      eventsMap: {
        NEXT: 'primitive',
        BACK: 'primitive',
      },
    }),
  );

  let interpreter: ReturnType<typeof interpret<typeof machine>>;

  beforeAll(() => {
    vi.useFakeTimers();
    interpreter = interpret(machine, {
      context: { count: 0 },
      pContext: {},
    });
  });

  afterAll(async () => {
    await interpreter.dispose();
    vi.useRealTimers();
  });

  describe('#01 => registerUiSignal', () => {
    test('#01 => registerUiSignal creates a new signal', () => {
      const accessor = interpreter.registerUiSignal(
        'testSignal',
        'initial',
      );
      expect(accessor).toBeDefined();
      expect(typeof accessor).toBe('function');
    });

    test('#02 => registered signal returns initial value', () => {
      const accessor = interpreter.registerUiSignal('counter', 42);
      const { result } = renderHook(accessor);
      expect(result).toBe(42);
    });

    test('#03 => registering same key returns existing signal', () => {
      const accessor1 = interpreter.registerUiSignal('sameKey', 'first');
      const accessor2 = interpreter.registerUiSignal('sameKey', 'second');
      expect(accessor1).toBe(accessor2);
      const { result } = renderHook(accessor1);
      expect(result).toBe('first'); // Uses first value, not second
    });

    test('#04 => can register multiple signals', () => {
      const signal1 = interpreter.registerUiSignal('signal1', 1);
      const signal2 = interpreter.registerUiSignal('signal2', 2);
      const signal3 = interpreter.registerUiSignal('signal3', 3);

      const { result: r1 } = renderHook(signal1);
      const { result: r2 } = renderHook(signal2);
      const { result: r3 } = renderHook(signal3);

      expect(r1).toBe(1);
      expect(r2).toBe(2);
      expect(r3).toBe(3);
    });
  });

  describe('#02 => uiThread property', () => {
    test('#01 => uiThread is accessible', () => {
      expect(interpreter.uiThread).toBeDefined();
      expect(typeof interpreter.uiThread).toBe('object');
    });

    test('#02 => uiThread contains registered signals', () => {
      interpreter.registerUiSignal('visible', true);
      expect(interpreter.uiThread['visible']).toBeDefined();
      expect(Array.isArray(interpreter.uiThread['visible'])).toBe(true);
    });

    test('#03 => uiThread signal tuple has accessor and setter', () => {
      interpreter.registerUiSignal('tuple', 'test');
      const [accessor, setter] = interpreter.uiThread['tuple'];
      expect(typeof accessor).toBe('function');
      expect(typeof setter).toBe('function');
    });
  });

  describe('#03 => select with uiThread prefix', () => {
    test('#01 => can select registered uiThread signals', () => {
      interpreter.registerUiSignal('loading', false);
      const accessor = interpreter.select('uiThread.loading');
      const { result } = renderHook(accessor);
      expect(result).toBe(false);
    });

    test('#02 => selecting non-existent uiThread signal returns undefined', () => {
      const accessor = interpreter.select('uiThread.nonExistent');
      const { result } = renderHook(accessor);
      expect(result).toBeUndefined();
    });

    test('#03 => can select regular context values', () => {
      interpreter.start();
      const accessor = interpreter.select('context.count');
      const { result } = renderHook(accessor);
      expect(result).toBe(0);
    });
  });

  describe('#04 => sendUI', () => {
    test('#01 => sendUI is a function', () => {
      expect(typeof interpreter.sendUI).toBe('function');
    });

    test('#02 => sendUI accepts event string', () => {
      expect(() => interpreter.sendUI('NEXT')).not.toThrow();
    });

    test('#03 => sendUI accepts event object', () => {
      expect(() =>
        interpreter.sendUI({ type: 'NEXT', payload: {} }),
      ).not.toThrow();
    });

    test('#04 => sendUI does not throw with no registered signals', () => {
      const freshInterpreter = interpret(machine, {
        context: { count: 0 },
        pContext: {},
      });
      expect(() => freshInterpreter.sendUI('NEXT')).not.toThrow();
    });
  });

  describe('#05 => integration with regular interpreter', () => {
    test('#01 => uiThread works alongside regular state', () => {
      const service = interpret(machine, {
        context: { count: 5 },
        pContext: {},
      });

      service.registerUiSignal('modalOpen', false);
      service.start();

      // Regular context
      const contextAccessor = service.context(c => c.count);
      const { result: contextResult } = renderHook(contextAccessor);
      expect(contextResult).toBe(5);

      // UI Thread signal
      const uiAccessor = service.select('uiThread.modalOpen');
      const { result: uiResult } = renderHook(uiAccessor);
      expect(uiResult).toBe(false);
    });

    test('#02 => send and sendUI are independent', () => {
      const service = interpret(machine, {
        context: { count: 0 },
        pContext: {},
      });

      service.registerUiSignal('uiCounter', 0);
      service.start();

      // Regular send should work
      service.send('NEXT');
      const { result: value } = renderHook(service.value);
      expect(value).toBe('active');

      // sendUI should also work
      expect(() => service.sendUI('BACK')).not.toThrow();
    });
  });
});

describe('#06 => Interpreter type export', () => {
  test('#01 => interpret returns object with expected properties', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: { idle: {} },
      },
      typings({
        context: {
          count: 'number',
        },
        eventsMap: {},
      }),
    );

    const service = interpret(machine, {
      context: { count: 0 },
      pContext: {},
    });

    // Original properties
    expect(service.contains).toBeDefined();
    expect(service.context).toBeDefined();
    expect(service.dispose).toBeDefined();
    expect(service.dps).toBeDefined();
    expect(service.matches).toBeDefined();
    expect(service.pause).toBeDefined();
    expect(service.reducer).toBeDefined();
    expect(service.resume).toBeDefined();
    expect(service.select).toBeDefined();
    expect(service.send).toBeDefined();
    expect(service.start).toBeDefined();
    expect(service.state).toBeDefined();
    expect(service.status).toBeDefined();
    expect(service.stop).toBeDefined();
    expect(service.subscribe).toBeDefined();
    expect(service.tags).toBeDefined();
    expect(service.value).toBeDefined();
    expect(service.values).toBeDefined();
    expect(service.addOptions).toBeDefined();
    expect(service.provideOptions).toBeDefined();
    expect(service.service).toBeDefined();

    // New uiThread properties
    expect(service.registerUiSignal).toBeDefined();
    expect(service.sendUI).toBeDefined();
    expect(service.uiThread).toBeDefined();
  });

  test('#02 => primitive context has undefined select', () => {
    const machine = createMachine(
      {
        initial: 'idle',
        states: { idle: {} },
      },
      typings({
        context: 'number',
        eventsMap: {},
      }),
    );

    const service = interpret(machine, {
      context: 0,
      pContext: {},
    });

    // Select is undefined for primitive context
    expect(service.select).toBeUndefined();

    // But uiThread properties should still work
    expect(service.registerUiSignal).toBeDefined();
    expect(service.sendUI).toBeDefined();
    expect(service.uiThread).toBeDefined();
  });
});
