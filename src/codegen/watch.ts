import { watch } from 'chokidar';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

class CodeGenWatcher {
  private isGenerating = false;
  private pendingRegeneration = false;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 300;
  private runtime: 'bun' | 'tsx' = 'tsx';

  private async detectRuntime(): Promise<void> {
    this.runtime = (process.env.RUNTIME as 'bun' | 'tsx') || 'tsx';
  }

  private async findWatchFiles(): Promise<string[]> {
    const files: string[] = [];

    const walkDirectory = async (dir: string, filter: (file: string, isDirectory: boolean) => boolean) => {
      try {
        const entries = await fs.readdir(dir);
        for (const entry of entries) {
          const entryPath = path.join(dir, entry);
          const stat = await fs.stat(entryPath);

          if (stat.isDirectory()) {
            if (filter(entry, true)) {
              await walkDirectory(entryPath, filter);
            }
          } else if (filter(entry, false)) {
            files.push(entryPath);
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    };

    await walkDirectory('src/layout', (file, isDir) => isDir || file === 'config.ts');
    await walkDirectory(
      'src/codegen',
      (file, isDir) => isDir || (file.endsWith('.ts') && !file.includes('.generated.')),
    );

    return files;
  }

  async start() {
    await this.detectRuntime();

    const watchFiles = await this.findWatchFiles();
    const watcher = watch(watchFiles, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      this.scheduleRegeneration();
    });

    watcher.on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      this.scheduleRegeneration();
    });

    watcher.on('unlink', (filePath) => {
      console.log(`File removed: ${filePath}`);
      this.scheduleRegeneration();
    });

    watcher.on('error', (error) => {
      console.error('Watcher error:', error);
    });

    watcher.on('ready', () => {
      console.log(`Watching ${watchFiles.length} files for code generation... Press Ctrl+C to stop`);
      this.runCodegen();
    });

    process.on('SIGINT', () => {
      console.log('\nStopping watch mode...');
      watcher.close();
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      process.exit(0);
    });
  }

  private scheduleRegeneration() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.runCodegen();
    }, this.DEBOUNCE_MS);
  }

  private async runCodegen() {
    if (this.isGenerating) {
      this.pendingRegeneration = true;
      return;
    }

    this.isGenerating = true;
    this.pendingRegeneration = false;

    try {
      await this.executeCodegen();

      if (this.pendingRegeneration) {
        console.log('Running codegen again due to changes during generation...');
        setTimeout(() => this.runCodegen(), 100);
      }
    } finally {
      this.isGenerating = false;
    }
  }

  private async executeCodegen(): Promise<void> {
    return new Promise((resolve) => {
      const child = spawn(this.runtime, ['src/codegen/run.ts'], {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          if (stdout.trim()) {
            console.log(stdout.trim());
          }
        } else {
          console.log(`Code generation failed (exit code: ${code})`);

          const errorOutput = stderr || stdout;

          if (errorOutput.includes('SyntaxError')) {
            const syntaxErrorMatch = errorOutput.match(/SyntaxError: (.+)/);
            const fileMatch = errorOutput.match(/at (.+\.ts):(\d+):(\d+)/);

            if (syntaxErrorMatch && fileMatch) {
              const [, errorMsg] = syntaxErrorMatch;
              const [, fileName, line, column] = fileMatch;
              console.log(`Syntax error in ${path.relative(process.cwd(), fileName)}:${line}:${column}`);
              console.log(`   ${errorMsg}`);
              console.log('   Fix the syntax error and save the file to retry generation.');
            } else {
              console.log('Code generation cannot work while there are syntax errors in source files.');
              if (errorOutput.trim()) {
                console.log('Error details:');
                console.log(errorOutput.trim());
              }
            }
          } else {
            console.log('Error output:');
            console.log(errorOutput.trim());
          }
        }

        resolve();
      });

      child.on('error', (error) => {
        console.error('Failed to start code generation:', error.message);
        resolve();
      });
    });
  }
}

const watcher = new CodeGenWatcher();
watcher.start().catch((error) => {
  console.error('Failed to start codegen watcher:', error);
  process.exit(1);
});
