// legacy had module.exports before so this is backwards compatible for old usages
export default runRegex;

// throw error if no match to enforce match return type (no null)
// guarantees that if this succeeds we have a full match and can parse groups
export function runRegex(id, content, regex) {
  const match = runRegex_safe(id, content, regex);

  // return match if present and at least one matching group
  if (match) {
    return match;
  }

  throw new Error(['runRegex', id, regex].join(' '));
}

// runRegex_safe can return null instead of throwing an error
export function runRegex_safe(id, content, regex) {
  const match = content.match(regex);

  // return match if present and at least one matching group
  if (match) {
    const [, firstGroup] = match;
    if (firstGroup) {
      return match;
    }
  }

  return null;
}
