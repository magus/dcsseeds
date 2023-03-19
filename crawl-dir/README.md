# crawl-dir

Originally we kept one git submodule for the [crawl github repo](https://github.com/crawl/crawl).
This required cloning and fetching all tags in order to switch to specific versions via `git checkout $version`.
In order to improve performance, we create submodules that clone specific tags with a commit depth of 1.
Ultimately fetching all tags takes about **1 min 30 sec** so if we ever have a lot of versions
we could explore going back to a single submodule and using `git checkout $version` again.

## Setting up a new version

```sh
git clone -b 0.27.1 --depth 1 git@github.com:crawl/crawl.git 0.27.1
git reset 0.27.1
git submodule add -f git@github.com:crawl/crawl.git 0.27.1
```

## Legacy Github Actions

```yml
  - name: Sync crawl submodule
    run: |
      cd crawl
      ls -lsah
      git fetch --tags
      git log --since="2021-08-01" --tags --decorate --simplify-by-decoration --oneline
      cd ..
```
