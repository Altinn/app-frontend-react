import fs from 'fs';
import glob from 'glob';
import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import yargs from 'yargs';

const globPromise = promisify(glob);
const rimrafPromise = promisify(rimraf);
const readdirPromise = promisify(fs.readdir);

const argv = yargs(process.argv.slice(2)).options({
  'empty-only': { type: 'boolean', default: false },
}).argv;

async function deleteGenerated(): Promise<void> {
  try {
    const files: string[] = await globPromise(`${__dirname}/../layout/**/*generated*.*`, { nodir: true });
    for (const file of files) {
      const dir = path.dirname(file);
      if (argv['empty-only']) {
        const filesInDir = await readdirPromise(dir);
        // Filter out only files that do not contain '.generated' in their names
        const nonGeneratedFiles = filesInDir.filter((f) => !f.includes('.generated'));
        if (nonGeneratedFiles.length === 0) {
          // Only files with '.generated' are present
          await rimrafPromise(file);
          console.log(`Deleted '${file}' as its directory contains only generated files.`);
        }
      } else {
        await rimrafPromise(file);
        console.log(`Deleted '${file}'.`);
      }
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }
}
deleteGenerated();
