const { send } = require('micro');

module.exports = function zeitSend(res, statusCode, data, err) {
  console.debug('[zeitSend]', statusCode, JSON.stringify({ data, err: err && err.message }));

  if (!data || typeof data !== 'object') {
    data = { __originalData: data };
  }

  if (!err) {
    data.error = false;
  } else {
    data.error = true;

    if (err.stack) {
      data.stack = err.stack.split('\n');
    } else {
      data.rawError = err;
    }
  }

  return send(res, statusCode, data);
};
