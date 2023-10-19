/* eslint-disable no-console */
const fs = require('fs');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}
fs.cpSync('schemas', 'dist/schemas', { recursive: true });
console.log('Copied schemas to dist/');
