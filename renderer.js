'use strict';
const webpack = require('webpack');
const os = require('os');
const MemoryFS = require('memory-fs');
const pathFn = require('path');

const zipObject = require('lodash/zipObject');
const mapValues = require('lodash/mapValues');
const includes = require('lodash/includes');

const TMP_PATH = os.tmpdir();

const mfs = new MemoryFS();

const cwd = process.cwd();

const rootPrefix = x => pathFn.join(cwd, x);

const getEntry = entry => {
  if (typeof entry === 'string') entry = [entry];
  if (Array.isArray(entry)) {
    entry = entry.map(rootPrefix);
    return zipObject(entry.map(x => pathFn.parse(x).name), entry);
  }
  return mapValues(entry, rootPrefix);
};

const getConfig = (path, ctx) => {
  const { webpack: themeConfig = {} } = ctx.thene ? ctx.theme.config : {};
  const { webpack: siteConfig = {} } = ctx.config;

  const config = Object.assign({}, themeConfig, siteConfig);

  //
  // Convert config of the entry to object.
  //
  config.entry = getEntry(config.entry);

  config.output = config.output || {};

  Object.assign(config.output, {
    path: TMP_PATH,
    filename: pathFn.basename(path)
  });

  return config;
};

async function renderer({path, text}, options) {
  const config = getConfig(path, this);

  //
  // If this file is not a webpack entry simply return the file.
  //
  if (!includes(config.entry, path)) {
    return text;
  }

  //
  // Setup compiler to use in-memory file system then run it.
  //
  const compiler = webpack(config);
  compiler.outputFileSystem = mfs;

  const stats = await new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });

  if (stats.hasErrors()) {
    this.log.error(stats.toString());
    throw stats.toJson('errors-only').errors[0];
  }

  const { output } = compiler.options;
  const outputPath = pathFn.join(output.path, output.filename);
  return mfs.readFileSync(outputPath, 'utf8');
}

module.exports = renderer;
