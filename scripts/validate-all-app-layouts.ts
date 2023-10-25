/* eslint-disable no-console */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const allAppsDir = process.env.ALTINN_ALL_APPS_DIR;

if (!allAppsDir) {
  console.error('Missing ALTINN_ALL_APPS_DIR in .env');
  process.exit(1);
}

import { createLayoutValidator, validateLayoutSet } from 'src/features/devtools/utils/layoutValidation';

function stripBOM(content: string) {
  content = content.toString();
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
}

/** PARSE LAYOUTS FROM APPS **/
const apps = fs.readdirSync(allAppsDir).filter((dir) => !dir.startsWith('.'));

const parseErrors: string[] = [];
const parseSuccess: string[] = [];
const findErrors: string[] = [];
const findSuccess: string[] = [];

const appLayouts = {};

for (const app of apps) {
  const appPath = path.join(allAppsDir, app);
  if (fs.existsSync(path.join(appPath, 'fetch-failed.txt'))) {
    continue;
  }

  const uiPath = path.join(appPath, 'App', 'ui');
  const hasLayoutSets = fs.existsSync(path.join(uiPath, 'layout-sets.json'));
  appLayouts[app] = {};
  try {
    if (hasLayoutSets) {
      const layoutSetFolders = fs
        .readdirSync(uiPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      for (const layoutSetId of layoutSetFolders) {
        appLayouts[app][layoutSetId] = {};
        const layoutFiles = fs
          .readdirSync(path.join(uiPath, layoutSetId, 'layouts'))
          .filter((file) => file.endsWith('.json'));

        for (const layoutFile of layoutFiles) {
          const layoutName = layoutFile.replace('.json', '');
          const layoutPath = path.join(uiPath, layoutSetId, 'layouts', layoutFile);

          try {
            appLayouts[app][layoutSetId][layoutName] = JSON.parse(
              stripBOM(fs.readFileSync(layoutPath, 'utf-8')),
            ).data.layout;
            parseSuccess.push(layoutPath);
          } catch {
            parseErrors.push(layoutPath);
          }
        }
      }
    } else {
      appLayouts[app]['formLayout'] = {};
      const hasSingleLayout = fs.existsSync(path.join(uiPath, 'FormLayout.json'));

      if (hasSingleLayout) {
        const layoutPath = path.join(uiPath, 'FormLayout.json');

        try {
          appLayouts[app]['formLayout']['FormLayout'] = JSON.parse(
            stripBOM(fs.readFileSync(layoutPath, 'utf-8')),
          ).data.layout;
          parseSuccess.push(layoutPath);
        } catch {
          parseErrors.push(layoutPath);
        }
      } else {
        const layoutFiles = fs.readdirSync(path.join(uiPath, 'layouts')).filter((file) => file.endsWith('.json'));

        for (const layoutFile of layoutFiles) {
          const layoutName = layoutFile.replace('.json', '');
          const layoutPath = path.join(uiPath, 'layouts', layoutFile);

          try {
            appLayouts[app]['formLayout'][layoutName] = JSON.parse(
              stripBOM(fs.readFileSync(layoutPath, 'utf-8')),
            ).data.layout;
            parseSuccess.push(layoutPath);
          } catch {
            parseErrors.push(layoutPath);
          }
        }
      }
    }
    findSuccess.push(app);
  } catch {
    findErrors.push(app);
  }
}

console.info(
  `Successfully found layouts in ${findSuccess.length} apps, failed to find layouts in ${findErrors.length} apps`,
);
console.info(`Successfully parsed ${parseSuccess.length} layouts, failed to parse ${parseErrors.length} layouts`);

/** VALIDATE LAYOUTS **/
const layoutSchema = JSON.parse(fs.readFileSync('schemas/json/layout/layout.schema.v1.json', 'utf-8'));

const validator = createLayoutValidator(layoutSchema);

const out = fs.openSync('all-app-layout-errors.txt', 'w');
for (const app of Object.keys(appLayouts)) {
  for (const layoutSetId of Object.keys(appLayouts[app])) {
    fs.writeSync(out, `Validating layouts for ${app}/${layoutSetId}\n\n`);
    const layouts = appLayouts[app][layoutSetId];
    const errorMessages = validateLayoutSet(layoutSetId, layouts, validator);
    for (const message of errorMessages) {
      fs.writeSync(out, `${message}\n\n`);
    }
  }
}
fs.closeSync(out);

console.info(`All layout errors were written to all-app-layout-errors.txt`);
