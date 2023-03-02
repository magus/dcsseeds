import { test_parseMorgue } from './test_parseMorgue';

// Okawaru Arena should be parsed as previous branch
// 35175 | Snake:3  | Found a sacrificial altar of Ru.
// 35521 | Snake:4  | Entered Level 4 of the Snake Pit
// 35555 | Arena    | Entered the Arena
// 35592 | Snake:4  | Noticed Mara
// 35827 | Arena    | Entered the Arena
// 35839 | Arena    | Noticed Jingleheimer's illusion
// 35867 | Arena    | Killed Mara
// 35867 | Arena    | Received a gift from Okawaru
// 35867 | Arena    | Found the +7 Kryia's mail coat {PotionHeal*2 rC+}
// 36737 | Snake:4  | Identified the +7 fustibalus "Fisov" {speed, Int+4}
const morgue_url = 'https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220810-034403.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
