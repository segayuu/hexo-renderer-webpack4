'use strict';
const webpack = require('webpack');
const os = require('os');
const MemoryFS = require('memory-fs');
const pathFn = require('path');
const { fromCallback } = require('universalify');

const zipObject = require('lodash/zipObject');
const mapValues = require('lodash/mapValues');
const includes = require('lodash/includes');

const TMP_PATH = os.tmpdir();

const mfs = new MemoryFS();

const cwd = process.cwd();

const rootPrefix = x => pathFn.join(cwd, x);

function getEntry(entry) {
  if (typeof entry === 'string') entry = [entry];
  if (Array.isArray(entry)) {
    entry = entry.map(rootPrefix);
    return zipObject(entry.map(x => pathFn.parse(x).name), entry);
  }
  return mapValues(entry, rootPrefix);
}

async function renderer({path, text}, options) {
  const { webpack: themeConfig = {} } = this.thene ? this.theme.config : {};
  const { webpack: siteConfig = {} } = this.config;

  const userConfig = Object.assign({}, themeConfig, siteConfig);

  //
  // Convert config of the entry to object.
  //
  const entry = getEntry(userConfig.entry);

  //
  // If this file is not a webpack entry simply return the file.
  //
  if (!includes(entry, path)) {
    return text;
  }

  //
  // Copy config then Object.assign it with some defaults.
  //
  const config = Object.assign({}, userConfig, {
    entry,
    output: {
      path: TMP_PATH,
      filename: pathFn.basename(path)
    }
  });

  //
  // Setup compiler to use in-memory file system then run it.
  //
  const compiler = webpack(config);
  compiler.outputFileSystem = mfs;

  const stats = await fromCallback(cb => compiler.run(cb))();

  if (stats.hasErrors()) {
    this.log.error(stats.toString());
    throw stats.toJson().errors[0];
  }

  const { output } = compiler.options;
  const outputPath = pathFn.join(output.path, output.filename);
  return mfs.readFileSync(outputPath, 'utf8');
}

module.exports = renderer;
