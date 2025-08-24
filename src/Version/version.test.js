import { expect, test } from 'bun:test';

const Version = require('src/Version');

test('exists', () => {
  expect(Version).toBeDefined();
});
