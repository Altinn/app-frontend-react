// Exclude known errors and log messages we don't want to fail on
export const ignoredConsoleMessages = [
  /** @see window.CypressLog */
  /^CypressLog:/,

  // Webpack stuff
  /^\[webpack-dev-server]/,

  // React router v7 upgrade warnings
  /React Router Future Flag Warning.*?v7_startTransition/,
  /React Router Future Flag Warning.*?v7_relativeSplatPath/,
  /React Router Future Flag Warning.*?v7_fetcherPersist/,
  /React Router Future Flag Warning.*?v7_normalizeFormMethod/,
  /React Router Future Flag Warning.*?v7_partialHydration/,
  /React Router Future Flag Warning.*?v7_skipActionErrorRevalidation/,

  // This ia a bug we should fix, but it's not critical.
  /^FormProvider re-rendered/,

  // Warning from MUI, because we're stuck on an old version. Shows up in the Confirm task (in all-process-steps.ts).
  // Might be fixed after: https://github.com/Altinn/app-frontend-react/pull/2567
  /Warning: findDOMNode is deprecated and will be removed in the next major release/,

  // Bug when showing a Grid component
  // https://github.com/Altinn/app-frontend-react/issues/1851
  /Warning: validateDOMNesting.*?Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser/,
];
