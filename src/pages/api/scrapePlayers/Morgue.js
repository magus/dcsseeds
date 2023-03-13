import path from 'path';

export function Morgue(url) {
  const { player, date } = morgue_meta(url);
  const timestamp = String(date.getTime());
  const filename = path.basename(url);
  return { filename, timestamp, date, player, url };
}

function morgue_meta(url) {
  const match = url.match(RE.morgue_filename);

  if (!match) throw new Error('Morgue URL must match timestamp pattern');

  const [, player, Y, M, D, h, m, maybe_sec] = match;
  const s = maybe_sec || '00';
  const date = new Date(`${Y}-${M}-${D}T${h}:${m}:${s}.000Z`);
  return { player, date };
}

const RE = {
  // current format   morgue-magusnn-20210623-085146.txt
  // very old format  morgue-Lemuel-20070301-1552.txt
  morgue_filename: /morgue-(.*?)-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})?/,
};
