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
import {
  createMemo,
  createRoot,
  createSignal,
  from,
  type Accessor,
  type Setter,
} from 'solid-js';
import { defaultSelector } from './default';

/**
 * Type for UI Thread signal record.
 * Contains SolidJS signal accessors and setters.
 */
type UiThreadSignals = Record<
  string,
  [Accessor<unknown>, Setter<unknown>]
>;

/**
 * Type helper for UI thread decomposition in select.
 * Allows accessing UI thread signals via 'uiThread.' prefix.
 */
type UiThreadDecomposed<T extends UiThreadSignals> = {
  [K in keyof T as `uiThread.${K & string}`]: T[K] extends [
    Accessor<infer V>,
    Setter<unknown>,
  ]
    ? V
    : unknown;
};

/**
 * Interpreter class that wraps the state machine interpreter with SolidJS reactivity.
 *
 * This class provides:
 * - Reactive state management via SolidJS signals
 * - UI Thread signals for fast UI updates (accessible via 'uiThread.' prefix)
 * - sendUI function for updating UI thread signals
 *
 * @template M - The machine type extending AnyMachine
 *
 * @remarks
 * The class is only exported as a type. Use the `interpret` function to create instances.
 */
class Interpreter<const M extends AnyMachine> {
  /**
   * Internal UI thread signals storage.
   * Contains SolidJS signals for fast UI updates.
   */
  readonly _uiThread: UiThreadSignals;

  constructor(
    public readonly service: InterpreterFrom<M>,
    public readonly machine: M,
    public readonly config: InterpretArgs<M>[1],
  ) {
    this._uiThread = {};
  }
}

// Export type only - instances can only be created via interpret function
export type { Interpreter };

export const interpret = <const M extends AnyMachine>(
  ...[machine, config]: InterpretArgs<M>
) => {
  type InterpretService<M extends AnyMachine> = InterpreterFrom<M>;

  const service: InterpretService<M> = (_interpret as any)(
    machine,
    config,
  );

  // Create the Interpreter instance for holding uiThread signals
  const interpreter = new Interpreter(service, machine, config);

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
    ...[
      accessor = defaultSelector as (state: StateM) => T,
      equals,
    ]: GetProps<T>
  ): Accessor<T> => {
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
      ...[
        _accessor = defaultSelector as (state: T) => R,
        equals,
      ]: GetProps<R, T>
    ): Accessor<R> =>
      state((_state: StateM) => {
        const step1 = stateAccessor(_state);
        const step2 = _accessor(step1);
        return step2;
      }, equals);

    return reduceS;
  };

  const context = reducer((state: StateM) => state.context);
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

  // #region select with uiThread support
  type _Select = <
    D = StateM &
      DecomposedContext &
      UiThreadDecomposed<typeof interpreter._uiThread>,
    K extends Extract<keyof D, string> = Extract<keyof D, string>,
    R = D[K],
  >(
    selector: K,
    equals?: (prev: NoInfer<R>, next: NoInfer<R>) => boolean,
  ) => Accessor<R>;

  const _select: _Select = (selector, equals) => {
    // Handle uiThread signal selection
    // Type assertions are required because uiThread signals are stored generically
    if (selector.startsWith('uiThread.')) {
      const uiKey = selector.slice('uiThread.'.length);
      const signal = interpreter._uiThread[uiKey];
      if (signal) {
        // Type assertion: signal accessor matches the expected return type
        return signal[0] as Accessor<any>;
      }
      // Type assertion: undefined accessor for non-existent signals
      return (() => undefined) as Accessor<any>;
    }

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

  const provideOptions = (...[option]: Parameters<typeof addOptions>) => {
    return interpret(
      (machine as any).provideOptions(option),
      config as any,
    ) as unknown as typeof out;
  };

  // #region UI Thread functionality
  /**
   * Registers a new UI thread signal.
   * Signals are accessible via select with 'uiThread.' prefix.
   *
   * @param key - The key name for the signal
   * @param initialValue - The initial value for the signal
   * @returns The accessor for the created signal
   *
   * @remarks
   * Type assertion is used because signals are stored in a generic Record
   * to allow different value types per key.
   */
  const registerUiSignal = <T>(
    key: string,
    initialValue: T,
  ): Accessor<T> => {
    if (interpreter._uiThread[key]) {
      // Return existing signal - type assertion needed due to generic storage
      return interpreter._uiThread[key][0] as Accessor<T>;
    }
    const signal = createSignal<T>(initialValue);
    // Store signal with generic type for flexible multi-type storage
    interpreter._uiThread[key] = signal as [
      Accessor<unknown>,
      Setter<unknown>,
    ];
    return signal[0];
  };

  /**
   * Send an event to update UI thread signals.
   * Has the same signature as the regular send method from service.
   *
   * The event parameter is intentionally unused in the base implementation.
   * This function triggers reactive updates on all UI thread signals,
   * allowing SolidJS to re-evaluate any dependent computations.
   *
   * @param _event - The event to process (same type as regular send method)
   *
   * @remarks
   * The event parameter maintains API consistency with the regular send method.
   * Custom event-based updates can be implemented by accessing uiThread directly
   * and calling the signal setters with event-specific logic.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendUI = (_event: Parameters<typeof send>[0]): void => {
    // Trigger reactive updates on all UI thread signals
    // This allows dependent computations to re-evaluate
    for (const [, setter] of Object.values(interpreter._uiThread)) {
      setter((prev: unknown) => prev);
    }
  };

  /**
   * Get the UI thread signals record.
   * Readonly access to registered signals.
   */
  const uiThread: Readonly<UiThreadSignals> = interpreter._uiThread;
  // #endregion

  const out = {
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
    sendUI,
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
    service,
    registerUiSignal,
    uiThread,
  } as const;

  return out;
};
