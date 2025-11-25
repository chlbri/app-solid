import {
  decomposeSV,
  interpret,
  type AnyMachine,
  type ContextFrom,
  type EventsFrom,
  type InterpreterFrom,
  type InterpreterOptions,
  type MachineOptionsFrom,
  type State,
} from '@bemedev/app-ts';
import { DEFAULT_DELIMITER as replacement } from '@bemedev/app-ts/lib/constants/index.js';
import { INIT_EVENT } from '@bemedev/app-ts/lib/events';
import type { Ru } from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import {
  createMemo,
  createSignal,
  type Accessor,
  type Signal,
} from 'solid-js';
import { produce } from 'solid-js/store';
import { defaultSelector } from './default';

type ToSignals<T extends Ru> = {
  [K in keyof T]?: Signal<T[K] | undefined>;
};

type StateSignal<M extends AnyMachine, S extends Ru> = State<
  ContextFrom<M>,
  EventsFrom<M>
> & {
  uiThread?: {
    [K in keyof S]?: Accessor<S[K] | undefined>;
  };
};

export type Options<
  M extends AnyMachine,
  S extends Ru,
> = MachineOptionsFrom<M> & {
  uiThread?: ToSignals<S>;
};

export class Interpreter<
  const M extends AnyMachine,
  const S extends Ru,
  Si extends StateSignal<M, S> = StateSignal<M, S>,
> {
  #machine: M;
  #uiThread?: ToSignals<S>;
  // #options?: Options<M, S>;
  #service: InterpreterFrom<M>;
  #mainState = createSignal<Si>();

  #setState = this.#mainState[1];
  #state = () => {
    const [getState] = this.#mainState;
    return getState() ?? this.#initialState;
  };

  #addUIState = () => {
    this.#setState(
      produce(draft => {
        if (!draft) draft = {} as Si;
        draft.uiThread = Object.entries({ ...this.#uiThread }).reduce(
          (acc, [key, value]) => {
            if (!acc) acc = {};
            acc[key as keyof S] = value?.[0];
            return acc;
          },
          {} as Si['uiThread'],
        );
      }),
    );
  };

  constructor(
    machine: M,
    uiThread?: S,
    private interpreterOptions?: InterpreterOptions<M>,
  ) {
    this.#machine = machine;

    if (uiThread) {
      this.#uiThread = Object.entries(uiThread).reduce((acc, [key]) => {
        acc[key as keyof S] = createSignal();
        return acc;
      }, {} as any);

      this.#addUIState();
    }

    this.#service = (interpret as any)(this.#machine, interpreterOptions);

    this.#initialState = {
      context: this.#service.context,
      status: 'idle',
      value: this.#service.initialValue,
      event: INIT_EVENT,
      uiThread: this.#uiThread,
    } as Si;

    this.subscribe(state => {
      this.#setState(
        produce(draft => {
          if (!draft) draft = {} as Si;
          draft = { ...draft, ...state };
        }),
      );
    });
  }

  start = () => {
    this.#service.start();
  };

  stop = () => {
    this.#service.stop();
  };

  get subscribe() {
    return this.#service.subscribe;
  }

  readonly #initialState: Si;

  state = <T = Si>(
    accessor: (state: Si) => T = defaultSelector,
    equals?: (prev: T, next: T) => boolean,
  ) => {
    return createMemo(() => accessor(this.#state()), {
      equals,
    });
  };

  watcher = <T>(accessor: (state: Si) => T) => {
    return (equals?: (prev: T, next: T) => boolean) => {
      return this.state(accessor, equals)();
    };
  };

  reducer = <T>(accessor: (state: Si) => T) => {
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

  get send() {
    return this.#service.send;
  }

  context = this.reducer(state => state.context);
  value = this.watcher(state => state.value);
  status = this.watcher(state => state.status);
  hasTags = (...tags: string[]) => {
    const currentTags = this.state(({ tags }) => tags)();
    if (!currentTags) return false;
    return tags.every(tag => currentTags.includes(tag));
  };

  __isUsedUi = this.state(
    state => !!state.uiThread && Object.keys(state.uiThread).length > 0,
  );

  dps = this.watcher(({ value }) =>
    decomposeSV(value).map(entry => entry.replaceAll('.', replacement)),
  );

  matches = (...values: string[]) => {
    const dps = this.dps();
    return values.every(value => dps.includes(value));
  };

  contains = (...values: string[]) => {
    const dps = this.dps();
    return values.some(value => dps.includes(value));
  };

  get addOptions() {
    return this.#service.addOptions;
  }

  addUIoptions = (option: ToSignals<S>) => {
    this.#uiThread = {
      ...this.#uiThread,
      ...option,
    };

    this.#addUIState();
  };

  provideOptions = (
    option: Parameters<InterpreterFrom<M>['addOptions']>[0],
    uiOption: ToSignals<S>,
  ) => {
    const instance = new Interpreter<M, S>(
      this.#machine,
      undefined,
      this.interpreterOptions,
    );
    instance.addOptions(option);
    instance.addUIoptions(uiOption);
    return instance;
  };
}
