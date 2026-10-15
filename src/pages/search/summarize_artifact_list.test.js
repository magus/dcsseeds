import { expect, test } from 'bun:test';

import { summarize_artifact_list } from './summarize_artifact_list';

test('counts distinct seeds, excludes Ziggurat, and retains empty artifacts and versions', () => {
  const item = { seed: '123', version: '0.34.1', branchName: 'D', level: 1 };
  const summary = summarize_artifact_list({
    artifact_list: [
      [item, item, { ...item, level: 2 }, { ...item, branchName: 'Ziggurat', seed: '456' }],
      [item, { ...item, version: '0.33.1' }],
      [],
    ],
    version_list: ['0.34.1', '0.33.1', '0.32.1'],
  });

  expect(summary).toEqual({
    artifact_count: [1, 2, 0],
    version_count: [
      ['0.34.1', 1],
      ['0.33.1', 1],
      ['0.32.1', 0],
    ],
  });

  expect(JSON.parse(JSON.stringify(summary))).toEqual(summary);
});

test('includes a version added to the cache after the version query ran', () => {
  const summary = summarize_artifact_list({
    artifact_list: [[{ seed: '123', version: '0.35.0', branchName: 'D' }]],
    version_list: ['0.34.1'],
  });

  expect(summary.version_count).toEqual([
    ['0.34.1', 0],
    ['0.35.0', 1],
  ]);
});
