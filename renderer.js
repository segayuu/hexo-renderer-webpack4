'use strict';
const webpack = require('webpack');
const os = require('os');
const MemoryFS = require('memory-fs');
const pathFn = require('path');
const { tiferr } = require('iferr');

const lodashMap = require('lodash/map');

const TMP_PATH = os.tmpdir();

const mfs = new MemoryFS();

const cwd = process.cwd();

const getConfig = (path, ctx) => {
  const { webpack: themeConfig = {} } = ctx.thene ? ctx.theme.config : {};
  const { webpack: siteConfig = {} } = ctx.config;

  const config = Object.assign({}, themeConfig, siteConfig);

  config.output = config.output || {};

  Object.assign(config.output, {
    path: TMP_PATH,
    filename: pathFn.basename(path)
  });

  if (typeof config.entry === 'string') {
    config.entry = pathFn.join(cwd, config.entry);
  } else {
    // Convert config of the entry from object.
    config.entry = lodashMap(config.entry, x => pathFn.join(cwd, x));
  }

  return config;
};

function renderer({path, text}, options) {
  const config = getConfig(path, this);

  // If this file is not a webpack entry simply return the file.
  if (typeof config.entry === 'string') {
    if (config.entry !== path) {
      return text;
    }
  } else if (!config.entry.includes(path)) {
    return text;
  }

  config.entry = path;

  // Setup compiler to use in-memory file system then run it.
  const compiler = webpack(config);
  compiler.outputFileSystem = mfs;

  const { output } = compiler.options;
  const outputPath = pathFn.join(output.path, output.filename);

  let resolve, reject;

  const promise = new Promise((_resolve, _reject) => { resolve = _resolve; reject = _reject; });

  compiler.run(tiferr(reject, stats => {
    if (stats.hasErrors()) {
      this.log.error(stats.toString());
      throw new Error(stats.toJson('errors-only').errors.join('\n'));
    }

    if (stats.hasWarnings()) {
      this.log.error(stats.toString());
    }

    resolve(mfs.readFileSync(outputPath, 'utf8'));
  }));

  return promise;
}

module.exports = renderer;
