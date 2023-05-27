import dynamic from 'next/dynamic';

import { Loading } from 'src/components/Loading';

export const DynamicArtifactSearch = dynamic(
  async () => {
    const imported = await import('./ArtifactSearch');
    return imported.ArtifactSearch;
  },
  {
    ssr: false,
    loading: () => <Loading />,
  },
);
