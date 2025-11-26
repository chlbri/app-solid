import { createFileRoute } from '@tanstack/solid-router'
import { onMount } from 'solid-js'
import { machine1 } from '../../../../src/__tests__/fixtures/machine1'
import { interpret } from '../../../../src/interpreter'

export const Route = createFileRoute('/interpreter')({
  component: RouteComponent,
})

const service = interpret({
  machine: machine1,
  uiThread: {
    counter: 0 as number,
  },
})

function RouteComponent() {
  service.start()
  const context = service.context(
    (c) => c.iterator,
    (prev) => !!prev && prev >= 100,
  )
  const counter = service.ui((c) => c?.counter)
  const value = service.value()

  onMount(() => {
    service.send('INIT')

    setTimeout(() => {
      service.stop()
    }, 10_000)
  })
  return (
    <div class="flex flex-1 items-center justify-center flex-col gap-4 p-4">
      <div>CONTEXT</div>
      <div>{context()}</div>
      <div>{JSON.stringify(value())}</div>
      <button
        class="bg-red-500 text-white px-3 py-2 rounded-lg"
        onClick={() => service.send('NEXT')}
      >
        NEXT
      </button>
      <div class="mt-4 flex flex-col items-center gap-2">
        <h2>COUNTER</h2>
        <div>{counter()}</div>
        <div class="flex gap-5">
          <button
            class="bg-orange-500 text-white px-3 py-2 rounded-lg"
            onClick={() =>
              service.sendUI({
                type: 'counter',
                payload: (prev = 0) => prev + 1,
              })
            }
          >
            INC
          </button>
          <button
            class="bg-black text-white px-3 py-2 rounded-lg"
            onClick={() =>
              service.sendUI({
                type: 'counter',
                payload: (prev = 0) => prev - 1,
              })
            }
          >
            DEC
          </button>
        </div>
      </div>
    </div>
  )
}
