// rollup.config.js
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/engine/VectorEngine.js',
  output: [
    {
      file: 'lib/VectorEngine.min.js',
      format: 'es',
      plugins: [terser()]
    },
    {
      file: 'lib/VectorEngine.js',
      format: 'es'
    },
  ]
};