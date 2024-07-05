/* eslint-disable no-console */
import React from 'react';

import { screen } from '@testing-library/react';
import layoutSchema from 'schemas/json/layout/layout.schema.v1.json';
import type { JSONSchema7 } from 'json-schema';

import { ensureAppsDirIsSet, getAllApps } from 'src/test/allApps';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import { NodesInternal } from 'src/utils/layout/NodesContext';

// TODO: Also add assertions for layout validation (i.e. data model validation, layout schema validation)

function TestApp() {
  const errors = NodesInternal.useFullErrorList();
  return <div data-testid='errors'>{JSON.stringify(errors)}</div>;
}

describe('All known layout sets should evaluate as a hierarchy', () => {
  let hashWas: string;
  beforeAll(() => {
    window.forceNodePropertiesValidation = 'on';
    hashWas = window.location.hash.toString();
    jest
      .spyOn(window, 'logError')
      .mockImplementation(() => {})
      .mockName('window.logError');
    jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
      .mockName('console.error');
    jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {})
      .mockName('console.warn');
    jest
      .spyOn(console, 'log')
      .mockImplementation(() => {})
      .mockName('console.log');
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
  const filteredSets = allSets
    .filter(({ set }) => !appsToSkip.map((app) => set.app.getName().includes(app)).some((x) => x))
    .filter(({ set }) => set.getName() === 'rrh-form');

  it.each(filteredSets)('$appName/$setName', async ({ set }) => {
    // TODO: We should generate some sensible form data for repeating groups (and their nodes) to work, so that
    // we can test those as well. It could be as simple as analyzing the layout and generating a form data object
    // with one entry for each repeating group.

    window.location.hash = set.simulateValidUrlHash();
    await renderWithInstanceAndLayout({
      renderer: () => <TestApp />,
      queries: {
        fetchLayoutSets: async () => set.getLayoutSetsAsOnlySet(),
        fetchLayouts: async () => set.getLayouts(),
        fetchLayoutSettings: async () => set.getSettings(),
        fetchApplicationMetadata: async () => set.app.getAppMetadata(),
        fetchDataModelSchema: async () => set.getModelSchema(),
        fetchInstanceData: async () => set.simulateInstance(),
        fetchProcessState: async () => set.simulateProcess(),
        fetchLayoutSchema: async () => layoutSchema as unknown as JSONSchema7,
      },
      alwaysRouteToChildren: true,
    });

    const errors = JSON.parse((await screen.findByTestId('errors')).textContent!);
    expect(typeof errors).toBe('object');

    // Inject errors from console/window.logError into the full error list for this layout-set
    const ignoreLogCalls = [
      'DEPRECATED: option jsPropertySyntax',
      'Warning: findDOMNode is deprecated and will be removed in the next major release',
    ];
    function filterMock(mock: jest.Mock): unknown[] {
      return mock.mock.calls.filter((call) => {
        if (call[0] && typeof call[0] === 'string') {
          return !ignoreLogCalls.some((remove) => call[0].includes(remove));
        }
        return true;
      });
    }

    for (const _mock of [window.logError, console.error, console.warn, console.log]) {
      const mock = _mock as jest.Mock;
      const calls = filterMock(mock);
      if (calls.length) {
        errors[mock.getMockName()] = calls;
      }
    }

    expect(errors).toEqual({});
  });
});
