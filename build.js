//const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');
const min = require('node-minify');
//const imagemin = require('imagemin');
//const imageminPngQuant = require('imagemin-pngquant');



fs.readdir('./src/engine', (err, files) => {

  files.forEach(file => {
    /*
    if (file === 'VectorEngine.ts') {
      fs.copyFileSync('./src/engine/' + file, './index.ts');
    }
    else */
    if (path.extname(file) === '.ts') {
      fs.copyFileSync('./src/engine/' + file, './' + path.basename(file));
    }
  });
});

fs.copyFileSync('./src/engine/VectorEngine.js', './lib/VectorEngine.js');
.copyFileSync('./src/engine/VectorEngine.js', './lib/VectorEngine.min.js');

/*
fs.readdir('./src/examples/helloworld', (err, files) => {
  files.forEach(file => {
    fs.copyFileSync('./src/examples/helloworld/' + file, './bin/' + path.basename(file));
  });
});
*/