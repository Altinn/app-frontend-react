import Ajv from 'ajv';
import expressionSchema from 'schemas/json/layout/expression.schema.v1.json';

import { ExprFunctions } from 'src/features/expressions/index';
import { ExprVal } from 'src/features/expressions/types';
import type { FuncDef } from 'src/features/expressions/types';

type Func = { name: string } & FuncDef<ExprVal[], ExprVal>;

describe('expression schema tests', () => {
  const functions: Func[] = [];
  for (const name of Object.keys(ExprFunctions)) {
    const func = ExprFunctions[name];
    functions.push({ name, ...func });
  }

  it.each(functions)(
    '$name should have a valid func-$name definition',
    ({ name, args, minArguments, returns, lastArgSpreads }) => {
      if (name === 'if') {
        // if is a special case, we'll skip it here
        return;
      }

      expect(expressionSchema.definitions[`func-${name}`]).toBeDefined();
      expect(expressionSchema.definitions[`func-${name}`].type).toBe('array');
      expect(expressionSchema.definitions[`func-${name}`].items[0]).toEqual({ const: name });

      if (returns === ExprVal.Any) {
        // At least one of the definitions should be a match
        const allTypes: any[] = [];
        for (const type of ['number', 'string', 'boolean']) {
          allTypes.push(...expressionSchema.definitions[`strict-${type}`].oneOf);
        }
        expect(allTypes).toContainEqual({
          $ref: `#/definitions/func-${name}`,
        });
      } else {
        const returnString = exprValToString(returns);
        expect(expressionSchema.definitions[`strict-${returnString}`].oneOf).toContainEqual({
          $ref: `#/definitions/func-${name}`,
        });
      }

      if (minArguments === undefined) {
        expect(expressionSchema.definitions[`func-${name}`].items.length).toBe(args.length + 1);
      } else {
        expect(expressionSchema.definitions[`func-${name}`].items.length).toBeGreaterThanOrEqual(minArguments + 1);
      }

      if (lastArgSpreads) {
        const lastArg = args[args.length - 1];
        expect(expressionSchema.definitions[`func-${name}`].additionalItems).toEqual({ $ref: exprValToDef(lastArg) });
      } else {
        expect(expressionSchema.definitions[`func-${name}`].additionalItems).toBeUndefined();
      }
    },
  );

  const ajv = new Ajv({ strict: false });
  const validate = ajv.compile(expressionSchema);

  it.each(functions)(
    '$name should validate against generated function calls',
    ({ name, args, minArguments, lastArgSpreads }) => {
      if (name === 'if') {
        // if is a special case, we'll skip it here
        return;
      }

      const funcDef = expressionSchema.definitions[`func-${name}`];

      // With exactly the right number of arguments
      const funcCall = [name, ...args.map(exprValToString)];
      if (lastArgSpreads) {
        funcCall.push(...args.map(exprValToString));
      }

      // Use enum value, if defined in schema
      for (let i = 0; i < args.length; i++) {
        const argDef = funcDef.items.length > i + 1 ? funcDef.items[i + 1] : undefined;
        if (argDef?.enum) {
          funcCall[i + 1] = argDef.enum[0];
        }
      }

      const valid = validate(funcCall);
      expect(validate.errors).toEqual(null);
      expect(valid).toBe(true);

      // With too few arguments
      if (minArguments !== 0 && args.length !== 0) {
        const funcCall = [name];
        const valid = validate(funcCall);

        // This always validates, because the schema allows for less than the minimum number of arguments. If it didn't,
        // you wouldn't get autocomplete for functions until you had the minimum number of arguments, which makes for
        // a bad developer experience. We test this explicitly below, even though is does not seem to be the desired
        // behavior.
        expect(validate.errors).toEqual(null);
        expect(valid).toBe(true);
      }

      // With too many arguments
      if (lastArgSpreads) {
        const funcCall = [name, ...args.map(exprValToString), 'extra'];
        const valid = validate(funcCall);

        // This also always validates, because the schema allows for more than the maximum number of arguments, for the
        // same reason as above.
        expect(validate.errors).toEqual(null);
        expect(valid).toBe(true);
      }
    },
  );
});

function exprValToString(val: ExprVal): string {
  return val.toString().replaceAll('_', '');
}

function exprValToDef(val: ExprVal): string {
  return `#/definitions/${exprValToString(val)}`;
}
