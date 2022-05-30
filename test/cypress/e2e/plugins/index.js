const path = require('node:path');
const fs = require('node:fs/promises');

async function getConfigurationByFile(file) {
  const pathToJsonDataFile = path.resolve('e2e/config', `${file}.json`);
  return JSON.parse((await fs.readFile(pathToJsonDataFile)).toString());
}

module.exports = (on, config) => {
  const validEnvironments = ['local', 'at21', 'at22', 'tt02'];

  if (validEnvironments.includes(config.env.environment)) {
    return getConfigurationByFile(config.env.environment);
  }

  throw new Error(`Unknown environment "${config.env.environment}"
Valid environments are:
- ${validEnvironments.join('\n- ')}`);
};
