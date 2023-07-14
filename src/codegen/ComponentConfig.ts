import { CodeGeneratorContext } from 'src/codegen/CodeGeneratorContext';
import { GenerateExpressionOr } from 'src/codegen/dataTypes/GenerateExpressionOr';
import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { CG } from 'src/codegen/index';
import { ExprVal } from 'src/features/expressions/types';
import { ComponentCategory } from 'src/layout/common';
import type { CodeGenerator } from 'src/codegen/CodeGenerator';

export class ComponentConfig {
  public type: string;
  private unresolved = new GenerateObject();
  private resolved = new GenerateObject();

  public addProperty(name: string, value: CodeGenerator): this {
    this.unresolved.addProperty(name, value);

    if (value instanceof GenerateExpressionOr) {
      this.resolved.addProperty(name, value.getTargetType());
    } else {
      this.resolved.addProperty(name, value);
    }

    return this;
  }

  constructor(public readonly category: ComponentCategory) {
    this.addProperty('id', CG.str());
    this.addProperty('hidden', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
    this.addProperty('grid', CG.known('grid').optional());
    this.addProperty('pageBreak', CG.known('pageBreak').optional());

    if (category === ComponentCategory.Form) {
      this.addProperty('readOnly', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
      this.addProperty('required', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
      this.addProperty('triggers', CG.known('triggers').optional()); // TODO: Triggers for Group, navigation buttons
    }
    if (category === ComponentCategory.Form || category === ComponentCategory.Container) {
      this.addProperty('renderAsSummary', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
    }
  }

  public setType(type: string): this {
    this.type = type;
    this.unresolved.addPropertyAfter('type', CG.const(type), 'id');
    this.resolved.addPropertyAfter('type', CG.const(type), 'id');
    this.unresolved.setName(`ILayoutComp${type}`);
    this.resolved.setName(`${type}Item`);

    return this;
  }

  public rendersWithLabel(): this {
    this.addProperty('labelSettings', CG.known('labelSettings').optional());
    return this;
  }

  public addTextResource(name: string, title: string, description: string): this {
    // TODO: Implement
    return this;
  }

  public addDataModelBinding(name: string, value: string): this {
    // TODO: Implement (adding more makes a union)
    return this;
  }

  public toTypeScript(): string {
    CodeGeneratorContext.getInstance().reset();
    const elements = [this.unresolved.toTypeScript(), this.resolved.toTypeScript()];
    const imports = CodeGeneratorContext.getInstance().getImportsAsTypeScript();
    if (imports) {
      return `${imports}\n\n${elements.join('\n\n')}`;
    }

    return elements.join('\n\n');
  }
}
