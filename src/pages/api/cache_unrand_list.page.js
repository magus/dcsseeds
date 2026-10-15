import { get_artifact_list } from 'src/server/get_artifact_list';

// https://nextjs.org/docs/messages/api-routes-response-size-limit
export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function cahce_unrand_list(req, res) {
  // https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#recommended-cache-control
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=900, stale-while-revalidate=5400');

  const result = await get_artifact_list();

  // console.debug({ props });

  return res.status(200).json(result);

  // next 13+ edge runtime?

  // return new Response(JSON.stringify(result), {
  //   status: 200,
  //   headers: {
  //     'content-type': 'application/json',
  //     'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
  //   },
  // });
}
