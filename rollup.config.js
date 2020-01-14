
const { terser } = require('rollup-plugin-terser')

const { baseConfig } = require('./rollup.config.base')

const output = [
  ...baseConfig.output,
  ...[
    {
      file: 'dist/directional-navigation.min.js',
      format: 'umd',
      name: 'TVNavigation',
      plugins: [terser({ include: [/^.+\.min\.js$/] })],
    },
    {
      file: 'dist/directional-navigation.esm.js',
      format: 'esm',
    },
  ],
]

const plugins = [...baseConfig.plugins]

module.exports = {
  ...baseConfig,
  output,
  plugins,
}
