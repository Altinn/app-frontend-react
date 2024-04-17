import glob from 'glob';
import rimraf from 'rimraf';
import { promisify } from 'util';

const globPromise = promisify(glob);
const rimrafPromise = promisify(rimraf);

async function deleteGenerated(): Promise<void> {
  try {
    const files: string[] = await globPromise(`${__dirname}/../layout/**/*generated*.*`, { nodir: true });
    const deletePromises = files.map((file) => rimrafPromise(file));
    await Promise.all(deletePromises);
    console.log('Deleted files:', files);
  } catch (error) {
    console.error('Error deleting files:', error);
  }
}

deleteGenerated();
