'use strict';
const Hexo = require('hexo');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);
const { join } = require('path');
const { createSandbox, process } = require('hexo-test-utils/core');
const { contentFor } = require('hexo-test-utils/routing');

const fixture_folder = join(__dirname, 'fixtures');

const getSandBox = () => {
  return createSandbox(Hexo, {
    fixture_folder,
    plugins: [
      require.resolve('../index.js')
    ]
  });
};

/** @type {(path: string; ctx: Hexo) => Promise<string>} */
const jsRender = (path, ctx) => ctx.render.render({ path, engine: 'js' });

const sandbox = getSandBox();

test('hexo.render - state', async () => {
  const hexo = await sandbox('development');
  expect(hexo.render.isRenderable('source/test.js')).toBe(true);
  expect(hexo.render.getOutput('source/test.js')).toBe('js');
});

test('hexo.route - result', async () => {
  const fixtureName = 'development';
  const fixturePath = join(fixture_folder, fixtureName);
  const expectedPromise = readFileAsync(join(fixturePath, 'result.js'), 'utf8');

  const ctx = await sandbox(fixtureName);
  await process(ctx);

  const content = await contentFor(ctx, 'spec_1.js');
  expect(content.toString('utf8')).toBe(await expectedPromise);
});

test('webpack mode: development', async () => {
  const fixtureName = 'development';
  const fixturePath = join(fixture_folder, fixtureName);
  const expectedPromise = readFileAsync(join(fixturePath, 'result.js'), 'utf8');
  const source = join(fixturePath, 'source', 'spec_1.js');

  const hexo = await sandbox(fixtureName);

  await expect(jsRender(source, hexo)).resolves.toBe(await expectedPromise);
});

test('webpack mode: production', async () => {
  const fixtureName = 'production';
  const fixturePath = join(fixture_folder, fixtureName);
  const expectedPromise = readFileAsync(join(fixturePath, 'result.js'), 'utf8');
  const source = join(fixturePath, 'source', 'spec_1.js');

  const hexo = await sandbox(fixtureName);

  await expect(jsRender(source, hexo)).resolves.toBe(await expectedPromise);
});

test('not exist entry', async () => {
  const fixtureName = 'development';
  const fixturePath = join(fixture_folder, fixtureName);
  const source = join(fixturePath, 'source', 'typo.js');

  const hexo = await sandbox(fixtureName);

  expect.assertions(1);
  await expect(jsRender(source, hexo)).rejects.toThrow('ENOENT');
});

test('webpack multi entry', async () => {
  const fixtureName = 'multi';
  const fixturePath = join(fixture_folder, fixtureName);

  const expectedsPromise = Promise.all([
    join(fixturePath, 'result_1.js'),
    join(fixturePath, 'result_2.js')
  ].map(path => readFileAsync(path, 'utf8')));

  const hexo = await sandbox(fixtureName);

  /** @type { Promise<string[]> } */
  const resultsPromise = Promise.all([
    join(fixturePath, 'source', 'spec_1.js'),
    join(fixturePath, 'source', 'spec_2.js')
  ].map(path => jsRender(path, hexo)));

  await expect(resultsPromise).resolves.toEqual(await expectedsPromise);
});
