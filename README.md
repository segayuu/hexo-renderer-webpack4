# hexo-renderer-webpack4
[![Build Status](https://travis-ci.com/segayuu/hexo-renderer-webpack4.svg?branch=master)](https://travis-ci.com/segayuu/hexo-renderer-webpack4)

\[PREVIEW\] hexo plugin renderer webpack version 4.
from https://github.com/briangonzalez/hexo-renderer-webpack

## Install

```shell
$ npm install hexo-renderer-webpack4 --save
```

## Options

You can configure this plugin in `_config.yml` or your theme's `_config.yml`.

``` yaml
webpack:
  entry: 'themes/my-theme/source/js/app.js'
```

or

``` yaml
webpack:
  entry:
    - 'themes/my-theme/source/js/app.js'
    - 'themes/my-theme/source/js/lib.js'
```
