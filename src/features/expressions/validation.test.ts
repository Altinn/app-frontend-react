import { getSharedTests } from 'src/features/expressions/shared';
import { ExprValidation } from 'src/features/expressions/validation';
import type { ILayoutCollection } from 'src/layout/layout';

// TODO: Remove this function when no longer in use
function evalAllExpressions(_layouts: ILayoutCollection) {
  throw new Error('Not implemented');
  // const dataSources = getExpressionDataSourcesMock();
  // const nodes = generateEntireHierarchy(convertLayouts(layouts), Object.keys(layouts)[0], dataSources, getComponentDef);
  // for (const page of Object.values(nodes.all())) {
  //   for (const _node of page.flat()) {
  //     // ... Here we used to evaluate expressions in the node
  //   }
  // }
}

describe('Expression validation', () => {
  let originalLogError: typeof window.logError;

  beforeEach(() => {
    originalLogError = window.logError;
    window.logError = jest.fn();
  });

  afterEach(() => {
    window.logError = originalLogError;
  });

  describe('Shared tests for invalid expressions', () => {
    const invalidSharedTests = getSharedTests('invalid');
    it.each(invalidSharedTests.content)('$name', (invalid) => {
      expect(() => ExprValidation.throwIfInvalidNorScalar(invalid.expression)).toThrow(invalid.expectsFailure);
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
    ])('should validate %p as an invalid expression (non-throwing)', (maybeExpr) => {
      expect(ExprValidation.throwIfInvalidNorScalar(maybeExpr)).toBeUndefined();
    });
  });
});
