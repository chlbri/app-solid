import { createMachine } from '@bemedev/app-ts';
import { config2, machine2 } from './machine2';

// #region machine2
export const machine22 = createMachine(
  {
    machines: { name: 'machine1', description: 'A beautiful machine' },
    ...config2,
  },
  {
    eventsMap: machine2.eventsMap,
    context: machine2.context,
    pContext: machine2.pContext,
    promiseesMap: machine2.promiseesMap,
  },
  machine2.initials,
);

machine22.addOptions(() => machine2.options as any);
// #endregion
