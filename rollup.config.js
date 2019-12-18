import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'TVNavigation',
    },
    {
      file: 'dist/tv-spatial-navigation.min.js',
      format: 'umd',
      name: 'TVNavigation',
    },
    {
      file: 'dist/tv-spatial-navigation.esm.js',
      format: 'es',
    },
  ],
  plugins: [
    flow(),
    babel({
      exclude: 'node_modules/**',
      externalHelpers: false,
    }),
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    uglify(),
  ],
};
