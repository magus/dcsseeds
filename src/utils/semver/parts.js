import { toNumber } from 'src/utils/toNumber';
import runRegex from 'src/utils/runRegex';

export function parts(semver_string) {
  const [, ...semver_string_parts] = runRegex('parse-semver', semver_string, RE.semver);

  const semver_parts = [];

  for (const string_part of semver_string_parts) {
    let part = toNumber(string_part);

    if (isNaN(part)) {
      part = 0;
    }

    semver_parts.push(part);
  }

  return semver_parts;
}

const RE = {
  // https://regexr.com/6ebro
  semver: /(\d+)\.(\d+)(?:\.(\d+))?/,
};
