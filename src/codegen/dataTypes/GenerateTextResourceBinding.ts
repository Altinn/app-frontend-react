import { CG } from 'src/codegen/CG';
import { GenerateProperty } from 'src/codegen/dataTypes/GenerateProperty';
import { ExprVal } from 'src/features/expressions/types';
import type { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';

export interface TextResourceConfig {
  name: string;
  title: string;
  description: string;
}

export class GenerateTextResourceBinding extends GenerateProperty<GenerateExpressionOr<ExprVal.String>> {
  constructor(config: TextResourceConfig) {
    super(
      config.name,
      new CG.expr(ExprVal.String).optional().setTitle(config.title).setDescription(config.description),
    );
  }

  transformToResolved(): GenerateProperty<any> {
    return new CG.prop(this.name, new CG.str().optional());
  }
}
