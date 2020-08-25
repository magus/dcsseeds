import * as React from 'react';
import Head from 'next/head';

const DB_ADMIN_CONSOLE = 'https://dcsseeds.herokuapp.com/console/data/schema/public/tables/seed/browse';
const META_REFRESH = `0;${DB_ADMIN_CONSOLE}`;

export default function Admin() {
  return (
    <Head>
      <meta http-equiv="refresh" content={META_REFRESH} />
    </Head>
  );
}
