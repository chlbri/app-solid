import {
  interpret as _interpret,
  getByKey,
  type AnyMachine,
  type ContextFrom,
  type EventsFrom,
  type InterpretArgs,
  type InterpreterFrom,
  type State,
} from '@bemedev/app-ts';

import { DEFAULT_DELIMITER as replacement } from '@bemedev/app-ts/lib/constants/index.js';
import { INIT_EVENT } from '@bemedev/app-ts/lib/events/index.js';
import {
  decomposeSV,
  replaceAll,
} from '@bemedev/app-ts/lib/utils/index.js';

import type { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';
import { createMemo, createRoot, from, type Accessor } from 'solid-js';
import { defaultSelector } from './default';

type InterpretService<M extends AnyMachine> = InterpreterFrom<M>;

function wrapService<M extends AnyMachine>(
  service: InterpretService<M>,
  machine: M,
): any {
  type Tc = ContextFrom<M>;
  type Ev = EventsFrom<M>;

  type StateM =
    State<Tc, Ev> extends infer P
      ? {
          [Key in keyof P]: P[Key];
        }
      : never;

  const initialState: StateM = {
    context: service.context,
    status: 'idle',
    value: service.initialValue,
    event: INIT_EVENT,
  };

  const _store = from(service);
  const store = () => _store() ?? initialState;

  const start = service.start;
  const stop = service.stop;
  const pause = service.pause;
  const resume = service.resume;

  type GetProps<T = any, S = ReturnType<typeof store>> = [
    accessor?: (state: S) => T,
    equals?: (prev: T, next: T) => boolean,
  ];

  const state = <T = StateM>(
    ...[accessor = defaultSelector, equals]: GetProps<T>
  ) => {
    const out = createRoot(() =>
      createMemo(() => accessor(store()), accessor(initialState), {
        equals,
      }),
    );

    return out;
  };

  const reducer = <T>(accessor: Required<GetProps<T>>[0]) => {
    const stateAccessor = accessor;

    const reduceS = <R = T>(
      ...[_accessor = defaultSelector, equals]: GetProps<R, T>
    ) =>
      state(_state => {
        const step1 = stateAccessor(_state);
        const step2 = _accessor(step1);
        return step2;
      }, equals);

    return reduceS;
  };

  const context = reducer(state => state.context);
  const send = service.send;
  const value = () => state(state => state.value)();

  const mapper = (entry: string) =>
    replaceAll({ entry, match: '.', replacement });

  const dps = () => decomposeSV(value()).map(mapper);
  const status = () => state(state => state.status)();
  const tags = () => state(state => state.tags)();

  type DecomposedContext = Decompose<
    Required<{ context: Tc }>,
    { object: 'both'; start: false }
  >;

  // type __Select = typeof service.select;

  // #region select
  type _Select = <
    D = StateM & DecomposedContext,
    K extends Extract<keyof D, string> = Extract<keyof D, string>,
    R = D[K],
  >(
    selector: K,
    equals?: (prev: NoInfer<R>, next: NoInfer<R>) => boolean,
  ) => Accessor<R>;

  const _select: _Select = (selector, equals) => {
    const initial = getByKey(initialState, selector);
    const out = createRoot(() =>
      createMemo(
        () => {
          const _state = store();
          const _out = getByKey(_state, selector);

          return _out;
        },
        initial,
        {
          equals,
        },
      ),
    );

    return out;
  };

  type Select = Tc extends types.Primitive ? undefined : _Select;

  const select: Select = (
    typeof service.context !== 'object' ? undefined : _select
  ) as any;
  // #endregion

  const matches = (...values: string[]) => {
    return () => {
      const out = values.every(value => dps().includes(value));

      return out;
    };
  };

  const contains = (...values: string[]) => {
    return () => {
      const out = values.every(value =>
        dps().every(dp => dp.includes(value)),
      );

      return out;
    };
  };

  const values = Object.keys(machine.flat);
  const subscribe = service.subscribe;
  const dispose = service[Symbol.asyncDispose];
  const addOptions = service.addOptions;

  const provideOptions = (
    option: Parameters<typeof service.addOptions>[0],
  ) => {
    const newService = service.provideOptions(option);
    // provideOptions returns a new Interpreter with the same type parameters
    // We wrap it with the same machine reference to maintain the reactive layer
    return wrapService(newService as InterpretService<M>, machine);
  };

  return {
    contains,
    context,
    dispose,
    dps,
    matches,
    pause,
    reducer,
    resume,
    select,
    send,
    start,
    state,
    status,
    stop,
    subscribe,
    tags,
    value,
    values,
    addOptions,
    provideOptions,
  } as const;
}

export const interpret = <const M extends AnyMachine>(
  ...[machine, config]: InterpretArgs<M>
) => {
  const service: InterpretService<M> = (_interpret as any)(
    machine,
    config,
  );
  return wrapService(service, machine);
};
