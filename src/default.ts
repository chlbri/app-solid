export function defaultSelector<Input, Output>(value: Input) {
  return value as unknown as Output;
}
