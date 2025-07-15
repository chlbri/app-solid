import {
  interpret as _interpret,
  getByKey,
  type AnyMachine,
  type ContextFrom,
  type Decompose3,
  type EventsFrom,
  type InterpretArgs,
  type InterpreterFrom,
  type State,
} from '@bemedev/app-ts';

import { DEFAULT_DELIMITER as replacement } from '@bemedev/app-ts/lib/constants';
import { INIT_EVENT } from '@bemedev/app-ts/lib/events';
import { decomposeSV, replaceAll } from '@bemedev/app-ts/lib/utils';

import { createMemo, from, type Accessor } from 'solid-js';
import { defaultSelector } from './default';

type Primitive = string | number | boolean | null | undefined;

export const interpret = <const M extends AnyMachine>(
  ...[machine, config]: InterpretArgs<M>
) => {
  const service: InterpreterFrom<M> = (_interpret as any)(machine, config);

  type Tc = ContextFrom<M>;
  type Ev = EventsFrom<M>;

  type StateM = State<Tc, Ev>;

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
    const out = createMemo(
      () => accessor(store()),
      accessor(initialState),
      {
        equals,
      },
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

  // #region select
  type _Select = <
    T = StateM,
    D = Decompose3<T, { parent: true; sep: '.' }>,
    K extends Extract<keyof D, string> = Extract<keyof D, string>,
    R = D[K],
  >(
    selector: K,
    equals?: (prev: R, next: R) => boolean,
  ) => Accessor<R>;

  const _select: _Select = (selector, equals) => {
    const initial = getByKey(initialState, selector);
    const out = createMemo(
      () => {
        const _state = store();
        const _out = getByKey(_state, selector);

        return _out;
      },
      initial,
      {
        equals,
      },
    );

    return out;
  };

  type Select = Tc extends Primitive ? undefined : _Select;

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

  const values = Object.keys(machine.preflat);
  const subscribe = service.subscribe;
  const dispose = service[Symbol.asyncDispose];
  const addOptions = service.addOptions;

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
  } as const;
};
