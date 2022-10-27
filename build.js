const fs = require('fs');
const ZIP = require('jszip');
const path = require('path');
const zip = new ZIP();

const ignore_folder = ['.git', '.vscode', 'node_modules'];
const ignore_file = ['.env', '.eslintrc', '.gitignore', 'README.md', 'test.js', 'build.js', 'Ringon.zip'];

/**
 * @param {string} root
 */
function add_zip(root) {
  console.log(`zipping ${root}`);
  const dir_list = fs.readdirSync(root, { withFileTypes: true });

  dir_list
    .filter(dir => dir.isFile() && !ignore_file.includes(dir.name))
    .forEach(dir => {
      const file = path.join(root, dir.name);
      zip.file(file, fs.readFileSync(file));
    });

  dir_list
    .filter(dir => dir.isDirectory() && !ignore_folder.includes(dir.name))
    .forEach(dir => add_zip(path.join(root, dir.name)));

  return zip;
}

add_zip('.')
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  .pipe(fs.createWriteStream('Ringon.zip'))
  .on('finish', () => {
    console.log('Done!');
  });
