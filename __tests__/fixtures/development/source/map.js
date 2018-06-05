'use strict';

const hasSynbol = Boolean(Symbol);

const arrayMap = (array, callback) => {
  const result = [];
  let i = -1;
  const len = array.length;
  while (++i < len) {
    result.push(callback(array[i], i));
  }
  return result;
};

const iterMap = (iterable, callback) => {
  const result = [];
  let i = -1;
  const iter = iterable[Symbol.iterator]();
  let iterResult;
  while ((iterResult = iter.next()).done !== false) {
    result.push(callback(iterResult.value, ++i));
  }
  return result;
};

module.exports = (iterable, callback) => {
  if (Array.isArray(iterable)) {
    return arrayMap(iterable, callback);
  } else if (hasSynbol && typeof iterable[Symbol.iterator] === 'function') {
    return iterMap(iterable, callback);
  }
};
