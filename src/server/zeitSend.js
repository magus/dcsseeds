const { send } = require('micro');
const prettier = require('prettier');

module.exports = function zeitSend(res, statusCode, data, { prettyPrint } = {}) {
  const isError = statusCode === 500 || data instanceof Error;

  // JIT ERROR is created if error and data is missing
  if (isError && !data) {
    data = new Error('JIT ERROR');
  }

  const log_data = isError ? data : JSON.stringify({ data });
  console.info('[zeitSend]', statusCode, log_data);

  const responseJson = {};

  if (!isError) {
    responseJson.error = false;
    responseJson.data = data;
  } else {
    responseJson.error = true;

    // save error data into err
    const err = data;

    // add stack if available, etc.
    if (err.stack) {
      responseJson.stack = err.stack.split('\n');
    } else {
      responseJson.rawError = data;
    }
  }

  res.setHeader('Content-Type', 'application/json');

  let formattedResponseJson;
  if (prettyPrint) {
    // formattedResponseJson = JSON.stringify(responseJson, null, 2);
    formattedResponseJson = prettier.format(JSON.stringify(responseJson), { semi: false, parser: 'json' });
  } else {
    formattedResponseJson = responseJson;
  }

  return send(res, statusCode, formattedResponseJson);
};
