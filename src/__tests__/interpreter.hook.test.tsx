import type { AnyMachine, WorkingStatus } from '@bemedev/app-ts';
import type { Ru } from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import type { StateValue } from '@bemedev/app-ts/lib/states';
import { renderHook } from '@solidjs/testing-library';
import type { Interpreter } from '../interpreter';
import { createInterpreter } from '../interpreter';
import { DELAY, machine2 } from './fixtures';

vi.useFakeTimers();

/**
 * TestInterpreter is a test wrapper class for the Interpreter.
 * It uses renderHook for all reactive methods, making it easier to test
 * reactive state changes without using the complicated reducer pattern.
 */
class TestInterpreter<const M extends AnyMachine, const S extends Ru> {
  private interpreter: Interpreter<M, S>;

  constructor(interpreter: Interpreter<M, S>) {
    this.interpreter = interpreter;
  }

  get start() {
    return this.interpreter.start;
  }

  get pause() {
    return this.interpreter.pause;
  }

  get resume() {
    return this.interpreter.resume;
  }

  get stop() {
    return this.interpreter.stop;
  }

  get send() {
    return this.interpreter.send;
  }

  get sendUI() {
    return this.interpreter.sendUI;
  }

  get subscribe() {
    return this.interpreter.subscribe;
  }

  get dispose() {
    return this.interpreter.dispose;
  }

  get matches() {
    return this.interpreter.matches;
  }

  get contains() {
    return this.interpreter.contains;
  }

  get hasTags() {
    return this.interpreter.hasTags;
  }

  get addOptions() {
    return this.interpreter.addOptions;
  }

  get provideOptions() {
    return this.interpreter.provideOptions;
  }

  /**
   * Check if the state matches the given values using renderHook
   * This is needed because matches() reads reactive state internally
   */
  testMatches(...values: string[]): boolean {
    const { result } = renderHook(() => {
      const dps = this.interpreter.dps()();
      return values.every(value => dps.includes(value));
    });
    return result;
  }

  /**
   * Check if the state contains the given values using renderHook
   * This is needed because contains() reads reactive state internally
   */
  testContains(...values: string[]): boolean {
    const { result } = renderHook(() => {
      const dps = this.interpreter.dps()();
      return values.some(value => dps.includes(value));
    });
    return result;
  }

  /**
   * Get the current value using renderHook
   * value() returns a watcher function that when called returns an accessor
   */
  getValue(): StateValue {
    const { result } = renderHook(() => this.interpreter.value()());
    return result;
  }

  /**
   * Get the current status using renderHook
   * status() returns a watcher function that when called returns an accessor
   */
  getStatus(): WorkingStatus {
    const { result } = renderHook(() => this.interpreter.status()());
    return result;
  }

  /**
   * Get the current context using renderHook with an optional accessor
   * Uses the state method directly to avoid the complicated reducer pattern
   */
  getContext<T = M['context']>(
    accessor?: (context: M['context']) => T,
  ): T {
    const { result } = renderHook(() => {
      const stateAccessor = this.interpreter.state(state => {
        const ctx = state.context;
        return accessor ? accessor(ctx) : ctx;
      });
      return stateAccessor();
    });
    return result as T;
  }

  /**
   * Get the current tags using renderHook
   * tags() returns a watcher function that when called returns an accessor
   */
  getTags(): string[] | undefined {
    const { result } = renderHook(() => this.interpreter.tags()());
    return result;
  }

  /**
   * Get the decomposed state values using renderHook
   * dps() returns a watcher function that when called returns an accessor
   */
  getDps(): string[] {
    const { result } = renderHook(() => this.interpreter.dps()());
    return result;
  }

  /**
   * Get UI thread state using renderHook with an optional accessor
   * Uses the state method directly to avoid the complicated reducer pattern
   */
  getUI<T = Partial<S> | undefined>(
    accessor?: (ui: Partial<S> | undefined) => T,
  ): T {
    const { result } = renderHook(() => {
      const stateAccessor = this.interpreter.state(state => {
        const ui = state.uiThread;
        return accessor ? accessor(ui) : ui;
      });
      return stateAccessor();
    });
    return result as T;
  }

  /**
   * Get a custom state slice using renderHook
   */
  getState<T>(
    accessor: (
      state: ReturnType<ReturnType<Interpreter<M, S>['state']>>,
    ) => T,
  ): T {
    const { result } = renderHook(() => {
      const stateAccessor = this.interpreter.state(accessor as any);
      return stateAccessor();
    });
    return result as T;
  }
}

describe('TESTS', () => {
  describe('#01 => TestInterpreter basic functionality', () => {
    const inter = createInterpreter({
      machine: machine2,
      options: {
        pContext: { iterator: 0 },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      },
    });

    const testInter = new TestInterpreter(inter);

    test('#01 => Initial value is idle', () => {
      testInter.start();
      expect(testInter.getValue()).toBe('idle');
    });

    test('#02 => Initial iterator is 0', () => {
      expect(testInter.getContext(c => c.iterator)).toBe(0);
    });

    test('#03 => After advancing time, iterator increases', async () => {
      await vi.advanceTimersByTimeAsync(DELAY * 10);
      expect(testInter.getContext(c => c.iterator)).toBe(10);
    });

    test('#04 => After NEXT, value changes to working', () => {
      testInter.send('NEXT');
      expect(testInter.getValue()).toStrictEqual({
        working: {
          fetch: 'idle',
          ui: 'idle',
        },
      });
    });

    test('#05 => Status is working', () => {
      expect(testInter.getStatus()).toBe('working');
    });

    test('#06 => matches working', () => {
      expect(testInter.testMatches('working')).toBe(true);
    });

    test('#07 => contains working/fetch', () => {
      expect(testInter.testContains('working/fetch')).toBe(true);
    });

    test('#08 => Cleanup', () => {
      testInter.dispose();
    });
  });

  describe('#02 => TestInterpreter with context accessor', () => {
    const inter = createInterpreter({
      machine: machine2,
      options: {
        pContext: { iterator: 0 },
        context: { iterator: 5, input: 'test', data: ['a', 'b'] },
        exact: true,
      },
    });

    const testInter = new TestInterpreter(inter);

    test('#01 => getContext returns full context', () => {
      testInter.start();
      const ctx = testInter.getContext();
      expect(ctx).toStrictEqual({
        iterator: 5,
        input: 'test',
        data: ['a', 'b'],
      });
    });

    test('#02 => getContext with accessor returns specific value', () => {
      expect(testInter.getContext(c => c.input)).toBe('test');
    });

    test('#03 => getContext with array accessor', () => {
      expect(testInter.getContext(c => c.data)).toStrictEqual(['a', 'b']);
    });

    test('#04 => Cleanup', () => {
      testInter.dispose();
    });
  });

  describe('#03 => TestInterpreter state transitions', () => {
    const inter = createInterpreter({
      machine: machine2,
      options: {
        pContext: { iterator: 0 },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      },
    });

    const testInter = new TestInterpreter(inter);

    test('#01 => Start machine', () => {
      testInter.start();
      expect(testInter.getValue()).toBe('idle');
    });

    test('#02 => Transition to working', () => {
      testInter.send('NEXT');
      expect(testInter.testMatches('working')).toBe(true);
    });

    test('#03 => Write to input', () => {
      testInter.send({ type: 'WRITE', payload: { value: 'hello' } });
      expect(testInter.getContext(c => c.input)).toBe('hello');
    });

    test('#04 => Transition to final', () => {
      testInter.send('FINISH');
      expect(testInter.getValue()).toBe('final');
    });

    test('#05 => Cleanup', () => {
      testInter.dispose();
    });
  });
});
