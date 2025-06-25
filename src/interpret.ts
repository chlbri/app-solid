import {
  interpret as _interpret,
  getByKey,
  type AnyMachine,
  type ContextFrom,
  type Decompose2,
  type Mode,
  type PrivateContextFrom,
  type State,
} from '@bemedev/app-ts';
import { DEFAULT_DELIMITER } from '@bemedev/app-ts/lib/constants';
import { decomposeSV, replaceAll } from '@bemedev/app-ts/lib/utils';
import { createMemo, createRoot, from, type Accessor } from 'solid-js';
import { defaultSelector } from './default';

export const interpret = <M extends AnyMachine>(
  machine: M,
  config: {
    pContext: PrivateContextFrom<M>;
    context: ContextFrom<M>;
    mode?: Mode;
    exact?: boolean;
  },
) => {
  const service = _interpret(machine, config as any);

  type Tc = (typeof config)['context'];

  const initialState: State<Tc> = {
    context: service.context,
    mode: service.mode,
    status: 'idle',
    value: service.initialValue,
    event: 'machine$$init',
  };

  const _store = createRoot(() => from(service));
  const store = () => _store() ?? initialState;

  const start = service.start;
  const stop = service.stop;

  type GetProps<T = any, S = ReturnType<typeof store>> = [
    accessor?: (state: S) => T,
    equals?: (prev: T, next: T) => boolean,
  ];

  const state = <T>(
    ...[accessor = defaultSelector, equals]: GetProps<T>
  ) =>
    createRoot(() =>
      createMemo(() => accessor(store()), accessor(initialState), {
        equals,
      }),
    );

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

  // service.send

  const context = reducer(state => state.context);
  const send = service.send;
  const mode = state(state => state.mode);
  const value = state(state => state.value);
  const status = state(state => state.status);
  const tags = state(state => state.tags);

  type Select = <
    D extends Decompose2<Tc>,
    K extends Extract<keyof D, string>,
    R = D[K],
  >(
    selector: K,
    equals?: (prev: R, next: R) => boolean,
  ) => Accessor<R>;

  const select: Select = (selector, equals) => {
    const _context = state(state => state.context);

    return createMemo(
      () => getByKey(_context(), selector),
      getByKey(initialState, selector),
      { equals },
    );
  };

  const mapper = (entry: string): string => {
    return replaceAll({
      entry,
      match: '.',
      replacement: DEFAULT_DELIMITER,
    });
  };

  const matches = (...values: string[]) => {
    return () => {
      const dps = decomposeSV(value()).map(mapper);
      const out = values.every(value => dps.includes(value));

      return out;
    };
  };

  const contains = (...values: string[]) => {
    return () => {
      const dps = decomposeSV(value()).map(mapper);
      const out = values.every(value =>
        dps.every(dp => dp.includes(value)),
      );

      return out;
    };
  };

  const allValues = Object.keys(machine.preflat);

  return {
    state,
    reducer,
    context,
    status,
    send,
    mode,
    value,
    tags,
    start,
    stop,
    select,
    matches,
    contains,
    allValues,
  };
};
