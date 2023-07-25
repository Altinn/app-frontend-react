import { ComponentConfig } from 'src/codegen/ComponentConfig';
import { GenerateArray } from 'src/codegen/dataTypes/GenerateArray';
import { GenerateBoolean } from 'src/codegen/dataTypes/GenerateBoolean';
import { GenerateConst } from 'src/codegen/dataTypes/GenerateConst';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateKnownValue } from 'src/codegen/dataTypes/GenerateKnownValue';
import { GenerateNumber } from 'src/codegen/dataTypes/GenerateNumber';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateString } from 'src/codegen/dataTypes/GenerateString';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';

export const CG = {
  newComponent: (...args: ConstructorParameters<typeof ComponentConfig>) => new ComponentConfig(...args),

  // Scalars, types and expressions
  const: (...args: ConstructorParameters<typeof GenerateConst>) => new GenerateConst(...args),
  expr: (...args: ConstructorParameters<typeof GenerateExpressionOr>) => new GenerateExpressionOr(...args),
  obj: (...args: ConstructorParameters<typeof GenerateObject>) => new GenerateObject(...args),
  str: (...args: ConstructorParameters<typeof GenerateString>) => new GenerateString(...args),
  bool: (...args: ConstructorParameters<typeof GenerateBoolean>) => new GenerateBoolean(...args),
  num: (...args: ConstructorParameters<typeof GenerateNumber>) => new GenerateNumber(...args),
  arr: (...args: ConstructorParameters<typeof GenerateArray>) => new GenerateArray(...args),

  // Known values that we have types for elsewhere, or other imported types
  known: (...args: ConstructorParameters<typeof GenerateKnownValue>) => new GenerateKnownValue(...args),
  import: (...args: ConstructorParameters<typeof GenerateImportedSymbol>) => new GenerateImportedSymbol(...args),

  // Others
  union: (...args: ConstructorParameters<typeof GenerateUnion>) => new GenerateUnion(...args),
};
