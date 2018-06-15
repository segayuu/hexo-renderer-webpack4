'use strict';
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const { tmpdir } = require('os');
const { join, basename, relative } = require('path');

const { iferr, tiferr } = require('iferr');

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

  // maybe iterable(or string)
  if (typeof obj[Symbol.iterator] === 'function') {
    return Array.from(obj, callback, thisArg);
  }

  // maybe ArrayLike
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
  return Object.assign({}, ctx.config, ctx.theme.config, ctx.config.theme_config).webpack;
};

const resolveEntryPath = (path, config, ctx) => {
  if (!config.entry || !isEntry(path, toAbsolutePath(config.entry, ctx.source_dir))) {
    return null;
  }

  return Object.assign({}, config, { entry: path });
};

/**
 * @param {string} path
 * @param {Hexo} ctx
 */
const getWebpackConfig = (path, ctx) => {
  const raw = getRawWebpackConfig(ctx);
  if (Array.isArray(raw)) {
    return raw.map(item => resolveEntryPath(path, item, ctx)).filter(item => item != null);
  }
  return resolveEntryPath(path, raw, ctx);
};

/**
 * @param {webpack.Configuration} config
 * @param {Hexo} ctx
 */
const webpackInmemoryRenderAsync = (config, ctx) => {
  const output = {
    path: TMP_PATH,
    filename: basename(config.entry)
  };
  const outputPath = join(output.path, output.filename);

  config.output = config.output || {};

  Object.assign(config.output, output);

  const compiler = webpack(config);
  compiler.outputFileSystem = mfs;

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

/**
 * @param {webpack.Configuration[]} configs
 * @param {Hexo} ctx
 */
const webpackMultiRenderAsync = (configs, ctx) => {
  if (!configs.every(config => config.output)) {
    return Promise.reject(new Error());
  }

  let promises = configs.map(config => {
    const { output } = config;
    const { path, filename } = output;

    output.path = path ? join(TMP_PATH, path) : TMP_PATH;
    const outputPath = join(output.path, output.filename);
    const routePath = filename || relative(ctx.source_dir, config.entry);

    const compiler = webpack(config);
    compiler.outputFileSystem = mfs;

    return new Promise((resolve, reject) => {
      compiler.run(iferr(reject, stats => { resolve(stats); }));
    }).then(stats => {
      if (stats.hasErrors()) {
        ctx.log.error(stats.toString());
        throw new Error(stats.toJson('errors-only').errors.join('\n'));
      }

      if (stats.hasWarnings()) {
        ctx.log.warn(stats.toString());
      }

      const result = mfs.readFileSync(outputPath, 'utf8');
      ctx.route.set(routePath, result);
    });
  });

  return Promise.all(promises);
};

function renderer({path, text}) {
  const config = getWebpackConfig(path, this);

  if (config == null) {
    return text;
  }
  if (Array.isArray(config)) {
    if (config.length === 0) {
      return text;
    }
    return webpackMultiRenderAsync(config, this).then(_ => '');
  }

  return webpackInmemoryRenderAsync(config, this);
}

module.exports = renderer;
