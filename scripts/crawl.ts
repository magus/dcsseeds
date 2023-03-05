#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

const PROJ_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const RESET_VERSION = '0.29.0';

export function reset() {
  // prepare crawl git submodule by checking out specific version for parsing
  process.chdir(`${PROJ_ROOT}/crawl`);

  // checkout the specified version for parsing
  execSync(`git reset --hard`);
  execSync(`git checkout ${RESET_VERSION}`);
}

export function prepare(version: string) {
  // prepare crawl git submodule by checking out specific version for parsing
  process.chdir(`${PROJ_ROOT}/crawl`);

  // sync tags with origin (e.g. version tags like 0.27.0)
  // execSync('git fetch origin');

  // checkout the specified version for parsing
  execSync(`git reset --hard`);
  execSync(`git checkout ${version}`);

  // run tasks to prepare files for processing (e.g. remove development items tagged with TAG_MAJOR_VERSION)
  // see crawl/.github/workflows/ci.yml
  process.chdir(`${PROJ_ROOT}/crawl/crawl-ref/source`);
  execSync('util/tag-major-upgrade -t 35');
  if (fs.existsSync('util/tag-35-upgrade.py')) {
    execSync('util/tag-35-upgrade.py', { stdio: 'pipe' });
  }

  // now we can generate `source/art-data.h`
  execSync('perl util/art-data.pl');

  // return to PROJ_ROOT
  process.chdir(PROJ_ROOT);
}
