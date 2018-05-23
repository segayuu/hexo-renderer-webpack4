'use strict';

const hasSynbol = Boolean(Symbol);

const arrayReduce = (array, iteratee, accumulator, initAccum) => {
  let i = -1
  const length = array ? array.length : 0;

  if (initAccum && length) {
    accumulator = array[++i];
  }
  while (++i < length) {
    accumulator = iteratee(accumulator, array[i], i, array);
  }
  return accumulator;
}

const iterableReduce = (iterable, iteratee, accumulator, initAccum) => {
  let i = -1;

  for (const item of iterable) {
    if (initAccum) {
      accumulator = item;
      initAccum = false;
      continue;
    }
    accumulator = iteratee(accumulator, item, ++i, iterable);
  }
  return accumulator;
};

module.exports = (iterable, iteratee, accumulator) => {
  const initAccum = arguments.length < 3;
  if (Array.isArray(iterable)) {
    return arrayReduce(iterable, iteratee, accumulator, initAccum);
  } else if (hasSynbol && typeof iterable[Symbol.iterator] === 'function') {
    return iterableReduce(iterable, iteratee, accumulator, initAccum);
  }
};
