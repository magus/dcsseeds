import send from 'src/server/utils/zeitSend';

import { gql } from '@apollo/client';
import { createQuery } from 'src/graphql/createQuery';
import fetch from 'src/utils/fetch';
import { sleep } from 'src/utils/sleep';

// Example API Request
// http://localhost:3000/api/job?i=203&id=12058c0b-216e-4644-9960-7bd032081223

// table schema
// job [id active i lastRun interval endpoint created updated]

module.exports = async (req, res) => {
  try {
    const startTimeMs = Date.now();

    const { id } = req.query;
    const i = parseInt(req.query.i, 10);

    console.debug('job', 'start', { id, i });

    const job = await GQL_JOB.run({ id });

    if (!job) return send(res, 500, new Error('job does not exist'));
    if (!job.active) return send(res, 500, new Error('job not active'));
    if (job.i !== i) return send(res, 500, new Error('job request i out of sync'));

    const lastRunMs = new Date(job.lastRun).getTime();
    const secondsSinceLastRun = (Date.now() - lastRunMs) / 1000;
    console.debug({ secondsSinceLastRun });

    // check seconds since lastRun against job.interval
    if (secondsSinceLastRun > job.interval) {
      console.debug('job', 'run', { id: job.id, endpoint: job.endpoint });
      // update job i immediately for sync and prevent duplicate request chains
      // send now() to capture current time as lastRun
      GQL_UPDATE_JOB.run({ id, lastRun: 'now()' });

      // asynchronously kickoff the endpoint to execute this job task
      // do NOT await because we want this to be async
      if (job.endpoint) {
        fetch(`${process.env.PROTOCOL}://${process.env.HOSTNAME}/api/job/${job.endpoint}`);
      }
    } else {
      console.debug('job', 'skip');
      // update job i immediately for sync and prevent duplicate request chains
      GQL_UPDATE_JOB.run({ id, lastRun: job.lastRun });
    }

    // > endif

    // > check if now - updated > interval
    // > if we are good to run
    // > log(job, id, job.endpoint)
    // > fetch(job.endpoint)
    // > endif

    // > await sleep(30) (wait a bit to make sure we don’t fire these off too rapidly)
    const sleepTimeMs = MAX_REQUEST_DURATION - (Date.now() - startTimeMs);
    const sleepSeconds = Math.floor(sleepTimeMs / 1000);

    if (sleepSeconds) {
      await sleep(sleepSeconds);
    }

    // kickoff the recursive call for next job i
    // this may not work if done async on vercel
    await fetch(`${process.env.PROTOCOL}://${process.env.HOSTNAME}/api/job?id=${id}&i=${i + 1}`);

    console.debug('job', 'end', { id, i });

    return send(res, 200);
  } catch (err) {
    return send(res, 500, err);
  }
};

const GQL_JOB = createQuery(
  gql`
    query JobByPK($id: uuid!) {
      job: job_by_pk(id: $id) {
        name
        active
        lastRun
        i
        interval
        endpoint
        id
      }
    }
  `,
  (data) => data.job,
);

const GQL_UPDATE_JOB = createQuery(gql`
  mutation UpdateJobByPK($id: uuid!, $lastRun: timestamptz!) {
    update_job_by_pk(pk_columns: { id: $id }, _set: { lastRun: $lastRun }, _inc: { i: 1 }) {
      id
    }
  }
`);

// Serverless Function Execution Timeout (Seconds)
// https://vercel.com/docs/platform/limits
const MAX_REQUEST_DURATION = (10 * 1000) / 2;
