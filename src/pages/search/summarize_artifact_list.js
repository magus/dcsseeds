export function summarize_artifact_list(args) {
  const seed_set_by_version = new Map();

  for (const version of args.version_list) {
    seed_set_by_version.set(version, new Set());
  }

  const artifact_count = args.artifact_list.map((result_list) => {
    const seed_version_set = new Set();

    for (const result of result_list) {
      if (result.branchName === 'Ziggurat') continue;

      seed_version_set.add(`${result.seed}-${result.version}`);

      if (!seed_set_by_version.has(result.version)) {
        seed_set_by_version.set(result.version, new Set());
      }

      seed_set_by_version.get(result.version).add(result.seed);
    }

    return seed_version_set.size;
  });

  const version_count = [];

  for (const [version, seed_set] of seed_set_by_version) {
    version_count.push([version, seed_set.size]);
  }

  return { artifact_count, version_count };
}
