'use strict';
const webpack = require('webpack');
const Hexo = require('hexo');

const hexo = new Hexo(process.cwd(), { silent: true });

beforeAll(async() => {
  await hexo.init();
  await hexo.load();
});

test('todo', () => {
  expect(hexo.render.isRenderable('test.js')).toBe(true);
  expect(hexo.render.getOutput('test.js')).toBe('js');
});

test('todo2', () => {
  hexo.render.render({

  });
  expect(hexo.render.getOutput('test.js')).toBe('js');
});
