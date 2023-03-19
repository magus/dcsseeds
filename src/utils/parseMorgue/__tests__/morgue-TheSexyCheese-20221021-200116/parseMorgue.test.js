import { test_parseMorgue } from '../test_parseMorgue';

// do not log artefacts items without a valid shop (e.g. gozag call merchant shop)
//
//  70459 | Slime:4  | Bought the ring of Syveosotz {+Blink rF++ Will++ Str+6
//                   | Dex-2} for 850 gold pieces
//
const morgue_url = 'https://cbro.berotato.org/morgue/TheSexyCheese/morgue-TheSexyCheese-20221021-200116.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
