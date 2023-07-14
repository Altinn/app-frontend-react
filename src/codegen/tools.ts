import { ESLint } from 'eslint';
import fs from 'node:fs/promises';

export async function saveFile(targetPath: string, _content: string) {
  const content = `${_content.trim()}\n`;
  try {
    const fd = await fs.open(targetPath, 'r+');
    const existingContent = (await fd.readFile('utf-8')).toString();
    if (existingContent !== content) {
      console.log(`Regenerated ${targetPath}`);
      await fd.truncate(0);
      await fd.write(content, 0, 'utf-8');
    }
  } catch (e) {
    // File does not exist
    await fs.writeFile(targetPath, content, 'utf-8');
    console.log(`Created ${targetPath}`);
  }
}

async function fileExists(path: string) {
  try {
    await fs.stat(path);
    return true;
  } catch (e) {
    return false;
  }
}

export async function saveTsFile(targetPath: string, content: string) {
  if (!(await fileExists(targetPath))) {
    // For some reason eslint needs the file to exist before it can fix it, even if we're passing
    // the content directly to it.
    await fs.writeFile(targetPath, content, 'utf-8');
  }

  const eslint = new ESLint({
    fix: true,
    cache: true,
  });
  const results = await eslint.lintText(content, { filePath: targetPath });
  const output = results[0].output;

  if (!output && results[0].errorCount > 0) {
    console.error(`Error linting/fixing ${targetPath}:`);
    console.error(results[0].messages);
  }

  await saveFile(targetPath, output || content);
}
