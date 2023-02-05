export function Morgue(url) {
  const { player, date } = morgue_meta(url);
  const timestamp = String(date.getTime());
  return { url, timestamp, date, player };
}

function morgue_meta(url) {
  const [, player, Y, M, D, h, m, s] = url.match(RE.morgue_filename);
  const date = new Date(`${Y}-${M}-${D}T${h}:${m}:${s}.000Z`);
  return { player, date };
}

const RE = {
  morgue_filename: /morgue-(.*?)-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/,
};
