import type {
  AnyMachine,
  InterpreterFrom,
  MachineOptionsFrom,
  WorkingStatus,
} from '@bemedev/app-ts';
import type {
  Ru,
  SoA,
} from '@bemedev/app-ts/lib/libs/bemedev/globals/types.js';
import type { StateValue } from '@bemedev/app-ts/lib/states';
import type { Accessor, Setter, Signal } from 'solid-js';

export type ToSignals<T extends Ru> = {
  [K in keyof T]?: Signal<T[K] | undefined>;
};

export type ToSetters<T extends Ru> = {
  type: keyof T & string;
  payload: Parameters<Setter<T[keyof T]>>[0];
};

export type Options<M extends AnyMachine, S extends Ru> =
  MachineOptionsFrom<M> extends never
    ? {
        uiThread?: ToSignals<S>;
      }
    : MachineOptionsFrom<M> & {
        uiThread?: ToSignals<S>;
      };

export type _StateSignal = {
  uiThread: any;
  context: any;
  value: StateValue;
  tags?: any;
  status: WorkingStatus;
  event: any;
};

export type StateSignal<M extends AnyMachine, S extends Ru> = {
  context: M['context'];
  value: StateValue;
  tags?: SoA<string>;
  event: M['__events'];
  status: WorkingStatus;
  uiThread?: Partial<S>;
};

export type AddOptions_F<M extends AnyMachine, S extends Ru> = (
  option: Parameters<InterpreterFrom<M>['addOptions']>[0],
) => Options<M, S> | undefined;

export type SendUI_F<S extends Ru> = <T extends ToSetters<S>>(
  event: T,
) => ReturnType<Setter<S[T['type']]>>;

export type State_F<T> = <const U = T>(
  accessor?: (state: T) => U,
  equals?: false | ((prev: U, next: U) => boolean),
) => Accessor<U>;
