interface DebugConfig {
  displayState?: boolean;
  logDuration?: boolean;
  logStages?: boolean;
}

const debugAll = false;
export const GeneratorDebug: DebugConfig = {
  displayState: debugAll,
  logDuration: debugAll || true,
  logStages: debugAll || true,
};

export const generatorLog = (logType: keyof DebugConfig, ...messages: unknown[]) => {
  if (GeneratorDebug[logType]) {
    // eslint-disable-next-line no-console
    console.log('Node generator:', ...messages);
  }
};
