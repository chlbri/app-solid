import { createTests } from '@bemedev/vitest-extended';
import { defaultSelector } from '../default';

describe('#01 => default', () => {
  const { acceptation, success } = createTests(defaultSelector);

  describe('#00 => Acceptaion', acceptation);

  describe(
    '#01 => Success',
    success(
      { invite: 'string', parameters: 'str1', expected: 'str1' },
      { invite: 'number', parameters: 4, expected: 4 },
      { invite: 'boolean', parameters: true, expected: true },
    ),
  );
});
