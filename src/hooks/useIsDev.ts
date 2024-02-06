const devHostNames = [
  /^local\.altinn\.cloud$/,
  /^dev\.altinn\.studio$/,
  /^altinn\.studio$/,
  /^studio\.localhost$/,
  /^\S+\.apps\.tt02\.altinn\.no$/,
];

export function useIsDev(): boolean {
  return devHostNames.some((host) => host.test(window.location.hostname));
}

export function useIsLocalTest(): boolean {
  return /^local\.altinn\.cloud$/.test(window.location.hostname);
}
