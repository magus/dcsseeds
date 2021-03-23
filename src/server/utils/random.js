const crypto = require('crypto');

const MAX_INT8 = Math.pow(2, 8) - 1;

const random = () => {
  const [randInt8] = crypto.randomBytes(1).toJSON().data;
  return randInt8 / MAX_INT8;
};

const randomInt = (max = 9, min = 0) => Math.floor(random() * (max - min)) + min;

const randomElement = (array) => array[randomInt(array.length - 1)];

module.exports = {
  random,
  randomInt,
  randomElement,
};
