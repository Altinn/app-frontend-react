import {
  evalExprInObj,
  LEDefaultsForComponent,
  LEDefaultsForGroup,
} from 'src/features/form/layout/expressions/index';
import { getSharedTests } from 'src/features/form/layout/expressions/shared';
import {
  asLayoutExpression,
  preProcessLayout,
} from 'src/features/form/layout/expressions/validation';
import { nodesInLayout } from 'src/utils/layout/hierarchy';
import type { IRepeatingGroups } from 'src/types';

describe('Layout expression validation', () => {
  describe('Shared tests for invalid expressions', () => {
    const invalidSharedTests = getSharedTests('invalid');
    it.each(invalidSharedTests.content)('$name', (invalid) => {
      expect(() => asLayoutExpression(invalid.expression)).toThrow(
        invalid.expectsFailure,
      );
    });
  });

  describe('Shared tests for layout preprocessor', () => {
    const tests = getSharedTests('layout-preprocessor');
    it.each(tests.content)('$name', (t) => {
      const warningsExpected = t.expectsWarnings || [];
      const logSpy = jest.spyOn(console, 'log');
      if (warningsExpected.length > 0) {
        logSpy.mockImplementation(() => {
          return undefined;
        });
      }

      const result: typeof tests['content'][number]['layouts'] = {};
      for (const page of Object.keys(t.layouts)) {
        const layout = t.layouts[page].data.layout;
        preProcessLayout(layout);
        result[page] = {
          $schema: t.layouts[page].$schema,
          data: { layout },
        };
      }

      expect(result).toEqual(t.expects);

      // Runs all the expressions inside the layout. This is done so that we have shared tests that make sure to
      // check that evaluating expressions in a component/node context works (i.e. that "triggers": ["validation"]
      // is not interpreted as a layout expression).
      for (const page of Object.values(result)) {
        const repeatingGroups: IRepeatingGroups = {};
        for (const component of page.data.layout) {
          if (component.type === 'Group' && component.maxCount > 1) {
            repeatingGroups[component.id] = {
              index: 1,
              editIndex: -1,
            };
            for (const child of component.children) {
              const childElm = page.data.layout.find((c) => c.id === child);
              if (
                childElm &&
                childElm.type === 'Group' &&
                childElm.maxCount > 1
              ) {
                repeatingGroups[`${childElm.id}-0`] = {
                  index: 1,
                  editIndex: -1,
                };
              }
            }
          }
        }

        const nodes = nodesInLayout(page.data.layout, repeatingGroups);
        for (const node of nodes.flat(true)) {
          evalExprInObj({
            input: node.item,
            defaults: {
              ...LEDefaultsForComponent,
              ...LEDefaultsForGroup,
            },
            node,
            dataSources: {
              formData: {},
              applicationSettings: {} as any,
              instanceContext: {} as any,
            },
          });
        }
      }

      const warningsFound = [];
      for (const call of logSpy.mock.calls) {
        for (const warning of warningsExpected) {
          if ((call[0] as string).includes(`%c${warning}%c`)) {
            warningsFound.push(warning);
          }
        }
      }
      expect(warningsFound.sort()).toEqual(warningsExpected.sort());

      logSpy.mockRestore();
    });
  });

  describe('Some values/objects should not validate', () => {
    it.each([
      '',
      null,
      false,
      undefined,
      5,
      new Date(),
      {},
      { hello: 'world' },
      { expr: 'hello world' },
      { expr: '5 == 5', and: 'other property' },
    ])(
      'should validate %p as an invalid expression (non-throwing)',
      (maybeExpr) => {
        expect(asLayoutExpression(maybeExpr)).toBeUndefined();
      },
    );
  });
});
