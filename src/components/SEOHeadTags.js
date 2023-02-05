import * as React from 'react';
import Head from 'next/head';

export default function SEOHeadTags(props) {
  const title = props.title || process.env.APP_NAME || 'DCSS Search';
  const description = props.description || 'Discover artifacts by location and seed';
  const path = props.path || '';
  const image_path = props.image || 'images/dcss-search-artifacts.original.png';
  const keywords = props.keywords || ['DCSS', 'Sarch', 'Artifacts', 'Seeds', 'Roguelike', 'Dungeon Crawler Stone Soup'];

  return (
    <Head>
      {/* seo & open graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={app_url(path)} />
      <meta property="og:image" content={app_url(image_path)} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:creator" content="magusnn" />
      <meta property="twitter:creator:id" content="23604692" />

      <meta property="og:locale" content="en_US" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
    </Head>
  );
}

function app_url(pathname) {
  return `${process.env.PROTOCOL}://${process.env.HOSTNAME}/${pathname}`;
}
