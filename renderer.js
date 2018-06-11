'use strict';
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const { tmpdir } = require('os');
const { join, basename } = require('path');

const { tiferr } = require('iferr');

const TMP_PATH = tmpdir();
const mfs = new MemoryFS();

/**
 * @param {string} target
 * @param {string|string[]} entrys
 */
const isEntry = (target, entrys) => {
  if (typeof entrys === 'string') {
    return entrys === target;
  }
  return entrys.includes(target);
};

/**
 * @template T
 * @template R
 * @template U
 * @param {Iterable<T>|ArrayLike<T>|Object.<string, T>} obj
 * @param {(this: U, value: T) => R} callback
 * @param {U} thisArg
 * @return {R[]}
 */
const objectMap = (obj, callback, thisArg = undefined) => {
  if (obj == null) {
    throw new TypeError();
  }

  if (Array.isArray(obj)) {
    return obj.map(callback, thisArg);
  }

  const type = typeof obj;

  if (type !== 'object' && type !== 'string') {
    throw new TypeError();
  }

  // maybe iterable
  if (typeof obj[Symbol.iterator] === 'function') {
    return Array.from(obj, callback, thisArg);
  }

  // maybe ArrayLike(or string)
  if (typeof obj.length === 'number') {
    return Array.from(obj, callback, thisArg);
  }

  return Object.values(obj).map(callback, thisArg);
};

/**
 * @param {string|Iterable<string>|ArrayLike<string>|Object.<string, string>} targets
 * @param {string} base
 * @return {string|string[]}
 */
const toAbsolutePath = (targets, base) => {
  if (targets == null) {
    return [];
  }
  if (typeof targets === 'string') {
    return join(base, targets);
  }

  // Convert config of the entry from object.
  return objectMap(targets, x => join(base, x));
};


/**
 * @typedef {object} Hexo
 */
/**
 * @param {Hexo} ctx
 */
const getRawWebpackConfig = ctx => {
  const { webpack: themeConfig } = ctx.thene ? ctx.theme.config : {};
  const { webpack: siteConfig } = ctx.config;
  return Object.assign({}, themeConfig, siteConfig);
};

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getWebpackConfig = (path, ctx) => {
  const config = Object.assign({ output: {} }, getRawWebpackConfig(ctx));

  if (!config.entry || !isEntry(path, toAbsolutePath(config.entry, ctx.source_dir))) {
    return null;
  }

  config.entry = path;

  Object.assign(config.output, {
    path: TMP_PATH,
    filename: basename(path)
  });

  return config;
};

/**
 * @param {webpack.Configuration} config
 * @param {Hexo} ctx
 */
const webpackInmemoryRenderAsync = (config, ctx) => {
  const compiler = webpack(config);
  compiler.outputFileSystem = mfs;

  const { output } = compiler.options;
  const outputPath = join(output.path, output.filename);

  let resolve, reject;

  const promise = new Promise((_resolve, _reject) => { resolve = _resolve; reject = _reject; });

  compiler.run(tiferr(reject, stats => {
    if (stats.hasErrors()) {
      ctx.log.error(stats.toString());
      throw new Error(stats.toJson('errors-only').errors.join('\n'));
    }

    if (stats.hasWarnings()) {
      ctx.log.warn(stats.toString());
    }

    resolve(mfs.readFileSync(outputPath, 'utf8'));
  }));

  return promise;
};

function renderer({path, text}) {
  const config = getWebpackConfig(path, this);

  if (config == null) {
    return text;
  }

  return webpackInmemoryRenderAsync(config, this);
}

module.exports = renderer;
