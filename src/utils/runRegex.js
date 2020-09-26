module.exports = async function regexAsync(id, content, regex) {
  return new Promise((resolve, _reject) => {
    const reject = (field) => {
      const message = ['runRegex', id, field].join(' ');
      // _reject(message);
      throw new Error(message);
    };

    const match = content.match(regex);
    if (!match) {
      return reject('match');
    }

    const [, firstGroup] = match;
    if (!firstGroup) {
      return reject('group');
    }

    return resolve(match);
  });
};
