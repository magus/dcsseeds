import * as React from 'react';
import Head from 'next/head';

const DefaultTitle = process.env.APP_NAME;
const DefaultDescription = 'Generate and track DCSS seeds';

export default function SEOHeadTags({ title = DefaultTitle, description = DefaultDescription }) {
  return (
    <Head>
      {/* seo & open graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://${process.env.HOSTNAME}`} />
      <meta property="og:image" content={`https://${process.env.HOSTNAME}/images/demo.54cb5b.png`} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:creator" content="magusnn" />
      <meta property="twitter:creator:id" content="23604692" />

      <meta property="og:locale" content="en_US" />
      <meta name="description" content={description} />
      <meta name="keywords" content="DCSS, Seeds, Roguelike, Dungeon Crawler Stone Soup" />
    </Head>
  );
}
