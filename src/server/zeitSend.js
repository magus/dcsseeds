const { send } = require('micro');
const prettier = require('prettier');
const { error_json } = require('src/utils/error_json');

module.exports = async function zeitSend(res, statusCode, data, { prettyPrint } = {}) {
  const isError = statusCode === 500 || data instanceof Error;

  // JIT ERROR is created if error and data is missing
  if (isError && !data) {
    data = new Error('JIT ERROR');
  }

  const log_data = isError ? data : JSON.stringify({ data });
  console.info('[zeitSend]', statusCode, log_data);

  const responseJson = { data };

  if (!isError) {
    responseJson.error = false;
  } else {
    responseJson.error = true;

    if (data instanceof Error) {
      responseJson.data = error_json(data);
    }
  }

  res.setHeader('Content-Type', 'application/json');

  let formattedResponseJson;
  if (prettyPrint) {
    // formattedResponseJson = JSON.stringify(responseJson, null, 2);
    formattedResponseJson = await prettier.format(JSON.stringify(responseJson), { semi: false, parser: 'json' });
  } else {
    formattedResponseJson = responseJson;
  }

  return send(res, statusCode, formattedResponseJson);
};
