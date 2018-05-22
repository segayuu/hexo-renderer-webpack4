'use strict';
const Hexo = require('hexo');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const { join } = require('path');

const hexo = new Hexo(process.cwd(), { silent: true });

beforeAll(async() => {
  await hexo.init();
  await hexo.loadPlugin(`${__dirname}/../index.js`);
});

test('hexo.render - state', () => {
  expect(hexo.render.isRenderable('test.js')).toBe(true);
  expect(hexo.render.getOutput('test.js')).toBe('js');
});

test('webpack mode: development', async() => {
  const fixtures_path = join(__dirname, '..', 'fixtures');
  const expectedPromise = readFileAsync(join(fixtures_path, 'result_development.js'), 'utf8');

  hexo.config.webpack = {
    mode: 'development',
    entry: 'fixtures/spec_1.js'
  };

  const result = await hexo.render.render({ path: join(fixtures_path, 'spec_1.js'), engine: 'js' });
  expect(result).toBe(await expectedPromise);
});

test('webpack mode: production', async() => {
  const fixtures_path = join(__dirname, '..', 'fixtures');
  const expectedPromise = readFileAsync(join(fixtures_path, 'result_production.js'), 'utf8');

  hexo.config.webpack = {
    mode: 'production',
    entry: 'fixtures/spec_1.js'
  };

  const result = await hexo.render.render({ path: join(fixtures_path, 'spec_1.js'), engine: 'js' });
  expect(result).toBe(await expectedPromise);
});
