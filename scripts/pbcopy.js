const { spawn } = require('child_process');

exports.pbcopy = function pbcopy(data) {
  const proc = spawn('pbcopy');
  proc.stdin.write(data);
  proc.stdin.end();
};
