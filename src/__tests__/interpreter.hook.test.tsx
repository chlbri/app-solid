import { renderHook } from '@solidjs/testing-library';
import { createInterpreter } from '../interpreter';
import { DELAY, machine2 } from './fixtures';

vi.useFakeTimers();

describe('TESTS', () => {
  test('#01 =>', async () => {
    const inter = createInterpreter({
      machine: machine2,
      options: {
        pContext: { iterator: 0 },
        context: { iterator: 0, input: '', data: [] },
        exact: true,
      },
    });

    const { result: iterator } = renderHook(() =>
      inter.context(c => c.iterator),
    );

    const { result: value } = renderHook(() => inter.value());

    inter.start();
    console.log('Initial status (direct):', value());
    console.log('Initial iterator (direct):', iterator());
    await vi.advanceTimersByTimeAsync(DELAY * 10);
    console.log('Status after delays (direct):', value());
    console.log('Iterator after delays (direct):', iterator());
    inter.send('NEXT');
    console.log('Status after NEXT (direct):', value());
    console.log('Iterator after NEXT (direct):', iterator());
  });
});
