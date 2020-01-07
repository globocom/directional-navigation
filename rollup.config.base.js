const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const flow = require('rollup-plugin-flow')

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
    flow(),
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
    }),
    commonjs(),
    resolve(),
  ],
}

module.exports = { baseConfig }
