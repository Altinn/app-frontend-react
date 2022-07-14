import { runCommand, getEnvVariableOrExit } from './utils.mjs';

const init = async () => {
  const appFrontendPath = getEnvVariableOrExit('APP_FRONTEND_PATH');

  await runCommand('yarn --immutable', { cwd: `${appFrontendPath}/src` });
  await runCommand('yarn start --no-hot', { cwd: `${appFrontendPath}/src/altinn-app-frontend` });
};

init();
