const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const html = require('rollup-plugin-html')
const namedDirectory = require('rollup-plugin-named-directory')

const baseConfig = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/directional-navigation.js',
      format: 'umd',
      name: 'TVNavigation',
    },
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
    }),
    commonjs(),
    resolve(),
    namedDirectory(),
    html(),
  ],
}

module.exports = { baseConfig }
