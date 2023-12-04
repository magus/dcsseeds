import child_process from 'node:child_process';

export function pbcopy(data: string) {
  const proc = child_process.spawn('pbcopy');
  proc.stdin.write(data);
  proc.stdin.end();
}
