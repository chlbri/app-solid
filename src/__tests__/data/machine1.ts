import { createMachine } from '@bemedev/app-ts';
import { typings } from '@bemedev/app-ts/lib/utils';
import { DELAY } from './constants';

// #region machine1
export const machine1 = createMachine(
  {
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
  {
    eventsMap: { NEXT: typings.object },
    // eventsMap: {
    //   NEXT: {},
    // },
    context: typings.context(
      typings.recordAll(typings.number(), 'iterator'),
    ),
    pContext: typings.object,
    promiseesMap: typings.object,
  },
  { '/': 'idle' },
);

machine1.addOptions(() => ({
  actions: {
    inc: (pContext, context) => {
      context.iterator++;
      return { context, pContext };
    },
  },
  delays: {
    DELAY,
  },
}));
// #endregion
