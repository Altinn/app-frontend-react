import { ExprFunctionDefinitions } from 'src/features/expressions/expression-functions';
import { getSharedTests } from 'src/features/expressions/shared';
import { getComponentConfigs } from 'src/layout/components.generated';

describe('Shared function tests should exist', () => {
  const sharedTests = getSharedTests('functions');

  describe('DisplayValue tests', () => {
    const allTests = sharedTests?.content.find(({ folderName }) => folderName === 'displayValue')?.content;

    for (const [type, config] of Object.entries(getComponentConfigs())) {
      const hasTest = allTests?.find(({ expression, layouts, name }) => {
        const isCorrectFunction = expression?.[0] === 'displayValue';
        const targetComponent =
          isCorrectFunction &&
          Object.values(layouts ?? {}).find((layout) =>
            layout.data.layout.find((component) => component.id === expression?.[1] && component.type === type),
          );

        // Name ends with ` (filename.json)`
        const fileName = name.match(/.*\((.*)\)$/)?.[1];
        const isCorrectFileName = fileName === `type-${type}.json`;

        return isCorrectFunction && !!targetComponent && isCorrectFileName;
      });

      const func = config.def.getDisplayData.toString().replace(/\s/g, '');
      const emptyImplementation = /^\w+\(.*?\)\{return'';?}$/;
      const implementsDisplayData = !func.match(emptyImplementation);

      if (implementsDisplayData) {
        it(`Component '${type}' should have a matching test in functions/displayValue/type-${type}.json`, () => {
          expect(func).not.toMatch(emptyImplementation);
          expect(hasTest).toBeTruthy();
        });
      } else {
        it(`Component '${type}' should not have a matching test in functions/displayValue/type-${type}.json`, () => {
          expect(func).toMatch(emptyImplementation);
          expect(hasTest).toBeFalsy();
        });
      }
    }
  });

  describe('Function tests', () => {
    for (const exprFunc of Object.keys(ExprFunctionDefinitions)) {
      it(`Expression function ${exprFunc} should have a test folder`, () => {
        expect(
          sharedTests?.content.find(
            ({ folderName }) => folderName === exprFunc || folderName.startsWith(`${exprFunc}-`),
          ),
        ).toBeTruthy();
      });
    }
  });
});
