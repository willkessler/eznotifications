import { nodeResolve } from '@rollup/plugin-node-resolve';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import pkg from  'rollup-plugin-analyzer';

const { plugin: analyze } = pkg;

// Custom warning handler
const onwarn = (warning, warn) => {
  // Filter out "use client" warnings
  if (warning.message.includes('"use client"')) return;
  
  // For all other warnings, call the default Rollup warning handler
  warn(warning);
};

export default {
  input: 'src/index.tsx', // Your main TypeScript file
  external: ['react', 'react-dom', 'swr'],
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins:false,
    }),
    nodeResolve(), // Tells Rollup how to find node modules in node_modules
    commonjs(), // Converts CommonJS modules to ES6, so they can be included in a Rollup bundle
    typescript({ tsconfig: './tsconfig.json' }), // Compile TypeScript files
    analyze({summaryOnly: true}),
  ],
  onwarn, 
};
