import type {
  AnyMachine,
  ContextFrom,
  EventsFrom,
  InterpreterFrom,
  MachineOptionsFrom,
  State,
} from '@bemedev/app-ts';
import type { Ru } from '@bemedev/app-ts/lib/libs/bemedev/globals/types.js';
import type { Setter, Signal } from 'solid-js';

export type ToSignals<T extends Ru> = {
  [K in keyof T]?: Signal<T[K] | undefined>;
};

export type ToSetters<T extends Ru> = {
  type: keyof T & string;
  payload: Parameters<Setter<T[keyof T]>>[0];
};

export type Options<
  M extends AnyMachine,
  S extends Ru,
> = MachineOptionsFrom<M> & {
  uiThread?: ToSignals<S>;
};

export type StateSignal<M extends AnyMachine, S extends Ru> = State<
  ContextFrom<M>,
  EventsFrom<M>
> & {
  uiThread?: {
    [K in keyof S]?: S[K];
  };
};

export type AddOptions_F<M extends AnyMachine, S extends Ru> = (
  option: Parameters<InterpreterFrom<M>['addOptions']>[0],
) => Options<M, S> | undefined;

export type SendUI_F<S extends Ru> = <T extends ToSetters<S>>(
  event: T,
) => ReturnType<Setter<S[T['type']]>>;
