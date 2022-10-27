const fs = require('fs');
const ZIP = require('jszip');
const path = require('path');

const ignore_folder = ['.git', '.vscode', 'node_modules'];
const ignore_file = ['.eslintrc', '.gitignore', 'README.md', 'test.js', 'build.js', 'Ringon.zip'];

/**
 * @param {ZIP} zip
 * @param {string} path_
 */
function add_zip(zip, path_) {
  console.log(`zipping ${path_}`);
  const dir_list = fs.readdirSync(path_, { withFileTypes: true });

  dir_list
    .filter(dir => dir.isFile() && !ignore_file.includes(dir.name))
    .forEach(dir => {
      const file = path.join(path_, dir.name);
      zip.file(dir.name, fs.readFileSync(file));
    });

  dir_list
    .filter(dir => dir.isDirectory() && !ignore_folder.includes(dir.name))
    .forEach(dir => add_zip(zip.folder(dir.name), path.join(path_, dir.name)));

  return zip;
}

add_zip(new ZIP(), '.')
  .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  .then((content) => { fs.writeFileSync('Ringon.zip', content); });
