const random = () => Math.random();

const randomInt = (max = 9, min = 0) => Math.floor(random() * (max - min)) + min;

const randomElement = (array) => array[randomInt(array.length - 1)];

module.exports = {
  random,
  randomInt,
  randomElement,
};
