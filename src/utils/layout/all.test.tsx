/* eslint-disable no-console */
import React from 'react';

import { screen } from '@testing-library/react';
import layoutSchema from 'schemas/json/layout/layout.schema.v1.json';
import type { JSONSchema7 } from 'json-schema';

import { ensureAppsDirIsSet, getAllApps } from 'src/test/allApps';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import { NodesInternal } from 'src/utils/layout/NodesContext';

function TestApp() {
  const errors = NodesInternal.useFullErrorList();
  return <div data-testid='errors'>{JSON.stringify(errors)}</div>;
}

const windowLoggers = ['logError', 'logErrorOnce', 'logWarn', 'logWarnOnce', 'logInfo', 'logInfoOnce'];
const consoleLoggers = ['error', 'warn', 'log'];

describe('All known layout sets should evaluate as a hierarchy', () => {
  let hashWas: string;
  beforeAll(() => {
    window.forceNodePropertiesValidation = 'on';
    hashWas = window.location.hash.toString();
    for (const func of windowLoggers) {
      jest
        .spyOn(window, func as any)
        .mockImplementation(() => {})
        .mockName(`window.${func}`);
    }
    for (const func of consoleLoggers) {
      jest
        .spyOn(console, func as any)
        .mockImplementation(() => {})
        .mockName(`console.${func}`);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    window.forceNodePropertiesValidation = 'off';
    window.location.hash = hashWas;
    jest.restoreAllMocks();
  });

  const dir = ensureAppsDirIsSet();
  if (!dir) {
    return;
  }

  const allSets = getAllApps(dir)
    .filter((app) => app.isValid())
    .map((app) => app.enableCompatibilityMode().getLayoutSets())
    .flat()
    .filter((set) => set.isValid())
    .map((set) => ({ appName: set.app.getName(), setName: set.getName(), set }));

  const appsToSkip = ['multiple-datamodels-test'];
  const filteredSets = allSets.filter(
    ({ set }) => !appsToSkip.map((app) => set.app.getName().includes(app)).some((x) => x),
  );

  it.each(filteredSets)('$appName/$setName', async ({ set }) => {
    window.location.hash = set.simulateValidUrlHash();
    const [org, app] = set.app.getOrgApp();
    window.org = org;
    window.app = app;

    await renderWithInstanceAndLayout({
      renderer: () => <TestApp />,
      queries: {
        fetchLayoutSets: async () => set.getLayoutSetsAsOnlySet(),
        fetchLayouts: async () => set.getLayouts(),
        fetchLayoutSettings: async () => set.getSettings(),
        fetchApplicationMetadata: async () => set.app.getAppMetadata(),
        fetchFormData: async () => set.getModel().simulateDataModel(),
        fetchDataModelSchema: async () => set.getModel().getSchema(),
        fetchInstanceData: async () => set.simulateInstance(),
        fetchProcessState: async () => set.simulateProcess(),
        fetchLayoutSchema: async () => layoutSchema as unknown as JSONSchema7,
      },
      alwaysRouteToChildren: true,
    });

    // If errors are not found in the DOM, but there are errors in the loggers, output those instead
    let errors: any = {};
    let alwaysFail = false;
    try {
      const nodeErrors = (await screen.findByTestId('errors')).textContent;
      errors = JSON.parse(nodeErrors!);
      expect(typeof errors).toBe('object');
    } catch (err) {
      alwaysFail = err;
    }

    // Inject errors from console/window.logError into the full error list for this layout-set
    const devToolsLoggers = windowLoggers.map((func) => window[func] as jest.Mock);
    const browserLoggers = consoleLoggers.map((func) => console[func] as jest.Mock);
    for (const _mock of [...devToolsLoggers, ...browserLoggers]) {
      const mock = _mock as jest.Mock;
      const calls = filterAndCleanMockCalls(mock);
      if (calls.length) {
        errors[mock.getMockName()] = calls;
      }
    }

    expect(errors).toEqual({});
    expect(alwaysFail).toBe(false);
  });
});

const ignoreLogCalls = [
  'DEPRECATED: option jsPropertySyntax',
  'Warning: findDOMNode is deprecated and will be removed in the next major release',
  'The above error occurred in the',
];
function filterAndCleanMockCalls(mock: jest.Mock): string[] {
  return mock.mock.calls
    .map((_call) => {
      let shouldIgnore = false;
      const call = [..._call];
      for (const idx in call) {
        const arg = call[idx];
        if (!arg || shouldIgnore) {
          continue;
        }
        if (typeof arg === 'string') {
          shouldIgnore = ignoreLogCalls.some((remove) => arg.includes(remove));
          if (shouldIgnore) {
            continue;
          }

          // Remove line 2+ when string is an error with a full backtrace
          if (parseInt(idx, 10) > 0 && arg.match(/^\n\s+at /)) {
            call.length = parseInt(idx, 10) - 1;
            break;
          }
        }
        if (arg instanceof Error) {
          call[idx] = arg.message;
        }
      }

      if (shouldIgnore) {
        return undefined;
      }

      const out = call.filter((arg: any) => !!arg);
      if (out.length) {
        return out;
      }
      return undefined;
    })
    .filter((x) => x)
    .map((x: any[]) => x.join('\n'));
}
