'use strict';
/* global hexo */
const webpack = require('webpack');
const os = require('os');
const MemoryFS = require('memory-fs');

const zipObject = require('lodash/zipObject');
const mapValues = require('lodash/mapValues');
const includes = require('lodash/includes');

const TMP_PATH = os.tmpdir();

const pathFn = require('path');
const mfs = new MemoryFS();

// const TMP_PATH = os.tmpdir();

const cwd = process.cwd();

function getEntry(entry) {
  if (typeof entry === 'string') entry = [entry];
  if (Array.isArray(entry)) {
    entry = entry.map(x => pathFn.join(cwd, x));
    return zipObject(entry.map(x => pathFn.basename(x, pathFn.extname(x))), entry);
  }
  return mapValues(entry, x => pathFn.join(cwd, x));
}

const renderer = function({path, text}, options, callback) {
  const { webpack: themeConfig = {} } = hexo.thene.config;
  const { webpack: siteConfig = {} } = hexo.config;

  const userConfig = Object.assign({}, themeConfig, siteConfig);

  //
  // Convert config of the entry to object.
  //
  const entry = getEntry(userConfig.entry);

  //
  // If this file is not a webpack entry simply return the file.
  //
  if (!includes(entry, path)) {
    return callback(null, text);
  }

  //
  // Copy config then Object.assign it with some defaults.
  //
  const config = Object.assign({}, userConfig, {
    entry,
    output: {
      entry: path,
      path: TMP_PATH,
      filename: pathFn.basename(path)
    }
  });

  //
  // Setup compiler to use in-memory file system then run it.
  //
  const compiler = webpack(config);
  compiler.outputFileSystem = mfs;

  compiler.run((err, stats) => {
    if (err) {
      callback(err);
      return;
    }

    if (stats.hasErrors()) {
      hexo.log.error(stats.toString());
      return callback(stats.toJson().errors[0]);
    }

    const { output: { path, filename } } = compiler.options;
    const outputPath = pathFn.join(path, filename);
    return callback(null, mfs.readFileSync(outputPath, 'utf8'));
  });
};

hexo.extend.renderer.register('js', 'js', renderer);
