#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJ_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();

export function reset() {
  execSync(`git submodule update --force`);
}

export function root() {
  return path.join(PROJ_ROOT, 'crawl-dir');
}

export function dir(version: string, ...path_parts: Array<string>) {
  const crawl_dir = path.join(root(), version, ...path_parts);
  return crawl_dir;
}

export function github(filepath: string) {
  const relative_path = path.relative(root(), filepath);
  return `https://raw.githubusercontent.com/crawl/crawl/${relative_path}`;
}

export function prepare(version: string) {
  reset();

  // move to crawl-dir at version
  process.chdir(dir(version));

  // forcefully reset crawl submodule back to init state
  execSync(`git reset --hard`);
  execSync(`git clean -df`);

  // run tasks to prepare files for processing (e.g. remove development items tagged with TAG_MAJOR_VERSION)
  // see crawl/.github/workflows/ci.yml
  process.chdir(`crawl-ref/source`);
  execSync('util/tag-major-upgrade -t 35');
  if (fs.existsSync('util/tag-35-upgrade.py')) {
    execSync('util/tag-35-upgrade.py', { stdio: 'pipe' });
  }

  // now we can generate `source/art-data.h`
  execSync('perl util/art-data.pl');

  // return to PROJ_ROOT
  process.chdir(PROJ_ROOT);
}
