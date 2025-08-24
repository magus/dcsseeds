import { expect, test } from 'bun:test';

const Version = require('src/Version');

test('exists', () => {
  expect(Version).toBeDefined();
});

test('compare', () => {
  expect(Version.compare('0.33.1', '0.29.1')).toBe(1);
  expect(Version.compare('0.29.1', '0.33.1')).toBe(-1);
  expect(Version.compare('0.33.1', '0.33.1')).toBe(0);
});
