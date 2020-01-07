
const { terser } = require('rollup-plugin-terser')

const { baseConfig } = require('./rollup.config.base')

const output = [
  ...baseConfig.output,
  ...[
    {
      file: 'dist/tv-navigation.min.js',
      format: 'umd',
      name: 'TVNavigation',
      plugins: [terser({ include: [/^.+\.min\.js$/] })],
    },
  ],
]

const plugins = [...baseConfig.plugins]

module.exports = {
  ...baseConfig,
  output,
  plugins,
}
