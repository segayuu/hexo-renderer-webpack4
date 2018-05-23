/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./fixtures/spec_2.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./fixtures/reduce.js":
/*!****************************!*\
  !*** ./fixtures/reduce.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nconst hasSynbol = Boolean(Symbol);\n\nconst arrayReduce = (array, iteratee, accumulator, initAccum) => {\n  let i = -1\n  const length = array ? array.length : 0;\n\n  if (initAccum && length) {\n    accumulator = array[++i];\n  }\n  while (++i < length) {\n    accumulator = iteratee(accumulator, array[i], i, array);\n  }\n  return accumulator;\n}\n\nconst iterableReduce = (iterable, iteratee, accumulator, initAccum) => {\n  let i = -1;\n\n  for (const item of iterable) {\n    if (initAccum) {\n      accumulator = item;\n      initAccum = false;\n      continue;\n    }\n    accumulator = iteratee(accumulator, item, ++i, iterable);\n  }\n  return accumulator;\n};\n\nmodule.exports = (iterable, iteratee, accumulator) => {\n  const initAccum = arguments.length < 3;\n  if (Array.isArray(iterable)) {\n    return arrayReduce(iterable, iteratee, accumulator, initAccum);\n  } else if (hasSynbol && typeof iterable[Symbol.iterator] === 'function') {\n    return iterableReduce(iterable, iteratee, accumulator, initAccum);\n  }\n};\n\n\n//# sourceURL=webpack:///./fixtures/reduce.js?");

/***/ }),

/***/ "./fixtures/spec_2.js":
/*!****************************!*\
  !*** ./fixtures/spec_2.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nconst reduce = __webpack_require__(/*! ./reduce */ \"./fixtures/reduce.js\");\n\nmodule.exports = reduce;\n\n\n//# sourceURL=webpack:///./fixtures/spec_2.js?");

/***/ })

/******/ });