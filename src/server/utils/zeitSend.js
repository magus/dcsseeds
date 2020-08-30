const { send } = require('micro');

module.exports = function zeitSend(res, statusCode, data) {
  const isError = statusCode === 500 || data instanceof Error;

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

  return send(res, statusCode, responseJson);
};
