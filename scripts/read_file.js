const fs_promises = require('fs').promises;

exports.read_file = async function read_file(filepath) {
  let buffer = await fs_promises.readFile(filepath, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return source;
};
