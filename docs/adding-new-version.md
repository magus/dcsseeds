# Adding a new version

Adding a new version, e.g. `0.33.1` can be done by following the steps below.

1.  [Follow the instructions to setup a new submodule in `crawl-dir`](../crawl-dir/README.md)

1.  Create python virtual environment for interacting with dcsseeds crawl source

    ```bash
    python3 -m venv ~/.pyenv/dcsseeds
    source ~/.pyenv/dcsseeds/bin/activate
    pip install pyyaml
    ```

1.  Update [`src/Version/index.js`](../src/Version/index.js) with the new version.

1.  Create a new version file under `src/Version`, e.g. [`src/Version/0.33.js`](../src/Version/0.33.js)

    ```js
    exports.Name = '0.33';
    ```

1.  Run the scripts below to generate the contents of the [`src/Version/0.33.js`](../src/Version/0.33.js).

    - Species and Background variables

      Copy output under [`scripts/__output__/SpeciesJobData/0.33.1`](../scripts/__output__/SpeciesJobData/0.33.1) into [`src/Version/0.33.js`](../src/Version/0.33.js).

      ```bash
      pnpm tsx scripts/SpeciesJobData
      ```

    - Banned combos

      This is a little manual for now, check the logic, check the `_banned_combination` function in `crawl-dir/0.32.1/crawl-ref/source/ng-restr.cc` and cross reference with the species data in `crawl-dir/0.32.1/crawl-ref/source/species-data.h`.

      Pay careful attention to job names changing, race mutation changes, new races, etc.

          ```js
          // prettier-ignore
          exports.BannedCombos = {
            [Species.SP_FELID]: [Jobs.JOB_GLADIATOR, Jobs.JOB_BRIGAND, Jobs.JOB_HUNTER, Jobs.OB_HEXSLINGER],
            [Species.SP_DEMIGOD]: [Jobs.JOB_BERSERKER, Jobs.JOB_CINDER_ACOLYTE, Jobs.OB_CHAOS_KNIGHT, Jobs.JOB_MONK],
            [Species.SP_GHOUL]: [Jobs.JOB_SHAPESHIFTER],
            [Species.SP_MUMMY]: [Jobs.JOB_SHAPESHIFTER],
            [Species.SP_POLTERGEIST]: [Jobs.JOB_SHAPESHIFTER],
            [Species.SP_REVENANT]: [Jobs.JOB_SHAPESHIFTER],
          };
          ```

    - Spell variables

      Content is copied to clipboard, paste directly into [`src/Version/0.33.js`](../src/Version/0.33.js).

      ```bash
      pnpm tsx scripts/get_spells 0.33.1
      ```

    - Build the full list of spells for supported versions.

      Content is copied to clipboard, paste directly into [`src/utils/Spells.js`](../src/utils/Spells.js).

      ```bash
      pnpm tsx scripts/Spells
      ```

    - Unrand variables

      Content is copied to clipboard, paste directly into [`src/Version/0.33.js`](../src/Version/0.33.js).

      ```bash
      pnpm tsx scripts/get_unrands 0.33.1
      ```

    - Build the full list of unrands for supported versions.

      Content is copied to clipboard, paste directly into [`src/utils/Unrands.js`](../src/utils/Unrands.js).

      ```bash
      pnpm tsx scripts/Unrands
      ```

    - Ashenzari curses

      Content is copied to clipboard, paste directly into [`src/utils/AshenzariCurses.ts`](../src/utils/AshenzariCurses.ts).

      ```bash
      pnpm tsx scripts/AshenzariCurses
      ```

1.  Run the `git diff` command below and copy the `id` fields for new unrands into the `NEW_UNRAND_SET` in `src/pages/search/components/ArtifactSearch.js`

1.  Visit http://localhost:3000/new to validate any new species and/or jobs for the new version.

1.  Visit http://localhost:3000/ and confirm the new unrands are shown in the search list.

1.  Visit http://localhost:3000/api/cache_unrand_query?window_size=5 to ensure `report.update_list` and `report.missing_keys` include the newest unrands.

    ```json
    {
      "data": {
        "times": [
          ["all unrand cache keys", 292.586291],
          ["missing_keys", 295.285584],
          ["calculate unrand results", 3294.135375],
          ["write results to cache", 285.715542]
        ],
        "cache_result": {
          "insert_dcsseeds_scrapePlayers_unrand_cache": {
            "affected_rows": 4
          }
        },
        "report": {
          "window_size": 5,
          "update_list": [
            "UNRAND_VAINGLORY",
            "UNRAND_FISTICLOAK",
            "UNRAND_JUSTICARS_REGALIA",
            "UNRAND_SKULL_OF_ZONGULDROK"
          ],
          "missing_keys": [
            "UNRAND_VAINGLORY",
            "UNRAND_FISTICLOAK",
            "UNRAND_JUSTICARS_REGALIA",
            "UNRAND_SKULL_OF_ZONGULDROK"
          ]
        }
      },
      "error": false
    }
    ```

1.  Visit the url below and confirm the new unrands with matching `unrand_key` value have an initialized `result_list`.

    https://magic-graphql.iamnoah.com/console/data/default/schema/public/tables/dcsseeds_scrapePlayers_unrand_cache/browse
