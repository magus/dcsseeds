module.exports = runRegex;

// throw error if no match to enforce match return type (no null)
// guarantees that if this succeeds we have a full match and can parse groups
function runRegex(id, content, regex) {
  const match = runRegexSafe(id, content, regex);

  // return match if present and at least one matching group
  if (match) {
    return match;
  }

  throw new Error(['runRegex', id, regex].join(' '));
}

// runRegex.safe can return null instead of throwing an error
runRegex.safe = runRegexSafe;
function runRegexSafe(id, content, regex) {
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
