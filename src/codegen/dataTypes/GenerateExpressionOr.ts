import { CodeGenerator } from 'src/codegen/CodeGenerator';
import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { ExprVal } from 'src/features/expressions/types';

const toTsMap: { [key in ExprVal]: string } = {
  [ExprVal.Any]: 'ExprVal.Any',
  [ExprVal.Boolean]: 'ExprVal.Boolean',
  [ExprVal.Number]: 'ExprVal.Number',
  [ExprVal.String]: 'ExprVal.String',
};

export class GenerateExpressionOr extends CodeGenerator {
  constructor(public readonly valueType: ExprVal) {
    super();
  }

  public toTypeScript(): string {
    CodeGeneratorContext.getInstance().addImport('ExprVal', 'src/features/expressions/types');
    return toTsMap[this.valueType];
  }
}
