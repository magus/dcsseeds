# public/crawl

Contain the version folders with pre-build `crawl` binary along with runtime requirements: `seed-explorer.lua` and `dat/` folder.

Used by `src/pages/api/seed/[version]/[seed]/index.page.ts`


# TODO

## using crawl to generate full item list

- it would be nice if we could find a way to log spells inside spellbooks (similar to stash)
- can we ship this and run it remotely in vercel? (see bundling below)
- if above doesn't work then maybe we can create a docker image and run on digital ocean...
> https://123.456.789.1/crawl/seed/11144789937400634826

## usage ideas

- iterate or explore random seeds and log all items into database
- build full item list even if early death in seed (spoiler-ish)


## Building `crawl` binary for new version

```sh
cd crawl-dir/0.28.0/crawl-ref/source
make -j4 profile
make util/fake_pty
time util/fake_pty ./crawl -script seed_explorer.lua -depth all -seed 11144789937400634826 > seed-11144789937400634826.txt 2>&1
```

Bundle `crawl` and dependencies into `.zip` or `.tar.gz` file

- `dat/`
- `scripts/seed_explorer.lua`
- `util/fake_pty`
