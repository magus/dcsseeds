import { make_version_gate } from '../make_version_gate';

const version_gate = make_version_gate(['0.27.1', '0.28.0', '0.29.1']);

test('less than minor patched versions', () => {
  expect(version_gate('0.0.36')).toBe(true);
  expect(version_gate('0.26.9')).toBe(true);
  expect(version_gate('0.27.0')).toBe(true);

  expect(version_gate('0.29.0')).toBe(true);
});

test('equal to minor patched versions', () => {
  expect(version_gate('0.27.1')).toBe(false);
  expect(version_gate('0.28.0')).toBe(false);
  expect(version_gate('0.29.1')).toBe(false);
});

test('greater than minor patched versions', () => {
  expect(version_gate('0.27.2')).toBe(false);

  expect(version_gate('0.28.1')).toBe(false);

  expect(version_gate('0.29.2')).toBe(false);
  expect(version_gate('0.30.0')).toBe(false);
});

test('future versions', () => {
  expect(version_gate('0.30.2')).toBe(false);
  expect(version_gate('0.32.1')).toBe(false);
});
