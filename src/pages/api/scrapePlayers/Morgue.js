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

  const [, player, Y, M, D, h, m, s] = match;
  const date = new Date(`${Y}-${M}-${D}T${h}:${m}:${s}.000Z`);
  return { player, date };
}

const RE = {
  morgue_filename: /morgue-(.*?)-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/,
};
