import { parts } from './parts';

export function compare(semver_string_a, semver_string_b) {
  const semver_a = parts(semver_string_a);
  const semver_b = parts(semver_string_b);

  const min_checks = Math.max(semver_a.length, semver_b.length);

  for (let i = 0; i < min_checks; i++) {
    const part_a = semver_a[i];
    const part_b = semver_b[i];

    if (part_a > part_b) {
      return +1;
    } else if (part_a < part_b) {
      return -1;
    }
  }

  return 0;
}
