export function error_json(error) {
  const message = error.message;
  const extra = error.extra;
  const stack = error.stack.split('\n');
  return { message, extra, stack };
}
