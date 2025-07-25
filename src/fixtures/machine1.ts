import { createMachine, typings } from '@bemedev/app-ts';
import { DELAY } from './constants';

// #region machine1
export const machine1 = createMachine(
  {
    entry: 'init',
    states: {
      idle: {
        activities: {
          DELAY: 'inc',
        },
        on: {
          NEXT: { target: '/final', description: 'Next' },
        },
      },
      final: {},
    },
  },
  typings({
    eventsMap: { NEXT: 'primitive' },
    promiseesMap: {},
    pContext: 'primitive',
    context: typings.partial({
      iterator: 'number',
    }),
  }),
  { '/': 'idle' },
);

machine1.addOptions(({ assign }) => ({
  actions: {
    init: assign('context.iterator', () => 0),
    inc: assign(
      'context.iterator',
      ({ context }) => context.iterator! + 1,
    ),
  },
  delays: {
    DELAY,
  },
}));

export type Machine1 = typeof machine1;
// #endregion
