import type { AnyMachine } from '@bemedev/app-ts';
import type {
  Ru,
  SoA,
} from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import type { StateValue } from '@bemedev/decompose';
import type { Accessor } from 'solid-js';
import { type StateSignal } from './../../interpreter.types';

export type TestBy_F<M extends AnyMachine, S extends Ru> = <
  T = StateSignal<M, S>,
>(
  option: (args: {
    state: <T = StateSignal<M, S>>(
      accessor: (state: StateSignal<M, S>) => T,
      equals?: false | ((prev: T, next: T) => boolean) | undefined,
    ) => Accessor<T>;

    context: <T = StateSignal<M, S>['context']>(
      accessor: (ctx: M['context']) => T,
      equals?: false | ((prev: T, next: T) => boolean) | undefined,
    ) => Accessor<T>;

    ui: <T = S>(
      accessor: (ui: Partial<S> | undefined) => T,
      equals?: false | ((prev: T, next: T) => boolean) | undefined,
    ) => Accessor<T>;

    value: (
      equals?: false | ((prev: StateValue, next: StateValue) => boolean),
    ) => Accessor<StateValue>;

    status: (
      equals?: false | ((prev: string, next: string) => boolean),
    ) => Accessor<string>;

    tags: (
      equals?: false | ((prev: SoA<string>, next: SoA<string>) => boolean),
    ) => Accessor<SoA<string>>;

    dps: (
      equals?: false | ((prev: SoA<string>, next: SoA<string>) => boolean),
    ) => Accessor<SoA<string>>;

    matches: (...values: string[]) => Accessor<boolean>;
    contains: (...values: string[]) => Accessor<boolean>;
  }) => Accessor<T>,
) => (invite: string, expected: T) => [string, () => void];
