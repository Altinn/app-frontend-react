import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

import type { ILayoutFileExternal } from 'src/layout/common.generated';
import type { ILayouts } from 'src/layout/layout';
import type { ILayoutSets } from 'src/types';

interface AppLayoutSet {
  appName: string;
  setName: string;
  layouts: ILayouts;
  entireFiles: { [key: string]: unknown };
}

/**
 * Get all layout sets from all apps
 * This expects to be pointed to a directory containing all known apps, in a structure like that
 * created from:
 * @see https://github.com/olemartinorg/altinn-fetch-apps
 */
export function getAllLayoutSets(dir: string): AppLayoutSet[] {
  const out: AppLayoutSet[] = [];
  const apps = getAllApps(dir);
  for (const app of apps) {
    const sets = [{ set: 'layouts', plain: true }];
    try {
      const content = fs.readFileSync(path.join(dir, app, 'App/ui/layout-sets.json'));
      const layoutSets = JSON.parse(content.toString()) as ILayoutSets;
      sets.pop();

      for (const set of layoutSets.sets) {
        sets.push({ set: set.id, plain: false });
      }
    } catch (e) {
      // Intentionally empty
    }

    for (const set of sets) {
      const setPath = [dir, app, 'App/ui', set.set, set.plain ? '' : 'layouts'];
      let layoutFiles: string[] = [];
      try {
        layoutFiles = fs.readdirSync(path.join(...setPath));
      } catch (e) {
        continue;
      }

      const layouts: ILayouts = {};
      const entireFiles: { [key: string]: unknown } = {};
      for (const layoutFile of layoutFiles.filter((s) => !s.startsWith('.') && s.endsWith('.json'))) {
        const fileContent = fs.readFileSync(path.join(...setPath, layoutFile));
        const layoutContent = parseJsonTolerantly<ILayoutFileExternal>(fileContent.toString().trim());
        layouts[layoutFile.replace('.json', '')] = layoutContent.data.layout;
        entireFiles[layoutFile.replace('.json', '')] = layoutContent;
      }

      out.push({
        appName: app,
        setName: set.set,
        layouts,
        entireFiles,
      });
    }
  }

  return out;
}

/**
 * Get all apps, as a list of paths
 */
export function getAllApps(dir: string): string[] {
  const out: string[] = [];
  const apps = fs.readdirSync(dir);
  for (const app of apps) {
    if (app.startsWith('.')) {
      continue;
    }

    out.push(app);
  }

  return out;
}

/**
 * Utility function used to get the path to a directory containing all known apps.
 * Only call this from unit tests, and be sure to stop the test if it fails.
 */
export function ensureAppsDirIsSet(runVoidTest = true) {
  const env = dotenv.config();
  const dir = env.parsed?.ALTINN_ALL_APPS_DIR;
  if (!dir) {
    if (runVoidTest) {
      it('did not find any apps', () => {
        expect(true).toBeTruthy();
      });
    }

    console.warn(
      'ALTINN_ALL_APPS_DIR should be set, please create a .env file and point it to a directory containing all known apps',
    );
    return false;
  }

  return dir;
}

/**
 * Parse JSON that may contain comments, trailing commas, etc.
 */
export function parseJsonTolerantly<T = any>(content: string): T {
  // Remove multiline comments
  content = content.replace(/\/\*([\s\S]*?)\*\//g, '$1');

  // Remove single-line comments, but not in strings
  content = content.replace(/^(.*?)\/\/(.*)$/gm, (_, m1, m2) => {
    const quoteCount = m1.split(/(?<!\\)"/).length - 1;
    if (quoteCount % 2 === 0) {
      return m1;
    }

    return `${m1}//${m2}`;
  });

  // Remove trailing commas
  content = content.replace(/,\s*([\]}])/g, '$1');

  // Remove zero-width spaces, non-breaking spaces, etc.
  content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');

  try {
    return JSON.parse(content);
  } catch (e) {
    const position = e.message.match(/position (\d+)/);
    if (position) {
      const pos = parseInt(position[1], 10);
      const before = content.substring(0, pos);
      const line = before.split('\n').length;
      const column = before.split('\n').pop()?.length ?? 0;
      throw new Error(`${e.message} (line ${line}, column ${column})`);
    }

    throw new Error(`Failed to parse JSON: ${e.message}`);
  }
}
