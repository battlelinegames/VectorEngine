//const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');
const min = require('node-minify');
//const imagemin = require('imagemin');
//const imageminPngQuant = require('imagemin-pngquant');

fs.readdir('./src/engine', (err, files) => {
  files.forEach(file => {
    if (path.extname(file) === '.ts') {
      fs.copyFileSync('./src/engine/' + file, './dist/engine/' + path.basename(file));
    }
    if (path.extname(file) === '.js') {
      min.minify({
        compressor: 'gcc',
        input: './src/engine/VectorEngine.js',
        output: './dist/engine/VectorEngine.js',
        callback: () => { }
      })
    }
  });
});

