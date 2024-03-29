export function Morgue(url) {
  const metadata = morgue_meta(url);
  return metadata;
}

function morgue_meta(url) {
  const filename_match = url.match(RE.filename);

  if (!filename_match) throw new Error('Morgue URL must match filename pattern');

  const { player, basename, filename } = filename_match.groups;

  const timestamp_match = filename_match.groups.timestamp.match(RE.timestamp);

  if (!timestamp_match) throw new Error('Morgue URL must match timestamp pattern');

  const [, Y, M, D, h, m, maybe_sec] = timestamp_match;
  const s = maybe_sec || '00';
  const date = new Date(`${Y}-${M}-${D}T${h}:${m}:${s}.000Z`);
  const timestamp = String(date.getTime());

  return { date, timestamp, player, url, filename, basename };
}

const RE = {
  // current format   morgue-magusnn-20210623-085146.txt
  // very old format  morgue-Lemuel-20070301-1552.txt

  // https://regex101.com/r/MW4gT5/1
  timestamp: /(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})?/,
  // https://regex101.com/r/m45jSY/1
  filename: /\/(?<filename>(?<basename>(?:morgue-)?(?<player>[^/^-]+)-?(?<timestamp>[^/]+)?)\.txt(?:\.gz)?)$/,
};
