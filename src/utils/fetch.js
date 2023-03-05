// node-fetch by default
const fetch = require('isomorphic-unfetch');
const env = require('src/config/env');

const DEFAULT_USER_AGENT = `${env.APP_NAME}-Bot/1.0`;

module.exports = async (url, args = {}) => {
  args.headers = args.headers || {};
  args.headers['user-agent'] = DEFAULT_USER_AGENT;
  console.info('[fetch]', url);
  return fetch(url, args);
};
