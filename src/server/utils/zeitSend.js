const { send } = require('micro');

module.exports = function zeitSend(res, statusCode, data, { prettyPrint } = {}) {
  const isError = statusCode === 500 || data instanceof Error;

  // JIT ERROR is created if error and data is missing
  if (isError && !data) {
    data = new Error('JIT ERROR');
  }

  console.debug('[zeitSend]', statusCode, isError ? data.message : JSON.stringify({ data }));

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

  const formattedResponseJson = !prettyPrint ? responseJson : JSON.stringify(responseJson, null, 2);

  return send(res, statusCode, formattedResponseJson);
};
