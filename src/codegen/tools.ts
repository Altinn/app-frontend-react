import fs from 'node:fs';

export function saveFile(targetPath: string, _content: string) {
  const content = `${_content.trim()}\n`;
  try {
    const fd = fs.openSync(targetPath, 'r+');
    const existingContent = fs.readFileSync(fd, 'utf-8').toString();
    if (existingContent !== content) {
      console.log(`Regenerated ${targetPath}`);
      fs.ftruncateSync(fd, 0);
      fs.writeSync(fd, content, 0, 'utf-8');
    }
  } catch (e) {
    // File does not exist
    const fd = fs.openSync(targetPath, 'w');
    console.log(`Created ${targetPath}`);
    fs.writeFileSync(fd, content, 'utf-8');
  }
}
