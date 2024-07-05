import dotenv from 'dotenv';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import type { JSONSchema7 } from 'json-schema';

import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { getProcessDataMock } from 'src/__mocks__/getProcessDataMock';
import { MINIMUM_APPLICATION_VERSION } from 'src/features/applicationMetadata/minVersion';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { ILayoutFile, ILayoutSet, ILayoutSets, ILayoutSettings } from 'src/layout/common.generated';
import type { ILayoutCollection } from 'src/layout/layout';
import type { IInstance, IProcess } from 'src/types/shared';

export class ExternalApp {
  private compat = false;
  constructor(private rootDir: string) {}

  getName() {
    return path.basename(this.rootDir);
  }

  private readFile(path: string) {
    return fs.readFileSync(this.rootDir + path, 'utf-8').toString();
  }

  private readJson<T>(path: string) {
    return parseJsonTolerantly<T>(this.readFile(path));
  }

  private fileExists(path: string) {
    try {
      fs.accessSync(this.rootDir + path, fs.constants.R_OK);
      return true;
    } catch (_err) {
      return false;
    }
  }

  private dirExists(path: string) {
    try {
      return fs.statSync(this.rootDir + path).isDirectory();
    } catch (_err) {
      return false;
    }
  }

  private readDir(path: string) {
    return fs.readdirSync(this.rootDir + path);
  }

  isValid(): boolean {
    if (!this.dirExists('/App')) {
      return false;
    }
    if (!this.fileExists('/App/config/applicationmetadata.json')) {
      return false;
    }
    if (!this.fileExists('/App/views/Home/Index.cshtml')) {
      return false;
    }
    if (!this.fileExists('/App/ui/layout-sets.json')) {
      return false;
    }

    const indexFile = this.readFile('/App/views/Home/Index.cshtml');
    return !!indexFile.match(/altinn-app-frontend\/4.*?\/altinn-app-frontend\.js/);
  }

  isValidLayoutSet(setId: string): boolean {
    if (!this.dirExists(`/App/ui/${setId}/layouts`)) {
      return false;
    }
    return this.fileExists(`/App/ui/${setId}/Settings.json`);
  }

  /**
   * Enabling this will overwrite some of the application config in order to allow tests to run this app without
   * having to deal with intricacies like:
   *  1. No stateless support, all layout-sets assume you have an instance. Unless the layout-set
   *     specifies something else, the process data will be at Task_1.
   *  2. All party types are allowed, no party selection
   *  3. No instance selection on entry
   */
  enableCompatibilityMode() {
    this.compat = true;
    return this;
  }

  getAppMetadata(): IApplicationMetadata {
    const appMetaData = this.readJson<IApplicationMetadata>('/App/config/applicationmetadata.json');
    if (this.compat) {
      appMetaData.altinnNugetVersion = MINIMUM_APPLICATION_VERSION.build;
      appMetaData.partyTypesAllowed = {
        subUnit: true,
        person: true,
        bankruptcyEstate: true,
        organisation: true,
      };

      // We delete this for multiple reasons:
      // 1. When testing, we don't want to end up in instance selection
      // 2. We pretend stateless isn't a thing. If apps are considered stateless, we can end up with useNavigatePage()
      //    redirecting us to a page we didn't want.
      appMetaData.onEntry = undefined;
    }
    return appMetaData;
  }

  getRawLayoutSets(): ILayoutSets {
    const layoutSets = this.readJson<ILayoutSets>('/App/ui/layout-sets.json');

    if (this.compat) {
      for (const set of Object.values(layoutSets.sets)) {
        set.tasks = ['Task_1'];
      }
    }

    return layoutSets;
  }

  getLayoutSets(): ExternalAppLayoutSet[] {
    const raw = this.getRawLayoutSets();
    return raw.sets.map((set) => new ExternalAppLayoutSet(this, set.id, set));
  }

  getLayoutSet(setId: string): ILayoutCollection {
    const layoutsDir = `/App/ui/${setId}/layouts`;
    if (!this.dirExists(layoutsDir)) {
      throw new Error(`Layout set '${setId}' folder not found`);
    }

    const collection: ILayoutCollection = {};
    for (const file of this.readDir(layoutsDir)) {
      if (!file.endsWith('.json')) {
        continue;
      }

      collection[file.replace('.json', '')] = this.readJson<ILayoutFile>(`${layoutsDir}/${file}`);
    }

    return collection;
  }

  getLayoutSetSettings(setId: string): ILayoutSettings {
    const settingsFile = `/App/ui/${setId}/Settings.json`;
    if (!this.fileExists(settingsFile)) {
      throw new Error(`Layout set '${setId}' settings file not found`);
    }

    return this.readJson<ILayoutSettings>(settingsFile);
  }

  getModelSchema(dataType: string): JSONSchema7 {
    const schemaFile = `/App/models/${dataType}.schema.json`;
    if (!this.fileExists(schemaFile)) {
      throw new Error(`Model schema '${dataType}' file not found`);
    }

    return this.readJson<JSONSchema7>(schemaFile);
  }
}

export class ExternalAppLayoutSet {
  constructor(
    public readonly app: ExternalApp,
    private id: string,
    private config: ILayoutSet,
  ) {}

  getName() {
    return this.id;
  }

  isValid(): boolean {
    // A layout-set must have a dataType to be valid, and that dataType must be in applicationmetadata
    if (!this.config.dataType) {
      return false;
    }

    if (!this.app.isValidLayoutSet(this.id)) {
      return false;
    }

    const metadata = this.app.getAppMetadata();
    return !!metadata?.dataTypes.find((element) => element.id === this.config.dataType);
  }

  /**
   * Returns the same as getRawLayoutSets() on the app, but pretends this layout-set is the only one
   */
  getLayoutSetsAsOnlySet(): ILayoutSets {
    const full = this.app.getRawLayoutSets();
    full.sets = [this.config];
    return full;
  }

  getLayouts() {
    return this.app.getLayoutSet(this.id);
  }

  getSettings() {
    return this.app.getLayoutSetSettings(this.id);
  }

  getModelSchema() {
    return this.app.getModelSchema(this.config.dataType);
  }

  simulateInstance(): IInstance {
    return getInstanceDataMock((i) => {
      assert(i.data[0].dataType === 'test-data-model');
      i.data[0].dataType = this.config.dataType;
    });
  }

  simulateProcess(): IProcess {
    return getProcessDataMock();
  }

  simulateValidUrlHash(): string {
    const instance = getInstanceDataMock();
    const firstPage = this.getSettings().pages.order[0];
    return `#/instance/${instance.instanceOwner.partyId}/${instance.id}/Task_1/${firstPage}`;
  }
}

/**
 * Get all apps, as a list of paths
 */
export function getAllApps(dir: string): ExternalApp[] {
  const out: ExternalApp[] = [];
  const apps = fs.readdirSync(dir);
  for (const app of apps) {
    if (app.startsWith('.')) {
      continue;
    }

    out.push(new ExternalApp(path.join(dir, app)));
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
