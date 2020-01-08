const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const html = require('rollup-plugin-html')
const namedDirectory = require('rollup-plugin-named-directory')

const baseConfig = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/tv-navigation.js',
      format: 'umd',
      name: 'TVNavigation',
    },
  ],
  plugins: [
    commonjs(),
    resolve(),
    namedDirectory(),
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
    }),
    html(),
  ],
}

module.exports = { baseConfig }
