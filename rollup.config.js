import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/jsonview.js',
  output: {
    file: 'dist/jsonview.js',
    format: 'iife',
    name: 'JsonView',
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    copy({
      targets: [
        { src: 'src/jsonview.css', dest: 'dist/' },
      ]
    })
  ]
};
