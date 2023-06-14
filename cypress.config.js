const { defineConfig } = require('cypress');
const path = require('node:path');
const fs = require('node:fs/promises');

// noinspection JSUnusedGlobalSymbols
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('after:spec', async (_spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'));
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            await fs.unlink(results.video);
          }
        }
      });

      const validEnvironments = ['local', 'at21', 'at22', 'tt02'];

      if (validEnvironments.includes(config.env.environment)) {
        return getConfigurationByFile(config.env.environment);
      }

      throw new Error(`Unknown environment "${config.env.environment}"
Valid environments are:
- ${validEnvironments.join('\n- ')}`);
    },
    specPattern: 'test/e2e/integration/',
    supportFile: 'test/e2e/support/index.ts',
  },
  fixturesFolder: 'test/e2e/fixtures',
  downloadsFolder: 'test/downloads',
  screenshotOnRunFailure: true,
  screenshotsFolder: 'test/screenshots',
  trashAssetsBeforeRuns: true,
  videosFolder: 'test/videos',
  videoUploadOnPasses: false,
  viewportHeight: 768,
  viewportWidth: 1536,
  requestTimeout: 20000,
  defaultCommandTimeout: 20000,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'test/reports/result-[hash].xml',
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
});

async function getConfigurationByFile(file) {
  const pathToJsonDataFile = path.resolve('test/e2e/config', `${file}.json`);
  return JSON.parse((await fs.readFile(pathToJsonDataFile)).toString());
}
