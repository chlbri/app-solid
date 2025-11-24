# SolidJS Documentation

## createSignal

Signals are the most basic reactive primitive. They track a single value
(which can be a value of any type) that changes over time.

### Type Signature

```typescript
import { createSignal } from 'solid-js';

function createSignal<T>(
  initialValue: T,
  options?: {
    equals?: false | ((prev: T, next: T) => boolean);
    name?: string;
    internal?: boolean;
  },
): [get: () => T, set: (v: T) => T];
```

### Usage

The `createSignal` function returns a pair of functions as a two-element
array: a getter (or accessor) and a setter.

```typescript
const [count, setCount] = createSignal(0);
const [ready, setReady] = createSignal(false);

// Read signal's current value
const currentCount = count();

// Write signal by providing a value
setReady(true);

// Write signal by providing a function setter
setCount(prev => prev + 1);
```

### Options

- **equals**: `false | ((prev: T, next: T) => boolean)` - Customizes the
  equality check. Default is `===`. If returns `true`, the signal is not
  updated.
- **name**: `string` - A name for the signal, useful for debugging.
- **internal**: `boolean` - If `true`, hides the signal from devtools.

## createEffect

The `createEffect` primitive creates a reactive computation. It
automatically tracks reactive values, such as signals, accessed within the
provided function. This function will re-run whenever any of its
dependencies change.

### Type Signature

```typescript
function createEffect<Next>(
  fn: (v: Next) => Next,
  value?: Next,
  options?: { name?: string },
): void;
```

### Execution Timing

- **Initial Run**: Scheduled to occur after the current rendering phase
  completes.
- **Subsequent Runs**: Re-runs whenever any tracked dependency changes.
- **Server-Side Rendering**: Effects never run during SSR.

### Usage

```typescript
import { createSignal, createEffect } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);

  // Every time count changes, this effect re-runs.
  createEffect(() => {
    console.log("Count incremented! New value: ", count());
  });

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
    </div>
  );
}
```

## createContext

Context provides a form of dependency injection in Solid. It is used to
save from needing to pass data as props through intermediate components
(aka prop drilling).

### Type Signature

```typescript
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}

function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

### Usage

To avoid reinstantiating a new context when Hot-Module Replacement (HMR)
occurs, it is recommended to use `createContext` in its own module (file).

```typescript
import { createContext } from "solid-js";

export const CounterContext = createContext([{ count: 0 }, {}]);

// In a component
<CounterContext.Provider value={counter}>
  {props.children}
</CounterContext.Provider>
```

### Default Values

`createContext()` takes an optional "default value" as an argument. If
`useContext` is called and there is no corresponding context provider above
it, the `defaultValue` is returned.

## createStore

Stores were intentionally designed to manage data structures like objects
and arrays but are capable of handling other data types.

### Type Signature

```typescript
import { createStore } from 'solid-js/store';
import type { StoreNode, Store, SetStoreFunction } from 'solid-js/store';

function createStore<T extends StoreNode>(
  state: T | Store<T>,
): [get: Store<T>, set: SetStoreFunction<T>];
```

### Usage

```typescript
import { createStore } from 'solid-js/store';

const [state, setState] = createStore({
  firstName: 'John',
  lastName: 'Miller',
});

// Update
setState({ firstName: 'Johnny', middleName: 'Lee' });

// Update with function
setState(state => ({
  preferredName: state.firstName,
  lastName: 'Milner',
}));
```

### Getter & Setter

- **Getter**: Store objects support the use of getters to store derived
  values.
- **Setter**: Changes can take the form of a function that passes previous
  state and returns new state or a value. Objects are always shallowly
  merged.

## from

A helper to make it easier to interop with external producers like RxJS
observables or with Svelte Stores. This basically turns any subscribable
(object with a subscribe method) into a Signal and manages subscription and
disposal.

### Type Signature

```typescript
import { from } from 'solid-js';

function from<T>(
  producer:
    | ((setter: (v: T) => T) => () => void)
    | {
        subscribe: (
          fn: (v: T) => void,
        ) => (() => void) | { unsubscribe: () => void };
      },
): () => T | undefined;
```

### Usage

```typescript
import { from } from 'solid-js';

// From an observable
const signal = from(obsv$);

// Custom producer
const clock = from(set => {
  const interval = setInterval(() => {
    set(v => v + 1);
  }, 1000);

  return () => clearInterval(interval);
});
```
