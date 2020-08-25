const { send } = require('micro');

module.exports = function zeitSend(res, statusCode, data) {
  console.debug(JSON.stringify(data) || 'no data');
  return send(res, statusCode, data);
};
