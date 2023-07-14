import { ComponentConfig } from 'src/codegen/ComponentConfig';
import { GenerateConst } from 'src/codegen/dataTypes/GenerateConst';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateKnownValue } from 'src/codegen/dataTypes/GenerateKnownValue';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateString } from 'src/codegen/dataTypes/GenerateString';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';

export const CG = {
  newComponent: (...args: ConstructorParameters<typeof ComponentConfig>) => new ComponentConfig(...args),

  // Scalars and expressions
  const: (...args: ConstructorParameters<typeof GenerateConst>) => new GenerateConst(...args),
  expr: (...args: ConstructorParameters<typeof GenerateExpressionOr>) => new GenerateExpressionOr(...args),
  obj: (...args: ConstructorParameters<typeof GenerateObject>) => new GenerateObject(...args),
  str: (...args: ConstructorParameters<typeof GenerateString>) => new GenerateString(...args),

  // Known values that we have types for elsewhere
  known: (...args: ConstructorParameters<typeof GenerateKnownValue>) => new GenerateKnownValue(...args),

  // Others
  union: (...args: ConstructorParameters<typeof GenerateUnion>) => new GenerateUnion(...args),
};
