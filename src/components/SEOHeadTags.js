import * as React from 'react';
import Head from 'next/head';

import MetaImage from 'public/images/dcss-search-artifacts.original.png';
import Favicon from 'public/images/dcss-search-icon.png';

export default function SEOHeadTags(props) {
  const favicon = app_url(props.favicon || Favicon.src);
  const title = props.title || process.env.APP_NAME || 'DCSS Search';
  const description = props.description || 'Discover artifacts by location and seed';
  const path = app_url(props.path || '');
  const image_path = app_url(props.image || MetaImage.src);
  const keywords = props.keywords || ['DCSS', 'Sarch', 'Artifacts', 'Seeds', 'Roguelike', 'Dungeon Crawler Stone Soup'];

  return (
    <Head>
      <link rel="shortcut icon" href={favicon} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={path} />
      <meta property="og:image" content={image_path} />
      <meta property="og:image:width" content="1911" />
      <meta property="og:image:height" content="1075" />

      <meta property="twitter:maxage" content="300" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:creator" content="magusnn" />
      <meta property="twitter:creator:id" content="23604692" />
      <meta property="twitter:url" content={path} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image:src" content={image_path} />

      <meta property="og:locale" content="en_US" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
    </Head>
  );
}

function app_url(pathname) {
  return `${process.env.PROTOCOL}://${process.env.HOSTNAME}${pathname}`;
}
