# scripts

## bulid_unrand_list

Get unique set of unrands across list of versions from `src/Version` (see `get_unrands` below)

```sh
yarn tsx ./scripts/build_unrand_list 0.27 0.28 0.29
```

## get_unrands

Get all unrands at `0.27.0` tag in crawl github repo, copy into `src/Version/0.27.js`

```sh
yarn tsx ./scripts/get_unrands 0.27.0
```

## parseUser

```sh
yarn search magusnn by Sigmund
```

![Demo GIF of parseUser for user "magusnn" for term "by sigmund"](https://raw.githubusercontent.com/magus/dcsseeds/master/static/parseuser-demo-4x.766b70.gif)
