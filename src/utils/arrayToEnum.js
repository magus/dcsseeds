module.exports = function arrayToEnum(array) {
  return Object.freeze(
    array.reduce((enumType, field) => {
      enumType[field] = field;
      return enumType;
    }, {}),
  );
};
