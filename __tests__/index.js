'use strict';
const Hexo = require('hexo');
const { readFile } = require('fs');
const { promisify } = require('util');
const { join } = require('path');
const { createSandbox, process } = require('hexo-test-utils/core');
const { contentFor } = require('hexo-test-utils/routing');

const readFileAsync = promisify(readFile);
const fixture_folder = join(__dirname, 'fixtures');

/** @type {(options?: string|{ fixtureName?: string; skipInit?: boolean; }) => Promise<Hexo>} */
const sandbox = createSandbox(Hexo, { fixture_folder, plugins: [require.resolve('../index.js')] });

/** @param {string} name */
const getFixturePath = name => join(fixture_folder, name);

/**
 * @param {string} path
 * @param {Hexo} ctx
 * @returns {Promise<string>}
 */
const jsRender = (path, ctx) => ctx.render.render({ path, engine: 'js' });

test('hexo.render - state', async () => {
  const hexo = await sandbox('development');
  expect(hexo.render.isRenderable('source/test.js')).toBe(true);
  expect(hexo.render.getOutput('source/test.js')).toBe('js');
});

test('hexo.route - result', async () => {
  const fixtureName = 'development';
  const fixturePath = getFixturePath(fixtureName);
  const expectedPromise = readFileAsync(join(fixturePath, 'result.js'), 'utf8');

  const ctx = await sandbox(fixtureName);

  await process(ctx);

  const [content, expected] = await Promise.all([contentFor(ctx, 'spec_1.js'), expectedPromise]);
  const result = content.toString('utf8');

  expect(result).toBe(expected);
});

test('webpack mode: development', async () => {
  const fixtureName = 'development';
  const fixturePath = getFixturePath(fixtureName);
  const expectedPromise = readFileAsync(join(fixturePath, 'result.js'), 'utf8');
  const source = join(fixturePath, 'source', 'spec_1.js');

  const hexo = await sandbox(fixtureName);

  const [result, expected] = await Promise.all([jsRender(source, hexo), expectedPromise]);

  expect(result).toBe(expected);
});

test('webpack mode: production', async () => {
  const fixtureName = 'production';
  const fixturePath = getFixturePath(fixtureName);
  const expectedPromise = readFileAsync(join(fixturePath, 'result.js'), 'utf8');
  const source = join(fixturePath, 'source', 'spec_1.js');

  const hexo = await sandbox(fixtureName);

  const [result, expected] = await Promise.all([jsRender(source, hexo), expectedPromise]);

  expect(result).toBe(expected);
});

test('not exist entry', async () => {
  const fixtureName = 'development';
  const fixturePath = getFixturePath(fixtureName);
  const source = join(fixturePath, 'source', 'typo.js');

  const hexo = await sandbox(fixtureName);

  expect.assertions(1);
  await expect(jsRender(source, hexo)).rejects.toThrow('ENOENT');
});

test('webpack multi entry', async () => {
  const fixtureName = 'multi';
  const fixturePath = getFixturePath(fixtureName);

  const expectedsPromise = Promise.all(['result_1.js', 'result_2.js'].map(path => readFileAsync(join(fixturePath, path), 'utf8')));

  const hexo = await sandbox(fixtureName);

  const resultsPromise = Promise.all(['spec_1.js', 'spec_2.js'].map(path => jsRender(join(fixturePath, 'source', path), hexo)));

  const [results, expecteds] = await Promise.all([resultsPromise, expectedsPromise]);

  expect(results).toEqual(expecteds);
});

test('webpack multi config', async () => {
  const fixtureName = 'multi_config';
  const fixturePath = getFixturePath(fixtureName);
  const expectedsPromise = Promise.all(['result_1.js', 'result_2.js'].map(path => readFileAsync(join(fixturePath, path), 'utf8')));

  const hexo = await sandbox(fixtureName);

  await process(hexo);

  const resultsPromise = Promise.all([contentFor(hexo, 'result_1.js'), contentFor(hexo, 'result_2.js')]);

  const [results, expected] = await Promise.all([resultsPromise, expectedsPromise]);

  expect(results.map(buffer => buffer.toString('utf8'))).toEqual(expected);
});
