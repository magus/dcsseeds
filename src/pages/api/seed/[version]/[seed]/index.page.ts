import type { NextApiRequest, NextApiResponse } from 'next';
import send from 'src/server/zeitSend';
import path from 'path';
import fs from 'fs';
import { execSync, spawnSync } from 'child_process';

// ./crawl -script seed_explorer.lua -depth all -seed 11144789937400634826 > seed-11144789937400634826.txt 2>&1

export default async function seed_explorer(req: NextApiRequest, res: NextApiResponse) {
  const debug: any = {};

  // force folder included with endpoint
  debug.crawl_public_dir = path.resolve('public', 'crawl');
  debug.filenames = fs.readdirSync(debug.crawl_public_dir);

  try {
    const { seed, version } = req.query;

    if (typeof version !== 'string') {
      throw new Error('version required, e.g. /api/seed/0.28.0/11144789937400634826');
    }

    if (typeof seed !== 'string') {
      throw new Error('seed required, e.g. /api/seed/0.28.0/11144789937400634826');
    }

    const cwd = path.join(debug.crawl_public_dir, version);
    const spawn_options = { cwd, stdio: 'pipe' } as const;

    debug.pwd = String(execSync(`pwd`, spawn_options));
    debug.ls = String(execSync(`ls`, spawn_options));

    debug.cmd = path.join(cwd, 'util', 'fake_pty');
    debug.args = [path.join(cwd, 'crawl'), `-script`, `seed_explorer.lua`, `-depth`, `all`, `-seed`, `${seed}`, `2>&1`];

    const crawl = spawnSync(debug.cmd, debug.args, spawn_options);

    // cleanup `default.profraw` c++ code coverage file from running `crawl` binary
    spawnSync('rm', ['default.profraw'], spawn_options);

    const stdout = String(crawl.stdout);
    const stderr = String(crawl.stderr);

    const json = { seed, stdout, stderr, debug };
    return send(res, 200, json, { prettyPrint: true });
  } catch (err) {
    const json = { debug, err };
    return send(res, 500, json, { prettyPrint: true });
  }
}
