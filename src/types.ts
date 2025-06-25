import type {
  AnyMachine,
  ContextFrom,
  InterpreterFrom,
  Mode,
  PrivateContextFrom,
} from '@bemedev/app-ts';

export type Interpreter_F = <M extends AnyMachine>(
  machine: M,
  config: {
    pContext: PrivateContextFrom<M>;
    context: ContextFrom<M>;
    mode?: Mode;
    exact?: boolean;
  },
) => InterpreterFrom<M>;
