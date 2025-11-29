import {
  interpret as _interpret,
  decomposeSV,
  type AnyMachine,
  type InterpreterFrom,
  type InterpreterOptions,
  type WorkingStatus,
} from '@bemedev/app-ts';
import { DEFAULT_DELIMITER as replacement } from '@bemedev/app-ts/lib/constants/strings.js';
import { INIT_EVENT } from '@bemedev/app-ts/lib/events/constants.js';
import type {
  Ru,
  SoA,
} from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import type { StateValue } from '@bemedev/app-ts/lib/states/types';
import { merge } from '@bemedev/app-ts/lib/utils/merge.js';
import { createMemo, createSignal, untrack, type Signal } from 'solid-js';
import { defaultSelector } from './default';
import { asyncify } from './helpers';
import type {
  AddOptions_F,
  Options,
  SendUI_F,
  State_F,
  StateSignal,
} from './interpreter.types';

class Interpreter<const M extends AnyMachine, S extends Ru>
  implements Disposable, AsyncDisposable
{
  #status: WorkingStatus = 'idle';
  #machine: M;
  #service: InterpreterFrom<M>;
  #mainState: Signal<StateSignal<M, S>>;
  #options?: Options<M, S>;
  private interpreterOptions?: InterpreterOptions<M>;

  get #setState() {
    return this.#mainState[1];
  }
  get #state() {
    return this.#mainState[0];
  }

  get #canPerform() {
    return this.#status === 'started' || this.#status === 'working';
  }

  get __stateSignal() {
    return undefined as unknown as StateSignal<M, S>;
  }

  #setUI = () => {
    this.#setState(state => {
      const out = {
        ...this.#initialState,
        ...state,
        uiThread: Object.entries({
          ...this.#options?.uiThread,
        }).reduce((acc, [key, value]: [string, any]) => {
          acc[key as keyof S] = value?.[0]();
          return acc;
        }, {} as any),
      };

      return out;
    });
  };

  constructor({
    machine,
    options: interpreterOptions,
    uiThread,
  }: {
    machine: M;
    options?: InterpreterOptions<M>;
    uiThread?: S;
  }) {
    this.#machine = machine;
    this.interpreterOptions = interpreterOptions;

    this.#service = (_interpret as any)(
      this.#machine,
      this.interpreterOptions,
    );

    this.subscribe(next => {
      this.#setState(prev => merge(prev, next));
    });

    if (uiThread) {
      if (!this.#options) this.#options = {} as any;
      this.#options!.uiThread = Object.entries(uiThread).reduce(
        (acc, [key, value]) => {
          acc[key as keyof S] = createSignal(value);
          return acc;
        },
        {} as any,
      );
    }

    const _ui = this.#options?.uiThread;

    this.#initialState = {
      context: this.#service.context,
      status: 'idle',
      value: this.#service.initialValue,
      event: INIT_EVENT,
      uiThread: _ui
        ? Object.entries(_ui)
            .map(
              ([key, [signal]]: [string, any]) =>
                [key, signal()] as [keyof S, S[keyof S]],
            )
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {} as any)
        : undefined,
    } as StateSignal<M, S>;

    this.#mainState = createSignal(this.#initialState);
    this.#setUI();
  }

  get start() {
    this.#status = 'started';
    return this.#service.start;
  }

  get pause() {
    return this.#service.pause;
  }

  get resume() {
    return this.#service.resume;
  }

  stop = () => {
    this.#status = 'stopped';
    this.#service.stop();
    untrack(this.#mainState[0]);
  };

  get subscribe() {
    return this.#service.subscribe;
  }

  readonly #initialState: StateSignal<M, S>;

  get send() {
    return this.#service.send;
  }

  sendUI: SendUI_F<S> = event => {
    if (!this.#canPerform) return;
    const fn = this.#options?.uiThread?.[event.type]?.[1];

    const out = fn(event.payload as any);
    this.#setUI();

    return out;
  };

  state: State_F<StateSignal<M, S>> = (
    accessor = defaultSelector,
    equals,
  ) => {
    return createMemo(
      () => {
        const value = this.#state();
        return accessor(value);
      },
      this.#initialState,
      { equals },
    );
  };

  watcher = <T>(accessor: (state: StateSignal<M, S>) => T) => {
    return (equals?: false | ((prev: T, next: T) => boolean)) => {
      return this.state(accessor, equals);
    };
  };

  reducer = <T>(accessor: (state: StateSignal<M, S>) => T) => {
    return <R = T>(
      _accessor: (state: T) => R = defaultSelector,
      equals?: false | ((prev: R, next: R) => boolean),
    ) => {
      return this.state(state => {
        const step1 = accessor(state);
        const step2 = _accessor(step1);
        return step2;
      }, equals);
    };
  };

  context = this.reducer<M['context']>(state => state.context);
  value = this.watcher<StateValue>(state => state.value);
  status = this.watcher<WorkingStatus>(state => state.status);
  tags = this.watcher<SoA<string>>(state => state.tags ?? []);
  ui = this.reducer<Partial<S> | undefined>(state => state.uiThread);

  hasTags = (...tags: string[]) => {
    const currentTags = this.state(({ tags }) => tags)();
    if (!currentTags) return false;
    return tags.every(tag => currentTags.includes(tag));
  };

  /**
   * @deprecated
   * Only for testing purposes
   */
  get __isUsedUi() {
    const state = this.#options?.uiThread;
    return !!state && Object.keys(state).length > 0;
  }

  dps = this.watcher(({ value }) =>
    decomposeSV
      .low(value)
      .map(entry => entry.replaceAll('.', replacement)),
  );

  matches = (...values: string[]) => {
    const dps = this.dps()();
    return createMemo(() => values.every(value => dps.includes(value)));
  };

  contains = (...values: string[]) => {
    const dps = this.dps()();
    return createMemo(() => values.some(value => dps.includes(value)));
  };

  addOptions: AddOptions_F<M, S> = option => {
    this.#options = merge(this.#options, this.#service.addOptions(option));
    this.#setUI();
    return this.#options;
  };

  provideOptions = (
    option: Parameters<InterpreterFrom<M>['addOptions']>[0],
  ) => {
    const instance = new Interpreter<M, S>({
      machine: this.#machine,
      options: this.interpreterOptions,
    });
    instance.addOptions(option);

    return instance;
  };

  dispose = () => {
    this.stop();
    this.#service.dispose();
    this.#options = undefined;
    (this.#mainState as any) = undefined;
    this.interpreterOptions = undefined;
  };

  [Symbol.dispose] = this.dispose;
  [Symbol.asyncDispose] = asyncify(this.dispose);
}

export type AnyInterpreter = Record<
  | '__stateSignal'
  | 'state'
  | 'context'
  | 'ui'
  | 'value'
  | 'status'
  | 'tags'
  | 'dps',
  any
>;

export type { Interpreter };

export type InterpreterArgs<M extends AnyMachine, S extends Ru> = {
  machine: M;
  uiThread?: S;
} & (object extends InterpreterOptions<M>
  ? { options?: InterpreterOptions<M> }
  : { options: InterpreterOptions<M> });

export type Interpreter_F = <const M extends AnyMachine, S extends Ru>(
  args: InterpreterArgs<M, S>,
) => Interpreter<M, S>;

export const createInterpreter: Interpreter_F = args => {
  return new Interpreter(args as any);
};

export const interpret = createInterpreter;
