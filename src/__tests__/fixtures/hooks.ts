import type { AnyMachine } from '@bemedev/app-ts';
import type { Ru } from '@bemedev/app-ts/lib/libs/bemedev/globals/types';
import type { Interpreter } from '../../interpreter';
import { tuple } from '../interpret.fixtures';

export const createTests = <
  const M extends AnyMachine,
  const S extends Ru,
>(
  service: Interpreter<M, S>,
) => {
  const useStart = ['Start the machine', service.start] as const;

  type SE = Parameters<(typeof service)['send']>[0];
  const useSend = (event: SE, index: number) => {
    const invite = `#${index < 10 ? '0' + index : index} => Send a "${(event as any).type ?? event}" event`;
    return tuple(invite, () => service.send(event));
  };

  return {
    useStart,
    useSend,
  };
};
