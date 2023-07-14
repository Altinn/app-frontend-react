import { GenerateObject } from 'src/codegen/dataTypes/GenerateObject';
import { CG } from 'src/codegen/index';
import { ExprVal } from 'src/features/expressions/types';
import { ComponentType } from 'src/layout/LayoutComponent';

export class ComponentConfig extends GenerateObject {
  public type: string;

  constructor(public readonly category: ComponentType) {
    super();

    this.addProperty('id', CG.str());
    this.addProperty('hidden', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
    this.addProperty('grid', CG.known('grid').optional());
    this.addProperty('pageBreak', CG.known('pageBreak').optional());

    if (category === ComponentType.Form) {
      this.addProperty('readOnly', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
      this.addProperty('required', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
      this.addProperty('triggers', CG.known('triggers').optional()); // TODO: Triggers for Group, navigation buttons
    }
    if (category === ComponentType.Form || category === ComponentType.Container) {
      this.addProperty('renderAsSummary', CG.expr(ExprVal.Boolean).optional(CG.const(false)));
    }
  }

  public setType(type: string): this {
    this.type = type;
    this.addProperty('type', CG.const(type));
    this.setName(`ILayoutComp${type}`);

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
}
