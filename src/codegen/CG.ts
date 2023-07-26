import { ComponentConfig } from 'src/codegen/ComponentConfig';
import { GenerateArray } from 'src/codegen/dataTypes/GenerateArray';
import { GenerateBoolean } from 'src/codegen/dataTypes/GenerateBoolean';
import { GenerateConst } from 'src/codegen/dataTypes/GenerateConst';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateFloat } from 'src/codegen/dataTypes/GenerateFloat';
import { GenerateImportedSymbol } from 'src/codegen/dataTypes/GenerateImportedSymbol';
import { GenerateInteger } from 'src/codegen/dataTypes/GenerateInteger';
import { GenerateKnownValue } from 'src/codegen/dataTypes/GenerateKnownValue';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import { GenerateString } from 'src/codegen/dataTypes/GenerateString';
import { GenerateTextResourceBinding } from 'src/codegen/dataTypes/GenerateTextResourceBinding';
import { GenerateUnion } from 'src/codegen/dataTypes/GenerateUnion';

export const CG = {
  component: ComponentConfig,

  // Scalars, types and expressions
  const: GenerateConst,
  expr: GenerateExpressionOr,
  str: GenerateString,
  bool: GenerateBoolean,
  int: GenerateInteger,
  float: GenerateFloat,
  arr: GenerateArray,

  // Shortcuts for common constant values
  null: new GenerateConst(null),
  true: new GenerateConst(true),
  false: new GenerateConst(false),

  // Objects and properties
  obj: GenerateObject,
  prop: GenerateProperty,
  trb: GenerateTextResourceBinding,

  // Known values that we have types for elsewhere, or other imported types
  known: GenerateKnownValue,
  import: GenerateImportedSymbol,

  // Others
  union: GenerateUnion,
};
