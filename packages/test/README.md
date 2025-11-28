# @bemedev/app-solid-test

<br/>

Test utilities for `@bemedev/app-solid` - Making interpreter testing simple
and type-safe.

<br/>

## Description

This package provides comprehensive testing utilities for
`@bemedev/app-solid` interpreters. It simplifies writing tests for state
machines by providing helpers for state assertions, time manipulation, and
reactive signal testing with Vitest.

<br/>

## Key Features

- 🧪 **Test Helpers**: Simplified API for testing interpreter state and
  behavior
- ⏱️ **Time Control**: Built-in fake timer utilities for testing activities
  and delays
- 🎯 **Type-Safe**: Full TypeScript support with type inference
- 📊 **State Assertions**: Easy testing of context, value, tags, and UI
  state
- 🔄 **Reactive Testing**: Test SolidJS signals and computed values

<br/>

## Installation

### npm

```bash
npm install -D @bemedev/app-solid-test @bemedev/app-solid vitest
```

### pnpm

```bash
pnpm install -D @bemedev/app-solid-test @bemedev/app-solid vitest
```

<br/>

## Usage

### Basic Test Setup

```typescript
import { createInterpreter } from '@bemedev/app-solid';
import { createTests } from '@bemedev/app-solid-test';
import { describe, it, vi } from 'vitest';

vi.useFakeTimers();

describe('My Machine Tests', () => {
  const interpreter = createInterpreter({
    machine: myMachine,
    options: {
      context: { count: 0 },
      pContext: {},
    },
  });

  const inter = createTests(vi, interpreter);

  it(...inter.start);
  it('should be in initial state', () => {
    const value = inter.testBy(({ value }) => value());
    expect(value()).toBe('idle');
  });
});
```

### Testing State Transitions

```typescript
const testValue = inter.testBy(({ value }) => value());

it(...inter.start);
it(...testValue('Initial state is idle', 'idle'));
it(...inter.send('NEXT'));
it(...testValue('State transitions to working', 'working'));
```

### Testing Context Changes

```typescript
const testCount = inter.testBy(({ context }) => context(s => s.count));

it(...testCount('Initial count is 0', 0));
it(...inter.send('INCREMENT'));
it(...testCount('Count incremented to 1', 1));
```

### Testing with Fake Timers

```typescript
const wait = inter.createFakeWaiter.withDefaultDelay(1000);

it(...inter.start);
it(...wait(1)); // Advance by 1000ms
it(...testCount('Count after 1s', 1));
it(...wait(5)); // Advance by 5000ms
it(...testCount('Count after 6s', 6));
```

### Testing Tags

```typescript
it(...inter.hasTags('loading', 'visible'));
it(...inter.matches('working', 'fetching'));
it(...inter.contains('working'));
```

### Testing UI Thread

```typescript
const testUI = inter.testBy(({ ui }) => ui(state => state?.username));

it(...testUI('Initial username', ''));
it(...inter.sendUI({ type: 'username', payload: 'john' }));
it(...testUI('Username updated', 'john'));
```

### Testing with provideOptions

```typescript
it(
  ...inter.provideOptions(({ assign }) => ({
    actions: {
      increment: assign(
        'context.count',
        ({ context }) => context.count + 2,
      ),
    },
  })),
);
```

<br/>

## API Reference

### `createTests(vi, interpreter)`

Creates a test wrapper around an interpreter instance.

**Parameters:**

- `vi`: Vitest utilities object
- `interpreter`: The interpreter instance to test

**Returns:** `InterpreterTest` instance with testing methods

### Test Methods

#### State Control

- `start` - Start the interpreter
- `stop` - Stop the interpreter
- `pause` - Pause the interpreter
- `resume` - Resume the interpreter
- `send(event)` - Send an event to the machine
- `sendUI(event)` - Send a UI thread event
- `dispose` - Dispose the interpreter

#### Assertions

- `testBy(fn)` - Create custom test assertions
- `hasTags(...tags)` - Assert machine has specific tags
- `matches(...values)` - Assert state matches exact values
- `contains(...values)` - Assert state contains values

#### Time Control

- `createFakeWaiter` - Create timer utilities
  - `withDefaultDelay(ms)` - Returns function to advance time by ms
  - `all(ms, times)` - Advance time by ms × times

#### Options

- `addOptions(option)` - Add runtime options
- `provideOptions(option)` - Override options

<br/>

## Licence

MIT

## Auteur

chlbri (bri_lvi@icloud.com)

[My github](https://github.com/chlbri?tab=repositories)
