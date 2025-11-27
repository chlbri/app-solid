import type { AnyMachine, WorkingStatus } from '@bemedev/app-ts';
import type {
  Ru,
  SoA,
} from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import type { StateValue } from '@bemedev/decompose';
import {
  createRoot,
  getOwner,
  runWithOwner,
  type Accessor,
} from 'solid-js';
import { expect, type VitestUtils } from 'vitest';
import { defaultSelector } from '../../default';
import type { Interpreter } from '../../interpreter';
import type { State_F, StateSignal } from '../../interpreter.types';
import { tuple } from './tuple';

type TestFn = <T>(args: {
  invite: string;
  expected: T;
  actual: Accessor<T>;
}) => [string, () => void];

class InterpreterTest<const M extends AnyMachine, S extends Ru> {
  constructor(
    private vi: VitestUtils,
    private _service: Interpreter<M, S>,
  ) {}

  #testsCounter = 0;

  #buildInvite = (invite: string) => {
    const index =
      this.#testsCounter < 10
        ? '0' + this.#testsCounter
        : `${this.#testsCounter}`;

    this.#testsCounter++;
    return `#${index} => ${invite}`;
  };

  #buildTest: TestFn = ({ invite, expected, actual }) => {
    const _invite = this.#buildInvite(invite);

    return tuple(_invite, () => {
      const result = runWithOwner(this.#owner, actual);
      expect(result).toEqual(expected);
    });
  };

  get __service() {
    return {} as typeof this._service;
  }

  #owner = getOwner();

  testBy = <T>(
    fn: (args: {
      state: <
        T = {
          context: M['context'];
          value: StateValue;
          tags?: SoA<string>;
          event: M['__events'];
          status: WorkingStatus;
          uiThread?: Partial<S>;
        },
      >(
        accessor?: (ctx: {
          context: M['context'];
          value: StateValue;
          tags?: SoA<string>;
          event: M['__events'];
          status: WorkingStatus;
          uiThread?: Partial<S>;
        }) => T,
        equals?: false | ((prev: T, next: T) => boolean) | undefined,
      ) => Accessor<T>;
      context: <T = M['context']>(
        accessor?: (ctx: M['context']) => T,
        equals?: false | ((prev: T, next: T) => boolean) | undefined,
      ) => Accessor<T>;
      ui: <T = Partial<S> | undefined>(
        _accessor?: (ui: Partial<S> | undefined) => T,
        equals?: false | ((prev: T, next: T) => boolean),
      ) => Accessor<T>;
      value: (
        equals?:
          | false
          | ((prev: StateValue, next: StateValue) => boolean)
          | undefined,
      ) => Accessor<StateValue>;
      status: (
        equals?:
          | false
          | ((prev: WorkingStatus, next: WorkingStatus) => boolean)
          | undefined,
      ) => Accessor<WorkingStatus>;
      tags: (
        equals?:
          | false
          | ((prev: SoA<string>, next: SoA<string>) => boolean),
      ) => Accessor<SoA<string>>;
      dps: (
        equals?: false | ((prev: string[], next: string[]) => boolean),
      ) => Accessor<string[]>;
    }) => Accessor<T>,
  ) => {
    return (invite: string, expected: T) => {
      const actual = fn({
        state: this.#state,
        context: this.#context,
        ui: this.#ui,
        value: this.#value,
        status: this.#status,
        tags: this.#tags,
        dps: this.#dps,
      });

      return this.#buildTest({ invite, expected, actual });
    };
  };

  #createFakeWaiter = () => {
    const waiter = async (ms = 0, times = 1) => {
      const check = this.vi.isFakeTimers();
      for (let i = 0; i < times; i++) {
        if (check) await this.vi.advanceTimersByTimeAsync(ms);
        else await new Promise(resolve => setTimeout(resolve, ms));
      }
    };

    waiter.withDefaultDelay = (ms = 0) => {
      return (times = 1) => {
        const invite = this.#buildInvite(
          `Wait for ${ms}ms times ${times}`,
        );
        const fn = () => waiter(ms, times);
        return tuple(invite, fn);
      };
    };

    waiter.all = (ms = 0, times = 1) => {
      const invite = this.#buildInvite(`Wait for ${ms}ms times ${times}`);
      const fn = () => waiter(ms, times);
      return tuple(invite, fn);
    };

    return waiter;
  };

  get createFakeWaiter() {
    return this.#createFakeWaiter();
  }

  #state: State_F<StateSignal<M, S>> = (
    accessor = defaultSelector,
    equals,
  ) => {
    return createRoot(
      () => this._service.state(accessor, equals),
      this.#owner,
    );
  };

  #context = <T = M['context']>(
    accessor: (ctx: M['context']) => T = defaultSelector,
    equals?: false | ((prev: T, next: T) => boolean),
  ) => {
    return createRoot(
      () => this._service.context(accessor, equals),
      this.#owner,
    );
  };

  #value = (
    equals?: false | ((prev: StateValue, next: StateValue) => boolean),
  ) => {
    return createRoot(() => this._service.value(equals), this.#owner);
  };

  #status = (
    equals?:
      | false
      | ((prev: WorkingStatus, next: WorkingStatus) => boolean),
  ) => {
    return createRoot(() => this._service.status(equals), this.#owner);
  };

  #tags = (
    equals?: false | ((prev: SoA<string>, next: SoA<string>) => boolean),
  ) => {
    return createRoot(() => this._service.tags(equals), this.#owner);
  };

  #dps = (
    equals?: false | ((prev: string[], next: string[]) => boolean),
  ) => {
    return createRoot(() => this._service.dps(equals), this.#owner);
  };

  matches = (...values: string[]) => {
    return tuple(
      this.#buildInvite(
        `The current "value" matches : (${values.join(', ')})`,
      ),
      () => {
        const actual = createRoot(
          () => this._service.matches(...values),
          this.#owner,
        );

        const _actual = runWithOwner(this.#owner, actual);

        expect(_actual).toBe(true);
      },
    );
  };

  contains = (...values: string[]) => {
    return tuple(
      this.#buildInvite(
        `The current "value" matches : (${values.join(', ')})`,
      ),
      () => {
        const actual = createRoot(
          () => this._service.contains(...values),
          this.#owner,
        );

        const _actual = runWithOwner(this.#owner, actual);

        expect(_actual).toBe(true);
      },
    );
  };

  #ui = <T = Partial<S> | undefined>(
    _accessor: (ui: Partial<S> | undefined) => T = defaultSelector,
    equals?: false | ((prev: T, next: T) => boolean),
  ) => {
    return createRoot(
      () => this._service.ui(_accessor, equals),
      this.#owner,
    );
  };

  get __isUsedUi() {
    return this._service.__isUsedUi;
  }

  get start() {
    return tuple(
      this.#buildInvite('Start the machine'),
      this._service.start,
    );
  }

  get stop() {
    return tuple(
      this.#buildInvite('Stop the machine'),
      this._service.stop,
    );
  }

  get pause() {
    return tuple(
      this.#buildInvite('Pause the machine'),
      this._service.pause,
    );
  }

  get resume() {
    return tuple(
      this.#buildInvite('Resume the machine'),
      this._service.resume,
    );
  }

  send = (event: Parameters<typeof this._service.send>[0]) => {
    return tuple(
      this.#buildInvite(
        `Send an event : "${(event as any).type ?? event}" event`,
      ),
      () => this._service.send(event),
    );
  };

  get addOptions() {
    return this._service.addOptions;
  }

  get provideOptions() {
    return this._service.provideOptions;
  }

  sendUI = (event: Parameters<typeof this._service.sendUI>[0]) => {
    return tuple(
      this.#buildInvite(
        `Send an UI event : "${(event as any).type ?? event}" event`,
      ),
      () => this._service.sendUI(event),
    );
  };

  hasTags = (...tags: string[]) => {
    return tuple(
      this.#buildInvite(`Check hasTags : (${tags.join(', ')})`),
      () => {
        const actual = runWithOwner(this.#owner, () =>
          createRoot(() => this._service.hasTags(...tags), this.#owner),
        );
        expect(actual).toBe(true);
      },
    );
  };

  get dispose() {
    return tuple(
      this.#buildInvite('Dispose the machine'),
      this._service.dispose,
    );
  }
}

export type { InterpreterTest };

export const createTests = <M extends AnyMachine, S extends Ru>(
  vi: VitestUtils,
  service: Interpreter<M, S>,
) => new InterpreterTest<M, S>(vi, service);
