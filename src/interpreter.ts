import {
  decomposeSV,
  interpret,
  type AnyMachine,
  type InterpreterFrom,
  type InterpreterOptions,
} from '@bemedev/app-ts';
import { DEFAULT_DELIMITER as replacement } from '@bemedev/app-ts/lib/constants/index.js';
import { INIT_EVENT } from '@bemedev/app-ts/lib/events';
import type { Ru } from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import { merge } from '@bemedev/app-ts/lib/utils';
import { createMemo, createSignal } from 'solid-js';
import { defaultSelector } from './default';
import type {
  AddOptions_F,
  Options,
  SendUI_F,
  State_F,
  StateSignal,
} from './types';

class Interpreter<const M extends AnyMachine, const S extends Ru>
  implements Disposable, AsyncDisposable
{
  #machine: M;
  // #options?: Options<M, S>;
  #service: InterpreterFrom<M>;
  #mainState = createSignal<StateSignal<M, S>>();
  #options?: Options<M, S>;

  #setState = this.#mainState[1];
  #state = () => {
    const [getState] = this.#mainState;
    return getState() ?? this.#initialState;
  };

  #addUIState = () => {
    console.warn('Adding UI State');
    this.#setState(state => {
      return {
        ...state,
        uiThread: Object.entries({
          ...this.#options?.uiThread,
        }).reduce((acc, [key, value]: [string, any]) => {
          acc[key as keyof S] = value?.[0]();
          return acc;
        }, {} as any),
      };
    });
  };

  constructor(
    machine: M,
    private interpreterOptions?: InterpreterOptions<M>,
    uiThread?: S,
  ) {
    this.#machine = machine;

    if (uiThread) {
      if (!this.#options) this.#options = {} as any;
      this.#options!.uiThread = Object.entries(uiThread).reduce(
        (acc, [key]) => {
          acc[key as keyof S] = createSignal();
          return acc;
        },
        {} as any,
      );

      this.#addUIState();
    }

    this.#service = (interpret as any)(this.#machine, interpreterOptions);

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
              if (!acc) acc = {} as any;
              acc[key] = value;
              return acc;
            }, {} as any)
        : undefined,
    } as StateSignal<M, S>;

    this.subscribe(next => {
      this.#setState(prev => ({
        ...prev,
        ...next,
      }));
    });
  }

  get start() {
    return this.#service.start;
  }

  get pause() {
    return this.#service.pause;
  }

  get resume() {
    return this.#service.resume;
  }

  get stop() {
    return this.#service.stop;
  }

  get subscribe() {
    return this.#service.subscribe;
  }

  readonly #initialState: StateSignal<M, S>;

  get send() {
    return this.#service.send;
  }

  sendUI: SendUI_F<S> = event => {
    const fn = this.#options?.uiThread?.[event.type]?.[1];
    console.log('thread', !!this.#options?.uiThread);
    console.log('fn', !!fn);
    const out = this.#options?.uiThread?.[event.type]?.[1](
      event.payload as any,
    );
    this.#addUIState();

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
    return (equals?: (prev: T, next: T) => boolean) => {
      return this.state(accessor, equals)();
    };
  };

  reducer = <T>(accessor: (state: StateSignal<M, S>) => T) => {
    return <R = T>(
      _accessor: (state: T) => R = defaultSelector,
      equals?: (prev: R, next: R) => boolean,
    ) => {
      return this.state(state => {
        const step1 = accessor(state);
        const step2 = _accessor(step1);
        return step2;
      }, equals);
    };
  };

  context = this.reducer(state => state.context);
  value = this.watcher(state => state.value);
  status = this.watcher(state => state.status);
  hasTags = (...tags: string[]) => {
    const currentTags = this.state(({ tags }) => tags)();
    if (!currentTags) return false;
    return tags.every(tag => currentTags.includes(tag));
  };

  ui = this.reducer(state => state.uiThread);

  /**
   * @deprecated
   * Only for testing purposes
   */

  __isUsedUi = () => {
    const state = this.#options?.uiThread;
    return !!state && Object.keys(state).length > 0;
  };

  dps = this.watcher(({ value }) =>
    decomposeSV
      .low(value)
      .map(entry => entry.replaceAll('.', replacement)),
  );

  matches = (...values: string[]) => {
    const dps = this.dps();
    return values.every(value => dps.includes(value));
  };

  contains = (...values: string[]) => {
    const dps = this.dps();
    return values.some(value => dps.includes(value));
  };

  addOptions: AddOptions_F<M, S> = option => {
    this.#options = merge(this.#options, this.#service.addOptions(option));
    this.#addUIState();
    return this.#options;
  };

  provideOptions = (
    option: Parameters<InterpreterFrom<M>['addOptions']>[0],
  ) => {
    const instance = new Interpreter<M, S>(
      this.#machine,
      this.interpreterOptions,
    );
    instance.addOptions(option);

    return instance;
  };

  dispose = () => {
    this.#service.dispose();
    this.#setState();
    this.interpreterOptions = undefined;
    this.#options = undefined;
    (this.#mainState as any) = undefined;
  };

  [Symbol.dispose] = this.dispose;

  [Symbol.asyncDispose] = async () => this.dispose();
}

export type { Interpreter };

export type Interpreter_F = <
  const M extends AnyMachine,
  const S extends Ru,
>(
  ...[machine, config, uiThread]: object extends InterpreterOptions<M>
    ? [M, InterpreterOptions<M>?, S?]
    : [M, InterpreterOptions<M>, S?]
) => Interpreter<M, S>;

export const createInterpreter: Interpreter_F = (
  ...[machine, config, uiThread]
) => {
  const args = [machine, config, uiThread] as [any, any, any];
  return new Interpreter(...args);
};
