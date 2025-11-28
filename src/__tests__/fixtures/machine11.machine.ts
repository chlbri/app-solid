import { createMachine, typings } from '@bemedev/app-ts';
import { DELAY } from './constants';

// #region machine1
export const machine11 = createMachine(
  {
    initial: 'idle',
    entry: 'init',
    states: {
      idle: {
        activities: {
          DELAY: 'inc',
        },
        on: {
          NEXT: { target: '/final', description: 'Next' },
          INIT: { actions: ['init'] },
        },
      },
      final: {
        on: {
          NEXT: { target: '/idle', description: 'Restart' },
        },
      },
    },
  },
  typings({
    eventsMap: {
      NEXT: 'primitive',
      INIT: 'primitive',
    },
    promiseesMap: {},
    pContext: 'primitive',
    context: typings.partial({
      iterator: 'number',
    }),
  }),
).provideOptions(({ assign }) => ({
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

export type Machine11 = typeof machine11;
// #endregion
