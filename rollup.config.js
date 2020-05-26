import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';

export default {
  input: 'src/jsonview.js',
  output: {
    file: 'dist/jsonview.bundle.js',
    format: 'iife',
    name: 'JsonView',
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    scss({
      output: 'dist/jsonview.bundle.css',
    })
  ]
};
