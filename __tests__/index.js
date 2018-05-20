'use strict';
const Hexo = require('hexo');
const renderer = require('../renderer');
const { join } = require('path');

const hexo = new Hexo(process.cwd(), { silent: true });

beforeAll(async() => {
  await hexo.init();
  hexo.extend.renderer.register('js', 'js', renderer);
  hexo.config.webpack = {
    mode: 'development',
    entry: 'fixtures/spec_1.js',
    output: {
      path: 'dist',
      filename: 'test-bundle.js'
    }
  };
  await hexo.load();
});

test('todo', () => {
  expect(hexo.render.isRenderable('test.js')).toBe(true);
  expect(hexo.render.getOutput('test.js')).toBe('js');
});

test('todo2', async() => {
  const result = await hexo.render.render({ path: join(__dirname, '..', 'fixtures', 'spec_1.js'), engine: 'js' });
  console.log(result);
});
