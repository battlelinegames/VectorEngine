const fs = require('fs');
const path = require('path');
const min = require('node-minify');



fs.readdir('./src/engine', (err, files) => {

  files.forEach(file => {
    if (path.extname(file) === '.ts') {
      fs.copyFileSync('./src/engine/' + file, './' + path.basename(file));
    }
  });
});

fs.copyFileSync('./src/engine/VectorEngine.js', './lib/VectorEngine.js');
fs.copyFileSync('./src/engine/VectorEngine.js', './lib/VectorEngine.min.js');
