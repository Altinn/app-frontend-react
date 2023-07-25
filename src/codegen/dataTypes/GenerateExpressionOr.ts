import { CG } from 'src/codegen/CG';
import { CodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { ExprVal } from 'src/features/expressions/types';

const toTsMap: { [key in ExprVal]: string } = {
  [ExprVal.Any]: 'ExprVal.Any',
  [ExprVal.Boolean]: 'ExprVal.Boolean',
  [ExprVal.Number]: 'ExprVal.Number',
  [ExprVal.String]: 'ExprVal.String',
};

type TypeMap = {
  [ExprVal.Boolean]: boolean;
  [ExprVal.Number]: number;
  [ExprVal.String]: string;
  [ExprVal.Any]: boolean | number | string;
};

export class GenerateExpressionOr<Val extends ExprVal> extends CodeGenerator<TypeMap[Val]> {
  constructor(public readonly valueType: Val) {
    super();
  }

  public getTargetType(): CodeGenerator<TypeMap[Val]> {
    if (this.valueType === ExprVal.Boolean) {
      return CG.bool();
    }
    if (this.valueType === ExprVal.Number) {
      return CG.float(); // Represents any number in TypeScript
    }
    if (this.valueType === ExprVal.String) {
      return CG.str();
    }
    throw new Error(`Unsupported type: ${this.valueType}`);
  }

  public toTypeScript(): string {
    CodeGeneratorContext.getInstance().addImport('ExprVal', 'src/features/expressions/types');
    return toTsMap[this.valueType];
  }
}
