# Adding a new version

Adding a new version, e.g. `0.33.1` can be done by following the steps below.

1. [Follow the instructions to setup a new submodule in `crawl-dir`](../crawl-dir/README.md)

1. Create a new version file under `src/Version`, e.g. [`src/Version/0.33.js`](../src/Version/0.33.js)

   ```js
   exports.Name = '0.33';
   ```

1. Run the scripts below to generate the contents of the [`src/Version/0.33.js`](../src/Version/0.33.js).

   - Species and Background variables

     Copy output under [scripts/**output**/SpeciesJobData](../scripts/__output__/SpeciesJobData) into [`src/Version/0.33.js`](../src/Version/0.33.js).

     ```bash
     pnpm tsx scripts/SpeciesJobData.ts
     ```

   - Spell variables

     Content is copied to clipboard, paste directly into [`src/Version/0.33.js`](../src/Version/0.33.js).

     ```bash
     yarn tsx scripts/get_spells 0.33.1
     ```

   - Unrand variables

     Content is copied to clipboard, paste directly into [`src/Version/0.33.js`](../src/Version/0.33.js).

     ```bash
     pnpm tsx scripts/get_unrands.ts 0.33.1
     ```

1. Build the full list of unrands for supported versions.

   Content is copied to clipboard, paste directly into [`src/utils/Unrands.js`](../src/utils/Unrands.js).

   ```bash
   pnpm tsx scripts/build_unrand_list 0.27 0.28 0.29 0.30 0.31 0.32 0.33
   ```
