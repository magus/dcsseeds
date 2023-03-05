module.exports = function keyMirror(obj) {
  var ret = {};
  var key;
  if (!(obj instanceof Object && !Array.isArray(obj))) {
    throw new Error('keyMirror(...): Argument must be an object.');
  }
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      ret[key] = key;
    }
  }
  return ret;
};
