import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';

import { CG } from 'src/codegen/CG';
import { DescribableCodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { ExprVal } from 'src/features/expressions/types';
import type { GenerateBoolean } from 'src/codegen/dataTypes/GenerateBoolean';
import type { GenerateFloat } from 'src/codegen/dataTypes/GenerateFloat';
import type { GenerateString } from 'src/codegen/dataTypes/GenerateString';

const toTsMap: { [key in ExprVal]: string } = {
  [ExprVal.Any]: 'ExprVal.Any',
  [ExprVal.Boolean]: 'ExprVal.Boolean',
  [ExprVal.Number]: 'ExprVal.Number',
  [ExprVal.String]: 'ExprVal.String',
};

// TODO: Use references to the real expression schema
const toSchemaMap: { [key in ExprVal]: JSONSchema7 } = {
  [ExprVal.Any]: { $ref: '#/definitions/ExprVal.Any' },
  [ExprVal.Boolean]: { $ref: '#/definitions/ExprVal.Boolean' },
  [ExprVal.Number]: { $ref: '#/definitions/ExprVal.Number' },
  [ExprVal.String]: { $ref: '#/definitions/ExprVal.String' },
};

type TypeMap<Val extends ExprVal> = Val extends ExprVal.Boolean
  ? boolean
  : Val extends ExprVal.Number
  ? number
  : Val extends ExprVal.String
  ? string
  : never;

type GeneratorMap<Val extends ExprVal> = Val extends ExprVal.Boolean
  ? GenerateBoolean
  : Val extends ExprVal.Number
  ? GenerateFloat
  : Val extends ExprVal.String
  ? GenerateString
  : never;

export class GenerateExpressionOr<Val extends ExprVal> extends DescribableCodeGenerator<TypeMap<Val>> {
  constructor(public readonly valueType: Val) {
    super();
  }

  public getTargetType(): GeneratorMap<Val> {
    let out: GeneratorMap<Val> | undefined;
    if (this.valueType === ExprVal.Boolean) {
      out = new CG.bool() as GeneratorMap<Val>;
    }
    if (this.valueType === ExprVal.Number) {
      out = new CG.float() as GeneratorMap<Val>; // Represents any number in TypeScript
    }
    if (this.valueType === ExprVal.String) {
      out = new CG.str() as GeneratorMap<Val>;
    }

    if (out) {
      out.internal.jsonSchema = this.internal.jsonSchema as any;
      if (this.internal.optional) {
        out.optional(this.internal.default as any);
      }
      return out;
    }

    throw new Error(`Unsupported type: ${this.valueType}`);
  }

  public toTypeScript(): string {
    CodeGeneratorContext.getInstance().addImport('ExprVal', 'src/features/expressions/types');
    return toTsMap[this.valueType];
  }

  toJsonSchema(): JSONSchema7Definition {
    return {
      ...this.getInternalJsonSchema(),
      ...toSchemaMap[this.valueType],
    };
  }
}
