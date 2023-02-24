const { defineConfig } = require('cypress');
const path = require('node:path');
const fs = require('node:fs/promises');
const codeCoverage = require('@cypress/code-coverage/task');

// noinspection JSUnusedGlobalSymbols
module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      const validEnvironments = ['local', 'at21', 'at22', 'tt02'];

      if (validEnvironments.includes(config.env.environment)) {
        await getConfigurationByFile(config);
        codeCoverage(on, config);
        return config;
      }

      throw new Error(`Unknown environment "${config.env.environment}"
Valid environments are:
- ${validEnvironments.join('\n- ')}`);
    },
    specPattern: 'test/e2e/integration/',
    supportFile: 'test/e2e/support/index.ts',
  },
  video: false,
  fixturesFolder: 'test/e2e/fixtures',
  downloadsFolder: 'test/downloads',
  screenshotOnRunFailure: true,
  screenshotsFolder: 'test/screenshots',
  trashAssetsBeforeRuns: true,
  videosFolder: 'test/videos',
  viewportHeight: 768,
  viewportWidth: 1536,
  requestTimeout: 10000,
  defaultCommandTimeout: 8000,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'test/reports/result-[hash].xml',
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
});

async function getConfigurationByFile(config) {
  const file = config.env.environment;
  const pathToJsonDataFile = path.resolve('test/e2e/config', `${file}.json`);
  const newConfig = JSON.parse((await fs.readFile(pathToJsonDataFile)).toString());

  for (const key of Object.keys(newConfig)) {
    if (key === 'env') {
      for (const [key2, val] of Object.entries(newConfig[key])) {
        config.env[key2] = val;
      }
    } else if (key !== '$schema') {
      config[key] = newConfig[key];
    }
  }
}
